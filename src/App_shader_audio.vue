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

class AudioTexture {
  tAudioData!: THREE.DataTexture;
  analyser?: THREE.AudioAnalyser;
  constructor(file: string, isWebGL2: boolean) {
    this.init(file, isWebGL2);
  }
  init(file: string, isWebGL2: boolean) {
    const fftSize = 128;
    const listener = new THREE.AudioListener();
    const audio = new THREE.Audio(listener);
    if (/(iPad|iPhone|iPod)/g.test(navigator.userAgent)) {
      const loader = new THREE.AudioLoader();
      loader.load(file, function (buffer) {
        audio.setBuffer(buffer);
        audio.play();
      });
    } else {
      const mediaElement = new Audio(file);
      mediaElement.play();
      // mediaElement.loop = true; // 循环播放
      audio.setMediaElementSource(mediaElement);
    }
    this.analyser = new THREE.AudioAnalyser(audio, fftSize);
    const format = isWebGL2 ? THREE.RedFormat : THREE.LuminanceFormat;
    this.tAudioData = new THREE.DataTexture(this.analyser.data, fftSize / 2, 1, format);
  }
  update() {
    if (this.analyser) {
      this.analyser.getFrequencyData();
      this.tAudioData.needsUpdate = true;
    }
  }
}
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

  const {width, height} = renderer.getDrawingBufferSize(new THREE.Vector2());
  const shader = new THREE.ShaderMaterial({
    vertexShader,
    fragmentShader,
    uniforms: {
      iResolution: {value: new THREE.Vector2(width, height)},
      iTime: {value: 0.0},
      iChannel0: {
        value: new THREE.TextureLoader().load('./audio_textures/taiyang.jpg', t => {
          t.wrapS = THREE.RepeatWrapping; // 水平方向 重复
          t.wrapT = THREE.RepeatWrapping;
        })
      },
      iChannel1: {
        value: null
      }
    }
  });
  const plane = new THREE.Mesh(new THREE.PlaneGeometry(10, 10), shader);
  scene.add(plane);

  document.addEventListener('click', () => {
    const audioTexture = new AudioTexture(
      './audio_textures/taiyang.mp3',
      renderer.capabilities.isWebGL2
    );
    shader.uniforms.iChannel1.value = audioTexture.tAudioData;
    plane.onBeforeRender = () => {
      audioTexture.update();
      shader.uniforms.iTime.value += 0.01;
    };
  });

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
