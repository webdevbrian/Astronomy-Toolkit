function Body(mass, x, y, velocityX, velocityY, size, color){
	this.mass = mass;
	this.x = x;
	this.y = y;
	this.velocityX = velocityX;
	this.velocityY = velocityY;
	this.trailVertices = [];
	this.accelerationX = 0;
	this.accelerationY = 0;
	this.size = size;
	this.color = color;
	this.mesh = this.createBodyMesh();
	this.trail = this.createTrail();
}

Body.prototype.addPosition = function(){
	this.positionsX.push(this.x);
	this.positionsY.push(this.y);
	var length = this.positionsX.length;
	if(length > trailLength){
		for(var i = 0; i < length - trailLength; i++){
			this.positionsX.shift();
			this.positionsY.shift();
		}
	}

};

Body.prototype.update = function(step, trailLimit, scene){
	this.velocityX += step * this.accelerationX;
	this.velocityY += step * this.accelerationY;

	this.x += this.velocityX * step;
	this.y += this.velocityY * step;

	this.mesh.position.set(this.x, this.y, 0);

	this.trailVertices.push(new THREE.Vector3(this.x, this.y, 0));
	while(this.trailVertices.length > trailLimit){
		this.trailVertices.shift();
	}
	scene.remove(this.trail);
	this.trail = this.createTrail();
	scene.add(this.trail);
}


Body.prototype.resetAcceleration = function(){
	this.accelerationY = 0;
	this.accelerationX = 0;
}

Body.prototype.setPositions = function(positionsX, positionsY){
	this.positionsX = positionsX;
	this.positionsY = positionsY;
}

Body.prototype.setMass = function(mass){
	this.mass = mass;
}

Body.prototype.distanceToBody = function(body){
	return Math.sqrt((this.x - body.x) * (this.x - body.x) + (this.y - body.y) * (this.y - body.y));
}

Body.prototype.distanceTo = function(posX, posY){
	return Math.sqrt((this.x - posX) * (this.x - posX) + (this.y - posY) * (this.y - posY));
}

Body.prototype.createBodyMesh = function(){
	material = new THREE.MeshBasicMaterial( { color: this.color, side: THREE.DoubleSide } );
	geometry = new THREE.CircleGeometry(this.size, 50 );
	mesh = new THREE.Mesh( geometry, material );
	mesh.position.set(this.x, this.y, 0);
	return mesh;

}

Body.prototype.createTrail = function(){
	var material = new THREE.LineBasicMaterial({color: this.color});
	var geometry = new THREE.Geometry();
	geometry.vertices = this.trailVertices;
	return new THREE.Line( geometry, material );
}
