/* global L:false */
import Events from 'events'
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

      this.app.on('layers-update', () => this.showLayers())

      return false
    }

    return container
  },
  showLayers () {
    const ul = document.createElement('ul')

    this.app.layers.forEach((layer, i) => {
      if (!layer) { return }

      const layerDisplay = new ShowLayer(this.app, layer)
      const li = layerDisplay.show()
      layerDisplay.on('change', v => {
        const newLayers = JSON.parse(JSON.stringify(app.state.current.layers))
        newLayers[i] = v
        app.state.apply({ layers: newLayers })
      })

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

function showSelector (list, current) {
  const select = document.createElement('select')

  list.then(list => {
    Object.values(list).forEach(l => {
      const option = document.createElement('option')
      option.value = l.id
      option.appendChild(document.createTextNode(l.title))

      if (current === l.id) {
        option.selected = true
      }

      select.appendChild(option)
    })
  })

  return select
}

class ShowLayer extends Events {
  constructor (app, layer) {
    super()
    this.app = app
    this.layer = { data: layer.data, styleFile: layer.styleFile }
  }

  show () {
    const li = document.createElement('li')

    const layerName = document.createElement('div')
    let title = document.createElement('div')
    title.className = 'title'
    title.appendChild(document.createTextNode(modulekitLang.lang('Stylesheet')))

    layerName.appendChild(title)
    const layerSelect = showSelector(this.app.styleLoader.list(), this.layer.styleFile)
    layerSelect.onchange = () => {
      this.layer.styleFile = layerSelect.value
      this.emit('change', this.layer)
    }
    layerName.appendChild(layerSelect)
    li.appendChild(layerName)

    const dataName = document.createElement('div')

    title = document.createElement('div')
    title.className = 'title'
    title.appendChild(document.createTextNode(modulekitLang.lang('Data Source')))
    dataName.appendChild(title)

    const dataSelect = showSelector(this.app.dataSources.list(), this.layer.data)
    dataSelect.onchange = () => {
      this.layer.data = dataSelect.value
      this.emit('change', this.layer)
    }
    dataName.appendChild(dataSelect)
    li.appendChild(dataName)

    return li
  }
}
