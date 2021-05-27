'use strict'

var fs = require('fs')
var jsmartExpress = require('../jsmart-express.js')
var should = require('should')

describe('jsmartExpress', function () {
  it('should render a normal template', function (done) {
    var renderer = jsmartExpress('test/test01')

    renderer('test/test01/index.smarty', {
      name: 'World'
    }, function (err, result) {
      should.not.exist(err)
      should.exist(result)
      result.should.eql('World\n')
      done()
    })
  })

  it('should render a template with a partial', function (done) {
    var renderer = jsmartExpress('test/test02')

    renderer('test/test02/index.smarty', {
      name: 'World'
    }, function (err, result) {
      should.not.exist(err)
      should.exist(result)
      result.should.eql('Hey, World\n\nfile included\n')

      done()
    })
  })

  it('should render a template with a partial without parameters', function (done) {
    var renderer = jsmartExpress()
    renderer('test/test02/index.smarty', {
      name: 'World',
      settings: {
        views: 'test/test02',
        'view engine': 'smarty'
      }
    }, function (err, result) {
      should.not.exist(err)
      should.exist(result)
      result.should.eql('Hey, World\n\nfile included\n')

      done()
    })
  })

  it('should render a template with a partial, where the partial has templatable stuff', function (done) {
    var renderer = jsmartExpress('test/test03')
    renderer('test/test03/index.smarty', {
      salutation: 'Hey',
      name: 'World'
    }, function (err, result) {
      should.not.exist(err)
      should.exist(result)
      result.should.eql('Hey\n, World\n')

      done()
    })
  })

  it('should render a template that includes the same partial twice', function (done) {
    var renderer = jsmartExpress()
    renderer('test/test04/index.smarty', {
      name: 'World',
      settings: {
        views: 'test/test04',
        'view engine': 'smarty'
      }
    }, function (err, result) {
      should.not.exist(err)
      should.exist(result)
      result.should.eql('Hey, World\n\nfile included twice\nfile included twice\n')

      done()
    })
  })

  it('should render a template that includes two partials', function (done) {
    var renderer = jsmartExpress('test/test05')
    renderer('test/test05/index.smarty', {
      name: 'World',
      salutation: 'Hey'
    }, function (err, result) {
      should.not.exist(err)
      should.exist(result)
      result.should.eql('Hey\n, World, Hello\n\n')

      done()
    })
  })

  it('should render a template that has a partial that includes another partial', function (done) {
    var renderer = jsmartExpress('test/test06')
    renderer('test/test06/index.smarty', {
      name: 'World'
    }, function (err, result) {
      should.not.exist(err)
      should.exist(result)
      result.should.eql('Hey, World\n')

      done()
    })
  })

  it('should cache the partials that it loads', function (done) {
    var renderer = jsmartExpress('test/test07')

    fs.writeFileSync('test/test07/p3.smarty', 'Version 1', 'utf-8')

    renderer('test/test07/index.smarty', {}, function (err, result) {
      should.not.exist(err)
      should.exist(result)

      fs.writeFileSync('test/test07/p3.smarty', 'Version 2', 'utf-8')

      renderer('test/test07/index.smarty', {}, function (err, result) {
        should.not.exist(err)
        should.exist(result)

        result.should.eql('Version 1')
        done()
      })
    })
  })

  it('should allow access to the partial cache', function (done) {
    var renderer = jsmartExpress('test/test07')
    renderer.should.have.property('cache')

    fs.writeFileSync('test/test07/p3.smarty', 'Version 1', 'utf-8')

    renderer('test/test07/index.smarty', {}, function (err, result) {
      should.not.exist(err)
      should.exist(result)

      // Clear the partial cache!
      // Remember to disable jSmart internal cache.
      renderer.cache.reset()

      fs.writeFileSync('test/test07/p3.smarty', 'Version 2', 'utf-8')

      renderer('test/test07/index.smarty', {}, function (err, result) {
        should.not.exist(err)
        should.exist(result)

        result.should.eql('Version 2')
        done()
      })
    })
  })

  it('should allow correctly handle a removed cache', function (done) {
    var renderer = jsmartExpress('test/test01')
    renderer.should.have.property('cache')
    delete renderer.cache

    renderer('test/test01/index.smarty', {
      name: 'World'
    }, function (err, result) {
      should.not.exist(err)
      should.exist(result)
      result.should.eql('World\n')

      done()
    })
  })

  it('should render a partial from the directory set in constructor', function (done) {
    var renderer = jsmartExpress('test/test02')
    renderer('test/test03/index.smarty', {
      name: 'someone',
      settings: {
        views: 'test/test03'
      }
    }, function (err, result) {
      should.not.exist(err)
      should.exist(result)
      result.should.eql('file included\n, someone\n')

      done()
    })
  })

  it('should not cache the partials that it loads if "view cache" is false', function (done) {
    var renderer = jsmartExpress('test/test07')

    fs.writeFileSync('test/test07/p3.smarty', 'Version 1', 'utf-8')

    renderer('test/test07/index.smarty', {
      settings: {
        'view cache': false
      }
    }, function (err, result) {
      should.not.exist(err)
      should.exist(result)

      fs.writeFileSync('test/test07/p3.smarty', 'Version 2', 'utf-8')

      renderer('test/test07/index.smarty', {
        settings: {
          'view cache': false
        }
      }, function (err, result) {
        should.not.exist(err)
        should.exist(result)

        result.should.eql('Version 2')
        done()
      })
    })
  })

  it('should cache the partials that it loads if "view cache" is true', function (done) {
    var renderer = jsmartExpress('test/test07')

    fs.writeFileSync('test/test07/p3.smarty', 'Version 1', 'utf-8')

    renderer('test/test07/index.smarty', {
      settings: {
        'view cache': true
      }
    }, function (err, result) {
      should.not.exist(err)
      should.exist(result)

      fs.writeFileSync('test/test07/p3.smarty', 'Version 2', 'utf-8')

      renderer('test/test07/index.smarty', {
        settings: {
          'view cache': true
        }
      }, function (err, result) {
        should.not.exist(err)
        should.exist(result)

        result.should.eql('Version 1')
        done()
      })
    })
  })

  it('should render the view into layout', function (done) {
    var renderer = jsmartExpress('test/test10')
    renderer('test/test10/index.smarty', {
      settings: {
        'view engine': 'smarty',
        layout: 'layout'
      }
    }, function (err, result) {
      should.not.exist(err)
      should.exist(result)
      result.should.eql('Layout: New Title')

      done()
    })
  })

  it('should render the view into layout with partials', function (done) {
    var renderer = jsmartExpress('test/test11')
    renderer('test/test11/index.smarty', {
      settings: {
        'view engine': 'smarty',
        layout: 'layout'
      }
    }, function (err, result) {
      should.not.exist(err)
      should.exist(result)
      result.should.eql('Layout\n: New Title')

      done()
    })
  })

  it('should render the view with custom delimiters', function (done) {
    var renderer = jsmartExpress('test/test12')
    renderer('test/test12/index.smarty', {
      name: 'arnavi',
      settings: {
        'view engine': 'smarty',
        'jsmart-settings': {
          ldelim: '{{',
          rdelim: '}}'
        }
      }
    }, function (err, result) {
      should.not.exist(err)
      should.exist(result)
      result.should.eql('custom delimiters arnavi\n')

      done()
    })
  })
})
