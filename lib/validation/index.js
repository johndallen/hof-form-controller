'use strict';

const _ = require('lodash');
const debug = require('debug')('hmpo:validation');

const validators = require('./validators');

function applyValidator(validator, value, key) {

  function validate() {
    debug('Applying %s validator with value "%s"', validator.type, value);
    let args = [value];
    if (!_.isArray(validator.arguments)) {
      validator.arguments = [ validator.arguments ];
    }
    args = args.concat(validator.arguments);
    if (!validators[validator.type].apply(null, args)) {
      return Object.assign({ key }, validator, { arguments: validator.arguments });
    }
  }

  function customValidate() {
    debug('Applying custom %s validator with value %s', validator.name, value);
    if (!validator(value)) {
      return Object.assign({ key }, { type: validator.name });
    }
  }

  if (typeof validator === 'string') {
    validator = {
      type: validator
    };
  }
  if (validators[validator.type]) {
    return validate();
  } else if (typeof validator === 'function') {
    if (validator.name) {
      return customValidate();
    } else {
      throw new Error('Custom validator needs to be a named function');
    }
  } else {
    throw new Error(`Undefined validator: ${validator.type}`);
  }
}

function validator(fields) {
  const localFields = _.map(fields, (field, key) => {
    const validate = field.validate ? _.castArray(field.validate) : [];
    if (field.options) {
      validate.push({
        type: 'equal',
        arguments: _.map(field.options, option =>
          typeof option === 'string' ? option : option.value
        )
      });
    }

    return Object.assign({}, field, {
      validate
    });
  });

  return (key, value, values, emptyValue) => {
    debug('Validating field: "' + key + '" with value: "' + value + '"');
    emptyValue = emptyValue === undefined ? '' : emptyValue;

    function shouldValidate() {
      var dependent = fields[key].dependent;

      if (typeof dependent === 'string') {
        dependent = {
          field: dependent,
          value: true
        };
      }
      if (!dependent
        || (dependent && !fields[dependent.field])
        || (dependent && (Array.isArray(values[dependent.field])
        ? values[dependent.field].indexOf(dependent.value) > -1
        : values[dependent.field] === dependent.value))
      ) {
        return true;
      } else {
        return false;
      }
    }

    if (localFields[key]) {
      if (shouldValidate()) {
        debug('Applying validation on field %s with %s', key, value);
        return _.reduce(fields[key].validate, (err, validator) =>
          err || applyValidator(validator, value, key)
        , null);
      } else {
        values[key] = emptyValue;
        debug('Skipping validation for field %s', key);
      }
    }
  };
}

validator.validators = validators;

module.exports = validator;
