const SILHOUETTE_SIZE = {
  w: 100,
  h: 220
};

let p5;
let bounds;

/**
 * Silhouette of a viewer
 */
class Silhouette {
  x0;
  x1;
  y0;
  y1;

  constructor() {
    this.x0 = (bounds.w - SILHOUETTE_SIZE.w)/2;
    this.x1 = (bounds.w + SILHOUETTE_SIZE.w)/2;
    this.y0 = (bounds.h - SILHOUETTE_SIZE.h)/2;
    this.y1 = (bounds.h + SILHOUETTE_SIZE.h)/2;
  }

  update (spawnMode, SPAWN) {
    // move silhouette only when in auto mode
    if (spawnMode !== SPAWN.AUTO) return;
    
    const centerX = p5.lerp((this.x0 + this.x1)/2, p5.mouseX, 0.2);
    const centerY = p5.lerp((this.y0 + this.y1)/2, p5.mouseY, 0.2);
    this.x0 = centerX - 0.5 * SILHOUETTE_SIZE.w;
    this.x1 = centerX + 0.5 * SILHOUETTE_SIZE.w;
    this.y0 = centerY - 0.5 * SILHOUETTE_SIZE.h;
    this.y1 = centerY + 0.5 * SILHOUETTE_SIZE.h;
  }

  draw (g) {
    g.noFill();
    g.stroke(80, 155, 40);
    g.strokeWeight(1);
    g.rectMode(p5.CORNERS);
    g.rect(this.x0, this.y0, this.x1, this.y1);
  }
}

/**
 * Init before creating instances
 */
export function initFactory(_p5, _bounds) {
  p5 = _p5;
  bounds = _bounds;
}

/**
 * Instantiate a silhouette
 */
export function create() {
  if (!p5) {
    throw new Error('Provide p5 reference before instantiating, via initFactory()');
  }

  return new Silhouette();
}
