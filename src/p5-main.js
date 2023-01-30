export default function (p5) {
  console.log('p5-main p5:', p5);

  //
  // consts
  //
  const BOUNDS = {
    w: 1600,
    h: 900
  };
  BOUNDS.diag = Math.sqrt(BOUNDS.w*BOUNDS.w, BOUNDS.h*BOUNDS.h);
  const SQRT_THREE = Math.pow(3, 0.5);
  const EMITTER_OVERFLOW = BOUNDS.w / 2;
  const EMITTER_BOUNDS = {
    x0: -EMITTER_OVERFLOW,
    x1: BOUNDS.w + EMITTER_OVERFLOW,
    y0: -EMITTER_OVERFLOW,
    y1: BOUNDS.h + EMITTER_OVERFLOW
  };
  const SPAWN_DELAY = {min: 2, max: 10};
  const PARTICLE_SPEED = {min: 1, max: 3};
  const PARTICLE_ROT_SPEED = {min: 0.02, max: 0.08};
  const PARTICLE_TGT_VAR = {min: -0.05, max: 0.05};
  const PARTICLE_BOUNCE_ANG_VAR = {min: -0.1, max: 0.1};
  const PARTICLE_BOUNCE_VAR = {min: -0.25, max: 0.1};
  const PARTICLE_BOUNCE_SPEED = {min: 5, max: 20};
  const SPAWN_MODES = [
    'CLICK',
    'CURSOR',
    'AUTO'
  ];
  const SPAWN = SPAWN_MODES.reduce((keys, key, i) => {
    keys[SPAWN_MODES[i]] = i;
    return keys;
  }, {});
  const SILHOUETTE_SIZE = {
    w: 100,
    h: 220
  };

  //
  // vars
  //
  let g2;  // 2D buffer
  let g3;  // 3D buffer
  let debug = false;
  let particles = [];
  let particleCount = 0;
  let nextSpawnDelay = SPAWN_DELAY.min;

  // let spawnMode = SPAWN_MODES.indexOf(SPAWN.CLICK);
  let spawnMode = 0;
  let spawnClicked = false;

  let emitters = [];
  // let emitterSpawnMode = SPAWN_MODES.indexOf(SPAWN.CLICK);
  let emitterSpawnMode = 0;
  let emitterSpawnClicked = false;

  let silhouette = {
    x0: (BOUNDS.w - SILHOUETTE_SIZE.w)/2,
    x1: (BOUNDS.w + SILHOUETTE_SIZE.w)/2,
    y0: (BOUNDS.h - SILHOUETTE_SIZE.h)/2,
    y1: (BOUNDS.h + SILHOUETTE_SIZE.h)/2
  };

  /**
   * Attach p5 setup() method to p5 instance
   */
  p5.setup = () => {
    p5.createCanvas(BOUNDS.w, BOUNDS.h);

    g3 = p5.createGraphics(BOUNDS.w, BOUNDS.h, p5.WEBGL);
    g3.colorMode(p5.RGB, 255, 255, 255, 1);
    
    // Set depth buffer clear depth
    // https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/clearDepth
    // g3.drawingContext.clearDepth(1);
    
    // monkeying around
    // g3.blendMode(DARKEST);
    // g3.setAttributes('depth', false);
    // g3.setAttributes('alpha', true);
    
    g2 = p5.createGraphics(BOUNDS.w, BOUNDS.h, p5.WEBGL);
    g2.colorMode(p5.RGB, 255, 255, 255, 1);
  };

  // TODO: kludge to make previously-global consts+vars
  // available to fns down the call graph
  const vars = {
    BOUNDS,
    debug,
    spawnMode,
    SPAWN,
    silhouette
  };

  p5.draw = () => {
    g3.push()
    g3.translate(-BOUNDS.w/2, -BOUNDS.h/2);
    g2.push()
    g2.translate(-BOUNDS.w/2, -BOUNDS.h/2);
    updateEnv(p5, g2, g3, vars);
    render(p5, g2, g3, vars);
    g3.pop();
    g2.pop();
  };
};

function updateEnv(p5, g2, g3, vars) {
  updateLight(g3);
  updateSilhouette(p5, vars);
  
  /*
  spawnEmitter();
  for (let i=emitters.length-1; i>=0; i--) {
    const em = emitters[i];
    updateEmitter(em, i);
  };
  
  spawnParticle();
  for (let i=particles.length-1; i>=0; i--) {
    const pt = particles[i];
    updateParticle(pt, i);
  };
  */
}

