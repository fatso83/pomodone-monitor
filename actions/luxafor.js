const Luxafor = require("luxafor-api");
const { STARTED, STOPPED } = require("../constants");
const debug = require("debug")("luxafor");

let opts = {
  defaults: {
    wave: {
      type: 2,
      speed: 90,
      repeat: 5
    }
  }
};
//const device = new Luxafor(opts); // fails due to poor error handling
const device = new Luxafor();

const colors = {
  red: "#F00",
  green: "#0F0",
  blue: "#00F",
  cyan: "#0FF",
  magenta: "#F0F",
  yellow: "#FF0",
  white: "#FFF"
};

module.exports = function(state, event, feed) {
  if (state === STARTED) {
    debug("Setting new color");
    device.setColor(colors.magenta);
  } else if (state === STOPPED) {
    device.setColor(colors.red);
    setTimeout(function() {
      device.off();
    }, 2000);
  }
};
