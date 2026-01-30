// BlockyAnimal.js (c) 2012 matsuda
// Vertex shader program
var VSHADER_SOURCE = `
  attribute vec4 a_Position;
  uniform mat4 u_ModelMatrix;
  uniform mat4 u_GlobalRotateMatrix;
  void main() {
    gl_Position = u_GlobalRotateMatrix * u_ModelMatrix * a_Position;
  }`

// Fragment shader program
var FSHADER_SOURCE = `
  precision mediump float;
  uniform vec4 u_FragColor;
  void main() {
    gl_FragColor = u_FragColor;
  }`

//Global variables
let canvas;
let gl;
let a_Position;
let u_FragColor;
let u_Size;
let u_ModelMatrix;
let u_GlobalRotateMatrix;

function setupWebGL() {
  // Retrieve <canvas> element
  canvas = document.getElementById('webgl');

  // Get the rendering context for WebGL
  //gl = getWebGLContext(canvas);
  gl = canvas.getContext("webgl", { preserveDrawingBuffer: true});
  if (!gl) {
    console.log('Failed to get the rendering context for WebGL');
    return;
  }

  gl.enable(gl.DEPTH_TEST);
}

function connectVariablesToGLSL() {
  // Initialize shaders
  if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
    console.log('Failed to intialize shaders.');
    return;
  }

  // // Get the storage location of a_Position
  a_Position = gl.getAttribLocation(gl.program, 'a_Position');
  if (a_Position < 0) {
    console.log('Failed to get the storage location of a_Position');
    return;
  }

  // Get the storage location of u_FragColor
  u_FragColor = gl.getUniformLocation(gl.program, 'u_FragColor');
  if (!u_FragColor) {
    console.log('Failed to get the storage location of u_FragColor');
    return;
  }

  // Get storage location of u_ModelMatrix
  u_ModelMatrix = gl.getUniformLocation(gl.program, 'u_ModelMatrix');
  if (!u_ModelMatrix) {
    console.log('Failed to get the storage location of u_ModelMatrix');
    return;
  }

  u_GlobalRotateMatrix = gl.getUniformLocation(gl.program, 'u_GlobalRotateMatrix');
  if (!u_GlobalRotateMatrix) {
    console.log('Failed to get the storage location of u_GlobalRotateMatrix');
    return;
  }

  // Set an initial value for this matrix to identity
  var identityM = new Matrix4();
  gl.uniformMatrix4fv(u_ModelMatrix, false, identityM.elements);
}

const POINT = 0;
const TRIANGLE = 1;
const CIRCLE = 2;

let g_selectedColor=[1.0,1.0,1.0,1.0];
let g_selectedSize=5;
let g_selectedType=POINT;
let g_yellowAnimation=true;
let g_magentaAnimation=true;
let g_magentaAngle=0;
let g_yellowAngle=0;
let g_globalAngle=0;
// Set up actions for HTML UI elements
function addActionsForHtmlUI() {
  document.getElementById('animationYellowOnButton').onclick = function() {g_yellowAnimation=true;};
  document.getElementById('animationYellowOffButton').onclick = function() {g_yellowAnimation=false;};
  document.getElementById('animationMagentaOnButton').onclick = function() {g_magentaAnimation=true;};
  document.getElementById('animationMagentaOffButton').onclick = function() {g_magentaAnimation=false;};

  document.getElementById('magentaSlide').addEventListener('mousemove', function() { g_magentaAngle = this.value; renderAllShapes(); });
  document.getElementById('yellowSlide').addEventListener('mousemove', function() { g_yellowAngle = this.value; renderAllShapes(); });

  document.getElementById('angleSlide').addEventListener('mousemove', function() { g_globalAngle = this.value; renderAllShapes(); });
}

function main() {
  // Set up canvas and gl variables
  setupWebGL();
  // Set up GLSL shader programs and connect GLSL variables
  connectVariablesToGLSL();
  // Set up actions for HTML UI elements
  addActionsForHtmlUI();

  // Register function (event handler) to be called on a mouse press
  canvas.onmousedown = click;
  canvas.onmousemove = function(ev) { if(ev.buttons == 1) { click(ev) } };

  // Specify the color for clearing <canvas>
  gl.clearColor(0.0, 0.0, 0.0, 1.0);

  // Clear <canvas>
  //gl.clear(gl.COLOR_BUFFER_BIT);
  //renderAllShapes();
  requestAnimationFrame(tick);
}

