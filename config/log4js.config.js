const path = require("path");
//環境変数でログ出力先のファイルを変更できるように。
//環境変数がなければlogsに保存
const LOG_ROOT_DIR = process.env.LOG_ROOT_DIR || path.join(process.cwd(), "./logs");

module.exports = {
  appenders: {
    //ConsoleLogAppenderというログ出力機能を追加。
    //ログの出力方法はコンソール出力に設定。
    ConsoleLogAppender: {
      type: "console"
    },
    ApplicationLogAppender: {
      type: "dateFile",
      //logs内にapplication.logとして保存
      filename: path.join(LOG_ROOT_DIR, "./application.log"),
      pattern: "yyyyMMdd",
      numBackups:7
    },
    AccessLogAppender: {
      type: "dateFile",
      filename: path.join(LOG_ROOT_DIR, "./access.log"),
    }
  },
  categories: {
    //categoriesには必ずdefaultは設定が必要。
    "default": {
      //defaultのログ機能はConsoleLogAppenderの設定を使用。
      appenders: ["ConsoleLogAppender"],
      //ログ出力レベルはすべて出力を指定。
      level:"ALL"
    },
    //applicationログを選択した場合は、ApplicationLogAppenderとConsoleLogAppenderの２つを出力する。
    "application": {
      appenders: [
        "ApplicationLogAppender",
        "ConsoleLogAppender"
      ],
      level:"INFO"
    },
    "access": {
      appenders: [
        "AccessLogAppender",
        "ConsoleLogAppender"
      ],
      level:"INFO"
    }
  }
};