<template></template>

<script setup lang="ts">
import {onMounted} from 'vue';
import * as THREE from 'three';
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls.js';
import vertexShader from './shaders/vertexShader.glsl';
import fragmentShader from './shaders/fragmentShader.glsl';
let scene: THREE.Scene;
let camera: THREE.PerspectiveCamera;
let rendererWidth = window.innerWidth;
let rendererHeight = window.innerHeight;
onMounted(async () => {
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x000000);
  camera = new THREE.PerspectiveCamera(75, rendererWidth / rendererHeight, 0.1, 1000);
  camera.position.set(0, 0, 8);

  const AxesHelper = new THREE.AxesHelper(4);
  scene.add(AxesHelper);

  const light = new THREE.DirectionalLight(0xffffff, 1);
  light.position.set(0, 10, 8);
  scene.add(light);

  let renderer = new THREE.WebGLRenderer();
  renderer.setSize(rendererWidth, rendererHeight);
  document.body.appendChild(renderer.domElement);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;

  // 通过threejs的方式获取canvas的宽高
  const {width, height} = renderer.getDrawingBufferSize(new THREE.Vector2());
  const shader = new THREE.ShaderMaterial({
    vertexShader,
    fragmentShader,
    uniforms: {
      iResolution: {value: new THREE.Vector2(width, height)},
      iTime: {value: 0.0}
    }
  });
  const plane = new THREE.Mesh(new THREE.PlaneGeometry(10, 10), shader);
  scene.add(plane);
  plane.onBeforeRender = () => {
    shader.uniforms.iTime.value += 0.01; // 动态更新时间
  };

  function animate() {
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
