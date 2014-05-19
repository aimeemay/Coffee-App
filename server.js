 // Look at the ember: http://jsbin.com/izijal/9/edit
var express = require('express')
  , fs = require('node-fs')
  , passport = require('passport')
  , flash = require('connect-flash')
  , LocalStrategy = require('passport-local').Strategy;

var mongo = require('mongodb');
var ObjectID = mongo.ObjectID

var exphbs  = require('express3-handlebars');

var users = [
    { id: 1, username: 'bob', password: 'secret', email: 'bob@example.com' }
  , { id: 2, username: 'a', password: 'a', email: 'joe@example.com' }
  , { id: 3, username: 'infs', password: '3202', email: 'infs3202@uq.edu.au'}
];

function findById(id, fn) {
  var idx = id - 1;
  if (users[idx]) {
    fn(null, users[idx]);
  } else {
    fn(new Error('User ' + id + ' does not exist'));
  }
}

function findByUsername(username, fn) {
  for (var i = 0, len = users.length; i < len; i++) {
    var user = users[i];
    if (user.username === username) {
      return fn(null, user);
    }
  }
  return fn(null, null);
}


////////////////
var MONGOHQ_URL='mongodb://aimee:test@oceanic.mongohq.com:10055/app25064625';

mongo.Db.connect(MONGOHQ_URL, function (err, db) {

  // Setup coffees array 
  var coffee = db.collection('coffees');
    

// Passport session setup.
//   To support persistent login sessions, Passport needs to be able to
//   serialize users into and deserialize users out of the session.  Typically,
//   this will be as simple as storing the user ID when serializing, and finding
//   the user by ID when deserializing.
passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  findById(id, function (err, user) {
    done(err, user);
  });
});


// Use the LocalStrategy within Passport.
passport.use(new LocalStrategy(
  function(username, password, done) {
    // asynchronous verification, for effect...
    process.nextTick(function () {
      // Find the user by username.  If there is no user with the given
      // username, or the password is not correct, set the user to `false` to
      // indicate failure and set a flash message.  Otherwise, return the
      // authenticated `user`.
      findByUsername(username, function(err, user) {
        if (err) { return done(err); }
        if (!user) { return done(null, false, { message: 'Unknown user ' + username }); }
        if (user.password != password) { return done(null, false, { message: 'Invalid password' }); }
        return done(null, user);
      })
    });
  }
));

var app = express();

// configure Express
app.configure(function() {
  app.set('views', __dirname + '/views');


  app.engine('handlebars', exphbs({defaultLayout: 'main'}));
  app.set('view engine', 'handlebars');

  // app.use(express.logger());
  app.use(express.cookieParser('some secret'));
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(express.session({
    cookie: {
      maxAge : 3600000//ms   = 1 Hour
    }
  }));
  app.use(flash());
  // Initialize Passport!  Also use passport.session() middleware, to support
  // persistent login sessions (recommended).
  app.use(passport.initialize());
  app.use(passport.session());
  app.use(app.router);
  app.use(express.static(__dirname + '/public'));
});


// // Main route
// app.get('/', function(req,res) {
// 	var activeSession = !(typeof req.user === "undefined")
// 	if (activeSession) res.redirect('coffees');

//   var flash = req.flash();

//   if (flash.error) {
//     flash.error = flash.error[0];
//   }

//   console.log(flash)
// 	res.render('index', {activeSession: activeSession, user: req.user, flash: flash});
// })


//Coffees Menu route
// app.get('/coffees/:sort?', function(req, res){

// 	var sortBy = (req.params.sort || "name");

// 	// make sure sorting selector actually exist
// 	if (sortBy !== "name" && sortBy !== "price") {
// 		res.end("404 sort this way doens't exist");
// 	} else {
// 		// All coffees sorted by the sortBy variable
//     coffee.find({}).sort({sortBy:1}).toArray(function(err, docs){
// 		  res.render('coffees', {coffee: docs})
//     });
// 	}
// })

// //Search route
// app.get('/search', function(req, res) {
//   res.render('search')
// })

// //Coffee route - i.e. individual coffee type pages
// app.get('/coffee/:name', function(req, res) {
// 	coffee.find({'name':req.params.name}).toArray(function(err, docs){
//       console.log(docs)
// 	    res.render('coffeeOverview', docs[0])
//   })
// })

// app.get('/coffee/:name/gallery', function(req, res) {
// 	coffee.find({'name':req.params.name}).toArray(function(err, docs){
//     res.render('coffeeGallery', docs[0])
//   });
// })

// app.get('/coffee/:name/reviews', function(req, res) {
//   coffee.find({'name':req.params.name}).toArray(function(err, docs){
// 	 res.render('coffeeReviews', docs[0])
//   });
// })

