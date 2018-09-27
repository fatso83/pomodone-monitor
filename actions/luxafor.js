const assert = require("assert");
const Luxafor = require("luxafor")();
const { STARTED, STOPPED, SOON_FINISHED } = require("../constants");
const debug = require("debug")("luxafor");

debug("Luxafor module initializing");

function isRgb(color) {
  if (typeof color !== "string") return false;
  return color.match(/^\d+,\d+,\d+$/);
}

function getRgb(color) {
  return color.split(",").map(n => parseInt(n, 10));
}

function setColor(color) {
  debug("setting color called");
  Luxafor.init(function() {
    debug("init function finished successfully");
    if (isRgb(color)) {
      const [r, g, b] = getRgb(color);
      Luxafor.setColor(r, g, b, function() {
        debug(`Set rgb color to ${color}`);
      });
    } else {
      assert(typeof color === "string");
      Luxafor.setLuxaforColor(Luxafor.colors[color], function() {
        debug(`Set luxafor color to ${color}`);
      });
    }
  });
}

function blinkRgbColor(color) {
  debug("blink rgb color called");
  Luxafor.init(function() {
    debug("init function finished successfully");
    const [r, g, b] = getRgb(color);
    Luxafor.flashColor(r, g, b, function() {
      debug("Blinking set using " + color);
    });
  });
}

module.exports = function(event) {
  if (event.type === "statechange" && event.newState === STARTED) {
    debug("Setting new color");
    setColor("magenta");
  } else if (event.type === "statechange" && event.newState === STOPPED) {
    setColor("green");
    setTimeout(function() {
      debug("Turning device off");
    }, 2000);
    setColor("off");
  } else if (event.type === SOON_FINISHED) {
    debug("Soon finished");
    const yellowRgb = "255,255,0";
    blinkRgbColor(yellowRgb);
    setTimeout(function() {
      setColor("red");
    }, 2000);
  }
};
