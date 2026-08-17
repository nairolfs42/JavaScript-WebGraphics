// Florian Horn Sanders
// fhornsan@ucsc.edu
// cse160 winter 2026 asgn1

// WebGL globals (used by shape classes)
let canvas = null;
/** @type {WebGLRenderingContext|null} */
let gl = null;

let a_Position = -1;
/** @type {WebGLUniformLocation|null} */
let u_FragColor = null;
/** @type {WebGLUniformLocation|null} */
let u_Size = null;
let u_ModelMatrix = null;
let u_GlobalRotateMatrix = null;



const shapesList = [];
const pictureTriangles = []; 


// Current UI brush settings
let g_selectedColor = [1.0, 1.0, 1.0, 1.0];
let g_selectedSize = 10.0;
let g_selectedSegments = 12;
let g_selectedType = "square"; // "square" | "triangle" | "circle" | "star" LEFTOVER STUFF FROM ASGN1

var VSHADER_SOURCE = 
  "attribute vec4 a_Position;\n"+
  "uniform mat4 u_ModelMatrix;\n"+
  "uniform mat4 u_GlobalRotateMatrix;\n"+
  "void main() {\n"+
  "  gl_Position = u_GlobalRotateMatrix * u_ModelMatrix * a_Position;\n"+
  "}\n"

var FSHADER_SOURCE =
  "precision mediump float;\n" +
  "uniform vec4 u_FragColor;\n" +
  "void main() {\n" +
  "  gl_FragColor = u_FragColor;\n" +
  "}\n";

function setupWebGL() {
  canvas = document.getElementById("webgl");
  if (!canvas) {
    console.log('Failed to retrieve the <canvas> element');
    return false;
  }
  gl = canvas.getContext("webgl", { preserveDrawingBuffer: true });
  if (!gl) {
    // Fallback to CUON helper if needed
    gl = getWebGLContext(canvas);
  }
  if (!gl) {
    console.log("Failed to get WebGL context");
    return false;
  }
  gl.enable(gl.DEPTH_TEST); // enabled in main 

  return true;
}

function connectVariablesToGLSL() {
  if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
    console.log("Failed to initialize shaders.");
    return false;
  }

  a_Position = gl.getAttribLocation(gl.program, "a_Position");
  if (a_Position < 0) {
    console.log("Failed to get a_Position");
    return false;
  }

  u_FragColor = gl.getUniformLocation(gl.program, "u_FragColor");
  if (!u_FragColor) {
    console.log("Failed to get u_FragColor");
    return false;
  }

  /*
  u_Size = gl.getUniformLocation(gl.program, "u_Size");
  if (!u_Size) {
    console.log("Failed to get u_Size");
    return false;
  }*/
  u_ModelMatrix = gl.getUniformLocation(gl.program, "u_ModelMatrix");
  if (!u_ModelMatrix) {
    console.log("Failed to get u_ModelMatrix");
    return false;
  }
  u_GlobalRotateMatrix = gl.getUniformLocation(gl.program, "u_GlobalRotateMatrix");
  if (!u_GlobalRotateMatrix) {
    console.log("Failed to get u_GlobalRotateMatrix");
    return false;
  }

  var identityM = new Matrix4();
  gl.uniformMatrix4fv(u_ModelMatrix, false, identityM.elements);

  return true;
}

function convertCoordinatesEventToGL(ev) {
  const rect = ev.target.getBoundingClientRect();

  let x = ev.clientX - rect.left;
  let y = ev.clientY - rect.top;

  x = (x - canvas.width / 2) / (canvas.width / 2);
  y = (canvas.height / 2 - y) / (canvas.height / 2);

  return { x, y };
}

function pctToFloat01(pct) {
  const n = Number(pct);
  if (!Number.isFinite(n)) return 0;
  return Math.max(0, Math.min(1, n / 100));
}

let g_globalAngle = 0;  
var g_globalAngleX = 0;    
var g_isDragging = false;
var g_lastX = 0;
var g_lastY = 0;
let g_yellowAngle = 0;
let g_magentaAngle = 0;
let g_lowerlegAngle = 0;
let g_yellowAnimation = false;

function setupUI() {
  const YONBtn = document.getElementById("animationYellowOnButton");
  if (YONBtn) {
    YONBtn.onclick = () => {
      g_yellowAnimation = true;
    };
  }
  const YOFFBtn = document.getElementById("animationYellowOffButton");
  if (YOFFBtn) {
    YOFFBtn.onclick = () => {
      g_yellowAnimation = false;
    };
  }

  const angle = document.getElementById('angleSlide');
    angle.addEventListener('mousemove', function () {
    g_globalAngle = Number(this.value); // as originally cast as string, meaning it concats with mouse dragging instead of addition 
    renderAllShapes();
  });
  const yellowAngle = document.getElementById('yellowSlide');
    yellowAngle.addEventListener('mousemove', function () {
    g_yellowAngle = this.value;
    renderAllShapes();
  });
  const magentaAngle = document.getElementById('magentaSlide');
    magentaAngle.addEventListener('mousemove', function () {
    g_magentaAngle = this.value;
    renderAllShapes(); // upper leg angle
  });
  const lowerlegAngle = document.getElementById('lowerlegSlide');
    lowerlegAngle.addEventListener('mousemove', function () {
    g_lowerlegAngle = this.value;
    renderAllShapes();
  });

  //document.getElementById('angleSlide').addEventListener('mouseup', function() {g_globalAngle = this.ariaValueMax; renderAllShapes();});
}

