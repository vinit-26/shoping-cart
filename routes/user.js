var express = require("express");
var router = express.Router();
const csrf = require("csurf");
const passport = require("passport");

var Cart = require("../modals/cart");
var Order = require("../modals/order");

const csrfProtection = csrf();
router.use(csrfProtection);

router.get("/profile", isLoggedIn, (req, res, next) => {
  Order.find({ user: req.user }, (err, orders) => {
    if (err) {
      return res.end("Some Error occured");
    }
    var cart;
    orders.forEach((order) => {
      cart = new Cart(order.cart);
      order.items = cart.generateArr();
    });
    res.render("users/profile", { orders: orders });
  });
});

router.get("/signout", isLoggedIn, (req, res, next) => {
  req.logOut();
  res.redirect("/");
});

router.use("/", notLoggedIn, (req, res, next) => {
  next();
});

router.get("/signup", (req, res, next) => {
  var messages = req.flash("error");
  res.render("users/signup", {
    csrfToken: req.csrfToken(),
    messages: messages,
    hasErrors: messages.length > 0,
  });
});

router.post(
  "/signup",
  passport.authenticate("localsignup", {
    failureRedirect: "/user/signup",
    failureFlash: true,
  }),
  (req, res) => {
    if (req.session.oldUrl) {
      var oldUrl = req.session.oldUrl;
      req.session.oldUrl = null;
      res.redirect(oldUrl);
    } else {
      res.redirect("/user/profile");
    }
  }
);

router.get("/signin", (req, res, next) => {
  var messages = req.flash("error");
  res.render("users/signin", {
    csrfToken: req.csrfToken(),
    messages: messages,
    hasErrors: messages.length > 0,
  });
});

router.post(
  "/signin",
  passport.authenticate("localsignin", {
    failureRedirect: "/user/signin",
    failureFlash: true,
  }),
  (req, res) => {
    if (req.session.oldUrl) {
      var oldUrl = req.session.oldUrl;
      req.session.oldUrl = null;
      res.redirect(oldUrl);
    } else {
      res.redirect("/user/profile");
    }
  }
);

module.exports = router;

function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect("/");
}

function notLoggedIn(req, res, next) {
  if (!req.isAuthenticated()) {
    return next();
  }
  res.redirect("/");
}
