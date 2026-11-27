// turkey.js — the player: a turkey called Tom, escaping Thanksgiving.
// One job: movement, dash, hiding, lives and power-ups. No rendering here.
import { ARENA } from './levels.js';

export class Turkey {
  constructor(spawn) {
    this.reset(spawn);
  }

  reset(spawn) {
    this.x = spawn.x;
    this.y = spawn.y;
    this.r = 22;
    this.vx = 0;
    this.vy = 0;
    this.facing = 1;
    this.lives = 3;
    this.score = 0;
    this.corn = 0;
    this.dashTime = 0;
    this.dashCooldown = 0;
    this.dashTrail = [];
    this.hidden = false;
    this.hideTimer = 0;
    this.shield = false;
    this.wingTimer = 0;
    this.invulnerable = 0;
    this.walkCycle = 0;
    this.moving = false;
    this.nearMissCooldown = 0;
  }

  get speed() { return this.wingTimer > 0 ? 300 : 235; }

  get dashReady() { return this.dashCooldown <= 0; }

  tryDash(dirX, dirY) {
    if (!this.dashReady || this.dashTime > 0) return false;
    let dx = dirX;
    let dy = dirY;
    if (dx === 0 && dy === 0) { dx = this.facing; dy = 0; }
    const len = Math.hypot(dx, dy) || 1;
    this.dashDirX = dx / len;
    this.dashDirY = dy / len;
    this.dashTime = 0.18;
    this.dashCooldown = this.wingTimer > 0 ? 0.55 : 1.25;
    this.hidden = false;
    return true;
  }

  update(dt, input, level) {
    this.dashCooldown = Math.max(0, this.dashCooldown - dt);
    this.invulnerable = Math.max(0, this.invulnerable - dt);
    this.wingTimer = Math.max(0, this.wingTimer - dt);
    this.nearMissCooldown = Math.max(0, this.nearMissCooldown - dt);

    const mv = input.moveVector();
    this.moving = mv.x !== 0 || mv.y !== 0;
    if (this.moving) {
      this.walkCycle += dt * 12;
      if (mv.x !== 0) this.facing = mv.x > 0 ? 1 : -1;
    }

    if (this.dashTime > 0) {
      this.dashTime -= dt;
      this.vx = this.dashDirX * 560;
      this.vy = this.dashDirY * 560;
      this.dashTrail.push({ x: this.x, y: this.y, life: 0.25 });
    } else {
      this.vx = mv.x * this.speed;
      this.vy = mv.y * this.speed;
    }
    this.x += this.vx * dt;
    this.y += this.vy * dt;
    this.dashTrail = this.dashTrail.filter((t) => (t.life -= dt) > 0);

    // Stay inside the arena and slide out of fences.
    this.x = Math.max(ARENA.x + this.r, Math.min(ARENA.x + ARENA.w - this.r, this.x));
    this.y = Math.max(ARENA.y + this.r, Math.min(ARENA.y + ARENA.h - this.r, this.y));
    for (const f of level.fences) this.resolveRect(f);
    for (const o of level.ovens) this.resolveRect(o);

    // Hiding: standing inside a bush or haystack makes the turkey invisible
    // to the farmer — but dashing or sprinting out breaks cover.
    const inCover = level.bushes.some((b) => Math.hypot(this.x - b.x, this.y - b.y) < b.r)
      || level.haystacks.some((h) => Math.hypot(this.x - h.x, this.y - h.y) < h.r - 6);
    if (inCover && this.dashTime <= 0) {
      this.hideTimer += dt;
      if (this.hideTimer > 0.35) this.hidden = true;
    } else {
      this.hideTimer = 0;
      this.hidden = false;
    }
  }

  resolveRect(rect) {
    const nx = Math.max(rect.x, Math.min(this.x, rect.x + rect.w));
    const ny = Math.max(rect.y, Math.min(this.y, rect.y + rect.h));
    const dx = this.x - nx;
    const dy = this.y - ny;
    const d = Math.hypot(dx, dy);
    if (d < this.r && d > 0.001) {
      this.x = nx + (dx / d) * this.r;
      this.y = ny + (dy / d) * this.r;
    } else if (d <= 0.001) {
      this.y = rect.y - this.r;
    }
  }

  // Returns 'blocked' when the shield absorbed the hit, 'hit' otherwise.
  takeHit() {
    if (this.invulnerable > 0) return 'immune';
    if (this.shield) {
      this.shield = false;
      this.invulnerable = 1.2;
      return 'blocked';
    }
    this.lives -= 1;
    this.invulnerable = 1.6;
    return 'hit';
  }

  addScore(points) { this.score += points; }
}
