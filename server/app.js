/*express version*/
var express = require('express');
var app = express();
var http = require('http');
var url = require('url');
var fs = require('fs');
var fork = require('child_process');
var qs = require('querystring');

// import forum class
var forum = require('./forum');
let Forum = forum.Forum;

// direct to php parser
var execPHP = require('./php_parser.js')();

function get_not_found(callback) {
  // returning html file of 404 page
  fs.readFile('./html/404.html', function(err, data) {
    if(err) {
      console.log(`error: ${err.message}`);
      callback("<html><head><title>404 Not Found</title></head><body><p>404 not found</p></body></html>");
    }
    callback(data.toString('utf8'));
  });
}

// setting up server not by using express directly so that htpps may be handled
var httpServer = http.createServer(app);

// use embedded javascript as html template generator
app.set('view engine', 'ejs');

// prepare for homepage
app.get('/', function(req, res) {
  console.log(req);
  res.redirect('/hello_world.html');
});

// for online ide
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

// for forum
app.get('/forum*', function(req, res) {
  /*return forum page*/
  console.log(req.params);
  var id = 0;
  var postID = 1;
  if(Object.keys(req.query).includes("user"))
  {
    id = req.query['user'];
  }
  if(Object.keys(req.query).includes("post"))
  {
    postID = req.query['post'];
  }
  var forumObj = new Forum(id);
  forumObj.fetch(postID, function(err, post) {
    if(err)
    {
      console.log("failed to find post");
      return res.redirect("/404.html");
    }
    var tmp = {post:post};
    return res.render('forum', tmp);
  });
});

// for post
app.get('/post*', function(req, res) {
  /*return post page*/
  console.log(req.params);
  var id = 0;
  var postID = 1;
  if(Object.keys(req.query).includes("user"))
  {
    id = req.query['user'];
  }
  if(Object.keys(req.query).includes("post"))
  {
    postID = req.query['post'];
  }
  var forumObj = new Forum(id);
  forumObj.fetch(postID, function(err, post) {
    if(err)
    {
      console.log("failed to find post");
      return res.redirect("/404.html");
    }
    var tmp = {post:post};
    return res.render('post', tmp);
  });
});

app.post('/post*', function(req, res) {
  /*new discussion or reply*/
});

app.delete('/post*', function(req, res) {
  /*delete post*/
});

// for login page, auto redirect to user page or some other page after successful login
app.get('/login', function(req, res) {
  /*login page*/
});

app.post('/login', function(req, res) {
  /*authentication*/
});

// user pages
app.get('/user/*', function(req, res) {
  /*user data*/
});

app.put('/user/*', function(req, res) {
  /*update user data*/
});

app.delete('/user/*', function(req, res) {
  /*remove user*/
});

// for account creation
app.get('/create_account*', function(req, res) {
  /*fetch account create page*/
});

app.post('/create_account*', function(req, res) {
  /*create new account*/
});

// general treatnebt for html pages
app.use('*.html', function(req, res, next) {
  //console.log(req.headers); use headers to detect mobile
  var path = './html'+req._parsedUrl.pathname;
  console.log(path);
  fs.readFile(path, function(err, data) {
    if(err)
    {
      console.log(`error: ${err.message}`);
      return res.redirect('/404.html');
      /*res.writeHead(404, {'Content-Type':'text/html'});
      return res.end("404 Not Found");*/
    }
    res.writeHead(200, {'Content-Type':'text/html'});
    res.write(data);
    return res.end();
  });
});

// send javascript for front-end
app.use('*.js', function(req, res, next) {
  var path = './script'+req._parsedUrl.pathname;
  console.log(path);
  fs.readFile(path, function(err, data) {
    if(err)
    {
      console.log(err.message);
      return res.end();
    }
    return res.end(data);
  });
});

// handle php file
//ammended from https://medium.com/@MartinMouritzen/how-to-run-php-in-node-js-and-why-you-probably-shouldnt-do-that-fb12abe955b0
app.use('*.php',function(request,response,next) {
  fs.readFile('./views'+request._parsedUrl.pathname, function(err, data) {
    if(err)
    {
      console.log(`error: ${err.message}`);
      return response.redirect('/404.html');
    }
    execPHP.parseFile(request.originalUrl, [], function(err, phpResult, stderr) {
      if(err) {
        console.log(`error: ${err.message}`);
        response.writeHead(200, {'Content-Type':'text/html'});
        return response.end("404 not found");
      }
      if(stderr) {
        console.log(`error: ${stderr}`);
        return response.redirect('/404.html');
      }
      response.writeHead(200, {'Content-Type':'text/html'});
  		response.write(phpResult);
  		return response.end();
  	});
  });
});
//a path for static files
app.use(express.static(__dirname + '/public'));

app.get('*.png|*.jpg', function(req, res) {
  //console.log(req);
  fs.readFile(req._parsedUrl.pathname, function(err, data) {
    if(err)
    {
      console.log(`error: ${err.message}`);
      return res.end();
    }
    var cont = 'image/';
    if (res.pathname.includes('.png'))
    {
      cont += 'png';
    }
    else if(res.pathname.includes('.jpg'))
    {
      cont += 'jpeg';
    }
    res.write(200, {'Content-Type':cont});
    res.write(data);
    return res.end();
  });
});

httpServer.listen(8080);
