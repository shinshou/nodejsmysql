const router = require("express").Router();
const { MySQLClient,sql } = require("../lib/database/client");
const moment = require("moment");
const tokens = new (require("csrf"))();
const DATE_FORMAT = "YYYY/MM/DD";

let validateReviewData = function (req) {
  let body = req.body;//formの内容をbodyに格納
  let isValid = true, error = {};//初期化

  //bodyに訪問日があるか？あれば正しいフォーマットで入力されているかチェック。
  if (body.visit && !moment(body.visit,DATE_FORMAT).isValid()) {
    //訪問日が正しいフォーマットで入力されていない場合。
    isValid = false;
    error.visit = "訪問日の日付フォーマットが不正です。";
  } else if (!body.visit) {
    isValid = false;
    error.visit = "値を入力してください。";
  }

  if (isValid) {
    return undefined;
  }
  return error;
};

let createReviewData = function (req) {
  let body = req.body,date;
  return {
    shopId: req.params.shopId,
    score:parseFloat(body.score),
    // momentを使用してbodyから受け取った訪問日をフォーマット。
    // 正しくフォーマットされていればdateには訪問日を正しくなければnullを代入。
    visit:(date=moment(body.visit,DATE_FORMAT)) && date.isValid() ? date.toDate() : null,
    post:new Date(),
    description:body.description
  };
};

router.get("/regist/:shopId(\\d+)", async (req, res, next) => {
  let shopId = req.params.shopId;
  let secret,token,shop, shopName, review, results;

  secret = await tokens.secret();
  token = tokens.create(secret);
  req.session._csrf = secret;//_csrfという名称でセッションにsecretを保存
  res.cookie("_csrf", token);//クッキーに_csrfとう言う名称でtokenを保存

  try {
    // shopIdからショップ情報の取得
    results = await MySQLClient.executeQuery(
      await sql("SELECT_SHOP_BASIC_BY_ID"),
      [shopId]
    );
    // 値があれば取得なければ空代入。
    shop = results[0] || {};
    shopName = shop.name;
    review = {};
    res.render("./account/reviews/regist-form.ejs", { shopId, shopName, review });
  } catch (err) {
    next(err);
  }
});

router.post("/regist/:shopId(\\d+)", (req, res, next) => {
  let review = createReviewData(req);
  let { shopId,shopName } = req.body;
  res.render("./account/reviews/regist-form.ejs", { shopId, shopName, review });
});

router.post("/regist/confirm", (req, res, next) => {
  let error = validateReviewData(req);//リクエストに対してバリデーションを実施
  let review = createReviewData(req);
  let { shopId,shopName } = req.body;

  if (error) {
    res.render(("./account/reviews/regist-form.ejs"), { error, shopId, shopName, review });
    return;
  }

  res.render("./account/reviews/regist-confirm.ejs", { shopId, shopName, review });
});

router.post("/regist/execute", async (req, res, next) => {
  //セッションとトークンの確認
  let secret = req.session._csrf;
  let token = req.cookies._csrf;

  if (tokens.verify(secret, token) === false) {
    next(new Error("Invalid Token."));
    return;//コレ以降の処理を行わないためにreturnする。
  }

  let error = validateReviewData(req);//リクエストに対してバリデーションを実施
  let review = createReviewData(req);
  let { shopId, shopName } = req.body;
  let userId = 1;//ログイン機能実装後に更新。
  let transaction;

  if (error) {
    res.render(("./account/reviews/regist-form.ejs"), { error, shopId, shopName, review });
    return;
  }

  try {
    //トランザクション処理の開始
    transaction = await MySQLClient.beginTransaction();
    transaction.executeQuery(
      await sql("SELECT_SHOP_BY_ID_FOR_UPDATE"),
      [shopId]
    );
    transaction.executeQuery(
      await sql("INSERT_SHOP_REVIEW"),
      [shopId, userId, review.score, review.visit, review.description]
    );
    transaction.executeQuery(
      await sql("UPDATE_SHOP_SCORE_BY_ID"),
      [shopId, shopId]
    );
    //トランザクション処理でなにも問題がなければ
    await transaction.commit();
  } catch(err) {
    //トランザクション処理でなにか問題があれば
    await transaction.rollback();
    next(err);
    return;
  }

  //正常に動作できた場合はトークンを削除する。
  delete req.session._csrf;
  res.clearCookie("_csrf");

  res.redirect(`/account/reviews/regist/complete?shopId=${shopId}`);
});

router.get("/regist/complete", (req, res, next) => {
  res.render("./account/reviews/regist-complete.ejs", { shopId:req.query.shopId });
});


module.exports = router;