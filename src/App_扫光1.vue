<template></template>

<script setup lang="ts">
import {onMounted} from 'vue';
import * as THREE from 'three';
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls.js';
import vertexShader from './shaders/vertexShader.glsl';
import fragmentShader from './shaders/fragmentShader.glsl';
import vt from './shaders/boxShaders/vertexShader.glsl';
import fm from './shaders/boxShaders/fragmentShader.glsl';
let scene: THREE.Scene;
let camera: THREE.PerspectiveCamera;
let rendererWidth = window.innerWidth;
let rendererHeight = window.innerHeight;
onMounted(async () => {
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x000000);
  camera = new THREE.PerspectiveCamera(75, rendererWidth / rendererHeight, 0.1, 1000);
  camera.position.set(0, 40, 3);

  const shader = new THREE.ShaderMaterial({
    vertexShader,
    fragmentShader,
    side: THREE.DoubleSide,
    transparent: true,
    uniforms: {
      scale: {value: 0},
      color1: {value: new THREE.Color('#faa')},
      color2: {value: new THREE.Color('#aaf')}
    }
  });

  const plane = new THREE.Mesh(
    new THREE.PlaneGeometry(50, 50),
    // new THREE.MeshBasicMaterial({color: 0x00ff00})
    shader
  );
  plane.rotation.x = -Math.PI / 2;
  plane.position.y += 0.5;
  scene.add(plane);

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

  // 创建物体
  const boxGroup = new THREE.Group();
  const boxShader = new THREE.ShaderMaterial({
    vertexShader: vt,
    fragmentShader: fm,
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
      forceColor: {
        value: new THREE.Color('#9ef')
      }
    }
  });
  const boxShaders: THREE.ShaderMaterial[] = [];
  const boxes: THREE.Mesh<THREE.BoxGeometry, THREE.ShaderMaterial>[] = [];
  for (let i = 0; i < 100; i++) {
    const height = Math.random() * 10;
    const geometry = new THREE.BoxGeometry(Math.random() * 2, height, Math.random() * 2, 1, 10, 1);
    const itemShader = boxShader.clone(); // 由于material是引用类型，所以需要克隆一份
    boxShaders.push(itemShader);
    const cube = new THREE.Mesh(geometry, itemShader);
    itemShader.uniforms.height = {value: height};
    itemShader.uniforms.upColor.value.g = Math.random();
    itemShader.uniforms.upColor2.value.g = Math.random();
    itemShader.uniforms.speed.value = (0.5 - Math.random()) * 10;
    cube.position.x = (0.5 - Math.random()) * 30;
    cube.position.z = (0.5 - Math.random()) * 30;
    cube.position.y = height / 2; // 默认的cube的原点在中心，所以需要将其向上移动一半的高度
    boxGroup.add(cube);
    boxes.push(cube);
  }
  const boxPlaneGeometry = new THREE.PlaneGeometry(50, 50);
  const boxPlaneMaterial = new THREE.MeshBasicMaterial({
    color: 'aqua'
  });
  const boxPlane = new THREE.Mesh(boxPlaneGeometry, boxPlaneMaterial);
  boxPlane.rotation.x = -Math.PI / 2;
  boxGroup.add(boxPlane);
  scene.add(boxGroup);

  // const clock = new THREE.Clock();
  function animate() {
    // 循环扫
    shader.uniforms.scale.value += 0.005;
    shader.uniforms.scale.value %= 1; // 将值限制在 0~1 之间
    /*   // 来回缩放扫
    const elapsedTime = clock.getElapsedTime();
    // 二者效果相等
    shader.uniforms.scale.value = Math.abs(Math.sin(elapsedTime / 5));
    // shader.uniforms.scale.value = Math.abs(Math.sin(performance.now() / 1000)); */

    const scale = shader.uniforms.scale.value;
    const far = scale * 25; // 通过修改数值同步扫描
    const near = (scale - 0.1) * 25;
    const decay = scale > 0.8 ? 1 - (scale - 0.8) * 5 : 1; // 边缘衰减
    boxes.forEach(box => {
      box.material.uniforms.time.value += 0.01;
      box.material.uniforms.decay = {
        value: decay
      };
      // distance 这里是计算box的中心点到plane的中心点的距离
      const distance = box.position.distanceTo(plane.position);
      // console.log(distance);
      if (distance < far && distance > near) {
        const percent = (far - distance) / (far - near); // 在扫描区域内占的百分比0~1
        box.material.uniforms.forceColorProgress = {value: percent};
      } else {
        box.material.uniforms.forceColorProgress = {value: -1};
      }
    });

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
