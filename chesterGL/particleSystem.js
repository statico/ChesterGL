/**
 * chesterGL - Simple 2D WebGL demo/library
 *
 * Copyright (c) 2010-2012 Rolando Abarca
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 *
 */


goog.provide("chesterGL.ParticleSystem");

goog.require("chesterGL.Block");
goog.require("chesterGL.BlockGroup");

/**
 * @param {goog.vec.Vec3.Type} original The original vector
 * @param {goog.vec.Vec3.Type} variance the variance for every coordinate in the original vector
 * @return {goog.vec.Vec3.Type}
 */
chesterGL.randomVec3 = function (original, variance) {
	var vec = goog.vec.Vec3.createFloat32();
	if (variance) {
		vec[0] = original[0] + variance[0] * chesterGL.randMin1Plus1();
		vec[1] = original[1] + variance[1] * chesterGL.randMin1Plus1();
		vec[2] = original[2] + variance[2] * chesterGL.randMin1Plus1();
	} else {
		vec[0] = original[0];
		vec[1] = original[1];
		vec[2] = original[2];
	}
	return vec;
};

/**
 * @param {goog.vec.Vec4.Type} original The original vector
 * @param {goog.vec.Vec4.Type} variance the variance for every coordinate in the original vector
 * @return {goog.vec.Vec4.Type}
 */
chesterGL.randomVec4 = function (original, variance) {
	var vec = goog.vec.Vec4.createFloat32();
	if (variance) {
		vec[0] = original[0] + variance[0] * chesterGL.randMin1Plus1();
		vec[1] = original[1] + variance[1] * chesterGL.randMin1Plus1();
		vec[2] = original[2] + variance[2] * chesterGL.randMin1Plus1();
		vec[3] = original[3] + variance[3] * chesterGL.randMin1Plus1();
	} else {
		vec[0] = original[0];
		vec[1] = original[1];
		vec[2] = original[2];
		vec[3] = original[3];
	}
	return vec;
};

/**
 * @returns {number} a random number between -1 and 1
 */
chesterGL.randMin1Plus1 = function () {
	return Math.random() * 2 - 1;
};

/**
 * @constructor
 * @param {Object} properties the JSON object with the properties for this particle system
 * @extends {chesterGL.BlockGroup}
 */
chesterGL.ParticleSystem = function (properties) {
	this.parseProperties(properties);
	if (this.textureImageData) {
		chesterGL.loadAsset('texture', "data:image/png;base64," + this.textureImageData, this.textureFileName);
	} else {
		chesterGL.loadAsset('texture', this.textureFileName);
	}
	var tex = chesterGL.getAsset("texture", this.textureFileName);
	chesterGL.BlockGroup.call(this, this.textureFileName, this.maxParticles);
	this.recreateIndices(0, this.maxParticles);
	// assume square particle
	this.emissionRate = this.maxParticles / this.lifeSpan;
	this.texOriginalSize = tex.width;
	this.particles = [];
	this.resetSystem();
};
goog.inherits(chesterGL.ParticleSystem, chesterGL.BlockGroup);

/**
 * @type {number}
 */
chesterGL.ParticleSystem.prototype.maxParticles = 0;

/**
 * @type {number}
 */
chesterGL.ParticleSystem.prototype.lifeSpan = 0;

/**
 * @type {number}
 */
chesterGL.ParticleSystem.prototype.lifeSpanVariance = 0;

/**
 * @type {number}
 */
chesterGL.ParticleSystem.prototype.startSize = 0;

/**
 * @type {number}
 */
chesterGL.ParticleSystem.prototype.startSizeVariance = 0;

/**
 * @type {number}
 */
chesterGL.ParticleSystem.prototype.finishSize = 0;

/**
 * @type {number}
 */
chesterGL.ParticleSystem.prototype.finishSizeVariance = 0;

/**
 * @type {number}
 */
chesterGL.ParticleSystem.prototype.emitterAngle = 0;

