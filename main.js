import * as THREE from 'three';
import { OrbitControls } from 'OrbitControls';
import { GUI } from 'lil-gui';
// console.log(THREE)
// console.log(OrbitControls)
// console.log(GUI)
const canvas = document.querySelector('#c');
const renderer = new THREE.WebGLRenderer({ antialias: true, canvas });
const fov = 45;
const aspect = 2;  // canvas 的默认宽高 300:150
const near = 0.1;
const far = 100;
const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
camera.position.set(0, 10, 20);
const scene = new THREE.Scene();
scene.background = new THREE.Color('black');

// 控制相机
const controls = new OrbitControls(camera, canvas);
controls.target.set(0, 5, 0);
controls.update();

// 创建光照
const color = 0xFFFFFF;
const intensity = 1;
// 1.环境光（只是简单地将材质的颜色与光照颜色进行叠加，再乘以光照强度）
// const light = new THREE.AmbientLight(color, intensity);
// 2.半球光
const skyColor = 0xB1E1FF;  // light blue
const groundColor = 0xB97A20;  // brownish orange
// const light = new THREE.HemisphereLight(skyColor, groundColor, intensity);
// scene.add(light);
// 3.方向光(从一个无限大的平面内，发射出全部相互平行的光线)
// const light = new THREE.DirectionalLight(color, intensity);
// light.position.set(0, 10, 0);
// light.target.position.set(-5, 0, 0); // 设置照射方向
// scene.add(light);
// scene.add(light.target); // 加这个照射方向才起作用
// 方向光辅助对象
// const helper = new THREE.DirectionalLightHelper(light);
// scene.add(helper);
// 4.点光源(从一个点朝各个方向发射出光线的一种光照效果)
const light = new THREE.PointLight(color, intensity);
light.position.set(0, 10, 0);
// renderer.physicallyCorrectLights = true; // 必须设置这个，否则二使用power时光照很强
// light.power = 800;
// light.decay = 2;
// light.distance = Infinity;
scene.add(light);
// 点光源辅助对象
const helper = new THREE.PointLightHelper(light);
scene.add(helper);
// 5.聚光灯
// const light = new THREE.SpotLight(color, intensity);
// light.position.set(0, 10, 0);
// scene.add(light);
// scene.add(light.target);
// 聚光灯辅助对象
// const helper = new THREE.SpotLightHelper(light);
// scene.add(helper);
// 6.矩形区域光 见rectAreaLight.html

// 使用lil-gui手动定义光照颜色
class ColorGUIHelper {
  constructor(object, prop) {
    this.object = object;
    this.prop = prop;
  }
  get value() {
    return `#${this.object[this.prop].getHexString()}`;
  }
  set value(hexString) {
    this.object[this.prop].set(hexString);
  }
}

class DegRadHelper {
  constructor(object, prop) {
    this.object = object;
    this.prop = prop;
  }
  get value() {
    return THREE.MathUtils.radToDeg(this.object[this.prop])
  }
  set value(v) {
    this.object[this.prop] = THREE.MathUtils.degToRad(v)
  }
}

function makeXYZGUI(gui, vector3, name, onChangeFn) {
  const folder = gui.addFolder(name);
  folder.add(vector3, 'x', -10, 10).onChange(onChangeFn);
  folder.add(vector3, 'y', 0, 10).onChange(onChangeFn);
  folder.add(vector3, 'z', -10, 10).onChange(onChangeFn);
  folder.open();
}

function updateLight() {
  // light.target.updateMatrixWorld();
  helper.update();
}
updateLight();

const gui = new GUI();
// 环境光
gui.addColor(new ColorGUIHelper(light, 'color'), 'value').name('color');
// 半球光
// gui.addColor(new ColorGUIHelper(light, 'color'), 'value').name('skyColor');
// gui.addColor(new ColorGUIHelper(light, 'groundColor'), 'value').name('groundColor');
gui.add(light, 'intensity', 0, 2, 0.01);
// 方向光
// gui.add(light.target.position, 'x', -10, 10);
// gui.add(light.target.position, 'z', -10, 10);
// gui.add(light.target.position, 'y', 0, 10);

// 方向光控制、方向光目标点控制
// makeXYZGUI(gui, light.position, 'position', updateLight);
// makeXYZGUI(gui, light.target.position, 'target', updateLight);

// 点光源
gui.add(light, 'distance', 0, 40).onChange(updateLight);
makeXYZGUI(gui, light.position, 'position');
// gui.add(light, 'decay', 0, 4, 0.01);
// gui.add(light, 'power', 0, 1220);

// 聚光灯
// gui.add(new DegRadHelper(light, 'angle'), 'value', 0, 90).name('angle').onChange(updateLight); // 聚光灯的圆锥顶部角度大小通过 angle 属性设置，以弧度作单位
// gui.add(light, 'penumbra', 0, 1, 0.1); // 内圆锥是通过设置 penumbra 属性来定义的，属性值代表了内圆锥相对外圆锥大小变化的百分比。

// 创建平面
// 设置平面纹理
{
  const planeSize = 40;

  const loader = new THREE.TextureLoader();
  const texture = loader.load('https://threejs.org/manual/examples/resources/images/checker.png');
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.magFilter = THREE.NearestFilter;
  const repeats = planeSize / 2;
  texture.repeat.set(repeats, repeats);

  const planeGeo = new THREE.PlaneGeometry(planeSize, planeSize);
  const planeMat = new THREE.MeshPhongMaterial({
    map: texture,
    side: THREE.DoubleSide,
  });
  const mesh = new THREE.Mesh(planeGeo, planeMat);
  mesh.rotation.x = Math.PI * -.5;
  scene.add(mesh);
}

// 创建球体
{
  const sphereRadius = 3;
  const sphereWidthDivisions = 32;
  const sphereHeightDivisions = 16;
  const sphereGeo = new THREE.SphereGeometry(sphereRadius, sphereWidthDivisions, sphereHeightDivisions);
  const sphereMat = new THREE.MeshPhongMaterial({ color: '#CA8' });
  const mesh = new THREE.Mesh(sphereGeo, sphereMat);
  mesh.position.set(-sphereRadius - 1, sphereRadius + 2, 0);
  scene.add(mesh);
}
{
  const cubeSize = 4;
  const cubeGeo = new THREE.BoxGeometry(cubeSize, cubeSize, cubeSize);
  const cubeMat = new THREE.MeshPhongMaterial({ color: '#8AC' });
  const mesh = new THREE.Mesh(cubeGeo, cubeMat);
  mesh.position.set(cubeSize + 1, cubeSize / 2, 0);
  scene.add(mesh);
}

function resizeRendererToDisplaySize(renderer) {
  const canvas = renderer.domElement;
  const width = canvas.clientWidth;
  const height = canvas.clientHeight;
  const needResize = canvas.width !== width || canvas.height !== height;
  if (needResize) {
    renderer.setSize(width, height, false);
  }
  return needResize;
}
function render(time) {
  time *= 0.001;
  if (resizeRendererToDisplaySize(renderer)) {
    const canvas = renderer.domElement;
    camera.aspect = canvas.clientWidth / canvas.clientHeight;
    camera.updateProjectionMatrix();
  }
  renderer.render(scene, camera);
  requestAnimationFrame(render); // 这里必须调用requestAnimationFrame才能渲染出平面plane
}
requestAnimationFrame(render);