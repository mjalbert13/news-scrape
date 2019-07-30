var mongoose =require('mongoose');
var Schema = mongoose.Schema;

var ArticleSchema = new Schema({
    headline:{
        type: String,
        required: true
    },
    summary: {
        tpye: String,
        required: false
    },
    link: {
        tpye: String,
        required: false
    },
    note: {
        type: Schema.Types.ObjectId,
        ref: "Note"
    }
});

var Article = mongoose.model('Article', ArticleSchema);
module.exports = Article;