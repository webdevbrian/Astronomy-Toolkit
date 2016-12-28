var scene, camera, controls;

var earthMesh, cloudMesh;
var EARTH_RADIUS_IN_SCREEN_UNITS = 100;

window.onload = function(){
  init();

  var light = new THREE.DirectionalLight( 0xffffff, 1 );
  light.position.set(999, 1, 1 ).normalize();
  light.target.position.set( 0, 0, 0);
  scene.add(light);
  createEarthMesh();
  render();
}

window.onresize = function(e){
  canvasWidth = getBrowserWidth();
  canvasHeight = getBrowserHeight();

  renderer.setSize(canvasWidth, canvasHeight);
  camera.aspect = canvasWidth / canvasHeight;
  camera.updateProjectionMatrix();
}


function render(){
  controls.update();
  renderer.render(scene, camera);
  requestAnimationFrame(render);

}

function createEarthMesh(){
  var geometry = new THREE.SphereGeometry(EARTH_RADIUS_IN_SCREEN_UNITS, 50, 50);

  var texture = THREE.ImageUtils.loadTexture("res/earthmap1k.jpg");
  var bump = THREE.ImageUtils.loadTexture("res/earthbump1k.jpg");
  var specular = THREE.ImageUtils.loadTexture("res/earthspec1k.jpg");
/*
  var texture = THREE.ImageUtils.loadTexture("res/8081-earthmap4k.jpg");
  var bump = THREE.ImageUtils.loadTexture("res/8081-earthbump4k.jpg");
  var specular = THREE.ImageUtils.loadTexture("res/8081-earthspec2k.jpg");*/

  var material =  new  THREE.MeshPhongMaterial({
      map: texture,
      opacity: 1,
      bumpMap: bump,
      bumpScale: 0.004,
      specularMap: specular,
      specular: new THREE.Color('grey'),
      shininess: 10,
   });
  earthMesh = new THREE.Mesh(geometry, material);
  earthMesh.position.set(0, 0, 0);

/*  var cloudGeometry = new THREE.SphereGeometry(1.01, 50, 50);
  var cloudMaterial = new THREE.MeshPhongMaterial({
    map: new THREE.ImageUtils.loadTexture("res/earthcloudmaptrans.jpg"),
    //side: THREE.DoubleSide,
    opacity: 0.8,
    //alphaMap: new THREE.ImageUtils.loadTexture("res/earthcloudmaptrans.jpg"),
    transparent: true,
    depthWrite: false
  })

  cloudMesh = new THREE.Mesh(cloudGeometry, cloudMaterial);
  earthMesh.add(cloudMesh);*/

  scene.add(earthMesh);
}

function init(){
  scene = new THREE.Scene();
  var canvasWidth = getBrowserWidth();
  var canvasHeight = getBrowserHeight();
  var aspect_ratio = canvasWidth / canvasHeight;
  camera = new THREE.PerspectiveCamera(75, aspect_ratio, 0.0000000001, 10000);
  camera.lookAt(new THREE.Vector3(0,0,0));
  camera.position.z = - 4 * EARTH_RADIUS_IN_SCREEN_UNITS;
  renderer = new THREE.WebGLRenderer({antialias:true});

  renderer.setSize(canvasWidth, canvasHeight);
  scene.background = new THREE.Color(0x020202);

  renderer.domElement.style="position:absolute; top:0px; left:0px; margin:0px; "

  document.body.appendChild(renderer.domElement);

  controls = new THREE.TrackballControls(camera, renderer.domElement);
  controls.rotateSpeed = 10;
  controls.zoomSpeed = 0.10;
  controls.rotateCamera();
  controls.minDistance = 0.1;
  controls.maxDistance = 60 * EARTH_RADIUS_IN_SCREEN_UNITS;
  controls.dynamicDampingFactor = 0.3;
}
