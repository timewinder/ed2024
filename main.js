import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { DeathTypes, ParticleSystem } from '/particles.mjs';

const padding = 30;
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(40, (window.innerWidth - padding * 2) / (window.innerHeight - padding * 2), 0.1, 1000);
const loader = new GLTFLoader();

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth - padding * 2, window.innerHeight - padding * 2);
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

const directional = new THREE.DirectionalLight(0xffffff, 3.5);
// directional.position.set(-0.2, 1, -0.2);
scene.add(directional);

const ambient = new THREE.AmbientLight(0x4a4369, 1);
scene.add(ambient);

// ===========================================

let player;
const playerRadius = 0.55;
let playerLoaded = false;

loader.load("boet.gltf", (gltf) => {
	gltf.scene.traverse((object) => {
		if (object.isMesh) {
			// object.material = [
			// 	new THREE.MeshBasicMaterial({ color: 0xeeeeee }),
			// 	new THREE.MeshBasicMaterial({ color: 0x333333 }),
			// 	new THREE.MeshBasicMaterial({ color: 0x898989 }),
			// 	new THREE.MeshBasicMaterial({ color: 0x92473e })
			// ];
			object.material = new THREE.MeshToonMaterial({ map: loadTexture("boat.png") });
		}
	});
	player = gltf.scene;
	scene.add(player);
	player.position.y = -0.1;
	playerLoaded = true;
	awake();
});

const boatWater = new ParticleSystem(
	new THREE.SphereGeometry(0.35, 8, 4), new THREE.MeshToonMaterial({ color: 0xffffff }), 0.01, 2.25,
	new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 0, 0), 0.25, DeathTypes.SHRINK);
scene.add(boatWater);
let playerVelocity = 7;

const waterGeometry = new THREE.PlaneGeometry(500, 500);
const waterMaterial = new THREE.MeshToonMaterial({ color: 0x63e0ff, transparent: true, opacity: 0.5 });
const water = new THREE.Mesh(waterGeometry, waterMaterial);
water.rotation.set(-Math.PI / 2, 0, 0);
water.position.y = -0.1;
scene.add(water);

const waterBottomGeometry = new THREE.PlaneGeometry(500, 500);
const waterBottomMaterial = new THREE.MeshToonMaterial({ color: 0x616b87 });
const waterBottom = new THREE.Mesh(waterBottomGeometry, waterBottomMaterial);
waterBottom.rotation.set(-Math.PI / 2, 0, 0);
waterBottom.position.y = -0.2;
scene.add(waterBottom);

// const axesHelper = new THREE.AxesHelper( 2.5 );
// scene.add( axesHelper );

let score = 0;
const scoreDisplay = document.querySelector("#score");

const clock = new THREE.Clock();
let timeElapsed = 0.0;
let lerpedRotation = 0.0;

function lerp(a, b, i) {
	return a + i * (b - a);
}
function loadTexture(path) {
    let texture = new THREE.TextureLoader().load(path);
    texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
    texture.minFilter = texture.magFilter = THREE.NearestFilter;
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.needsUpdate = true;
    return texture;
}

const trashMaterial = new THREE.MeshToonMaterial({ map: loadTexture("trash.png") });
const oilMaterials = [new THREE.MeshToonMaterial({ color: 0xa84a43 }), new THREE.MeshToonMaterial({ color: 0x555555 }), new THREE.MeshToonMaterial({ color: 0x46785f })];

