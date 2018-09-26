const debug = require("debug")("print");
const { STARTED, STOPPED } = require("../constants");

function started(event, feed) {
  debug("Received started event");
  debug(event);
}
function stopped(event, feed) {
  debug("Received stopped event");
  debug(event);
}
function progress(event) {
  debug("Some progress", event);
}

/**
 * @param {Object} ev
 * @param {string} ev.trigger_type 'started', 'stopped', ...
 * @param {Object} feed the entire feed
 */
module.exports = function(state, event, feed) {
  if (state === STARTED) started(event, feed);
  else if (state === STOPPED) stopped(event, feed);
  else {
    debug("unhandled state:", state);
  }
};