var g_startTime=performance.now()/1000.0;
var g_seconds=performance.now()/1000.0-g_startTime;

function tick() {
  // Save current time
  g_seconds=performance.now()/1000.0-g_startTime;
  console.log(g_seconds);

  // Update animation angles
  updateAnimationAngles();

  // Draw everthing
  renderAllShapes();

  // Tell browser to update again when it has time
  requestAnimationFrame(tick);
}

function updateAnimationAngles() {
  if (g_yellowAnimation) {
    g_yellowAngle = (45*Math.sin(g_seconds));
  }
  if (g_magentaAnimation) {
    g_magentaAngle = (-45*Math.sin(3*g_seconds));
  }
}

var g_shapesList = [];
function click(ev) {
  // Extract event click and return it in WebGL coordinates
  let [x, y] = convertCoordinatesEventToGL(ev);

  // Create and store new point
  let point;
  if (g_selectedType==POINT){
    point = new Point();
  } else if (g_selectedType==TRIANGLE) {
    point = new Triangle();
  } else {
    point = new Circle();
    point.segment = g_selectedSegments;
  }
  point.position=[x,y];
  point.color=g_selectedColor.slice();
  point.size=g_selectedSize;
  g_shapesList.push(point);

  // Draw every shape that is supposed to be in the canvas
  renderAllShapes();
}

function convertCoordinatesEventToGL(ev) {
  var x = ev.clientX; // x coordinate of a mouse pointer
  var y = ev.clientY; // y coordinate of a mouse pointer
  var rect = ev.target.getBoundingClientRect();

  x = ((x - rect.left) - canvas.width/2)/(canvas.width/2);
  y = (canvas.height/2 - (y - rect.top))/(canvas.height/2);

  return([x, y]);
}

function renderAllShapes() {
  // Check time at start of this function
  var startTime = performance.now();

  var globalRotMat = new Matrix4().rotate(g_globalAngle,0,1,0);
  gl.uniformMatrix4fv(u_GlobalRotateMatrix, false, globalRotMat.elements);

  // Clear <canvas>
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  gl.clear(gl.COLOR_BUFFER_BIT); 

  // Draw body cube
  var body = new Cube();
  body.color = [1,0,0,1];
  body.matrix.translate(-.25,-.75,0);
  body.matrix.rotate(-5,1,0,0);
  body.matrix.scale(.5,.3,.5);
  body.render();

  // Draw left arm
  var leftarm = new Cube();
  leftarm.color = [1,1,0,1];
  leftarm.matrix.setTranslate(0,-.5,0);
  leftarm.matrix.rotate(-5,1,0,0);
  leftarm.matrix.rotate(-g_yellowAngle,0,0,1); 
  var yellowCoordsMat = new Matrix4(leftarm.matrix);
  leftarm.matrix.scale(.25,.7,.5);
  leftarm.matrix.translate(-.5,0,0);
  leftarm.render();

  var box = new Cube();
  box.color = [1,0,1,1];
  box.matrix = yellowCoordsMat;
  box.matrix.translate(0,.65,0);
  box.matrix.rotate(g_magentaAngle,0,0,1);
  box.matrix.scale(.3,.3,.3);
  box.matrix.translate(-.5,0,-.001);
  box.render();

  var K = 10.0;
  for (var i=1; i<K; i++) {
    var c = new Cube();
    c.matrix.translate(-.8, 1.9*i/K-1.0, 0);
    c.matrix.rotate(g_seconds*100,1,1,1);
    c.matrix.scale(.1, .5/K, 1.0/K);
    c.render();
  }
  
  var duration = performance.now() - startTime;
  sendTextToHTML("ms: " + Math.floor(duration) + " fps: " + Math.floor(10000/duration)/10, "ms");
}

function sendTextToHTML(text, htmlID) {
  var htmlElm = document.getElementById(htmlID);
  if (!htmlElm) {
    console.log("Failed to get " + htmlID + " from HTML");
    return;
  }
  htmlElm.innerHTML = text;
}

// function drawMyPicture() {
//   gl.clear(gl.COLOR_BUFFER_BIT);
//   function drawTri(coords, color) {
//     gl.uniform4f(u_FragColor, color[0], color[1], color[2], color[3]);
//     drawTriangle(coords);
//   }

