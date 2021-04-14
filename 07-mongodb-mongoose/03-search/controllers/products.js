const Product = require('../models/Product');

module.exports.productsByQuery = async function productsByQuery(ctx, next) {
  const {query} = ctx.request.query;
  const products = await Product.find({
    $text: {
      $search: query,
    },
  });

  ctx.body = {products};
};
