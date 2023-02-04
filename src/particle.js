const PARTICLE_SPEED = {min: 1, max: 3};
const PARTICLE_ROT_SPEED = {min: 0.02, max: 0.08};
const PARTICLE_TGT_VAR = {min: -0.05, max: 0.05};
const PARTICLE_BOUNCE_ANG_VAR = {min: -0.1, max: 0.1};
const PARTICLE_BOUNCE_VAR = {min: -0.25, max: 0.1};
const PARTICLE_BOUNCE_SPEED = {min: 5, max: 20};
const SQRT_THREE = Math.pow(3, 0.5);

let p5 = null;
let particles = [];

class Particle {
  static particleCount = 0;

  target;
  loc;
  rot;
  spd;
  size;
  id;

  constructor(loc, target) {
    this.target = target;
    this.loc = loc.copy();
    this.rot = {
      val: 0,
      spd: p5.random(PARTICLE_ROT_SPEED.min, PARTICLE_ROT_SPEED.max)
    };

    const targetVec = p5.createVector(
      (target.x0 + target.x1) *
      (0.5 + p5.random(PARTICLE_TGT_VAR.min, PARTICLE_TGT_VAR.max)),
      (target.y0 + target.y1) *
      (0.5 + p5.random(PARTICLE_TGT_VAR.min, PARTICLE_TGT_VAR.max)),
      0
    );

    this.spd = 
      // (target - loc) points toward target from location
      targetVec.sub(loc)
      // normalize to unit vector
      .normalize()
      // scale by random speed
      .mult(p5.random(PARTICLE_SPEED.min, PARTICLE_SPEED.max));

    this.size = 4;
    this.id = Particle.particleCount++;
  }

  update() {
    this.loc.add(this.spd);
    
    this.rot.val += this.rot.spd;
    
    if (this.loc.z === 0 && checkForCollision(this)) {
      // bounce opposite way
      this.spd.setHeading(this.spd.heading() - Math.PI
        + p5.random(
            PARTICLE_BOUNCE_ANG_VAR.min,
            PARTICLE_BOUNCE_ANG_VAR.max,
          )
      );
      this.spd.mult([
        p5.random(PARTICLE_BOUNCE_VAR.min, PARTICLE_BOUNCE_VAR.max),
        p5.random(PARTICLE_BOUNCE_VAR.min, PARTICLE_BOUNCE_VAR.max),
        0
      ]);
      this.spd.z = p5.random(PARTICLE_BOUNCE_SPEED.min, PARTICLE_BOUNCE_SPEED.max);
    }
  }

  draw(g) {
    g.push();
    g.translate(this.loc.x, this.loc.y, this.loc.z);
    // point in direction of travel
    g.rotateZ(this.spd.heading());
    // flip along direction of travel
    g.rotateY(this.rot.val);
    
    g.ellipseMode(p5.RADIUS);
    g.rectMode(p5.RADIUS);
    // g.stroke(255, 240, 200);
    // g.strokeWeight(2);
    // g.stroke(50);
    // g.noFill();
    
    // g,fill(5, 10, 40);
    g.fill(70);
    g.noStroke();
    
    // g.circle(0, 0, this.size);
    // g.rect(0, 0, this.size, this.size);
    g.triangle(0, 0, this.size, 2*SQRT_THREE, 2*this.size, 0);
      
    g.pop();
  }
}

/**
 * Init before creating instances
 */
export function initFactory(_p5, bounds) {
  p5 = _p5;
}

/**
 * Spawn particle at location, moving toward target
 */
export function spawnParticle(loc, target) {
  particles.push(new Particle(loc, target));
}

/**
 * Update all particles
 */
export function updateParticles() {
  for (let i=particles.length-1; i>=0; i--) {
    const p = particles[i];
    p.update();

    // remove old particles
    if (p.loc.z > 500) particles.splice(i, 1);
  };
}

export function drawParticles(g) {
  particles.forEach(p => p.draw(g));
}

/**
 * TODO: target is tightly coupled with silhouette,
 * and assumes rectangular bounds
 */
function checkForCollision(p)  {
  return (
    p.loc.x > p.target.x0 &&
    p.loc.x < p.target.x1 &&
    p.loc.y > p.target.y0 &&
    p.loc.y < p.target.y1
  );
}
