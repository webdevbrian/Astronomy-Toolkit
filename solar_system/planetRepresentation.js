var labelCanvasSize = 256;

function planetRepresentation(planet, color){
  this.planet = planet;
  this.orbitGeometry = this.createOrbitGeometry(color);
  this.sprite = this.createSprite();
  this.label = this.createLabelSprite();
  this.segmentCountPerAU = 30;
}

planetRepresentation.prototype.updatePosition  = function(epoch){
  var position = this.planet.getPositionAtEpoch(epoch);
  this.sprite.position.set(position.x, position.y, position.z);
  this.label.position.set(position.x, position.y, position.z);
}



planetRepresentation.prototype.updateScale  = function(camera){
  var scale =  2 * Math.tan( camera.fov * Math.PI / 360.0 ) * getDistance(this.sprite.position, camera.position) / window.innerHeight;
  var circleScale = 20 * scale;
  var labelScale = labelCanvasSize * scale;
  this.sprite.scale.set(circleScale, circleScale, circleScale);
  this.label.scale.set(labelScale, labelScale, labelScale);
}

planetRepresentation.prototype.createOrbitGeometry  = function(color, scene){
  var geometry = new THREE.Geometry();
  var material = new THREE.LineBasicMaterial({ color: color, transparent: true });

  var segmentCount = Math.ceil(2 * Math.PI * this.planet.semiMajorAxis * 30);
  for(var i = 0; i <= segmentCount; i++){
    var angle = 2 * i * Math.PI / segmentCount;
    var position = this.planet.getCartesianCoordinates(angle);
    var vector  = new THREE.Vector3(position.x, position.y , position.z);
    geometry.vertices.push(vector);
  }
  var mesh = new THREE.Line(geometry, material);
  return mesh;
}

planetRepresentation.prototype.createSprite  = function(){
  var planetSprite = THREE.ImageUtils.loadTexture("./res/planet.png");
  var material = new THREE.SpriteMaterial( { map: planetSprite, transparent:true, useScreenCoordinates: false, color: 0xffffff } );
	var sprite = new THREE.Sprite(material);
	sprite.scale.set(0.2, 0.2, 0.2);
  return sprite;
}

planetRepresentation.prototype.createLabelSprite  = function(){
  var canvas = document.createElement('canvas');
  canvas.width = labelCanvasSize;
  canvas.height = labelCanvasSize;
  var ctx = canvas.getContext('2d');
  ctx.font = "Bold 14px Arial";

  var fontMetrics = ctx.measureText(this.planet.name);
  labelWidth = fontMetrics.width;
  ctx.clearRect(0,0, labelCanvasSize, labelCanvasSize);
  ctx.fillStyle = "#bebebe";
  ctx.fillText(this.planet.name, canvas.width / 2 + 12, canvas.height / 2 + 7);

  var texture = new THREE.Texture(canvas);
  texture.minFilter = THREE.LinearFilter;
  texture.needsUpdate = true;

  var material = new THREE.SpriteMaterial({map :texture, transparent:true});
  var sprite = new THREE.Sprite(material);
  sprite.scale.set(1, 1, 1);
  return sprite;
}
