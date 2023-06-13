varying vec3 vColor;
uniform vec3 upColor;
uniform vec3 upColor2;
uniform vec3 downColor;
uniform float time;
uniform float speed;
uniform float height;
void main() {

/*   // 普通未分段
  vec3 disColor = upColor2 - upColor; // 颜色插值
  vec3 transformed = position;  // 不建议直接修改position
  vColor = downColor;
  if(position.y > 0.0) {
    // threejs内部会自动进行插值运算，渐变
    // vColor = upColor;
    vColor = upColor + disColor * abs(cos(time));  // 动态渐变
    transformed.y -= cos(time) * speed; // 动态变化高度
  } */

  // !!! 注意 我们外面 cube.position.y = height / 2; 修改的是mesh的位置
  // !!! 并不是shader中position的值，shader中的position是geometry的值 默认是：(0,0)
  // !!! 模型矩阵才是mesh的位置

  // 用于修复分段渐变
  vec3 transformed = position;
  vec3 disUpColor = upColor2 - upColor; // top面颜色插值
  vec3 realUpColor = upColor + disUpColor * abs(cos(time)); // top面动态渐变
  vec3 disColor = realUpColor - downColor;  // 颜色插值
  // percent 为点在高度上的百分比
  float percent = (position.y - height / -2.0) / height;
  // 从下到上渐变
  vColor = percent * disColor + downColor;
  if(position.y > height / -2.0) {
    // height / -2.0 为最下面的点
    // 如果点y大于最下面的点，才让它变化，只有上面一截运动
    transformed.y -= cos(time) * speed;
  }
  // max 函数，取二者中最大值
  transformed.y = max(transformed.y, height / -2.0); // 禁止下降到地面以下
  vec4 viewPosition = modelViewMatrix * vec4(transformed, 1.0);
  gl_Position = projectionMatrix * viewPosition;
}