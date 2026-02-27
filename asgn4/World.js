// World.js (c) 2012 matsuda
// Vertex shader program
var VSHADER_SOURCE = `
  precision mediump float;
  attribute vec4 a_Position;
  attribute vec2 a_UV;
  attribute vec3 a_Normal;
  varying vec2 v_UV;
  varying vec3 v_Normal;
  uniform mat4 u_ModelMatrix;
  uniform mat4 u_GlobalRotateMatrix;
  uniform mat4 u_ViewMatrix;
  uniform mat4 u_ProjectionMatrix;
  void main() {
    gl_Position = u_ProjectionMatrix * u_ViewMatrix * u_GlobalRotateMatrix * u_ModelMatrix * a_Position;
    v_UV = a_UV;
    v_Normal = a_Normal;
  }`

// Fragment shader program
var FSHADER_SOURCE = `
  precision mediump float;
  varying vec2 v_UV;
  varying vec3 v_Normal;
  uniform vec4 u_FragColor;
  uniform sampler2D u_Sampler0;
  uniform sampler2D u_Sampler1;
  uniform sampler2D u_Sampler2;
  uniform int u_whichTexture;
  void main() {
    if (u_whichTexture == -3) {                          // Use normal
      gl_FragColor = vec4((v_Normal+1.0)/2.0, 1.0);
    } else if (u_whichTexture == -2) {                   // Use color
      gl_FragColor = u_FragColor;
    } else if (u_whichTexture == -1) {            // Use UV debug color
      gl_FragColor = vec4(v_UV,1.0,1.0);
    } else if (u_whichTexture == 0) {             // Use Texture0 = sky.jpg
      gl_FragColor = texture2D(u_Sampler0, v_UV);
    } else if (u_whichTexture == 1) {             // Use Texture1 = stone wall.jpg
      gl_FragColor = texture2D(u_Sampler1, v_UV);
    } else if (u_whichTexture == 2) {             // Use Texture2 = grass.jpg
      gl_FragColor = texture2D(u_Sampler2, v_UV);
    } else {                                      // Error, put Redish
      gl_FragColor = vec4(1,.2,.2,1);  
    }
  }`

//Global variables
let canvas;
let gl;
let a_Position;
let a_UV;
let a_Normal;
let u_FragColor;
let u_Size;
let u_ModelMatrix;
let u_GlobalRotateMatrix;
let u_ViewMatrix;
let u_ProjectionMatrix;
let u_whichTexture;
let u_Sampler0;
let u_Sampler1;
let u_Sampler2;

