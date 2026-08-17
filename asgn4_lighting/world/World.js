// Florian Horn Sanders
// fhornsan@ucsc.edu
// cse160 winter 2026 asgn1

// WebGL globals (used by shape classes)
let canvas;
let gl;
let a_Position;
let a_UV;
let u_FragColor;
let u_Size;
let u_ModelMatrix;
let u_ProjectionMatrix;
let u_ViewMatrix;
let u_GlobalRotateMatrix;
let u_whichTexture;
let u_Sampler0;
let u_Sampler1;
// normals // asgn4 lighting 
let v_Normal;
let a_Normal;
let u_cameraPos;

let g_lightingOn = true;  // default
let u_LightingOn;         // uniform location

let g_yaw = 0;          // radians
let g_lastMouseX = null;
let g_mouseDown = false;

const g_staticCubes = [];

const shapesList = [];
const pictureTriangles = []; 


// Current UI brush settings
let g_selectedColor = [1.0, 1.0, 1.0, 1.0];
let g_selectedSize = 10.0;
let g_selectedSegments = 12;
let g_selectedType = "square"; // "square" | "triangle" | "circle" | "star" LEFTOVER STUFF FROM ASGN1

var VSHADER_SOURCE = 
  "precision mediump float;\n"+
  "attribute vec4 a_Position;\n"+
  "attribute vec2 a_UV;\n"+
  "attribute vec3 a_Normal;\n"+
  "varying vec3 v_Normal;\n"+
  "varying vec2 v_UV;\n"+
  "uniform mat4 u_ModelMatrix;\n"+
  "uniform mat4 u_GlobalRotateMatrix;\n"+
  "uniform mat4 u_ViewMatrix;\n"+
  "uniform mat4 u_ProjectionMatrix;\n"+
  "varying vec4 v_vertPos;\n" +
  "void main() {\n"+
  "  gl_Position = u_ProjectionMatrix * u_ViewMatrix * u_GlobalRotateMatrix * u_ModelMatrix * a_Position;\n"+
  "  v_UV = a_UV;\n"+
  "  v_Normal = a_Normal;\n"+
  "  v_vertPos = u_ModelMatrix * a_Position;\n"+
  "}\n"

