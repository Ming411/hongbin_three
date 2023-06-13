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
  camera.position.set(0, 20, 20);

  const material = new THREE.ShaderMaterial({
    vertexShader,
    fragmentShader,
    uniforms: {
      upColor: {
        value: new THREE.Color('pink')
      },
      upColor2: {
        value: new THREE.Color('red')
      },
      downColor: {
        value: new THREE.Color('yellow')
      },
      time: {
        value: 0
      },
      speed: {
        value: 0
      },
      // 每个cube的高度
      height: {
        value: 0
      }
    }
  });

  const shaders: THREE.ShaderMaterial[] = [];
  for (let i = 0; i < 100; i++) {
    const height = Math.random() * 10;
    // 不建议分段，分段会导致渐变效果产生bug，需要单独修复
    // 因为每个分段所包含的顶点数目可能不同，从而导致渐变色在分界处出现边缘锯齿或渲染异常等问题
    const geometry = new THREE.BoxGeometry(Math.random(), height, Math.random(), 10, 10, 10);
    // const geometry = new THREE.BoxGeometry(Math.random(), height, Math.random());
    const itemShader = material.clone(); // 由于material是引用类型，所以需要克隆一份
    shaders.push(itemShader);
    const cube = new THREE.Mesh(geometry, itemShader);

    itemShader.uniforms.height.value = height;
    itemShader.uniforms.upColor.value.r = Math.random();
    itemShader.uniforms.upColor.value.g = Math.random();
    itemShader.uniforms.upColor.value.b = Math.random();
    itemShader.uniforms.upColor2.value.r = Math.random();
    itemShader.uniforms.upColor2.value.g = Math.random();
    itemShader.uniforms.upColor2.value.b = Math.random();
    itemShader.uniforms.speed.value = (0.5 - Math.random()) * 10;

    cube.position.x = (0.5 - Math.random()) * 20;
    cube.position.z = (0.5 - Math.random()) * 15;
    cube.position.y = height / 2; // 默认的cube的原点在中心，所以需要将其向上移动一半的高度
    scene.add(cube);
  }

  // 遮挡住下面的cube
  const planeGeometry = new THREE.PlaneGeometry(30, 30);
  const planeMaterial = new THREE.MeshBasicMaterial({
    color: 'aqua'
  });
  const plane = new THREE.Mesh(planeGeometry, planeMaterial);
  plane.rotation.x = -Math.PI / 2;
  scene.add(plane);

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

  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  });
  function animate() {
    shaders.forEach(shader => {
      shader.uniforms.time.value += 0.01;
    });

    controls.update();
    renderer.render(scene, camera);
    requestAnimationFrame(animate);
  }
  animate();
});
</script>

<style scoped lang="scss"></style>
