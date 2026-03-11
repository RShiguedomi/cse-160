import * as THREE from 'three';
//import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

// Scene, Camera, and Renderer
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x87ceeb);
const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 0.3, 3);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
document.body.appendChild(renderer.domElement);

window.addEventListener('resize', () => {
	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();
	renderer.setSize(window.innerWidth, window.innerHeight);
});

// Texture Loader
const texLoader = new THREE.TextureLoader();
function makeColorTexture(hex) {
	const canvas = document.createElement('canvas');
	canvas.width = canvas.height = 2;
	const ctx = canvas.getContext('2d');
	ctx.fillStyle = hex;
	ctx.fillRect(0, 0, 2, 2);
	return new THREE.CanvasTexture(canvas);
}
// Replace with texLoader.load('yourfile.jpg') when serving from local server
const skyTex = makeColorTexture('#87ceeb'); // swap -> texLoader.load('sky2.jpg')
const wallTex = makeColorTexture('#888888'); // swap → texLoader.load('stone wall.jpeg')
const grassTex = makeColorTexture('#3a7d44'); // swap → texLoader.load('grass.jpg')\

// Materials
const wallMat   = new THREE.MeshLambertMaterial({ map: wallTex });
const borderMat = new THREE.MeshLambertMaterial({ color: 0xccffff });
const grassMat  = new THREE.MeshLambertMaterial({ map: grassTex });
const skyMat    = new THREE.MeshBasicMaterial({ map: skyTex, side: THREE.BackSide });
const catMat    = new THREE.MeshLambertMaterial({ color: 0x403838 });

// Lights
// Ambient
const ambientLight = new THREE.AmbientLight(0xffffff, 0.35);
scene.add(ambientLight);

// Directional
const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
dirLight.position.set(10, 20, 10);
dirLight.castShadow = true;
dirLight.shadow.camera.near = 0.1;
dirLight.shadow.camera.far = 100;
dirLight.shadow.camera.left = -30;
dirLight.shadow.camera.right = 30;
dirLight.shadow.camera.top = 30;
dirLight.shadow.camera.bottom = -30;
scene.add(dirLight);

// Point light
const pointLight = new THREE.PointLight(0xffff99, 1.5, 80);
pointLight.position.set(0, 15, 0);
pointLight.castShadow = true;
scene.add(pointLight);

// Visual sphere for point light
const lightSphereGeo = new THREE.SphereGeometry(0.4, 16, 16);
const lightSphereMat = new THREE.MeshBasicMaterial({color: 0xffff88});
const lightSphere = new THREE.Mesh(lightSphereGeo, lightSphereMat);
scene.add(lightSphere);

// Skybox
const skyGeo = new THREE.BoxGeometry(200, 200, 200);
const skyBox = new THREE.Mesh(skyGeo, skyMat);
scene.add(skyBox);

// Floor
const floorGeo = new THREE.PlaneGeometry(40, 40);
const floor = new THREE.Mesh(floorGeo, grassMat);
floor.rotation.x = -Math.PI/2;
floor.position.y = -0.8;
floor.receiveShadow = true;
scene.add(floor);

// Map
const g_map = [
	[3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3],
  [3,0,2,2,2,2,0,0,0,2,0,0,0,0,0,3],
  [3,0,0,0,0,0,0,2,0,0,0,2,2,2,0,3],
  [3,2,0,2,2,0,2,2,2,2,0,2,0,2,0,3],
  [3,0,0,0,2,0,2,0,0,0,0,2,0,0,0,3],
  [3,0,2,2,0,0,2,0,2,0,2,2,2,0,2,3],
  [3,0,0,2,0,2,2,0,2,0,0,0,2,0,0,3],
  [3,2,0,0,0,0,0,0,2,0,0,0,2,2,0,3],
  [3,2,0,2,2,2,2,2,2,0,0,0,2,2,0,3],
  [3,0,0,0,0,0,0,0,0,0,0,0,2,2,0,3],
  [3,0,2,0,2,2,2,0,2,0,2,2,2,0,0,3],
  [3,0,2,0,0,0,2,0,2,0,0,0,0,0,2,3],
  [3,2,2,0,2,2,2,0,2,2,2,0,2,2,2,3],
  [3,0,2,2,2,0,0,0,0,0,2,0,2,0,0,3],
  [3,0,0,0,0,0,2,2,2,0,0,0,0,0,0,3],
  [3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3],
];

