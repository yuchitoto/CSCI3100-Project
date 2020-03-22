/*express version*/
var express = require('express');
var app = express();
var http = require('http');
var url = require('url');
var fs = require('fs');
var {fork} = require('child_process');
var qs = require('querystring');

app.get('/', function(req, res) {
  console.log(req);
  res.send("Hello world");
});

app.get('/code*', function(req, res) {
  /*get code*/
});

app.post('/code*', function(req, res) {
  /*save code*/
  /*compile and run*/
});

app.delete('/code*', function(req, res) {
  /*delete code from database*/
});

app.get('/forum*', function(req, res) {
  /*return forum page*/
});

app.post('/forum*', function(req, res) {
  /*new discussion or reply*/
});

app.delete('/forum*', function(req, res) {
  /*delete post*/
});

app.get('/login', function(req, res) {
  /*login page*/
});

app.post('/login', function(req, res) {
  /*authentication*/
});

app.get('/user/*', function(req, res) {
  /*user data*/
});

app.put('/user/*', function(req, res) {
  /*update user data*/
});

app.delete('/user/*', function(req, res) {
  /*remove user*/
});

app.get('/hello_world.html', function(req, res) {
  fs.readFile('./html/hello_world.html', function(err, data) {
    if(err)
    {
      res.writeHead(404, {'Content-Type':'text/html'});
      return res.end("404 Not Found");
    }
    res.writeHead(200, {'Content-Type':'text/html'});
    res.write(data);
    return res.end();
  });
});

var server = app.listen(8000);
