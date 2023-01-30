/**
 * Silhouette of a viewer
 */
class Silhouette {
  static SILHOUETTE_SIZE = {
    w: 100,
    h: 220
  };

  static p5;
  static bounds;

  x0;
  x1;
  y0;
  y1;

  constructor() {
    this.x0 = (Silhouette.bounds.w - Silhouette.SILHOUETTE_SIZE.w)/2;
    this.x1 = (Silhouette.bounds.w + Silhouette.SILHOUETTE_SIZE.w)/2;
    this.y0 = (Silhouette.bounds.h - Silhouette.SILHOUETTE_SIZE.h)/2;
    this.y1 = (Silhouette.bounds.h + Silhouette.SILHOUETTE_SIZE.h)/2;
  }

  update (spawnMode, SPAWN) {
    // move silhouette only when in auto mode
    if (spawnMode !== SPAWN.AUTO) return;
    
    const centerX = Silhouette.p5.lerp((this.x0 + this.x1)/2, Silhouette.p5.mouseX, 0.2);
    const centerY = Silhouette.p5.lerp((this.y0 + this.y1)/2, Silhouette.p5.mouseY, 0.2);
    this.x0 = centerX - 0.5 * Silhouette.SILHOUETTE_SIZE.w;
    this.x1 = centerX + 0.5 * Silhouette.SILHOUETTE_SIZE.w;
    this.y0 = centerY - 0.5 * Silhouette.SILHOUETTE_SIZE.h;
    this.y1 = centerY + 0.5 * Silhouette.SILHOUETTE_SIZE.h;
  }

  draw (g) {
    g.noFill();
    g.stroke(80, 155, 40);
    g.strokeWeight(1);
    g.rectMode(Silhouette.p5.CORNERS);
    g.rect(this.x0, this.y0, this.x1, this.y1);
  }
}

/**
 * Init statics before creating instances
 */
export function initFactory(p5, bounds) {
  Silhouette.p5 = p5;
  Silhouette.bounds = bounds;
}

/**
 * Instantiate a silhouette
 */
export function create() {
  if (!Silhouette.p5) {
    throw new Error('Provide p5 reference before instantiating, via initFactory');
  }

  return new Silhouette();
}
