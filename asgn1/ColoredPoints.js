// ColoredPoint.js (c) 2012 matsuda
// Vertex shader program
var VSHADER_SOURCE = `
  attribute vec4 a_Position;
  uniform float u_Size;
  void main() {
    gl_Position = a_Position;
    //gl_PointSize = 20.0;
    gl_PointSize = u_Size;
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

  // Get storage location of u_Size
  u_Size = gl.getUniformLocation(gl.program, 'u_Size');
  if (!u_Size) {
    console.log('Failed to get the storage location of u_Size');
    return;
  }
}

const POINT = 0;
const TRIANGLE = 1;
const CIRCLE = 2;

let g_selectedColor=[1.0,1.0,1.0,1.0];
let g_selectedSize=5;
let g_selectedType=POINT;
let g_selectedSegments=10;
// Set up actions for HTML UI elements
function addActionsForHtmlUI() {
  document.getElementById('green').onclick = function() {g_selectedColor = [0.0, 1.0, 0.0, 1.0]; };
  document.getElementById('red').onclick = function() {g_selectedColor = [1.0, 0.0, 0.0, 1.0]; };
  document.getElementById('clearButton').onclick = function() {g_shapesList=[]; renderAllShapes(); };

  document.getElementById('pointButton').onclick = function() {g_selectedType=POINT};
  document.getElementById('triButton').onclick = function() {g_selectedType=TRIANGLE};
  document.getElementById('circleButton').onclick = function() {g_selectedType=CIRCLE};
  document.getElementById('drawPictureButton').onclick = function() {drawMyPicture(); };

  document.getElementById('redSlide').addEventListener('mouseup', function() { g_selectedColor[0] = this.value/100; });
  document.getElementById('greenSlide').addEventListener('mouseup', function() { g_selectedColor[1] = this.value/100; });
  document.getElementById('blueSlide').addEventListener('mouseup', function() { g_selectedColor[2] = this.value/100; });

  document.getElementById('sizeSlide').addEventListener('mouseup', function() { g_selectedSize = this.value; });
  document.getElementById('segmentSlide').addEventListener('mouseup', function() { g_selectedSegments = this.value; });
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
  gl.clear(gl.COLOR_BUFFER_BIT);
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

  // Clear <canvas>
  gl.clear(gl.COLOR_BUFFER_BIT);

  var len = g_shapesList.length;
  for(var i = 0; i < len; i++) {
    g_shapesList[i].render();
  }

  var duration = performance.now() - startTime;
  sendTextToHTML("numdot: " + len + " ms: " + Math.floor(duration) + " fps: " + Math.floor(10000/duration) );
}

function sendTextToHTML(text, htmlID) {
  var htmlElm = document.getElementById(htmlID);
  if (!htmlElm) {
    console.log("Failed to get " + htmlID + " from HTML");
    return;
  }
  htmlElm.innerHTML = text;
}

function drawMyPicture() {
  gl.clear(gl.COLOR_BUFFER_BIT);
  function drawTri(coords, color) {
    gl.uniform4f(u_FragColor, color[0], color[1], color[2], color[3]);
    drawTriangle(coords);
  }

  // Head
  drawTri([-0.4, 0.3,  0.4, 0.3,  0.4, -0.1], [0.24,0.16,0,1]);
  drawTri([-0.4, 0.3,  -0.4, -0.1,  0.4, -0.1], [0.24,0.16,0,1]);
  drawTri([-0.4, 0.3,  -0.35, 0.4,  0.0, 0.3], [0.24,0.16,0,1]);
  drawTri([-0.35, 0.4,  -0.05, 0.4,  0.0, 0.3], [0.24,0.16,0,1]);
  drawTri([0.4, 0.3,  0.35, 0.4,  0.0, 0.3], [0.24,0.16,0,1]);
  drawTri([0.35, 0.4,  0.05, 0.4,  0.0, 0.3], [0.24,0.16,0,1]);
  drawTri([-0.4, -0.1,  -0.35, -0.2,  0.4, -0.1], [0.24,0.16,0,1]);
  drawTri([-0.35, -0.2,  0.35, -0.2,  0.4, -0.1], [0.24,0.16,0,1]);

  // Eyes & Mouth
  drawTri([-0.3, 0.05,  -0.1, 0.05,  -0.1, 0.25], [0,0.14,0.04,1]);
  drawTri([-0.3, 0.05,  -0.3, 0.25,  -0.1, 0.25], [0,0.14,0.04,1]);
  drawTri([-0.3, 0.25,  -0.25, 0.3,  -0.1, 0.25], [0,0.14,0.04,1]);
  drawTri([-0.15, 0.3,  -0.25, 0.3,  -0.1, 0.25], [0,0.14,0.04,1]);
  drawTri([-0.3, 0.05,  -0.1, 0.05,  -0.25, 0.0], [0,0.14,0.04,1]);
  drawTri([-0.15, 0.0,  -0.1, 0.05,  -0.25, 0.0], [0,0.14,0.04,1]);
  drawTri([0.3, 0.05,  0.1, 0.05,  0.1, 0.25], [0,0.14,0.04,1]);
  drawTri([0.3, 0.05,  0.3, 0.25,  0.1, 0.25], [0,0.14,0.04,1]);
  drawTri([0.3, 0.25,  0.25, 0.3,  0.1, 0.25], [0,0.14,0.04,1]);
  drawTri([0.15, 0.3,  0.25, 0.3,  0.1, 0.25], [0,0.14,0.04,1]);
  drawTri([0.3, 0.05,  0.1, 0.05,  0.25, 0.0], [0,0.14,0.04,1]);
  drawTri([0.15, 0.0,  0.1, 0.05,  0.25, 0.0], [0,0.14,0.04,1]);
  drawTri([-0.2, 0.2,  -0.16, 0.23,  -0.125, 0.2], [0.8,0.36,0.36,1]);
  drawTri([-0.2, 0.2,  -0.16, 0.12,  -0.125, 0.2], [0.8,0.36,0.36,1]);
  drawTri([-0.2, 0.2,  -0.16, 0.12,  -0.2, 0.15], [0.8,0.36,0.36,1]);
  drawTri([-0.125, 0.15,  -0.16, 0.12,  -0.125, 0.2], [0.8,0.36,0.36,1]);
  drawTri([0.2, 0.2,  0.16, 0.23,  0.125, 0.2], [0.8,0.36,0.36,1]);
  drawTri([0.2, 0.2,  0.16, 0.12,  0.125, 0.2], [0.8,0.36,0.36,1]);
  drawTri([0.2, 0.2,  0.16, 0.12,  0.2, 0.15], [0.8,0.36,0.36,1]);
  drawTri([0.125, 0.15,  0.16, 0.12,  0.125, 0.2], [0.8,0.36,0.36,1]);

  drawTri([-0.05, -0.1,  0.0, -0.05,  0.05, -0.1], [0,0.14,0.04,1]);
  drawTri([-0.05, -0.1,  0.0, -0.15,  0.05, -0.1], [0,0.14,0.04,1]);

  // Horns
  drawTri([-0.4, 0.0,  -0.4, 0.2,  -0.7, 0.0], [0.24,0.16,0,1]);
  drawTri([-0.7, 0.2,  -0.4, 0.2,  -0.7, 0.0], [0.24,0.16,0,1]);
  drawTri([-0.7, 0.2,  -0.8, 0.1,  -0.7, 0.0], [0.24,0.16,0,1]);
  drawTri([-0.7, 0.2,  -0.65, 0.3,  -0.6, 0.2], [0.24,0.16,0,1]);
  drawTri([-0.7, 0.2,  -0.65, 0.3,  -0.75, 0.3], [0.24,0.16,0,1]);
  drawTri([-0.7, 0.2,  -0.8, 0.1,  -0.8, 0.4], [0.24,0.16,0,1]);
  drawTri([-0.8, 0.2,  -0.9, 0.25,  -0.9, 0.4], [0.24,0.16,0,1]);
  drawTri([-0.8, 0.2,  -0.8, 0.6,  -0.9, 0.4], [0.24,0.16,0,1]);

  drawTri([0.4, 0.0,  0.4, 0.2,  0.7, 0.0], [0.24,0.16,0,1]);
  drawTri([0.7, 0.2,  0.4, 0.2,  0.7, 0.0], [0.24,0.16,0,1]);
  drawTri([0.7, 0.2,  0.8, 0.1,  0.7, 0.0], [0.24,0.16,0,1]);
  drawTri([0.7, 0.2,  0.65, 0.3,  0.6, 0.2], [0.24,0.16,0,1]);
  drawTri([0.7, 0.2,  0.65, 0.3,  0.75, 0.3], [0.24,0.16,0,1]);
  drawTri([0.7, 0.2,  0.8, 0.1,  0.8, 0.4], [0.24,0.16,0,1]);
  drawTri([0.8, 0.2,  0.9, 0.25,  0.9, 0.4], [0.24,0.16,0,1]);
  drawTri([0.8, 0.2,  0.8, 0.6,  0.9, 0.4], [0.24,0.16,0,1]);

  // Leaves
  drawTri([0.8, 0.4,  0.7, 0.4,  0.6, 0.45], [0.2,0.29,0.13,1]);
  drawTri([0.8, 0.4,  0.7, 0.45,  0.6, 0.45], [0.2,0.29,0.13,1]);
  drawTri([-0.8, 0.4,  -0.7, 0.4,  -0.6, 0.45], [0.2,0.29,0.13,1]);
  drawTri([-0.8, 0.4,  -0.7, 0.45,  -0.6, 0.45], [0.2,0.29,0.13,1]);
  drawTri([0.8, 0.15,  0.9, 0.2,  1, 0.2], [0.2,0.29,0.13,1]);
  drawTri([0.8, 0.15,  0.9, 0.15,  1, 0.2], [0.2,0.29,0.13,1]);
  drawTri([-0.8, 0.15,  -0.9, 0.2,  -1, 0.2], [0.2,0.29,0.13,1]);
  drawTri([-0.8, 0.15,  -0.9, 0.15,  -1, 0.2], [0.2,0.29,0.13,1]);


  // Initials
  drawTri([-0.2, -0.4,  -0.2, -0.6,  -0.1, -0.6], [0.2,0.24,0.0,1]);
  drawTri([-0.2, -0.4,  -0.1, -0.35,  -0.1, -0.6], [0.2,0.24,0.0,1]);
  drawTri([0.0, -0.45,  -0.1, -0.35,  -0.1, -0.55], [0.2,0.24,0.0,1]);
  drawTri([-0.05, -0.5,  -0.05, -0.6,  -0.1, -0.55], [0.2,0.24,0.0,1]);
  drawTri([-0.05, -0.5,  -0.05, -0.6,  0.0, -0.55], [0.2,0.24,0.0,1]);
  drawTri([0.0, -0.6,  -0.05, -0.6,  0.0, -0.55], [0.2,0.24,0.0,1]);

  drawTri([0.1, -0.35,  0.1, -0.45,  0.0, -0.4], [0.2,0.24,0.0,1]);
  drawTri([0.1, -0.35,  0.1, -0.45,  0.2, -0.4], [0.2,0.24,0.0,1]);
  drawTri([0.1, -0.5,  0.1, -0.6,  0.0, -0.55], [0.2,0.24,0.0,1]);
  drawTri([0.1, -0.5,  0.1, -0.6,  0.2, -0.55], [0.2,0.24,0.0,1]);
  drawTri([0.0, -0.55,  0.0, -0.5,  0.1, -0.5], [0.2,0.24,0.0,1]);
  drawTri([0.2, -0.45,  0.2, -0.4,  0.1, -0.45], [0.2,0.24,0.0,1]);
  drawTri([0.0, -0.4,  0.0, -0.45,  0.2, -0.5], [0.2,0.24,0.0,1]);
  drawTri([0.2, -0.55,  0.0, -0.45,  0.2, -0.5], [0.2,0.24,0.0,1]);

  // Head & Body Wisps
  drawTri([-0.05, 0.4,  0.0, 0.3,  0.05, 0.4], [0,0.14,0.04,1]);
  drawTri([-0.05, 0.4,  0.1, 0.4,  0.1, 0.5], [0,0.14,0.04,1]);
  drawTri([0.2, 0.4,  0.1, 0.4,  0.1, 0.5], [0,0.14,0.04,1]);
  drawTri([-0.05, 0.4,  0.05, 0.6,  0.1, 0.5], [0,0.14,0.04,1]);
  drawTri([-0.05, 0.4,  -0.2, 0.4,  0.0, 0.5], [0,0.14,0.04,1]);
  drawTri([-0.2, 0.5,  -0.2, 0.4,  0.0, 0.5], [0,0.14,0.04,1]);
  drawTri([-0.2, 0.5,  0.0, 0.6,  0.0, 0.5], [0,0.14,0.04,1]);
  drawTri([-0.2, 0.5,  0.0, 0.6,  -0.15, 0.6], [0,0.14,0.04,1]);
  drawTri([-0.05, 0.7,  0.0, 0.6,  -0.15, 0.6], [0,0.14,0.04,1]);
  drawTri([0.0, 0.5,  0.1, 0.7,  0.0, 0.8], [0,0.14,0.04,1]);
  drawTri([0.0, 0.6,  -0.1, 0.8,  0.0, 0.9], [0,0.14,0.04,1]);

  drawTri([-0.1, -0.2,  -0.2, -0.4,  -0.1, -0.35], [0,0.14,0.04,1]);
  drawTri([-0.1, -0.2,  0.0, -0.4,  -0.1, -0.35], [0,0.14,0.04,1]);
  drawTri([-0.1, -0.2,  0.0, -0.4,  0.1, -0.2], [0,0.14,0.04,1]);
  drawTri([0.1, -0.2,  0.2, -0.4,  0.1, -0.35], [0,0.14,0.04,1]);
  drawTri([0.1, -0.2,  0.0, -0.4,  0.1, -0.35], [0,0.14,0.04,1]);
  drawTri([0.0, -0.45,  0.0, -0.4,  -0.1, -0.35], [0,0.14,0.04,1]);
  drawTri([0.0, -0.45,  0.0, -0.55,  -0.05, -0.5], [0,0.14,0.04,1]);
  drawTri([0.0, -0.45,  0.1, -0.5,  0.0, -0.5], [0,0.14,0.04,1]);
  drawTri([0.2, -0.45,  0.1, -0.45,  0.2, -0.5], [0,0.14,0.04,1]);
  drawTri([-0.1, -0.55,  -0.1, -0.6,  -0.05, -0.6], [0,0.14,0.04,1]);
  drawTri([0.0, -0.55,  0.1, -0.6,  0.0, -0.6], [0,0.14,0.04,1]);
  drawTri([0.2, -0.55,  0.1, -0.6,  0.2, -0.6], [0,0.14,0.04,1]);
  drawTri([-0.1, -0.4,  -0.1, -0.5,  -0.05, -0.45], [0,0.14,0.04,1]);
  drawTri([0.0, -0.8,  0.2, -0.6,  -0.2, -0.6], [0,0.14,0.04,1]);
  drawTri([0.0, -0.8,  -0.15, -0.7,  -0.2, -0.6], [0,0.14,0.04,1]);
  drawTri([0.0, -0.8,  0.2, -0.6,  0.2, -0.8], [0,0.14,0.04,1]);
  drawTri([0.2, -0.8,  0.2, -0.6,  0.4, -0.7], [0,0.14,0.04,1]);
  drawTri([0.45, -0.6,  0.2, -0.6,  0.4, -0.7], [0,0.14,0.04,1]);
  drawTri([0.45, -0.6,  0.2, -0.6,  0.5, -0.5], [0,0.14,0.04,1]);
  drawTri([0.45, -0.6,  0.6, -0.7,  0.5, -0.5], [0,0.14,0.04,1]);
  drawTri([-0.2, -0.4,  -0.2, -0.5,  -0.35, -0.4], [0,0.14,0.04,1]);
  drawTri([0.2, -0.4,  0.2, -0.5,  0.35, -0.4], [0,0.14,0.04,1]);
}