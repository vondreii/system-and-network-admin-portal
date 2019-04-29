/**
 * start.js (Backend API)
 *
 * Project:   INFT2031 Network and Admin Portal 
 * Author:    UoN Major Project, 2016
 * Modified:  Sharlene Von Drehnen
 * Date:      10/12/2016 - 31/01/2017    
 *
 */ 

'use strict';

// ---------- Load configuration file ---------- //

global.CONFIG = require('./config');
global.AZURECONFIG = require ('./dev/lib/azure_config');
CONFIG.longInputDir = `${__dirname}/www`;
CONFIG.longOutputDir = `${__dirname}/www`;


// ------------- Load all modules -------------- //

var _ = require('lodash');
_.each([
	['ARMClient', 'armclient'],
	['browserify', 'browserify'],
	['BodyParser', 'body-parser'],
	['chokidar', 'chokidar'],
	['cookieParser', 'cookie-parser'],
	['exorcist', 'exorcist'],
	['Express', 'express'],
	['flash','connect-flash'],
	['fs', 'fs-extra'],
	['logger', 'morgan'],
	['methodOverride', 'method-override'],
	['mongoose', 'mongoose'],
	['passport', 'passport'],
	['path', 'path'],
	['pug', 'pug'],
	['session', 'express-session'],
	['watchify', 'watchify']
], function(module) {
	global[module[0]] = require(module[1]);
});

var dotenv = require('dotenv').config();
var LocalStrategy = require('passport-local').Strategy;


// ---------- Database Configuration ----------- //

var db = require('./dev/lib');
var dbconfig = require('./dev/lib/dbconfig');

mongoose.connect(dbconfig.url);


// ------------- Set up ARMClient -------------- //

global.client = ARMClient({
	subscriptionId: AZURECONFIG.SUBSCRIPTION_ID,
	auth: ARMClient.clientCredentials({
		tenantId: AZURECONFIG.TENANT,
		clientId: AZURECONFIG.CLIENT_ID,
		clientSecret: AZURECONFIG.APP_SECRET
	})
});


// ------- Creates an Azure REST request ------- //

global.makeAzureRequest = function(type, path, api, queries, payload) {

	// If API version is not supplied, use '2016-07-01'
	api = api || '2016-07-01';

	// If queries are supplied, prepend them with an ampersand
	queries = queries || {};
	queries['api-version'] = api;

	// Return promise created by ARMClient
	return (client[type](path, queries, payload || {}));
};


// ----------- BROWSERIFY BUNDLING ------------- //

var bundler = browserify({
	debug: true,
	entries: ['www/init.js'],
	cache: {},
	packageCache: {}
});

bundler.plugin(watchify, {
	delay: 200,
	poll: true
});

bundler.transform({
	global: true
}, 'uglifyify');

bundler.on('log', log);
bundler.on('update', bundle);
bundle();

function bundle() {
	bundler.bundle()
		.on('error', function(x) {
			log(x);
		}).pipe(
			exorcist('www/app.js.map')
		).pipe(fs.createWriteStream('www/app.js'));
}

function log(logText) {
	console.log(logText);
}


// ----------- Configuring passport ------------ //

var app = Express();
var User = require('./dev/lib/passport/usermodel.js');


// Configure the local strategy for use by Passport.

// The local strategy require a `verify` function which receives the credentials
// (`username` and `password`) submitted by the user.  The function must verify
// that the password is correct and then invoke `cb` with a user object, which
// will be set at `req.user` in route handlers after authentication.

passport.use(new LocalStrategy({
		passReqToCallback: true
	},
	function(req, username, password, done) {
		User.findOne({'username':username}, function(err, user) {
			if (err) {
				return done(err);
			}
			if (!user) {
				return done(null, false);
			}
			if (user.password != password) {
				return done(null, false);
			}
			return done(null, user);
		});
	}
));


// Configure Passport authenticated session persistence.

// In order to restore authentication state across HTTP requests, Passport needs
// to serialize users into and deserialize users out of the session.  The
// typical implementation of this is as simple as supplying the user ID when
// serializing, and querying the user record by ID from the database when
// deserializing.

passport.serializeUser(function(user, cb) {
	cb(null, user.id);
});

passport.deserializeUser(function(id, cb) {
	User.findById(id, function (err, user) {
		if (err) { return cb(err); }
		cb(null, user);
	});
});


// ------------ view engine setup ---------------//

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');


// --------- configuring middlewares ----------- //

app.use(logger('dev'));
app.use(cookieParser());
app.use(BodyParser.json());
app.use(BodyParser.urlencoded({
	extended: true
}));

app.use(session({
	secret: 'shhhhhhhhh',
	resave: false,
	saveUninitialized: false
}));


// ---------- Passport Initialization ---------- //

app.use(passport.initialize());
app.use(passport.session());


// -------------- Create Server ---------------- //

app.use(flash());
app.use(function(req, res, next){
  res.locals.messages = req.flash();
  next();
});


// ----------------- Routing ------------------- //

// Sets up routing to the Web file 
app.use('/', require('./dev/routers/web')); 

// Sets up routing to the API file 
app.use('/api', require('./dev/routers/api')); 

// Sets up routing to the Admin file 
app.use('/admin', require('./dev/routers/admin'));

// Serve files from /www directory
app.use(Express.static('www'));

if (app.get('env') === 'development') {
	console.log("Environment is active");
}

require('./dev/lib/mstsc')(app.listen(CONFIG.PORT));

console.log(`Listening on port ${CONFIG.PORT} - Converted to 29873 if run in Vagrant`);


// ------------ Load file watchers ------------- //

require('./dev/watchers');


