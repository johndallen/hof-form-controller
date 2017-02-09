'use strict';

const moment = require('moment');
const _ = require('lodash');

// validator methods should return false (or falsy value) for *invalid* input
// and true (or truthy value) for *valid* input.
const dateFormat = 'YYYY-MM-DD';

module.exports = class Validators {

  static string(value) {
    return typeof value === 'string';
  }

  static regex(value, match) {
    return this.string(value) && !!value.match(match);
  }

  static required(value) {
    return value !== undefined && value !== '';
  }

  static url(value) {
    return value === '' || this.regex(value, /[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/);
  }

  static email(value) {
    return value === '' || this.regex(value, /^[a-z0-9\._%+\-]+@[a-z0-9.\-]+\.[a-z]{2,6}$/i);
  }

  static minlength(value, length) {
    length = length || 0;
    return this.string(value) && (value === '' || value.length >= length);
  }

  static maxlength(value, length) {
    return this.string(value) && (value === '' || value.length <= length);
  }

  static exactlength(value, length) {
    return this.string(value) && (value === '' || value.length === length);
  }

  static alphanum(value) {
    return this.regex(value, /^[a-zA-Z0-9]*$/);
  }

  static numeric(value) {
    return this.regex(value, /^\d*$/);
  }

  static equal(value) {
    const values = [].slice.call(arguments, 1);
    value = _.castArray(value);
    return values.length && _.every(value, item =>
      item === '' || values.indexOf(item) > -1
    );
  }

  static phonenumber(value) {
    return value === '' || this.regex(value, /^\(?\+?[\d()-]{0,15}$/);
  }

  static ukmobilephone(value) {
    return value === '' || this.regex(value, /^(07)\d{9}$/);
  }

  static date(value) {
    return value === '' || this.regex(value, /\d{4}\-\d{2}\-\d{2}/) && moment(value, dateFormat).isValid();
  }

  static 'date-year'(value) {
    return this.regex(value, /^\d{4}$/);
  }

  static 'date-month'(value) {
    return this.regex(value, /^\d{2}$/) && parseInt(value, 10) > 0 && parseInt(value, 10) < 13;
  }

  static 'date-day'(value) {
    return this.regex(value, /^\d{2}$/) && parseInt(value, 10) > 0 && parseInt(value, 10) < 32;
  }

  static before(value/*, [diff, unit][, diff, unit]*/) {
    const args = [].slice.call(arguments, 1);
    const date = moment(value, dateFormat);
    let diff;
    let unit;
    while (args.length) {
      diff = args.shift();
      unit = args.shift() || 'years';
      date = date.add(diff, unit);
    }
    return value === '' || this.date(value) && date.isBefore(moment());
  }

  static after(value, date) {
    const test = moment(value, dateFormat);
    let comparator;
    if (arguments.length === 2) {
      comparator = date;
    } else {
      comparator = moment();
      const args = [].slice.call(arguments, 1);
      let diff;
      let unit;
      while (args.length) {
        diff = args.shift();
        unit = args.shift() || 'years';
        test = test.add(diff, unit);
      }
    }
    return value === '' || this.date(value) && test.isAfter(comparator);
  }

  static postcode(value) {
    return value === '' || this.regex(value, /^(([GIR] ?0[A]{2})|((([A-Z][0-9]{1,2})|(([A-Z][A-HJ-Y][0-9]{1,2})|(([A-Z][0-9][A-Z])|([A-Z][A-HJ-Y][0-9]?[A-Z])))) ?[0-9][A-Z]{2}))$/i);
  }
};
