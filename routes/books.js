const Book = require('../models/book'),
      Author = require("../models/author"),
      express   =   require('express'),
      imageMimeTypes = ['image/jpeg', 'image/png', 'images/gif'],
      router    =   express.Router();


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

router.post('/', async (req, res) => {
    const book = new Book({
        title: req.body.title,
        author: req.body.author,
        publishedDate: new Date(req.body.publishedDate),
        pageCount: req.body.pageCount,
        description: req.body.description
    });
    saveCover(book, req.body.cover);
    try{
        const newBook = await book.save(); 
        res.redirect(`/books/${newBook.id}`);
    }
    catch{
        renderNewPage(res, book, true);
    }
});

router.get('/:id', async (req, res) => {
    try{
        const book = await Book.findById(req.params.id).populate('author').exec();
        res.render('books/show', {book: book});
    }
    catch{
        res.redirect('/books');
    }
});

router.get('/:id/edit', async (req, res) => {
    try{
        const book = await Book.findById(req.params.id);
        renderEditPage(res, book);
    }
    catch{
        res.redirect('/');
    }
});

router.put('/:id', async (req, res) => {
    let book;
    try{
        book = await Book.findById(req.params.id);
        book.title = req.body.title;
        book.author = req.body.author;
        book.publishedDate = new Date(req.body.publishedDate);
        book.pageCount = req.body.pageCount;
        book.description = req.body.description; 
        if(req.body.cover != null && req.body.cover != '')
            saveCover(book, req.body.cover);
        await book.save();
        res.redirect(`/books/${book.id}`);
    }
    catch{
        if(book != null)
            renderEditPage(res, book, true);
        else
            res.redirect('/');
    }
});

router.delete('/:id', async (req, res) => {
    let book;
    try{
        book = await Book.findById(req.params.id);
        await book.remove();
        res.redirect('/');
    }
    catch{
        if(book != null)
            res.render('book/show', {book:book, errorMessage:'Error deleting book'});
        else
            res.redirect('/');
    }
});

function saveCover(book, coverEncoded){
    if(coverEncoded == null)
        return;
    const cover = JSON.parse(coverEncoded);
    if(cover != null && imageMimeTypes.includes(cover.type)){
        book.coverImage = new Buffer.from(cover.data, 'base64');
        book.coverImageType = cover.type;
    }
}

async function renderNewPage(res, book, hasError=false){
    renderFormPage(res, book, 'new', hasError);
}

async function renderEditPage(res, book, hasError=false){
    renderFormPage(res, book, 'edit', hasError);
}

async function renderFormPage(res, book, form, hasError = false){
    try{
        const authors = await Author.find({});
        const params = {
            authors: authors, 
            book: book
        }
        if(hasError){
            if(form == 'edit')
                params.errorMessage = "Error editing book";
            else
                params.errorMessage = "Error creating book";
        }
        res.render(`books/${form}`, params);
    }
    catch{
        res.redirect('/books');
    }
}

module.exports = router;