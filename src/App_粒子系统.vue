<template></template>

<script setup lang="ts">
import {onMounted, onUnmounted} from 'vue';
import * as THREE from 'three';
import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader.js';
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls.js';
import {ParticleEffect} from './utils/ParticleEffect';
import * as dat from 'dat.gui';
import {DRACOLoader} from 'three/examples/jsm/loaders/DRACOLoader.js';
let scene: THREE.Scene;
let camera: THREE.PerspectiveCamera;
let rendererWidth = window.innerWidth;
let rendererHeight = window.innerHeight;
let onScroll: {(): void; (this: Window, ev: Event): any; (this: Window, ev: Event): any};
onMounted(async () => {
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x000000);
  camera = new THREE.PerspectiveCamera(75, rendererWidth / rendererHeight, 0.1, 1000);
  camera.position.set(0, 0, 30);

  // const geometry = new THREE.BoxGeometry(1, 1, 1);
  // const material = new THREE.MeshBasicMaterial({color: 'pink'});
  // const cube = new THREE.Mesh(geometry, material);
  // scene.add(cube);

  // let light = new THREE.AmbientLight(0xffffff);
  // scene.add(light);

  const AxesHelper = new THREE.AxesHelper(4);
  scene.add(AxesHelper);

  const renderer = new THREE.WebGLRenderer({
    // alpha: true
  });
  renderer.setSize(rendererWidth, rendererHeight);
  document.body.appendChild(renderer.domElement);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.enableZoom = false; // 禁止缩放, 会影响滚动事件

  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  });
  function animate() {
    controls.update();
    renderer.render(scene, camera);
    requestAnimationFrame(animate);
  }
  animate();

  const particleEffect = new ParticleEffect(200000);
  scene.add(particleEffect.particle);

  // 加载模型
  const gltfLoader = new GLTFLoader();
  const dracoLoader = new DRACOLoader();
  dracoLoader.setDecoderPath('./draco/');
  gltfLoader.setDRACOLoader(dracoLoader);
  const gltf = await gltfLoader.loadAsync('./models/particle1.glb');

  const Wall = gltf.scene.getObjectByName('Wall') as THREE.Mesh;
  const people = gltf.scene.getObjectByName('people') as THREE.Mesh;
  const Worm_Gear = gltf.scene.getObjectByName('Worm_Gear') as THREE.Mesh;
  const HoneyComb = gltf.scene.getObjectByName('HoneyComb') as THREE.Mesh;
  if (!Wall || !people || !Worm_Gear || !HoneyComb) throw new Error('模型加载失败');

  const list = [
    {
      geometry: Wall.geometry,
      color: new THREE.Color('#f00')
      // name: 'Wall'
    },
    {
      geometry: people.geometry.scale(2, 2, 2),
      color: new THREE.Color('#00f')
      // name: 'people'
    },
    {
      geometry: Worm_Gear.geometry,
      color: new THREE.Color('#ff0')
      // name: 'Worm_Gear'
    },
    {
      geometry: HoneyComb.geometry,
      color: new THREE.Color('#0ff')
      // name: 'HoneyComb'
    }
  ];
  list[-1] = {
    geometry: new THREE.BufferGeometry().setAttribute(
      'position',
      new THREE.BufferAttribute(particleEffect.initPosition, 3)
    ),
    color: new THREE.Color('#000')
  };

  const consoles = {
    toggle: () => {
      // 目标位置是球形
      console.log('target is sphere');
      // particleEffect.to(new THREE.SphereGeometry(20, 64, 64), new THREE.Color('#00f'));
      particleEffect.to(people.geometry.scale(1, 1, 1), [
        new THREE.Color('#00f'),
        new THREE.Color('#f00')
      ]);
      consoles.progress = 0; // 重置动画
    },
    progress: 0
  };
  const gui = new dat.GUI();
  gui.add(consoles, 'toggle');
  gui.add(consoles, 'progress', 0, 1).onChange((v: number) => {
    particleEffect.setProgress(v);
  });

  // 自动播放动画
  // function animateForShader() {
  //   consoles.progress += 0.01;
  //   // 停留在结束位置
  //   if (consoles.progress > 1) consoles.progress = 1;
  //   particleEffect.setProgress(consoles.progress);
  //   requestAnimationFrame(animateForShader);
  // }
  // animateForShader();

  // particleEffect.to(Wall.geometry, new THREE.Color('#f00'));
  particleEffect.to(Wall.geometry.translate(0, -10, 0), [
    new THREE.Color('orangered'),
    new THREE.Color('aqua')
  ]);

  /*   let curr = 0;
  particleEffect.to(list[0].geometry, list[0].color);
  // -1px 是为了不让他滚动到滚出最后一个页面
  document.body.style.height = window.innerHeight * (list.length + 1) - 1 + 'px';
  onScroll = () => {
    const currentScrollHeight = window.scrollY;
    const percent = currentScrollHeight / window.innerHeight;
    const currentIndex = Math.floor(percent); // 当前滚动到第几个页面
    // if (curr !== currentIndex) {
    //   curr = currentIndex;
    //   particleEffect.to(list[curr].geometry, list[curr].color); // 回滚有问题
    // }
    if (currentIndex !== curr) {
      if (currentIndex > curr) {
        // 正序滚动
        particleEffect.translate(list[curr], list[currentIndex]);
      } else {
        // 倒序滚动
        console.log(list[currentIndex - 1], list[curr - 1]);
        particleEffect.translate(list[currentIndex - 1], list[curr - 1]);
      }
      curr = currentIndex;
    }
    particleEffect.setProgress(percent - currentIndex); // 当前页面的滚动百分比
  };
  window.addEventListener('scroll', onScroll); */
});

onUnmounted(() => {
  window.removeEventListener('scroll', onScroll);
  window.scrollTo(0, 0);
});
</script>

<style scoped lang="scss"></style>
