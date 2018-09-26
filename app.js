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
const debug = require("debug");
const assert = require("assert");
const { parseString } = require("xml2js");
const fs = require("fs");
const request = require("request");
const commonUrl = "https://zapier.com/engine/rss/172084/pomodoro-";
const rssStart = `${commonUrl}started-v1-test3`;
const rssStopped = `${commonUrl}stopped-v1-test-4`;

async function main() {
  let startUpEntries;
  let stoppedEntries;
  let timer;

  async function mainLoop() {
    startUpEntries = await getStartEntries();
    stoppedEntries = await getStoppedEntries();

    //console.log(pretty(startUpEntries));
    //console.log(pretty(stoppedEntries));

    // find which tasks have been stopped by id
    // action_date is unreliable, sometimes set, sometimes not
    // we should be able to find started for every stopped, unless ongoing

    // fire event if status changes
    // if(statusChange) => fireActions( stopped || started)

    timer = setTimeout(mainLoop, 60 * 1000);
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

async function getStartEntries() {
  const feed = await getParsedFeed(rssStart);
  const items = feed.items.map(transformEvent);
  return { ...feed, items };
}
async function getStoppedEntries() {
  const feed = await getParsedFeed(rssStopped);
  const items = feed.items.map(transformEvent);
  return { ...feed, items };
}

function transformEvent(event) {
  // process datasource=="wunderlist"
  // process datasource="local"

  let description;
  try {
    description = JSON.parse(event.description[0]);
    description.parsed_action_date = new Date(description.action_date);
  } catch (err) {
    console.warn(err.message + `[${event.description[0]}]`);
    description = {};
  }

  return {
    ...description
  };
}

function pretty(obj) {
  return JSON.stringify(obj, null, 4);
}

main();
