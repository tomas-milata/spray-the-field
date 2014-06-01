var GUI = function() {}

GUI.prototype.init = function() {
    document.addEventListener("DOMContentLoaded", function() {

        this._setActiveTabListeners()

        var droppable = document.querySelector(".droppable")
        droppable.addEventListener('dragover', this._allowDrop)
        droppable.addEventListener('drop', this._onDrop)

        document

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

var gui = new GUI()
gui.init()
