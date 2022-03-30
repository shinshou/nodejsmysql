const router = require("express").Router();
const { authenticate, authorize, PRIVILEGE } = require("../lib/security/accesscontrol");

router.get("/", authorize(PRIVILEGE.NORMAL),(req, res, next) => {
  res.render("./account/index.ejs");
});

router.get("/login", (req, res, next) => {
  res.render("./account/login.ejs", {"message":req.flash("message")});
});

router.post("/login", authenticate());

router.post("/logout", (req, res, next) => {
  req.logout();
  res.redirect("/account/login");
});

//reviewsへアクセスが来たらaccount.reviewsへ飛ばす。
router.use("/reviews", authorize(PRIVILEGE.NORMAL), require("./account.reviews"));

module.exports = router;