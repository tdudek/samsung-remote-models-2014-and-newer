const Hapi = require('hapi')
const Path = require('path')
const Inert = require('inert')
const SamsungTv = require('samsung-remote')

const DEBUG = true

console.debug = (...args) => {
  if (DEBUG) {
    console.log.apply(this, args)
  }
}

const deviceConfig = {
  ip: null,
  appId: '721b6fce-4ee6-48ba-8045-955a539edadb',
  userId: '654321',
}

const server = new Hapi.Server({
  port: 3000,
  host: 'localhost',
  routes: {
    files: {
      relativeTo: Path.join(__dirname, 'public')
    }
  }
})

let samsungTv

server.route({
  method: 'POST',
  path: '/api/ping',
  handler: (request, h) => {
    deviceConfig.ip = request.payload.ip
    samsungTv = new SamsungTv(deviceConfig)
    return samsungTv.init()
  }
})

server.route({
  method: 'POST',
  path: '/api/connect',
  handler: (request, h) => {
    return samsungTv.requestPin()
      .then(() => {
        return {}
      })
  }
})

server.route({
  method: 'POST',
  path: '/api/pair',
  handler: (request, h) => {
    const pin = request.payload.pin
    return samsungTv.confirmPin(pin)
      .then(_identity => {
        return samsungTv.connect()
          .then(() => _identity)
      })
  }
})

server.route({
  method: 'POST',
  path: '/api/key',
  handler: (request, h) => {
    const keyCode = request.payload.keyCode
    samsungTv.sendKey(keyCode)
    return {}
  }
})

server.route({
  method: 'GET',
  path: '/',
  handler: (request, h) => {
    return h.file('index.html')
  }
})

server.route({
  method: 'GET',
  path: '/app.js',
  handler: (request, h) => {
    return h.file('app.js')
  }
})

const provision = async () => {
  try {
    await server.register(Inert)
    await server.start()
  }
  catch (err) {
    console.log(err);
    process.exit(1);
  }

  console.log('Server running at:', server.info.uri);
}

provision()