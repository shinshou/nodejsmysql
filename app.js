const IS_PRODUCTION = process.env.NODE_ENV === "producrion";
const appconfig = require("./config/application.config");
const dbconfig = require("./config/mysql.config");
const path = require("path"); //コアモジュールの導入
const logger = require("./lib/log/logger.js");
const accesslogger = require("./lib/log/accesslogger");
const applicationlogger = require("./lib/log/applicationlogger");
const accesscontrol = require("./lib/security/accesscontrol");
const express = require("express");
const favicon = require("serve-favicon");
const cookie = require("cookie-parser");
const session = require("express-session");
const MySQLStore = require("express-mysql-session")(session);
const flash = require("connect-flash");
const gracefulShutdown= require("http-graceful-shutdown");
const app = express();

//expressでejsを使う設定
app.set("view engine", "ejs");
//サーバーサイド情報の隠蔽
app.disable("x-powered-by");

//グローバルメソッドをビューエンジンに渡す。
app.use((req, res, next) => {
  res.locals.moment = require("moment");
  res.locals.padding = require("./lib/math/math").padding;
  next();
});

//静的ファイルの配信設定
//ファビコンの配信
app.use(favicon(path.join(__dirname, "/public/favicon.ico"))); 
app.use("/public", express.static(path.join(__dirname, "/public")));

//Set access log
app.use(accesslogger());

//---ミドルウェア
//クッキーの利用
app.use(cookie());
//セッションの利用。
app.use(session({
  store: new MySQLStore({
    host: dbconfig.HOST,
    port: dbconfig.PORT,
    user: dbconfig.USERNAME,
    password: dbconfig.PASSWORD,
    database:dbconfig.DATABASE
  }),
  secret: appconfig.security.SESSION_SECRET,//シークレットの文字列
  resave: false,//強制的に保存するか
  saveUninitialized: false,//セッションを自動で作成しないように
  name: "sid",
  cookie: {
    secure:IS_PRODUCTION,
  }
}));
// フォームからのPOSTを受け付けられるようにする。
app.use(express.urlencoded({ extended: true }));
app.use(flash());
app.use(...accesscontrol.initialize());//スプレッド演算子の使用

//ルーティングの設定
app.use("/",(() => {
  const router = express.Router();
  router.use((req, res, next) => {
    res.setHeader("X-Frame-Options", "SAMEORIGIN");
    next();
  });
  router.use("/account", require("./routes/account"));
  router.use("/search", require("./routes/search"));
  router.use("/shops", require("./routes/shops"));
  router.use("/test", (req, res) => { throw new Error("test Error");
  });
  router.use("/", require("./routes/index"));
  return router;
})());


//アプリケーションログの取得。
app.use(applicationlogger());

//Custom Error page
app.use((req, res, next)=> {
  res.status(404);
  res.render("./404.ejs");
});
app.use((err, req, res, next) => {
  res.status(500);
  res.render("./500.ejs");
});

//Execute web application
let server = app.listen(appconfig.PORT, () => {
  logger.application.info(`Application listened at ${appconfig.PORT}`);
});

//Graceful shutdown
gracefulShutdown(server, {
  signals: "SIGINT SIGTERM",
  timeout: 10000,
  onShutdown: () => {
    return new Promise((resolve, reject) => {
      const { pool } = require("./lib/database/pool");
      pool.end((err) => {
        if (err) {
          return reject(err);
        }
        resolve();
      });
    });
  },
  finally: () => {
    const logger = require("./lib/log/logger").application;
    logger.info("Application shutdown finished.");
  }
});
