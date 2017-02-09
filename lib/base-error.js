'use strict';

const _ = require('lodash');

module.exports = class FormError {
  constructor(key, options, req, res) {
    options = Object.assign({
      type: 'default'
    }, options);
    this.key = key;
    this.type = options.type;
    this.redirect = options.redirect;
    Object.defineProperty(this, 'message', {
      enumerable: true,
      get: function () {
        return options.message || this.getMessage(key, options, req, res);
      }
    });
    Object.defineProperty(this, 'title', {
      enumerable: true,
      get: function () {
        return options.title || this.getTitle(key, options, req, res);
      }
    });
  }

  getMessage(/*key, options, req, res*/) {
    return 'Error';
  }

  getTitle(/*key, options, req, res*/) {
    return 'Oops, something went wrong';
  }
}
