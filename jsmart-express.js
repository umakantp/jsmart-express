'use strict'

var async = require('async')
var findPartials = require('./find-partials')
var fs = require('fs')
var lruCache = require('lru-cache')
var jSmart = require('jsmart')
var path = require('path')

// Load a single file, and return the data.
function loadFile (fullFilePath, callback) {
  fs.readFile(fullFilePath, 'utf-8', function (err, data) {
    if (err) {
      return callback(err)
    }

    return callback(null, data)
  })
}

function handleFile (name, file, layoutPath, options, cache, callback) {
  var cachedData
  if (!options || !options.settings || options.settings['view cache'] !== false) {
    cachedData = cache && cache.get(file)
  }
  if (!cachedData) {
    loadFile(file, function (err, fileData) {
      if (err) {
        return callback(err)
      }
      if (fileData && layoutPath) {
        fileData = '{extends file="' + layoutPath + '"} ' + fileData
      }

      var partials = findPartials(fileData)
      var data = {
        name: name,
        data: fileData,
        partials: partials
      }
      if (cache) {
        cache.set(file, data)
      }
      return callback(null, data)
    })
  } else {
    return callback(null, cachedData)
  }
}

function consolidatePartials (arr) {
  var partialsSet = {}
  arr.forEach(function (item) {
    item.partials.forEach(function (partial) {
      partialsSet[partial] = true
    })
  })
  return Object.keys(partialsSet)
}

// Of the partials given, which haven't been loaded yet?
function findUnloadedPartials (partialNames, loadedPartials) {
  return partialNames.filter(function (partialName) {
    return !(partialName in loadedPartials)
  })
}

function loadAllPartials (unparsedPartials, partialsDirectory, options, cache, partials, callback) {
  if (!partials) {
    partials = {}
  }
  if (unparsedPartials.length === 0) {
    return callback(null, partials)
  }
  async.map(unparsedPartials, function (partial, next) {
    var fullFilePath = path.resolve(partialsDirectory, partial)
    return handleFile(partial, fullFilePath, null, options, cache, next)
  }, function (err, data) {
    if (err) {
      return callback(err)
    }
    data.forEach(function (partialData) {
      partials[partialData.name] = partialData.data
    })

    var consolidatedPartials = consolidatePartials(data)

    var partialsToLoad = findUnloadedPartials(consolidatedPartials, partials)

    return loadAllPartials(partialsToLoad, partialsDirectory, options, cache, partials, callback)
  })
}

function loadTemplateAndPartials (templateFile, partialsDirectory, layoutPath, options, cache, callback) {
  handleFile(null, templateFile, layoutPath, options, cache, function (err, partialData) {
    if (err) {
      return callback(err)
    }
    return loadAllPartials(partialData.partials, partialsDirectory, options, cache, null, function (err, partials) {
      if (err) {
        return callback(err)
      }
      return callback(null, partialData.data, partials)
    })
  })
}

function render (templatePath, viewDirectory, viewExtension, options, cache, callback) {
  var layoutPath = null
  if (options && options.settings && options.settings.layout) {
    layoutPath = options.settings.layout + '.' + viewExtension
  }

  loadTemplateAndPartials(templatePath, viewDirectory, layoutPath, options, cache, function (err, template, partials) {
    if (err) {
      return callback(err)
    }

    jSmart.prototype.getTemplate = function (name) {
      return partials[name]
    }

    var smarty = new jSmart(template, options.settings['jsmart-settings'])
    callback(err, smarty.fetch(options))
  })
}

function renderer (directory) {
  var cache = lruCache({
    max: 50000,
    length: function (item) {
      return item.data.length
    }
  })

  var rendererWrapper = function (templatePath, options, callback) {
    var viewDirectory
    var viewExtension = 'smarty'
    if (options && options.settings) {
      viewExtension = options.settings['view engine']
      viewDirectory = options.settings.views
    }
    if (directory) {
      viewDirectory = directory
    }

    render(templatePath, viewDirectory, viewExtension, options, rendererWrapper.cache, function (err, data) {
      if (err) {
        return callback(err)
      }

      return callback(err, data)
    })
  }
  rendererWrapper.cache = cache
  return rendererWrapper
}

module.exports = renderer
