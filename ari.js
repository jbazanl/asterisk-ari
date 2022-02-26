"use strict";

const ari = require("ari-client");

const { ARI_BASE_URL, ARI_PASSWORD, ARI_USERNAME } = require("./constants");

const startARI = async () => {
  try {
    const client = await ari.connect(ARI_BASE_URL, ARI_USERNAME, ARI_PASSWORD);

    // Listener DeviceState
    /*
    client.on("DeviceStateChanged", (event, device_state) => {
      console.log(`· DeviceStateChanged : , device_state`);
    });*/

    // Listener ChannelHangup
    /*client.on("ChannelHangupRequest", (event, channel) => {
      console.log(`· ChannelHangupRequest : ${channel.name} - ${channel.state}`);
    });*/

    /** Listener Start Stasis */
    /*
    client.on("StasisStart", (event, incoming) => {
      console.log(`- Stasis Start for Channel ID : ${incoming.id}`);
      //console.log(Object.entries(incoming));
      console.log(`- Stasis Start for Caller: ${incoming.caller.number}`);

      // Change DeviceState
      var opts = {
        deviceName: "Stasis:hello-world",
        deviceState: "BUSY",
      };
      client.deviceStates.update(opts, err => {});

      // Send a Playback
      incoming.answer((err, channel) => {
        console.log(`· Answered Channel ID : ${incoming.id}`);
        // Device States
        client.deviceStates.list((err, devicestates) => {
          devicestates.forEach(device => {
            console.log(` - Device: ${device.name} - ${device.state}`);
          });
        });
        // Playback
        play(incoming, "sound:demo-congrats", err => {
          // Playback Completed - Send a Hangup Channel
          incoming.hangup(err => {
            console.log(`· Hangup Channel ID : ${incoming.id}`);
          });
        });
      });
    */ 
      /** List Channels */
    /*
     client.channels.list((err, channels) => {
        if (!channels.length) {
          console.log(" + No channels currently :-(");
        } else {
          console.log(" :: Current channels:");
          channels.forEach(channel => {
            console.log(` - Channel: ${channel.name}`);
          });
        }
      });
    });
    */

    /** Listener End Stasis */
    client.on("StasisEnd", (event, incoming) => {
      console.log(`Stasis End ID ${incoming.id} ... Update Device State`);
      var opts = {
        deviceName: "Stasis:hello-world",
        deviceState: "NOT_INUSE",
      };
      client.deviceStates.update(opts, err => {
        // Device States
        client.deviceStates.list((err, devicestates) => {
          devicestates.forEach(device => {
            console.log(` - Device: ${device.name} - ${device.state}`);
          });
        });
      });
    });

    /** Function for Playback a Sound */
    function play(channel, sound, callback) {
      var playback = client.Playback();
      playback.once("PlaybackFinished", function (event, instance) {
        if (callback) {
          callback(null);
        }
      });
      channel.play({ media: sound }, playback, (err, playback) => {});
    }

    client.start("hello-world");

    return client;
  } catch (err) {
    throw err;
  }
};

module.exports = { startARI };
