'use strict';
const app = require('app');
const BrowserWindow = require('browser-window');
//const board = require('hw.js');
const five = require('johnny-five');
const midi = require('midi');

const Kefir = require('kefir');

// testing midi
// should eventually use midi to create a writable stream
// Set up a new output
var output = new midi.output();

// Create a virtual output port
output.openVirtualPort('');

// Send a MIDI message.
setInterval(function () {
  output.sendMessage([144, 36, 127]);
  console.log('playing note');
  setInterval(function () {
    output.sendMessage([128, 36, 0]);
  }, 200);
}, 400);

// report crashes to the Electron project
require('crash-reporter').start();

// adds debug features like hotkeys for triggering dev tools and reload
require('electron-debug')();

function createMainWindow () {
  var Screen = require('screen');

  var size = Screen.getPrimaryDisplay().size;

  var width = size.width;
  var height = size.height;

  const win = new BrowserWindow({
    height: height,
    width: width,
    fullscreen: true,
    resizable: false
  });

  win.loadUrl(`file://${__dirname}/index.html`);
  win.on('closed', onClosed);

  win.webContents.on('did-finish-load', function () {

    new five.Board().on('ready', function() {
      // Assuming a sensor is attached to pin "A5"
      this.pinMode(5, five.Pin.ANALOG);

      this.analogRead(5, function(voltage) {
        return win.webContents.send('update', voltage);
      });
    });

  });

  return win;
}

function onClosed() {
  // deref the window
  // for multiple windows store them in an array
  mainWindow = null;
}

// prevent window being GC'd
let mainWindow;

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate-with-no-open-windows', function () {
  if (!mainWindow) {
    mainWindow = createMainWindow();
  }
});

app.on('ready', function () {
  mainWindow = createMainWindow();
});
