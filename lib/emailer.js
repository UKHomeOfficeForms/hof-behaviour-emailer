'use strict';

module.exports = config => {
  return superclass => class Emailer extends superclass {

    saveValues(req, res, callback) {
      super.saveValues(req, res, callback);
    }

  };
};
