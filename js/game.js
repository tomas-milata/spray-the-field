/**
 * Creates new instance and initializes graphics.
 * @param field
 * @param sprayer
 * @param updateCallback
 * @param tractorSound
 * @param historyBest
 * @constructor
 */
stf.Game = function(field, sprayer, updateCallback, tractorSound, historyBest) {
	this._graphics = new stf.Graphics()

	this._sprayer = this._graphics.sprayer = sprayer
	this._graphics.field = this._field = field
    this._tractorSound = tractorSound

	this._leftPressed = false
	this._rightPressed = false
	this._upPressed = false
	this._downPressed = false

	this._lastUpdated = null
    this.timeLeft = field.LIMIT_SECONDS * 1000
    this._historyBest = historyBest

    this._updateCallback = updateCallback
    this.stopCallback = null

    this._stopped = false

    this.RESPRAY_PENALTY = 100

    // The sprayer should go across the whole field with same time regardless
    // of its pixel size
    this.DISTANCE_TO_PIXELS = this._graphics.canvas.width / 8000
}

/**
 * Initializes and starts main game loop.
 */
stf.Game.prototype.play = function() {
    this._tractorSound.loop = true
    this._tractorSound.play()
	this._lastUpdated = Date.now()
	this._loop()
}

/**
 * Stops running game.
 */
stf.Game.prototype.stop = function() {
    this._tractorSound.pause()
    this._stopped = true
}

/**
 * Handles pressed keys
 * @param event
 */
stf.Game.prototype.onkeydown = function(event) {
    switch (event.keyCode) {
        case 37: // left arrow
            this._leftPressed = true
            this._rightPressed = false
            break
        case 38: // up arrow
            this._upPressed = true
            this._downPressed = false
            break
        case 39: // right arrow
            this._leftPressed = false
            this._rightPressed = true
            break
        case 40: // down arrow
            this._upPressed = false
            this._downPressed = true
            break
        default: // keys 1, 2, ..., 9, 0
            if (event.keyCode >= 49 && event.keyCode <= 58) // 49 is "1" key
                this._sprayer.toggleJet(event.keyCode - 49)
            break
    }
}

/**
 * Handlers key release events.
 * @param event
 */
stf.Game.prototype.onkeyup = function(event) {
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
}

/**
 * Test terminating condition.
 * @returns {boolean|*}
 * @private
 */
stf.Game.prototype._finished = function() {
    return this._stopped || this.timeLeft <= 0 || this._field.coverage >= this._field.LIMIT_COVERAGE
}

/**
 * Decides whether player lost, won or even made record and notifies callback.
 * @private
 */
stf.Game.prototype._reportResult = function() {
    var result = 'loose'
    if (this._field.coverage >= this._field.LIMIT_COVERAGE)
        result = 'win'
    if (this.timeLeft > this._historyBest)
        result = 'record'
    this.stopCallback(result)
}
/**
 * Main game loop.
 * @private
 */
stf.Game.prototype._loop = function() {

    if (this._finished()) {
        this.stop()
        this._reportResult()
        return
    }

	var now = Date.now()
    // time delta
	var dt = now - this._lastUpdated
	this._lastUpdated = now

    this.timeLeft -= dt

	this._spray()

    // sprayer physics
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
			if ((old > 0) != (this._sprayer.angleSpeed > 0)) // different signs
				this._sprayer.angleSpeed = 0
		}
	}

	this._sprayer.y -= Math.cos(this._sprayer.angle) * dt * this._sprayer.speed * this.DISTANCE_TO_PIXELS
	this._sprayer.x += Math.sin(this._sprayer.angle) * dt * this._sprayer.speed * this.DISTANCE_TO_PIXELS
	this._sprayer.angle += dt * this._sprayer.angleSpeed

    // continue in loop
	setTimeout(this._loop.bind(this), 25)
    // redraw when possible
	requestAnimationFrame(this._graphics.draw.bind(this._graphics))

    // notify listener about game state
    this._updateCallback({
        timeLeft: this.timeLeft,
        coverage: this._field.coverage,
        coverageGoal: this._field.LIMIT_COVERAGE
    })
}

/**
 * Sprays using all sprayer's jets.
 * @private
 */
stf.Game.prototype._spray = function() {
	for (var jet = 0; jet < this._sprayer.jets.length; ++jet) {

		if (this._sprayer.jets[jet]) { // jet is on
			var coords = this._sprayer.jetCoords(jet, this._field.CELL_SIZE)

			var i = Math.floor(coords.x / this._field.CELL_SIZE)
			var j = Math.floor(coords.y / this._field.CELL_SIZE)

			if (!this._cellInidicesOutOfRange(i, j)) {
                var penalty = this._field.sprayCell(i, j)
                if (penalty) {
                    this.timeLeft -= this.RESPRAY_PENALTY
                }
            }
		}
	}
}

/**
 * @param i
 * @param j
 * @returns {boolean} true iff given cell indicies are out of field range
 * @private
 */
stf.Game.prototype._cellInidicesOutOfRange = function(i, j) {
	var size = this._field.cells.length
	return i < 0 || j < 0 || i >= size || j >= size
}
