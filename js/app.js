/**
 * namespace holding all Spray the Field! objects
 * @namespace
 */
stf = {}

/**
 * Creates new instance of application and runs bootstrap methods (e.g. resoure loading)
 * @constructor
 */
stf.App = function() {
    this._sprayers = null

    this._fieldImages = null
    this._fieldsData = null
    this._tractorSound = new Audio('sound/tractor.mp3')

    this._selectedFieldData = null
    this._selectedSprayer = null

    this._game = null

    this._registerGlobalListeners()
    this._load()
    this._initGui()
}

/**
 * Key bindings must be registered here so that each instance of Game does not have to do that.
 * @private
 */
stf.App.prototype._registerGlobalListeners = function() {
    window.addEventListener("keydown", function (e) {
        if (this._game) {
            this._game.onkeydown(e)
        }
    }.bind(this))

    window.addEventListener("keyup", function (e) {
        if (this._game) {
            this._game.onkeyup(e)
        }
    }.bind(this))
}

/**
 * Loads (static) resources (images, field maps) using Promises API.
 * @private
 */
stf.App.prototype._load = function() {

    /**
     * @param url
     * @returns {Promise} promise for loading image from url
     */
    var loadImage = function(url) {
        return new Promise(function(resolve, reject) {
            var img = new Image()
            img.onload = function() {
                resolve(img)
            }
            img.src = url
        })
    }

    /**
     * @param url
     * @returns {Promise} promise for loading map file from url
     */
    var loadMap = function(url) {
        return new Promise(function(resolve, reject) {
            var xhr = new XMLHttpRequest()
            xhr.open("GET", url)
            xhr.onreadystatechange = function() {
                if (xhr.readyState == 4 && xhr.status == 200) {
                    resolve(xhr.response)
                }
            }
            xhr.send()
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
    ].map(loadImage) // applies loadImage to all elements

    var mapPromises = [
        'maps/beginners_luck',
        'maps/obstacle',
        'maps/rectangle',
        'maps/hard_time'
    ].map(loadMap)

    // results of all promises will be returned in the order they were given
    Promise.all(imagePromises.concat(mapPromises)).then(function(result) {
        this._sprayers = {
            red: new stf.RedSprayer(result[0]),
            green: new stf.GreenSprayer(result[1]),
            blue: new stf.BlueSprayer(result[2])
        }

        this._fieldImages = {
            outside : result[3],
            uncovered : result[4],
            covered : result[5],
            resprayed : result[6]
        }

        this._fieldsData = {
            beginnersLuck: new stf.FieldData(result[7], 'beginnersLuck'),
            obstacle: new stf.FieldData(result[8], 'obstacle'),
            rectangle: new stf.FieldData(result[9], 'rectangle'),
            hardTime: new stf.FieldData(result[10], 'hardTime')
         }

        this._selectField(this._fieldsData.beginnersLuck)
        this._selectedSprayer = this._sprayers.blue

        this._initialized()
    }.bind(this)) // binds 'then' callback to this
}

/**
 * Binds callbacks to event listeners.
 * @private
 */
stf.App.prototype._initGui = function() {
    document.addEventListener("DOMContentLoaded", function() {

        var droppable = document.querySelector(".droppable")
        droppable.addEventListener('dragover', function(e) {
            e.preventDefault() // prevent default so that the map file can be dropped
            e.dataTransfer.effectAllowed = "copyMove";
            e.dataTransfer.dropEffect = "copy";
        })
        droppable.addEventListener('drop', this._onDrop.bind(this))

        window.onhashchange = this._onHashChange.bind(this)

        // binding of sprayer selection form to selected sprayer
        var vehicleInputs = document.querySelectorAll('input[name="sprayer"]')
        for (var i = 0; i < vehicleInputs.length; i++)
            vehicleInputs[i].addEventListener('change', function(e) {
                this._selectedSprayer = this._sprayers[e.target.value]
            }.bind(this))

        // binding of filed selection form to selected field data
        document.querySelector('select[name="field"]').addEventListener('change',
            function(e) {
                this._selectField(this._fieldsData[e.target.value])
            }.bind(this))

        // binding of callback that saves user best times to localstorage
        document.getElementById('record').addEventListener('submit',
            this._onBestSubmit.bind(this))

        // save DOM objects so that they aren't queried repeatedly
        this.timeLeft = document.getElementById('time_left')
        this._coverage = document.getElementById('coverage')
        this._coverageGoal = document.getElementById('coverage_goal')

    }.bind(this))
}

/**
 * Reacts on changes of url behind #.
 * @private
 */
stf.App.prototype._onHashChange = function() {
    // starting/stopping game on tab activation/deactivation
    if (location.hash == '#play')
        this._startGame()
    else if (this._game != null)
        this._game.stop()

    // sets active tab according to active anchor
    document.querySelector('a.active_tab').classList.remove('active_tab')
    document.querySelector('a[href="' + location.hash + '"]').classList.add('active_tab')
}

/**
 * Handles change of selected field.
 * @param field
 * @private
 */
stf.App.prototype._selectField = function(field) {
    this._selectedFieldData = field
    // loads records for the selected field and displays them
    var record = JSON.parse(localStorage.getItem(field.name))
    this._displayRecord(record)
}

/**
 * Handles new record submitted from a game run.
 * @param e
 * @private
 */
stf.App.prototype._onBestSubmit = function(e) {
    var time = this._game.timeLeft
    var fieldName = this._selectedFieldData.name
    var playerName = e.target.elements[0].value
    var record = {name: playerName, time: time};
    localStorage.setItem(fieldName, JSON.stringify(record))
    this._displayRecord(record)

    e.preventDefault()

    location.hash = '#setup'
}

/**
 * Displays best results for a selected map.
 * @param record
 * @private
 */
stf.App.prototype._displayRecord = function(record){
    if (typeof record == undefined || record == null) {
        record = {time: 0, name: 'Mr. Nobody'}
    }
    document.getElementById('best_time').innerHTML = record.time
    document.getElementById('best_name').innerHTML = record.name
}

/**
 * Handles drop event for user's map file upload.
 * @param e
 * @private
 */
stf.App.prototype._onDrop = function(e) {
    e.preventDefault()
    var file = e.dataTransfer.files[0]
    var reader = new FileReader()
    reader.onload = function(event) {
        // set unique name
        var name = file.name + Date.now()
        this._selectedFieldData = new stf.FieldData(event.target.result, name)
        this._fieldsData[name] = this._selectedFieldData
        // create new option and add it to select box
        var option = document.createElement("option")
        option.text = name
        option.value = name
        option.selected = true
        var select = document.querySelector('select[name="field"]')
        select.appendChild(option)
    }.bind(this)
    reader.readAsText(file)
}

/**
 * To be called when all initialization (e.g loading of resources) is complete.
 * @private
 */
stf.App.prototype._initialized = function() {
    document.querySelector('body').classList.remove('loading')

    if (location.hash == "")
        location.hash = '#setup'

    this._onHashChange()
}

/**
 * Runs new instance of game.
 * @private
 */
stf.App.prototype._startGame = function() {

    document.getElementById('play').className = 'playing'

    var field = new stf.Field(this._fieldImages, this._selectedFieldData);

    // move sprayer back to beginning
    this._selectedSprayer.resetStartPosition()

    // load best results from localStorage
    var record = JSON.parse(localStorage.getItem(this._selectedFieldData.name))
    var recordTime = record == null ? 0 : record.time

    if (this._game)
        this._game.stop()

    this._game = new stf.Game(field, this._selectedSprayer, this._onUpdate.bind(this),
        this._tractorSound, recordTime)
    this._game.stopCallback = this._onGameStop
    this._game.play()
}

/**
 * Handles end of the game
 * @param result
 */
stf.App.prototype._onGameStop = function(result) {
    document.getElementById('play').className = 'finished ' + result
}

/**
 * Callback to be called from Game to update data in GUI
 * @param state
 */
stf.App.prototype._onUpdate = function(state) {
    var timeLeftSecs = state.timeLeft / 1000;
    timeLeftSecs = timeLeftSecs >= 0 ? timeLeftSecs : 0
    this.timeLeft.innerHTML = Math.floor(timeLeftSecs)
    this._coverage.innerHTML = Math.floor(state.coverage)
    this._coverageGoal.innerHTML = state.coverageGoal
}

// automatically initializes App
new stf.App()