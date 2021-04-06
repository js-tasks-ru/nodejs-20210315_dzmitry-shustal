const path = require('path');
const Koa = require('koa');
const MessageObserver = require('./MessageObserver');
const app = new Koa();

app.use(require('koa-static')(path.join(__dirname, 'public')));
app.use(require('koa-bodyparser')());

const Router = require('koa-router');
const router = new Router();
const observer = new MessageObserver();

const proxy = new Proxy([], {
  set(target, property, value) {
    observer.notifyListeners(value);
    return true;
  },
});

router.get('/subscribe', async (ctx, next) => {
  await new Promise(((resolve) => {
    observer.addListener((value) => {
      ctx.status = 200;
      ctx.body = value;
      resolve();
    });
  }));
});

router.post('/publish', async (ctx, next) => {
  if (ctx.request.body.message) {
    proxy.push(ctx.request.body.message);
    ctx.status = 201;
  }
});

app.use(router.routes());

module.exports = app;
