
// Require mongoose
var mongoose = require("mongoose");
// schema class
var Schema = mongoose.Schema;

// Comment schema
var CommentSchema = new Schema({
  // string
  title: {
    type: String
  },
  // string
  body: {
    type: String
  }
});

// Comment model
var Comment = mongoose.model("Comment", CommentSchema);

// Export the Note model
module.exports = Comment;