# The jSmart Express
jSmart Express lets you use jSmart (Smarty template engine) and Express (at least version 3) together, including auto-loading partials.

[![Build Status](https://travis-ci.org/umakantp/jsmart-express.png?branch=master)](https://travis-ci.org/umakantp/jsmart-express)
[![npm version](https://img.shields.io/npm/v/jsmart-express.svg)](https://www.npmjs.com/package/jsmart-express)
[![David](https://img.shields.io/david/umakantp/jsmart-express.svg)](https://www.npmjs.com/package/jsmart-express)
[![David](https://img.shields.io/david/dev/umakantp/jsmart-express.svg)](https://www.npmjs.com/package/jsmart-express)
[![npm](https://img.shields.io/npm/l/jsmart-express.svg)](https://github.com/umakantp/jsmart-express/blob/master/LICENSE)


## Usage
```js
var jsmartExpress = require('jsmart-express');

// Register '.smarty' extension with The Mustache Express
app.engine('smarty', jsmartExpress());

app.set('view engine', 'smarty');
app.set('views', __dirname + '/views');
```

## Parameters

The mustacheExpress method can take one parameter: the directory of the partials. When a partial is requested by a template, the file will be loaded from `path.resolve(directory)`. By default, these value is determined by Express.

## Properties

The return function has a `cache` parameter that is an [LRU Cache](https://github.com/isaacs/node-lru-cache).

```js
var engine = jsmartExpress();
var cache = engine.cache; // Caches the full file name with some internal data.
```

Note that jSmart also has its own cache for partials. You can always use `nocache` attribute for partials for disbling jSmart cache.
