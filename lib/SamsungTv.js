const fetch = require('node-fetch')
const EventEmitter = require('events')
const SamsungTvPairing = require('./Pairing/SamsungTvPairing')
const SamsungTvConnection = require('./Connection/SamsungTvConnection')
const SamsungTvEvents = require('./SamsungTvEvents')

class SamsungTv {

  constructor(deviceConfig) {
    this.config = deviceConfig
    this.device = null
    this.pairing = null
    this.identity = null
    this.connection = null
    this.eventEmitter = new EventEmitter()
  }

  init() {
    console.info('Initializing device configuration')
    return this.fetchDeviceInfo()
      .then(device => {
        console.info('Initialization successful', device)
        this.device = device
        this.pairing = new SamsungTvPairing(this.config, this.device, this.eventEmitter)
        return device
      })
  }

  fetchDeviceInfo() {
    console.debug('Fetching device info')
    return fetch(`http://${this.config.ip}:8001/ms/1.0/`)
      .then(resp => {
        return resp.json()
      })
      .then(device => {
        console.debug('Received device info')
        const deviceInfo = {
          id: device.DeviceID,
          name: device.DeviceName,
        }
        console.debug('Device info: ', deviceInfo)
        return deviceInfo
      })
  }

  requestPin() {
    return this.pairing.requestPin()
      .then(() => {
        console.debug('PIN showing at TV')
      })
  }

  confirmPin(pin) {
    return this.pairing.confirmPin(pin)
      .then(identity => {
        console.info('PIN confirmation succeeded. Identity: ', identity)

        this.identity = identity
        return this.pairing.hidePinConfirmation().then(() => {
          return identity
        })
      })
  }

  connect() {
    this._assertPaired()

    this.connection = new SamsungTvConnection(this.config, this.identity, this.eventEmitter)
    return this.connection.connect()
      .then(socket => {
        return this.connection
      })
  }

  sendKey(keyCode) {
    this._assertPaired()
    this._assertConnected()

    this.connection.sendKey(keyCode)
  }

  onConnected(listener) {
    this.eventEmitter.on(SamsungTvEvents.CONNECTED, listener)
  }

  _assertPaired() {
    if (!this.pairing.isPaired()) {
      console.error('Pairing is required before connecting to the device.')
      throw Error('Pairing required')
    }
  }

  _assertConnected() {
    if (this.connection === null) {
      console.error('Connection not established')
      throw Error('Connection not established')
    }

    if (!this.connection.isReady()) {
      console.error('Connection is established but not yet ready')
      throw Error('Connection not yet ready')
    }
  }
}

module.exports = SamsungTv