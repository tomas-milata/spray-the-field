var Game = function() {
	this._graphics = new Graphics()

	this._sprayers = null
	this._field = new Field()
	this._graphics.field = this._field

	this._leftPressed = false
	this._rightPressed = false
	this._upPressed = false
	this._downPressed = false

	this._lastUpdated = null

	this.PIX_PER_MS = null
	this.MAX_NOT_RESPRAYED_DELAY = 100
}

Game.prototype.init = function() {
	this._graphics.init()

	// The sprayer should go across the whole field with same time regardless
	// of its pixel size
	this.DISTANCE_TO_PIXELS = this._graphics.canvas.width / 4000

	var loadImage = function(url) {
		return new Promise(function(resolve, reject) {
			var img = new Image()
			img.onload = function() {
				resolve(img)
			}
			img.src = url
		})
	}

	var imagePromises = [
		'img/sprayer_red.png',
		'img/sprayer_green.png',
		'img/sprayer_blue.png',
		'img/brown.png',
		'img/green.png',
		'img/yellow.png',
		'img/red.png'
	].map(loadImage)

	Promise.all(imagePromises).then(function(images) {
		this._sprayers = {
			red: new RedSprayer(images[0]),
			green: new GreenSprayer(images[1]),
			blue: new BlueSprayer(images[2])
		}

		this._field.images = {
			outside : images[3],
			uncovered : images[4],
			covered : images[5],
			resprayed : images[6]
		}
		this._graphics.sprayer = this._sprayer = this._sprayers.red

		this.initialized()
	}.bind(this)) // binds 'then' callback to this (Game)
}

Game.prototype.initialized = function() {
	document.getElementById('loading').innerHTML = ''
	this.play()
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

Game.prototype._loop = function() {
	var now = Date.now()
	var dt = now - this._lastUpdated
	this._lastUpdated = now

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

	setTimeout(this._loop.bind(this), 20)
	requestAnimationFrame(this._graphics.draw.bind(this._graphics))
}

Game.prototype._spray = function() {
	var i = Math.floor(this._sprayer.x / this._graphics.CELL_SIZE)
	var j = Math.floor(this._sprayer.y / this._graphics.CELL_SIZE)

	if (this._cellInidicesOutOfRange(i, j))
		return

	var c = this._field.cells[i][j]
	var now = Date.now()
	if (c.covered != -1) {
		if (now - c.timestamp > this.MAX_NOT_RESPRAYED_DELAY) {
			c.covered++
		}
		c.timestamp = now
	}
}

Game.prototype._cellInidicesOutOfRange = function(i, j) {
	var size = this._field.cells.length
	return i < 0 || j < 0 || i >= size || j >= size
}