// Build walls
const wallGeo = new THREE.BoxGeometry(1, 1, 1);
for (let x = 0; x < g_map.length; x++) {
	for (let z = 0; z < g_map[x].length; z++) {
		const val = g_map[x][z];
		if (val > 0) {
			const isBorder = (x === 0 || x === g_map.length-1 || z === 0 || z === g_map[x].length-1);
			const mat = isBorder ? borderMat : wallMat;
			const height = val;
			
			for (let y = 0; y < height; y++) {
				const wall = new THREE.Mesh(wallGeo, mat);
				wall.position.set(
					x - g_map.length / 2,
					y - 1 + 0.5,
					z - g_map[x].length / 2
				);
				wall.castShadow = true;
				wall.receiveShadow = true;
				scene.add(wall);
			}
		}
	}
}

// Cat
const CAT_POS = new THREE.Vector3(-6.3, -0.4, -6.5);
const catGroup = new THREE.Group();
catGroup.position.copy(CAT_POS);
catGroup.rotation.y = Math.PI/2;

function makePart(sx, sy, sz, tx, ty, tz, mat) {
	const geo = new THREE.BoxGeometry(sx, sy, sz);
	const mesh = new THREE.Mesh(geo, mat || catMat);
	mesh.position.set(tx, ty, tz);
	mesh.castShadow = true;
	return mesh;
}

// Body
catGroup.add(makePart(0.3, 0.45, 1.2, 0, 0, 0));
// Head
catGroup.add(makePart(0.375, 0.33, 0.375, 0, 0.3, -0.66));
// Eyes
const eyeMat = new THREE.MeshLambertMaterial({ color: 0xffff00 });
catGroup.add(makePart(0.07, 0.07, 0.02, 0.09, 0.41, -0.845, eyeMat));
catGroup.add(makePart(0.07, 0.07, 0.02, -0.09, 0.41, -0.845, eyeMat));
// Ears
catGroup.add(makePart(0.09, 0.15, 0.09, 0.12, 0.55, -0.66));
catGroup.add(makePart(0.09, 0.15, 0.09, -0.12, 0.55, -0.66));
// Nose
catGroup.add(makePart(0.15, 0.12, 0.075, 0, 0.22, -0.85));

// Legs
const legParts = {};
function makeLeg(name, sx, sy, sz, tx, ty, tz) {
	const group = new THREE.Group();
	group.position.set(tx, ty, tz);
	const mesh = makePart(sx, sy, sz, 0, -sy/2, 0);
	group.add(mesh);
	catGroup.add(group);
	legParts[name] = group;
	return group;
}

// Forelegs
makeLeg('lForeUpper',  0.12, 0.45, 0.2,   0.1, -0.1, -0.33);
makeLeg('rForeUpper', -0.12, 0.45, 0.2,  -0.1, -0.1, -0.33);
// Hind legs
makeLeg('lHindUpper',  0.14, 0.55, 0.25,  0.24, 0.0,  0.7);
makeLeg('rHindUpper',  0.14, 0.55, 0.25, -0.24, 0.0,  0.7);

// Tail
const tailGeo1 = new THREE.CylinderGeometry(0.07, 0.07, 0.4, 8);
const tail1 = new THREE.Mesh(tailGeo1, catMat);
tail1.position.set(0, 0.1, 0.7);
tail1.rotation.x = THREE.MathUtils.degToRad(65);
catGroup.add(tail1);

const tailGroup = new THREE.Group();
tailGroup.position.set(0, 0.1, 0.7);
const tailGeo2 = new THREE.CylinderGeometry(0.05, 0.05, 0.3, 8);
const tail2 = new THREE.Mesh(tailGeo2, catMat);
tail2.position.set(0, 0.32, 0.14);
tail2.rotation.x = THREE.MathUtils.degToRad(45);
tailGroup.add(tail2);
catGroup.add(tailGroup);

scene.add(catGroup);

// GLTF Model Loader
// Uncomment and set correct path when have .glb model:
// const gltfLoader = new GLTFLoader();
// gltfLoader.load('./YourModel.glb', (gltf) => {
//   gltf.scene.position.set(0, -0.8, -5);
//   gltf.scene.scale.set(0.5, 0.5, 0.5);
//   scene.add(gltf.scene);
// }, undefined, (err) => console.error(err));