function spawnThingy(radius = 26) {
	const rand = Math.random();

	if (rand <= 0.7) { // rocks/obstacles
		loader.load("rock.gltf", (gltf) => {
			gltf.scene.traverse((object) => {
				if (object.isMesh) {
					object.material = new THREE.MeshToonMaterial({ color: 0x666666 });
				}
			});
			const theta = Math.random() * 2 * Math.PI;
			gltf.scene.position.copy(player.position);
			gltf.scene.position.add(new THREE.Vector3(Math.sin(theta) * radius, 0, Math.cos(theta) * radius));
			gltf.scene.rotation.set(Math.random() * 2 * Math.PI, Math.random() * 2 * Math.PI, Math.random() * 2 * Math.PI);
			console.log(gltf.scene.position)
			gltf.scene.userData = {
				bad: true,
				radius: 1
			};
			generatedProps.push(gltf.scene);
			scene.add(gltf.scene);
		});
	}
	else if (rand <= 0.7 + 0.2) { // common trash
		loader.load("commontrash.gltf", (gltf) => {
			gltf.scene.traverse((object) => {
				if (object.isMesh) {
					object.material = trashMaterial;
				}
			});
			const theta = Math.random() * 2 * Math.PI;
			gltf.scene.position.copy(player.position);
			gltf.scene.position.y += 0.01;
			gltf.scene.position.add(new THREE.Vector3(Math.sin(theta) * radius, 0, Math.cos(theta) * radius));
			gltf.scene.rotation.y = Math.random() * 2 * Math.PI;
			console.log(gltf.scene.position)
			gltf.scene.userData = {
				score: 5,
				radius: 1.25
			};
			generatedProps.push(gltf.scene);
			scene.add(gltf.scene);
		});
	}
	else { // DID SOMEONE JUST SAY OIL 🦅🦅🦅🦅🇺🇸🇺🇸🇺🇸🇺🇸🇺
		loader.load("barrel.gltf", (gltf) => {
			gltf.scene.traverse((object) => {
				if (object.isMesh) {
					object.material = oilMaterials[Math.floor(Math.random() * oilMaterials.length)];
				}
			});
			const theta = Math.random() * 2 * Math.PI;
			gltf.scene.position.copy(player.position);
			gltf.scene.position.add(new THREE.Vector3(Math.sin(theta) * radius, 0, Math.cos(theta) * radius));
			gltf.scene.rotation.set(Math.random() * 2 * Math.PI, Math.random() * 2 * Math.PI, Math.random() * 2 * Math.PI);
			console.log(gltf.scene.position)
			gltf.scene.userData = {
				score: 10,
				radius: 0.5
			};
			generatedProps.push(gltf.scene);
			scene.add(gltf.scene);
		});
	}
}

let generatedProps = [];
const maximumProps = 30;

let spawnTick = 0.0;
const secondsPerSpawn = 0.75;
let dead = false;


function awake() {
	// for (let i = 0; i < 5; i++) spawnThingy(5);
	update();
}

// update() runs every frame
function update() {
	requestAnimationFrame(update);

	if (!playerLoaded || dead) return;

	const delta = clock.getDelta();
	timeElapsed += delta;

	// ===========================================

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

	water.position.x = waterBottom.position.x = player.position.x;
	water.position.z = waterBottom.position.z = player.position.z;

	// update camera
	const vector = new THREE.Vector3();
	camera.getWorldDirection(vector);
	vector.multiplyScalar(-cameraDistance);

	camera.position.copy(player.position);
	camera.position.add(vector);

	// update environment
	let hitlist = [];
	for (let i = 0; i < generatedProps.length; i++) {
		const cur = generatedProps[i];
		const distance = player.position.distanceTo(cur.position);
		if (distance >= 30) { // if too far away
			hitlist.push(cur);
		}
		else if (distance <= playerRadius + cur.userData.radius) {
			if (cur.userData.bad) {
				dead = true;
				document.getElementById("death").classList.toggle("hidden");
				document.getElementById("score2").innerHTML = score;
				document.getElementById("time").innerHTML = Math.round(timeElapsed);
				if (score <= 30) {
					document.getElementById("taunt").innerHTML = "<b class='red'>My grandma plays better</b>"
				}
				else if (score < 60) {
					document.getElementById("taunt").innerHTML = "<span class='red'>Pretty decent (you still suck tho)</span>"
				}
				else {
					document.getElementById("taunt").innerHTML = "<span>NICE WORK :D</span>"
				}
			}
			else {
				hitlist.push(cur);
				score += cur.userData.score;
			}
		}
	}
	// remove all objects on hitlist
	for (let i = 0; i < hitlist.length; i++) {
		const cur = hitlist[i];
		scene.remove(cur);
		generatedProps.splice(generatedProps.indexOf(cur), 1);
	}

	spawnTick += delta;
	if (spawnTick > secondsPerSpawn) {
		spawnTick = 0;
		for (let i = 0; i < 17; i++) {
			if (generatedProps.length >= maximumProps) break;
			spawnThingy();
		}
	}
	scoreDisplay.innerHTML = score;

	renderer.render(scene, camera);
}