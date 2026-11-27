// farmer.js — Farmer Bram and his chase / search / corner AI.
// One job: decide where the farmer goes and how urgently, given the turkey.
// States: patrol (waypoints) -> chase (sees the turkey) -> search (lost it)
// -> corner (turkey pinned near a wall or the gate: farmer sprints).
import { ARENA } from './levels.js';

export class Farmer {
  constructor(spawn, patrol, speed, vision) {
    this.x = spawn.x;
    this.y = spawn.y;
    this.r = 26;
    this.speed = speed;
    this.vision = vision;
    this.patrol = patrol;
    this.patrolIndex = 0;
    this.state = 'patrol';
    this.stateTime = 0;
    this.lastSeen = { x: spawn.x, y: spawn.y };
    this.searchTimer = 0;
    this.spotted = 0;
    this.facing = -1;
    this.walkCycle = 0;
    this.cornerBoost = false;
  }

  reset(spawn, patrol, speed, vision) {
    this.x = spawn.x;
    this.y = spawn.y;
    this.speed = speed;
    this.vision = vision;
    this.patrol = patrol;
    this.patrolIndex = 0;
    this.state = 'patrol';
    this.stateTime = 0;
    this.spotted = 0;
    this.searchTimer = 0;
  }

  canSee(turkey, level) {
    if (turkey.hidden) return false;
    if (turkey.dashTime > 0 && turkey.invulnerable <= 0) {
      // A dashing turkey is a blur: harder to track at long range.
      if (Math.hypot(turkey.x - this.x, turkey.y - this.y) > this.vision * 0.6) return false;
    }
    const d = Math.hypot(turkey.x - this.x, turkey.y - this.y);
    if (d > this.vision) return false;
    // Haystacks and fences block the farmer's line of sight.
    for (const h of level.haystacks) {
      if (this.segmentHitsCircle(this.x, this.y, turkey.x, turkey.y, h.x, h.y, h.r - 8)) return false;
    }
    for (const f of level.fences) {
      if (this.segmentHitsRect(this.x, this.y, turkey.x, turkey.y, f)) return false;
    }
    return true;
  }

  segmentHitsCircle(x1, y1, x2, y2, cx, cy, r) {
    const dx = x2 - x1;
    const dy = y2 - y1;
    const len2 = dx * dx + dy * dy || 1;
    let t = ((cx - x1) * dx + (cy - y1) * dy) / len2;
    t = Math.max(0, Math.min(1, t));
    const px = x1 + t * dx;
    const py = y1 + t * dy;
    return Math.hypot(px - cx, py - cy) < r;
  }

  segmentHitsRect(x1, y1, x2, y2, rect) {
    // Sample the segment; cheap and good enough for a sight-line test.
    for (let i = 0; i <= 10; i++) {
      const t = i / 10;
      const px = x1 + (x2 - x1) * t;
      const py = y1 + (y2 - y1) * t;
      if (px > rect.x && px < rect.x + rect.w && py > rect.y && py < rect.y + rect.h) return true;
    }
    return false;
  }

  update(dt, turkey, level) {
    this.stateTime += dt;
    const sees = this.canSee(turkey, level);
    if (sees) {
      this.lastSeen = { x: turkey.x, y: turkey.y };
      this.spotted = Math.min(1, this.spotted + dt * 3);
      if (this.state !== 'chase') { this.state = 'chase'; this.stateTime = 0; }
    } else {
      this.spotted = Math.max(0, this.spotted - dt * 1.2);
      if (this.state === 'chase') { this.state = 'search'; this.stateTime = 0; this.searchTimer = 3.2; }
    }

    if (this.state === 'search') {
      this.searchTimer -= dt;
      if (this.searchTimer <= 0) { this.state = 'patrol'; this.stateTime = 0; }
    }

    // Cornering: the turkey is pinned against the arena edge or the gate
    // wall while the farmer is close — the farmer smells dinner and sprints.
    const pinned = turkey.x > ARENA.x + ARENA.w - 140 || turkey.x < ARENA.x + 90
      || turkey.y > ARENA.y + ARENA.h - 90 || turkey.y < ARENA.y + 90;
    const dist = Math.hypot(turkey.x - this.x, turkey.y - this.y);
    this.cornerBoost = this.state === 'chase' && pinned && dist < 260;

    let tx;
    let ty;
    let speed = this.speed;
    if (this.state === 'patrol') {
      const wp = this.patrol[this.patrolIndex];
      tx = wp[0]; ty = wp[1];
      if (Math.hypot(tx - this.x, ty - this.y) < 24) {
        this.patrolIndex = (this.patrolIndex + 1) % this.patrol.length;
      }
      speed *= 0.55;
    } else if (this.state === 'chase') {
      tx = turkey.x; ty = turkey.y;
      speed *= this.cornerBoost ? 1.28 : 1.0;
    } else {
      // Search: sweep around the last seen spot, then widen the circle.
      const a = this.stateTime * 1.6;
      const radius = 40 + this.stateTime * 14;
      tx = this.lastSeen.x + Math.cos(a) * radius;
      ty = this.lastSeen.y + Math.sin(a) * radius;
      speed *= 0.8;
    }

    const dx = tx - this.x;
    const dy = ty - this.y;
    const d = Math.hypot(dx, dy);
    if (d > 2) {
      this.x += (dx / d) * speed * dt;
      this.y += (dy / d) * speed * dt;
      this.facing = dx >= 0 ? 1 : -1;
      this.walkCycle += dt * 9;
    }
    this.x = Math.max(ARENA.x + this.r, Math.min(ARENA.x + ARENA.w - this.r, this.x));
    this.y = Math.max(ARENA.y + this.r, Math.min(ARENA.y + ARENA.h - this.r, this.y));
    for (const f of level.fences) this.resolveRect(f);
    for (const o of level.ovens) this.resolveRect(o);
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
}
