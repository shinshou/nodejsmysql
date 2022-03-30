const router = require("express").Router();

router.get("/", (req, res) => {
  //パスはviewsからの相対パスで指定
  res.render("./index.ejs");
});

module.exports = router;