function setupWebGL() {
  // Retrieve <canvas> element
  canvas = document.getElementById('webgl');

  // Get the rendering context for WebGL
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

  // Get the storage location of a_Position
  a_Position = gl.getAttribLocation(gl.program, 'a_Position');
  if (a_Position < 0) {
    console.log('Failed to get the storage location of a_Position');
    return;
  }

  // Get storage location of a_UV
  a_UV = gl.getAttribLocation(gl.program, 'a_UV');
  if (a_UV < 0) {
    console.log('Failed to get the storage location of a_UV');
    return;
  }

  a_Normal = gl.getAttribLocation(gl.program, 'a_Normal');
  if (a_Normal < 0) {
    console.log('Failed to get the storage location of a_Normal');
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

  u_ViewMatrix = gl.getUniformLocation(gl.program, 'u_ViewMatrix');
  if (!u_ViewMatrix) {
    console.log('Failed to get the storage location of u_ViewMatrix');
    return;
  }

  u_ProjectionMatrix = gl.getUniformLocation(gl.program, 'u_ProjectionMatrix');
  if (!u_ProjectionMatrix) {
    console.log('Failed to get the storage location of u_ProjectionMatrix');
    return;
  }

  u_whichTexture = gl.getUniformLocation(gl.program, 'u_whichTexture');
  if (!u_whichTexture) {
    console.log('Failed to get storage location of u_whichTexture');
    return false;
  }

  u_Sampler0 = gl.getUniformLocation(gl.program, 'u_Sampler0');
  if (!u_Sampler0) {
    console.log('Failed to get storage location of u_Sampler0');
    return false;
  }

  u_Sampler1 = gl.getUniformLocation(gl.program, 'u_Sampler1');
  if (!u_Sampler1) {
    console.log('Failed to get storage location of u_Sampler1');
    return false;
  }

  u_Sampler2 = gl.getUniformLocation(gl.program, 'u_Sampler2');
  if (!u_Sampler2) {
    console.log('Failed to get storage location of u_Sampler2');
    return false;
  }

  // Set an initial value for this matrix to identity
  var identityM = new Matrix4();
  gl.uniformMatrix4fv(u_ModelMatrix, false, identityM.elements);
}

const IDLE_UPPER_ARM = 0;
const IDLE_UPPER_LEG = 0;
const IDLE_LOWER_LEG1 = 0;
const IDLE_LOWER_LEG2 = 0;
const IDLE_FOOT = 0;
const IDLE_TAIL = 0;

let g_animations=false;
let g_upperArmAngle=0;
let g_upperLegAngle=0;
let g_lowerLeg1Angle=0;
let g_lowerLeg2Angle=0;
let g_tailAngle=0;
let g_footAngle=0;
let g_globalAngle=0;
let g_normalOn=false;

var g_startTime=performance.now()/1000.0;
var g_seconds=performance.now()/1000.0-g_startTime;

// Mouse movement
var g_yaw = -90; // Horizontal
var g_pitch = 0; // Vertical
var g_mouseSensitivity = 0.05;
var g_lastX, g_lastY;
var g_firstMouse = true;

// Game variables
var g_gameStarted=false;
var g_gameOver=false;
var g_gameWon=false;
var g_elapsedTime=0;
var g_timeLimit=300; //seconds
var g_catPos=[-6.3,-.4,-6.5]; //same location as in drawCat

// Set up actions for HTML UI elements
function addActionsForHtmlUI() {
  // Buttons
  document.getElementById('animationOnButton').onclick = function() {g_animations=true;};
  document.getElementById('animationOffButton').onclick = function() {g_animations=false;};
  
  document.getElementById('normalOn').onclick = function() {g_normalOn=true;};
  document.getElementById('normalOff').onclick = function() {g_normalOn=false;};
}

function initTextures() {
  var image = new Image();
  if (!image) {
    console.log('Failed to create image object');
    return false;
  }
  image.onload = function() { sendImageToTEXTURE0(image); };
  image.src = 'sky2.jpg';

  var image1 = new Image();
  if (!image1) {
    console.log('Failed to create image object');
    return false;
  }
  image1.onload = function() { sendImageToTEXTURE1(image1); };
  image1.src = 'stone wall.jpeg';

  var image2 = new Image();
  if (!image2) {
    console.log('Failed to create image object');
    return false;
  }
  image2.onload = function() { sendImageToTEXTURE2(image2); };
  image2.src = 'grass.jpg';
  return true;
}

function sendImageToTEXTURE0(image) {
  var texture = gl.createTexture();
  if (!texture) {
    console.log('Failed to create texture object');
    return false;
  }
  // Flip image's y axis
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);
  // Enable texture unit0 (0-8)
  gl.activeTexture(gl.TEXTURE0);
  // Bind texture object to the target
  gl.bindTexture(gl.TEXTURE_2D, texture);

  // Set the texture parameters
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  // Set texture image
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);
  // Set texture unit 0 to sampler
  gl.uniform1i(u_Sampler0, 0);
  
  console.log('finished loadTexture');
}

function sendImageToTEXTURE1(image) {
  var texture = gl.createTexture();
  if (!texture) {
    console.log('Failed to create texture object');
    return false;
  }
  // Flip image's y axis
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);
  // Enable texture unit0 (0-8)
  gl.activeTexture(gl.TEXTURE1);
  // Bind texture object to the target
  gl.bindTexture(gl.TEXTURE_2D, texture);

  // Set the texture parameters
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  // Set texture image
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);
  // Set texture unit 1 to sampler
  gl.uniform1i(u_Sampler1, 1);
  
  console.log('finished loadTexture');
}

function sendImageToTEXTURE2(image) {
  var texture = gl.createTexture();
  if (!texture) {
    console.log('Failed to create texture object');
    return false;
  }
  // Flip image's y axis
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);
  // Enable texture unit0 (0-8)
  gl.activeTexture(gl.TEXTURE2);
  // Bind texture object to the target
  gl.bindTexture(gl.TEXTURE_2D, texture);

  // Set the texture parameters
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  // Set texture image
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);
  // Set texture unit 2 to sampler
  gl.uniform1i(u_Sampler2, 2);
  
  console.log('finished loadTexture');
}

