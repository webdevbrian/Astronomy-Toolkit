var scene, controls, renderer;

var smoothingFactor = 0.001;
var k = 0.05;
var timePerStep = 0.01;
var stepsPerFrame = 1;
var bodyMass = 0.0;
var bodyRadius = 0.02;
var trailLength = 500;

var canvasWidth, canvasHeight;

var arrowMesh;

var beginX, beginY, beginVector, endX = 0, endY = 0, isPressed = false;

var lastTime = Date.now();
var deltaT = 0;
var fps;

var paused = false;


var solarSystemPreset = [
  new Body(1.0, 0.0, 0.0, 0.00, 0.00, 0.05, 0xF0C400),
  new Body(0.01, 0.0, 0.4, 0.33, 0.00, 0.02, 0x1d5cfe),
  new Body(0.01, 0.0, 0.8, 0.25, 0.00, 0.02, 0x2aa353),
]

var bodies = cloneBodies(solarSystemPreset);

window.onload = function(){
  document.getElementById('bodies').innerHTML = bodies.length;
  init();
  initGUI();

  resize();

  renderer.domElement.addEventListener("mousedown", getDownPosition, false);
  renderer.domElement.addEventListener("mouseup", getUpPosition, false);
  renderer.domElement.addEventListener("mousemove", getMovePosition, false);

  addMeshes();

  render();

}

function render(){
  fps++;
  var now = new Date().getTime();
  var sinceLastFrame = now - lastTime;
  deltaT += sinceLastFrame;
  lastTime = now;
  if(deltaT > 200){
    document.getElementById('fps').innerHTML = fps * 5;
    deltaT = 0;
    fps = 0;
  }

  controls.update();
  computeAccelerations();
  if(!paused){
    for(var i = 0; i < stepsPerFrame; i++)
      updateBodies();
  }
  renderer.render(scene, camera);
  requestAnimationFrame(render);

}

function updateBodies(){
  for(var i = 0; i < bodies.length; i++){
    bodies[i].update(timePerStep, trailLength, scene);
  }
}

function addMeshes(){
  for(body of bodies){
    scene.add(body.mesh);
    scene.add(body.trail);
  }
}

function computeAccelerations(){
	for(var  i = 0; i < bodies.length; i++){
		bodies[i].resetAcceleration();
		for(var j = 0; j < bodies.length; j++){
			if(i != j){
				var deltaX = bodies[j].x - bodies[i].x;
				var deltaY = -bodies[i].y + bodies[j].y;
				var d = Math.sqrt(deltaX * deltaX + deltaY * deltaY) + smoothingFactor;
				var acc = k * bodies[j].mass / (d * d);
				bodies[i].accelerationX += acc * deltaX / d;
				bodies[i].accelerationY += acc * deltaY / d;
			}
		}
  }
}

function getDownPosition(e){
	var x = e.clientX;
	var y = e.clientY;
	if(e.which == 1){

		beginX = endX = x;
		beginY = endY = y;

    beginVector = screenToWorldCoordinates(beginX, beginY);
    console.log(beginVector.x + " " + beginVector.y);

    var lineMaterial = new THREE.LineBasicMaterial({color: 0xffffff});
    var lineGeom = new THREE.Geometry();
    lineGeom.vertices = [beginVector, beginVector];
    arrowMesh = new THREE.Line(lineGeom, lineMaterial);

    var direction = new THREE.Vector3().subVectors(beginVector, new THREE.Vector3(0.7, 0.5, 0.0));
  //  arrowMesh = new THREE.ArrowHelper(direction.clone().normalize(), beginVector, 2.0, 0xffffff, 1.0, 1.0);
    //arrowMesh.cone.visible = true;
    scene.add(arrowMesh);

    isPressed = true;
	}

}

function getMovePosition(e){
	if(isPressed){
		endX = e.clientX;
		endY = e.clientY;

    var endVector = screenToWorldCoordinates(endX, endY);
    var direction = new THREE.Vector3().subVectors(endVector, beginVector);
    arrowMesh.geometry.vertices[1] = endVector;
    arrowMesh.geometry.verticesNeedUpdate = true;
	}
}

