var bodyParser = require('body-parser');
var express = require('express');
var app = express();

// redis example
var redis = require('redis');
var JSON = require('JSON');
var client = redis.createClient(6379, '127.0.0.1');

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));

// parse application/json
app.use(bodyParser.json());

app.use(function (req, res, next) {
    req.cache = client;
    next();
});

app.post('/profile', function (req, res, next) {
    req.accepts('application/json');

    var key = req.body.name;
    var value = JSON.stringify(req.body);

    req.cache.set(key, value, function (err, data) {
        if (err) {
            console.log(err);
            res.send("error " + err);
            return;
        }
        req.cache.expire(key, 10);
        res.json(value);
        console.log(value);
    });
});

app.get('/profile/:name', function (req, res, next) {
    var key = req.params.name;

    req.cache.get(key, function (err, data) {
        if (err) {
            console.log(err);
            res.send("error " + err);
            return;
        }

        var value = JSON.parse(data);
        res.json(value);
    });
});

module.exports = app;