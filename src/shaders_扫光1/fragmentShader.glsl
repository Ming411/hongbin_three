varying vec2 vUv;
uniform float scale;
uniform vec3 color1;
uniform vec3 color2;
void main() {
  // uv 零点为左下角
  // vUv 是每个点的 uv 坐标

  // 每个点到uv中心的距离
  float dis = distance(vUv, vec2(0.5, 0.5));

// smoothstep 将0到1之间的值映射成0.4到0.5之间的值
  // float opacity = smoothstep(0.4, 0.5, dis);
  float opacity = smoothstep(0.4 * scale, 0.5 * scale, dis);
  // 不透明度乘以step函数，使得dis大于0.5时，opacity为0
  opacity *= step(dis, 0.5 * scale);

  // scale最大是1，这里我们让他到0.8时，opacity慢慢变成0，淡出效果
  // scale-0.8 最大是0.2，乘以5，最大是1，再乘以step函数，使得scale大于0.8时，等式右边为1，opacity为0
  opacity -= (scale - 0.8) * 5.0 * step(0.8, scale);

  vec3 disColor = color1 - color2; // 两个颜色的差值
  vec3 color = color2 + disColor * scale;  // 渐变色

/* // glsl中尽量少些if语句，因为if语句会影响性能，使用step替换
  if(dis > 0.5 * scale) {
    discard; // 中止这个点的渲染，使其产生圆形分段，相当于return
  } */

  // vec3 color = vec3(dis);
  // vec3 color = vec3(1.0) * opacity;
  // 这里修改alpha值,必须要在材质中开启transparent
  gl_FragColor = vec4(color, opacity);
}