// Game State
let g_animations = false;
let g_lightOn = true;
let g_gameStarted = true;
let g_gameOver = false;
let g_gameWon = false;
let g_elapsedTime = 0;
const g_timeLimit = 300;
const g_startTime = performance.now() / 1000;

// First-Person Camera / Pointer Lock
let g_yaw = -90;
let g_pitch = 0;
const g_mouseSensitivity = 0.05;

// Camera Look Direction
function updateCameraDirection() {
  const yawRad   = THREE.MathUtils.degToRad(g_yaw);
  const pitchRad = THREE.MathUtils.degToRad(g_pitch);
  const dx = Math.cos(pitchRad) * Math.cos(yawRad);
  const dy = Math.sin(pitchRad);
  const dz = Math.cos(pitchRad) * Math.sin(yawRad);
  camera.lookAt(camera.position.x + dx, camera.position.y + dy, camera.position.z + dz);
}
updateCameraDirection();

renderer.domElement.addEventListener('click', () => {
	renderer.domElement.requestPointerLock();
});
document.addEventListener('mousemove', (ev) => {
	if (document.pointerLockElement === renderer.domElement) {
		g_yaw += ev.movementX * g_mouseSensitivity;
		g_pitch -= ev.movementY * g_mouseSensitivity;
		g_pitch = Math.max(-89, Math.min(89, g_pitch));
		updateCameraDirection();
	}
});

// Collision Detection
function canMoveTo(x, z) {
  const mapX = Math.floor(x + g_map.length / 2);
  const mapZ = Math.floor(z + g_map[0].length / 2);
  if (mapX < 0 || mapX >= g_map.length || mapZ < 0 || mapZ >= g_map[0].length) return false;
  return g_map[mapX][mapZ] === 0;
}

// Keyboard Input
const keys = {};
document.addEventListener('keydown', (ev) => { keys[ev.code] = true; });
document.addEventListener('keyup',   (ev) => { keys[ev.code] = false; });

function processMovement() {
  const speed = 0.07;
  const pos = camera.position;

  // Forward direction (ignore Y)
  const dir = new THREE.Vector3();
  camera.getWorldDirection(dir);
  dir.y = 0;
  dir.normalize();

  const right = new THREE.Vector3();
  right.crossVectors(dir, new THREE.Vector3(0, 1, 0)).normalize();

  function tryMove(dx, dz) {
    const hitbox = 0.3;
    const nx = pos.x + dx;
    const nz = pos.z + dz;
    if (
      canMoveTo(nx + hitbox, nz) &&
      canMoveTo(nx - hitbox, nz) &&
      canMoveTo(nx, nz + hitbox) &&
      canMoveTo(nx, nz - hitbox)
    ) {
      pos.x = nx;
      pos.z = nz;
    }
  }

	if (keys['KeyW']) tryMove( dir.x * speed,  dir.z * speed);
  if (keys['KeyS']) tryMove(-dir.x * speed, -dir.z * speed);
  if (keys['KeyA']) tryMove(-right.x * speed, -right.z * speed);
  if (keys['KeyD']) tryMove( right.x * speed,  right.z * speed);

  updateCameraDirection();
}

// Animation Angles
function updateAnimations(seconds) {
  const t = 4 * seconds;

  // Orbiting point light (always on)
  const radius = 20;
  const speed  = 0.3;
  const t2 = seconds * speed;
  pointLight.position.set(radius * Math.cos(t2), 15, radius * Math.sin(t2));
  lightSphere.position.copy(pointLight.position);

  // Cat limb animation
  if (g_animations) {
    const lFU = legParts['lForeUpper'];
    const rFU = legParts['rForeUpper'];
    const lHU = legParts['lHindUpper'];
    const rHU = legParts['rHindUpper'];

    const swing = THREE.MathUtils.degToRad(22.5 - 22.5 * Math.sin(t));
    lFU.rotation.x =  swing;
    rFU.rotation.x = -swing;
    lHU.rotation.x =  swing;
    rHU.rotation.x = -swing;

    // Tail wag
    tailGroup.rotation.y = THREE.MathUtils.degToRad(-45 * Math.sin(t));
  } else {
    legParts['lForeUpper'].rotation.x = 0;
    legParts['rForeUpper'].rotation.x = 0;
    legParts['lHindUpper'].rotation.x = 0;
    legParts['rHindUpper'].rotation.x = 0;
    tailGroup.rotation.y = 0;
  }
}

