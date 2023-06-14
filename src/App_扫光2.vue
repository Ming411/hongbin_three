<template></template>

<script setup lang="ts">
import {onMounted} from 'vue';
import * as THREE from 'three';
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls.js';
let scene: THREE.Scene;
let camera: THREE.PerspectiveCamera;
let rendererWidth = window.innerWidth;
let rendererHeight = window.innerHeight;
onMounted(async () => {
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x000000);
  camera = new THREE.PerspectiveCamera(75, rendererWidth / rendererHeight, 0.1, 1000);
  camera.position.set(0, 10, 8);

  const AxesHelper = new THREE.AxesHelper(4);
  scene.add(AxesHelper);

  const light = new THREE.DirectionalLight(0xffffff, 1);
  light.position.set(0, 10, 8);
  scene.add(light);
  // const ambienLight = new THREE.AmbientLight(0xffffff);
  // scene.add(ambienLight);

  const scanTexture = {
    value: await new THREE.TextureLoader().loadAsync('./textures/Carbon.png')
    // value: await new THREE.TextureLoader().loadAsync('./textures/wallhaven-rrodj7.jpg')
  };
  let row = 10,
    col = 10;
  const boxGeo = new THREE.BoxGeometry(1, 1, 1);
  for (let r = 0; r < row; r++) {
    for (let l = 0; l < col; l++) {
      // 物理材质
      const material = new THREE.MeshPhysicalMaterial({
        color: 'orangered', // 颜色
        roughness: r / row, // 粗糙度
        metalness: l / col, // 金属度
        transmission: 1, // 透光性
        clearcoat: 0 // 清漆
      });
      material.iridescence = (3 * r) / row; // 彩虹色
      material.iridescenceIOR = 1.5; // 彩虹色的折射率
      const mesh = new THREE.Mesh(boxGeo, material);
      scene.add(mesh);
      mesh.position.set(r - row / 2, 0, l - col / 2);

      // 修改shader
      const uniforms = {
        iTime: {value: 0},
        iDirection: {
          // 方向 -0.5 ~ 0.5
          value: 0.5 - Math.random()
        },
        scanTexture // 扫光纹理
      };
      // onBeforeCompile 会在编译shader之前执行
      material.onBeforeCompile = shader => {
        Object.assign(shader.uniforms, uniforms);
        shader.vertexShader = `
          uniform float iTime;
          uniform float iDirection;
          varying vec2 vUv;
          ${shader.vertexShader}
        `;
        shader.vertexShader = shader.vertexShader.replace(
          '#include <begin_vertex>',
          `
          #include <begin_vertex>
          // transformed 是顶点坐标
          transformed.y += sin(iTime)*iDirection;
          vUv = uv; // 给uv赋值
          `
        );
        // ===================================> fragmentShader
        shader.fragmentShader = `
          uniform float iTime;
          uniform sampler2D scanTexture;
          varying vec2 vUv;
          ${shader.fragmentShader}
        `;
        shader.fragmentShader = shader.fragmentShader.replace(
          '#include <dithering_fragment>',
          `
          #include <dithering_fragment>
          // vWorldPosition 是世界坐标,需要开启透光性
          // dis 是世界坐标到原点的距离,修改这里制造不同位置效果的光圈
          float dis = distance(vWorldPosition.xz, vec2(0.0, 0.0));
          // dis = fract(dis/2.0); // 表示取小数部分 0 ~ 1,制造多条光圈
          dis = fract((dis-iTime)/2.0);
          if(dis < 1.0 && dis > 0.5){
            // 贴图，替换掉颜色即可
            vec3 scanColor = texture2D(scanTexture, vUv).rgb;

            float p = (dis - 0.5) / 0.5; // 0 ~ 1
            // mix 表示将两个颜色按照一定的比例混合
            gl_FragColor.rgb = mix(gl_FragColor.rgb, scanColor, p);
          }
          `
        );
      };
      // onBeforeRender 会在每次渲染之前执行，注意只会渲染可是窗口内的
      mesh.onBeforeRender = () => {
        uniforms.iTime.value += 0.01;
      };
    }
  }

  let renderer = new THREE.WebGLRenderer();
  renderer.setSize(rendererWidth, rendererHeight);
  document.body.appendChild(renderer.domElement);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
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
