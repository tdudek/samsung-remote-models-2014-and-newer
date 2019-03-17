# Samsung TV Remote for models 2014+

This project is a proof of concept to remote control Samsung TV models 2014+ which require encrypted communication with the internal web service of the TV.

Credits go to https://github.com/Ape/samsungctl/issues/22. 

## Models working
Until now I could test the connection with my own TV. If you have any new insights with other models, please share your results, so I can update the following list. 

* UE48H6270  (confirmed by [paolog89](../../issues/1))
* UE48H6400 (confirmed by [kkapitan](../../issues/4))
* UE48J6300  (confirmed by [luca-angemi](../../issues/7))
* UE48JS9000 (confirmed by [Iniaki](../../issues/12))
* UE50HU6900 (confirmed by [Holland1](../../issues/2))
* UE50JU6800 (confirmed by [Jeroen-R](../../issues/9))
* UE55H6400 (confirmed by [axel3rd](../../issues/14))
* UE55HU7500 (confirmed by [riemers](../../issues/3))
* UE55JS8500 (confirmed by [twistedpixel](../../issues/1))
* UE55JU6800 (confirmed by [fquinto](../../issues/25))
* UE55JU7505 (confirmed by [holmie](../../issues/13))
* UE55JU7590
* UN40JU6000 (confirmed by [vsnine](../../issues/6))
* UN60JS7000 (confirmed by [nspinelli](../../issues/5))

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
