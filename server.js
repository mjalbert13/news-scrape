var express = require('express');
var mongoose = require('mongoose');
var axios = require('axios');
var cheerio = require('cheerio');

var db = require('./models');

var PORT = 3000;

var app = express();

var MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost/mongoHeadlines";

mongoose.connect(MONGODB_URI);


app.use(express.urlencoded({extended: true}));
app.use(express.json());

app.use(express.static('public'));

mongoose.connect("mongodb://localhost/newsScrapeDB",{useNewUrlParser: true});
//routes
require('./routes/apiRouts')(app);

app.listen(PORT, function(){
    console.log("App is running on port "+PORT)
});