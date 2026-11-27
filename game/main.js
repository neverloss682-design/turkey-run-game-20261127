// main.js — Turkey Run boot, game loop and state machine.
// One job: wire turkey + farmer + obstacles + levels + audio + render into
// a complete game: title -> playing -> stage clear -> caught / escaped.
import { Input } from './input.js';
import { Turkey } from './turkey.js';
import { Farmer } from './farmer.js';
import { Obstacles } from './obstacles.js';
import { getStage, stageCount } from './levels.js';
import { SoundBank } from './audio.js';
import { drawGame } from './render.js';
import { shotFromUrl, applyShotPreset } from './shots.js';

export class Game {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.input = new Input(canvas);
    this.sounds = new SoundBank();
    this.state = 'title';
    this.stageIndex = 0;
    this.stage = getStage(0);
    this.turkey = new Turkey(this.stage.turkeySpawn);
    this.farmer = new Farmer(this.stage.farmerSpawn, this.stage.patrol, this.stage.farmerSpeed, this.stage.vision);
    this.obstacles = new Obstacles(this.stage);
    this.particles = [];
    this.time = 0;
    this.elapsed = 0;
    this.bannerTimer = 0;
    this.flash = 0;
    this.stagesCleared = 0;
    this.blink = true;
    this.best = 0;
    try { this.best = Number(window.localStorage.getItem('turkeyRunBest') || 0) || 0; } catch (e) { this.best = 0; }
    this.last = performance.now();
    this.spottedWas = false;
    this.raf = null;
  }

  start() {
    const shot = shotFromUrl();
    if (shot) {
      applyShotPreset(this, shot);
    } else {
      this.state = 'title';
    }
    const loop = (now) => {
      const dt = Math.min(0.05, (now - this.last) / 1000);
      this.last = now;
      this.update(dt);
      this.render();
      this.input.endFrame();
      this.raf = requestAnimationFrame(loop);
    };
    this.raf = requestAnimationFrame(loop);
  }

  startRun() {
    this.stageIndex = 0;
    this.stagesCleared = 0;
    this.elapsed = 0;
    this.shotFreeze = false;
    this.loadStage(0, true);
    this.state = 'playing';
    this.sounds.ensure();
    this.sounds.gobble();
  }

  loadStage(index, freshRun) {
    this.stageIndex = index;
    this.stage = getStage(index);
    const keepScore = !freshRun ? this.turkey.score : 0;
    const keepCorn = !freshRun ? this.turkey.corn : 0;
    const keepLives = !freshRun ? this.turkey.lives : 3;
    this.turkey = new Turkey(this.stage.turkeySpawn);
    this.turkey.score = keepScore;
    this.turkey.corn = keepCorn;
    this.turkey.lives = keepLives;
    this.farmer = new Farmer(this.stage.farmerSpawn, this.stage.patrol, this.stage.farmerSpeed, this.stage.vision);
    this.obstacles = new Obstacles(this.stage);
    this.particles = [];
    this.bannerTimer = 2.4;
    this.flash = 0;
  }

  addParticle(text, x, y, color) {
    this.particles.push({ text, x, y, color, life: 1.1, maxLife: 1.1 });
  }

  onEvent(kind, data) {
    if (kind === 'corn') {
      this.sounds.corn();
      this.addParticle('+100', data.x, data.y - 24, '#e8a020');
    } else if (kind === 'powerup') {
      this.sounds.powerup();
      this.addParticle(data.kind === 'wing' ? 'WINGS! +150' : 'SHIELD! +150', data.x, data.y - 28, '#d95d1e');
    } else if (kind === 'knifeWarn') {
      this.sounds.knifeWarn();
    }
  }

  update(dt) {
    this.time += dt;
    this.blink = Math.floor(this.time * 2) % 2 === 0;
    this.flash = Math.max(0, this.flash - dt * 1.5);
    this.bannerTimer = Math.max(0, this.bannerTimer - dt);
    for (const p of this.particles) { p.life -= dt; p.y -= 24 * dt; }
    this.particles = this.particles.filter((p) => p.life > 0);

    if (this.state === 'title') {
      if (this.input.wantsStart()) {
        this.input.consumeClick();
        this.sounds.ensure();
        this.sounds.click();
        this.startRun();
      }
      return;
    }
    if (this.state === 'caught' || this.state === 'escaped') {
      if (this.input.wantsStart()) {
        this.input.consumeClick();
        this.sounds.click();
        this.startRun();
      }
      return;
    }
    if (this.state === 'stageClear') {
      this.stageClearTimer -= dt;
      if (this.stageClearTimer <= 0) {
        if (this.stageIndex + 1 >= stageCount()) {
          this.finishEscape();
        } else {
          this.loadStage(this.stageIndex + 1, false);
          this.state = 'playing';
        }
      }
      return;
    }
    if (this.state !== 'playing') return;

    this.elapsed += dt;

    // Dash: keyboard Space/Shift, or a mouse click dashes toward the click.
    if (this.input.wantsDash()) {
      const mv = this.input.moveVector();
      if (this.turkey.tryDash(mv.x, mv.y)) this.sounds.dash();
    } else if (this.input.mouse.clicked) {
      const dx = this.input.mouse.clickX - this.turkey.x;
      const dy = this.input.mouse.clickY - this.turkey.y;
      if (Math.hypot(dx, dy) > 30 && this.turkey.tryDash(dx, dy)) this.sounds.dash();
    }

    this.turkey.update(dt, this.input, this.stage);
    if (!this.shotFreeze) this.farmer.update(dt, this.turkey, this.stage);
    this.obstacles.update(dt, this.turkey, (k, d) => this.onEvent(k, d));

    // Spotted feedback: sound + flash the moment the farmer locks on.
    if (this.farmer.state === 'chase' && !this.spottedWas) {
      this.sounds.spotted();
      this.flash = 0.25;
    }
    this.spottedWas = this.farmer.state === 'chase';

    // Near-miss bonus: dashing close past the farmer.
    const farmerDist = Math.hypot(this.turkey.x - this.farmer.x, this.turkey.y - this.farmer.y);
    if (this.turkey.dashTime > 0 && farmerDist < 110 && this.turkey.nearMissCooldown <= 0) {
      this.turkey.addScore(50);
      this.turkey.nearMissCooldown = 2;
      this.addParticle('CLOSE! +50', this.turkey.x, this.turkey.y - 34, '#a63a2e');
    }

    // Slow trickle of score for staying alive and moving toward the gate.
    this.scoreTrickle = (this.scoreTrickle || 0) + dt;
    if (this.scoreTrickle > 1) {
      this.scoreTrickle = 0;
      this.turkey.addScore(5);
    }

    // Hazards: oven heat and falling knives.
    const hazard = this.obstacles.hazardTouching(this.turkey);
    if (hazard) this.hurtTurkey(hazard === 'oven' ? 'The oven burned you!' : 'A carving knife got you!');

    // Caught by the farmer.
    if (farmerDist < this.turkey.r + this.farmer.r - 6 && this.turkey.invulnerable <= 0) {
      this.hurtTurkey('Farmer Bram grabbed you!');
    }

    // Reaching the open gate escapes the stage.
    if (this.obstacles.gateOpen() && this.obstacles.atGate(this.turkey)) {
      this.turkey.addScore(500);
      this.stagesCleared += 1;
      this.sounds.stageClear();
      if (this.stageIndex + 1 >= stageCount()) {
        this.finishEscape();
      } else {
        this.state = 'stageClear';
        this.stageClearTimer = 2.2;
      }
    }
  }

  hurtTurkey(message) {
    const result = this.turkey.takeHit();
    if (result === 'immune') return;
    this.flash = 0.4;
    if (result === 'blocked') {
      this.sounds.blocked();
      this.addParticle('SHIELD SAVED YOU!', this.turkey.x, this.turkey.y - 36, '#2e5a8a');
      // Knock the turkey away from the farmer on a blocked hit.
      this.turkey.x = Math.max(60, this.turkey.x - 60);
      return;
    }
    this.sounds.hit();
    this.addParticle(message, this.turkey.x, this.turkey.y - 36, '#a63a2e');
    // Knockback away from the farmer.
    const dx = this.turkey.x - this.farmer.x;
    const dy = this.turkey.y - this.farmer.y;
    const d = Math.hypot(dx, dy) || 1;
    this.turkey.x += (dx / d) * 70;
    this.turkey.y += (dy / d) * 70;
    if (this.turkey.lives <= 0) {
      this.state = 'caught';
      this.sounds.caughtSting();
      this.saveBest();
    }
  }

  finishEscape() {
    this.state = 'escaped';
    const timeBonus = Math.max(0, (this.stage.parSeconds * 3 - Math.floor(this.elapsed)) * 5);
    this.turkey.addScore(timeBonus);
    this.sounds.escapeFanfare();
    this.saveBest();
  }

  saveBest() {
    if (this.turkey.score > this.best) {
      this.best = this.turkey.score;
      try { window.localStorage.setItem('turkeyRunBest', String(this.best)); } catch (e) { /* offline-safe */ }
    }
  }

  render() {
    drawGame(this.ctx, this);
  }
}

const canvas = document.getElementById('game');
const game = new Game(canvas);
window.__turkeyRun = game;
game.start();
