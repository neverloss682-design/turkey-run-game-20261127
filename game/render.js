// render.js — every pixel of Turkey Run is drawn here on canvas.
// One job: turn game state into a readable autumn scene (turkey, farmer,
// oven, knives, farm/kitchen, HUD, title and end screens).
const AUTUMN = ['#d95d1e', '#e8a020', '#a63a2e', '#7a8c2f', '#c97b2d'];

export function drawGame(ctx, g) {
  drawBackground(ctx, g);
  drawGate(ctx, g);
  drawCover(ctx, g);
  drawFences(ctx, g);
  drawOvens(ctx, g);
  drawCornAndPowerups(ctx, g);
  drawKnives(ctx, g);
  drawTurkey(ctx, g.turkey, g.time);
  drawFarmer(ctx, g.farmer, g.time);
  drawParticles(ctx, g);
  drawHud(ctx, g);
  if (g.state === 'title') drawTitle(ctx, g);
  if (g.state === 'stageClear') drawStageClear(ctx, g);
  if (g.state === 'caught' || g.state === 'escaped') drawEnd(ctx, g);
  if (g.flash > 0) {
    ctx.fillStyle = `rgba(166, 58, 46, ${Math.min(0.35, g.flash)})`;
    ctx.fillRect(0, 0, 1280, 720);
  }
}

function drawBackground(ctx, g) {
  const stage = g.stage;
  if (stage.ground === 'kitchen') {
    ctx.fillStyle = '#e8d9b8';
    ctx.fillRect(0, 0, 1280, 720);
    ctx.fillStyle = '#d9c49a';
    for (let y = 76; y < 720; y += 64) ctx.fillRect(0, y, 1280, 4);
    for (let x = 0; x < 1280; x += 64) ctx.fillRect(x, 76, 4, 644);
    ctx.fillStyle = '#8a6d4b';
    ctx.fillRect(0, 76, 1280, 10);
  } else if (stage.ground === 'barn') {
    ctx.fillStyle = '#c9a35f';
    ctx.fillRect(0, 0, 1280, 720);
    ctx.fillStyle = '#b08d4e';
    for (let y = 90; y < 720; y += 46) ctx.fillRect(0, y, 1280, 5);
    ctx.fillStyle = '#7a5a30';
    for (let x = 120; x < 1280; x += 240) ctx.fillRect(x, 76, 10, 644);
  } else {
    ctx.fillStyle = '#e9c979';
    ctx.fillRect(0, 0, 1280, 720);
    // Grass tufts and fallen leaves for a farmyard read.
    ctx.fillStyle = '#cfa14f';
    for (let i = 0; i < 90; i++) {
      const x = (i * 137) % 1280;
      const y = 90 + ((i * 89) % 610);
      ctx.fillRect(x, y, 14, 3);
    }
    ctx.fillStyle = '#d95d1e';
    for (let i = 0; i < 40; i++) {
      const x = (i * 211 + 40) % 1280;
      const y = 100 + ((i * 67) % 600);
      ctx.beginPath();
      ctx.ellipse(x, y, 7, 4, (i % 5) * 0.5, 0, Math.PI * 2);
      ctx.fill();
    }
    // Dirt path from the turkey spawn to the gate.
    ctx.fillStyle = '#d9b06a';
    ctx.beginPath();
    ctx.ellipse(640, 560, 560, 90, 0, 0, Math.PI * 2);
    ctx.fill();
  }
  // Arena border: wooden fence line.
  ctx.strokeStyle = '#7a4a21';
  ctx.lineWidth = 8;
  ctx.strokeRect(16, 76, 1248, 628);
}

function drawGate(ctx, g) {
  const gt = g.stage.gate;
  const open = g.obstacles.gateOpen();
  ctx.save();
  ctx.fillStyle = open ? '#7a8c2f' : '#8a6d4b';
  ctx.fillRect(gt.x - 6, gt.y - 14, gt.w + 6, gt.h + 28);
  ctx.fillStyle = open ? '#a8c256' : '#a9805a';
  for (let i = 0; i < 4; i++) ctx.fillRect(gt.x + 2, gt.y + 8 + i * 26, gt.w - 6, 12);
  ctx.fillStyle = '#fff8e6';
  ctx.font = 'bold 15px Georgia, serif';
  ctx.textAlign = 'center';
  ctx.save();
  ctx.translate(gt.x + 22, gt.y + gt.h / 2);
  ctx.rotate(-Math.PI / 2);
  ctx.fillText(open ? 'ESCAPE!' : 'LOCKED', 0, 5);
  ctx.restore();
  if (!open) {
    ctx.fillStyle = '#3a2a18';
    ctx.font = 'bold 13px Georgia, serif';
    ctx.fillText(`CORN ${g.obstacles.cornTaken()}/${g.stage.cornNeeded}`, gt.x - 30, gt.y - 20);
  }
  ctx.restore();
}

