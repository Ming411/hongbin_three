<template></template>

<script setup lang="ts">
import {onMounted} from 'vue';
import * as THREE from 'three';
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls.js';
import {EffectComposer} from 'three/examples/jsm/postprocessing/EffectComposer.js';
import {RenderPass} from 'three/examples/jsm/postprocessing/RenderPass.js';
import {ShaderPass} from 'three/examples/jsm/postprocessing/ShaderPass.js';
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
  camera.position.set(0, 0, 3);

  const geometry = new THREE.BoxGeometry(1, 1, 1);
  const material = new THREE.MeshBasicMaterial({color: 'pink'});
  const cube = new THREE.Mesh(geometry, material);
  scene.add(cube);

  const AxesHelper = new THREE.AxesHelper(4);
  scene.add(AxesHelper);

  let renderer = new THREE.WebGLRenderer({
    // alpha: true
  });
  renderer.setSize(rendererWidth, rendererHeight);
  document.body.appendChild(renderer.domElement);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;

  /* 后期特效 */
  const effectComposer = new EffectComposer(renderer); // 效果合成器
  effectComposer.setSize(rendererWidth, rendererHeight); // 设置尺寸
  effectComposer.setPixelRatio(Math.min(window.devicePixelRatio, 2)); // 设置像素比
  const renderPass = new RenderPass(scene, camera); // 渲染通道
  effectComposer.addPass(renderPass); // 添加渲染通道,默认渲染最后一个
  // 自定义后期渲染
  const shaderPass = new ShaderPass(
    new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms: {
        // 可以拿到上一个渲染通道的结果，返回值是一个纹理
        myShaderPass: {
          value: null
        },
        texture1: {
          value: new THREE.TextureLoader().load(
            'https://cdn.jsdelivr.net/gh/Ming411/imgRepo/img/hexobg.png'
          )
        }
      }
    }),
    'myShaderPass' // 后期渲染通道名称
  );
  effectComposer.addPass(shaderPass);

  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    effectComposer.setSize(window.innerWidth, window.innerHeight); // 设置尺寸
    effectComposer.setPixelRatio(Math.min(window.devicePixelRatio, 2)); // 设置像素比
  });
  function animate() {
    controls.update();
    renderer.render(scene, camera);
    effectComposer.render(); // 更新效果合成器
    requestAnimationFrame(animate);
  }
  animate();
});
</script>

<style scoped lang="scss"></style>
