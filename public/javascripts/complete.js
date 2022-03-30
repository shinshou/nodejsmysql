let window_onpopstate = function (event) {
  history.pushState(null, null, null);
};

let document_onready = function (event) {
  history.pushState(null, null, null);//空履歴を追加
  $(window).on("popstate", window_onpopstate);
};


$(document).ready(document_onready);