const SamsungTv = require('./lib/SamsungTv')

const DEBUG = true

console.debug = (...args) => {
  if (DEBUG) {
    console.log.apply(this, args)
  }
}

const deviceConfig = {
  ip: '192.168.178.50',
  appId: '721b6fce-4ee6-48ba-8045-955a539edadb',
  userId: '654321',
}

const tv = new SamsungTv(deviceConfig)

// register listener on established connection
tv.onConnected(() => {
  tv.sendKey('KEY_VOLUP')
})

// Request PIN
//*/
tv.init()
  .then(() => tv.requestPin())
//*/

// Confirm PIN and turn off TV
//*/
tv.init()
  .then(() => tv.confirmPin('9603'))
  .then(() => tv.connect())
  .then(() => tv.sendKey('KEY_MUTE'))
//*/