function main() {
  // Set up canvas and gl variables
  setupWebGL();
  // Set up GLSL shader programs and connect GLSL variables
  connectVariablesToGLSL();
  // Set up actions for HTML UI elements
  addActionsForHtmlUI();

  // Register function (event handler) to be called on a mouse press
  document.onkeydown = keydown;
  canvas.onclick = function() { canvas.requestPointerLock(); };
  document.addEventListener("mousemove", function(ev) {
    if (document.pointerLockElement === canvas) {
      let xoffset = ev.movementX;
      let yoffset = ev.movementY;
      xoffset *= g_mouseSensitivity;
      yoffset *= g_mouseSensitivity;

      g_yaw += xoffset;
      g_pitch -= yoffset;
      // Clamp pitch
      if (g_pitch > 89) g_pitch = 89;
      if (g_pitch < -89) g_pitch = -89;

      updateCameraDirection();
    }
  });
  initTextures();

  // Specify the color for clearing <canvas>
  gl.clearColor(0.0, 0.0, 0.0, 1.0);

  // Clear <canvas>
  requestAnimationFrame(tick);

  g_gameStarted = true;
}

function tick() {
  // Save current time
  g_seconds=performance.now()/1000.0-g_startTime;

  if (g_gameStarted && !g_gameOver) {
    g_elapsedTime = g_seconds;
    checkGameRules();
  }

  // Update animation angles
  updateAnimationAngles();

  // Draw everthing
  renderAllShapes();

  // Tell browser to update again when it has time
  requestAnimationFrame(tick);
}

function checkGameRules() {
  let dx = g_eye[0] - g_catPos[0];
  let dz = g_eye[2] - g_catPos[2];

  let distance = Math.sqrt(dx*dx + dz*dz);

  // Win condition
  if (distance < 1.0) {
    g_gameOver = true;
    g_gameWon = true;
    console.log("You found the cat!");
  }
  // Lose condition
  if (g_elapsedTime >= g_timeLimit) {
    g_gameOver = true;
    g_gameWon = false;
    console.log("Time's up!");
  }
}

function updateAnimationAngles() {
  //scaling g_seconds increases frequency
  let t = 4*g_seconds;

  if (g_animations) {
    g_upperArmAngle = (22.5-22.5*Math.sin(t));
    g_upperLegAngle = (17.5+17.5*Math.cos(t));
    g_lowerLeg1Angle = (10-10*Math.cos(t));
    g_lowerLeg2Angle = (5-5*Math.cos(t));
    g_footAngle = (25+25*Math.cos(t));
    g_tailAngle = (-45*Math.sin(t));
  } else {
    g_upperArmAngle = IDLE_UPPER_ARM;
    g_upperLegAngle = IDLE_UPPER_LEG;
    g_lowerLeg1Angle = IDLE_LOWER_LEG1;
    g_lowerLeg2Angle = IDLE_LOWER_LEG2;
    g_footAngle = IDLE_FOOT;
    g_tailAngle = IDLE_TAIL;
  }
}

function updateCameraDirection() {
  let yawRad = g_yaw * Math.PI / 180;
  let pitchRad = g_pitch * Math.PI / 180;

  let dx = Math.cos(pitchRad) * Math.cos(yawRad);
  let dy = Math.sin(pitchRad);
  let dz = Math.cos(pitchRad) * Math.sin(yawRad);

  g_at[0] = g_eye[0] + dx;
  g_at[1] = g_eye[1] + dy;
  g_at[2] = g_eye[2] + dz;
}

function canMoveTo(x, z) {
  let mapX = Math.floor(x + g_map.length/2);
  let mapZ = Math.floor(z + g_map[0].length/2);

  // Outside the map = blocked
  if (
    mapX < 0 || mapX >= g_map.length || 
    mapZ < 0 || mapZ >= g_map[0].length
  ) return false;

  // Any value > 0 is a wall
  return g_map[mapX][mapZ] == 0;
}

