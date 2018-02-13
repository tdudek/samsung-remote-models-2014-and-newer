const hideAll = () => {
  const allCards = document.querySelectorAll('.card-view')
  allCards.forEach(card => {
    card.style.display = 'none'
  })
}

const hide = (id) => {
  const element = document.getElementById(id)
  element.style.display = 'none'
}

const show = (id) => {
  const element = document.getElementById(id)
  element.style.display = 'block'
  return element
}

const showCard = (cardId) => {
  hideAll()
  show(cardId)
}

const notify = (notification) => {
  const snackbar = document.getElementById('notification-snackbar')
  snackbar.MaterialSnackbar.showSnackbar({
    message: notification
  })
}

class ConfigView {

  constructor(store) {
    this.store = store
    this.ipInput = document.getElementById('config-ip-input')
    this.confirmButton = document.getElementById('config-confirm-button')
    this.confirmButton.addEventListener('click', this.confirm.bind(this))
  }

  confirm(event) {
    event.stopImmediatePropagation()

    this.store.ip = this.ipInput.value

    show('config-progress-bar')

    fetch('/api/ping', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        ip: this.store.ip
      })
    })
      .then((response) => response.json())
      .then(device => {
        this.store.device = device

        new ConfirmDeviceView(this.store).show()
      })
      .catch(err => {
        notify('Failed to ping: ' + err)
      })
      .then(() => hide('config-progress-bar'))
  }

  show() {
    hideAll()
    hide('config-progress-bar')
    showCard('config-view')
  }
}

class ConfirmDeviceView {
  constructor(store) {
    this.store = store

    const deviceName = document.getElementById('device-name')
    deviceName.textContent = store.device.name

    this.confirmButton = document.getElementById('confirm-device-button')
    this.confirmButton.addEventListener('click', this.confirm.bind(this))
  }

  confirm(event) {
    event.stopImmediatePropagation()

    show('confirm-device-progress-bar')

    fetch('/api/connect', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
    })
      .then(response => response.json())
      .then(response => {
        new PinView(this.store).show()
      })
      .catch(err => {
        notify('Failed to connect: ' + err)
      })
  }

  show() {
    hideAll()
    hide('confirm-device-progress-bar')
    showCard('confirm-device-view')
  }
}

class PinView {
  constructor(store) {
    this.store = store
    this.pinInput = document.getElementById('pin-input')
    this.confirmButton = document.getElementById('pin-button')
    this.confirmButton.addEventListener('click', this.confirm.bind(this))
  }

  confirm(event) {
    event.stopImmediatePropagation()

    const pin = this.pinInput.value

    show('pin-progress-bar')
    notify('Wait for pairing...')

    fetch('/api/pair', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        pin
      })
    })
      .then((response) => response.json())
      .then(() => {
        new SendKeyView(this.store).show()
      })
      .catch(err => {
        notify('Failed to pair: ' + err)
      })
      .then(() => hide('pin-progress-bar'))
  }

  show() {
    hideAll()
    hide('pin-progress-bar')
    showCard('pin-view')
  }
}

class SendKeyView {
  constructor(store) {
    this.keyInput = document.getElementById('key-input')
    this.confirmButton = document.getElementById('send-key-button')
    this.confirmButton.addEventListener('click', this.confirm.bind(this))
    document.querySelector('[data-send-key-device-name]').textContent = store.device.name
  }

  confirm(event) {
    event.stopImmediatePropagation()

    const keyCode = this.keyInput.value

    show('send-key-progress-bar')

    fetch('/api/key', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        keyCode
      })
    })
      .then((response) => response.json())
      .catch(err => {
        notify('Failed to pair: ' + err)
      })
      .then(() => hide('send-key-progress-bar'))
  }

  show() {
    hideAll()
    hide('send-key-progress-bar')
    showCard('send-key-view')
  }
}

const store = {}
new ConfigView(store).show()