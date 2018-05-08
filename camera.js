// Any copyright is dedicated to the Public Domain.
// http://creativecommons.org/publicdomain/zero/1.0/

/*********************************************
Create a server that responds to every request by taking a picture and piping it directly to the browser.
*********************************************/

'use strict';
const express = require('express');
const app = express();
const server = require('http').Server(app);
const os = require('os');
var http = require("http");
const path = require('path');
const port = 8888;
var tessel = require('tessel');
var ambientlib = require('ambient-attx4');

var ambient = ambientlib.use(tessel.port.A);

const av = require('tessel-av');
const camera = new av.Camera();

var servolib = require('servo-pca9685');

var servo = servolib.use(tessel.port.B);
var servo1 = 1; // We have a servo plugged in at position 1



let servoReady = false;


let trigger = 0;
const spinServo = () => {
  if (!servoReady) return;
  if (trigger === 0) {
    trigger+=1
  var position = 0
  // const startPos = 0;
  // const endPos = 0.5;
  // //  Set servo #1 to position pos.
  // servo.move(servo1, endPos);
  // setTimeout(() => servo.move(servo1, startPos), 500);
    server.listen(port, function () {
      console.log(`http://${os.hostname()}.local:${port}`);
    });
    app.use(express.static(path.join(__dirname, '/public')));

    app.get('/stream', (request, response) => {
      response.redirect(camera.url);
    });

  setInterval(function () {
    console.log('Position (in range 0-1):', position);
    //  Set servo #1 to position pos.
    servo.move(servo1, position);

    // Increment by 10% (~18 deg for a normal servo)
    position += 0.1;
    if (position > 1) {
      position = 0; // Reset servo position
    }
  }, 500)
}
};

// const takeaPicture = () => {
//   http
//     .createServer((request, response) => {
//       response.writeHead(200, { "Content-Type": "image/jpg" });

//       camera.capture().pipe(response);
//     })
//     .listen(port, () => console.log(`http://${os.hostname()}.local:${port}`));
// }

ambient.on('ready', function() {
  // Get points of light and sound data.
  setInterval(function() {
    ambient.getLightLevel(function(err, lightdata) {
      if (err) throw err;
      ambient.getSoundLevel(function(err2, sounddata) {
        if (err2) throw err2;
        if (lightdata > 0.3) {
          spinServo();
          console.log("it's too bright!!!!!!");
          // takeaPicture()
        } else if (sounddata > 0.4) {
          console.log('Shhhhhhh');
        }
        // console.log("Light level:", lightdata.toFixed(8), " ", "Sound Level:", sounddata.toFixed(8));
      });
    });
  }, 500); // The readings will happen every .5 seconds
});

ambient.on('error', function(err) {
  console.log(err);
});

servo.on('ready', function() {

  //  Set the minimum and maximum duty cycle for servo 1.
  //  If the servo doesn't move to its full extent or stalls out
  //  and gets hot, try tuning these values (0.05 and 0.12).
  //  Moving them towards each other = less movement range
  //  Moving them apart = more range, more likely to stall and burn out
  servo.configure(servo1, 0.05, 0.12, function() {
    servoReady = true;
  });
});

