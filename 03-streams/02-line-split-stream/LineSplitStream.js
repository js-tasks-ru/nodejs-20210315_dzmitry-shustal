const stream = require('stream');
const os = require('os');

class LineSplitStream extends stream.Transform {
  #prevChunkAsString = '';

  constructor(options) {
    super(options);
  }

  _transform(chunk, encoding, callback) {
    const chunkAsString = this.#prevChunkAsString + chunk.toString();
    const chunkAsArray = chunkAsString.split(os.EOL);

    this.#prevChunkAsString = chunkAsArray.pop();
    chunkAsArray.forEach(this.push.bind(this));
    callback();
  }

  _flush(callback) {
    callback(undefined, this.#prevChunkAsString);
  }
}

module.exports = LineSplitStream;