/*var FSHADER_SOURCE =
  "precision mediump float;\n" +
  "varying vec2 v_UV;\n" +
  "varying vec3 v_Normal;\n"+
  "uniform vec4 u_FragColor;\n" +
  "uniform sampler2D u_Sampler0;\n" +
  "uniform sampler2D u_Sampler1;\n" +
  "uniform int u_whichTexture;\n" +
  "uniform vec3 u_lightPos;\n" +
  "varying vec4 v_vertPos;\n" +
  "uniform vec3 u_cameraPos;\n" +
  "uniform int u_LightingOn;\n"+
  "void main() {\n" +
  "  if (u_whichTexture == -3) {\n" +
  "    gl_FragColor = vec4((v_Normal+1.0)/2.0,1.0);\n" + // use normal
  "  } else if (u_whichTexture == -2) {\n" +
  "    gl_FragColor = u_FragColor;\n" + // use color 
  "  } else if (u_whichTexture == -1) {\n" +
  "    gl_FragColor = vec4(v_UV,1.0,1.0);\n" + // use uv debug color
  "  } else if (u_whichTexture == 0) {\n" +
  "    gl_FragColor = texture2D(u_Sampler0, v_UV);\n" + // yse texture0
  "  } else if (u_whichTexture == 1) {\n" + 
  "    gl_FragColor = vec4(0.7, 0.85, 1.0, 1.0);\n" + // light blue for sky 
  "  } else if (u_whichTexture == 2) {\n" +
  "    gl_FragColor = texture2D(u_Sampler1, v_UV);\n" + // yse texture0
  "  } else {\n" +
  "    gl_FragColor = vec4(1,.2,.2,1);\n" + // error use red 
  "  }\n" +
  "  //vec3 lightVector = vec3(v_vertPos)-u_lightPos;\n" +
  "  vec3 lightVector = u_lightPos-vec3(v_vertPos);\n" +
  "  float r=length(lightVector);\n" +
  "  //if (r<0.75) {\n"+
  "  //  gl_FragColor=vec4(1,0,0,1);\n"+
  "  //} else if (r<1.5) {\n"+
  "  //  gl_FragColor=vec4(0,1,0,1);\n"+
  "  //}\n"+
  "  //gl_FragColor=vec4(vec3(gl_FragColor)/(r*r),1);\n"+
  "  vec3 L = normalize(lightVector);\n"+
  "  vec3 N = normalize(v_Normal);\n"+
  "  float nDotL = max(dot(N,L),0.0);\n"+
  "  vec3 R = reflect(-L,N);\n"+
  "  vec3 E = normalize(u_cameraPos - vec3(v_vertPos));\n"+
  "  float specular = pow(max(dot(E,R),0.0),10.0);\n"+
  "  vec3 diffuse = vec3(gl_FragColor) * nDotL;\n"+
  "  vec3 ambient = vec3(gl_FragColor) * 0.3;\n"+
  "  gl_FragColor = vec4(specular+diffuse+ambient,1.0);\n"+
  "}\n";
*/
var FSHADER_SOURCE =
  "precision mediump float;\n" +
  "varying vec2 v_UV;\n" +
  "varying vec3 v_Normal;\n"+
  "uniform vec4 u_FragColor;\n" +
  "uniform sampler2D u_Sampler0;\n" +
  "uniform sampler2D u_Sampler1;\n" +
  "uniform int u_whichTexture;\n" +
  "uniform vec3 u_lightPos;\n" +
  "varying vec4 v_vertPos;\n" +
  "uniform vec3 u_cameraPos;\n" +
  "uniform int u_LightingOn;\n"+
  "void main() {\n" +
  "  vec4 baseColor;\n" +                        // ADDED
  "  if (u_whichTexture == -3) {\n" +
  "    baseColor = vec4((v_Normal+1.0)/2.0,1.0);\n" +
  "  } else if (u_whichTexture == -2) {\n" +
  "    baseColor = u_FragColor;\n" +
  "  } else if (u_whichTexture == -1) {\n" +
  "    baseColor = vec4(v_UV,1.0,1.0);\n" +
  "  } else if (u_whichTexture == 0) {\n" +
  "    baseColor = texture2D(u_Sampler0, v_UV);\n" +
  "  } else if (u_whichTexture == 1) {\n" + 
  "    baseColor = vec4(0.7, 0.85, 1.0, 1.0);\n" +
  "  } else if (u_whichTexture == 2) {\n" +
  "    baseColor = texture2D(u_Sampler1, v_UV);\n" +
  "  } else {\n" +
  "    baseColor = vec4(1.0, 0.2, 0.2, 1.0);\n" +
  "  }\n" +
  "  if (u_LightingOn == 0) {\n" +              // 
  "    gl_FragColor = baseColor;\n" +           // 
  "    return;\n" +                             // 
  "  }\n" +                                     
  "  vec3 lightVector = u_lightPos - v_vertPos.xyz;\n" +  
  "  vec3 L = normalize(lightVector);\n"+
  "  vec3 N = normalize(v_Normal);\n"+
  "  float nDotL = max(dot(N,L),0.0);\n"+
  "  vec3 R = normalize(reflect(-L,N));\n"+
  "  vec3 E = normalize(u_cameraPos - v_vertPos.xyz);\n"+
  "  float specular = pow(max(dot(E,R),0.0),10.0);\n"+
  "  vec3 diffuse = baseColor.rgb * nDotL;\n"+            // CHANGED (use baseColor)
  "  vec3 ambient = baseColor.rgb * 0.3;\n"+              // CHANGED (use baseColor)
  "  gl_FragColor = vec4(ambient + diffuse + specular, baseColor.a);\n"+ // CHANGED
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
  a_UV = gl.getAttribLocation(gl.program, "a_UV");
  if (a_UV < 0) {
    console.log("Failed to get a_UV");
    return false;
  }

  u_FragColor = gl.getUniformLocation(gl.program, "u_FragColor");
  if (!u_FragColor) {
    console.log("Failed to get u_FragColor");
    return false;
  }
  u_cameraPos = gl.getUniformLocation(gl.program, "u_cameraPos");
  if (!u_cameraPos) {
    console.log("Failed to get u_cameraPos");
    return false;
  }

  u_lightPos = gl.getUniformLocation(gl.program, "u_lightPos");
  if (!u_lightPos) {
    console.log("Failed to get u_lightPos");
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
  u_ViewMatrix = gl.getUniformLocation(gl.program, "u_ViewMatrix");
  if (!u_ViewMatrix) {
    console.log("Failed to get u_ViewMatrix");
    return false;
  }
  u_ProjectionMatrix = gl.getUniformLocation(gl.program, "u_ProjectionMatrix");
  if (!u_ProjectionMatrix) {
    console.log("Failed to get u_ProjectionMatrix");
    return false;
  }

  u_LightingOn = gl.getUniformLocation(gl.program, 'u_LightingOn');
  if (!u_LightingOn) { console.log('Failed to get u_LightingOn'); return false; }
  //gl.uniform1i(u_LightingOn, g_lightingOn ? 1 : 0);

  u_whichTexture = gl.getUniformLocation(gl.program, "u_whichTexture");
  if (!u_whichTexture) {
    console.log("Failed to get u_whichTexture");
    return false;
  }
  u_Sampler0 = gl.getUniformLocation(gl.program, "u_Sampler0");
  if (!u_Sampler0) {
    console.log("Failed to get u_Sampler0");
    return false;
  }
  u_Sampler1 = gl.getUniformLocation(gl.program, "u_Sampler1");
  if (!u_Sampler1) {
    console.log("Failed to get u_Sampler1");
    return false;
  }

  // normals // asgn4 lighting 
  /*
  v_Normal = gl.getAttribLocation(gl.program, "v_Normal");
  if (v_Normal < 0) {
    console.log("Failed to get v_Normal");
    return false;
  }*/

  a_Normal = gl.getAttribLocation(gl.program, "a_Normal");
  if (a_Normal < 0) {
    console.log("Failed to get a_Normal");
    return false;
  }

  var identityM = new Matrix4();
  gl.uniformMatrix4fv(u_ModelMatrix, false, identityM.elements);
  gl.uniformMatrix4fv(u_ViewMatrix, false, identityM.elements);
  gl.uniformMatrix4fv(u_ProjectionMatrix, false, identityM.elements);

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
let g_normalOn = false;
let u_lightPos;
let v_vertPos;


let g_lightPos = [0, 1, -2];   // default light position in world space

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
  // normals toggle
  const normalOnBtn = document.getElementById("g_normalOn");
  if (normalOnBtn) {
    normalOnBtn.onclick = () => {
      g_normalOn = true;      // global boolean
      renderAllShapes();
    };
  }

  const normalOffBtn = document.getElementById("g_normalOff");
  if (normalOffBtn) {
    normalOffBtn.onclick = () => {
      g_normalOn = false;     // global boolean
      renderAllShapes();
    };
  }

  // Light sliders (same format as angleSlide)
  const lightX = document.getElementById('lightSlideX');
  lightX.addEventListener('mousemove', function () {
    g_lightPos[0] = Number(this.value) / 100;  // -250..250 -> -2.5..2.5
    renderAllShapes();
  });

  const lightY = document.getElementById('lightSlideY');
  lightY.addEventListener('mousemove', function () {
    g_lightPos[1] = Number(this.value) / 100;
    renderAllShapes();
  });

  const lightZ = document.getElementById('lightSlideZ');
  lightZ.addEventListener('mousemove', function () {
    g_lightPos[2] = Number(this.value) / 100;
    renderAllShapes();
  });


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

  const lightingOnBtn = document.getElementById('lightingOn');
  lightingOnBtn.onclick = function () {
    g_lightingOn = true;
    renderAllShapes();
  };

  const lightingOffBtn = document.getElementById('lightingOff');
  lightingOffBtn.onclick = function () {
    g_lightingOn = false;
    renderAllShapes();
  };

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
    g_lightPos[0] = Math.cos(g_seconds);
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

function keydown(ev) {
  const step = 0.2;                 // movement speed
  const turnDeg = 5;                // turn speed (degrees per keypress)

  // direction from eye to at
  let fx = g_at[0] - g_eye[0];
  let fy = g_at[1] - g_eye[1];
  let fz = g_at[2] - g_eye[2];

  // normalize forward (only in XZ plane so you don't fly up/down)
  const fLen = Math.hypot(fx, fz) || 1;
  fx /= fLen; fz /= fLen;

  // right vector = forward x up  (with up = (0,1,0))
  let rx =  fz;
  let rz = -fx;

  const k = ev.key; // use 'w','a','s','d','q','e' and also Arrow keys

  if (k === 'w' || k === 'ArrowUp') {
    g_eye[0] += fx * step;  g_eye[2] += fz * step;
    g_at[0]  += fx * step;  g_at[2]  += fz * step;
  } else if (k === 's' || k === 'ArrowDown') {
    g_eye[0] -= fx * step;  g_eye[2] -= fz * step;
    g_at[0]  -= fx * step;  g_at[2]  -= fz * step;
  } else if (k === 'a' || k === 'ArrowRight') {
    g_eye[0] += rx * step;  g_eye[2] += rz * step;
    g_at[0]  += rx * step;  g_at[2]  += rz * step;
  } else if (k === 'd' || k === 'ArrowLeft') {
    g_eye[0] -= rx * step;  g_eye[2] -= rz * step;
    g_at[0]  -= rx * step;  g_at[2]  -= rz * step;
  } else if (k === 'e' || k === 'q') {
    // yaw rotate the forward direction around Y axis
    const angle = (k === 'e' ? +turnDeg : -turnDeg) * Math.PI / 180;

    // recompute full dir (including y as-is)
    let dx = g_at[0] - g_eye[0];
    let dz = g_at[2] - g_eye[2];

    const cosA = Math.cos(angle);
    const sinA = Math.sin(angle);

    const ndx = dx * cosA - dz * sinA;
    const ndz = dx * sinA + dz * cosA;

    g_at[0] = g_eye[0] + ndx;
    g_at[2] = g_eye[2] + ndz;
  }

  renderAllShapes();
}

//asgn3
//var g_eye=[0,0,3];
//var g_at = [0,0,-100];
//var g_up=[0,1,0];

//asgn4
var g_eye=[0,1,2.5];
var g_at = [0,0,0];
var g_up=[0,1,0];

const MAP_SIZE = 32;
const MAP_HALF = MAP_SIZE / 2;   // 16
let g_map = Array.from({ length: MAP_SIZE }, () => Array(MAP_SIZE).fill(0));


function drawMap() {
  for (let x = 0; x < MAP_SIZE; x++) {
    for (let y = 0; y < MAP_SIZE; y++) {
      if (g_map[x][y] === 1) {
        var body = new Cube();
        body.textureNum = 2;
        if (g_normalOn) body.textureNum = -3;
        body.matrix.translate(x - MAP_HALF, -0.5, y - MAP_HALF);
        body.render();
      }
    }
  }
}
// increase map size 
function drawMapBorder(borderMin, borderMax) {
  for (let x = borderMin; x <= borderMax; x++) {
    for (let z = borderMin; z <= borderMax; z++) {
      const onEdge = (x === borderMin || x === borderMax || z === borderMin || z === borderMax);
      if (!onEdge) continue;

      const b = new Cube();
      b.textureNum = 2;          // barrel (or set -2 for solid color)
      if (g_normalOn) b.textureNum = -3;
      b.matrix.translate(x, -0.5, z);
      b.render();
    }
  }
}


function renderFloor4() {
  const y = -0.5;
  const size = 16; // each quadrant is 16x16, total becomes 32x32
  // Quadrant centers at (-8,-8), (8,-8), (-8,8), (8,8)
  const centers = [
    [-8, -8],
    [ 8, -8],
    [-8,  8],
    [ 8,  8],
  ];
  for (const [cx, cz] of centers) {
    const tile = new Cube();
    tile.textureNum = 0;                 // dirt
    tile.matrix.translate(cx, y, cz);    // move quadrant into place
    tile.matrix.scale(size, 0.01, size); // thin in Y (avoid 0)
    tile.matrix.translate(-0.5, 0, -0.5);// center the cube like you do now
    tile.render();
  }
}



function renderAllShapes() {
  var startTime = performance.now();
  //rotate matrix
  //var globalRotMat = new Matrix4().rotate(g_globalAngle,0,1,0);
  // for world assignment cameras 
  var projMat = new Matrix4();
  projMat.setPerspective(90,1*canvas.width/canvas.height,.1,100);
  gl.uniformMatrix4fv(u_ProjectionMatrix, false, projMat.elements);

  var viewMat = new Matrix4();
  viewMat.setLookAt(g_eye[0],g_eye[1],g_eye[2], g_at[0],g_at[1],g_at[2], g_up[0],g_up[1],g_up[2]);
  gl.uniformMatrix4fv(u_ViewMatrix, false, viewMat.elements);
  
  var globalRotMat = new Matrix4();
  globalRotMat.rotate(g_globalAngle, 0, 1, 0);   // yaw
  globalRotMat.rotate(g_globalAngleX, 1, 0, 0);  // pitch 
  gl.uniformMatrix4fv(u_GlobalRotateMatrix, false, globalRotMat.elements);
  //gl.uniformMatrix4fv(u_GlobalRotateMatrix, false, new Matrix4().elements);


  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  gl.clear(gl.COLOR_BUFFER_BIT);
  
  
  drawMap();
  //drawMapBorder(-10, 8);
  //drawMapBorder(-MAP_HALF - 1, MAP_HALF);
 
  //renderFloor4();

  /*for (let i = 0; i < g_staticCubes.length; i++) {
    g_staticCubes[i].render();
  }*/
  // pass light pos to glsl
  gl.uniform3f(u_lightPos, g_lightPos[0],g_lightPos[1],g_lightPos[2]);
  //gl.uniform3f(u_cameraPos, u_cameraPos.eye.x,u_camera.eye.y,u_cameraPos.eye.z);
  gl.uniform3f(u_cameraPos, g_eye[0], g_eye[1], g_eye[2]);

  // lighting test 
  gl.uniform1i(u_LightingOn, g_lightingOn ? 1 : 0);

    //draw light 
  var light = new Cube();
  light.color=[2,2,0,1];
  light.matrix.translate(g_lightPos[0],g_lightPos[1],g_lightPos[2]);
  light.matrix.scale(.1,.1,.1);
  light.matrix.translate(-0.5,-0.5,-0.5);
  light.render();
 

  // render the floor
  var body = new Cube();
  body.color = [1.0,0.0,0.0,1.0];
  body.textureNum = 0;
  body.matrix.translate(0,-.5,0.0);
  body.matrix.scale(33,0,33);
  body.matrix.translate(-0.5,0,-0.5);
  body.render();

  // asgn4 draw sky 
  var sky = new Cube();
  sky.color = [0.8,0.8,0.8,1.0];
  if (g_normalOn) sky.textureNum = -3;
  sky.matrix.scale(-5,-5,-5);
  sky.matrix.translate(-0.5,-0.5,-0.5);
  sky.render();


  var sphere = new Sphere();
  sphere.color = [1,1,1,1];
  if (g_normalOn) sphere.textureNum = -3;
  sphere.matrix.translate(-.7,1,-1);
  sphere.matrix.scale(.8,.8,.8);
  sphere.render();
  //call function to render / draw the sheep 
  renderScene();
  // function content is within file src/sheep.js
  //var duration = performance.now() - startTime;
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


function initTextures() {
  var image0 = new Image();  // Create the image object
  if (!image0) {
    console.log('Failed to create the image0 object');
    return false;
  }
  // Register the event handler to be called on loading an image
  image0.onload = function(){ sendTextureToTEXTURE0(image0); };
  // Tell the browser to load an image
  image0.src = 'textures/dirt.jpg';


  var image1 = new Image();  // Create the image object
  if (!image1) {
    console.log('Failed to create the image1 object');
    return false;
  }
  // Register the event handler to be called on loading an image
  image1.onload = function(){ sendTextureToTEXTURE1(image1); };
  // Tell the browser to load an image
  image1.src = 'textures/barrel.jpg';
  
  return true;
}

function sendTextureToTEXTURE0(image) {
  var texture = gl.createTexture();   // Create a texture object
  if (!texture) {
    console.log('Failed to create the texture object');
    return false;
  }
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1); // Flip the image's y axis
  // Enable texture unit0
  gl.activeTexture(gl.TEXTURE0);
  // Bind the texture object to the target
  gl.bindTexture(gl.TEXTURE_2D, texture);

  // Set the texture parameters
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  // Set the texture image
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);
  
  // Set the texture unit 0 to the sampler
  gl.uniform1i(u_Sampler0, 0);
  
  //gl.clear(gl.COLOR_BUFFER_BIT);   // Clear <canvas>

  //gl.drawArrays(gl.TRIANGLE_STRIP, 0, n); // Draw the rectangle
  console.log("finsihed load texture");
}

