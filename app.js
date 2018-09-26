"use strict";
/**
 * Program to launch actions when Pomodone starts and stops tasks
 * - restricted to Wunderlist actions for now, as
 *   different task types lack a bit of the required information
 *
 * How:
 * - Pomodone desktop app syncs WunderList issues
 * - When starting/stopping an issue an event is sent to Zapier from the Pomodone cloud service
 * - The Zapier service then creates a new entry in the RSS feed(s)
 * - This program listens to these events and launches new actions
 *
 */
const debug = require("debug")("main");
const assert = require("assert");
const { parseString } = require("xml2js");
const fs = require("fs");
const request = require("request");
const commonUrl = "https://zapier.com/engine/rss/172084/pomodoro-";
const actions = require("./actions");
const rss = `${commonUrl}v1-test1`;
const _ = require("lodash");
const state = require("./constants");
const checkInterval = 5;

async function main() {
  let currentState = state.STOPPED;
  let ongoingTask;

  function stateChange(newState, event, feed) {
    debug("State changed. New state:", newState, "Old state", currentState);
    currentState = newState;
    _.forEach(actions, action => action(newState, event, feed));
  }

  async function mainLoop() {
    let timer;
    const feed = await getFeed();

    if (!feed.items.length) {
      debug(
        "No items in the feed, so nothing to do or data to compute anything from"
      );
      return;
    }

    const lastAdded = feed.items[0];
    const {
      task_id,
      trigger_type,
      duration_minutes,
      action_date_millis
    } = lastAdded;

    const ongoing = trigger_type === "started";

    if (ongoing && currentState === state.STOPPED) {
      // when the action_date is set to the epoch, it's basically unset
      const finishedBy =
        (action_date_millis || new Date().getTime()) +
        duration_minutes * 60 * 1000;
      ongoingTask = { ...lastAdded, finishedBy };

      stateChange(state.STARTED, lastAdded, feed);
    } else if (!ongoing && currentState === state.STARTED) {
      ongoingTask = null;

      stateChange(state.STOPPED, lastAdded, feed);
    }

    if (ongoing) {
      debug(
        `Task ${task_id} seems to be ongoing. It has no start time so we can only know it should be finished by ` +
          new Date(ongoingTask.finishedBy)
      );
    } else {
      debug("No current tasks");
    }

    timer = setTimeout(mainLoop, 5 * 1000);
  }

  mainLoop();
}

/**
 * @returns {Promise} a promise that resolves to
 */
function getParsedFeed(url) {
  return new Promise((resolve, reject) => {
    request(url, (err, response, body) => {
      if (err) {
        console.error(err);
        process.exit(1);
      }

      parseString(body, (err, result) => {
        const channel = result.rss.channel[0];
        const items = channel.item;
        const href = channel["atom:link"][0]["$"]["href"];
        const lastBuildDate = new Date(channel.lastBuildDate[0]);

        resolve({
          channelTitle: channel.title[0],
          href,
          lastBuildDate,
          items
        });
      });
    });
  });
}

async function getFeed() {
  const feed = await getParsedFeed(rss);
  const items = feed.items.map(transformEvent);
  return { ...feed, items };
}

function transformEvent(event) {
  // process datasource=="wunderlist"
  // process datasource="local"

  let description;
  try {
    description = JSON.parse(event.description[0]);
    const action_date = description.action_date;
    description.action_date_millis =
      action_date.length > 8 ? new Date(action_date).getTime() : 0;
  } catch (err) {
    console.warn(err.message + `[${event.description[0]}]`);
    description = {};
  }

  return {
    ...description
  };
}

main();
