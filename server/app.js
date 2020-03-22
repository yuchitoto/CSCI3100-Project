/*not likly to use*/
var express = require('express');
var app = express();
const fs = require('fs');

app.get('/', function(req, res) {
  console.log(req);
  res.send("Hello world");
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