//   // Head
//   drawTri([-0.4, 0.3,  0.4, 0.3,  0.4, -0.1], [0.24,0.16,0,1]);
//   drawTri([-0.4, 0.3,  -0.4, -0.1,  0.4, -0.1], [0.24,0.16,0,1]);
//   drawTri([-0.4, 0.3,  -0.35, 0.4,  0.0, 0.3], [0.24,0.16,0,1]);
//   drawTri([-0.35, 0.4,  -0.05, 0.4,  0.0, 0.3], [0.24,0.16,0,1]);
//   drawTri([0.4, 0.3,  0.35, 0.4,  0.0, 0.3], [0.24,0.16,0,1]);
//   drawTri([0.35, 0.4,  0.05, 0.4,  0.0, 0.3], [0.24,0.16,0,1]);
//   drawTri([-0.4, -0.1,  -0.35, -0.2,  0.4, -0.1], [0.24,0.16,0,1]);
//   drawTri([-0.35, -0.2,  0.35, -0.2,  0.4, -0.1], [0.24,0.16,0,1]);

//   // Eyes & Mouth
//   drawTri([-0.3, 0.05,  -0.1, 0.05,  -0.1, 0.25], [0,0.14,0.04,1]);
//   drawTri([-0.3, 0.05,  -0.3, 0.25,  -0.1, 0.25], [0,0.14,0.04,1]);
//   drawTri([-0.3, 0.25,  -0.25, 0.3,  -0.1, 0.25], [0,0.14,0.04,1]);
//   drawTri([-0.15, 0.3,  -0.25, 0.3,  -0.1, 0.25], [0,0.14,0.04,1]);
//   drawTri([-0.3, 0.05,  -0.1, 0.05,  -0.25, 0.0], [0,0.14,0.04,1]);
//   drawTri([-0.15, 0.0,  -0.1, 0.05,  -0.25, 0.0], [0,0.14,0.04,1]);
//   drawTri([0.3, 0.05,  0.1, 0.05,  0.1, 0.25], [0,0.14,0.04,1]);
//   drawTri([0.3, 0.05,  0.3, 0.25,  0.1, 0.25], [0,0.14,0.04,1]);
//   drawTri([0.3, 0.25,  0.25, 0.3,  0.1, 0.25], [0,0.14,0.04,1]);
//   drawTri([0.15, 0.3,  0.25, 0.3,  0.1, 0.25], [0,0.14,0.04,1]);
//   drawTri([0.3, 0.05,  0.1, 0.05,  0.25, 0.0], [0,0.14,0.04,1]);
//   drawTri([0.15, 0.0,  0.1, 0.05,  0.25, 0.0], [0,0.14,0.04,1]);
//   drawTri([-0.2, 0.2,  -0.16, 0.23,  -0.125, 0.2], [0.8,0.36,0.36,1]);
//   drawTri([-0.2, 0.2,  -0.16, 0.12,  -0.125, 0.2], [0.8,0.36,0.36,1]);
//   drawTri([-0.2, 0.2,  -0.16, 0.12,  -0.2, 0.15], [0.8,0.36,0.36,1]);
//   drawTri([-0.125, 0.15,  -0.16, 0.12,  -0.125, 0.2], [0.8,0.36,0.36,1]);
//   drawTri([0.2, 0.2,  0.16, 0.23,  0.125, 0.2], [0.8,0.36,0.36,1]);
//   drawTri([0.2, 0.2,  0.16, 0.12,  0.125, 0.2], [0.8,0.36,0.36,1]);
//   drawTri([0.2, 0.2,  0.16, 0.12,  0.2, 0.15], [0.8,0.36,0.36,1]);
//   drawTri([0.125, 0.15,  0.16, 0.12,  0.125, 0.2], [0.8,0.36,0.36,1]);

//   drawTri([-0.05, -0.1,  0.0, -0.05,  0.05, -0.1], [0,0.14,0.04,1]);
//   drawTri([-0.05, -0.1,  0.0, -0.15,  0.05, -0.1], [0,0.14,0.04,1]);

//   // Horns
//   drawTri([-0.4, 0.0,  -0.4, 0.2,  -0.7, 0.0], [0.24,0.16,0,1]);
//   drawTri([-0.7, 0.2,  -0.4, 0.2,  -0.7, 0.0], [0.24,0.16,0,1]);
//   drawTri([-0.7, 0.2,  -0.8, 0.1,  -0.7, 0.0], [0.24,0.16,0,1]);
//   drawTri([-0.7, 0.2,  -0.65, 0.3,  -0.6, 0.2], [0.24,0.16,0,1]);
//   drawTri([-0.7, 0.2,  -0.65, 0.3,  -0.75, 0.3], [0.24,0.16,0,1]);
//   drawTri([-0.7, 0.2,  -0.8, 0.1,  -0.8, 0.4], [0.24,0.16,0,1]);
//   drawTri([-0.8, 0.2,  -0.9, 0.25,  -0.9, 0.4], [0.24,0.16,0,1]);
//   drawTri([-0.8, 0.2,  -0.8, 0.6,  -0.9, 0.4], [0.24,0.16,0,1]);

