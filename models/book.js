const mongoose = require('mongoose'),
      path = require('path');

const coverImgBasePath = 'uploads/bookCovers';

bookSchema = new mongoose.Schema({
    title:{
        type: String,
        required: true
    },
    description:{
        type: String
    },
    publishedDate:{
        type: Date,
        required: true
    },
    pageCount:{
        type: Number,
        required: true
    },
    createdAt:{
        type: Date,
        default: Date.now,
        required: true
    },
    coverImageName:{
        type: String,
        required: true
    },
    author:{
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Author'
    }
});

bookSchema.virtual('coverImagePath').get(function(){
    if(this.coverImageName != null)
        return path.join('/', coverImgBasePath, this.coverImageName);
});

module.exports = mongoose.model("Book", bookSchema);
module.exports.coverImgBasePath = coverImgBasePath;