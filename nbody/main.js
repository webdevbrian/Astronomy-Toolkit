var scene, controls, renderer;

var smoothingFactor = 0.001;
var k = 0.05;
var timePerStep = 0.01;
var stepsPerFrame = 1;
var bodyMass = 0.001;
var bodyDensity = 90;
var trailLength = 500;

var canvasWidth, canvasHeight;

var arrowMesh;

var beginX, beginY, beginVector, endX = 0, endY = 0, isPressed = false;

var lastTime = Date.now();
var deltaT = 0;
var fps;

var paused = false;

var sunPreset = [new Body(1.000, 0.0, 0.00, 0.00, 0.00, 900, 0xF0C400),]

var solarSystemPreset = [
  new Body(1.000, 0.0, 0.00, 0.00, 0.00, 900, 0xF0C400),
  new Body(0.001, 0.0, 0.30, 0.35, 0.00, 90, 0x1d5cfe),
  new Body(0.001, 0.0, 0.50, 0.28, 0.00, 90, 0x479d2d),
  new Body(0.001, 0.0, 0.65, 0.25, 0.00, 90, 0xc32121),
  new Body(0.001, 0.0, 0.80, 0.25, 0.00, 90, 0x188a79),
]

var binaryStarsPreset = [
  new Body(1.0, 0.0, +0.3, +0.20, 0.00, 1500, 0xc32121),
  new Body(1.0, 0.0, -0.3, -0.20, 0.00, 1500, 0xF0C400),

]

var bodies = [];//cloneBodies(solarSystemPreset);

