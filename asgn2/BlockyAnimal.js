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
let g_upperArmAnimation=true;
let g_upperLegAnimation=true;
let g_lowerLeg1Animation=true;
let g_lowerLeg2Animation=true;
let g_tailAnimation=true;
let g_footAnimation=true;
let g_upperArmAngle=0;
let g_upperLegAngle=0;
let g_lowerLeg1Angle=0;
let g_lowerLeg2Angle=0;
let g_tailAngle=0;
let g_footAngle=0;
let g_globalAngle=0;
let g_zoom=0;

// Set up actions for HTML UI elements
function addActionsForHtmlUI() {
  document.getElementById('animationYellowOnButton').onclick = function() {g_upperArmAnimation=true;};
  document.getElementById('animationYellowOffButton').onclick = function() {g_upperArmAnimation=false;};
  document.getElementById('animationMagentaOnButton').onclick = function() {g_upperLegAnimation=true;};
  document.getElementById('animationMagentaOffButton').onclick = function() {g_upperLegAnimation=false;};
  document.getElementById('animationLowerLeg1OnButton').onclick = function() {g_lowerLeg1Animation=true;};
  document.getElementById('animationLowerLeg1OffButton').onclick = function() {g_lowerLeg1Animation=false;};
  document.getElementById('animationLowerLeg2OnButton').onclick = function() {g_lowerLeg2Animation=true;};
  document.getElementById('animationLowerLeg2OffButton').onclick = function() {g_lowerLeg2Animation=false;};
  document.getElementById('animationTailOnButton').onclick = function() {g_tailAnimation=true;};
  document.getElementById('animationTailOffButton').onclick = function() {g_tailAnimation=false;};
  document.getElementById('animationFootOnButton').onclick = function() {g_footAnimation=true;};
  document.getElementById('animationFootOffButton').onclick = function() {g_footAnimation=false;};

  document.getElementById('upperArmSlide').addEventListener('mousemove', function() { g_upperArmAngle = this.value; renderAllShapes(); });
  document.getElementById('upperLegSlide').addEventListener('mousemove', function() { g_upperLegAngle = this.value; renderAllShapes(); });
  document.getElementById('lowerLeg1Slide').addEventListener('mousemove', function() { g_lowerLeg1Angle = this.value; renderAllShapes(); });
  document.getElementById('lowerLeg2Slide').addEventListener('mousemove', function() { g_lowerLeg2Angle = this.value; renderAllShapes(); });
  document.getElementById('tailSlide').addEventListener('mousemove', function() { g_tailAngle = this.value; renderAllShapes(); });
  document.getElementById('footSlide').addEventListener('mousemove', function() { g_footAngle = this.value; renderAllShapes(); });

  document.getElementById('angleSlide').addEventListener('mousemove', function() { g_globalAngle = this.value; renderAllShapes(); });
  document.getElementById('zoomSlide').addEventListener('mousemove', function() { g_zoom = this.value; renderAllShapes(); });
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
  //scaling g_seconds increases frequency
  g_seconds = 4*g_seconds;
  if (g_upperArmAnimation) {
    g_upperArmAngle = (22.5-22.5*Math.sin(g_seconds)); 
  }
  if (g_upperLegAnimation) {
    g_upperLegAngle = (17.5+17.5*Math.cos(g_seconds));
  }
  if (g_lowerLeg1Animation) {
    g_lowerLeg1Angle = (10-10*Math.cos(g_seconds));
  }
  if (g_lowerLeg2Animation) {
    g_lowerLeg2Angle = (5-5*Math.cos(g_seconds));
  }
  if (g_footAnimation) {
    g_footAngle = (25+25*Math.cos(g_seconds));
  }
  if (g_tailAnimation) {
    g_tailAngle = (-45*Math.sin(g_seconds));
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
  globalRotMat.translate(0, 0, g_zoom/45);
  gl.uniformMatrix4fv(u_GlobalRotateMatrix, false, globalRotMat.elements);

  // Clear <canvas>
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  gl.clear(gl.COLOR_BUFFER_BIT); 

  // Set uniform color variable
  var uniformColor = [.25,.22,.22,1];

  // Draw body cube
  var body = new Cube();
  body.color = uniformColor;
  body.matrix.translate(-.15,-.3,-.4);
  body.matrix.rotate(0,1,0,0);
  body.matrix.scale(.3,.45,1.2);
  body.render();

  // Draw left fore leg
  var leftarm = new Cube();
  leftarm.color = uniformColor;
  leftarm.matrix.setTranslate(.1,-.1,-.33);
  //leftarm.matrix.rotate(0,1,0,0);
  leftarm.matrix.rotate(180-g_upperArmAngle,1,0,0); 
  var lForearm = new Matrix4(leftarm.matrix);
  leftarm.matrix.scale(.12,.45,-.2);
  leftarm.render();

  var leftForearm = new Cube();
  leftForearm.color = uniformColor;
  leftForearm.matrix = new Matrix4(lForearm);
  leftForearm.matrix.translate(0,.35,0);
  leftForearm.matrix.rotate(g_upperArmAngle,1,0,0);
  var lPaw = new Matrix4(leftForearm.matrix);
  leftForearm.matrix.translate(0,-.07,0);
  leftForearm.matrix.scale(.12,.4,-.2);
  leftForearm.render();

  var leftPaw = new Cube();
  leftPaw.color = uniformColor;
  leftPaw.matrix = new Matrix4(lPaw);
  leftPaw.matrix.translate(0,.28,-.13);
  leftPaw.matrix.rotate(180-g_upperArmAngle,1,0,0);
  leftPaw.matrix.translate(0,-.07,0);
  leftPaw.matrix.scale(.12,.1,-.24);
  leftPaw.render();

  // Draw right fore leg
  var rightarm = new Cube();
  rightarm.color = uniformColor;
  rightarm.matrix.setTranslate(-0.1,-.1,-.33);
  //rightarm.matrix.rotate(-5,1,0,0);
  rightarm.matrix.rotate(135+g_upperArmAngle,1,0,0); 
  var rForearm = new Matrix4(rightarm.matrix);
  rightarm.matrix.scale(-.12,.45,-.2);
  rightarm.render();

  var rightForearm = new Cube();
  rightForearm.color = uniformColor;
  rightForearm.matrix = new Matrix4(rForearm);
  rightForearm.matrix.translate(0,.35,0);
  rightForearm.matrix.rotate(45-g_upperArmAngle,1,0,0);
  var rPaw = new Matrix4(rightForearm.matrix);
  rightForearm.matrix.translate(0,-.07,0);
  rightForearm.matrix.scale(-.12,.4,-.2);
  rightForearm.render();

  var rightPaw = new Cube();
  rightPaw.color = uniformColor;
  rightPaw.matrix = new Matrix4(rPaw);
  rightPaw.matrix.translate(0,.28,-.13);
  rightPaw.matrix.rotate(135+g_upperArmAngle,1,0,0);
  rightPaw.matrix.translate(0,-.07,0);
  rightPaw.matrix.scale(-.12,.1,-.24);
  rightPaw.render();

  // Draw left hind leg
  var leftleg = new Cube();
  leftleg.color = uniformColor;
  leftleg.matrix.setTranslate(0.1,0,0.7);
  leftleg.matrix.rotate(180+g_upperLegAngle,1,0,0);
  var lHindleg1 = new Matrix4(leftleg.matrix);
  leftleg.matrix.translate(0,-.07,.15);
  leftleg.matrix.scale(.14,.55,-.25);
  leftleg.render();

  var leftHindleg1 = new Cube();
  leftHindleg1.color = uniformColor;
  leftHindleg1.matrix = new Matrix4(lHindleg1);
  leftHindleg1.matrix.translate(.01,.51,.08);
  leftHindleg1.matrix.rotate(270+g_lowerLeg1Angle,1,0,0);
  var lHindleg2 = new Matrix4(leftHindleg1.matrix);
  leftHindleg1.matrix.translate(0,-.07,0);
  leftHindleg1.matrix.scale(.12,.4,-.2);
  leftHindleg1.render();

  var leftHindleg2 = new Cube();
  leftHindleg2.color = uniformColor;
  leftHindleg2.matrix = new Matrix4(lHindleg2);
  leftHindleg2.matrix.translate(.01,.23,-.12);
  leftHindleg2.matrix.rotate(95-g_lowerLeg2Angle,1,0,0);
  var lFoot = new Matrix4(leftHindleg2.matrix);
  leftHindleg2.matrix.translate(0,-.07,.02);
  leftHindleg2.matrix.scale(.1,.4,-.15);
  leftHindleg2.render();

  // var leftFoot = new Cube();
  // leftFoot.color = [1,1,0,1];
  // leftFoot.matrix = new Matrix4(lFoot);
  // leftFoot.matrix.translate(0,.26,-.03);
  // leftFoot.matrix.rotate(g_footAngle,1,0,0);
  // //leftFoot.matrix.translate(0,.2,-.15);
  // leftFoot.matrix.scale(.1,.2,-.1);
  // leftFoot.render();

  // Draw right hind leg
  var rightleg = new Cube();
  rightleg.color = uniformColor;
  rightleg.matrix.setTranslate(-.24,0,0.7);
  rightleg.matrix.rotate(215-g_upperLegAngle,1,0,0);
  var rHindleg1 = new Matrix4(rightleg.matrix);
  rightleg.matrix.translate(0,-.07,.15);
  rightleg.matrix.scale(.14,.55,-.25);
  rightleg.render();

  var rightHindleg1 = new Cube();
  rightHindleg1.color = uniformColor;
  rightHindleg1.matrix = new Matrix4(rHindleg1);
  rightHindleg1.matrix.translate(.01,.51,.08);
  rightHindleg1.matrix.rotate(290-g_lowerLeg1Angle,1,0,0);
  var rHindleg2 = new Matrix4(rightHindleg1.matrix);
  rightHindleg1.matrix.translate(0,-.07,0);
  rightHindleg1.matrix.scale(.12,.4,-.2);
  rightHindleg1.render();

  var rightHindleg2 = new Cube();
  rightHindleg2.color = uniformColor;
  rightHindleg2.matrix = new Matrix4(rHindleg2);
  rightHindleg2.matrix.translate(.01,.23,-.12);
  rightHindleg2.matrix.rotate(90-g_lowerLeg2Angle,1,0,0);
  var rFoot = new Matrix4(rightHindleg2.matrix);
  rightHindleg2.matrix.translate(0,-.07,.02);
  rightHindleg2.matrix.scale(.1,.4,-.15);
  rightHindleg2.render();

  // var rightFoot = new Cube();
  // rightFoot.color = [1,0,1,1];
  // rightFoot.matrix = new Matrix4(rFoot);
  // rightFoot.matrix.translate(0,-.18,.075);
  // rightFoot.matrix.rotate(g_footAngle,1,0,0);
  // rightFoot.matrix.translate(0,.2,-.15);
  // rightFoot.matrix.scale(.1,.2,-.1);
  // rightFoot.render();

  // Draw head
  var head = new Cube();
  head.color = uniformColor;
  head.matrix.setTranslate(-.185,.03,-.66);
  var box = new Matrix4(head.matrix);
  head.matrix.rotate(0,0,1,0);
  head.matrix.scale(.375,.33,.375);
  head.render();

  var leftEye = new Cube();
  leftEye.color = [1,1,0,1];
  leftEye.matrix = new Matrix4(box);
  leftEye.matrix.translate(0.06, 0.17, -0.01);
  leftEye.matrix.scale(0.07, 0.07, 0.01);
  leftEye.render();

  var rightEye = new Cube();
  rightEye.color = [1,1,0,1];
  rightEye.matrix = new Matrix4(box);
  rightEye.matrix.translate(0.25, 0.17, -0.01);
  rightEye.matrix.scale(0.07, 0.07, 0.01);
  rightEye.render();

  var nose = new Cube();
  nose.color = uniformColor;
  nose.matrix = new Matrix4(box);
  nose.matrix.translate(.11,.03,-.075);
  nose.matrix.rotate(0,0,1,0);
  var box2 = new Matrix4(nose.matrix);
  nose.matrix.scale(.15,.12,.075);
  nose.render();

  var leftEar = new Cube();
  leftEar.color = uniformColor;
  leftEar.matrix = new Matrix4(box2);
  leftEar.matrix.translate(-.1,.28,.35);
  leftEar.matrix.rotate(-50,0,0,1);
  leftEar.matrix.scale(.26,.07,.09);
  leftEar.matrix.rotate(50,0,0,1);
  leftEar.render();

  var rightEar = new Cube();
  rightEar.color = uniformColor;
  rightEar.matrix = new Matrix4(box2);
  rightEar.matrix.translate(.1,.18,.35);
  rightEar.matrix.rotate(50,0,0,1);
  rightEar.matrix.scale(.26,.07,.09);
  rightEar.matrix.rotate(-50,0,0,1);
  rightEar.render();

  // Draw tail
  var tail1 = new Cylinder();
  tail1.color = uniformColor;
  tail1.matrix.setTranslate(0, .1, .7);
  tail1.matrix.rotate(-g_tailAngle,0,1,0);
  var t2 = new Matrix4(tail1.matrix);
  tail1.matrix.rotate(65,1,0,0);
  tail1.matrix.scale(.07,.4,.07);
  tail1.render();

  var tail2 = new Cylinder();
  tail2.color = uniformColor;
  tail2.matrix = t2;
  tail2.matrix.translate(0, .14, .32);
  tail2.matrix.rotate(45,1,0,0);
  tail2.matrix.scale(.05,.3,.05);
  tail2.render();

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