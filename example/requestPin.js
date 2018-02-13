const SamsungTv = require('samsung-remote')

// turn on debug logs
const DEBUG = true
console.debug = (...args) => {
  if (DEBUG) {
    console.log.apply(this, args)
  }
}

// create configuration
const deviceConfig = {
  ip: '192.168.178.50',
  appId: '721b6fce-4ee6-48ba-8045-955a539edadb',
  userId: '654321',
}

const tv = new SamsungTv(deviceConfig)

// Request PIN
tv.init()
  .then(() => tv.requestPin())