function keydown(ev) {
  const speed = 0.2;

  // Compute forward vector
  let fx = g_at[0] - g_eye[0];
  let fy = g_at[1] - g_eye[1];
  let fz = g_at[2] - g_eye[2];
  fy = 0;

  let flen = Math.sqrt(fx*fx + fz*fz);
  if (flen > 0.0001) {
    fx /= flen;
    fz /= flen;
  }

  let rx = -fz;
  let rz = fx;

  // Check if can move to empty space
  function tryMove(dx, dz) {
    let newX = g_eye[0] + dx;
    let newZ = g_eye[2] + dz;

    const hitbox = 0.1; //hitbox for pov
    if (
      canMoveTo(newX+hitbox, newZ) &&
      canMoveTo(newX-hitbox, newZ) &&
      canMoveTo(newX, newZ+hitbox) &&
      canMoveTo(newX, newZ-hitbox)
    ) {
      g_eye[0] = newX;
      g_eye[2] = newZ;
      g_at[0] += dx;
      g_at[2] += dz;
    }
  }

  if (ev.keyCode==87) { // W - go forward
    tryMove(fx * speed, fz * speed);
  } else if (ev.keyCode==83) { // S - go backward
    tryMove(-fx * speed, -fz * speed);
  } else if (ev.keyCode==65) { // A - go left
    tryMove(-rx * speed, -rz * speed);
  } else if (ev.keyCode==68) { // D - go right
    tryMove(rx * speed, rz * speed);
  } else if (ev.keyCode==81) { // Q - look left
    rotateView(5);
  } else if (ev.keyCode==69) { // E - look right
    rotateView(-5);
  } 
  //For debugging purposes, delete afterwards
  else if (ev.keyCode==32) { // Spacebar - go up
    g_eye[1] += speed;
    g_at[1] += speed;
  } else if (ev.keyCode==16) { // Shift - go down
    g_eye[1] -= speed;
    g_at[1] -= speed;
  }

  renderAllShapes();
  console.log(ev.keyCode);
}

function rotateView(angle) {
  let f = new Vector3([
    g_at[0] - g_eye[0],
    g_at[1] - g_eye[1],
    g_at[2] - g_eye[2]
  ]);

  let rotMat = new Matrix4();
  rotMat.setRotate(angle, g_up[0], g_up[1], g_up[2]);

  let f2 = rotMat.multiplyVector3(f);

  g_at[0] = g_eye[0] + f2.elements[0];
  g_at[1] = g_eye[1] + f2.elements[1];
  g_at[2] = g_eye[2] + f2.elements[2];
}

var g_eye = [0,.3,3]; // (eye, at, up)
var g_at = [0,0,-100];
var g_up = [0,1,0];
var g_catScale = 0.5;

var g_map = [
[3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3],
[3, 0, 2, 2, 2, 2, 0, 0, 0, 2, 0, 0, 0, 0, 0, 3],
[3, 0, 0, 0, 0, 0, 0, 2, 0, 0, 0, 2, 2, 2, 0, 3],
[3, 2, 0, 2, 2, 0, 2, 2, 2, 2, 0, 2, 0, 2, 0, 3],
[3, 0, 0, 0, 2, 0, 2, 0, 0, 0, 0, 2, 0, 0, 0, 3],
[3, 0, 2, 2, 0, 0, 2, 0, 2, 0, 2, 2, 2, 0, 2, 3],
[3, 0, 0, 2, 0, 2, 2, 0, 2, 0, 0, 0, 2, 0, 0, 3],
[3, 2, 0, 0, 0, 0, 0, 0, 2, 0, 0, 0, 2, 2, 0, 3],
[3, 2, 0, 2, 2, 2, 2, 2, 2, 0, 0, 0, 2, 2, 0, 3],
[3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 2, 0, 3],
[3, 0, 2, 0, 2, 2, 2, 0, 2, 0, 2, 2, 2, 0, 0, 3],
[3, 0, 2, 0, 0, 0, 2, 0, 2, 0, 0, 0, 0, 0, 2, 3],
[3, 2, 2, 0, 2, 2, 2, 0, 2, 2, 2, 0, 2, 2, 2, 3],
[3, 0, 2, 2, 2, 0, 0, 0, 0, 0, 2, 0, 2, 0, 0, 3],
[3, 0, 0, 0, 0, 0, 2, 2, 2, 0, 0, 0, 0, 0, 0, 3],
[3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3],
];

function drawMap() {
  // Draw the map based on g_map array
  for (let x = 0; x < g_map.length; x++) {
    for (let z = 0; z < g_map[x].length; z++) {

      if (g_map[x][z] > 0) {
        // height of wall (value in map)
        let height = g_map[x][z];
        let isBorder = (
          x == 0 || x == g_map.length -1 || 
          z == 0 || z == g_map[x].length - 1
        );

        for (let y = 0; y < height; y++) {

          let wall = new Cube();
          if (isBorder) {
            wall.color = [.8,1,1,1];
          } else {
            wall.color = [0,.4,0,1];
            wall.textureNum=1;
          }

          wall.matrix.translate(
            x - g_map.length/2,
            y - 1,
            z - g_map.length/2
          );

          wall.renderfast();
        }
      }
    }
  }
}

