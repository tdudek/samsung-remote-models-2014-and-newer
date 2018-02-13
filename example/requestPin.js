const SamsungTv = require('samsung-remote')

const args = process.argv.slice(2)
if (args.length != 2) {
  console.log('Usage: node requestPin.js -ip <address of the TV device>')
  console.log('  e.g. node requestPin.js -ip 192.168.178.50')
  return
}

const ip = args[1]

// turn on debug logs
const DEBUG = true
console.debug = (...args) => {
  if (DEBUG) {
    console.log.apply(this, args)
  }
}

// create configuration
const deviceConfig = {
  ip,
  appId: '721b6fce-4ee6-48ba-8045-955a539edadb',
  userId: '654321',
}

const tv = new SamsungTv(deviceConfig)

// Request PIN
tv.init()
  .then(() => tv.requestPin())