var Sprayer = function(image, maxSpeed, minSpeed, maxAngleSpeed, jetsCount,
    behindCenter) {
  this.image = image

  this.x = 100
  this.y = 50
  this.angle = 3
  this.speed = 0
  this.angleSpeed = 0
  this.jets = Array(jetsCount)
  for (var i = 0; i < jetsCount; ++i)
      this.jets[i] = true

  this.MAX_SPEED = maxSpeed
  this.MIN_SPEED = minSpeed
  this.MAX_ANGLE_SPEED = maxAngleSpeed
  this.ACCELERATION = 0.001
  this.ANGLE_ACCELERATION = this.MAX_ANGLE_SPEED / 100
  this.CONSTANT_DECELERATION = 0.0005
  this.CONSTANT_ANGLE_DECELERATION = this.ANGLE_ACCELERATION
  this.BEHIND_CENTER = behindCenter
}

Sprayer.prototype.jetCoords = function(i, cellSize) {
    var x = this.x - Math.sin(this.angle) * this.BEHIND_CENTER
    var y = this.y + Math.cos(this.angle) * this.BEHIND_CENTER

    var indexOffset = Math.floor(this.jets.length / 2) - i - 0.5
    var offset = indexOffset * cellSize

    return {
        x: x + Math.cos(this.angle) * offset,
        y: y + Math.sin(this.angle) * offset
    }
}

Sprayer.prototype.toggleJet = function(jetNo) {
    jetNo = this.jets.length - jetNo - 1 // left to right
    if (jetNo >= 0 && jetNo < this.jets.length)
        this.jets[jetNo] = !this.jets[jetNo]
}

var RedSprayer = function(image) {
    Sprayer.call(this, image, 1, -0.2, Math.PI / 2000, 4, 15)
}

var GreenSprayer = function(image) {
    Sprayer.call(this, image, 1, -0.2, Math.PI / 2000, 8, 30)
}

var BlueSprayer = function(image) {
    Sprayer.call(this, image, 1, -0.2, Math.PI / 2000, 6, 15)
}

RedSprayer.prototype = Object.create(Sprayer.prototype)
GreenSprayer.prototype = Object.create(Sprayer.prototype)
BlueSprayer.prototype = Object.create(Sprayer.prototype)
