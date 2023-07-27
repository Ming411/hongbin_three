uniform sampler2D uTexture;
varying vec2 vUv;
void main() {
  vec4 uTextureColor = texture2D(uTexture, vUv);
  gl_FragColor = uTextureColor;
  // gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);
}