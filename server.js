if(process.env.NODE_ENV !== "production"){
    require('dotenv').config();
}

const express = require('express'),
      expressLayout = require('express-ejs-layouts'),
      mongoose = require('mongoose');
      app = express();

const indexRouter = require('./routes/index');

app.set("view engine", "ejs");
app.set("views", __dirname + "/views");
app.set("layout", "/layouts/layout");
app.use(expressLayout);
app.use(express.static("public"));

//db setup
mongoose.connect(process.env.DATABASE_URL, {useNewUrlParser: true});
const db = mongoose.connection;
db.on('error', error => console.error(error));
db.once('open', () => console.log("Connected to mongoose"));


//routes
app.use('/', indexRouter);

app.listen(process.env.PORT || 3000, () => {
    console.log("The server has started");
});  
