uniform float progress;
uniform vec2 yBoundingBox;
attribute vec3 toPosition;
attribute float speed;
attribute float scale;
attribute vec3 color;
attribute vec3 toColor;
varying vec3 vColor;
void main() {

  vec3 disColor = toColor - color;

  vec3 dis = toPosition - position; // 两点之间的距离
  // vec3 pos = position + dis * progress; // 通过进度来控制点的位置

  // 在控制进度的基础上，再加上速度的控制
  float percent = progress / speed;
  vec3 pos;
  if(percent < 1.0) {
    pos = position + dis * percent;
    vColor = color + disColor * percent;
  } else {
    pos = toPosition;
    vColor = toColor;
  }

  // 自下向上出现的效果
  // yBoundingBox.y 最大值 ， yBoundingBox.x 最小值
  float yPercent = (toPosition.y - yBoundingBox.x) / (yBoundingBox.y - yBoundingBox.x);
  if(yPercent < percent) {
    // TODO 不懂
    pos = toPosition;
  }

  // modelViewMatrix 模型视图矩阵 = 视图矩阵viewMatrix * 模型矩阵modelMatrix 
  vec4 viewPosition = modelViewMatrix * vec4(pos, 1.0);
  // projectionMatrix 投影矩阵
  gl_Position = projectionMatrix * viewPosition;
  // gl_PointSize = 3.;
  gl_PointSize = scale;
  // 由于不同深度的点大小不同，需要根据变换后的深度值来调整点的大小
  // 其中 -viewPosition.z 表示顶点在相机坐标系下的深度，即视线长度
  gl_PointSize *= 50. / -(modelViewMatrix * vec4(pos, 1.0)).z; // z值越小，点越大
}