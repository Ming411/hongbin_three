varying vec2 vUv;  // uv用来获取纹理坐标
uniform sampler2D texture1; // 传入的图片
uniform sampler2D myShaderPass;
// 噪声函数
float random(vec2 st) {
  return fract(sin(dot(st.xy, vec2(12.9898, 78.233))) * 43758.5453123);
}
void main() {
  // vec3 color = vec3(1.0,1.0,1.0); // 默认设置会全局覆盖，但我们想要的是叠加效果
  vec3 color = texture2D(myShaderPass, vUv).rgb; // 叠加效果
  vec3 color1 = texture2D(texture1, vUv).rgb; // 背景贴图转rgb
  // 我们可以基于这个color来制作特效
  if(color.r == 0.0) {
  // 因为背景是黑色0,0,0 针对背景做特效
  // color+=0.5;
    // color += random(vUv); // 噪声
    color += random(vUv) * color1; // 噪声
  }
  gl_FragColor = vec4(color, 1.0);
}