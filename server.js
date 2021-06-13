if(process.env.NODE_ENV !== "production"){
    require('dotenv').config();
}

const express = require('express'),
      expressLayout = require('express-ejs-layouts'),
      mongoose = require('mongoose'),
      bodyParser = require('body-parser'),
      app = express();

const indexRouter = require('./routes/index');
const authorRouter = require('./routes/author');

app.set("view engine", "ejs");
app.set("views", __dirname + "/views");
app.set("layout", "./layouts/layout");
app.use(expressLayout);
app.use(express.static("public"));
app.use(bodyParser.urlencoded({limit: "10mb", extended: false}));

//db setup
mongoose.connect(process.env.DATABASE_URL, {useNewUrlParser: true});
const db = mongoose.connection;
db.on('error', error => console.error(error));
db.once('open', () => console.log("Connected to mongoose"));


//routes
app.use('/', indexRouter);
app.use('/authors', authorRouter);

app.listen(process.env.PORT || 3000, () => {
    console.log("The server has started");
});  