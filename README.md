# Samsung SmartTv Remote for models 2014+

This project is a proof of concept of remote control Samsung TV models 2014+ which require encrypted communication with the internal web service of the TV.

## Demo

There is a demo which can be found in the `./example/` directory.
To start the demo, please use the following commands:

````
yarn install
yarn start 
````

This will start a server at http://localhost:3000.
After the server is started, you will see some demo UI to connect with your TV:

![Configuration](doc/configuration.png?raw=true "Configuration")
![Confirm](doc/confirm.png?raw=true "Confirm the device")
![Pairing](doc/configuration.png?raw=true "Pairing with the device")
![Connected](doc/configuration.png?raw=true "Send keys to the device")

## Getting Started

Here you will find how to use the API.

### Configuration

The following configuraiton details are required:

```
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
```
const SamsungTv = require('./lib/SamsungTv')

const deviceConfig = {
  // ...
}

const tv = new SamsungTv(deviceConfig)
tv.init()
```

Then request the PIN:

```
tv.requestPin()
```
The PIN should appear at your TV.

Confirm the PIN and establish connection:

```
tv.confirmPin('9603')
  .then(() => tv.connect())
```

After established connection, use SamsungTv#sendKey() to send keys:

```
tv.sendKey('KEY_MUTE')
```

## Examples

Here you can find examples how to use the library:

### Example to request PIN

```
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

// Request PIN
tv.init()
  .then(() => tv.requestPin())
```

### Example to connect

```
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

tv.init()
  .then(() => tv.confirmPin('9603'))
  .then(() => tv.connect())
  .then(() => tv.sendKey('KEY_MUTE'))
```