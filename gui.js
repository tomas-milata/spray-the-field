var GUI = function() {
    this._timeLeft = null
    this._coverage = null
}

GUI.prototype.init = function() {
    document.addEventListener("DOMContentLoaded", function() {

        this._setActiveTabListeners()

        var droppable = document.querySelector(".droppable")
        droppable.addEventListener('dragover', this._allowDrop)
        droppable.addEventListener('drop', this._onDrop)

        this._timeLeft = document.getElementById('time_left')
        this._coverage = document.getElementById('coverage')

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
        console.log(event.target.result)
    }
    reader.readAsText(file);
}

GUI.prototype.onUpdate = function(state) {
    this._timeLeft.innerHTML = state.timeLeft / 1000
    this._coverage.innerHTML = state.coverage
}