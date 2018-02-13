# Samsung TV Remote for models 2014+

This project is a proof of concept to remote control Samsung TV models 2014+ which require encrypted communication with the internal web service of the TV.

## Models working
Until now I could test the connection with my own TV. If you have any new insights with other models, please share your results, so I can update the following list. 

* UE55JU7590

## Demo

To try out the API quickly, there is a demo which can be found in the `./example/` directory.
To start the demo, please use the following commands:

```bash
$ yarn install
$ yarn start 
```

This will start a server at http://localhost:3000.
After the server is started, open the URL in your browser. You will see a demo UI, which allows you to easily connect to your TV.

<img src="doc/configuration.png?raw=true" width="250" /> <img src="doc/confirm.png?raw=true" width="250" /> <img src="doc/pairing.png?raw=true" width="250" /> <img src="doc/connected.png?raw=true" width="250" />

## Getting Started

To use the API within your project, you will need to follow these steps:

### Configuration

The following configuraiton details are required:

```javascript
const deviceConfig = {
  // address of the TV device
  ip: '192.168.178.50',

  // your client identification  
  appId: '721b6fce-4ee6-48ba-8045-955a539edadb',

  // user id for the connection with the TV
  userId: '654321',
}
```

### Usage

Create and initialize an instance of the SamsungTv library:
```javascript
const SamsungTv = require('./lib/SamsungTv')

const deviceConfig = {
  // ...
}

const tv = new SamsungTv(deviceConfig)
tv.init()
```

Then request the PIN:
```javascript
tv.requestPin()
```
The PIN should appear at your TV.


Confirm the PIN and establish connection:
```javascript
tv.confirmPin('9603')
  .then(() => tv.connect())
```

After the connection is established, use SamsungTv#sendKey() to send keys:
```javascript
tv.sendKey('KEY_MUTE')
```

## Examples

Here you can find examples how to use the library:

### Example to request PIN

```javascript
const SamsungTv = require('./lib/SamsungTv')

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
```

### Example to connect

```javascript
const SamsungTv = require('./lib/SamsungTv')

// turn on debug logs
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

// (optional) register listener on established connection
tv.onConnected(() => {
  tv.sendKey('KEY_VOLUP')
})

// confirm PIN and send 'mute' key
tv.init()
  .then(() => tv.confirmPin('9603'))
  .then(() => tv.connect())
  .then(() => tv.sendKey('KEY_MUTE'))
```