window.onload = function(){
  initGUI();

  updateBodyNumber();

  try{
    init();
  }
  catch(err){
    document.getElementById("error").style.display = "block ";
  }

  resize();
  renderer.domElement.addEventListener("mousedown", getDownPosition, false);
  renderer.domElement.addEventListener("mouseup", getUpPosition, false);
  renderer.domElement.addEventListener("mousemove", getMovePosition, false);

  //addProtoDisk();
  addSolarSystem();


//  addMeshes();

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
  if(!paused){
    for(var i = 0; i < stepsPerFrame; i++){
    computeAccelerations();
    checkCollisions();
    updateBodies();
    }
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
  var n = bodies.length;
	for(var  i = 0; i < n; i++){
		bodies[i].resetAcceleration();
		for(var j = 0; j < n; j++){
			if(i != j){
				var deltaX = bodies[j].x - bodies[i].x;
				var deltaY = bodies[j].y - bodies[i].y;
				var d = Math.sqrt(deltaX * deltaX + deltaY * deltaY) + smoothingFactor;
				var acc = k * bodies[j].mass / (d * d);
				bodies[i].accelerationX += acc * deltaX / d;
				bodies[i].accelerationY += acc * deltaY / d;
			}
		}
  }
}

function checkCollisions(){
	for(var i = 0; i < bodies.length; i++){
		for(var j = 0; j < bodies.length; j++){
			if(i != j && bodies[i].distanceToBody(bodies[j]) < bodies[i].size + bodies[j].size){
				if(bodies[i].mass > bodies[j].mass){
					bodies[i].mass += bodies[j].mass;
          bodies[i].updateRadius();
          bodies[j].removeFrom(scene);
					bodies.splice(j, 1);
				}
				else{
					bodies[j].mass += bodies[i].mass;
          bodies[i].removeFrom(scene);
          bodies[j].updateRadius();
					bodies.splice(i, 1);
				}
        updateBodyNumber();
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
    arrowMesh = new Arrow(beginVector, beginVector);
    scene.add(arrowMesh.mesh);

    isPressed = true;
	}

}

function getMovePosition(e){
	if(isPressed){
		endX = e.clientX;
		endY = e.clientY;
    var endVector = screenToWorldCoordinates(endX, endY);
    arrowMesh.updateEnd(endVector)
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
    scene.remove(arrowMesh.mesh);
		var body = new Body(bodyMass, beginVector.x, beginVector.y, velX, velY, bodyDensity, randomColor({format: 'hex'}));
    scene.add(body.mesh);
    scene.add(body.trail);
		bodies.push(body);
    updateBodyNumber();
	}
}

function screenToWorldCoordinates(x, y){
  var aspectRatio = canvasWidth / canvasHeight;
  var worldX = (aspectRatio * (2.0 * x / getBrowserWidth() - 1.0)  / camera.zoom + camera.position.x);
  var worldY = ((1.0 - 2.0 * y / getBrowserHeight())  / camera.zoom + camera.position.y);

  return new THREE.Vector3(worldX, worldY, 0);
}

function cloneBodies(array){
	var returnedArray = [];
	for(var  i = 0; i < array.length; i++){
		body = new Body(array[i].mass, array[i].x, array[i].y, array[i].velocityX, array[i].velocityY, array[i].density, array[i].color);
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
  var gui = new dat.GUI({autoplace: false});
  var container = document.getElementById("guiContainer");
  container.appendChild(gui.domElement);

  gui.add(this, 'showHelp').name("Help");
  var bodyFolder = gui.addFolder("Body Settings");
  bodyFolder.add(this, 'bodyMass', 0.001, 2).step(0.001).name("Mass");
  bodyFolder.add(this, 'bodyDensity', 90, 1000).step(0.001).name("Density");
  bodyFolder.open();

  var worldFolder = gui.addFolder("Simulation Settings");
  worldFolder.add(this, 'k', 0, 0.06).step(0.000001).name("G Constant");
  worldFolder.add(this, 'timePerStep', 0, 0.05).step(0.0001).name("Time Per Step");
  worldFolder.add(this, 'stepsPerFrame', 0, 10).step(1).name("Steps Per Frame").listen();
  worldFolder.add(this, 'trailLength', 0, 1000).step(1).name("Trail Length");
  worldFolder.open();

  var presetFolder = gui.addFolder("Presets");
  presetFolder.add(this, 'clear').name("Empty Universe");
  presetFolder.add(this, 'addSun').name("A Single Star");
  presetFolder.add(this, 'addSolarSystem').name("3 Planet Solar System");
  presetFolder.add(this, 'addBinaryStars').name("Binary Stars");
	presetFolder.add(this, 'addProtoDisk').name("Protoplanetary Disk");
  presetFolder.open();
}

function showHelp(){
  var aboutDiv = document.getElementById('about');
  var bellowDiv = document.getElementById('bellowAbout');

  aboutDiv.classList.add('showAbout');
  bellowDiv.classList.add('blurBellow');

  stepsPerFrame = 0;
}

function closeHelp(){
  var aboutDiv = document.getElementById('about');
  var bellowDiv = document.getElementById('bellowAbout');

  aboutDiv.classList.remove('showAbout');
  bellowDiv.classList.remove('blurBellow');

  stepsPerFrame = 1;

}

function clear(){
  for(var i = 0; i < bodies.length; i++){
    scene.remove(bodies[i].mesh);
    scene.remove(bodies[i].trail);
  }
  bodies = [];
  updateBodyNumber();
}

function addSolarSystem(){
  clear();
  bodies = cloneBodies(solarSystemPreset);
  addMeshes();
  updateBodyNumber();
}

function addSun(){
  clear();
  bodies = cloneBodies(sunPreset);
  addMeshes();
  updateBodyNumber();
}

function addBinaryStars(){
  clear();
  bodies = cloneBodies(binaryStarsPreset);
  addMeshes();
  updateBodyNumber();

}


function addProtoDisk(){
	clear();
	var sunMass = 1.0;
	var sun = new Body(sunMass, 0, 0, 0, 0, 1500, 0xF0C400);
  bodies.push(sun);
  sun.addTo(scene);
	var particleMass = 0.00005;
	for(var i = 0; i < 250; i++){
    var x = 1 - 2 * Math.random() + 0.1;
		var y = 1 - 2 * Math.random() + 0.1;
		var radius = Math.sqrt(x * x + y * y);
		var speed = Math.sqrt(k * sunMass / radius);
		var speedX = speed * y / radius;
		var speedY = - speed * x / radius;
		var particle = new Body(particleMass, x, y, speedX, speedY, 100, randomColor({format: 'hex'}));
		bodies.push(particle);
		particle.addTo(scene);
	}
  updateBodyNumber();
}

function updateBodyNumber(){
  document.getElementById('bodies').innerHTML = bodies.length;
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

  document.getElementById('bellowAbout').appendChild(renderer.domElement);

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
