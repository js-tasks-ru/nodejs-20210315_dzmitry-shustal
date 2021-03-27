const stream = require('stream');
const LimitExceededError = require('./LimitExceededError');

class LimitSizeStream extends stream.Transform {
  #maxStreamSize = 0;
  #currentStreamSize = 0;

  constructor(options) {
    super(options);

    this.#maxStreamSize = options.limit;
  }

  _transform(chunk, encoding, callback) {
    this.#currentStreamSize += chunk.length;

    if (this.#maxStreamSize < this.#currentStreamSize) {
      callback(new LimitExceededError());
    } else {
      callback(undefined, chunk);
    }
  }
}

module.exports = LimitSizeStream;
