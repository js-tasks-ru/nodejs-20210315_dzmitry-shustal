const Product = require('../models/Product');

module.exports.productsBySubcategory = async function productsBySubcategory(ctx, next) {
  try {
    const {subcategory} = ctx.request.query;
    const products = await Product.find(subcategory ? {subcategory} : {});

    ctx.body = {products};
  } catch (e) {
    ctx.status = 400;
    ctx.body = 'Bad Request';
  }
};

module.exports.productList = async function productList(ctx, next) {
  ctx.body = {};
};

module.exports.productById = async function productById(ctx, next) {
  try {
    const {id} = ctx.request.params;
    const product = await Product.findById(id);

    if (!product) {
      ctx.status = 404;
      ctx.body = 'Not Found';
    }

    ctx.body = {product};
  } catch (e) {
    ctx.status = 400;
    ctx.body = 'Bad Request';
  }
};

