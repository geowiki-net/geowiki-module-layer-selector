/* global L:false */
import modulekitLang from 'modulekit-lang'
import Window from 'modulekit-window'

module.exports = {
  id: 'layer-selector',
  requireModules: ['layers'],
  appInit (app) {
    app.map.addControl(new LayerSelectorControl())
  }
}

let layerSelectorWindow

const LayerSelectorControl = L.Control.extend({
  options: {
    position: 'topright'
    // control position - allowed: 'topleft', 'topright', 'bottomleft', 'bottomright'
  },
  onAdd: function (map) {
    const container = L.DomUtil.create('div', 'leaflet-bar leaflet-control-layer-selector')
    container.innerHTML = "<a href='#'><i class='fa fa-layer-group'></i></a>"
    container.title = modulekitLang.lang('layer-selector')

    container.onclick = function () {
      if (layerSelectorWindow) {
        layerSelectorWindow.show()
        return
      }

      layerSelectorWindow = new Window({
        title: modulekitLang.lang('layer-selector')
      })

      layerSelectorWindow.show()

      return false
    }

    return container
  }
})

