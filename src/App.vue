<template></template>

<script setup lang="ts">
import {onMounted} from 'vue';
import * as THREE from 'three';
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls.js';
import {DRACOLoader} from 'three/examples/jsm/loaders/DRACOLoader.js';
import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader.js';
import vertexShader from './shaders_test/vertex.glsl';
import fragmentShader from './shaders_test/fragment.glsl';
let scene: THREE.Scene;
let camera: THREE.PerspectiveCamera;
let rendererWidth = window.innerWidth;
let rendererHeight = window.innerHeight;
onMounted(async () => {
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x000000);
  camera = new THREE.PerspectiveCamera(75, rendererWidth / rendererHeight, 0.1, 1000);
  camera.position.set(0, 0, 5);

  const AxesHelper = new THREE.AxesHelper(4);
  scene.add(AxesHelper);

  const light = new THREE.DirectionalLight(0xffffff, 1);
  light.position.set(0, 10, 8);
  scene.add(light);

  const texture = new THREE.TextureLoader().load('./textures/wallhaven-rrodj7.jpg');

  const geometry = new THREE.BoxGeometry(1, 1, 1);
  const material = new THREE.ShaderMaterial({
    vertexShader,
    fragmentShader,
    uniforms: {
      uTexture: {
        value: texture
      }
    }
  });
  const box = new THREE.Mesh(geometry, material);
  // console.log(geometry, material, box);
  box.position.y = 1;
  scene.add(box);

  // draco 载入模型
  const dracoLoader = new DRACOLoader();
  dracoLoader.setDecoderPath('./draco/');
  const gltfLoader = new GLTFLoader();
  gltfLoader.setDRACOLoader(dracoLoader);

  let renderer = new THREE.WebGLRenderer();
  renderer.setSize(rendererWidth, rendererHeight);
  document.body.appendChild(renderer.domElement);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;

  function animate() {
    renderer.setRenderTarget(null); // 设置渲染目标为默认
    controls.update();
    renderer.render(scene, camera);
    requestAnimationFrame(animate);
  }
  animate();
  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  });
});
</script>

<style scoped lang="scss"></style>