//   drawTri([0.4, 0.0,  0.4, 0.2,  0.7, 0.0], [0.24,0.16,0,1]);
//   drawTri([0.7, 0.2,  0.4, 0.2,  0.7, 0.0], [0.24,0.16,0,1]);
//   drawTri([0.7, 0.2,  0.8, 0.1,  0.7, 0.0], [0.24,0.16,0,1]);
//   drawTri([0.7, 0.2,  0.65, 0.3,  0.6, 0.2], [0.24,0.16,0,1]);
//   drawTri([0.7, 0.2,  0.65, 0.3,  0.75, 0.3], [0.24,0.16,0,1]);
//   drawTri([0.7, 0.2,  0.8, 0.1,  0.8, 0.4], [0.24,0.16,0,1]);
//   drawTri([0.8, 0.2,  0.9, 0.25,  0.9, 0.4], [0.24,0.16,0,1]);
//   drawTri([0.8, 0.2,  0.8, 0.6,  0.9, 0.4], [0.24,0.16,0,1]);

//   // Leaves
//   drawTri([0.8, 0.4,  0.7, 0.4,  0.6, 0.45], [0.2,0.29,0.13,1]);
//   drawTri([0.8, 0.4,  0.7, 0.45,  0.6, 0.45], [0.2,0.29,0.13,1]);
//   drawTri([-0.8, 0.4,  -0.7, 0.4,  -0.6, 0.45], [0.2,0.29,0.13,1]);
//   drawTri([-0.8, 0.4,  -0.7, 0.45,  -0.6, 0.45], [0.2,0.29,0.13,1]);
//   drawTri([0.8, 0.15,  0.9, 0.2,  1, 0.2], [0.2,0.29,0.13,1]);
//   drawTri([0.8, 0.15,  0.9, 0.15,  1, 0.2], [0.2,0.29,0.13,1]);
//   drawTri([-0.8, 0.15,  -0.9, 0.2,  -1, 0.2], [0.2,0.29,0.13,1]);
//   drawTri([-0.8, 0.15,  -0.9, 0.15,  -1, 0.2], [0.2,0.29,0.13,1]);


//   // Initials
//   drawTri([-0.2, -0.4,  -0.2, -0.6,  -0.1, -0.6], [0.2,0.24,0.0,1]);
//   drawTri([-0.2, -0.4,  -0.1, -0.35,  -0.1, -0.6], [0.2,0.24,0.0,1]);
//   drawTri([0.0, -0.45,  -0.1, -0.35,  -0.1, -0.55], [0.2,0.24,0.0,1]);
//   drawTri([-0.05, -0.5,  -0.05, -0.6,  -0.1, -0.55], [0.2,0.24,0.0,1]);
//   drawTri([-0.05, -0.5,  -0.05, -0.6,  0.0, -0.55], [0.2,0.24,0.0,1]);
//   drawTri([0.0, -0.6,  -0.05, -0.6,  0.0, -0.55], [0.2,0.24,0.0,1]);

//   drawTri([0.1, -0.35,  0.1, -0.45,  0.0, -0.4], [0.2,0.24,0.0,1]);
//   drawTri([0.1, -0.35,  0.1, -0.45,  0.2, -0.4], [0.2,0.24,0.0,1]);
//   drawTri([0.1, -0.5,  0.1, -0.6,  0.0, -0.55], [0.2,0.24,0.0,1]);
//   drawTri([0.1, -0.5,  0.1, -0.6,  0.2, -0.55], [0.2,0.24,0.0,1]);
//   drawTri([0.0, -0.55,  0.0, -0.5,  0.1, -0.5], [0.2,0.24,0.0,1]);
//   drawTri([0.2, -0.45,  0.2, -0.4,  0.1, -0.45], [0.2,0.24,0.0,1]);
//   drawTri([0.0, -0.4,  0.0, -0.45,  0.2, -0.5], [0.2,0.24,0.0,1]);
//   drawTri([0.2, -0.55,  0.0, -0.45,  0.2, -0.5], [0.2,0.24,0.0,1]);

