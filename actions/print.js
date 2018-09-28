const debug = require("debug")("print");
const { STARTED, STOPPED } = require("../constants");

/**
 * @param {Object} ev
 * @param {string} ev.trigger_type 'started', 'stopped', ...
 * @param {Object} feed the entire feed
 */
module.exports = function(...args) {
  debug(...args);
};
