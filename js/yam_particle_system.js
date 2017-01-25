
function Point() {
	'use strict';
	this.x = 0;
	this.y = 0;
}

function Vector(x,y) {
	'use strict';
	this.x = x;
	this.y = y;
}

function Color() {
	'use strict';
	this.r = 0;
	this.g = 0;
	this.b = 0;
	this.a = 0;
}

function Particle() {
	'use strict';
	this.position = new Point();
	this.direction = new Vector(0,0);
	this.startPos = new Point();
	this.rotation = 0;
	this.rotationDelta = 0;
	this.particleSize = 0;
	this.particleSizeDelta = 0;
	this.timeToLive = 0;
	this.angle = 0;
	this.radius = 0;
	this.radiusDelta = 0;
	this.position = new Point();
	this.degreesPerSecond = 0;
	this.radiusDelta = 0;
	this.timeToLive = 0;
	this.color = new Color();
	this.deltaColor = new Color();
	this.radialAcceleration = 0;
	this.tangentialAcceleration = 0;
}

function GLKVector2Subtract(left, right) {
	'use strict';
	return new Vector(left.x - right.x,left.y - right.y);
    // GLKVector2 v = { vectorLeft.v[0] - vectorRight.v[0],
    //              vectorLeft.v[1] - vectorRight.v[1] };
}

function GLKVector2Subtract(left, right) {
	'use strict';
	return new Vector(left.x + right.x,left.y + right.y);
    // GLKVector2 v = { vectorLeft.v[0] + vectorRight.v[0],
    //              vectorLeft.v[1] + vectorRight.v[1] };
}

function GLKVector2Length(vector) {
	'use strict';
	return Math.sqrt(vector.x * vector.x + vector.y * vector.y);
	//return sqrt(vector.v[0] * vector.v[0] + vector.v[1] * vector.v[1]);
}

function GLKVector2MultiplyScalar(vector, value) {
	'use strict';
	return new Vector(vector.x*value, vector.y*value);
    // GLKVector2 v = { vector.v[0] * value,
    //                  vector.v[1] * value };
    // return v;
}

function GLKVector2Normalize(vector) {
    var scale = 1 / GLKVector2Length(vector);
    return GLKVector2MultiplyScalar(vector, scale);
    // float scale = 1.0f / GLKVector2Length(vector);
    // GLKVector2 v = GLKVector2MultiplyScalar(vector, scale);
    // return v;
}

function GLKMathDegreesToRadians(degrees) {
	'use strict';
	return degrees * (Math.PI / 180);
// GLK_INLINE float GLKMathDegreesToRadians(float degrees) { return degrees * (M_PI / 180); };

}

function ParticleSystem() {
	'use strict';
	this.particles = [];
	this.particleNodes = [];

	this.isRadial = true;

	this.gravity = new Vector(0,1);
	this.sourcePosition = new Point();
	this.sourcePositionVariance = new Point();
	this.angle = 0;
	this.angleVariance = 0;
	this.speed = 0;
	this.speedVariance = 0;
	this.radialAcceleration = 0;
	this.tangentialAcceleration = 0;
	this.radialAccelVariance = 0;
	this.tangentialAccelVariance = 0;
	this.particleLifespan = 0;
	this.particleLifespanVariance = 0;

	this.startColor = new Color();
	this.startColorVariance = new Color();
	this.finishColor = new Color();
	this.finishColorVariance = new Color();

	this.startParticleSize = 0;
	this.startParticleSizeVariance = 0;
	this.finishParticleSize = 0;
	this.finishParticleSizeVariance = 0;

	this.maxParticles = 0;
	this.particleCount = 0;

	this.emissionRate = 0;
	this.emitCounter = 0;
	this.elapsedTime = 0;
	this.duration = 0;
	this.rotationStart = 0;
	this.rotationStartVariance = 0;
	this.rotationEnd = 0;
	this.rotationEndVariance = 0;

	this.maxRadius = 0;
	this.maxRadiusVariance = 0;
	this.radiusSpeed = 0;
	this.minRadius = 0;
	this.rotatePerSecond = 0;
	this.rotatePerSecondVariance = 0;

	//////////////////// Particle Emitter iVars
	this.active = false;
	this.vertexIndex = 0;         // Stores the index of the vertices being used for each particle
	this.opacityModifyRGB = false;

	this.textureURL = 'assets/spark.png';
}

ParticleSystem.prototype.init = function(canvas) {
	'use strict';
	this.particles = [];
	this.particleImages = [];
	fabric.Image.fromURL(this.textureURL, function(texture) {
		var idx;
		for(idx = 0; i < this.maxParticles;idx++) {
			particles[idx] = new Particle();
        	var img = new fabric.Image(texture.getElement(), {
      			left: 0,
     			top: 0,
     			originX:'center',
     			originY:'center',
      			selectable: false,
      			visible: false
    		});
        	particleImages[idx] = img;
		}
		this.emitterNode = new fabric.Group(particleImages);
	});

};