function drawCat() {
  let catRoot = new Matrix4();
  catRoot.translate(-6.3,-.4,-6.5); // goal location
  //catRoot.translate(0, -.4, 2); // debug location, delete later
  catRoot.rotate(-90,0,1,0);
  catRoot.scale(g_catScale, g_catScale, g_catScale);
  
  // Set uniform color and texture variables
  var uniformColor = [.25,.22,.22,1];
  var uniformTextureNum=-2;

  // Draw body cube
  var body = new Cube();
  body.color = uniformColor;
  body.textureNum = uniformTextureNum;
  body.matrix = new Matrix4(catRoot);
  body.matrix.translate(-.15,-.3,-.4);
  body.matrix.rotate(0,1,0,0);
  body.matrix.scale(.3,.45,1.2);
  body.render();

  // Draw left fore leg
  var leftarm = new Cube();
  leftarm.color = uniformColor;
  leftarm.textureNum = uniformTextureNum;
  leftarm.matrix = new Matrix4(catRoot);
  leftarm.matrix.translate(.1,-.1,-.33);
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
  rightarm.textureNum = uniformTextureNum;
  rightarm.matrix = new Matrix4(catRoot);
  rightarm.matrix.translate(-0.1,-.1,-.33);
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
  leftleg.textureNum = uniformTextureNum;
  leftleg.matrix = new Matrix4(catRoot);
  leftleg.matrix.translate(0.1,0,0.7);
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
  //var lFoot = new Matrix4(leftHindleg2.matrix);
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
  rightleg.textureNum = uniformTextureNum;
  rightleg.matrix = new Matrix4(catRoot);
  rightleg.matrix.translate(-.24,0,0.7);
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
  //var rFoot = new Matrix4(rightHindleg2.matrix);
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
  head.textureNum = uniformTextureNum;
  head.matrix = new Matrix4(catRoot);
  head.matrix.translate(-.185,.03,-.66);
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
  tail1.textureNum = uniformTextureNum;
  tail1.matrix = new Matrix4(catRoot);
  tail1.matrix.translate(0, .1, .7);
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
}

function renderAllShapes() {
  // Check time at start of this function
  var startTime = performance.now();

  var projMat = new Matrix4();
  projMat.setPerspective(50, 1*canvas.width/canvas.height, .1, 1000);
  gl.uniformMatrix4fv(u_ProjectionMatrix, false, projMat.elements);

  var viewMat = new Matrix4();
  viewMat.setLookAt(g_eye[0], g_eye[1], g_eye[2], g_at[0], g_at[1], g_at[2], g_up[0], g_up[1], g_up[2]);
  gl.uniformMatrix4fv(u_ViewMatrix, false, viewMat.elements);

  var globalRotMat = new Matrix4().rotate(g_globalAngle,0,1,0);
  gl.uniformMatrix4fv(u_GlobalRotateMatrix, false, globalRotMat.elements);

  // Clear <canvas>
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  gl.clear(gl.COLOR_BUFFER_BIT); 

  // Draw floor
  var body = new Cube();
  body.color = [1.0,0.0,0.0,1.0];
  if (g_normalOn) {
    body.textureNum=-3;
  } else {
    body.textureNum=2;
  }
  body.matrix.translate(0, -.8, 0);
  body.matrix.scale(20, 0, 20);
  body.matrix.translate(-.5, 0, -.5);
  body.renderNormal();

  var sky = new Cube();
  sky.color = [1.0,0.0,0.0,1.0];
  if (g_normalOn) {
    sky.textureNum=-3;
  } else {
    sky.textureNum=0;
  }
  sky.matrix.scale(50,50,50);
  sky.matrix.translate(-.5,-.5,-.5);
  sky.render();

  // var sphere = new Sphere();
  // sphere.color = [1.0,1.0,1.0,1.0];
  // sphere.matrix.translate(0, 4, 0);
  // sphere.matrix.scale(1,1,1);
  // sphere.render();

  // Draw the map
  drawMap();
  // Draw cat
  drawCat();
  
  var duration = performance.now() - startTime;
  sendTextToHTML("ms: " + Math.floor(duration) + " fps: " + Math.floor(10000/duration)/10, "ms");

  // Display Game Time
  let status = "";
  if (!g_gameOver) {
    status = "Time: " + g_elapsedTime.toFixed(1);
  } else if (g_gameWon) {
    status = "You found the cat! Time: " + g_elapsedTime.toFixed(1);
  } else {
    status = "Time's up!";
  }
  sendTextToHTML(status, "timer");
}

function sendTextToHTML(text, htmlID) {
  var htmlElm = document.getElementById(htmlID);
  if (!htmlElm) {
    console.log("Failed to get " + htmlID + " from HTML");
    return;
  }
  htmlElm.innerHTML = text;
}
