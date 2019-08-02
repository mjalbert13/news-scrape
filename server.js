var express = require('express');
var mongoose = require('mongoose');
var exphbs = require("express-handlebars");
var hbs = require('handlebars');
var axios = require('axios');
var cheerio = require('cheerio')

var db = require('./models');

var PORT = 3000;

var app = express();

var MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost/mongoHeadlines";

mongoose.connect(MONGODB_URI,{useNewUrlParser: true});

app.use(express.urlencoded({extended: true}));
app.use(express.json());

//handle bars
app.engine("handlebars", exphbs({defaultLayout: "main"}));
app.set("view engine", "handlebars");

app.use(express.static('public'));


hbs.registerHelper('each_upto', function(ary, max, options) {
    if(!ary || ary.length == 0)
        return options.inverse(this);
  
    var result = [ ];
    for(var i = 0; i < max && i < ary.length; ++i)
        result.push(options.fn(ary[i]));
    return result.join('');
});

//routes
//require('./routes/apiRouts')(app);

app.get('/scrape', function(req, res){
       
    axios.get("https://www.pinkbike.com/").then(function(response){

        var $ = cheerio.load(response.data);

     $(".news-box2").each(function(i, elemeent){
        var results = {};

        results.headline = $(this).children(".f22").text().trim();
        results.summary = $(this).children(".news-mt3").text().trim();
        results.link = $(this).children(".f22").attr("href");

        db.Article.create(results).then(function(dbArticle){
            console.log(dbArticle);
        })
        .catch(function(err){
            console.log(err);
        });
    });
    res.send("scrape complete");
    res.redirect("/");
    });
});

app.get("/", function(req,res) {
    db.Article.find({})
    .then(function(dbArticle){
        var hbsObj = {
            articles: dbArticle
        };
        res.render("index", hbsObj);
    })
    .catch(function(err){
        res.json(err);
    });
});

app.get("/getNotes/:id", function(req, res){
    db.Article.findOne({__id: req.params.id})
    .populate("note")
    .then(function(dbArticle){
        res.json(dbArticle);
    })
    .catch(function(err){
        res.json(err);
    });
});

app.post("/createNote/:id", function(req, res){
    db.Note.create(req.body)
    .then(function(dbNote){
        return db.Article.findOneAndUpdate({__id:req.params.id},{note: dbNote._id},{new:true});
    })
    .then(function(dbArticle){
        res.json(dbArticle);
    })
    .catch(function(err){
        res.json(err);
    })
})

app.get("/saved", function(req,res){
    db.Article.find({saved: true})
    .then(function(dbArticle){
        var hbsObj ={
            articles: dbArticle
        }
        res.render("saved", hbsObj);
    })
    .catch(function(err){
        res.json(err);
    });
});

app.post("/save/:id", function(req, res){
    db.Article.update({__id: req.params.id},{$set: {saved: true}})
    .then(function(dbArticle){
        res.json(dbArticle)
    })
    .catch(function(err){
        res.json(err);
    });
});

app.listen(PORT, function(){
    console.log("App is running on port "+PORT)
});