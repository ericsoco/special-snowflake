let p5 = null;
let EMITTER_OVERFLOW;
let EMITTER_BOUNDS;

let spawnQueued = false;
let emitters = [];

class Emitter {
  loc;
  count;
  next;

  constructor(loc) {
    this.loc = loc;
    this.count = 0;
    this.next = getSpawnTime();
  }

  update(spawnParticle) {
    if (this.count++ > this.next) {
      this.count = 0;
      this.next = getSpawnTime();
      return spawnParticle(this.loc);
    }
  }

  draw(g) {
    g.ellipseMode(p5.RADIUS);
    g.stroke(20, 20, 50);
    g.noFill();
    g.circle(this.loc.x, this.loc.y, 10);
  }
}

/**
 * Init before creating instances
 */
export function initFactory(_p5, bounds) {
  p5 = _p5;

  EMITTER_OVERFLOW = bounds.w / 2;
  EMITTER_BOUNDS = {
    x0: -EMITTER_OVERFLOW,
    x1: bounds.w + EMITTER_OVERFLOW,
    y0: -EMITTER_OVERFLOW,
    y1: bounds.h + EMITTER_OVERFLOW
  };
}

/**
 * Instantiate an emitter
 */
function create(fromMouse) {
  if (!p5) {
    throw new Error('Provide p5 reference before instantiating, via initFactory()');
  }

  const loc = fromMouse
    ? p5.createVector(p5.mouseX, p5.mouseY)
    : p5.createVector(0, 0);
  
  return new Emitter(loc);
}

/**
 * Queue creation of emitter on next update
 */
export function spawnEmitter() {
  spawnQueued = true;
}

/**
 * Update all existing emitters and
 * create new emitters if queued
 */
export function updateEmitters(spawnParticle) {
  if (spawnQueued) {
    emitters.push(create(true));
    spawnQueued = false;
  }

  for (let i=emitters.length-1; i>=0; i--) {
    const e = emitters[i];
    e.update(spawnParticle);
  };
}

export function drawEmitters(g) {
  emitters.forEach(e => e.draw(g));
}

export const SPAWN_DELAY = {min: 2, max: 10};
export function getSpawnTime() {
  return Math.round(Math.random(SPAWN_DELAY.min, SPAWN_DELAY.max));
}

