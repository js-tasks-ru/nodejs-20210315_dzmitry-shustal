const Category = require('../models/Category');

module.exports.categoryList = async function categoryList(ctx, next) {
  try {
    const categories = await Category.find({});

    ctx.body = {categories};
  } catch (e) {
    ctx.status = 400;
    ctx.body = 'Bad Request';
  }
};
