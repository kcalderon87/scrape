// ROUTES

var express = require('express');
var app = express();
var request = require("request");
var cheerio = require("cheerio");

var Comment = require("../models/comment.js");
var Article = require("../models/article.js");

var bodyParser = require('body-parser');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.text());
app.use(bodyParser.json({type:'application/vnd.api+json'}));
app.use(express.static('public'));

//mongoose
var mongoose = require('mongoose');
//for local
mongoose.connect("mongodb://heroku_52bbbd5f:kuc9h0r3lupsdfljm9de4i3op5@ds163679.mlab.com:63679/heroku_52bbbd5f");
var db = mongoose.connection;

db.on('error', function(err) {
  console.log('Database error:', err);
});

// Once logged in to the db, log a success message
db.once("open", function() {
  console.log("Connection successful");
});


module.exports = function(app){

		var i=0;

//cheerio scrape
app.get("/", function(req, res) {

	request('http://www.forbes.com/', function (error, response, html) {

            var $ = cheerio.load(html);

            $('h4.editable-hed').each(function(i, element){

            	var result = {};

            	result.title = $(this).children("a").text();
      			result.link = $(this).children("a").attr("href");
                var title = result.title;                
                var link = result.link;
                
                if (title && link) {
                  var ttl = {
                    title: title,                    
                    url: link,                    
                  }; 

                console.log(ttl);
                } 

		//directing 
		app.get('/index', function(req, res){
				res.redirect('/');

      // Using Article model
      	var entry = new Article(result);

      // saves entry to the db
      	entry.save(function(err, doc) {
        // Log any errors
        if (err) {
          console.log(err);
        }
        // Or log the doc
        else {
          console.log(doc);
        }
      });

    });
  });
});

		app.get('/', function(req, res){
				db.scrapedData.find({}, function(err, found) {
				    
				    // show errors
				    if (err) {
				    	console.log(err);
				    } 				    
				    else {
				    	var artLen = found.length;
					    res.render('index', {
							artTitle: found[i].title,							
							userComment: found[i].comment,
							id: found[i]._id,
							articleNum: i+1,
							totalArticles: artLen,
							urlLink:  found[i].url
						}); 
				    }
				}); 		
		}); 

		

		//add comment
		app.post('/addComment/:id', function(req, res){
				console.log('object id: ' + mongoose.ObjectId(req.params.id));
				console.log('req: ' + req.body.comment);
				var commentInput = new Comment(req.body.comment).trim();
				// if (commentInput) {
				// 		db.scrapedData.update({
				// 			'_id': mongoose.ObjectId(req.params.id)
				// 		}, {
				// 			$set: {
		  //     					comment: req.body.comment.trim()
		  //   				}
		  // 				}, 

				// 		function (err, edited) {
				// 			if (err) throw error;
				// 			res.redirect('/');
				// 		});	 // end db.scrapedData.update 		
				// } // end if
				
				// else {
				// 		console.log(commentInput)
				// 		res.redirect('/');	
				// } 

			// save the new comment the db
		  commentInput.save(function(error, doc) {
		    // Log any errors
		    if (error) {
		      console.log(error);
		    }
		    // Otherwise
		    else {
		      // article id to find and update it's note
		      Article.findOneAndUpdate({ "_id": req.params.id }, { "comment": doc._id })
		      // Execute the above query
		      .exec(function(err, doc) {
		        // Log any errors
		        if (err) {
		          console.log(err);
		        }
		        else {
		          // Or send the document to the browser
		          res.send(doc);
		        }
		      });
		    }
		  });

		}); 

		//delete comment
		app.post('/delComment/:id', function(req, res){
				db.scrapedData.update({
					'_id': mongoose.ObjectId(req.params.id)
				}, {
					$unset: {
      					comment: ""
    				}
  				}, 

				function (err, deleted) {
					if (err) throw error;
					res.redirect('/');
				});	
		}); 

		//previous news article
		app.get('/prevArticle', function(req, res){
				
				db.scrapedData.children({}, function(err, found) {
				    
				    // show any errors
				    if (err) {
				    	console.log(err);
				    } 				    
				    else {
						var artLen = found.length;
				    	if (i > 0){
							i--;
							res.redirect('/');
							}
				    }
				});
		}); 

		//next news article
		app.get('/nextArticle', function(req, res){
				
				db.scrapedData.children({}, function(err, found) {
				    
				    // show any errors
				    if (err) {
				    	console.log(err);
				    }				    
				    else {

				    	var artLen = found.length;
					    if (i < artLen-1){
							i++;
							res.redirect('/');
						}

				    }
				}); 	

		});

	});
};

