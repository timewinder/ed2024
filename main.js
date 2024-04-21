import * as THREE from 'three';
import { DeathTypes, ParticleSystem } from '/particles.mjs';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(40, window.innerWidth / window.innerHeight, 0.1, 1000);

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

scene.background = new THREE.Color(0x333333);

scene.add(camera);

const cameraVector = new THREE.Vector3(1, -1, 1).normalize();
camera.lookAt(cameraVector);
// camera.rotation.copy(new THREE.Euler(-Math.PI / 4, 0, 0));
const cameraDistance = 15;

// const camera2 = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000); scene.add(camera2)
camera.position.z = 5;
camera.position.y = 1;

// ===========================================

var pressedKeys = {};
window.onkeyup = function(event) { pressedKeys[event.key] = false; }
window.onkeydown = function(event) { pressedKeys[event.key] = true; }

// ===========================================

const playerGeometry = new THREE.BoxGeometry(1, 1, 2);
const playerMaterial = new THREE.MeshNormalMaterial();
const player = new THREE.Mesh(playerGeometry, playerMaterial);
scene.add(player);
const boatWater = new ParticleSystem(
	new THREE.SphereGeometry(0.3, 8, 4), new THREE.MeshBasicMaterial({ color: 0xffffff }), 0.01, 2.25,
	new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 0, 0), 0.25, DeathTypes.SHRINK);
scene.add(boatWater);
let playerVelocity = 4.5;

const waterGeometry = new THREE.PlaneGeometry(500, 500);
const waterMaterial = new THREE.MeshBasicMaterial({ color: 0x95c4e8 });
const water = new THREE.Mesh(waterGeometry, waterMaterial);
water.rotation.set(-Math.PI / 2, 0, 0);
water.position.y = -0.25;
scene.add(water);

const axesHelper = new THREE.AxesHelper( 2.5 );
scene.add( axesHelper );

const clock = new THREE.Clock();
let timeElapsed = 0.0;
let lerpedRotation = 0.0;

function lerp(a, b, i) {
	return a + i * (b - a);
}

// update() runs every frame
function update() {
	requestAnimationFrame(update);
	const delta = clock.getDelta();
	timeElapsed += delta;

	// ===========================================

	const vector = new THREE.Vector3();
	camera.getWorldDirection(vector);
	vector.multiplyScalar(-cameraDistance);

	camera.position.copy(player.position);
	camera.position.add(vector);

	// alert(JSON.stringify(camera.position))

	// boat stuff
	const playerForward = new THREE.Vector3();
	player.getWorldDirection(playerForward);
	playerForward.multiplyScalar(playerVelocity * delta);
	player.position.add(playerForward);
	player.rotation.z = Math.sin(timeElapsed * 1.5) * 0.075;

	boatWater.update(delta);
	boatWater.position.copy(player.position);
	boatWater.position.add(new THREE.Vector3(-Math.sin(player.rotation.y), -0.25,  -Math.cos(player.rotation.y)));

	let rotationMultiplier = 0;
	if (pressedKeys.a || pressedKeys.A) rotationMultiplier++;
	if (pressedKeys.d || pressedKeys.D) rotationMultiplier--;
	lerpedRotation = lerp(lerpedRotation, rotationMultiplier, 0.1);
	player.rotation.y += rotationMultiplier * Math.PI * delta;
	player.rotation.z += lerpedRotation * 0.15;

	renderer.render(scene, camera);
}

update();