class Messages {
  constructor() {
    this.messageTypes = []
  }

  on(matcher, handler) {
    if (typeof handler !== 'function') {
      throw Error('Message handler must be a function')
    }
    const _matcher = this._matcherPredicate(matcher)

    this.messageTypes.push({
      matcher: _matcher,
      handler
    })
  }

  handle(message) {
    const handle = this.messageTypes.find(messageHandler => messageHandler.matcher(message.data))
    if (!handle) {
      console.debug('unknown message received: ' + message.data)
      return new Promise(resolve => resolve())
    }

    const { handler } = handle

    return new Promise(resolve => {
      const resolvedMessage = handler(message)
      resolve(resolvedMessage)
    })

  }

  _matcherPredicate(matcher) {
    if (typeof matcher === 'string') {
      return (data) => data === matcher
    }

    if (typeof matcher === 'function') {
      return matcher
    }

    throw Error('Incompatible matcher type: ' + (typeof matcher))
  }
}

module.exports = Messages