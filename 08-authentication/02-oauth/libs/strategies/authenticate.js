const {v4: uuid} = require('uuid');
const User = require('../../models/User');

module.exports = async function authenticate(strategy, email, displayName, done) {
  if (!email) {
    return done(null, false, `Не указан email`);
  }

  try {
    const user = await User.findOne({email});

    if (user) {
      return done(null, user);
    }

    const newUser = new User({email, displayName});

    await newUser.setPassword(uuid());
    await newUser.save();
    return done(null, newUser);
  } catch (e) {
    done(e);
  }
};
