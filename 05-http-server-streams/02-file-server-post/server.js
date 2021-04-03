const url = require('url');
const http = require('http');
const path = require('path');
const fs = require('fs');
const fsPromises = require('fs/promises');
const stream = require('stream');
const util = require('util');
const LimitSizeStream = require('./LimitSizeStream');

const pipeline = util.promisify(stream.pipeline);
const server = new http.Server();

server.on('request', async (req, res) => {
  const pathname = url.parse(req.url).pathname.slice(1);
  const filepath = path.join(__dirname, 'files', pathname);

  switch (req.method) {
    case 'POST': {
      await fsPromises.mkdir(path.join(__dirname, 'files'), {recursive: true});

      if (pathname.includes('/')) {
        res.statusCode = 400;
        res.end('Subfolders are not supported');
        return;
      }

      const writeStream = fs.createWriteStream(filepath, {flags: 'wx'});
      const limitedStream = new LimitSizeStream({limit: 1000000});

      // OPTION 1 - pass tests
      // writeStream.on('error', (err) => {
      //   res.statusCode = 409;
      //   res.end('The file already exists');
      //   return;
      // });
      //
      // limitedStream.on('error', (err) => {
      //   fsPromises.unlink(filepath);
      //   res.statusCode = 413;
      //   res.end('File size limit is 1 mb');
      //   return;
      // });
      //
      // pipeline(
      //   req,
      //   limitedStream,
      //   writeStream,
      //   (err, data) => {
      //     if (!err) {
      //       res.statusCode = 201;
      //       res.end();
      //     }
      //   },
      // );


      // OPTION 2 - doesn't pass tests (при попытке создания слишком большого файла - ошибка 413)
      // what is wrong?
      try {
        await pipeline(req, limitedStream, writeStream);
        res.statusCode = 201;
        res.end();
      } catch (err) {
        if (err.code === 'LIMIT_EXCEEDED') {
          res.statusCode = 413;
          res.end('File size limit is 1 mb');
          await fsPromises.unlink(filepath);
          return;
        }

        if (err.code === 'EEXIST') {
          res.statusCode = 409;
          res.end('The file already exists');
          return;
        }

        res.statusCode = 500;
        res.end('Something went wrong');
        await fsPromises.unlink(filepath);
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
