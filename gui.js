var GUI = function() {
    this._timeLeft = null
    this._coverage = null
    this._coverageGoal = null

    this.onFileDropped = null
    this.onGameStarted = null
}

GUI.prototype.init = function() {
    document.addEventListener("DOMContentLoaded", function() {

        this._setActiveTabListeners()

        var droppable = document.querySelector(".droppable")
        droppable.addEventListener('dragover', this._allowDrop)
        droppable.addEventListener('drop', this._onDrop.bind(this))

        document.querySelector('a[href="#play"]').addEventListener('click',
            this.onGameStarted)

        this._timeLeft = document.getElementById('time_left')
        this._coverage = document.getElementById('coverage')
        this._coverageGoal = document.getElementById('coverage_goal')

    }.bind(this))
}

GUI.prototype._setActiveTabListeners = function(event) {
    for (var a of document.querySelectorAll('nav a')) {
        a.addEventListener('click', function(e) {
            document.querySelector('a.active_tab').classList.remove('active_tab')
            e.target.classList.add('active_tab')
        })
    }
}

GUI.prototype._allowDrop = function(e) {
    e.preventDefault()
}

GUI.prototype._onDrop = function(e) {
    e.preventDefault()
    var file = e.dataTransfer.files[0]
    var reader = new FileReader()
    reader.onload = function(event) {
        this.onFileDropped(event.target.result)
    }.bind(this)
    reader.readAsText(file)
}

GUI.prototype.onUpdate = function(state) {
    var timeLeftSecs = state.timeLeft / 1000;
    timeLeftSecs = timeLeftSecs >= 0 ? timeLeftSecs : 0
    this._timeLeft.innerHTML = Math.floor(timeLeftSecs)
    this._coverage.innerHTML = Math.floor(state.coverage)
    this._coverageGoal.innerHTML = state.coverageGoal
}