/**
 * @type {number}
 */
chesterGL.ParticleSystem.prototype.emitterAngleVariance = 0;

/**
 * @type {number}
 */
chesterGL.ParticleSystem.prototype.rotationStart = 0;

/**
 * @type {number}
 */
chesterGL.ParticleSystem.prototype.rotationStartVariance = 0;

/**
 * @type {number}
 */
chesterGL.ParticleSystem.prototype.rotationEnd = 0;

/**
 * @type {number}
 */
chesterGL.ParticleSystem.prototype.rotationEndVariance = 0;

/**
 * @type {number}
 */
chesterGL.ParticleSystem.prototype.emitterType = 0;

/**
 * @type {goog.vec.Vec3.Type}
 */
chesterGL.ParticleSystem.prototype.sourcePosition = null;

/**
 * @type {goog.vec.Vec3.Type}
 */
chesterGL.ParticleSystem.prototype.sourcePositionVariance = null;

/**
 * @type {goog.vec.Vec4.Type}
 */
chesterGL.ParticleSystem.prototype.startColor = null;

/**
 * @type {goog.vec.Vec4.Type}
 */
chesterGL.ParticleSystem.prototype.startColorVariance = null;

/**
 * @type {goog.vec.Vec4.Type}
 */
chesterGL.ParticleSystem.prototype.endColor = null;

/**
 * @type {goog.vec.Vec4.Type}
 */
chesterGL.ParticleSystem.prototype.endColorVariance = null;

/**
 * @type {number}
 */
chesterGL.ParticleSystem.prototype.blendFuncSource = 0;

/**
 * @type {number}
 */
chesterGL.ParticleSystem.prototype.blendFuncDest = 0;

/**
 * @type {?string}
 */
chesterGL.ParticleSystem.prototype.textureFileName = null;

/**
 * @type {?string}
 */
chesterGL.ParticleSystem.prototype.textureImageData = null;

// gravity type

/**
 * @type {number}
 */
chesterGL.ParticleSystem.prototype.speed = 0;

/**
 * @type {number}
 */
chesterGL.ParticleSystem.prototype.speedVariance = 0;

/**
 * @type {goog.vec.Vec3.Type}
 */
chesterGL.ParticleSystem.prototype.gravity = null;

/**
 * @type {number}
 */
chesterGL.ParticleSystem.prototype.radialAcceleration = 0;

/**
 * @type {number}
 */
chesterGL.ParticleSystem.prototype.radialAccelerationVariance = 0;

/**
 * @type {number}
 */
chesterGL.ParticleSystem.prototype.tangentialAcceleration = 0;

/**
 * @type {number}
 */
chesterGL.ParticleSystem.prototype.tangentialAccelerationVariance = 0;

// radial type

/**
 * @type {number}
 */
chesterGL.ParticleSystem.prototype.maxRadius = 0;

/**
 * @type {number}
 */
chesterGL.ParticleSystem.prototype.maxRadiusVariance = 0;

/**
 * @type {number}
 */
chesterGL.ParticleSystem.prototype.minRadius = 0;

/**
 * @type {number}
 */
chesterGL.ParticleSystem.prototype.minRadiusVariance = 0;

/**
 * @type {number}
 */
chesterGL.ParticleSystem.prototype.degPerSecond = 0;

/**
 * @type {number}
 */
chesterGL.ParticleSystem.prototype.degPerSecondVariance = 0;

// internal properties

/**
 * @type {number}
 * @ignore
 */
chesterGL.ParticleSystem.prototype.texOriginalSize = 0;

/**
 * @type {Array}
 * @ignore
 */
chesterGL.ParticleSystem.prototype.particles = null;

/**
 * @type {number}
 * @ignore
 */
chesterGL.ParticleSystem.prototype.particleCount = 0;

/**
 * @type {number}
 * @ignore
 */
chesterGL.ParticleSystem.prototype.particleIdx = 0;

