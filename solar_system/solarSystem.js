var lastTime = Date.now();
var deltaT = 0;
var fps;
var paused = false;
var timeWarp = 1000000;

var scene, aspect_ratio, camera, renderer, controls;

var UNIX_TIME_J2000 = 946684800;
var SECONDS_IN_YEAR = 365.25 * 24 * 60 * 60;
var MJD_AT_J2000 = 51544;

var epoch = unixToEpoch(Date.now() / 1000.0);


var showOrbits = true;

//new CelestialBody(name,semiMajorAxis, eccentricty, inclination, longitudeOfNode, longitudeOfPericenter, meanAnomaly2000)

var planets = [
  new CelestialBody("Mercury",      0.3870, 0.205635, deg2rad(7.0050), deg2rad(48.331300), deg2rad(77.456450), deg2rad(174.794787)),
  new CelestialBody("Venus",        0.7230, 0.006773, deg2rad(3.3947), deg2rad(76.679900), deg2rad(131.53298), deg2rad(50.4160980)),
  new CelestialBody("Earth",        1.0000, 0.016700, deg2rad(0.0000), deg2rad(-11.26064), deg2rad(102.94719), deg2rad(357.529109)),
  new CelestialBody("Mars",         1.5240, 0.093405, deg2rad(1.8510), deg2rad(49.557400), deg2rad(336.04084), deg2rad(19.3727660)),
  new CelestialBody("Juno",         2.6700, 0.254981, deg2rad(12.982), deg2rad(169.91138), deg2rad(58.204242), deg2rad(240.155636)),
  new CelestialBody("Ceres",        2.7653, 0.079138, deg2rad(10.586), deg2rad(80.393200), deg2rad(151.84910), deg2rad(6.06964272)),
  new CelestialBody("Pallas",       2.7721, 0.230999, deg2rad(34.840), deg2rad(173.12950), deg2rad(123.46330), deg2rad(352.853564)),
  new CelestialBody("67P",          3.4648, 0.641436, deg2rad(7.0458), deg2rad(50.084660), deg2rad(62.926768), deg2rad(216.153893)),
  new CelestialBody("Jupiter",      5.2030, 0.048498, deg2rad(1.3050), deg2rad(100.45420), deg2rad(14.753850), deg2rad(20.0203120)),
  new CelestialBody("Saturn",       9.5230, 0.055546, deg2rad(2.4840), deg2rad(113.66340), deg2rad(92.431940), deg2rad(317.020207)),
  new CelestialBody("1P/Halley",    17.834, 0.967142, deg2rad(162.26), deg2rad(58.420080), deg2rad(169.75256), deg2rad(65.8423700)),
  new CelestialBody("Uranus",       19.208, 0.047318, deg2rad(0.7700), deg2rad(74.000500), deg2rad(170.96424), deg2rad(141.049714)),
  new CelestialBody("Neptune",      30.087, 0.008606, deg2rad(1.7690), deg2rad(131.78060), deg2rad(44.971350), deg2rad(256.228389)),
  new CelestialBody("Pluto",        39.746, 0.250000, deg2rad(17.142), deg2rad(110.30340), deg2rad(224.43738), deg2rad(14.0921741)),
//  new CelestialBody("Uaie",         50.746, 0.999999, deg2rad(0.0000), deg2rad(0.0000000), deg2rad(180.00000), deg2rad(0.00000000), deg2rad(119.610)),
];

var colors = [
  0xa6e97d,  //Mercury
  0xf6f57b,  //Venus
  0x42A5F5,  //Earth
  0xfa7f95,  //Mars
  0x423232,  //Juno
  0xdbca72,  //Ceres
  0x49506e,   //Pallas
  0x488e72,   //67P
  0x9bf5ea,  //Jupiter
  0xf9d27e,  //Saturn
  0x599858,  //1P
  0x8e7bec,  //Uranus
  0xa34949,  //Neptune
  0x74b16d,  //Pluto
//  0xdef04f,
];

var celestialBodySprites = [];
var orbits = [];

var skyboxMesh;
var planetSprite = THREE.ImageUtils.loadTexture("./res/planet.png");

