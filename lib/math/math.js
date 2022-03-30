const roundTo = require("round-to");

let padding = function (value) {
  //受け取った値が本当に数値化の確認。
  if (isNaN(parseFloat(value))) {
    //parseできなかった場合'-'で返す。
    return "-";
  }
  //変換できた場合。小数第２位になるように四捨五入。
  return roundTo(value, 2).toPrecision(3);
};

let round = function (value) {
  return roundTo(value, 2);
};

module.exports = {
  padding,
  round
};