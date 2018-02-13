const fetch = require('node-fetch')
const Encryption = require('./Encryption/')
const SamsungTvEvents = require('../SamsungTvEvents')

const buildPairingStepUri = (config, device, step) => {
  const path = `/ws/pairing?step=${step}&app_id=${config.appId}&device_id=${device.deviceId}`
  return `http://${config.ip}:8080${path}`
}

const _step0 = (config, device) => {
  console.info('Step 0: Start pairing')
  const uri = buildPairingStepUri(config, device, 0)
  return fetch(`${uri}&type=1`, {
    mode: 'no-cors',
  }).then(response => {
    console.debug('Step 0, responseStatus', response.status)
  })
    .catch(err => {
      console.error('Step 0, failed', err)
      throw Error('Failed to confirm step 0')
    })
}

const _step1HelloServer = (config, device, pin) => {
  console.info('Step 1: Saying hello to the server')
  const serverHello = Encryption.generateServerHello(config.userId, pin)
  console.debug('Generated serverHello', serverHello)

  const uri = buildPairingStepUri(config, device, 1)
  return fetch(uri, {
    method: 'POST',
    body: JSON.stringify({
      'auth_Data': {
        'auth_type': 'SPC',
        'GeneratorServerHello': serverHello
      }
    }),
    headers: {
      'Content-Type': 'application/json'
    }
  })
    .then(res => res.json())
    .then(res => JSON.parse(res.auth_data))
    .then(authData => _verifyHelloAuthData(authData))
}

const _step2AckServer = (config, device, requestId) => {
  console.info('Step 2: Acknowledging')
  const serverAck = Encryption.generateServerAcknowledge()
  console.debug(`generatedServerAcknowledge: ${serverAck}`)

  const uri = buildPairingStepUri(config, device, 2)
  return fetch(uri, {
    method: 'POST',
    body: JSON.stringify({
      'auth_Data': {
        'auth_type': 'SPC',
        'request_id': requestId,
        'ServerAckMsg': serverAck
      }
    }),
    headers: {
      'Content-Type': 'application/json'
    }
  })
    .then(res => res.json())
    .then(res => JSON.parse(res.auth_data))
    .then(authData => _verifyAckAuthData(authData))
    .then(authData => {
      const identity = {
        sessionId: authData.session_id,
        aesKey: Encryption.getKey(),
      }

      console.debug('identity', identity)
      return identity
    })
}

_verifyHelloAuthData = (authData) => {
  console.debug('hello auth data', authData)
  if (Encryption.parseClientHello(authData.GeneratorClientHello) !== 0) {
    console.error('Invalid PIN Entered')
    throw Error('Invalid PIN entered')
  }

  console.debug('hello verified')
  return authData.request_id
}

_verifyAckAuthData = (authData) => {
  console.debug('ack auth data', authData)

  const clientAck = Encryption.parseClientAcknowledge(authData.ClientAckMsg)
  console.debug('client ack', clientAck.toString())

  if (!clientAck) {
    throw Error('failed to acknowledge client')
  }

  return authData
}

class SamsungTvPairing {
  constructor(deviceConfig, deviceInfo, eventEmitter) {
    this.device = deviceInfo
    this.config = deviceConfig
    this.eventEmitter = eventEmitter
    this.identity = null
  }

  requestPin() {
    return fetch(`http://${this.config.ip}:8080/ws/apps/CloudPINPage`,
      {
        method: 'POST',
        mode: 'no-cors',
        cache: 'default',
      })
      .then(res => res.text())
      .then((text, status) => {
        const match = /<state[^>]*>([\s\S]*?)<\/state>/.exec(text)
        if (match && match[1]) {
          return match[1].toUpperCase() !== 'STOPPED'
        }
        return true
      })
      .then(() => _step0(this.config, this.device))
      .catch(err => {
        console.error('Failed to require PIN', err)
        throw Error('Failed to require PIN')
      })
  }

  confirmPin(pin) {
    console.log('Confirming pin', pin)
    return _step1HelloServer(this.config, this.device, pin)
      .then(requestId => _step2AckServer(this.config, this.device, requestId))
      .then(identity => {
        this.identity = identity
        this.eventEmitter.emit(SamsungTvEvents.PAIRED, identity)
        return identity
      })
  }

  hidePinConfirmation() {
    return fetch(`http://${this.config.ip}:8080/ws/apps/CloudPINPage/run`, {
      method: 'DELETE'
    })
  }

  isPaired() {
    return this.identity !== null
  }

}

module.exports = SamsungTvPairing