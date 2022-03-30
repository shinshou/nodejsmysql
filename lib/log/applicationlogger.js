const logger = require("./logger").application;

//ミドルウェアを出力。
//オプションを設定し、ミドルウェアを返す。
module.exports = function (option) {
  //エラーを扱うミドルウェアを作成。
  return function (err, req, res, next) {
    //受け取った引数をエラーとして出力。
    logger.error(err.message);
    next(err);
  };
};