// Game Rules
function checkGameRules() {
  const dx = camera.position.x - CAT_POS.x;
  const dz = camera.position.z - CAT_POS.z;
  const dist = Math.sqrt(dx * dx + dz * dz);

  if (dist < 1.0) {
    g_gameOver = true;
    g_gameWon  = true;
  }
  if (g_elapsedTime >= g_timeLimit) {
    g_gameOver = true;
    g_gameWon  = false;
  }
}

// HTML UI
//document.getElementById('animationOnButton').onclick  = () => { g_animations = true; };
// document.getElementById('animationOffButton').onclick = () => { g_animations = false; };
// document.getElementById('lightOn').onclick  = () => {
//   g_lightOn = true;
//   dirLight.intensity   = 0.8;
//   pointLight.intensity = 1.5;
// };
// document.getElementById('lightOff').onclick = () => {
//   g_lightOn = false;
//   dirLight.intensity   = 0;
//   pointLight.intensity = 0;
// };

function sendTextToHTML(text, id) {
  const el = document.getElementById(id);
  if (el) el.innerHTML = text;
}

// Render Loop
let lastTime = performance.now();

function animate() {
  requestAnimationFrame(animate);

  const now     = performance.now();
  const delta   = (now - lastTime) / 1000;
  lastTime      = now;
  const seconds = now / 1000 - g_startTime;

  // Game timer
  if (g_gameStarted && !g_gameOver) {
    g_elapsedTime = seconds;
    checkGameRules();
  }

  processMovement();
  updateAnimations(seconds);

  renderer.render(scene, camera);

  // FPS display
  const fps = delta > 0 ? Math.round(1 / delta) : '--';
  sendTextToHTML(`FPS: ${fps}`, 'ms');

  // Timer display
  let status = '';
  if (!g_gameOver) {
    status = `Time: ${g_elapsedTime.toFixed(1)}`;
  } else if (g_gameWon) {
    status = `You found the cat! Time: ${g_elapsedTime.toFixed(1)}`;
  } else {
    status = `Time's up!`;
  }
  sendTextToHTML(status, 'timer');
}

animate();


// const controls = new OrbitControls( camera, renderer.domElement );

// loader.load('resources/images/wall.jpg', (texture) => {
// 	texture.colorSpace = THREE.SRGBColorSpace;
// 	const material = new THREE.MeshBasicMaterial({
// 		map: texture,
// 	});
// 	const cube = new THREE.Mesh(geometry, materials);
// 	scene.add(cube);
// 	cubes.push(cube);
// });
// //const texture = loader.load('resources/images/wall.jpg');
// //texture.colorSpace = THREE.SRGBColorSpace;

// const geometry = new THREE.BoxGeometry(1, 1, 1);
// //const material = new THREE.MeshBasicMaterial( {color: 0x00ff00} );
// const materials = [
// 	new THREE.MeshBasicMaterial({map: loadColorTexture('resources/images/flower-1.jpg')}),
// 	new THREE.MeshBasicMaterial({map: loadColorTexture('resources/images/flower-2.jpg')}),
// 	new THREE.MeshBasicMaterial({map: loadColorTexture('resources/images/flower-3.jpg')}),
// 	new THREE.MeshBasicMaterial({map: loadColorTexture('resources/images/flower-4.jpg')}),
// 	new THREE.MeshBasicMaterial({map: loadColorTexture('resources/images/flower-5.jpg')}),
// 	new THREE.MeshBasicMaterial({map: loadColorTexture('resources/images/flower-6.jpg')}),
// ]
// const cube = new THREE.Mesh(geometry, materials);
// scene.add(cube);
// camera.position.z = 5;

// function animate(time) {
//   cube.rotation.x = time/2000;
//   cube.rotation.y = time/1000;
// 	controls.update();
//   renderer.render(scene, camera);
// }
// renderer.setAnimationLoop(animate);

// function loadColorTexture( path ) {
// 	const texture = loader.load(path);
// 	texture.colorSpace = THREE.SRGBColorSpace;
// 	return texture;
// }