/**
 * @type {number}
 * @ignore
 */
chesterGL.ParticleSystem.prototype.emissionRate = 0;

/**
 * @type {number}
 * @ignore
 */
chesterGL.ParticleSystem.prototype.emitCounter = 0;

/**
 * will parse and validate the properties
 * @param {Object.<*>} properties
 */
chesterGL.ParticleSystem.prototype.parseProperties = function (properties) {
	/*jshint sub:true */
	if (typeof(properties) === 'string')
		properties = /** @type {Object.<*>} */(JSON.parse(/** @type {string} */(properties)));
	if (typeof(properties) === "object") {
		this.maxParticles = properties['maxParticles'];
		this.lifeSpan = properties['particleLifespan'] * 1000;
		this.lifeSpanVariance = properties['lifeSpanVariance'] * 1000;
		this.startSize = properties['startSize'];
		this.startSizeVariance = properties['startSizeVariance'];
		this.finishSize = properties['finishSize'];
		this.finishSizeVariance = properties['finishSizeVariance'];
		this.startColor = goog.vec.Vec4.createFloat32FromValues(properties['startColorRed'], properties['startColorGreen'], properties['startColorBlue'], properties['startColorAlpha']);
		this.startColorVariance = goog.vec.Vec4.createFloat32FromValues(properties['startColorVarianceRed'], properties['startColorVarianceGreen'], properties['startColorVarianceBlue'], properties['startColorVarianceAlpha']);
		this.endColor = goog.vec.Vec4.createFloat32FromValues(properties['endColorRed'], properties['endColorGreen'], properties['endColorBlue'], properties['endColorAlpha']);
		this.endColorVariance = goog.vec.Vec4.createFloat32FromValues(properties['endColorVarianceRed'], properties['endColorVarianceGreen'], properties['endColorVarianceBlue'], properties['endColorVarianceAlpha']);
		this.emitterAngle = properties['angle'];
		this.emitterAngleVariance = properties['angleVariance'];
		this.textureFileName = properties['textureFileName'];
		this.textureImageData = properties['textureImageData'];
		this.speed = properties['speed'];
		this.speedVariance = properties['speedVariance'];
		this.radialAcceleration = properties['radialAcceleration'];
		this.radialAccelerationVariance = properties['radialAccelVariance'];
		this.tangentialAcceleration = properties['tangentialAcceleration'];
		this.tangentialAccelerationVariance = properties['tangAccelVariance'];
	}
};

/**
 * resets the system
 */
chesterGL.ParticleSystem.prototype.resetSystem = function () {
	this.elapsed = 0;
	// set the lifespan of each particle to 0
	for (var i=0; i < this.particleCount; i++) {
		this.particles[i].lifeSpan = 0;
	}
};

/**
 * @returns {Object} The newly created particle
 * @ignore
 */
chesterGL.ParticleSystem.prototype.createParticle = function () {
	var endColor = chesterGL.randomVec4(this.endColor, this.endColorVariance),
		startColor = chesterGL.randomVec4(this.startColor, this.startColorVariance),
		deltaColor = goog.vec.Vec4.subtract(endColor, startColor, []),
		startSize = Math.max(0, this.startSize + this.startSizeVariance * chesterGL.randMin1Plus1()),
		finishSize = Math.max(0, this.finishSize + this.finishSizeVariance * chesterGL.randMin1Plus1()),
		lifeSpan = Math.max(0, this.lifeSpan + this.lifeSpanVariance * chesterGL.randMin1Plus1()),
		angle = chesterGL.Block.DEG_TO_RAD * (this.emitterAngle + this.emitterAngleVariance * chesterGL.randMin1Plus1()),
		vel = [Math.cos(angle), Math.sin(angle)],
		speed = this.speed + this.speedVariance * chesterGL.randMin1Plus1(),
		particle = {
			lifeSpan: lifeSpan,
			position: [0, 0, 0],
			color: startColor,
			deltaColor: goog.vec.Vec4.scale(deltaColor, 1/lifeSpan, deltaColor),
			size: startSize,
			deltaSize: (finishSize - startSize) / lifeSpan,
			dir: [vel[0] * speed, vel[1] * speed],
			radialAccel: this.radialAcceleration + this.radialAccelerationVariance * chesterGL.randMin1Plus1(),
			tangAccel: this.tangentialAcceleration + this.tangentialAccelerationVariance * chesterGL.randMin1Plus1()
		};
	return particle;
};

