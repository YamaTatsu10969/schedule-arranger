var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

// remove X-Powered-By header
var helmet = require('helmet');

var session = require('express-session');
var passport = require('passport');

// read models
var User = require('./models/user');
var Schedule = require('./models/schedule');
var Availability = require('./models/availability');
var Candidate = require('./models/candidate');
var Comment = require('./models/comment');
User.sync().then(() => {
  Schedule.belongsTo(User, { foreignKey: 'createdBy' });
  Schedule.sync();
  Comment.belongsTo(User, { foreignKey: 'userId' });
  Comment.sync();
  Availability.belongsTo(User, { foreignKey: 'userId' });
  Candidate.sync().then(() => {
    Availability.belongsTo(Candidate, { foreignKey: 'candidateId' });
    Availability.sync();
  });
});

var GitHubStrategy = require('passport-github2').Strategy;

// secretsJson があるときはローカルでの実行時のみ。 .gitignore に追加されているため
var GITHUB_CLIENT_ID = process.env.GITHUB_CLIENT_ID;
var GITHUB_CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET;

if (!process.env.GITHUB_CLIENT_ID) {
  console.info('*********  開発環境  *********');
  var secretsJson = require('./secrets.json');
  var GITHUB_CLIENT_ID =
    process.env.GITHUB_CLIENT_ID || secretsJson.GITHUB_CLIENT_ID;
  var GITHUB_CLIENT_SECRET =
    process.env.GITHUB_CLIENT_SECRET || secretsJson.GITHUB_CLIENT_SECRET;
} else {
  console.info('*********  Heroku ***********');
}
passport.serializeUser(function (user, done) {
  done(null, user);
});

passport.deserializeUser(function (obj, done) {
  done(null, obj);
});

passport.use(
  new GitHubStrategy(
    {
      clientID: GITHUB_CLIENT_ID,
      clientSecret: GITHUB_CLIENT_SECRET,
      callbackURL: process.env.HEROKU_URL
        ? process.env.HEROKU_URL + 'auth/github/callback'
        : 'http://localhost:8000/auth/github/callback',
    },
    function (accessToken, refreshToken, profile, done) {
      process.nextTick(function () {
        User.upsert({
          userId: profile.id,
          username: profile.username,
        }).then(() => {
          done(null, profile);
        });
      });
    },
  ),
);

var indexRouter = require('./routes/index');
var loginRouter = require('./routes/login');
var logoutRouter = require('./routes/logout');
var schedulesRouter = require('./routes/schedules');
var availabilitiesRouter = require('./routes/availabilities');
var commentsRouter = require('./routes/comments');

var app = express();
app.use(helmet());

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(
  session({
    secret: 'h7490ybli89nc74g',
    resave: false,
    saveUninitialized: false,
  }),
);
app.use(passport.initialize());
app.use(passport.session());

app.use('/', indexRouter);
app.use('/login', loginRouter);
app.use('/logout', logoutRouter);
app.use('/schedules', schedulesRouter);
app.use('/schedules', availabilitiesRouter);
app.use('/schedules', commentsRouter);

app.get(
  '/auth/github',
  passport.authenticate('github', { scope: ['user:email'] }),
  function (req, res) {},
);

app.get(
  '/auth/github/callback',
  passport.authenticate('github', { failureRedirect: '/login' }),
  function (req, res) {
    var loginFrom = req.cookies.loginFrom;
    // オープンリダイレクタ脆弱性対策
    if (
      loginFrom &&
      !loginFrom.includes('http://') &&
      !loginFrom.includes('https://')
    ) {
      res.clearCookie('loginFrom');
      res.redirect(loginFrom);
    } else {
      res.redirect('/');
    }
  },
);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
