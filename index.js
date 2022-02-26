"use strict";

const cors = require("cors");
const express = require("express");
const morgan = require("morgan");
const timeout = require('connect-timeout');
const bodyParser = require('body-parser');

const { startARI } = require("./ari");

const PORT = 7000;

const startServer = async ari => {
  const app = express();
  app.use(timeout('120s'));
  app.use(express.json());
  app.use(bodyParser());
  app.use(cors());
  app.use(morgan("common"));

  app.post("/api/dialer", (req, res) => {
      const num = req.body;
      return res.json(req.body);
  });

  app.get("/api/", (req, res) => {
    return res.json({ message: "ok" });
  });
  //http://astvoip.itelvox.com:8088/ari/channels?endpoint=PJSIP/1000151964808760@dgtk&extension=User1&context=interno-context&priority=1&callerId=1110
  // PJSIP/1000151964808760@dgtk
  /**
   * body: {
   *  "numeros": ["PJSIP/1000151964808760@dgtk", "PJSIP/1000151964808760@dgtk"]
   * }
   */
  app.post("/api/marcar", (req, res) => {
    const { numeros, caller_number } = req.body;
    console.log("numeros", numeros);
    console.log("caller_number", caller_number);
    console.log("numeros length", numeros.length);
    var hora = new Date();
    console.log(hora);

    // console.log("keys", Object.entries(ari));
    //const canales = await ari.channels.list();
    //console.log("Canales:", canales);
    // const bridges = await ariClient.bridges.list();
    // console.log("test", bridges)
    // channel.on('StasisStart', function (event, channel) {});
    // channel.on('ChannelDtmfReceived', function (event, channel) {});

    var json_data = {}
    var contador = 0

    numeros.forEach(num=>{
      const endpoint = `PJSIP/${num}@dgtk`
      const original_number = num.substring(7)
      const channel = ari.Channel();
      // MARCAR
      //channel.originate({endpoint: `PJSIP/${num}@dgtk`, extension: '7000', callerId :'51909000555', context: 'interno', priority: '1', appArgs: 'dialed'})
      //channel.originate({endpoint: `PJSIP/${num}@dgtk`, extension: `${num}`, callerId :'51909000555', context: 'interno', priority: '1', appArgs: 'dialed'})
      channel.originate({endpoint: `PJSIP/${num}@dgtk`, extension: `${num}`, callerId : `${caller_number}`, context: 'interno', priority: '1', appArgs: 'dialed'})
        .then(function (channel) {
          console.log(channel.name) 
          json_data[original_number] = {}
          json_data[original_number]['Originate'] = channel.name
          json_data[original_number]['StasisStart'] = {}
          json_data[original_number]['StasisStart']['ChannelID'] = channel.name
          json_data[original_number]['StasisStart']['CallerNumber'] = channel.caller.number
          json_data[original_number]['StasisStart']['CreationTime'] = channel.creationtime
        })
        .catch(function (err) {
        });
      /*json_data[original_number] = {}
      json_data[original_number]['Originate'] = `Marcando ${endpoint}`
      json_data[original_number]['StasisStart'] = {}
      json_data[original_number]['StasisStart']['ChannelID'] = ''
      json_data[original_number]['StasisStart']['CallerNumber'] = ''
      json_data[original_number]['StasisStart']['CreationTime'] = ''*/
    })
    
    // Listener ChannelHangup
    ari.on("ChannelHangupRequest", (event, channel) => {
        console.log(`·JBL ChannelHangupRequest : ${channel.name} - ${channel.state}`);
    });

    ari.on("StasisStart", async (event, channelInstance) => {
        console.log('JBL: Event StasisStart')
        const original_number = channelInstance.dialplan.exten
        console.log(`- index.js: Stasis Start for Channel ID : ${channelInstance.id}`);
        //console.log(Object.entries(incoming));
        console.log(`- index.js: Stasis Start for Caller: ${channelInstance.caller.number}`);
        console.log(`- index.js: Stasis Start for Exten: ${channelInstance.dialplan.exten}`);
        json_data[original_number]['StasisStart'] = {}
        json_data[original_number]['StasisStart']['ChannelID'] = channelInstance.id
        json_data[original_number]['StasisStart']['CallerNumber'] = channelInstance.caller.number
        json_data[original_number]['StasisStart']['CreationTime'] = channelInstance.creationtime
        var stasis_time = new Date()
        console.log(stasis_time);
        channelInstance.hangup(err => {
          console.log(`· Hangup Channel ID : ${channelInstance.id}`);
        });
        //json_data[original_number]['StasisStart']['Exten'] = incoming.dialplan.exten
        //console.log(json_data)
        //return res.json({ json_data }); 
        //contador++;
        //if (contador = 1)
        //   res.json({ 
        //      status:"0",
        //      msg:json_data 
        //   }); 
        //console.log(contador)
    });

    //var millisecondsToWait = numeros.length * 15000;
    var millisecondsToWait = 60000; //valor minimo
    //var millisecondsToWait = 12000; //valor minimo
    //if (numeros.length > 8) {
      //millisecondsToWait = 120000; //valor minimo
      //millisecondsToWait = numeros.length * 10000;
    //} else {
      //millisecondsToWait = 80000; //valor minimo
    //}

    console.log("Timeout: ", millisecondsToWait);
    setTimeout(function() {
      return res.json({ json_data }); 
    }, millisecondsToWait);
    
  });

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Aplicación web escuchando en el puerto ${PORT}`);
  });

};

startARI().then(ari => {
  startServer(ari);
});
