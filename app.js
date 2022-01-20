const express = require('express');
const morgan = require('morgan');
const methodOverride = require('method-override');
const connectionRoute = require('./routes/connectionRoute');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const flash = require('connect-flash');

const mainRoute = require('./routes/mainRoute');
const userRoutes = require('./routes/userRoutes');

const app = express();

let port = 3000;
let host = 'localhost';
app.set('view engine', 'ejs');

mongoose.connect('mongodb://localhost:27017/demos', {useNewUrlParser: true, useUnifiedTopology: true})
.then(() => {
    //start the server
app.listen(port, host, ()=>{
    console.log('Server is running on port', port);
});
})
.catch(err=>console.log(err.message));

app.use(session({
    secret: "asdfghjklqwerty",
    resave: false,
    saveUninitialized: false,
    store: new MongoStore({mongoUrl: 'mongodb://localhost:27017/demos'}),
    cookie: {maxAge: 60*60*1000}
}))

app.use(flash());

app.use((req, res, next) => {
    res.locals.user = req.session.user||null;
    res.locals.userName = req.session.userName||null;
    res.locals.errorMessages = req.flash('error');
    res.locals.successMessages = req.flash('success');
    next();
});

app.use(express.static('public'));
app.use(express.urlencoded({extended: true}));
app.use(morgan('tiny'));
app.use(methodOverride('_method'));

//set up routes
app.use('/', mainRoute);
app.use('/connections', connectionRoute);
app.use('/users', userRoutes);

app.use((req, res, next) => {
    let err = new Error('The server cannot locate '+req.url);
    err.status = 404;
    next(err);
});

app.use((err, req, res, next)=>{
    console.log(err.stack);
    if(!err.status) {
        err.status = 500;
        err.message = ("Internal Server Error");
    }
    res.status(err.status);
    res.render('error', {error: err});
});