let btnSubmit_onclick = function (event) {
  let $submit = $(this);//押されたボタンの方を変数に格納
  let $form = $submit.parents("form");//ボタンの親要素のformを取得
  $form.attr("method", $submit.data("method"));
  $form.attr("action", $submit.data("action"));
  $form.submit();
  $submit.off().prop("disabled", true);
  $form.on("submit", false);
};

let document_onready = function (event) {
  $("input[type='submit']").on("click", btnSubmit_onclick);
};

$(document).ready(document_onready);
