import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import GUI from "lil-gui";
import { FontLoader } from "three/examples/jsm/loaders/FontLoader.js";
import { TextGeometry } from "three/examples/jsm/geometries/TextGeometry.js";

/**
 * Base
 */
// Debug
const gui = new GUI();
gui.hide();

if (window.location.href.includes("debug")) {
  gui.show();
}
// Canvas
const canvas = document.querySelector("canvas.webgl");

const backgroundShapes = [
  new THREE.OctahedronGeometry(),
  new THREE.OctahedronGeometry(),
  new THREE.CapsuleGeometry(0.4, 0.4, 4, 8),
  new THREE.CapsuleGeometry(0.4, 0.4, 4, 8),
  new THREE.IcosahedronGeometry(),
  new THREE.RingGeometry(),
];

// Scene
const scene = new THREE.Scene();

/**
 * Textures
 */
const textureLoader = new THREE.TextureLoader();
const matcapTexture = textureLoader.load("/textures/matcaps/2.png");
matcapTexture.colorSpace = THREE.SRGBColorSpace;

/**
 * Fonts
 */

let backsceneObjects = [];
const fontLoader = new FontLoader();
fontLoader.load("/fonts/helvetiker_regular.typeface.json", (font) => {
  const textGeometry = new TextGeometry("Omar Maksousa", {
    font,
    size: 0.5,
    depth: 0.2,
    curveSegments: 2,
    bevelEnabled: true,
    bevelThickness: 0.03,
    bevelSize: 0.02,
    bevelSegments: 1,
  });
  textGeometry.center();
  const textMaterial = new THREE.MeshMatcapMaterial({ matcap: matcapTexture });
  const text = new THREE.Mesh(textGeometry, textMaterial);
  scene.add(text);

  for (let i = 0; i < 1000; i++) {
    const myLuckNumber = Math.ceil(Math.random() * 6);
    const matcapTexture = textureLoader.load(
      `/textures/matcaps/${myLuckNumber}.png`
    );
    const backgroundObj = backgroundShapes[myLuckNumber - 1];
    const donutMaterial = new THREE.MeshMatcapMaterial({
      matcap: matcapTexture,
    });
    matcapTexture.colorSpace = THREE.SRGBColorSpace;
    const donut = new THREE.Mesh(backgroundObj, donutMaterial);
    donut.position.x = (Math.random() - 0.5) * 100;
    donut.position.y = (Math.random() - 0.5) * 100;
    donut.position.z = (Math.random() - 0.5) * 100;

    donut.rotation.x = Math.random() * Math.PI;
    const scale = Math.random();
    donut.scale.set(scale, scale, scale);
    backsceneObjects.push(donut);
    scene.add(donut);
  }
});

/**
 * Light
 */
const pointLight = new THREE.PointLight(0xffffff, 30);
pointLight.position.x = 2;
pointLight.position.y = 3;
pointLight.position.z = 4;
scene.add(pointLight);

/**
 * Mirror Object
 *
 */

const mirrorGeometry = new THREE.PlaneGeometry(6, 6);
const mirrorMaterial = new THREE.MeshPhysicalMaterial({
  side: THREE.DoubleSide,
  color: 0xffff00,
});
mirrorMaterial.transmission = 1;
mirrorMaterial.ior = 1.5;
mirrorMaterial.thickness = 0.5;
mirrorMaterial.metalness = 0.0001;
mirrorMaterial.roughness = 0.0001;
const mirror = new THREE.Mesh(mirrorGeometry, mirrorMaterial);
mirror.position.x = 0;
mirror.position.y = 0;
mirror.position.z = 0;
mirror.rotation.y = 0;

gui.add(mirror.rotation, "x").step(0.01).name("mirror rotation x");
gui.add(mirror.rotation, "y").step(0.1).name("mirror rotation y");
gui.add(mirror.position, "x").step(0.1);
gui.add(mirror.position, "y").step(0.1);
gui.add(mirror.position, "z").step(0.1);
gui.add(mirrorMaterial, "metalness").min(0).max(1).step(0.0001);
gui.add(mirrorMaterial, "roughness").min(0).max(1).step(0.0001);
gui.add(mirrorMaterial, "thickness").min(0).max(1).step(0.0001);
gui.add(mirrorMaterial, "ior").min(0).max(1).step(0.0001);
gui.add(mirrorMaterial, "transmission").min(0).max(1).step(0.0001);

scene.add(mirror);

/**
 * Sizes
 */
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
};

window.addEventListener("resize", () => {
  // Update sizes
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;

  // Update camera
  camera.aspect = sizes.width / sizes.height;
  camera.updateProjectionMatrix();

  // Update renderer
  renderer.setSize(sizes.width, sizes.height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(
  75,
  sizes.width / sizes.height,
  0.1,
  100
);
camera.position.x = 0;
camera.position.y = 0;
camera.position.z = 15;

gui.add(camera.position, "x").step(0.1).name("camera X");
gui.add(camera.position, "y").step(0.1).name("camera y");
gui.add(camera.position, "z").step(0.1).name("camera z");
scene.add(camera);

// Controls
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;
controls.maxDistance = 40;
controls.minDistance = 3;

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
});
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

/**
 * Animate
 */
const clock = new THREE.Clock();

let mirrorRotationDirectionDown = true;

const tick = () => {
  const elapsedTime = clock.getElapsedTime();
  if (camera.position.z > 5) {
    camera.position.z -= 0.01;
  }

  /**
   * Mirror rotation
   */
  if (mirror.rotation.x < -1) {
    mirrorRotationDirectionDown = !mirrorRotationDirectionDown;
  } else if (mirror.rotation.x > 0) {
    mirrorRotationDirectionDown = !mirrorRotationDirectionDown;
  }
  if (mirrorRotationDirectionDown) {
    mirror.rotation.x -= 0.0001;
  } else {
    mirror.rotation.x += 0.0001;
  }

  /**
   * backscene objects rotation and movement
   */
  if (backsceneObjects.length) {
    backsceneObjects.forEach((obj, index) => {
      if (index % 2 === 0) {
        obj.position.y -= 0.003;
        obj.rotation.y = -(elapsedTime * 0.4);
        obj.rotation.x = -(elapsedTime * 0.4);
        obj.rotation.z = -(elapsedTime * 0.4);
      } else {
        obj.position.y += 0.003;
        obj.rotation.y = elapsedTime * 0.3;
        obj.rotation.x = elapsedTime * 0.3;
        obj.rotation.z = elapsedTime * 0.3;
      }
    });
  }

  // Update controls
  controls.update();

  // Render
  renderer.render(scene, camera);

  // Call tick again on the next frame
  window.requestAnimationFrame(tick);
};

tick();
