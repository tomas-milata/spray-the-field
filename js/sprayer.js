stf.Sprayer = function(image, maxSpeed, minSpeed, maxAngleSpeed, jetsCount,
    behindCenter) {
    this.image = image

    this.resetStartPosition()

    this.MAX_SPEED = maxSpeed
    this.MIN_SPEED = minSpeed
    this.MAX_ANGLE_SPEED = maxAngleSpeed
    this.ACCELERATION = 0.001
    this.ANGLE_ACCELERATION = this.MAX_ANGLE_SPEED / 100
    this.CONSTANT_DECELERATION = 0.0005
    this.CONSTANT_ANGLE_DECELERATION = this.ANGLE_ACCELERATION
    this.BEHIND_CENTER = behindCenter
    this.JETS_COUNT = jetsCount
}

stf.Sprayer.prototype.resetStartPosition = function() {
    this.x = 100
    this.y = 50
    this.angle = 3
    this.speed = 0
    this.angleSpeed = 0
    this.jets = new Array(this.JETS_COUNT)
    for (var i = 0; i < this.JETS_COUNT; ++i)
        this.jets[i] = true
}

stf.Sprayer.prototype.jetCoords = function(i, cellSize) {
    var x = this.x - Math.sin(this.angle) * this.BEHIND_CENTER
    var y = this.y + Math.cos(this.angle) * this.BEHIND_CENTER

    var indexOffset = Math.floor(this.jets.length / 2) - i - 0.5
    var offset = indexOffset * cellSize

    return {
        x: x + Math.cos(this.angle) * offset,
        y: y + Math.sin(this.angle) * offset
    }
}

stf.Sprayer.prototype.toggleJet = function(jetNo) {
    jetNo = this.jets.length - jetNo - 1 // left to right
    if (jetNo >= 0 && jetNo < this.jets.length)
        this.jets[jetNo] = !this.jets[jetNo]
}

stf.RedSprayer = function(image) {
    stf.Sprayer.call(this, image, 1.5, -0.2, Math.PI / 2000, 4, 15)
}

stf.GreenSprayer = function(image) {
    stf.Sprayer.call(this, image, 0.75, -0.2, Math.PI / 2000, 8, 30)
}

stf.BlueSprayer = function(image) {
    stf.Sprayer.call(this, image, 1, -0.2, Math.PI / 2000, 6, 15)
}

stf.RedSprayer.prototype = Object.create(stf.Sprayer.prototype)
stf.GreenSprayer.prototype = Object.create(stf.Sprayer.prototype)
stf.BlueSprayer.prototype = Object.create(stf.Sprayer.prototype)
