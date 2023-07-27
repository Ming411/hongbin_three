varying vec2 vUv;
void main() {
  // gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  // vec3 pos = position + vec3(1.0, 0.0, 0.0);
  vec3 pos = position;
  gl_Position = projectionMatrix * modelMatrix * viewMatrix * vec4(pos, 1.0);
  vUv = uv;
}