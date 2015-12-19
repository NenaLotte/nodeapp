var express = require('express');
var router = express.Router();

/* GET the quote list */
router.get('/quotelist', function(req,res){
  var db = req.db;
  var collection = db.get('quotelist');
  collection.find({},{},function(e,docs){
    res.json(docs);
  });
});

/* POST a new quote to quotelist */
router.post('/addquote', function(req,res) {
  var db = req.db;
  var collection = db.get('quotelist');
  collection.insert(req.body, function(err, result){
    res.send(
      //If something goes wrong, we get the error from the database
      (err === null) ? { msg: ''} : {msg: err}
    );
  });
});

// DELETE to quotelist
router.delete('/deletequote/:id', function(req,res){
  var db = req.db;
  var collection = db.get('quotelist');
  var quoteToDelete = req.params.id;
  collection.remove({ '_id' : quoteToDelete }, function(err) {
    res.send((err === null) ? {msg: ''} : { msg:'error: ' + err });
  });
});


module.exports = router;
