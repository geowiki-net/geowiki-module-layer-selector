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

      this.window.content.classList.add('layer-selector')
      this.window.show()

      if (this.ul) {
        this.updateLayers()
      } else {
        this.showLayers()
      }

      this.app.on('layers-update', () => this.updateLayers())
      this.app.on('data-sources-update', () => this.updateEntities())
      this.app.on('styles-update', () => this.updateEntities())

      return false
    }

    return container
  },
  updateEntities () {
    this.layerDisplays.forEach(layer => {
      layer.updateEntities()
    })
  },
  showLayers () {
    this.ul = document.createElement('ul')

    this.layerDisplays = this.app.layers.map((layer, i) => {
      if (!layer) { return }

      return this.showLayer(layer, i)
    })

    this.window.content.appendChild(this.ul)

    const addLayer = document.createElement('button')
    addLayer.innerHTML = modulekitLang.lang('Add layer')
    addLayer.onclick = () => {
      const i = this.layerDisplays.length
      this.layerDisplays[i] = this.showLayer({}, i)
    }
    this.window.content.appendChild(addLayer)
  },
  showLayer (layer, i) {
    const layerDisplay = new ShowLayer(this.app, layer)
    const li = layerDisplay.show()
    layerDisplay.on('change', v => {
      const newLayers = JSON.parse(JSON.stringify(app.state.current.layers))

      if (!v.data || !v.styleFile || !v.data) {
        newLayers[i] = null
      } else {
        newLayers[i] = v
      }

      app.state.apply({ layers: newLayers })
    })

    this.ul.appendChild(li)
    return layerDisplay
  },
  updateLayers () {
    this.app.layers.forEach((layer, i) => {
      if (!layer) {
        this.layerDisplays[i].close()
      }

      if (!this.layerDisplays[i]) {
        this.layerDisplays[i] = this.showLayer(layer, i)
      } else {
        this.layerDisplays[i].update(layer)
      }

    })
  }
})

function showSelector (select, list, current) {
  list.then(list => {
    const option = document.createElement('option')
    option.value = ''
    select.appendChild(option)

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
    this.layerSelect = document.createElement('select')
    showSelector(this.layerSelect, this.app.styleLoader.list(), this.layer.styleFile)
    this.layerSelect.onchange = () => {
      this.layer.styleFile = this.layerSelect.value
      this.emit('change', this.layer)
    }
    layerName.appendChild(this.layerSelect)
    li.appendChild(layerName)

    const dataName = document.createElement('div')

    title = document.createElement('div')
    title.className = 'title'
    title.appendChild(document.createTextNode(modulekitLang.lang('Data Source')))
    dataName.appendChild(title)

    this.dataSelect = document.createElement('select')
    showSelector(this.dataSelect, this.app.dataSources.list(), this.layer.data)
    this.dataSelect.onchange = () => {
      this.layer.data = this.dataSelect.value
      this.emit('change', this.layer)
    }
    dataName.appendChild(this.dataSelect)
    li.appendChild(dataName)

    return li
  }

  update (layer) {
    this.layerSelect.value = layer ? layer.styleFile : ''
    this.dataSelect.value = layer ? layer.data : ''
  }

  updateEntities () {
    this.layerSelect.innerHTML = ''
    showSelector(this.layerSelect, this.app.styleLoader.list(), this.layer.styleFile)
    this.dataSelect.innerHTML = ''
    showSelector(this.dataSelect, this.app.dataSources.list(), this.layer.data)
  }
}