function updateLight(g3) {
  g3.ambientLight(250, 250, 250);
  g3.directionalLight(
    250, 250, 250,
    0, 0, -1
  );
}

function updateSilhouette(p5, {spawnMode, SPAWN, silhouette}) {
  // move silhouette only when in auto mode
  if (spawnMode !== SPAWN.AUTO) return;
  
  const centerX = p5.lerp((silhouette.x0 + silhouette.x1)/2, mouseX, 0.2);
  const centerY = p5.lerp((silhouette.y0 + silhouette.y1)/2, mouseY, 0.2);
  silhouette.x0 = centerX - 0.5 * SILHOUETTE_SIZE.w;
  silhouette.x1 = centerX + 0.5 * SILHOUETTE_SIZE.w;
  silhouette.y0 = centerY - 0.5 * SILHOUETTE_SIZE.h;
  silhouette.y1 = centerY + 0.5 * SILHOUETTE_SIZE.h;
}

function render(p5, g2, g3, {BOUNDS, debug}) {
  p5.background(230);
  
  // particle trails
  g3.noStroke();
  g3.fill(230, 0.5);
  g3.rect(0, 0, BOUNDS.w, BOUNDS.h);
  // Depth buffer is supposed to be cleared on every update()
  // https://github.com/processing/p5.js/blob/main/src/webgl/p5.RendererGL.js#L583
  // ...but perhaps update() is not called on renderer that is not
  // the main context (createGraphics vs createCanvas(GL)).
  // clear() only clears color buffer
  // https://github.com/processing/p5.js/blob/main/src/webgl/p5.RendererGL.js#L595
  // ...so manually clear only the depth buffer.
  g3._renderer.GL.clear(g3._renderer.GL.DEPTH_BUFFER_BIT);
  g2.clear();
  
  // particles.forEach(drawParticle);
  // emitters.forEach(drawEmitter);
  // drawSilhouette();
  
  p5.image(g3, 0, 0);
  
  if (debug) p5.image(g2, 0, 0);
}






