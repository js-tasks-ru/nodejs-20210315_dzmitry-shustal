const url = require('url');
const http = require('http');
const path = require('path');
const fs = require('fs');

const server = new http.Server();

const sendFile = (res, filepath) => {
  const readStream = fs.createReadStream(filepath);

  readStream.on('open', () => {
    readStream.pipe(res);
  });

  readStream.on('error', (err) => {
    res.statusCode = 500;
    res.end(err);
  });
};

server.on('request', (req, res) => {
  const pathname = url.parse(req.url).pathname.slice(1);
  const filepath = path.join(__dirname, 'files', pathname);

  switch (req.method) {
    case 'GET': {
      if (pathname.includes('/')) {
        res.statusCode = 400;
        res.end('Subfolders are not supported');
        return;
      }

      fs.access(filepath, fs.constants.F_OK, (err) => {
        if (err) {
          res.statusCode = 404;
          res.end('File not found');
          return;
        }

        sendFile(res, filepath);
      });

      break;
    }

    default: {
      res.statusCode = 501;
      res.end('Not implemented');
    }
  }
});

module.exports = server;