//   // Head & Body Wisps
//   drawTri([-0.05, 0.4,  0.0, 0.3,  0.05, 0.4], [0,0.14,0.04,1]);
//   drawTri([-0.05, 0.4,  0.1, 0.4,  0.1, 0.5], [0,0.14,0.04,1]);
//   drawTri([0.2, 0.4,  0.1, 0.4,  0.1, 0.5], [0,0.14,0.04,1]);
//   drawTri([-0.05, 0.4,  0.05, 0.6,  0.1, 0.5], [0,0.14,0.04,1]);
//   drawTri([-0.05, 0.4,  -0.2, 0.4,  0.0, 0.5], [0,0.14,0.04,1]);
//   drawTri([-0.2, 0.5,  -0.2, 0.4,  0.0, 0.5], [0,0.14,0.04,1]);
//   drawTri([-0.2, 0.5,  0.0, 0.6,  0.0, 0.5], [0,0.14,0.04,1]);
//   drawTri([-0.2, 0.5,  0.0, 0.6,  -0.15, 0.6], [0,0.14,0.04,1]);
//   drawTri([-0.05, 0.7,  0.0, 0.6,  -0.15, 0.6], [0,0.14,0.04,1]);
//   drawTri([0.0, 0.5,  0.1, 0.7,  0.0, 0.8], [0,0.14,0.04,1]);
//   drawTri([0.0, 0.6,  -0.1, 0.8,  0.0, 0.9], [0,0.14,0.04,1]);

//   drawTri([-0.1, -0.2,  -0.2, -0.4,  -0.1, -0.35], [0,0.14,0.04,1]);
//   drawTri([-0.1, -0.2,  0.0, -0.4,  -0.1, -0.35], [0,0.14,0.04,1]);
//   drawTri([-0.1, -0.2,  0.0, -0.4,  0.1, -0.2], [0,0.14,0.04,1]);
//   drawTri([0.1, -0.2,  0.2, -0.4,  0.1, -0.35], [0,0.14,0.04,1]);
//   drawTri([0.1, -0.2,  0.0, -0.4,  0.1, -0.35], [0,0.14,0.04,1]);
//   drawTri([0.0, -0.45,  0.0, -0.4,  -0.1, -0.35], [0,0.14,0.04,1]);
//   drawTri([0.0, -0.45,  0.0, -0.55,  -0.05, -0.5], [0,0.14,0.04,1]);
//   drawTri([0.0, -0.45,  0.1, -0.5,  0.0, -0.5], [0,0.14,0.04,1]);
//   drawTri([0.2, -0.45,  0.1, -0.45,  0.2, -0.5], [0,0.14,0.04,1]);
//   drawTri([-0.1, -0.55,  -0.1, -0.6,  -0.05, -0.6], [0,0.14,0.04,1]);
//   drawTri([0.0, -0.55,  0.1, -0.6,  0.0, -0.6], [0,0.14,0.04,1]);
//   drawTri([0.2, -0.55,  0.1, -0.6,  0.2, -0.6], [0,0.14,0.04,1]);
//   drawTri([-0.1, -0.4,  -0.1, -0.5,  -0.05, -0.45], [0,0.14,0.04,1]);
//   drawTri([0.0, -0.8,  0.2, -0.6,  -0.2, -0.6], [0,0.14,0.04,1]);
//   drawTri([0.0, -0.8,  -0.15, -0.7,  -0.2, -0.6], [0,0.14,0.04,1]);
//   drawTri([0.0, -0.8,  0.2, -0.6,  0.2, -0.8], [0,0.14,0.04,1]);
//   drawTri([0.2, -0.8,  0.2, -0.6,  0.4, -0.7], [0,0.14,0.04,1]);
//   drawTri([0.45, -0.6,  0.2, -0.6,  0.4, -0.7], [0,0.14,0.04,1]);
//   drawTri([0.45, -0.6,  0.2, -0.6,  0.5, -0.5], [0,0.14,0.04,1]);
//   drawTri([0.45, -0.6,  0.6, -0.7,  0.5, -0.5], [0,0.14,0.04,1]);
//   drawTri([-0.2, -0.4,  -0.2, -0.5,  -0.35, -0.4], [0,0.14,0.04,1]);
//   drawTri([0.2, -0.4,  0.2, -0.5,  0.35, -0.4], [0,0.14,0.04,1]);
// }