//Login route
app.post('/login',
  passport.authenticate('local', { failureRedirect: '/', failureFlash: true }),
  function(req, res) {
  	var sessionTime = req.body.session * 60 * 1000;
  	req.session.cookie.maxAge = sessionTime;
  	// console.log('Set session time: ', sessionTime, 'Session cookie info', req.session.cookie)
  	// console.log('res :', res); - aimee here.

  	//append to log file
  	var logMessage = '\n' + 'Time:' + new Date() + ', User:' + req.user['username'] + ', Action:LOGIN'
	  fs.appendFile("logfiles/userLogin.txt", logMessage, function(err) {
	    if(err) {
	        console.log(err);
	    } else {
	        console.log('message appended:' + logMessage);
	    }
	  }); 
    res.redirect('/coffees');
  });

app.post('/search', function(req, res) {
  var name = req.body.name
  var price = req.body.price
  console.log(name + '   ' + price)

  if (price === 'none') {
    coffee.find({'name': name}).toArray(function(err, docs){
      console.log(docs);
      res.render('coffees', {coffee: docs, filtersOn : true})
    });
  } else if (name === '') {
    coffee.find({'price': price}).toArray(function(err, docs){
      console.log(docs);
      res.render('coffees', {coffee: docs, filtersOn : true})
    });
  } else {
    coffee.find({'name': name, 'price' : price}).toArray(function(err, docs){
      res.render('coffees', {coffee: docs, filtersOn : true})
    });
  }
})

app.get('/', 
  // passport.authenticate('local', { failureRedirect: '/', failureFlash: true }), 
  function(req, res) {
  res.render('master', {layout: false})
});


app.get('/isloggedin', function(req, res){
	res.setHeader('Content-Type', 'application/json');
	var uservalid =  !(typeof req.user === "undefined");
	var user = (req.user || 'undefined');
	// console.log(req.user);
	// console.log('Current date', new Date(), 'Cookie expiery date', new Date(req.session.cookie['_expires']), "<>", req.session.cookie['_expires'], req.session.cookie )
	var timeleft = Math.abs(new Date(req.session.cookie['_expires']) - new Date(Date.now()))
	res.end(JSON.stringify({
		uservalid: uservalid,
		user: user,
		cookie: req.session,
		timeleft: timeleft
	}));
})

app.get('/logout', function(req, res){
  //add to log file
  	var logMessage = '\n' + 'Time:' + new Date() + ', User:' + req.user['username'] + ', Action:LOGOUT by User'
	fs.appendFile("logfiles/userLogin.txt", logMessage, function(err) {
	    if(err) {
	        console.log(err);
	    } else {
	        console.log('message appended:' + logMessage);
	    }
	}); 
	//logout and redirct index
  	req.logout();
  	res.redirect('/');
});

app.get('/api/v1/coffees', function (req, res) {
  coffee.find({}).toArray(function(err, docs){
    if (err) res.send(400, err)
     res.json({'coffees': docs});
  });
});

app.get("/api/v1/coffees/:id", function(req, res){
  coffee.find({'_id': new ObjectID(req.params.id)}).toArray(function(err, docs){
    res.json({'coffees': docs[0]})
  });
});
app.get("/api/v1/coffees/:id/gallery", function(req, res){
  coffee.find({'_id': new ObjectID(req.params.id)}).toArray(function(err, docs){
    res.json({'coffees': docs[0]})
  });
});
app.get("/api/v1/coffees/:id/reviews", function(req, res){
  coffee.find({'_id': new ObjectID(req.params.id)}).toArray(function(err, docs){
    console.log(req.params.id);
    console.log(docs);
    res.json({'coffees': docs[0]})
  });
});

//POST of a new coffee item
app.post('/api/v1/coffees', function (req, res) {
  //Get new coffee data
  var newCoffeeData = req.body.coffee
  //Build new coffee object
  var newCoffeeObj = {
    name : newCoffeeData.name,
    short_description : newCoffeeData.short_description,
    long_description : newCoffeeData.long_description,
    price : newCoffeeData.price,
    image : '',
    who_drinks_it: newCoffeeData.who_drinks_it,
    how_to_drink: newCoffeeData.how_to_drink,
    gallery: []
  }
  //Insert to database
  coffee.insert(newCoffeeObj, function(err){
    res.send(200);
  });
});

//PUT of coffee item edit
app.put("/api/v1/coffees/:id", function(req, res){
  var editedCoffeeObj = req.body.coffee
  // console.log(editedCoffeeObj);

  // coffee.save(editedCoffeeObj, function(){
  //   if (err) res.send(400, err);
  //   res.send(200);
  // })
  coffee.update({'_id': new ObjectID(req.params.id)}, editedCoffeeObj, function() {
    if (err) res.send(400, err);
    res.send(200);
  })
});

//DELETE of coffee item
app.delete("/api/v1/coffees/:id", function(req, res){
  coffee.remove({_id : new ObjectID(req.params.id)}, function(){
    if (err) res.send(400, err);
    res.send(200);
  })
});

app.listen(4242, function() {
  console.log('Express server listening on port 4242');
});

}); //mongo