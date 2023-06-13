import * as THREE from 'three';
import vertexShader from '../shaders/vertexShader.glsl';
import fragmentShader from '../shaders/fragmentShader.glsl';

interface ITranslate {
  geometry: THREE.BufferGeometry<THREE.NormalBufferAttributes>;
  color: THREE.Color;
}

export class ParticleEffect {
  pointNumber: number;
  bufferGeometry: THREE.BufferGeometry<THREE.NormalBufferAttributes>;
  position: Float32Array;
  material: THREE.ShaderMaterial;
  particle: THREE.Points<THREE.BufferGeometry<THREE.NormalBufferAttributes>, THREE.ShaderMaterial>;
  toPosition: Float32Array;
  speed: Float32Array;
  color: Float32Array;
  toColor: Float32Array;
  scale: Float32Array;
  initPosition: Float32Array;
  constructor(pointNumber = 1000) {
    this.pointNumber = pointNumber;
    this.bufferGeometry = new THREE.BufferGeometry();
    this.material = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms: {
        progress: {value: 0}, // 进度
        yBoundingBox: {value: new THREE.Vector2(-100, 100)} // y轴的边界
      },
      blending: THREE.AdditiveBlending, // 混合模式,这样做的话,粒子的颜色就会叠加,颜色更亮
      transparent: true,
      depthTest: true
    });
    // 设置粒子的位置
    this.position = new Float32Array(this.pointNumber * 3); // 三个参数表示一个点的坐标
    this.bufferGeometry.setAttribute('position', new THREE.BufferAttribute(this.position, 3));
    // 设置粒子的目标位置
    this.toPosition = new Float32Array(this.pointNumber * 3);
    this.bufferGeometry.setAttribute('toPosition', new THREE.BufferAttribute(this.toPosition, 3));
    // 设置初始位置
    this.initPosition = new Float32Array(this.pointNumber * 3);
    // 设置粒子的速度
    this.speed = new Float32Array(this.pointNumber);
    this.bufferGeometry.setAttribute('speed', new THREE.BufferAttribute(this.speed, 1));
    // 设置粒子的大小
    this.scale = new Float32Array(this.pointNumber);
    this.bufferGeometry.setAttribute('scale', new THREE.BufferAttribute(this.scale, 1));
    // 设置粒子的颜色
    this.color = new Float32Array(this.pointNumber * 3);
    this.bufferGeometry.setAttribute('color', new THREE.BufferAttribute(this.color, 3));
    // 设置粒子的目标颜色
    this.toColor = new Float32Array(this.pointNumber * 3);
    this.bufferGeometry.setAttribute('toColor', new THREE.BufferAttribute(this.toColor, 3));

    this.particle = new THREE.Points(
      this.bufferGeometry,
      // new THREE.PointsMaterial({color: 0xffffff, size: 0.5})
      this.material
    );

    this.init();
  }
  init() {
    // 默认开始的时候,粒子的位置是随机的
    for (let i = 0; i < this.pointNumber; i++) {
      this.toPosition[i * 3] = (Math.random() - 0.5) * 50;
      this.toPosition[i * 3 + 1] = (Math.random() - 0.5) * 50;
      this.toPosition[i * 3 + 2] = (Math.random() - 0.5) * 50;

      // 初始化位置，用于回滚到-1项不报错
      this.initPosition[i * 3] = this.toPosition[i * 3];
      this.initPosition[i * 3 + 1] = this.toPosition[i * 3 + 1];
      this.initPosition[i * 3 + 2] = this.toPosition[i * 3 + 2];

      // 粒子的速度随机,一定要控制在0-1之间
      this.speed[i] = Math.random() * 0.5 + 0.5;
      // 粒子的大小随机
      this.scale[i] = Math.random();
    }
    this.bufferGeometry.attributes.toPosition.needsUpdate = true; // 更新粒子的位置
    this.bufferGeometry.attributes.speed.needsUpdate = true; // 更新粒子的速度
    this.bufferGeometry.attributes.scale.needsUpdate = true; // 更新粒子的大小
  }
  // 设置粒子的进度
  setProgress(progress: number) {
    this.material.uniforms.progress.value = progress;
  }
  // 滚动变换
  translate(from: ITranslate, to: ITranslate) {
    // from即该段动画的起始位置，to即该段动画的结束位置
    const fromPosition = from.geometry.getAttribute('position');
    const toPosition = to.geometry.getAttribute('position');

    let fromIndex = 0;
    let toIndex = 0;
    for (let i = 0; i < this.pointNumber; i++) {
      const i3 = i * 3;
      fromIndex %= fromPosition.count;
      toIndex %= toPosition.count;

      const fromIndex3 = fromIndex * 3;
      const toIndex3 = toIndex * 3;

      this.position[i3] = fromPosition.array[fromIndex3];
      this.position[i3 + 1] = fromPosition.array[fromIndex3 + 1];
      this.position[i3 + 2] = fromPosition.array[fromIndex3 + 2];

      this.toPosition[i3] = toPosition.array[toIndex3];
      this.toPosition[i3 + 1] = toPosition.array[toIndex3 + 1];
      this.toPosition[i3 + 2] = toPosition.array[toIndex3 + 2];

      this.color[i3] = from.color['r'];
      this.color[i3 + 1] = from.color['g'];
      this.color[i3 + 2] = from.color['b'];
      this.toColor[i3] = to.color['r'];
      this.toColor[i3 + 1] = to.color['g'];
      this.toColor[i3 + 2] = to.color['b'];

      this.speed[i] = Math.random() * 0.5 + 0.5;

      fromIndex++;
      toIndex++;
    }

    this.bufferGeometry.attributes.position.needsUpdate = true;
    this.bufferGeometry.attributes.toPosition.needsUpdate = true;
    this.bufferGeometry.attributes.color.needsUpdate = true;
    this.bufferGeometry.attributes.toColor.needsUpdate = true;
    this.bufferGeometry.attributes.speed.needsUpdate = true;
  }

  // 将粒子的位置设置为geometry的位置
  to(geometry: THREE.BufferGeometry, color: THREE.Color[]) {
    // 计算出包围盒，可以通过包围盒的min和max来获取到包围盒的长宽高
    !geometry.boundingBox && geometry.computeBoundingBox();
    const {min, max} = geometry.boundingBox!; // 都是vec3

    // 设置粒子的位置，按规律出现，自下向上
    this.particle.material.uniforms.yBoundingBox.value.set(min.y, max.y);

    const disColor = new THREE.Color(); // 用来计算颜色的差值
    disColor.r = color[1].r - color[0].r;
    disColor.g = color[1].g - color[0].g;
    disColor.b = color[1].b - color[0].b;
    // array 长度是由 geometry 的顶点的个数决定的,也就是我们划分的分数
    const {array, count} = geometry.getAttribute('position');
    let targetIndex = 0;
    for (let i = 0; i < this.pointNumber; i++) {
      const i3 = i * 3;
      // 这样做是为了让粒子的位置均匀的分布在geometry上,因为粒子的个数可能比我们的顶点数多
      targetIndex %= count;
      // 因为余数不可能超过count,所以这样做可以让粒子的位置均匀的分布在geometry上
      const targetIndex3 = targetIndex * 3;

      // 第一次设置完成之后toPosition的位置就是boxGeometry
      // 第二次设置完成之后toPosition的位置就是sphereGeometry
      // 粒子的初始位置从init中获取
      this.position[i3] = this.toPosition[i3];
      this.position[i3 + 1] = this.toPosition[i3 + 1];
      this.position[i3 + 2] = this.toPosition[i3 + 2];
      // 粒子的目标位置设置成geometry的位置
      this.toPosition[i3] = array[targetIndex3];
      this.toPosition[i3 + 1] = array[targetIndex3 + 1];
      this.toPosition[i3 + 2] = array[targetIndex3 + 2];

      this.speed[i] = Math.random() * 0.5 + 0.5;
      this.scale[i] = Math.random();

      this.color[i3] = this.toColor[i3];
      this.color[i3 + 1] = this.toColor[i3 + 1];
      this.color[i3 + 2] = this.toColor[i3 + 2];
      // 粒子的目标位置设置成geometry的位置
      /* this.toColor[i3] = color['r'];
      this.toColor[i3 + 1] = color['g'];
      this.toColor[i3 + 2] = color['b']; */

      // 渐变色  precent是粒子的位置在x轴上的百分比
      const precent = (this.toPosition[i3] - min.x) / (max.x - min.x);
      // const precent = (this.toPosition[i3 + 1] - min.y) / (max.y - min.y);
      // const precent = (this.toPosition[i3 + 2] - min.z) / (max.z - min.z);
      this.toColor[i3] = color[0].r + disColor.r * precent;
      this.toColor[i3 + 1] = color[0].g + disColor.g * precent;
      this.toColor[i3 + 2] = color[0].b + disColor.b * precent;
      targetIndex++;
    }
    // 更新粒子！！！
    this.bufferGeometry.attributes.position.needsUpdate = true;
    this.bufferGeometry.attributes.toPosition.needsUpdate = true;
    this.bufferGeometry.attributes.speed.needsUpdate = true;
    this.bufferGeometry.attributes.scale.needsUpdate = true;
    this.bufferGeometry.attributes.color.needsUpdate = true;
    this.bufferGeometry.attributes.toColor.needsUpdate = true;
  }
}
