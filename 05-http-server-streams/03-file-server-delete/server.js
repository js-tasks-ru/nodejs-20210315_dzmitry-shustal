const url = require('url');
const http = require('http');
const path = require('path');
const fs = require('fs');
const fsPromises = require('fs/promises');

const server = new http.Server();

server.on('request', async (req, res) => {
  const pathname = url.parse(req.url).pathname.slice(1);
  const filepath = path.join(__dirname, 'files', pathname);

  switch (req.method) {
    case 'DELETE': {
      if (pathname.includes('/')) {
        res.statusCode = 400;
        res.end('Subfolders are not supported');
        return;
      }

      try {
        await fsPromises.access(filepath, fs.constants.F_OK);
        await fsPromises.unlink(filepath);
        res.statusCode = 200;
        res.end('Success');
        return;
      } catch (err) {
        if (err.code === 'ENOENT') {
          res.statusCode = 404;
          res.end('File not found');
          return;
        }

        res.statusCode = 500;
        res.end('Something went wrong');
        return;
      }

      break;
    }

    default: {
      res.statusCode = 501;
      res.end('Not implemented');
    }
  }
});

module.exports = server;
