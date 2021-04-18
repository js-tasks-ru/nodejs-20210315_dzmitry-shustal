const {v4: uuid} = require('uuid');
const User = require('../models/User');
const sendMail = require('../libs/sendMail');

module.exports.register = async (ctx, next) => {
  const {displayName, email, password} = ctx.request.body;
  const user = await User.findOne({email});

  if (!email) {
    ctx.status = 400;
    ctx.body = {errors: {email: 'Email не передан'}};
    return;
  }

  if (user) {
    ctx.status = 400;
    ctx.body = {errors: {email: 'Такой email уже существует'}};
    return;
  }

  const verificationToken = uuid();
  const newUser = new User({displayName, email, verificationToken});

  await newUser.setPassword(password);
  await newUser.save();

  await sendMail({
    template: 'confirmation',
    locals: {token: verificationToken},
    to: email,
    subject: 'Подтвердите почту',
  });

  ctx.status = 201;
  ctx.body = {status: 'ok'};
};

module.exports.confirm = async (ctx, next) => {
  const {verificationToken} = ctx.request.body;
  const user = await User.findOne({verificationToken});

  if (!user) {
    ctx.status = 400;
    ctx.body = {error: 'Ссылка подтверждения недействительна или устарела'};
    return;
  }

  const token = await ctx.login(user);

  user.verificationToken = undefined;
  await user.save();
  ctx.body = {token};
};
