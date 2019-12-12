const fetch = require('node-fetch')
const WebSocket = require('ws')
const Encryption = require('../Pairing/Encryption/')
const SamsungTvEvents = require('../SamsungTvEvents')
const Messages = require('./Messages')

const buildEmitMessage = (name, payload) => {
  console.debug(`buildEmitMessage: ${name}, payload: ${JSON.stringify(payload)}`)
  return '5::/com.samsung.companion:' + JSON.stringify({
    name: name,
    args: [
      payload
    ],
  })
}

const messages = new Messages()

messages.on('1::', message => {
  const { socket, identity, data } = message
  console.debug('SOCKET MESSAGE:  1::/com.samsung.companion')

  socket.send('1::/com.samsung.companion')
  
  socket.send(buildEmitMessage(
    'registerPush',
    Encryption.encryptData(identity.aesKey, identity.sessionId, {
      eventType: 'EMP',
      plugin: 'SecondTV'
    })
  ))

  socket.send(buildEmitMessage(
    'registerPush',
    Encryption.encryptData(identity.aesKey, identity.sessionId, {
      eventType: 'EMP',
      plugin: 'RemoteControl'
    })
  ))

  socket.send(buildEmitMessage(
    'callCommon',
    Encryption.encryptData(identity.aesKey, identity.sessionId, {
      method: 'POST',
      body: {
        plugin: 'NNavi',
        api: 'GetDUID',
        version: '1.000'
      }
    })
  ))
})

// keep-alive
messages.on('2::', message => {
  const { socket, data } = message
  console.debug('keep-alive: ' + data)

  socket.send('2::')
})

messages.on(data => data.startsWith('5::/com.samsung.companion:'), message => {
  const { socket, identity, data } = message
  console.debug('SOCKET MESSAGE:  5::/com.samsung.companion:')
  
  const event = JSON.parse(data.slice('5::/com.samsung.companion:'.length))
  console.debug('Handle Event: ' + event.name)
  if (event.name !== 'receiveCommon') {
    return
  }

  try {
    console.debug('receiveCommon: ' + event.args);
    const decrypted = JSON.parse(Encryption.decryptData(identity.aesKey, event.args))
    console.debug('decrypted: ', decrypted)
    if (decrypted.plugin === 'NNavi' && decrypted.api === 'GetDUID') {
      console.info(`GetDUID: ${decrypted.result}: ${decrypted.api}`)

      return {
        event: SamsungTvEvents.DUID,
        value: decrypted.result,
      }
    }
  } catch (error) {
    console.error('handleEvent : unable to decrypt data', error)
    // todo: probably pairing failed, request pairing here
    throw Error('Unable to handleEvent')
  }
})

const openSocket = (config, identity, eventEmitter) => {
  return fetch(`http://${config.ip}:8000/common/1.0.0/service/startService?appID=com.samsung.companion`)
    .then(() => handshake(config))
    .then(mask => {
      console.info('Opening new websocket')
      const socket = new WebSocket(`ws://${config.ip}:8000/socket.io/1/websocket/${mask}`)

      if (!socket) {
        console.error('unable to connect to device.')
        throw Error('unable')
      }

      socket.on('open', () => {
        eventEmitter.emit(SamsungTvEvents.CONNECTING)
      })

      socket.on('message', (data) => {
        onMessageEmitter(socket, identity, data, eventEmitter)
      })

      socket.on('close', () => {
        eventEmitter.emit(SamsungTvEvents.DISCONNECTED)
      })

      socket.on('error', (err) => {
        console.error('An error has occurred with the socket connection', err)
      })

      return socket
    })
    .catch(err => {
      console.error('Error while creating socket', err)
    });
}

const handshake = (config) => {
  return fetch(`http://${config.ip}:8000/socket.io/1`)
    .then(res => res.text())
    .then(body => {
      const handshake = body.split(':')
      console.debug('Handshake: ' + handshake[0])
      return handshake[0]
    })
}

const onMessageEmitter = (socket, identity, data, eventEmitter) => {
  const message = {
    socket,
    identity,
    data
  }

  const shouldEmitEvent = resolved => {
    return typeof resolved === 'object'
      && resolved.hasOwnProperty('event')
  }

  messages.handle(message)
    .then(resolved => {
      if (shouldEmitEvent(resolved)) {
        eventEmitter.emit(resolved.event, resolved.value)
      }
    })
}


class SamsungTvConnection {

  constructor(deviceConfig, identity, eventEmitter) {
    this.config = deviceConfig
    this.identity = identity
    this.eventEmitter = eventEmitter
    this.socket = null
    this.duid = null
    this.ready = false

    this._initializeEvents()
  }

  _initializeEvents() {
    this.eventEmitter.on(SamsungTvEvents.DUID, duid => {
      this.duid = duid

      if (this.isReady() && !this.ready) {
        this.ready = true
        this.eventEmitter.emit(SamsungTvEvents.CONNECTED)
      }
    })

    this.eventEmitter.on(SamsungTvEvents.DISCONNECTED, () => {
      this.ready = false
      this.socket = null
    })
  }

  connect() {
    return openSocket(this.config, this.identity, this.eventEmitter)
      .then(socket => {
        console.info('Connection established')
        this.socket = socket
        return new Promise(resolve => {
          this.eventEmitter.once(SamsungTvEvents.CONNECTED, () => {
            resolve()
          })
        })
      })
  }

  sendKey(keyCode) {
    if (!this.isReady) {
      throw Error('Connection not established')
    }

    this.socket.send(buildEmitMessage(
      'callCommon',
      Encryption.encryptData(this.identity.aesKey, this.identity.sessionId, {
        method: 'POST',
        body: {
          plugin: 'RemoteControl',
          version: '1.000',
          api: 'SendRemoteKey',
          param1: this.duid,
          param2: 'Click',
          param3: keyCode,
          param4: 'false'
        }
      })));
  }

  isReady() {
    return this.socket != null && this.duid != null
  }
}

module.exports = SamsungTvConnection
