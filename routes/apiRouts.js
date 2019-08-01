var db = require('../models');
var axios =require('axios');
var cheerio = require('cheerio');

module.exports = function(app){
    
    app.get('/scrape', function(req, res){
       
        axios.get("https://www.pinkbike.com/").then(function(response){

            var $ = cheerio.load(response.data);

         $(".news-box2").each(function(i, elemeent){
            var results = {};

            results.headline = $(this).children(".f22").text();
            results.summary = $(this).children(".news-mt3").text();
            results.link = $(this).children(".f22").attr("href");

            db.Article.create(results).then(function(dbArticle){
                console.log(dbArticle);
            })
            .catch(function(err){
                console.log(err);
            });
        });
        res.redirect("/articles");
        });
    });

    app.get("/articles", function(req,res) {
        db.Article.find({})
        .then(function(dbArticle){
            res.json(dbArticle); 
        })
        .catch(function(err){
            res.json(err);
        });
    });

    app.get("/articles/:id", function(req, res){
        db.Article.findOne({__id: req.params.id})
        .populate("note")
        .then(function(dbArticle){
            res.json(dbArticle);
        })
        .catch(function(err){
            res.json(err);
        });
    });

    app.post("/articles/:id", function(req, res){
        db.Note.create(req.body)
        .then(function(note){
            return db.Article.findOneAndUpdate({__id: req.params}, {note: note._id}, {new: true});
        })
        .then(function(dbArticle){
            res.json(dbArticle);
        })
        .catch(function(err){
            res.json(err);
        });
    });

};