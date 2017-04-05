const ChromecastAPI = require('chromecast-api');

const { ipcMain } = require('electron');

class Cast {
  constructor () {
    this._devices = {};
    this._selectedDevice = undefined;

    this._scan();

    // And scan every 30 seconds
    setInterval(this._scan.bind(this), 15 * 1000);

    ipcMain.on('select-device', (event, device) => {
      this._selectedDevice = device;
    });
  }

  _scan () {
    this._browser = new ChromecastAPI.Browser();
    this._devices = {};

    var handle = setTimeout(() => {
      console.log("Ten seconds has passed")
      this._window.webContents.send('update-devices', []);
    }, 10 * 1000);

    this._browser.on('deviceOn', device => {
      // Clear the timeout
      clearTimeout(handle);

      // Add the device to the list
      this._devices[device.config.name] = device;

      // If there is no selected device, select this one
      if (!this._selectedDevice) {
        this._selectedDevice = device.config.name;
      }

      // Notify the window that we have new devices
      this._window.webContents.send('update-devices', Object.keys(this._devices).map(d => {
        return {
          name: d,
          selected: this._selectedDevice == d,
        };
      }));
    });

  }

  setWindow (window) {
    this._window = window;
  }

  play (url) {
    return new Promise((resolve, reject) => {
      if (this._devices[this._selectedDevice]) {
        this._devices[this._selectedDevice].play(url, 0, () => {
          resolve();
        });
      } else {
        reject('There is no currently selected device to play the URL with');
      }
    });
  }
}

module.exports = { Cast }
