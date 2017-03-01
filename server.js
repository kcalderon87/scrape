// Dependencies
var express = require('express');
var app = express();
var exphbs = require('express-handlebars');
var bodyParser = require('body-parser'); 
var Comment = require("./models/comment.js");
var Article = require("./models/article.js");


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.text());
app.use(bodyParser.json({type:'application/vnd.api+json'}));
require('./routes/routes.js')(app);
var PORT = process.env.PORT || 8080;

// mongoose configuration
var mongoose = require('mongoose');

//for local
mongoose.connect("mongodb://heroku_52bbbd5f:kuc9h0r3lupsdfljm9de4i3op5@ds163679.mlab.com:63679/heroku_52bbbd5f");
var db = mongoose.connection;

db.on('error', function(err) {
  console.log('Database Error:', err);
});

// Once logged in to the db, log a success message
db.once("open", function() {
  console.log("Connection successful");
});

//setting up handlebars
app.engine('handlebars', exphbs({defaultLayout: 'main'}));
app.set('view engine', 'handlebars');

app.use(express.static('public'));



// listen on port (8080)
app.listen(PORT, function(){
  console.log('App running on port: ', PORT)
});