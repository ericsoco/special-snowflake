let p5 = null;
let particles = [];
let particleCount = 0;

class Particle {

  constructor() {
  }

  update() {
  }

  draw(g) {
  }
}

/**
 * Init before creating instances
 */
export function initFactory(_p5, bounds) {
  p5 = _p5;
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
 * Spawn particle
 */
export function spawnParticle(loc) {
  console.log('TODO: spawnParticle at', loc);
}

/**
 * Update all particles
 */
export function updateParticles() {
  for (let i=particles.length-1; i>=0; i--) {
    const p = particles[i];
    p.update();
  };
}

export function drawParticles(g) {
  particles.forEach(p => p.draw(g));
}
