require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const ejs = require("ejs");
const ObjectId = require('mongodb').ObjectID;
const bcrypt = require('bcrypt');

const app = express();

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static('public'));

const mongoose = require('mongoose');
let uri = `mongodb+srv://${process.env.CLUSTER_USERNAME}:${process.env.CLUSTER_PASSWORD}@chatappcluster.txlsi.mongodb.net/chatappDb?retryWrites=true&w=majority`;
mongoose.connect(uri, {useNewUrlParser: true, useUnifiedTopology: true});

const saltRounds = 10;

const userSchema = new mongoose.Schema({
    name: String,
    email: String,
    password: String,
    phone: Number,
    messages: [{type: ObjectId, ref: 'messageSchema'}]
});

const messageSchema = new mongoose.Schema({
    from: {type: ObjectId, ref: 'userSchema'},
    to: {type: ObjectId, ref: 'userSchema'},
    content: String
});

const User = mongoose.model('User', userSchema);
const Message = mongoose.model('Message', messageSchema);

app.listen(process.env.PORT || 3000, function () {
    console.log("Server started on port 3000");
});

app.get("/", (_req, res) => {
    res.render("register")
})

app.get("/register", (_req, res) => {
    res.render("register");
})

app.post("/register", (req, res) => {
    bcrypt.hash(req.body.password, saltRounds, (err, hash) => {
        if (err) return console.error(err);
        const user = new User({
            name: req.body.name,
            email: req.body.email,
            password: hash,
            phone: req.body.phone
        })
        user.save((err, doc) => {
            if (err) return console.error(err);
            console.log("User saved successfully!");
        });
    });

    res.redirect("/");
})

app.get("/login", (_req, res) => {
    res.render("login");
})

app.post("/login", (req, res) => {
    User.find({email: req.body.email}, (err, doc) => {
        if (err) return console.error(err);
        doc.forEach(user => {
            bcrypt.compare(req.body.password, user.password, function(err, result) {
                if (err) return console.error(err);
                if (result) res.redirect("/");
            });
        })
    });
})