/*

function placeEmitter() {
  // TODO
}

function getSpawnTime() {
  return round(random(SPAWN_DELAY.min, SPAWN_DELAY.max));
}

function createParticle(emitterLoc) {
  const loc = emitterLoc
    ? emitterLoc.copy()
    : createVector(mouseX, mouseY, 0);
  
  const target = createVector(
    (silhouette.x0 + silhouette.x1) *
    (0.5 + random(PARTICLE_TGT_VAR.min, PARTICLE_TGT_VAR.max)),
    (silhouette.y0 + silhouette.y1) *
    (0.5 + random(PARTICLE_TGT_VAR.min, PARTICLE_TGT_VAR.max)),
    0
  );
  
  return {
    loc,
    rot: {
      val: 0,
      spd: random(PARTICLE_ROT_SPEED.min, PARTICLE_ROT_SPEED.max)
    },
    spd:
      // target - loc points toward target from location
      target.sub(loc)
      // normalize to unit vector
      .normalize()
      // scale by random speed
      .mult(random(PARTICLE_SPEED.min, PARTICLE_SPEED.max)),
    size: 4,
    id: particleCount++
  };
}

function spawnParticle() {
  switch (spawnMode) {
    case SPAWN.CLICK:
      if (spawnClicked) {
        particles.push(createParticle());
        spawnClicked = false;
      }
      break;
    case SPAWN.CURSOR:
      if (frameCount % nextSpawnDelay === 0) {
        particles.push(createParticle());
        nextSpawnDelay = getSpawnTime();
      }
      break;
    case SPAWN.AUTO:
      emitters.forEach(emitParticle);
      break;
  }
}

function createEmitter (fromMouse) {
  const loc = createVector(mouseX, mouseY);
  
  return {
    loc,
    count: 0,
    next: getSpawnTime()
  };
}

function spawnEmitter() {
  switch (spawnMode) {
    case SPAWN.CLICK:
      if (emitterSpawnClicked) {
        emitters.push(createEmitter(true));
        emitterSpawnClicked = false;
      }
      break;
  }
}

function updateParticle(p, i) {
  p.loc.add(p.spd);
  
  p.rot.val += p.rot.spd;
  
  if (p.loc.z === 0 && checkForCollision(p)) {
    // bounce opposite way
    p.spd.setHeading(p.spd.heading() - Math.PI
      + random(
          PARTICLE_BOUNCE_ANG_VAR.min,
          PARTICLE_BOUNCE_ANG_VAR.max,
        )
    );
    p.spd.mult([
      random(PARTICLE_BOUNCE_VAR.min, PARTICLE_BOUNCE_VAR.max),
      random(PARTICLE_BOUNCE_VAR.min, PARTICLE_BOUNCE_VAR.max),
      0
    ]);
    p.spd.z = random(PARTICLE_BOUNCE_SPEED.min, PARTICLE_BOUNCE_SPEED.max);
  }
    
  // remove old particles
  if (p.loc.z > 500) particles.splice(i, 1);
}

function checkForCollision(p)  {
  return (
    p.loc.x > silhouette.x0 &&
    p.loc.x < silhouette.x1 &&
    p.loc.y > silhouette.y0 &&
    p.loc.y < silhouette.y1
  );
}

function updateEmitter(e, i) {
  e.count++;
}

function emitParticle(e) {
  if (e.count > e.next) {
    particles.push(createParticle(e.loc));
    e.count = 0;
    e.next = getSpawnTime();
  }
}

function drawParticle(p) {
  g3.push();
  g3.translate(p.loc.x, p.loc.y, p.loc.z);
  // point in direction of travel
  g3.rotateZ(p.spd.heading());
  // flip along direction of travel
  g3.rotateY(p.rot.val);
  
  g3.ellipseMode(RADIUS);
  g3.rectMode(RADIUS);
  // stroke(255, 240, 200);
  // strokeWeight(2);
  // stroke(50);
  // noFill();
  
  // fill(5, 10, 40);
  g3.fill(70);
  g3.noStroke();
  
  // g3.circle(0, 0, p.size);
  // g3.rect(0, 0, p.size, p.size);
  g3.triangle(0, 0, p.size, 2*SQRT_THREE, 2*p.size, 0);
    
  g3.pop();
}

function drawEmitter(e) {
  g2.ellipseMode(RADIUS);
  g2.stroke(20, 20, 50);
  g2.noFill();
  g2.circle(e.loc.x, e.loc.y, 10);
}

function drawSilhouette() {
  g2.noFill();
  g2.stroke(80, 155, 40);
  g2.rectMode(CORNERS);
  g2.rect(silhouette.x0, silhouette.y0, silhouette.x1, silhouette.y1);
}

function updateEnv() {
  updateLight();
  updateSilhouette();
  
  spawnEmitter();
  for (let i=emitters.length-1; i>=0; i--) {
    const em = emitters[i];
    updateEmitter(em, i);
  };
  
  spawnParticle();
  for (let i=particles.length-1; i>=0; i--) {
    const pt = particles[i];
    updateParticle(pt, i);
  };
  
}

function render() {
  background(230);
  
  // particle trails
  g3.noStroke();
  g3.fill(230, 0.5);
  g3.rect(0, 0, BOUNDS.w, BOUNDS.h);
  // Depth buffer is supposed to be cleared on every update()
  // https://github.com/processing/p5.js/blob/main/src/webgl/p5.RendererGL.js#L583
  // ...but perhaps update() is not called on renderer that is not
  // the main context (createGraphics vs createCanvas(GL)).
  // clear() only clears color buffer
  // https://github.com/processing/p5.js/blob/main/src/webgl/p5.RendererGL.js#L595
  // ...so manually clear only the depth buffer.
  g3._renderer.GL.clear(g3._renderer.GL.DEPTH_BUFFER_BIT);
  g2.clear();
  
  particles.forEach(drawParticle);
  emitters.forEach(drawEmitter);
  drawSilhouette();
  
  image(g3, 0, 0);
  
  if (debug) image(g2, 0, 0);
}

function draw() {
  g3.push()
  g3.translate(-BOUNDS.w/2, -BOUNDS.h/2);
  g2.push()
  g2.translate(-BOUNDS.w/2, -BOUNDS.h/2);
  updateEnv();
  render();
  g3.pop();
  g2.pop();
}

function keyPressed() {
  // SPACE to switch spawn modes
  if (keyCode ===  32) {
    const prevMode = SPAWN_MODES[spawnMode];
    spawnMode = (spawnMode + 1) % SPAWN_MODES.length;
    console.log(`${prevMode} --> ${SPAWN_MODES[spawnMode]}`);
  }
}

function mouseClicked() {
  if (spawnMode === SPAWN.CLICK) {
    spawnClicked = true;
  }
  
  if (emitterSpawnMode === SPAWN.CLICK) {
    emitterSpawnClicked = true;
  }
}
*/