// for mouse dragging
function initMouseRotation(canvas) {
  canvas.onmousedown = function (ev) {
    g_isDragging = true;
    g_lastX = ev.clientX;
    g_lastY = ev.clientY;
  };
  canvas.onmouseup = function () {
    g_isDragging = false;
  };
  canvas.onmouseleave = function () {
    g_isDragging = false;
  };
  canvas.onmousemove = function (ev) {
    if (!g_isDragging) return;
    var dx = ev.clientX - g_lastX;
    var dy = ev.clientY - g_lastY;
    g_lastX = ev.clientX;
    g_lastY = ev.clientY;
    // tweak sensitivity as needed
    g_globalAngle += dx * 0.5;     // drag left/right => yaw
    g_globalAngleX += dy * 0.5;    // drag up/down => pitch
    // clamp pitch so you can’t flip over
    if (g_globalAngleX > 89) g_globalAngleX = 89;
    if (g_globalAngleX < -89) g_globalAngleX = -89;
  };
}



// update animation angles if turned on
function updateAnimationAngles() {
  if (g_yellowAnimation) {
    g_yellowAngle = (25*Math.sin(g_seconds));

    var speed = 3.5;
    var upperAmp = 15;
    var phase = Math.PI / 2;
    // upper legs: symmetric swing
    g_magentaAngle = upperAmp * Math.sin(g_seconds * speed);
    // lower legs: clamp to [-45, 0] (never goes positive)
    var s = Math.sin(g_seconds * speed + phase);   // [-1,1]
    var u = 0.5 * (s + 1.0);                       // [0,1]
    g_lowerlegAngle = -45.0 + 45.0 * u;            // [-45,0]

    // keep slider thumbs in sync
    var magS = document.getElementById('magentaSlide');
    if (magS) magS.value = g_magentaAngle;
    var lowS = document.getElementById('lowerlegSlide');
    if (lowS) lowS.value = g_lowerlegAngle;
  }
}



function renderAllShapes() {
  var startTime = performance.now();
  //rotate matrix
  //var globalRotMat = new Matrix4().rotate(g_globalAngle,0,1,0);
  var globalRotMat = new Matrix4();
  globalRotMat.rotate(g_globalAngle, 0, 1, 0);   // yaw
  globalRotMat.rotate(g_globalAngleX, 1, 0, 0);  // pitch 
  gl.uniformMatrix4fv(u_GlobalRotateMatrix, false, globalRotMat.elements);

  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  gl.clear(gl.COLOR_BUFFER_BIT);
  
  //call function to render / draw the sheep 
  renderScene();
  // function content is within file src/sheep.js
  
  var duration = performance.now() - startTime;
  //console.log(duration);
}

function handleClicks(ev) {
  const { x, y } = convertCoordinatesEventToGL(ev);
}
function click(ev) {
  handleClicks(ev);
}

//FPS 
var g_fpsEl = null;
var g_lastFpsUpdate = 0;
var g_frameCount = 0;

// TICK 
var g_startTime = performance.now()/1000.0;
var g_seconds = performance.now()/1000.0 - g_startTime;

function tick() {
  g_seconds = performance.now()/1000.0 - g_startTime
  // console.log(g_seconds);
  // FPS 
  if (!g_fpsEl) g_fpsEl = document.getElementById('fps');
  g_frameCount++;
  if (g_seconds - g_lastFpsUpdate >= 0.25) {
    var fps = g_frameCount / (g_seconds - g_lastFpsUpdate);
    if (g_fpsEl) g_fpsEl.textContent = 'FPS: ' + fps.toFixed(1);
    g_lastFpsUpdate = g_seconds;
    g_frameCount = 0;
  }

  updateAnimationAngles();
  renderAllShapes();
  requestAnimationFrame(tick);

}



function main() {
  if (!setupWebGL()) return;
  if (!connectVariablesToGLSL()) return;
  setupUI();

  initMouseRotation(canvas); // for mouse dragging

  //gl.clear(gl.COLOR_BUFFER_BIT);
  //renderAllShapes();
  /*
  canvas.onmousedown = click;
  // drag
  canvas.onmousemove = (ev) => {
    if (ev.buttons === 1) click(ev);
  };*/

  //gl.clearColor(0, 0, 0, 1); // black
  gl.clearColor(0.7, 0.85, 1.0, 1.0); // light blue

  requestAnimationFrame(tick);
  
}