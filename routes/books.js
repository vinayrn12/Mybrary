const Book = require('../models/book'),
      Author = require("../models/author"),
      multer = require('multer'),
      path = require('path'),
      fs = require('fs'),
      uploadPath = path.join('public', Book.coverImgBasePath),
      express   =   require('express'),
      imageMimeTypes = ['image/jpeg', 'image/png', 'images/gif'],
      router    =   express.Router(),
      upload    =   multer({
            dest: uploadPath,
            fileFilter: (req, file, callback) => {
                callback(null, imageMimeTypes.includes(file.mimetype))
            }
      })


router.get('/', async (req, res) => {
    let query = Book.find();
    if(req.query.title != null && req.query.title != "")
        query = query.regex('title', new RegExp(req.query.title, 'i'));
    if(req.query.publishedBefore != null && req.query.publishedBefore != "")
        query = query.lte('publishedDate', req.query.publishedBefore);
    if(req.query.publishedAfter != null && req.query.publishedAfter != "")
        query = query.gte('publishedDate', req.query.publishedAfter);
    try{
        const books = await query.exec();
        res.render('books/index', {
            books: books,
            searchOptions: req.query
        });
    }
    catch{
        res.redirect('/');
    }
});

router.get('/new', async (req, res) => {
   renderNewPage(res, new Book());
});

router.post('/', upload.single('cover'), async (req, res) => {
    const fileName = req.file != null ? req.file.filename : null;
    const book = new Book({
        title: req.body.title,
        author: req.body.author,
        publishedDate: new Date(req.body.publishedDate),
        pageCount: req.body.pageCount,
        coverImageName: fileName,
        description: req.body.description
    });
    try{
        const newBook = await book.save(); 
        res.redirect('/books');
    }
    catch{
        if(book.coverImageName != null)
            removebookCover(book.coverImageName);
        renderNewPage(res, book, true);
    }
});

function removebookCover(fileName){
    fs.unlink(path.join(uploadPath, fileName), err => {
        if(err)
            console.log(err);
    });
}

async function renderNewPage(res, book, hasError = false){
    try{
        const authors = await Author.find({});
        const params = {
            authors: authors, 
            book: book
        }
        if(hasError) params.errorMessage = "Error creating book";
        res.render("books/new", params);
    }
    catch{
        res.redirect('/books');
    }
}

module.exports = router;