var scene, controls, renderer;

var smoothingFactor = 0.001;
var k = 0.05;

var arrowMesh;

var beginX, beginY, beginVector, endX = 0, endY = 0, isPressed = false;

var lastTime = Date.now();
var deltaT = 0;
var fps;


var bodies = [
  new Body(1.0, 0.0, 0.0, 0.00, 0.00, 0.05, 0xF0C400),
  new Body(0, 0.0, 0.4, 0.23, 0.00, 0.02, 0x1d5cfe),
  new Body(0, 0.0, 0.8, 0.15, 0.00, 0.02, 0x2aa353),
]

window.onload = function(){
  init();

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
    console.log(fps * 5 + " " + bodies.length);
    deltaT = 0;
    fps = 0;
  }

  controls.update();
  computeAccelerations();
  updateBodies();
  renderer.render(scene, camera);
  requestAnimationFrame(render);

}

function updateBodies(){
  for(var i = 0; i < bodies.length; i++){
    bodies[i].update(0.01, scene);
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
  //  alert(beginVector.x + " " + beginVector.y);

    var direction = new THREE.Vector3().subVectors(beginVector, beginVector);
    arrowMesh = new THREE.ArrowHelper(direction.clone().normalize(), beginVector, direction.length(), 0xffffff);
    scene.add(arrowMesh);

    isPressed = true;

	}

	/*if(e.which == 3){
		for(var i = 0; i < bodies.length; i++){
			if(bodies[i].distanceTo(x - offsetX, y - offsetY) < bodies[i].size){
				console.log(i);
				selectedBody = i;
				isSelected = true;
				break;
			}
		}
	}*/
}

function getMovePosition(e){
	if(isPressed){
		endX = e.clientX;
		endY = e.clientY;

    var endVector = screenToWorldCoordinates(endX, endY);
    var direction = new THREE.Vector3().subVectors(endVector, beginVector);
    arrowMesh.setDirection(direction.normalize());
    var deltaX = endVector.x - beginVector.x;
    var deltaY = endVector.y - beginVector.y;
    arrowMesh.setLength(Math.sqrt(deltaX * deltaX + deltaY * deltaY));
	}
}

function getUpPosition(e){
	endX = e.clientX;
	endY = e.clientY;
	if(e.which == 1){
		isPressed = false;
		var velX = 0.5 * (endX - beginX) / getBrowserWidth();
		var velY = 0.5 * (endY - beginY) / getBrowserHeight();
    scene.remove(arrowMesh);
		//size = computeRadius(bodyMass, bodyDensity);
		var body = new Body(0, beginVector.x, beginVector.y, velX, velY, 0.02, 0xffffff);
    console.log(body);
    scene.add(body.mesh);
    scene.add(body.trail);
		bodies.push(body);
	}
}

function screenToWorldCoordinates(x, y){
  var worldX = 2 * x / getBrowserWidth() - 1;
  var worldY = 1 - 2 * y / getBrowserHeight();
  return new THREE.Vector3(worldX, worldY, 0);
}

function cloneBodies(array){
	var returnedArray = [];
	for(var  i = 0; i < array.length; i++){
		body = new Body(array[i].mass, array[i].x, array[i].y, array[i].velocityX, array[i].velocityY, array[i].color, array[i].size);
		body.setPositions(array[i].positionsX, array[i].positionsY);
		returnedArray.push(body);
	}
	return returnedArray;
}

window.onresize = function(e){
  resize();
}

function resize(){

  var canvasWidth = Math.floor(getBrowserWidth() * window.devicePixelRatio);
  var canvasHeight = Math.floor(getBrowserHeight() * window.devicePixelRatio);
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

function init(){
  scene = new THREE.Scene();

  canvasWidth = getBrowserWidth();
  canvasHeight = getBrowserHeight();
  aspect_ratio = canvasWidth / canvasHeight;
  camera = new THREE.OrthographicCamera(-aspect_ratio, aspect_ratio, 1, -1, 1, 1000 );
  //camera = new THREE.PerspectiveCamera(75, aspect_ratio, 0.01, 200)
  camera.lookAt(new THREE.Vector3(0,0,0));
  renderer = new THREE.WebGLRenderer({antialias:true, });


  renderer.setSize(canvasWidth, canvasHeight);
  scene.background = new THREE.Color(0x020202);

  renderer.domElement.style="position:absolute; top:0px; left:0px; margin:0px; width: 100%; height: 100%;"

  document.body.appendChild(renderer.domElement);

  camera.position.z = 2;

  controls = new THREE.OrthographicTrackballControls(camera, renderer.domElement);
  controls.noRotate = true;
  controls.zoomSpeed = 0.12;
  controls.rotateCamera();
  controls.minDistance = 2;
  controls.maxDistance = 10;
  controls.dynamicDampingFactor = 0.95;
}