ParticleSystem.prototype.updateParticleAtIndex = function(index, delta) {
	var particle = this.particles[index];
	var tmp;
	if(this.isRadial) {
		particle.angle += particle.degreesPerSecond * delta;
		particle.radius -= particle.radiusDelta * delta;
		
		tmp = new Vector();
		tmp.x = this.sourcePosition.x - Math.cosf(particle.angle) * particle.radius;
		tmp.y = this.sourcePosition.y - Math.sinf(particle.angle) * particle.radius;
		particle.position = tmp;
		
		if (particle.radius < this.minRadius)
			particle.timeToLive = 0;

	} else {
		tmp = new Vector(0.0,0.0);
		var radial = new Vector(0.0,0.0);
		var tangential = new Vector(0.0,0.0);
		
		var positionDifference = GLKVector2Subtract(particle.startPos, new Vector(0.0,0.0));
		particle.position = GLKVector2Subtract(particle.position, positionDifference);
		
		if (particle.position.x || particle.position.y)
			radial = GLKVector2Normalize(particle.position);
		
		tangential = radial;
		radial = GLKVector2MultiplyScalar(radial, particle.radialAcceleration);
		
		var newy = tangential.x;
		tangential.x = -tangential.y;
		tangential.y = newy;
		tangential = GLKVector2MultiplyScalar(tangential, particle.tangentialAcceleration);
		
		tmp = GLKVector2Add( GLKVector2Add(radial, tangential), gravity);
		tmp = GLKVector2MultiplyScalar(tmp, delta);
		particle.direction = GLKVector2Add(particle.direction, tmp);
		tmp = GLKVector2MultiplyScalar(particle.direction, delta);
		particle.position = GLKVector2Add(particle.position, tmp);
		
		particle.position = GLKVector2Add(particle.position, positionDifference);
	}
	particle.color.r += (particle.deltaColor.r * delta);
	particle.color.g += (particle.deltaColor.g * delta);
	particle.color.b += (particle.deltaColor.b * delta);
	particle.color.a += (particle.deltaColor.a * delta);

	// var c;
	// if (this.opacityModifyRGB) {
	// 	c = (GLKVector4){particle.color.r * particle.color.a,
	// 		particle.color.g * particle.color.a,
	// 		particle.color.b * particle.color.a,
	// 		particle.color.a};
	// } else {
	// 	c = particle.color;
	// }
	
	// Update the particle size
	particle.particleSize += particle.particleSizeDelta * delta;
	particle.particleSize = MAX(0, particle.particleSize);
	
	// Update the rotation of the particle
	particle.rotation += particle.rotationDelta * delta;
};

ParticleSystem.prototype.updateWithDelta = function(aDelta) {
	'use strict';
    if (this.active && this.emissionRate > 0) {
        var rate = 1/this.emissionRate;
        
        if (this.particleCount < this.maxParticles)
            this.emitCounter += aDelta;
        
        while (this.particleCount < this.maxParticles && this.emitCounter > rate) {
            this.addParticle();
            this.emitCounter -= rate;
        }
        
        this.elapsedTime += aDelta;
        
        if (this.duration != -1 && this.duration < this.elapsedTime)
            this.stopParticleEmitter();
    }
    // Reset the particle index before updating the particles in this emitter
    var index = 0;
    
    // Loop through all the particles updating their location and color
    while (index < this.particleCount) {
        
        // Get the particle for the current particle index
        var currentParticle = particles[index];
        
        // Reduce the life span of the particle
        currentParticle.timeToLive -= aDelta;
        
        // If the current particle is alive then update it
        if (currentParticle.timeToLive > 0) {
            
            this.updateParticleAtIndex(index,aDelta);
            
            // Update the particle and vertex counters
            index++;
        } else {
            
            // As the particle is not alive anymore replace it with the last active particle
            // in the array and reduce the count of particles by one.  This causes all active particles
            // to be packed together at the start of the array so that a particle which has run out of
            // life will only drop into this clause once
            this.removeParticleAtIndex(index);
        }
    }
};

ParticleSystem.prototype.removeParticleAtIndex = function(index) {
	'use strict';
    if (index != this.particleCount - 1) {
        
        this.particles[index] = this.particles[particleCount - 1];
    }
    this.particleNodes[index].visible = false;
    this.particleCount--;
};

ParticleSystem.prototype.addParticle = function() {
	'use strict';
    // If we have already reached the maximum number of particles then do nothing
    if (this.particleCount == this.maxParticles)
        return false;
    
    // Take the next particle out of the particle pool we have created and initialize it
    var particle = this.particles[particleCount];
    this.initParticle(particle);
    
    // Increment the particle count
    this.particleCount++;
    
    // Return YES to show that a particle has been created

    return true;
};

