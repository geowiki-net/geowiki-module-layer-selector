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

    this.app.layers.forEach((layer, i) => {
      if (!layer) { return }

      const li = document.createElement('li')

      const layerName = document.createElement('div')
      layerName.appendChild(document.createTextNode(layer.styleFile))
      li.appendChild(layerName)

      const dataName = document.createElement('div')
      const dataSelect = document.createElement('select')
      dataSelect.onchange = () => {
        const newLayers = app.state.current.layers.map(l => {
          return {...l}
        })
        newLayers[i].data = dataSelect.value
        app.state.apply({ layers: newLayers })
      }
      dataName.appendChild(dataSelect)
      app.dataSources.list().then(list => {
        Object.values(list).forEach(l => {
          const option = document.createElement('option')
          option.value = l.id
          option.appendChild(document.createTextNode(l.title))

          if (layer.data === l.id) {
            option.selected = true
          }

          dataSelect.appendChild(option)
        })
      })
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
