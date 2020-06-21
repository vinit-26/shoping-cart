var express = require("express");
var router = express.Router();

var Product = require("../modals/product");
var Cart = require("../modals/cart");
var Order = require("../modals/order");

/* GET home page. */
router.get("/", function (req, res, next) {
  var successMsg = req.flash("success")[0];
  Product.find(function (err, docs) {
    var productChunks = [];
    var chunkSize = 3;
    for (var i = 0; i < docs.length; i += chunkSize) {
      productChunks.push(docs.slice(i, i + chunkSize));
    }
    res.render("shop/index", {
      title: "Shopping Cart",
      products: productChunks,
      successMsg: successMsg,
      noMessages: !successMsg,
    });
  });
});

router.get("/add-to-cart/:id", (req, res) => {
  var productId = req.params.id;
  var cart = new Cart(req.session.cart ? req.session.cart : {});

  Product.findById(productId, (err, product) => {
    if (err) {
      console.log(err);
      return res.redirect("/");
    }
    cart.add(product, product.id);
    req.session.cart = cart;
    console.log(cart);
    res.redirect("/");
  });
});

router.get("/reduce/:id", (req, res) => {
  var productId = req.params.id;
  var cart = new Cart(req.session.cart ? req.session.cart : {});
  cart.removeByOne(productId);
  req.session.cart = cart;
  res.redirect("/shopping-cart");
});

router.get("/remove/:id", (req, res) => {
  var productId = req.params.id;
  var cart = new Cart(req.session.cart ? req.session.cart : {});
  cart.removeItem(productId);
  req.session.cart = cart;
  res.redirect("/shopping-cart");
});

router.get("/shopping-cart", (req, res) => {
  if (!req.session.cart) {
    return res.render("shop/shopping-cart", { products: null });
  }
  var cart = new Cart(req.session.cart);
  res.render("shop/shopping-cart", {
    products: cart.generateArr(),
    totalPrice: cart.totalPrice,
  });
});

router.get("/checkout", isLoggedIn, (req, res) => {
  if (!req.session.cart) {
    return res.redirect("/shopping-cart");
  }
  var cart = new Cart(req.session.cart);
  var errMsg = req.flash("error")[0];
  res.render("shop/checkout", {
    total: cart.totalPrice,
    errMsg: errMsg,
    noError: !errMsg,
  });
});

router.post("/checkout", isLoggedIn, (req, res) => {
  if (!req.session.cart) {
    return res.redirect("/shopping-cart");
  }
  var cart = new Cart(req.session.cart);
  var stripe = require("stripe")(
    "sk_test_51GvKVrDuWKWteuMdCVJNoTog9Ka0JnmKrQ7V1Kv5f3a3Hav5DEeeUMb0RLhACD8ouJJ4Ii3x014LnQwJ7wva5X8J00IcP0tHBf"
  );

  // `source` is obtained with Stripe.js; see https://stripe.com/docs/payments/accept-a-payment-charges#web-create-token
  stripe.charges.create(
    {
      amount: cart.totalPrice * 100,
      currency: "inr",
      source: req.body.stripeToken,
      description: "My first Charge",
    },
    function (err, charge) {
      if (err) {
        req.flash("error", err.message);
        return res.redirect("/checkout");
      }
      var order = new Order({
        user: req.user,
        cart: cart,
        address: req.body.address,
        name: req.body.name,
        paymentId: charge.id,
      });
      order.save((err, result) => {
        req.flash("success", "Successfully bought the product");
        req.session.cart = null;
        res.redirect("/");
      });
    }
  );
});

module.exports = router;

function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  req.session.oldUrl = req.url;
  console.log(req.url);
  res.redirect("/user/signin");
}