function getUpPosition(e){
	endX = e.clientX;
	endY = e.clientY;
	if(e.which == 1){
		isPressed = false;
    var endVector = screenToWorldCoordinates(endX, endY);
		var velX = 0.5 * (endVector.x - beginVector.x);
		var velY = 0.5 * (endVector.y - beginVector.y);
    scene.remove(arrowMesh);
		//size = computeRadius(bodyMass, bodyDensity);
		var body = new Body(bodyMass, beginVector.x, beginVector.y, velX, velY, bodyRadius, randomColor({format: 'hex'}));
    scene.add(body.mesh);
    scene.add(body.trail);
		bodies.push(body);
    document.getElementById('bodies').innerHTML = bodies.length;
	}
}

function screenToWorldCoordinates(x, y){
  var aspectRatio = canvasWidth / canvasHeight;
  var worldX = (aspectRatio * (2.0 * x / getBrowserWidth() - 1.0) + camera.position.x) / camera.zoom;
  var worldY = ((1.0 - 2.0 * y / getBrowserHeight()) + camera.position.y) / camera.zoom;

  return new THREE.Vector3(worldX, worldY, 0);
}

function cloneBodies(array){
	var returnedArray = [];
	for(var  i = 0; i < array.length; i++){
		body = new Body(array[i].mass, array[i].x, array[i].y, array[i].velocityX, array[i].velocityY, array[i].size, array[i].color);
		body.setPositions(array[i].positionsX, array[i].positionsY);
		returnedArray.push(body);
	}
	return returnedArray;
}

window.onresize = function(e){
  resize();
}

function resize(){

  canvasWidth = Math.floor(getBrowserWidth() * window.devicePixelRatio);
  canvasHeight = Math.floor(getBrowserHeight() * window.devicePixelRatio);
  var aspect = canvasWidth / canvasHeight;
  renderer.setSize(canvasWidth, canvasHeight);
  renderer.domElement.style.width = getBrowserWidth() + "px";
  renderer.domElement.style.height = getBrowserHeight() + "px";
  camera.left = -aspect;
  camera.right = aspect;
  camera.top = 1;
  camera.bottom = -1;
  camera.updateProjectionMatrix();
}

function initGUI(){
  var gui = new dat.GUI();
  var bodyFolder = gui.addFolder("Body Settings");
  bodyFolder.add(this, 'bodyMass', 0, 2).step(0.001).name("Mass");
  bodyFolder.add(this, 'bodyRadius', 0, 0.5).step(0.001).name("Radius");
  bodyFolder.open();

  var worldFolder = gui.addFolder("Simulation Settings");
  worldFolder.add(this, 'k', 0, 0.06).step(0.000001).name("G Constant");
  worldFolder.add(this, 'timePerStep', 0, 0.05).step(0.0001).name("Time Per Step");
  worldFolder.add(this, 'stepsPerFrame', 0, 10).step(1).name("Steps Per Frame");
  worldFolder.add(this, 'trailLength', 0, 1000).step(1).name("Trail Length");
  worldFolder.open();

  gui.add(this, 'clear').name("Clear ALL Bodies");
  gui.add(this, 'reset').name("Reset System");
}

function clear(){
  for(var i = 0; i < bodies.length; i++){
    scene.remove(bodies[i].mesh);
    scene.remove(bodies[i].trail);
  }
  bodies = [];
}

function reset(){
  clear();
  bodies = cloneBodies(solarSystemPreset);
  addMeshes();
}

function init(){
  scene = new THREE.Scene();

  var aspect_ratio = getBrowserWidth() / getBrowserHeight();
  camera = new THREE.OrthographicCamera(-aspect_ratio, aspect_ratio, 1, -1, 1, 1000 );
  //camera = new THREE.PerspectiveCamera(75, aspect_ratio, 0.01, 200)
  camera.lookAt(new THREE.Vector3(0,0,0));
  renderer = new THREE.WebGLRenderer({antialias:true, });


  renderer.setSize(canvasWidth, canvasHeight);
  scene.background = new THREE.Color(0x020202);

  renderer.domElement.style="position:absolute; top:0px; left:0px; margin:0px; width: 100%; height: 100%;"

  document.body.appendChild(renderer.domElement);

  camera.position.z = 1;
  camera.zoom = 1;
  camera.updateProjectionMatrix();

  controls = new THREE.OrthographicTrackballControls(camera, renderer.domElement);
  controls.noRotate = true;
  controls.zoomSpeed = 0.12;
  controls.rotateCamera();
  controls.minDistance = 2;
  controls.maxDistance = 10;
  controls.dynamicDampingFactor = 0.95;
}
