varying vec3 vColor;
void main() {
  // vec3 color = vec3(0.35f, 0.15f, 0.25f);
  // gl_FragColor = vec4(vColor, 1.0);

  // 计算当前像素相对于点精灵纹理坐标(0.5,0.5)的距离
  float strength = distance(gl_PointCoord, vec2(0.5));
  // 计算当前像素相对于点精灵中心位置的距离
  float dis = length(gl_PointCoord.xy - 0.5);
  // 其中dis越接近0.5，返回值越接近0；dis越接近0.0，返回值越接近1。 边缘模糊效果
  dis = smoothstep(0.5, 0.0, dis);
  // 指定阈值为0.5，将距离值中小于0.5的部分设置为0，大于等于0.5的部分设置为1
  // 得到的strength变量表示当前像素是否在点精灵的半径范围内。
  strength = step(0.5, strength);
  // 将strenght变量取反，使得在点精灵半径范围内的像素得到较小的值，而在半径范围外的像素得到较大的值
  strength = 1.0 - strength;

// 圆形像素外不渲染
  if(strength == 0.5)
    discard;
  if(dis == 0.0)
    discard;
  gl_FragColor = vec4(vColor, strength * dis);
}