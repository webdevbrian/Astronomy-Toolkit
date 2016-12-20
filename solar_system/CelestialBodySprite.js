var labelCanvasSize = 256;

function CelestialBodySprite(planet, texture, spriteSize){
  this.planet = planet;
  this.texture = texture;
  this.spriteSize = spriteSize
  this.sprite = this.createSprite();
  this.label = this.createLabelSprite();
  this.segmentCountPerAU = 30;
}

CelestialBodySprite.prototype.updatePosition  = function(epoch){
  var position = this.planet.getPositionAtEpoch(epoch);
  this.sprite.position.set(position.x, position.y, position.z);
  this.label.position.set(position.x, position.y, position.z);
}

CelestialBodySprite.prototype.updateScale  = function(camera){
  var scale =  2 * Math.tan( camera.fov * Math.PI / 360.0 ) * getDistance(this.sprite.position, camera.position) / Math.min(window.innerWidth, window.innerHeight);
  var circleScale = this.spriteSize * scale;
  var labelScale = labelCanvasSize * scale;
  this.sprite.scale.set(circleScale, circleScale, 0);
  this.label.scale.set(labelScale, labelScale, 0);
}


CelestialBodySprite.prototype.createSprite  = function(){
  var material = new THREE.SpriteMaterial( { map: this.texture, transparent:true, useScreenCoordinates: false, color: 0xffffff } );
	var sprite = new THREE.Sprite(material);
	sprite.scale.set(0.2, 0.2, 0.2);
  return sprite;
}

CelestialBodySprite.prototype.createLabelSprite  = function(){
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
