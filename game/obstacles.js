// obstacles.js — corn, power-ups, the oven and the falling carving knives.
// One job: own the hazards and pickups of a stage, update them, and report
// what the turkey touched. Drawing lives in render.js.
import { ARENA } from './levels.js';

export class Obstacles {
  constructor(stage) {
    this.stage = stage;
    this.corn = stage.cornSpots.map(([x, y]) => ({ x, y, taken: false, bob: Math.random() * 6 }));
    this.powerups = stage.powerups.map((p) => ({ ...p, taken: false, bob: 0 }));
    this.knives = [];
    this.knifeTimer = 2.2;
    this.ovenHeat = 0;
  }

  update(dt, turkey, onEvent) {
    this.ovenHeat += dt;
    // Falling carving knives (stages 2 and 3): a shadow warns, then a knife
    // drops from the top of the arena and sticks in the ground briefly.
    if (this.stage.knifeRate > 0) {
      this.knifeTimer -= dt;
      if (this.knifeTimer <= 0 && this.knives.length < this.stage.knivesMax) {
        const x = ARENA.x + 60 + Math.random() * (ARENA.w - 120);
        this.knives.push({ x, y: ARENA.y - 30, vy: 0, state: 'warn', t: 0.7, stuck: 0 });
        this.knifeTimer = 1 / this.stage.knifeRate + Math.random() * 0.8;
        onEvent('knifeWarn', { x });
      }
    }
    for (const k of this.knives) {
      if (k.state === 'warn') {
        k.t -= dt;
        if (k.t <= 0) { k.state = 'falling'; k.vy = 60; }
      } else if (k.state === 'falling') {
        k.vy += 2600 * dt;
        k.y += k.vy * dt;
        if (k.y > ARENA.y + ARENA.h - 46) { k.y = ARENA.y + ARENA.h - 46; k.state = 'stuck'; k.stuck = 1.4; }
      } else if (k.state === 'stuck') {
        k.stuck -= dt;
      }
    }
    this.knives = this.knives.filter((k) => k.state !== 'stuck' || k.stuck > 0);

    // Corn pickups.
    for (const c of this.corn) {
      if (c.taken) continue;
      c.bob += dt;
      if (Math.hypot(turkey.x - c.x, turkey.y - c.y) < turkey.r + 20) {
        c.taken = true;
        turkey.corn += 1;
        turkey.addScore(100);
        onEvent('corn', { x: c.x, y: c.y });
      }
    }
    // Power-ups: golden wing (fast + dash refresh) and pie-shield (one free hit).
    for (const p of this.powerups) {
      if (p.taken) continue;
      p.bob += dt;
      if (Math.hypot(turkey.x - p.x, turkey.y - p.y) < turkey.r + 22) {
        p.taken = true;
        if (p.kind === 'wing') { turkey.wingTimer = 8; turkey.dashCooldown = 0; turkey.addScore(150); }
        if (p.kind === 'shield') { turkey.shield = true; turkey.addScore(150); }
        onEvent('powerup', { kind: p.kind, x: p.x, y: p.y });
      }
    }
  }

  // Hazards that hurt on contact. Returns 'oven' | 'knife' | null.
  hazardTouching(turkey) {
    if (turkey.invulnerable > 0) return null;
    for (const o of this.stage.ovens) {
      if (turkey.x > o.x - turkey.r * 0.5 && turkey.x < o.x + o.w + turkey.r * 0.5
        && turkey.y > o.y - turkey.r * 0.5 && turkey.y < o.y + o.h + turkey.r * 0.5) return 'oven';
    }
    for (const k of this.knives) {
      if (k.state === 'falling' || k.state === 'stuck') {
        if (Math.hypot(turkey.x - k.x, turkey.y - (k.y + 18)) < turkey.r + 14) return 'knife';
      }
    }
    return null;
  }

  cornTaken() { return this.corn.filter((c) => c.taken).length; }

  gateOpen() { return this.cornTaken() >= this.stage.cornNeeded; }

  atGate(turkey) {
    const g = this.stage.gate;
    return turkey.x + turkey.r > g.x && turkey.y > g.y && turkey.y < g.y + g.h;
  }
}