window.onload = function(){
  init();
  createSkybox();
  createOrbits();

  createSprites();
  updatePositionAndRotation();

  var flareTexture = THREE.ImageUtils.loadTexture("./res/flare.png");
  var flareMaterial = new THREE.SpriteMaterial({map: flareTexture, blending:THREE.AdditiveBlending, useScreenCoordinates: false, color: 0xffffff});
  var flareSprite = new THREE.Sprite(flareMaterial);
  flareSprite.scale.set(0.8, 0.8, 0.8);
  flareSprite.position.set(0, 0, 0);
  scene.add(flareSprite);

  addOrbitsToScene();
  addSpritesToScene();

  addSmallBodies('./res/uaie.txt');
//  addSmallBodies('./res/ELEMENTS.NUMBR');

  var axes = new THREE.Object3D();
  length = 1;
/*
  axes.add( buildAxis( new THREE.Vector3( 0, 0, 0 ), new THREE.Vector3( length, 0, 0 ), 0xFF0000, false ) ); // +X
  axes.add( buildAxis( new THREE.Vector3( 0, 0, 0 ), new THREE.Vector3( -length, 0, 0 ), 0xFF0000, true) ); // -X
  axes.add( buildAxis( new THREE.Vector3( 0, 0, 0 ), new THREE.Vector3( 0, length, 0 ), 0x00FF00, false ) ); // +Y
  axes.add( buildAxis( new THREE.Vector3( 0, 0, 0 ), new THREE.Vector3( 0, -length, 0 ), 0x00FF00, true ) ); // -Y
  axes.add( buildAxis( new THREE.Vector3( 0, 0, 0 ), new THREE.Vector3( 0, 0, length ), 0x0000FF, false ) ); // +Z
  axes.add( buildAxis( new THREE.Vector3( 0, 0, 0 ), new THREE.Vector3( 0, 0, -length ), 0x0000FF, true ) ); // -Z
*/
  scene.add(axes);

  render();

  document.getElementById('warp').innerHTML = timeWarp;
}

//TODO remove this
function buildAxis( src, dst, colorHex, dashed ) {
  var geom = new THREE.Geometry(),
      mat;

  if(dashed) {
          mat = new THREE.LineDashedMaterial({ linewidth: 3, color: colorHex, dashSize: 3, gapSize: 3 });
  } else {
          mat = new THREE.LineBasicMaterial({ linewidth: 3, color: colorHex });
  }

  geom.vertices.push( src.clone() );
  geom.vertices.push( dst.clone() );
  geom.computeLineDistances(); // This one is SUPER important, otherwise dashed lines will appear as simple plain lines

  var axis = new THREE.Line( geom, mat, THREE.LinePieces );

  return axis;

}


function render(){
  fps++;
  updateScales();
  updateSkybox();

  var now = new Date().getTime();
  var sinceLastFrame = now - lastTime;

  if(!paused){
    epoch += sinceLastFrame / (100 * 1000 * SECONDS_IN_YEAR) * timeWarp;
    updatePositionAndRotation();

  }

  document.getElementById('date').innerHTML=unixToString(epochToUnixTime(epoch));
  requestAnimationFrame(render);
  controls.update();

  deltaT += sinceLastFrame;
  lastTime = now;
  if(deltaT > 200){
    document.getElementById('fps').innerHTML=fps * 5;
    deltaT = 0;
    fps = 0;
  }

  renderer.render(scene, camera);
}

function createSprites(){
  for(planet of planets){
    celestialBodySprites.push(new CelestialBodySprite(planet, planetSprite, 20));
  }
}

function addSpritesToScene(){
  for(bodySprite of celestialBodySprites){
    scene.add(bodySprite.sprite);
    scene.add(bodySprite.label);
  }
}

function updateScales(){
  for(bodySprite of celestialBodySprites){
    bodySprite.updateScale(camera);
  }
}

function updatePositionAndRotation(){
  for(bodySprite of celestialBodySprites){
    bodySprite.updatePosition(epoch);
  }
}

function updateSkybox(){
  skyboxMesh.position.set(camera.position.x, camera.position.y, camera.position.z);
}

function createOrbits(){
  for(var i = 0; i < planets.length; i++){
    orbits.push(new Orbit(planets[i], colors[i]));
  }
}

function addOrbitsToScene(){
  for (orbit of orbits){
    scene.add(orbit.mesh);
  }
}

function toogleOrbits(){
  showOrbits = !showOrbits;

  if(showOrbits){
    enableOrbits();
  }
  else{
    disableOrbits();
  }
}

function createSkybox(){
  var geometry = new THREE.SphereGeometry(1000, 90, 90);
  var texture = new THREE.ImageUtils.loadTexture('./res/milky_way.jpg');
  var material = new THREE.MeshBasicMaterial({
    map:  texture,
    side: THREE.BackSide,
  });

  skyboxMesh = new THREE.Mesh(geometry, material);
  //
  skyboxMesh.rotateX(deg2rad(150));
  skyboxMesh.rotateY(deg2rad(-96.33733));

  scene.add(skyboxMesh);
}

function deg2rad(angle){
  return angle * Math.PI / 180.00;
}

function getDistance(p1, p2){
  return Math.sqrt((p1.x - p2.x) * (p1.x - p2.x) + (p1.y - p2.y) * (p1.y - p2.y) + (p1.z - p2.z) * (p1.z - p2.z));
}

function unixToEpoch(unixTime){
  return (unixTime - UNIX_TIME_J2000) / (100 * SECONDS_IN_YEAR);
}

