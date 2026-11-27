// shots.js — deterministic screenshot presets for the maker.
// One job: read ?shot=... from the URL and pose the game for a screenshot.
// Real play never needs this; it only stages a frame for the camera.
export function shotFromUrl() {
  const params = new URLSearchParams(window.location.search);
  return params.get('shot') || null;
}

export function applyShotPreset(game, shot) {
  if (!shot) return;
  if (shot === 'title') {
    game.state = 'title';
    return;
  }
  if (shot === 'play') {
    game.startRun();
    game.turkey.x = 560;
    game.turkey.y = 380;
    game.turkey.score = 1250;
    game.turkey.corn = 4;
    game.obstacles.corn.slice(0, 4).forEach((c) => { c.taken = true; });
    game.farmer.x = 700;
    game.farmer.y = 320;
    game.farmer.state = 'chase';
    game.farmer.spotted = 0.9;
    game.farmer.lastSeen = { x: 560, y: 380 };
    game.shotFreeze = true;
    game.bannerTimer = 0;
    return;
  }
  if (shot === 'chase') {
    // Near-caught moment: the turkey dashes out of a haystack while the
    // farmer searches a step away, a knife warning flashing overhead.
    game.startRun();
    game.turkey.x = 250;
    game.turkey.y = 560;
    game.turkey.score = 900;
    game.turkey.corn = 2;
    game.obstacles.corn.slice(0, 2).forEach((c) => { c.taken = true; });
    // Stage a dash trail behind the turkey (dashing away would run it
    // straight into the farmer, so the trail is posed, not played).
    game.turkey.dashCooldown = 1.25;
    game.turkey.dashTrail = [
      { x: 290, y: 545, life: 5 },
      { x: 310, y: 538, life: 5 },
      { x: 330, y: 530, life: 5 },
    ];
    game.turkey.hidden = true;
    game.turkey.hideTimer = 1;
    game.farmer.x = 330;
    game.farmer.y = 520;
    game.farmer.state = 'search';
    game.farmer.spotted = 0.45;
    game.farmer.lastSeen = { x: 250, y: 560 };
    game.obstacles.knives.push({ x: 640, y: 60, vy: 0, state: 'warn', t: 0.7, stuck: 0 });
    game.shotFreeze = true;
    game.bannerTimer = 0;
    return;
  }
  if (shot === 'end') {
    game.startRun();
    game.turkey.score = 3420;
    game.turkey.corn = 13;
    game.obstacles.corn.slice(0, 4).forEach((c) => { c.taken = true; });
    game.stagesCleared = 3;
    game.elapsed = 187;
    game.bannerTimer = 0;
    game.state = 'escaped';
    return;
  }
  if (shot === 'caught') {
    game.startRun();
    game.turkey.score = 760;
    game.turkey.lives = 0;
    game.elapsed = 64;
    game.state = 'caught';
  }
}