ParticleSystem.prototype.initParticle = function(particle) {
    // Init the position of the particle.  This is based on the source position of the particle emitter
    // plus a configured variance.  The RANDOM_MINUS_1_TO_1 macro allows the number to be both positive
    // and negative
    particle.position.x = sourcePosition.x + sourcePositionVariance.x * fabric.util.getRandomInt(-1, 1);
    particle.position.y = sourcePosition.y + sourcePositionVariance.y * fabric.util.getRandomInt(-1, 1);
    particle.startPos.x = sourcePosition.x;
    particle.startPos.y = sourcePosition.y;
    
    // Init the direction of the particle.  The newAngle is calculated using the angle passed in and the
    // angle variance.
    var newAngle = GLKMathDegreesToRadians(this.angle + this.angleVariance * fabric.util.getRandomInt(-1, 1));
    
    // Create a new GLKVector2 using the newAngle
    var vector = new Vector(Math.cos(newAngle), Math.sin(newAngle));
    
    // Calculate the vectorSpeed using the speed and speedVariance which has been passed in
    var vectorSpeed = this.speed + this.speedVariance * fabric.util.getRandomInt(-1, 1);
    
    // The particles direction vector is calculated by taking the vector calculated above and
    // multiplying that by the speed
    particle.direction = GLKVector2MultiplyScalar(vector, vectorSpeed);
    
    // Calculate the particles life span using the life span and variance passed in
    particle.timeToLive = Math.max(0, this.particleLifespan + this.particleLifespanVariance * fabric.util.getRandomInt(-1, 1));
    
    // Set the default diameter of the particle from the source position
    particle.radius = this.maxRadius + this.maxRadiusVariance * fabric.util.getRandomInt(-1, 1);
    particle.radiusDelta = this.maxRadius / particle.timeToLive;
    particle.angle = GLKMathDegreesToRadians(this.angle + this.angleVariance * fabric.util.getRandomInt(-1, 1));
    particle.degreesPerSecond = GLKMathDegreesToRadians(this.rotatePerSecond + this.rotatePerSecondVariance * fabric.util.getRandomInt(-1, 1));
    
    particle.radialAcceleration = this.radialAcceleration + this.radialAccelVariance * fabric.util.getRandomInt(-1, 1);
    particle.tangentialAcceleration = this.tangentialAcceleration + this.tangentialAccelVariance * fabric.util.getRandomInt(-1, 1);
    
    // Calculate the particle size using the start and finish particle sizes
    var particleStartSize = this.startParticleSize + this.startParticleSizeVariance * fabric.util.getRandomInt(-1, 1);
    var particleFinishSize = this.finishParticleSize + this.finishParticleSizeVariance * fabric.util.getRandomInt(-1, 1);
    particle.particleSizeDelta = ((particleFinishSize - particleStartSize) / particle.timeToLive);
    particle.particleSize = Math.max(0, particleStartSize);
    
    // Calculate the color the particle should have when it starts its life.  All the elements
    // of the start color passed in along with the variance are used to calculate the star color
    var start = new Color();
    start.r = startColor.r + this.startColorVariance.r * fabric.util.getRandomInt(-1, 1);
    start.g = startColor.g + this.startColorVariance.g * fabric.util.getRandomInt(-1, 1);
    start.b = startColor.b + this.startColorVariance.b * fabric.util.getRandomInt(-1, 1);
    start.a = startColor.a + this.startColorVariance.a * fabric.util.getRandomInt(-1, 1);
    
    // Calculate the color the particle should be when its life is over.  This is done the same
    // way as the start color above
    var end = new Color();
    end.r = finishColor.r + this.finishColorVariance.r * fabric.util.getRandomInt(-1, 1);
    end.g = finishColor.g + this.finishColorVariance.g * fabric.util.getRandomInt(-1, 1);
    end.b = finishColor.b + this.finishColorVariance.b * fabric.util.getRandomInt(-1, 1);
    end.a = finishColor.a + this.finishColorVariance.a * fabric.util.getRandomInt(-1, 1);
    
    // Calculate the delta which is to be applied to the particles color during each cycle of its
    // life.  The delta calculation uses the life span of the particle to make sure that the
    // particles color will transition from the start to end color during its life time.  As the game
    // loop is using a fixed delta value we can calculate the delta color once saving cycles in the
    // update method
    
    particle.color = start;
    particle.deltaColor.r = ((end.r - start.r) / particle.timeToLive);
    particle.deltaColor.g = ((end.g - start.g) / particle.timeToLive);
    particle.deltaColor.b = ((end.b - start.b) / particle.timeToLive);
    particle.deltaColor.a = ((end.a - start.a) / particle.timeToLive);
    
    // Calculate the rotation
    var startA = this.rotationStart + this.rotationStartVariance * fabric.util.getRandomInt(-1, 1);
    var endA = this.rotationEnd + this.rotationEndVariance * fabric.util.getRandomInt(-1, 1);
    particle.rotation = startA;
    particle.rotationDelta = (endA - startA) / particle.timeToLive;
    
};

ParticleSystem.prototype.stopParticleEmitter = function() {
    this.active = false;
    this.elapsedTime = 0;
    this.emitCounter = 0;
};