function epochToUnixTime(epoch){
  return UNIX_TIME_J2000 + epoch * 100 * SECONDS_IN_YEAR;
}

function unixToString(unixTime){
  return new Date(unixTime * 1000).toString();
}

window.onkeydown = function (e) {
    var code = e.keyCode ? e.keyCode : e.which;
    //alert(code);
    if (code === 32) { //SPACE key
      paused = !paused;
    }
    else if(code === 39){ //RIGHT ARROW
      timeWarp *= 2;
      document.getElementById('warp').innerHTML = Math.floor(timeWarp);
    }
    else if(code === 37){  //LEFT ARROW
      timeWarp /= 2;
      document.getElementById('warp').innerHTML = Math.floor(timeWarp);
    }

    else if(code === 79){
      toogleOrbits();
    }

    if(code >= 49 && code <= 57){
      isZooming = true;
      zoomedFrames = 0;
      dollyOut(5);
    }

};


window.onresize = function(e){
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize(window.innerWidth, window.innerHeight);
}

function addSmallBodies(file){
//  var data =  $.ajax({url: file, async: false}).responseText;
  $.get(file, function(data){
    var lines = data.split("\n");

    for(line of lines){
      var id = parseInt(line.substring(0, 6));

      if(id > 0){
        var name = line.substring(6, 25).replace(" ", "");
        var epochUaie = parseInt(line.substring(25, 32));
        var semiMajorAxis = parseFloat(line.substring(32, 42));
        var eccentricty = parseFloat(line.substring(42, 54));
        var inclination = deg2rad(parseFloat(line.substring(54, 62)));
        var argOfPericenter = deg2rad(parseFloat(line.substring(62, 73)));
        var longitudeOfNode = deg2rad(parseFloat(line.substring(73, 83)));
        var meanAnomalyAtEpoch = deg2rad(parseFloat(line.substring(83, 96)));

        var longitudeOfPericenter = argOfPericenter + longitudeOfNode;

        meanAngularMotion = 2.0 * Math.PI / Math.sqrt(semiMajorAxis * semiMajorAxis * semiMajorAxis);
        meanAnomaly2000 = meanAnomalyAtEpoch - meanAngularMotion * (epochUaie - MJD_AT_J2000) / 365.25;
        while(meanAnomaly2000 < 0) meanAnomaly2000 += 2 * Math.PI;
  //      meanAnomaly2000 = meanAnomaly2000 - 2 * Math.PI * parseInt(meanAnomaly2000 / (Math.PI * 2)) + Math.PI * 2;

        console.log(meanAngularMotion * 180 / Math.PI + " " + (epochUaie - MJD_AT_J2000) / 365.25);


        console.log(semiMajorAxis + " " + eccentricty  + " " + rad2deg(inclination) + " " + rad2deg(argOfPericenter) + " " + rad2deg(longitudeOfNode) + " " + 180 * meanAnomalyAtEpoch / Math.PI);

        var asteroid = new CelestialBody(name, semiMajorAxis, eccentricty, inclination, longitudeOfNode, longitudeOfPericenter, meanAnomaly2000);
        var asteroidSprite = new CelestialBodySprite(asteroid, planetSprite, 10);
        planets.push(asteroid);
        celestialBodySprites.push(asteroidSprite);
    //    scene.add(asteroidSprite.label);
        scene.add(asteroidSprite.sprite);

      //  console.log(id);
      }
    }
  });
}

function rad2deg(angle){
  return angle * 180 / Math.PI;
}

//TODO remove this
function getParameters(name) {
    url = location.href;
    name = name.replace(/[\[]/,"\\\[").replace(/[\]]/,"\\\]");
    var regexS = "[\\?&]"+name+"=([^&#]*)";
    var regex = new RegExp( regexS );
    var results = regex.exec( url );
    return results == null ? null : results[1];
}

function init(){
  scene = new THREE.Scene();
  aspect_ratio = window.innerWidth / window.innerHeight;
  camera = new THREE.PerspectiveCamera(75, aspect_ratio, 0.0000000001, 10000);
  camera.lookAt(new THREE.Vector3(0,0,0));
  renderer = new THREE.WebGLRenderer({antialias:true});

  renderer.setSize(window.innerWidth, window.innerHeight);
  scene.background = new THREE.Color(0x111111);

  renderer.domElement.style="position:absolute; top:0px; left:0px; margin:0px; "
  document.body.appendChild(renderer.domElement);
  camera.position.z = 2;

  controls = new THREE.TrackballControls(camera, renderer.domElement);
  controls.rotateSpeed = 10;
  controls.zoomSpeed = 0.12;
  controls.rotateCamera();
  controls.minDistance = 0.1;
  controls.maxDistance = 60;
  controls.dynamicDampingFactor = 0.3;
}
