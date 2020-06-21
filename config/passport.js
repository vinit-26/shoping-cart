const passport = require("passport");
const User = require("../modals/users");
const LocalStratagy = require("passport-local").Strategy;

passport.serializeUser(function (user, done) {
  done(null, user.id);
});

passport.deserializeUser(function (id, done) {
  User.findById(id, function (err, user) {
    done(err, user);
  });
});

passport.use(
  "localsignup",
  new LocalStratagy(
    {
      usernameField: "email",
      passwordField: "password",
      passReqToCallback: true,
    },
    function (req, email, password, done) {
      req.checkBody("email", "Invalid E-mail").notEmpty().isEmail();
      req
        .checkBody("password", "Invalid Password")
        .notEmpty()
        .isLength({ min: 4 });
      var errors = req.validationErrors();
      if (errors) {
        var message = [];
        errors.forEach((error) => {
          message.push(error.msg);
        });
        return done(null, false, req.flash("error", message));
      }
      User.findOne({ email: email }, function (err, user) {
        if (err) {
          return done(err);
        }
        if (user) {
          return done(null, false, { message: "Email already in use." });
        }
        var newUser = new User();
        newUser.email = email;
        newUser.password = newUser.encryptPassword(password);
        newUser.save(function (err, result) {
          if (err) {
            return done(err);
          }
          return done(null, newUser);
        });
      });
    }
  )
);

passport.use(
  "localsignin",
  new LocalStratagy(
    {
      usernameField: "email",
      passwordField: "password",
      passReqToCallback: true,
    },
    (req, email, password, done) => {
      req.checkBody("email", "Invalid E-mail").notEmpty().isEmail();
      req.checkBody("password", "Invalid Password").notEmpty();
      var errors = req.validationErrors();
      if (errors) {
        var message = [];
        errors.forEach((error) => {
          message.push(error.msg);
        });
        return done(null, false, req.flash("error", message));
      }
      User.findOne({ email: email }, function (err, user) {
        if (err) {
          return done(err);
        }
        if (!user) {
          return done(null, false, { message: "No User Found" });
        }
        if (!user.validPassword(password, user.password)) {
          return done(null, false, { message: "wrong Password." });
        }
        return done(null, user);
      });
    }
  )
);