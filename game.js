var Game = function(field, sprayer, updateCallback) {
	this._graphics = new Graphics()

	this._sprayer = this._graphics.sprayer = sprayer
	this._graphics.field = this._field = field

	this._leftPressed = false
	this._rightPressed = false
	this._upPressed = false
	this._downPressed = false

	this._lastUpdated = null
    this._timeLeft = field.LIMIT_SECONDS * 1000

    this._updateCallback = updateCallback

    this.RESPRAY_PENALTY = 100
}

Game.prototype.init = function() {

	// The sprayer should go across the whole field with same time regardless
	// of its pixel size
	this.DISTANCE_TO_PIXELS = this._graphics.canvas.width / 8000

}

Game.prototype.play = function() {
	this._lastUpdated = Date.now()
	this._loop()

	window.addEventListener("keydown", function (event) {
		switch (event.keyCode) {
		case 37:
			this._leftPressed = true
			this._rightPressed = false
			break
		case 38:
			this._upPressed = true
			this._downPressed = false
			break
		case 39:
			this._leftPressed = false
			this._rightPressed = true
			break
		case 40:
			this._upPressed = false
			this._downPressed = true
			break
		default:
			if (event.keyCode >= 49 && event.keyCode <= 58) // 49 is "1" key
				this._sprayer.toggleJet(event.keyCode - 49)
			break
		}
	}.bind(this)) // binds listener to this (Game)

	window.addEventListener("keyup", function (event) {
		switch (event.keyCode) {
		case 37:
			this._leftPressed = false
			break
		case 38:
			this._upPressed = false
			break
		case 39:
			this._rightPressed = false
			break
		case 40:
			this._downPressed = false
			break
		}
	}.bind(this)) // binds listener to this (Game)
}

Game.prototype._finished = function() {
    return this._timeLeft <= 0 || this._field.coverage >= this._field.LIMIT_COVERAGE
}

Game.prototype._loop = function() {

    if (this._finished()) {
        return
    }

	var now = Date.now()
	var dt = now - this._lastUpdated
	this._lastUpdated = now

    this._timeLeft -= dt

	this._spray()

	if (this._upPressed) {
		this._sprayer.speed += dt * this._sprayer.ACCELERATION
		if (this._sprayer.speed > this._sprayer.MAX_SPEED)
			this._sprayer.speed = this._sprayer.MAX_SPEED
	} else if (this._downPressed) {
		this._sprayer.speed -= dt * this._sprayer.ACCELERATION
		if (this._sprayer.speed < this._sprayer.MIN_SPEED)
			this._sprayer.speed = this._sprayer.MIN_SPEED
	} else { // constant deceleration
		if (this._sprayer.speed > 0) {
			this._sprayer.speed -= dt * this._sprayer.CONSTANT_DECELERATION
			if (this._sprayer.speed < 0)
				this._sprayer.speed = 0
		} else {
			this._sprayer.speed += dt * this._sprayer.CONSTANT_DECELERATION
			if (this._sprayer.speed > 0)
				this._sprayer.speed = 0
		}
	}

	if (this._leftPressed) {
		this._sprayer.angleSpeed -= dt * this._sprayer.ANGLE_ACCELERATION
		if (this._sprayer.angleSpeed < -this._sprayer.MAX_ANGLE_SPEED)
			this._sprayer.angleSpeed = -this._sprayer.MAX_ANGLE_SPEED
	} else if (this._rightPressed) {
		this._sprayer.angleSpeed += dt * this._sprayer.ANGLE_ACCELERATION
		if (this._sprayer.angleSpeed > this._sprayer.MAX_ANGLE_SPEED)
			this._sprayer.angleSpeed = this._sprayer.MAX_ANGLE_SPEED
	} else {
		var old = this._sprayer.angleSpeed
		if (old != 0) {
			if (old > 0)
				this._sprayer.angleSpeed -= this._sprayer.CONSTANT_ANGLE_DECELERATION
			else
				this._sprayer.angleSpeed += this._sprayer.CONSTANT_ANGLE_DECELERATION
			if (Math.sign(old) != Math.sign(this._sprayer.angleSpeed))
				this._sprayer.angleSpeed = 0
		}
	}

	this._sprayer.y -= Math.cos(this._sprayer.angle) * dt * this._sprayer.speed * this.DISTANCE_TO_PIXELS
	this._sprayer.x += Math.sin(this._sprayer.angle) * dt * this._sprayer.speed * this.DISTANCE_TO_PIXELS
	this._sprayer.angle += dt * this._sprayer.angleSpeed

	setTimeout(this._loop.bind(this), 25)
	requestAnimationFrame(this._graphics.draw.bind(this._graphics))

    this._updateCallback({
        timeLeft: this._timeLeft,
        coverage: this._field.coverage
    })
}

Game.prototype._spray = function() {
	for (var jet = 0; jet < this._sprayer.jets.length; ++jet) {

		if (this._sprayer.jets[jet]) { // jet is on
			var coords = this._sprayer.jetCoords(jet, this._field.CELL_SIZE)

			var i = Math.floor(coords.x / this._field.CELL_SIZE)
			var j = Math.floor(coords.y / this._field.CELL_SIZE)

			if (!this._cellInidicesOutOfRange(i, j)) {
                var penalty = this._field.sprayCell(i, j)
                if (penalty) {
                    this._timeLeft -= this.RESPRAY_PENALTY
                }
            }
		}
	}
}



Game.prototype._cellInidicesOutOfRange = function(i, j) {
	var size = this._field.cells.length
	return i < 0 || j < 0 || i >= size || j >= size
}
