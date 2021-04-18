const fs = require('fs');
const path = require('path');
const Koa = require('koa');
const Router = require('koa-router');
const Session = require('./models/Session');
const {v4: uuid} = require('uuid');
const handleMongooseValidationError = require('./libs/validationErrors');
const mustBeAuthenticated = require('./libs/mustBeAuthenticated');
const {login} = require('./controllers/login');
const {oauth, oauthCallback} = require('./controllers/oauth');
const {me} = require('./controllers/me');

const app = new Koa();
const apiRouter = new Router({prefix: '/api'});
const indexFile = fs.readFileSync(path.join(__dirname, 'public/index.html'));

app.use(require('koa-static')(path.join(__dirname, 'public')));
app.use(require('koa-bodyparser')());

app.use(async (ctx, next) => {
  try {
    await next();
  } catch (err) {
    if (err.status) {
      ctx.status = err.status;
      ctx.body = {error: err.message};
    } else {
      console.error(err);
      ctx.status = 500;
      ctx.body = {error: 'Internal server error'};
    }
  }
});

app.use((ctx, next) => {
  ctx.login = async function(user) {
    const token = uuid();
    const session = await Session.create({token, user, lastVisit: new Date()});

    await session.save();

    return token;
  };

  return next();
});

apiRouter.use(async (ctx, next) => {
  const header = ctx.request.get('Authorization') || '';
  const token = (header.match(/Bearer\s+(.+)/) || [])[1];

  if (!header || !token) return next();

  const session = await Session.findOne({token}).populate('user');

  if (!session) {
    ctx.status = 401;
    ctx.body = {error: 'Неверный аутентификационный токен'};
    return;
  }

  session.lastVisit = new Date();
  ctx.user = session.user;
  await session.save();

  return next();
});

apiRouter.post('/login', login);
apiRouter.get('/oauth/:provider', oauth);
apiRouter.post('/oauth_callback', handleMongooseValidationError, oauthCallback);
apiRouter.get('/me', mustBeAuthenticated, me);

app.use(apiRouter.routes());

// this for HTML5 history in browser
app.use(async (ctx) => {
  if (ctx.url.startsWith('/api') || ctx.method !== 'GET') return;

  ctx.set('content-type', 'text/html');
  ctx.body = indexFile;
});

module.exports = app;