/**
 * @param {number} idx the index of the quad to update
 * @param {Object} particle the particle object to update the quad with
 * @ignore
 */
chesterGL.ParticleSystem.prototype.updateQuad = function (idx, particle) {
	// we're sharing the same buffers already created by the BlockGroup, so we have 1 quad per particle
	// we just need to update it like if it was a block updating the quad
	var buffIdx = idx * chesterGL.Block.BUFFER_SIZE,
		colorOff = buffIdx + 5,
		offset = 9,
		hw = particle.size / 2,
		pos = particle.position;
	for (var i=0; i < 4; i++) {
		this.glBufferData[idx     + i*offset] = particle.color[0];
		this.glBufferData[idx + 1 + i*offset] = particle.color[1];
		this.glBufferData[idx + 2 + i*offset] = particle.color[2];
		this.glBufferData[idx + 3 + i*offset] = particle.color[3];
	}
	if (particle.rotation) {
	} else {
		this.glBufferData[idx               ] = pos[0] - hw; // bl.x
		this.glBufferData[idx + 1           ] = pos[1] - hw; // bl.y
		this.glBufferData[idx + 2           ] = pos[2];      // bl.z

		this.glBufferData[idx     +   offset] = pos[0] - hw; // tl.x
		this.glBufferData[idx + 1 +   offset] = pos[1] + hw; // tl.y
		this.glBufferData[idx + 2 +   offset] = pos[2];      // tl.z

		this.glBufferData[idx     + 2*offset] = pos[0] + hw; // br.x
		this.glBufferData[idx + 1 + 2*offset] = pos[1] - hw; // br.y
		this.glBufferData[idx + 2 + 2*offset] = pos[2];      // br.z

		this.glBufferData[idx     + 3*offset] = pos[0] + hw; // tr.x
		this.glBufferData[idx + 1 + 3*offset] = pos[1] + hw; // tr.y
		this.glBufferData[idx + 2 + 3*offset] = pos[2];      // tr.z
	}
};

chesterGL.ParticleSystem.prototype.addParticle = function () {
	console.log("emitting a particle " + this.particleCount);
	var p = this.createParticle();
	this.updateQuad(this.particleCount, p);
	this.particles[this.particleCount++] = p;
};

/**
 * the regular update function, create more particles if we're not
 * in the limit
 * @param {number} delta
 * @ignore
 */
chesterGL.ParticleSystem.prototype.update = function (delta) {
	if (this.emissionRate) {
		delta = delta || 1;
		// var rate = 1.0 / this.emissionRate;
		this.emitCounter += delta;
		while (this.particleCount < this.maxParticles && this.emitCounter > this.emissionRate) {
			this.addParticle();
			this.emitCounter -= this.emissionRate;
		}
		this.elapsed += delta;
	}
	var particleIdx = 0;
	while (particleIdx < this.particleCount) {
		var p = this.particles[particleIdx++];
		p.lifeSpan -= delta;
	}
};

/**
 *
 */
chesterGL.ParticleSystem.prototype.render = function () {
	chesterGL.BlockGroup.prototype.render.call(this, this.particleCount);
};

// export the symbol
goog.exportSymbol('chesterGL.ParticleSystem', chesterGL.ParticleSystem);
// instance methods
goog.exportProperty(chesterGL.ParticleSystem.prototype, 'resetSystem', chesterGL.ParticleSystem.prototype.resetSystem);