function sendTextureToTEXTURE1(image) {
  var texture = gl.createTexture();   
  if (!texture) {console.log('Failed to create the texture object');return false;}
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1); 
  gl.activeTexture(gl.TEXTURE1);
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);
  gl.uniform1i(u_Sampler1, 1);
  console.log("finsihed load texture");
}


function updateCameraFromYaw() {
  // keep the same distance from eye to at, just rotate in XZ
  const dx = g_at[0] - g_eye[0];
  const dz = g_at[2] - g_eye[2];
  const dist = Math.hypot(dx, dz) || 1;

  const nx = Math.sin(g_yaw) * dist;
  const nz = Math.cos(g_yaw) * dist;

  g_at[0] = g_eye[0] + nx;
  g_at[2] = g_eye[2] + nz;
}



function main() {
  if (!setupWebGL()) return;
  if (!connectVariablesToGLSL()) return;
  setupUI();

  initMouseRotation(canvas); // for mouse dragging

  //asgn3 world drag functions below 
  //gl.clear(gl.COLOR_BUFFER_BIT);
  //renderAllShapes();
  //canvas.onmousedown = (e) => { g_mouseDown = true; g_lastMouseX = e.clientX; };
  //canvas.onmouseup   = () => { g_mouseDown = false; g_lastMouseX = null; };
  //canvas.onmouseleave= () => { g_mouseDown = false; g_lastMouseX = null; };
  /*
  canvas.onmousemove = (e) => {
    if (!g_mouseDown) return;

    const dx = e.clientX - g_lastMouseX;
    g_lastMouseX = e.clientX;

    const sensitivity = 0.005;      // adjust feel
    g_yaw += dx * sensitivity;

    updateCameraFromYaw();
    //renderAllShapes();
  };*/
  /*
  canvas.onmousedown = click;
  // drag
  canvas.onmousemove = (ev) => {
    if (ev.buttons === 1) click(ev);
  };*/

  document.onkeydown = keydown;
  initTextures();

  /*buildFloorTiles(10);
  buildMap();
  buildMapBorder(-10, 8);*/


  //gl.clearColor(0, 0, 0, 1); // black
  gl.clearColor(0.7, 0.85, 1.0, 1.0); // light blue

  requestAnimationFrame(tick);
  
}

//main();