const pool = require("./pool");

let Transaction = class {
  constructor(connection) {
    // connection変数の初期化
    this.connection = connection;
  }
  //トランザクションの開始
  async begin() {
    //コネクションがあれば一旦リリース
    if (this.connection) {
      this.connection.release();
    }
    // 改めてコネクションを取得。
    this.connection = await pool.getConnection();
    // 取得したコネクションに対してトランザクションの開始。
    this.connection.beginTransaction();
  }
  //クエリーの実行
  async executeQuery(query, values, options = {}) {
    options = {
      fields: options.fields || false
    };
    return new Promise((resolve, reject) => {
      this.connection.query(query, values, (err, results, fields) => {
        if (!err) {
          resolve(!options.fields ? results : { results, fields });
        } else {
          reject(err);
        }
      });
    });
  }
  async commit() {
    return new Promise((resolve, reject) => {
      this.connection.commit((err) => {
        this.connection.release();
        this.connection = null;
        if (!err) {
          resolve();
        } else {
          reject(err);
        }
      });
    });
  }
  async rollback() {
    return new Promise((resolve, reject) => {
      this.connection.rollback(() => {
        this.connection.release();
        this.connection = null;
        resolve();
      });
    });
  }
};


module.exports = Transaction;