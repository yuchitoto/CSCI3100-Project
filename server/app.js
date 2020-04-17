/*express version*/
var express = require('express');
var app = express();
var http = require('http');
var url = require('url');
var fs = require('fs');
var fork = require('child_process');
var qs = require('querystring');
var session = require('express-session');
var cookieParser = require('cookie-parser');
var FileStore = require('nedb-session-store')(session);

// import forum class
var forum = require('./forum');
let Forum = forum.Forum;
var user = require('./user');
let User = user.User;

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

// setup session
app.use(cookieParser('codeblock'));
app.use(session({
  name: 'codeblockidesession',
  secret: 'iamarandomstring',
  store: new FileStore(),
  saveUninitialized: false,
  resave: false,
  cookie: {
    maxAge: 24 * 60 * 60 * 1000
  }
}))
var sess;

app.get('/login', function(req, res) {
  /*login page*/
  if(req.session.sign){
    console.log('login');
    console.log(req.session);
    res.redirect('/user/' + req.session.name + '.html');
  }
  else{
    res.redirect('/hello_world.html');
  }
});

app.post('/login', function(req, res) {
  /*authentication*/
  req.params.name = 'hello';
  req.params.password = 'byebye';
  console.log(req.params);
  console.log(req.session);
  console.log("ok");
  if(req.session.sign){
    console.log("Already login");
    //res.send("Already login");
    console.log(req.session);
    res.redirect('/user/' + req.session.name + '.html');
  }
  else if(req.params.name && req.params.password){
    var userObj = new User(req.params);
    userObj.login(function(err, user){
      if(err){
        console.log(err);
        res.redirect('/hello_world.html');
      }
      else{
        sess = req.session;
        console.log("Login success");
        sess.sign = true;
        sess.id = user.id;
        sess.name = user.name;
        console.log(sess);
        //res.redirect('/user/' + user.name);
        res.redirect('/hello_world.html')
      }
    })
  }
});

// user logout
app.get('/logout', function(req, res){
  console.log(req.session);
  if(req.session.sign){
    req.session.destroy((err)=>{
      if(err){
        console.log(err);
      }
      console.log("logout successfully");
      console.log(req.session);
      res.redirect('/login.html');
    })
  }
  else{
    console.log("did not login");
    res.redirect('/login.html');
  }
})

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
//app.use(express.static(__dirname + '/public'));

app.use('*.png|*.jpg', function(req, res) {
  //console.log(req);
  var pthnm = './'+req._parsedUrl.pathname;
  fs.readFile(pthnm,function(err, data) {
    if(err)
    {
      console.log(`error: ${err.message}`);
      return res.end();
    }
    var cont = 'image/';
    if (pthnm.includes('.png'))
    {
      cont += 'png';
    }
    else if(pthnm.includes('.jpg'))
    {
      cont += 'jpeg';
    }
    res.writeHead(200, {'Content-Type':cont});
    res.write(data);
    return res.end();
  });
});

app.use('*.css', function(req, res) {
  fs.readFile('./'+req._parsedUrl.pathname,function(err, data) {
    if(err)
    {
      console.log(`error: ${err.message}`);
      return res.end();
    }
    res.writeHead(200, {'Content-Type':'text/css'});
    res.write(data);
    return res.end();
  });
});

httpServer.listen(8080);
