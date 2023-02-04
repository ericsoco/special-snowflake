import p5Main from './p5-main.js';

let p5Instance = null;

/**
 * Create main p5 instance and attach main methods
 */
function createInstance() {
  if (!p5Instance) {
    p5Instance = new p5(p5Main);
  }

  return p5Instance;
}

createInstance();
