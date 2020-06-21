const createError = require("http-errors");
const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const logger = require("morgan");
const Handlebars = require("handlebars");
const expressHBS = require("express-handlebars");
const mongoose = require("mongoose");
const {
  allowInsecurePrototypeAccess,
} = require("@handlebars/allow-prototype-access");
const session = require("express-session");
const passport = require("passport");
const flash = require("connect-flash");
const bodyParser = require("body-parser");
const validator = require("express-validator");
const MongoStore = require("connect-mongo")(session);

const indexRouter = require("./routes/index");
const userRouter = require("./routes/user");

const app = express();

const PORT = process.env.PORT || 9000;

app.engine(
  "handlebars",
  expressHBS({ handlebars: allowInsecurePrototypeAccess(Handlebars) })
);
app.set("view engine", "handlebars");

mongoose.set("useCreateIndex", true);
mongoose.connect(
  "mongodb+srv://vinit:vinit2608@cluster0-sxxm9.mongodb.net/shopping?retryWrites=true&w=majority",
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  }
);
require("./config/passport");
// view engine setup
// app.set('views', path.join(__dirname, 'views'));
// app.set('view engine', 'hbs');
// app.engine('.hbs', expressHBS({defaultLayoute: 'layoute', extname: '.hbs'}));
// app.set('view engine', '.hbs');

// app.use(bodyparser.urlencoded({extended: false}));
app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(validator());
app.use(cookieParser());
app.use(
  session({
    secret: "mysecreteisnothing",
    resave: false,
    saveUninitialized: false,
    store: new MongoStore({ mongooseConnection: mongoose.connection }),
    cookie: { maxAge: 180 * 60 * 1000 },
  })
);
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());
app.use(express.static(path.join(__dirname, "public")));

app.use(function (req, res, next) {
  res.locals.login = req.isAuthenticated();
  res.locals.session = req.session;
  next();
});

app.use("/user", userRouter);
app.use("/", indexRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

app.listen(PORT, () => {
  console.log("App listening on port: ", PORT);
});

module.exports = app;
