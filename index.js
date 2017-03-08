var express = require('express');
var handlebars = require('express-handlebars');
var MongoClient = require('mongodb').MongoClient;
var bodyParser = require('body-parser');


//create app and database variable
var app = express();
var db;

//body parser
app.use(bodyParser.urlencoded({extended: true}));


//handlebars
app.engine('handlebars', handlebars({
  defaultLayout: 'main'
}));
app.set('view engine', 'handlebars');



//connect to database
MongoClient.connect('mongodb://naztyBoi:testing123@ds121980.mlab.com:21980/armygame', function(err, database){

  if (err) return console.log(err);

  db = database;
  app.listen(process.env.PORT || 3000);
});



//homepage
app.get('/', function(req, res) {
  db.collection("armies").find({}).toArray(function(err, results){
    res.render('home', {armies: results});
  });
});



//view army
app.get('/armies/:name', function(req, res) {
  db.collection("armies").findOne({name: req.params.name}, function(err, result) {
    if (err) console.log(err);
    res.render('army', {
    	army: result, 
    	
    	//using math helper found at http://jsfiddle.net/mpetrovich/wMmHS/  and modified slightly for express
    	helpers: {
            math: function (lvalue, operator, rvalue, options) { 
            	lvalue = parseFloat(lvalue);
    			rvalue = parseFloat(rvalue);
        
    			return {
       				"+": parseFloat(lvalue + rvalue).toFixed(0),
        			"-": parseFloat(lvalue - rvalue).toFixed(0),
        			"*": parseFloat(lvalue * rvalue).toFixed(0),
        			"/": parseFloat(lvalue / rvalue).toFixed(0),
        			"%": parseFloat(lvalue % rvalue).toFixed(0)
    			}[operator]; },
    		

        }});
  });
});




//add army
app.get('/addarmy', function(req, res) {
  res.render('add_army');
});


app.post('/addarmy', function(req, res) {
  var army = {
    name: req.body.name.trim(),
    country: req.body.country.trim(),
    leader: req.body.leader.trim(),
    size: req.body.size.trim(),
    leadTitle: req.body.leadTitle.trim(),
  };
  
  if (army.name != '' && army.country != '' && army.leader != '' && army.size != '') {
    db.collection('armies').insert(army, function(err, result){
      res.redirect('/');
    });
  } else {
    res.render('add_army', {message: 'Please enter a valid army', army: req.body});
  }
});





//delete army
app.get('/armies/:name/delete', function(req, res) {
  db.collection("armies").remove({name: req.params.name}, function(err, result) {
    res.redirect('/');
  });
});

//edit army
app.post('/armies/:name', function(req, res) {
  db.collection("armies").updateOne({name: req.params.name}, {$set: {country: req.body.country, leader: req.body.leader, size: req.body.size, leadTitle: req.body.leadTitle}}, function(err, result) {
    res.redirect('/');
  }); 
});

app.get('/armies/:name/edit', function(req, res) {
  db.collection("armies").findOne({name: req.params.name}, function(err, result) {
    if (err) console.log(err);
    res.render('edit_army', {army: result});
  });
});