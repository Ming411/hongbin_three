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

  const buffer = new THREE.WebGLRenderTarget(1000, 1000); // 1000 为渲染分辨率
  const plane = new THREE.Mesh(
    new THREE.PlaneGeometry(10, 10),
    new THREE.MeshPhysicalMaterial({
      map: buffer.texture
    })
  );
  const bufferScene = new THREE.Scene();
  bufferScene.add(
    new THREE.Mesh(
      new THREE.BoxGeometry(1, 1, 1),
      new THREE.MeshBasicMaterial({
        color: '#faa'
      })
    )
  );
  scene.add(plane);

  function animate() {
    renderer.setRenderTarget(buffer); // 设置渲染目标
    renderer.render(bufferScene, camera);
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
