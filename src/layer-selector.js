/* global L:false */
import modulekitLang from 'modulekit-lang'
import Window from 'modulekit-window'

module.exports = {
  id: 'layer-selector',
  requireModules: ['layers'],
  appInit (app) {
    app.map.addControl(new LayerSelectorControl(app))
  }
}

const LayerSelectorControl = L.Control.extend({
  options: {
    position: 'topright'
    // control position - allowed: 'topleft', 'topright', 'bottomleft', 'bottomright'
  },
  initialize: function (app) {
    this.app = app
  },
  onAdd: function (map) {
    const container = L.DomUtil.create('div', 'leaflet-bar leaflet-control-layer-selector')
    container.innerHTML = "<a href='#'><i class='fa fa-layer-group'></i></a>"
    container.title = modulekitLang.lang('layer-selector')

    container.onclick = () => {
      if (this.window) {
        this.window.show()
        return
      }

      this.window = new Window({
        title: modulekitLang.lang('layer-selector')
      })

      this.window.show()

      this.showLayers()

      return false
    }

    return container
  },
  showLayers () {
    const ul = document.createElement('ul')

    this.app.layers.forEach(layer => {
      const li = document.createElement('li')

      const layerName = document.createElement('div')
      layerName.appendChild(document.createTextNode(layer.styleFile))
      li.appendChild(layerName)

      const dataName = document.createElement('div')
      dataName.appendChild(document.createTextNode(layer.data))
      li.appendChild(dataName)

      ul.appendChild(li)
    })

    const current = this.window.content.firstChild
    if (current) {
      this.window.content.replaceChild(ul, current)
    } else {
      this.window.content.appendChild(ul)
    }
  }
})
