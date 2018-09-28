#!/usr/bin/env node

"use strict";
/**
 * Program to launch actions when Pomodone starts and stops tasks
 *
 * How:
 * - Pomodone desktop app syncs issues to the cloud
 * - When starting/stopping an issue an event is sent to Zapier from the Pomodone cloud service
 * - The Zapier service then creates a new entry in the RSS feed(s)
 * - This program listens to these events and launches new actions
 *
 * Example format: https://zapier.com/engine/rss/172084/pomodoro-v1-test1;
 */
const debug = require("debug")("main");
const assert = require("assert");
const { parseString } = require("xml2js");
const fs = require("fs");
const request = require("request");
const actions = require("./actions");
const _ = require("lodash");
const constants = require("./constants");
const checkInterval = 5;

const rss = process.argv[2];

if (!rss) {
  console.error(
    "Please provide a Zapier RSS feed to listen to! Example: https://zapier.com/engine/rss/172084/pomodoro-v1-test1"
  );
  process.exit(1);
}

/**
 * @param event
 * @param event.type
 *
 * The event might have several type-specific props as well!
 */
function publish(event) {
  _.forEach(actions, handler => handler(event));
}

async function main() {
  let currentState = constants.STOPPED;
  let ongoingTask;

  function stateChange(newState, event, feed) {
    debug("State changed. New state:", newState, "Old state", currentState);
    currentState = newState;
    publish({ type: "statechange", newState });
  }

  async function mainLoop() {
    let soonTimer;
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

    if (ongoing && currentState === constants.STOPPED) {
      // when the action_date is set to the epoch, it's basically unset
      const finishedBy =
        (action_date_millis || new Date().getTime()) +
        duration_minutes * 60 * 1000;
      ongoingTask = { ...lastAdded, finishedBy };

      soonTimer = setTimeout(
        () => publish({ type: constants.SOON_FINISHED, finishedBy }),
        (duration_minutes - 2) * 60 * 1000
      );
      stateChange(constants.STARTED, lastAdded, feed);
    } else if (!ongoing && currentState === constants.STARTED) {
      ongoingTask = null;
      clearTimeout(soonTimer);

      stateChange(constants.STOPPED, lastAdded, feed);
    }

    if (ongoing) {
      debug(
        `Task ${task_id} seems to be ongoing. It has no start time so we can only know it should be finished by ` +
          new Date(ongoingTask.finishedBy)
      );
    } else {
      debug("No current tasks", new Date());
    }

    setTimeout(mainLoop, 5 * 1000);
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
        if (err) {
          console.warn(err.message);
          return;
        }

        if (!result.rss) {
          console.warn("Got no RSS!");
          return;
        }

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
