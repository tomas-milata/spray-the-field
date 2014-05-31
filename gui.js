var GUI = function() {}

GUI.prototype.init = function() {
    document.addEventListener("DOMContentLoaded", this._setActiveTabListeners)
}

GUI.prototype._setActiveTabListeners = function(event) {
    for (var a of document.querySelectorAll('nav a')) {
        a.addEventListener('click', function(e) {
            document.querySelector('a.active_tab').classList.remove('active_tab')
            e.target.classList.add('active_tab')
        })
    }
}

var gui = new GUI()
gui.init()