function drawCover(ctx, g) {
  for (const b of g.stage.bushes) drawBush(ctx, b);
  for (const h of g.stage.haystacks) drawHaystack(ctx, h);
}

function drawBush(ctx, b) {
  ctx.save();
  ctx.fillStyle = '#4e7a2e';
  ctx.beginPath(); ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#6a9a3e';
  ctx.beginPath(); ctx.arc(b.x - b.r * 0.4, b.y - b.r * 0.3, b.r * 0.55, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(b.x + b.r * 0.35, b.y - b.r * 0.25, b.r * 0.5, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#d95d1e';
  for (let i = 0; i < 5; i++) {
    ctx.beginPath();
    ctx.arc(b.x + Math.cos(i * 1.7) * b.r * 0.5, b.y + Math.sin(i * 1.7) * b.r * 0.4, 4, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

function drawHaystack(ctx, h) {
  ctx.save();
  ctx.fillStyle = '#d9a83c';
  ctx.beginPath(); ctx.arc(h.x, h.y, h.r, Math.PI, 0); ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#b98a2e';
  ctx.beginPath(); ctx.ellipse(h.x, h.y + h.r * 0.55, h.r, h.r * 0.32, 0, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = '#8a6d1f';
  ctx.lineWidth = 2;
  for (let i = -2; i <= 2; i++) {
    ctx.beginPath();
    ctx.moveTo(h.x + i * h.r * 0.3, h.y - h.r * 0.85);
    ctx.lineTo(h.x + i * h.r * 0.45, h.y + h.r * 0.3);
    ctx.stroke();
  }
  ctx.restore();
}

function drawFences(ctx, g) {
  ctx.fillStyle = '#8a5a2b';
  for (const f of g.stage.fences) {
    ctx.fillRect(f.x, f.y, f.w, f.h);
    ctx.fillStyle = '#a9743a';
    ctx.fillRect(f.x, f.y, f.w, 6);
    ctx.fillStyle = '#8a5a2b';
  }
}

function drawOvens(ctx, g) {
  for (const o of g.stage.ovens) {
    const flick = 0.6 + 0.4 * Math.sin(g.time * 9 + o.x);
    ctx.save();
    ctx.fillStyle = '#5a5a60';
    ctx.fillRect(o.x, o.y, o.w, o.h);
    ctx.fillStyle = '#33333a';
    ctx.fillRect(o.x + 12, o.y + 14, o.w - 24, o.h - 28);
    ctx.fillStyle = `rgba(255, ${Math.floor(120 + 80 * flick)}, 20, ${0.55 + 0.35 * flick})`;
    ctx.beginPath();
    ctx.ellipse(o.x + o.w / 2, o.y + o.h - 16, 34, 12 + 6 * flick, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#ff5a1e';
    ctx.font = 'bold 13px Georgia, serif';
    ctx.textAlign = 'center';
    ctx.fillText('HOT OVEN!', o.x + o.w / 2, o.y - 8);
    ctx.fillStyle = '#c0c0c8';
    ctx.fillRect(o.x + o.w - 16, o.y + 6, 8, 10);
    ctx.restore();
  }
}

function drawCornAndPowerups(ctx, g) {
  for (const c of g.obstacles.corn) {
    if (c.taken) continue;
    const bob = Math.sin(c.bob * 3) * 3;
    ctx.save();
    ctx.translate(c.x, c.y + bob);
    ctx.fillStyle = '#e8a020';
    ctx.beginPath(); ctx.ellipse(0, 0, 13, 18, 0.4, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#f7d774';
    ctx.beginPath(); ctx.ellipse(-3, -2, 7, 12, 0.4, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#4e7a2e';
    ctx.beginPath(); ctx.ellipse(6, -14, 10, 5, -0.6, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
  }
  for (const p of g.obstacles.powerups) {
    if (p.taken) continue;
    const bob = Math.sin(p.bob * 3) * 4;
    ctx.save();
    ctx.translate(p.x, p.y + bob);
    ctx.fillStyle = 'rgba(255, 248, 230, 0.9)';
    ctx.beginPath(); ctx.arc(0, 0, 22, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = '#d95d1e'; ctx.lineWidth = 3; ctx.stroke();
    if (p.kind === 'wing') {
      // A golden feather.
      ctx.fillStyle = '#e8a020';
      ctx.beginPath(); ctx.ellipse(0, 0, 6, 13, 0.5, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = '#7a4a21'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(-4, 10); ctx.lineTo(5, -11); ctx.stroke();
    } else {
      // A blue pie-shield.
      ctx.fillStyle = '#2e5a8a';
      ctx.beginPath(); ctx.moveTo(0, 12); ctx.lineTo(-11, -4); ctx.lineTo(-11, -10); ctx.lineTo(11, -10); ctx.lineTo(11, -4); ctx.closePath(); ctx.fill();
      ctx.fillStyle = '#f7ead0';
      ctx.beginPath(); ctx.arc(0, -2, 4, 0, Math.PI * 2); ctx.fill();
    }
    ctx.font = 'bold 11px Georgia, serif';
    ctx.fillStyle = '#7a4a21';
    ctx.fillText(p.kind === 'wing' ? 'WING' : 'SHIELD', 0, 32);
    ctx.restore();
  }
}

function drawKnives(ctx, g) {
  for (const k of g.obstacles.knives) {
    if (k.state === 'warn') {
      ctx.save();
      ctx.fillStyle = 'rgba(166, 58, 46, 0.35)';
      ctx.beginPath(); ctx.ellipse(k.x, 690, 26, 8, 0, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#a63a2e';
      ctx.font = 'bold 20px Georgia, serif';
      ctx.textAlign = 'center';
      ctx.fillText('!', k.x, 690);
      ctx.restore();
    } else {
      drawKnife(ctx, k.x, k.y);
    }
  }
}

export function drawKnife(ctx, x, y) {
  ctx.save();
  ctx.translate(x, y);
  ctx.fillStyle = '#c8ccd4';
  ctx.beginPath();
  ctx.moveTo(0, -26); ctx.lineTo(10, 6); ctx.lineTo(-10, 6); ctx.closePath(); ctx.fill();
  ctx.strokeStyle = '#8a8f98'; ctx.lineWidth = 2; ctx.stroke();
  ctx.fillStyle = '#5a2e18';
  ctx.fillRect(-7, 6, 14, 16);
  ctx.restore();
}

export function drawTurkey(ctx, t, time) {
  ctx.save();
  // Dash trail.
  for (const tr of t.dashTrail) {
    ctx.globalAlpha = tr.life * 2;
    ctx.fillStyle = '#8a5a2b';
    ctx.beginPath(); ctx.arc(tr.x, tr.y, 18, 0, Math.PI * 2); ctx.fill();
  }
  ctx.globalAlpha = 1;
  ctx.translate(t.x, t.y);
  if (t.invulnerable > 0 && Math.floor(time * 12) % 2 === 0) ctx.globalAlpha = 0.45;
  const bob = t.moving ? Math.sin(t.walkCycle) * 2 : Math.sin(time * 2) * 1;
  ctx.translate(0, bob);
  // Tail feathers — an autumn fan spread behind the turkey.
  for (let i = -2; i <= 2; i++) {
    ctx.fillStyle = AUTUMN[i + 2];
    ctx.save();
    ctx.translate(-t.facing * 20, i * 9 - 4);
    ctx.rotate(i * 0.32);
    ctx.beginPath();
    ctx.ellipse(-t.facing * 12, 0, 18, 7, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#f7ead0';
    ctx.beginPath();
    ctx.arc(-t.facing * 24, 0, 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
  // Body.
  ctx.fillStyle = '#7a4a21';
  ctx.beginPath(); ctx.ellipse(0, 0, 24, 19, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#a9743a';
  ctx.beginPath(); ctx.ellipse(2, -3, 18, 13, 0, 0, Math.PI * 2); ctx.fill();
  // Head + beak + wattle.
  const hx = t.facing * 22;
  ctx.fillStyle = '#5a7a9e';
  ctx.beginPath(); ctx.arc(hx, -16, 10, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#e8a020';
  ctx.beginPath(); ctx.moveTo(hx + t.facing * 8, -18); ctx.lineTo(hx + t.facing * 20, -14); ctx.lineTo(hx + t.facing * 8, -11); ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#c0392b';
  ctx.beginPath(); ctx.ellipse(hx + t.facing * 4, -6, 4, 7, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#fff';
  ctx.beginPath(); ctx.arc(hx + t.facing * 3, -19, 3, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#1a1a1a';
  ctx.beginPath(); ctx.arc(hx + t.facing * 4, -19, 1.6, 0, Math.PI * 2); ctx.fill();
  // Legs.
  ctx.strokeStyle = '#e8a020';
  ctx.lineWidth = 3;
  const step = t.moving ? Math.sin(t.walkCycle) * 5 : 0;
  ctx.beginPath(); ctx.moveTo(-6, 16); ctx.lineTo(-6 + step, 26); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(6, 16); ctx.lineTo(6 - step, 26); ctx.stroke();
  ctx.restore();
  // Shield ring / wing glow.
  ctx.save();
  if (t.shield) {
    ctx.strokeStyle = 'rgba(90, 140, 255, 0.9)';
    ctx.lineWidth = 3;
    ctx.beginPath(); ctx.arc(t.x, t.y, 32 + Math.sin(time * 5) * 2, 0, Math.PI * 2); ctx.stroke();
  }
  if (t.wingTimer > 0) {
    ctx.strokeStyle = 'rgba(232, 160, 32, 0.9)';
    ctx.lineWidth = 3;
    ctx.beginPath(); ctx.arc(t.x, t.y, 36, 0, Math.PI * 2); ctx.stroke();
  }
  if (t.hidden) {
    ctx.fillStyle = 'rgba(78, 122, 46, 0.9)';
    ctx.font = 'bold 13px Georgia, serif';
    ctx.textAlign = 'center';
    ctx.fillText('HIDDEN', t.x, t.y - 36);
  }
  ctx.restore();
}

export function drawFarmer(ctx, f, time) {
  ctx.save();
  ctx.translate(f.x, f.y);
  const bob = Math.sin(f.walkCycle) * 2;
  ctx.translate(0, bob);
  // Pitchfork held high.
  ctx.strokeStyle = '#7a4a21';
  ctx.lineWidth = 4;
  ctx.beginPath(); ctx.moveTo(f.facing * 18, 10); ctx.lineTo(f.facing * 30, -42); ctx.stroke();
  ctx.strokeStyle = '#c8ccd4';
  ctx.lineWidth = 3;
  for (let i = -1; i <= 1; i++) {
    ctx.beginPath();
    ctx.moveTo(f.facing * 30 + i * 6, -42);
    ctx.lineTo(f.facing * 30 + i * 6, -56);
    ctx.stroke();
  }
  // Body: blue overalls, red shirt.
  ctx.fillStyle = '#c0392b';
  ctx.beginPath(); ctx.ellipse(0, 2, 24, 20, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#2e5a8a';
  ctx.fillRect(-18, 0, 36, 22);
  ctx.fillStyle = '#2e5a8a';
  ctx.fillRect(-18, 18, 9, 12);
  ctx.fillRect(9, 18, 9, 12);
  // Head + straw hat + moustache.
  ctx.fillStyle = '#e8b98a';
  ctx.beginPath(); ctx.arc(0, -24, 13, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#e8c94a';
  ctx.beginPath(); ctx.ellipse(0, -32, 24, 6, 0, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.ellipse(0, -34, 13, 7, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#5a3a1a';
  ctx.fillRect(-8, -20, 16, 4);
  ctx.fillStyle = '#1a1a1a';
  ctx.beginPath(); ctx.arc(f.facing * 5, -26, 1.8, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(f.facing * -5, -26, 1.8, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
  // Spotted / state callout.
  ctx.save();
  ctx.textAlign = 'center';
  if (f.state === 'chase') {
    ctx.fillStyle = '#a63a2e';
    ctx.font = 'bold 26px Georgia, serif';
    ctx.fillText('!', f.x, f.y - 58);
    ctx.font = 'bold 13px Georgia, serif';
    ctx.fillText(f.cornerBoost ? 'CORNERED!' : 'SPOTTED!', f.x, f.y - 92);
  } else if (f.state === 'search') {
    ctx.fillStyle = '#7a4a21';
    ctx.font = 'bold 20px Georgia, serif';
    ctx.fillText('?', f.x, f.y - 58);
    ctx.font = 'bold 12px Georgia, serif';
    ctx.fillText('SEARCHING…', f.x, f.y - 92);
  }
  ctx.restore();
}

function drawParticles(ctx, g) {
  for (const p of g.particles) {
    ctx.save();
    ctx.globalAlpha = Math.max(0, p.life / p.maxLife);
    ctx.fillStyle = p.color;
    ctx.font = 'bold 16px Georgia, serif';
    ctx.textAlign = 'center';
    ctx.fillText(p.text, p.x, p.y);
    ctx.restore();
  }
}

function drawHud(ctx, g) {
  ctx.save();
  ctx.fillStyle = '#2b1a0e';
  ctx.fillRect(0, 0, 1280, 64);
  ctx.fillStyle = '#f7ead0';
  ctx.textBaseline = 'middle';
  ctx.textAlign = 'left';
  ctx.font = 'bold 22px Georgia, serif';
  ctx.fillText('🦃 TURKEY RUN', 18, 32);
  ctx.font = 'bold 18px Georgia, serif';
  ctx.fillText(`SCORE ${g.turkey.score}`, 250, 32);
  ctx.fillText(`CORN ${g.obstacles.cornTaken()}/${g.stage.cornNeeded}`, 430, 32);
  // Lives as hearts.
  ctx.fillStyle = '#e84a5f';
  ctx.font = '20px Georgia, serif';
  ctx.fillText('♥'.repeat(Math.max(0, g.turkey.lives)) + '♡'.repeat(Math.max(0, 3 - g.turkey.lives)), 590, 32);
  ctx.fillStyle = '#f7ead0';
  ctx.font = 'bold 16px Georgia, serif';
  ctx.fillText(g.stage.name, 760, 24);
  ctx.fillStyle = '#e8cfa5';
  ctx.font = '14px Georgia, serif';
  ctx.fillText(`TIME ${Math.floor(g.elapsed)}s · BEST ${g.best}`, 760, 46);
  // Dash cooldown bar.
  ctx.fillStyle = '#5a3a1a';
  ctx.fillRect(1060, 22, 120, 12);
  ctx.fillStyle = g.turkey.dashReady ? '#7a8c2f' : '#e8a020';
  const frac = g.turkey.dashReady ? 1 : 1 - g.turkey.dashCooldown / 1.25;
  ctx.fillRect(1060, 22, 120 * Math.max(0, frac), 12);
  ctx.fillStyle = '#f7ead0';
  ctx.font = 'bold 13px Georgia, serif';
  ctx.fillText(g.turkey.dashReady ? 'DASH READY [SPACE]' : 'DASH…', 1060, 48);
  // Spotted meter.
  ctx.fillStyle = '#5a3a1a';
  ctx.fillRect(1060, 8, 120, 6);
  ctx.fillStyle = '#a63a2e';
  ctx.fillRect(1060, 8, 120 * g.farmer.spotted, 6);
  ctx.restore();
  // Gate hint banner while locked.
  if (g.state === 'playing' && !g.obstacles.gateOpen()) {
    ctx.save();
    ctx.fillStyle = 'rgba(43, 26, 14, 0.85)';
    ctx.fillRect(430, 76, 420, 30);
    ctx.fillStyle = '#f7d774';
    ctx.font = 'bold 15px Georgia, serif';
    ctx.textAlign = 'center';
    ctx.fillText(`Collect ${g.stage.cornNeeded - g.obstacles.cornTaken()} more corn to unlock the gate!`, 640, 96);
    ctx.restore();
  }
  // Stage banner (only during play, never over title/end screens).
  if (g.bannerTimer > 0 && (g.state === 'playing' || g.state === 'stageClear')) {
    ctx.save();
    ctx.globalAlpha = Math.min(1, g.bannerTimer);
    ctx.fillStyle = 'rgba(43, 26, 14, 0.88)';
    ctx.fillRect(340, 300, 600, 110);
    ctx.strokeStyle = '#d95d1e';
    ctx.lineWidth = 4;
    ctx.strokeRect(340, 300, 600, 110);
    ctx.fillStyle = '#f7ead0';
    ctx.font = 'bold 30px Georgia, serif';
    ctx.textAlign = 'center';
    ctx.fillText(g.stage.name, 640, 340);
    ctx.fillStyle = '#e8cfa5';
    ctx.font = '16px Georgia, serif';
    ctx.fillText(g.stage.subtitle, 640, 375);
    ctx.restore();
  }
}

function drawTitle(ctx, g) {
  ctx.save();
  ctx.fillStyle = 'rgba(43, 26, 14, 0.72)';
  ctx.fillRect(0, 64, 1280, 656);
  ctx.textAlign = 'center';
  ctx.fillStyle = '#f7d774';
  ctx.font = 'bold 84px Georgia, serif';
  ctx.fillText('TURKEY RUN', 640, 210);
  ctx.fillStyle = '#f7ead0';
  ctx.font = 'bold 30px Georgia, serif';
  ctx.fillText('The Great Thanksgiving Escape', 640, 260);
  ctx.font = '18px Georgia, serif';
  ctx.fillStyle = '#e8cfa5';
  ctx.fillText('Thanksgiving is coming. Farmer Bram wants you for dinner.', 640, 300);
  ctx.fillText('Grab corn, dash past the farmer, hide in the bushes —', 640, 330);
  ctx.fillText('and slip through the gate before the oven gets you.', 640, 358);
  // Controls card.
  ctx.fillStyle = 'rgba(247, 234, 208, 0.95)';
  ctx.fillRect(390, 390, 500, 130);
  ctx.fillStyle = '#2b1a0e';
  ctx.font = 'bold 17px Georgia, serif';
  ctx.fillText('WASD / ARROWS — waddle around', 640, 420);
  ctx.fillText('SPACE — dash (also click to dash that way)', 640, 448);
  ctx.fillText('BUSHES & HAY — stand still to hide', 640, 476);
  ctx.fillText('3 LIVES · 3 STAGES: farmyard → barn → kitchen', 640, 504);
  ctx.fillStyle = '#d95d1e';
  ctx.font = 'bold 26px Georgia, serif';
  ctx.fillText(g.blink ? '▶  CLICK or press ENTER to run!' : '▶  CLICK or press ENTER to run!', 640, 570);
  ctx.fillStyle = '#e8cfa5';
  ctx.font = '15px Georgia, serif';
  ctx.fillText('Best escape score: ' + g.best + '  ·  Sound on for gobbles', 640, 610);
  ctx.restore();
}

function drawStageClear(ctx, g) {
  ctx.save();
  ctx.fillStyle = 'rgba(43, 26, 14, 0.7)';
  ctx.fillRect(0, 64, 1280, 656);
  ctx.textAlign = 'center';
  ctx.fillStyle = '#7a8c2f';
  ctx.font = 'bold 56px Georgia, serif';
  ctx.fillText('STAGE ESCAPED!', 640, 330);
  ctx.fillStyle = '#f7ead0';
  ctx.font = '22px Georgia, serif';
  ctx.fillText(`+500 stage bonus · Score ${g.turkey.score}`, 640, 380);
  ctx.fillText('The farmer is right behind you — keep running!', 640, 415);
  ctx.restore();
}

function drawEnd(ctx, g) {
  const escaped = g.state === 'escaped';
  ctx.save();
  ctx.fillStyle = escaped ? 'rgba(43, 90, 30, 0.78)' : 'rgba(80, 20, 10, 0.78)';
  ctx.fillRect(0, 64, 1280, 656);
  ctx.textAlign = 'center';
  ctx.fillStyle = '#f7d774';
  ctx.font = 'bold 72px Georgia, serif';
  ctx.fillText(escaped ? 'YOU ESCAPED!' : 'CAUGHT!', 640, 260);
  ctx.fillStyle = '#f7ead0';
  ctx.font = '24px Georgia, serif';
  ctx.fillText(
    escaped
      ? 'Tom the turkey is free — Thanksgiving dinner is cancelled!'
      : 'Farmer Bram got his Thanksgiving dinner after all…',
    640, 315,
  );
  ctx.font = 'bold 28px Georgia, serif';
  ctx.fillText(`FINAL SCORE  ${g.turkey.score}`, 640, 380);
  ctx.font = '19px Georgia, serif';
  ctx.fillStyle = '#e8cfa5';
  ctx.fillText(`Corn eaten: ${g.turkey.corn}  ·  Stages escaped: ${g.stagesCleared} / 3  ·  Time: ${Math.floor(g.elapsed)}s`, 640, 420);
  ctx.fillText(`Best score: ${Math.max(g.best, g.turkey.score)}`, 640, 450);
  ctx.fillStyle = '#d95d1e';
  ctx.font = 'bold 26px Georgia, serif';
  ctx.fillText('CLICK or press ENTER to run again', 640, 520);
  ctx.fillStyle = '#e8cfa5';
  ctx.font = '15px Georgia, serif';
  ctx.fillText('Tip: hide in bushes to break the chase, dash through the gap, mind the oven.', 640, 560);
  ctx.restore();
}
