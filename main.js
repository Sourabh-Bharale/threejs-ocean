import './style.css'

import * as THREE from 'three';

import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { Water } from './Water';
import { Sky } from 'three/examples/jsm/objects/Sky.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'

let camera, scene, renderer;
let controls, water, sun;

const loader = new GLTFLoader()

class Duck {
  constructor(){
    loader.load('/scene.gltf',(duck)=>{
      // console.log(duck)
      scene.add(duck.scene)
      duck.scene.position.set(20,15,-35)
      duck.scene.scale.set(5,5,5)
      duck.scene.rotation.set(0,Math.PI/6,0)

      this.duck = duck.scene
    })
  }
  update(){
    if(this.duck){
      this.duck.rotation.y +=0.0001
    }
  }
}

const duck = new Duck()



init();
animate();

function init() {



  renderer = new THREE.WebGLRenderer();
  renderer.setPixelRatio( window.devicePixelRatio );
  renderer.setSize( window.innerWidth, window.innerHeight );
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  document.body.appendChild( renderer.domElement );

  //

  scene = new THREE.Scene();

  camera = new THREE.PerspectiveCamera( 55, window.innerWidth / window.innerHeight, 1, 20000 );
  camera.position.set( -10, -30, 100 );

  //

  sun = new THREE.Vector3();


  // Water

  const waterGeometry = new THREE.PlaneGeometry( 10000, 10000 );

  water = new Water(
    waterGeometry,
    {
      textureWidth: 1080,
      textureHeight: 1080,
      waterNormals: new THREE.TextureLoader().load( '/waterNormal5.jpg', function ( texture ) {

        texture.wrapS = texture.wrapT = THREE.RepeatWrapping;

      } ),
      sunDirection: new THREE.Vector3(),
      sunColor: 0xffffff,
      waterColor: 0x001e0f,
      distortionScale: 0.7,
      fog: scene.fog !== undefined
    }
  );

  water.rotation.x = - Math.PI / 2;

  scene.add( water );

  // Skybox

  const sky = new Sky();
  sky.scale.setScalar( 10000 );
  scene.add( sky );

  const skyUniforms = sky.material.uniforms;

  skyUniforms[ 'turbidity' ].value = 2;
  skyUniforms[ 'rayleigh' ].value = 0.1;
  skyUniforms[ 'mieCoefficient' ].value = 0.0005;
  skyUniforms[ 'mieDirectionalG' ].value = 0.8;

  const parameters = {
    elevation: 2,
    azimuth: 180
  };

  const pmremGenerator = new THREE.PMREMGenerator( renderer );
  let renderTarget;

  function updateSun() {

    const phi = THREE.MathUtils.degToRad( 90 - parameters.elevation );
    const theta = THREE.MathUtils.degToRad( parameters.azimuth );

    sun.setFromSphericalCoords( 1, phi, theta );

    sky.material.uniforms[ 'sunPosition' ].value.copy( sun );
    water.material.uniforms[ 'sunDirection' ].value.copy( sun ).normalize();

    if ( renderTarget !== undefined ) renderTarget.dispose();

    renderTarget = pmremGenerator.fromScene( sky );

    scene.environment = renderTarget.texture;

  }

  updateSun();



  controls = new OrbitControls( camera, renderer.domElement );
  controls.maxPolarAngle = Math.PI * 0.495;
  controls.target.set( 0, 10, 0 );
  controls.minDistance = 40.0;
  controls.maxDistance = 200.0;
  controls.update();

  const waterUniforms = water.material.uniforms;


  window.addEventListener( 'resize', onWindowResize );

}

function onWindowResize() {

  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize( window.innerWidth, window.innerHeight );

}

function animate() {

  requestAnimationFrame( animate );
  render();
  duck.update()

}

function render() {

  // const time = performance.now() * 0.001;


  water.material.uniforms[ 'time' ].value += 1.0 / 60.0;

  renderer.render( scene, camera );

}