import {
  initFactory as initSilhouetteFactory,
  create as createSilhouette
} from './silhouette.js';

import {
  initFactory as initEmitterFactory,
  spawnEmitter,
  updateEmitters,
  drawEmitters,
  getSpawnTime,
  SPAWN_DELAY
} from './emitter.js';

import {
  initFactory as initParticleFactory,
  spawnParticle,
  updateParticles,
  drawParticles
} from './particle.js';

//
// consts
//
const BW = 1200;
const BH = 675;
const BOUNDS = {
  w: BW,
  h: BH,
  diag: Math.sqrt(BW*BW, BH*BH)
};

const SPAWN_MODES = [
  'CLICK',
  'CURSOR',
  'AUTO'
];
const SPAWN = SPAWN_MODES.reduce((keys, key, i) => {
  keys[SPAWN_MODES[i]] = i;
  return keys;
}, {});


export default function (p5) {
  //
  // vars
  //
  let g2;  // 2D buffer
  let g3;  // 3D buffer
  let debug = false;

  initParticleFactory(p5, BOUNDS);
  initEmitterFactory(p5, BOUNDS);

  initSilhouetteFactory(p5, BOUNDS);
  let silhouette = createSilhouette();

  // let spawnMode = SPAWN_MODES.indexOf(SPAWN.CLICK);
  let spawnMode = 0;
  let spawnQueue = resetSpawnQueue();

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

  /**
   * Attach p5 draw() method to p5 instance
   */
  p5.draw = () => {
    g3.push()
    g3.translate(-BOUNDS.w/2, -BOUNDS.h/2);
    g2.push()
    g2.translate(-BOUNDS.w/2, -BOUNDS.h/2);

    updateEnv();
    spawnQueue = spawnObjects();
    updateObjects();
    render();

    g3.pop();
    g2.pop();
  };

  /**
   * Attach p5 keyPressed() method to p5 instance
   */
  p5.keyPressed = () => {
    // SPACE to switch spawn modes
    if (p5.keyCode ===  32) {
      const prevMode = SPAWN_MODES[spawnMode];
      spawnMode = (spawnMode + 1) % SPAWN_MODES.length;
      console.log(`${prevMode} --> ${SPAWN_MODES[spawnMode]}`);
    }
  }

  /**
   * Attach p5 mouseClicked() method to p5 instance
   */
  p5.mouseClicked = () => {
    if (spawnMode === SPAWN.CLICK) {
      spawnQueue.particle = true;
    }
    spawnQueue.emitter = true;
  }

  function updateEnv() {
    updateLight(g3);
    silhouette.update(spawnMode, SPAWN);
  }

  function updateLight(g3) {
    g3.ambientLight(250, 250, 250);
    g3.directionalLight(
      250, 250, 250,
      0, 0, -1
    );
  }

  function spawnObjects() {
    if (spawnQueue.emitter) {
      spawnEmitter(getMouseLoc(p5));
    }

    switch (spawnMode) {
      case SPAWN.CLICK:
        if (spawnQueue.particle) {
          spawnParticleToSilhouette(getMouseLoc(p5));
        }
        break;
      case SPAWN.CURSOR:
        if (p5.frameCount % spawnQueue.nextSpawn === 0) {
          spawnParticleToSilhouette(getMouseLoc(p5));
        }
        break;
    }

    return resetSpawnQueue();
  }

  /** 
   * Helper function that accepts a location and
   * returns a factory function to spawn a particle at that location,
   * with the silhouete as its target
   */
  function spawnParticleToSilhouette(loc) {
    return spawnParticle(loc, silhouette);
  }

  function getMouseLoc(p5) {
    return p5.createVector(p5.mouseX, p5.mouseY, 0);
  }

  function resetSpawnQueue() {
    return {
      emitter: false,
      particle: false,
      nextSpawn: getSpawnTime()
    };
  }

  function updateObjects() {
    if (spawnMode === SPAWN.AUTO) {
      updateEmitters(spawnParticleToSilhouette);
    }

    updateParticles();
  }

  function render() {
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
    
    drawParticles(g3);
    silhouette.draw(g2);
    drawEmitters(g2);
    
    p5.image(g3, 0, 0);
    
    if (debug) p5.image(g2, 0, 0);
  }

};
