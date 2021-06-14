const mongoose = require('mongoose'),
      Book     = require('../models/book');

authorSchema = new mongoose.Schema({
    name:{
        type: String,
        required: true
    }
});

authorSchema.pre('remove', function(next){
    Book.find({ author: this.id }, function(err, books){
        if(err)
            next(err);
        else if(books.length > 0)
            next(new Error('This author has existing books. Deletion is not possible.'));
        else    
            next();
    });
});

module.exports = mongoose.model("Author", authorSchema);