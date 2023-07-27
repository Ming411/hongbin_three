import gsap from 'gsap';
import {Vector2, type Vector3} from 'three';
export class Shake {
  // 不直接修改camera的position，因为camera的position是引用类型，会影响到其他地方
  pause = false; // 暂停
  cameraPosition: Vector3;
  xQuickTo;
  yQuickTo;
  xQuickToTween?: gsap.core.Tween;
  yQuickToTween?: gsap.core.Tween;
  point = new Vector2(); // 用于保存鼠标位置
  constructor(public camera: THREE.Camera, public dom: HTMLElement) {
    this.cameraPosition = this.camera.position.clone();
    // quickTo 适用于频繁变换
    this.xQuickTo = gsap.quickTo(this.camera.position, 'x', {duration: 0.5});
    this.yQuickTo = gsap.quickTo(this.camera.position, 'y', {duration: 0.5});
    // dom.addEventListener('mousemove', this.mouseMove);
    dom.addEventListener('mousemove', this.selfMouseMove);
  }
  selfMouseMove = (e: MouseEvent) => this.mouseMove.call(this, e);
  destroyMouseMove = () => {
    // 组件销毁时 取消监听
    this.dom.removeEventListener('mousemove', this.selfMouseMove);
    this.dom.removeEventListener('mousemove', this.mouseMove);
  };
  mouseMove = (e: MouseEvent) => {
    const x = (e.clientX / window.innerWidth) * 2 - 1;
    const y = ((window.innerHeight - e.clientY) / window.innerHeight) * 2 - 1;
    if (this.pause) {
      this.xQuickToTween && this.xQuickToTween.pause();
      this.yQuickToTween && this.yQuickToTween.pause();
      this.point.set(x, y);
    } else {
      // this.camera.position.x = this.cameraPosition.x + x;
      // this.camera.position.y = this.cameraPosition.y + y;
      this.xQuickToTween = this.xQuickTo(
        this.cameraPosition.x + x,
        Number.isNaN(this.point.x) ? undefined : this.cameraPosition.x + this.point.x // 开始位置
      );
      this.yQuickToTween = this.yQuickTo(
        this.cameraPosition.y + y,
        Number.isNaN(this.point.y) ? undefined : this.cameraPosition.y + this.point.y
      );

      this.point.set(NaN, NaN);
    }
  };
}

export class CameraShake extends Shake {
  constructor(...params: ConstructorParameters<typeof Shake>) {
    super(...params);
    this.dom.addEventListener('mousedown', this.selfMouseDown);
  }
  mouseDown = () => {
    this.pause = true;
    this.dom.addEventListener('mouseup', this.selfMouseUp, {
      once: true // 只执行一次
    });
  };
  mouseUp = () => {
    //鼠标按下又抬起未移动 point是NaN不能参与计算 也不需要计算
    if (Number.isNaN(this.point.x)) return (this.pause = false);
    gsap.to(this.camera.position, {
      // 鼠标弹起   摄像机回到鼠标按下时的位置
      x: this.cameraPosition.x + this.point.x,
      y: this.cameraPosition.y + this.point.y,
      z: this.cameraPosition.z,
      duration: 0.5,
      onComplete: () => {
        this.pause = false;
      }
    });
  };
  selfMouseDown = () => this.mouseDown.call(this);
  selfMouseUp = () => this.mouseUp.call(this);
  destroyMouseDown = () => {
    this.destroyMouseMove();
    this.dom.removeEventListener('mousedown', this.selfMouseDown);
  };
}
