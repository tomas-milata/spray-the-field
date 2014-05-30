var Sprayer = function(image, maxSpeed, minSpeed, maxAngleSpeed) {
  this.image = image

  this.x = 0
  this.y = 0
  this.angle = 0

  this.speed = 0
  this.angleSpeed = 0
  this.MAX_SPEED = maxSpeed
  this.MIN_SPEED = minSpeed
  this.MAX_ANGLE_SPEED = maxAngleSpeed
  this.ACCELERATION = 0.001
  this.ANGLE_ACCELERATION = this.MAX_ANGLE_SPEED / 100
  this.CONSTANT_DECELERATION = 0.0005
  this.CONSTANT_ANGLE_DECELERATION = this.ANGLE_ACCELERATION
}

var RedSprayer = function(image) {
    Sprayer.call(this, image, 1, -0.2, Math.PI / 1000)
}

var GreenSprayer = function(image) {
    Sprayer.call(this, image)
}

var BlueSprayer = function(image) {
    Sprayer.call(this, image)
}

RedSprayer.prototype = Object.create(Sprayer.prototype)
GreenSprayer.prototype = Object.create(Sprayer.prototype)
BlueSprayer.prototype = Object.create(Sprayer.prototype)
