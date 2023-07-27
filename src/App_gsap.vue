<template></template>

<script setup lang="ts">
import {onMounted, onUnmounted} from 'vue';
import * as THREE from 'three';
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls.js';
import {DRACOLoader} from 'three/examples/jsm/loaders/DRACOLoader.js';
import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader.js';
import gsap from 'gsap';
import {CameraShake} from './utils/CameraShake';
let scene: THREE.Scene;
let camera: THREE.PerspectiveCamera;
let rendererWidth = window.innerWidth;
let rendererHeight = window.innerHeight;
let shake: CameraShake;
onMounted(async () => {
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x000000);
  camera = new THREE.PerspectiveCamera(75, rendererWidth / rendererHeight, 0.1, 1000);
  camera.position.set(0, 0, 5);

  const AxesHelper = new THREE.AxesHelper(4);
  scene.add(AxesHelper);

  // 将灯光添加到相机中，这样灯光就会跟随相机移动
  const light = new THREE.SpotLight(0xffffff, 2);
  light.angle = 1; // 光照角度
  light.penumbra = 1; // 衰减率,类似过渡效果
  camera.add(light);
  scene.add(camera);

  // draco 载入模型
  const dracoLoader = new DRACOLoader();
  dracoLoader.setDecoderPath('./draco/');
  const gltfLoader = new GLTFLoader();
  gltfLoader.setDRACOLoader(dracoLoader);
  // 一条线的模型
  gltfLoader.load('./models/line_bg.glb', gltf => {
    const group = new THREE.Group();
    group.rotateX(Math.PI / 2);
    group.position.z = -500;
    scene.add(group);

    for (let i = 0; i < 36; i++) {
      const item = gltf.scene.clone(true); // true 表示深度克隆
      item.position.setFromCylindricalCoords(
        10, // 半径
        (Math.PI / 180) * i * 10, // 每一个所在的弧度，360度分为36份
        0 // 高度
      );
      item.rotateX(Math.PI / 2); // 绕自身x轴旋转90度
      item.scale.x = Math.random() * 2; // 产生大小不一的线
      item.scale.y = Math.random() * 2;
      // addScalar 方法用于将一个随机偏移值加到每个分量上，使得模型的位置发生随机扰动。
      item.position.addScalar((0.5 - Math.random()) * 10);
      item.position.z += (0.5 - Math.random()) * 10; // 产生不同的z轴位置
      group.add(item);
    }

    gsap.to(group.position, {
      duration: 1,
      z: 0
    });
  });

  let renderer = new THREE.WebGLRenderer();
  renderer.setSize(rendererWidth, rendererHeight);
  document.body.appendChild(renderer.domElement);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;

  // const shake = new Shake(camera, renderer.domElement);
  shake = new CameraShake(camera, renderer.domElement);

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
onUnmounted(() => {
  shake.destroyMouseDown();
});
</script>

<style scoped lang="scss"></style>
