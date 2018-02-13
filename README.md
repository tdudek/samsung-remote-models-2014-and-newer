# Samsung TV Remote for models 2014+

This project is a proof of concept to remote control Samsung TV models 2014+ which require encrypted communication with the internal web service of the TV.

Credits go to https://github.com/Ape/samsungctl/issues/22. 

## Models working
Until now I could test the connection with my own TV. If you have any new insights with other models, please share your results, so I can update the following list. 

* UE55JU7590
* UE55JS8500 (confirmed by [twistedpixel](https://github.com/tdudek/samsung-remote-models-2014-and-newer/issues/1))

## Demo

To try out the API quickly, there is a demo which can be found in the `./example/` directory.
To start the [demo](example/server.js), please use the following commands:

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

* [How to request PIN](example/requestPin.js)
* [How to connect with the TV and send a key](example/connect.js)
* [Demo UI](example/server.js)
