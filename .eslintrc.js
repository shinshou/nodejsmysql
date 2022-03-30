module.exports = {
  env: {
    browser: true,
    jquery: true, //jqueryを追加
    commonjs: true,
    es2021: true,
    node: true,
  },
  extends: "eslint:recommended", //おすすめ追加設定
  parserOptions: {
    ecmaVersion: 12,
  },
  rules: {
    indent: ["error", 2, { SwitchCase: 1 }], //インデントのルール
    quotes: ["error", "double"], //クオートはダブルを使用
    semi: ["error", "always"], //末尾のセミコロンがなければエラー
    "no-unused-vars": [
      "error",
      {
        vars: "all", //使っていない変数はエラー
        args: "none", //関数の引数は除外
      },
    ],
    "no-consoel": ["off"], //コンソールは使用
  },
};
