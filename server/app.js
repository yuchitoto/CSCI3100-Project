/*express version*/
var express = require('express');
var app = express();
var http = require('http');
var url = require('url');
var fs = require('fs');
var {fork} = require('child_process');
var qs = require('querystring');
var session = require('express-session');
var cookieParser = require('cookie-parser');
var FileStore = require('nedb-session-store')(session);
var bdp = require('body-parser');

// import forum class
var forum = require('./forum');
let Forum = forum.Forum;
var user = require('./user');
let User = user.User;
var code = require('./code');
let Code = code.Code;

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
  },
}));
var sess;

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
app.use(bdp.urlencoded({extended:true}));
app.use(bdp.json());
app.use(function(req, res, next){
  res.locals.login = req.session.sign;
  res.locals.logout = false;
  next();
});

// prepare for homepage
app.get('/', function(req, res) {
  //console.log(req);
  res.render('mainpage');
});

// for online ide show code
app.get('/code', function(req, res) {
  /*get code*/
  //console.log(res);
  /*if(!Object.keys(req.query).includes('user'))
  {
    return res.redirect('/forum');
  }*/
  var coder = new Code();
  coder.fetch(req.query['code'], ret => {
    if(ret=="fail")
    {
      res.redirect('/404.html');
    }
    var tmp = {code:ret[0], action:""};
    res.render('code', tmp);
  });
});

app.get('/code/write', function(req, res) {
  if(!Object.keys(req.session).includes('ID'))
  {
    return res.redirect('/forum');
  }
  var codehold = {NAME:"", USER:req.session['ID'], SRC:"", BLK:""};
  var tmp = {code:codehold, action:""};
  res.render('write_code', tmp);
});

app.post('/code', function(req, res) {

  if(!Object.keys(req.session).includes('ID'))
  {
    var coder = new Code();
    if(req.body.action=='cpar')
    {
      coder.cpar(req.query['code'], msg => {
        var tmp = {res:msg, user:"", loc:req.query['code']};
        return res.render('code_result',tmp);
      });
    }
    return res.redirect('/404.html');
  }
  // previlleged actions
  var coder = new Code(req.session['ID']);
  /*save code*/
  // if return is success, indicates an update, not fail a new code
  if(req.body.action=='save')
  {
    coder.save(req.body.SRC, req.body.BLK, req.body.NAME, m => {
      if(m=='success')
      {
        return res.redirect(req.originalUrl);
      }
      else if(m != 'fail')
      {
        return res.redirect('/code?code='+m);
      }
      return res.redirect('/404.html');
    });
  }
  /*compile and run*/
  if(req.body.action=='sacpar')
  {
    coderT.sacpar(req.body.SRC, req.body.BLK, req.body.NAME, m => {
      if(m.loc=='success')
      {
        var tmp = {res:m.res, loc:req.query['code']};
        return res.render('code_result', tmp);
      }
      else if(m.loc != 'fail')
      {
        var tmp = {res:m.res, loc:m.loc};
        return res.render('code_result', tmp);
      }
      return res.redirect('/404.html');
    });
  }
});

app.delete('/code', function(req, res) {
  /*delete code from database*/
});

// for forum
app.get('/forum', function(req, res) {
  /*return forum page*/
  //console.log(req);
  var id = -1;
  var postID = 1;
  if(Object.keys(req.session).includes("ID"))
  {
    id = req.session['ID'];
  }
  var forumObj = new Forum(id);
  forumObj.titles(post => {
    //console.log(post);
    if(post=='fail')
    {
      return res.redirect("/404.html");
    }
    var user = "";
    if(id>0)
    {
      user = id.toString(10);
    }
    var tmp = {post:post, keywords:"", user:user};
    return res.render("forum", tmp);
  })
});

app.post('/forum/search', function(req, res) {
  // search engine
  var forumObj = new Forum(1);
  var key = req.body.keywords.split(" ");
  var dict = {existsTitle:[], inContext:[], user:[]};
  key.forEach((item, i) => {
    dict.existsTitle.push(item);
    dict.inContext.push(item);
    dict.user.push(item);
  });
  forumObj.search(dict, function(err, msg) {
    if(msg!='fail')
    {
      var tmp = {post:msg};
      return res.render('forum_search',tmp);
    }
    return res.redirect('/404.html');
  });
});

// for post
app.get('/post', function(req, res) {
  /*return post page*/
  console.log(req.query);
  var id = 0;
  var postID = 1;
  if(Object.keys(req.session).includes("ID"))
  {
    id = req.session['ID'];
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
    var user="";
    if(id>0)
    {
      user=id.toString(10);
    }
    var tmp = {post:post, CONTENT:"", url:req.originalUrl, keywords:""};
    return res.render('post', tmp);
  });
});

app.delete('/post', function(req, res) {
  /*delete post*/
  if(Object.keys(req.session).includes('ID'))
  {
    var forumObj = new Forum(req.session['ID']);
    forumObj.delete(req.query['post'], m => {
      if(!m)
      {
        return res.redirect('/404.html'); // no right to do the delete
      }
      return res.redirect('/forum');
    })
  }
  return res.redirect('/forum');
});

app.get('/post/new', function(req, res) {
  /* page to write new post */
  console.log('/post/new');
  if(!Object.keys(req.session).includes('ID'))
  {
    return res.redirect('/forum');
  }
  const coda = fork("connect_sql.js", ["all_code"]);
  coda.send(JSON.stringify({USER:req.session['ID']}));
  coda.on("message", msg => {
    // give all code to choose, and prepare for response
    if(msg=='fail')
    {
      res.redirect('/404.html');
    }
    var tmp = {
      newPost:[{TITLE:"", CONTENT:"", CODE:0}],
      codes:JSON.parse(msg)
    };
    res.render('new_post',tmp);
  });
});

app.post('/post', function(req, res) {
  /*new discussion or reply*/
  //console.log(req);
  if(!Object.keys(req.session).includes("ID"))
  {
    res.redirect(req.originalUrl);
  }
  var user = req.session['ID'];
  //console.log(req.query);
  //console.log(req.body);
  //console.log(user);
  var forumObj = new Forum(user);
  if(Object.keys(req.query).includes('post'))
  {
    forumObj.post_reply(req.query['post'], req.body.CONTENT, msg => {
      if(msg!="fail")
      {
        return res.redirect(req.originalUrl);
      }
      else
      {
        return res.redirect("/404.html"); //some error page
      }
    });
  }
  else
  {
    forumObj.post_post(req.body.TITLE, req.body.CONTENT, req.body.CODE, msg => {
      if(msg!="fail")
      {
        return res.redirect("/post?post="+msg);
      }
      else
      {
        return res.redirect("/404.html"); //some error page
      }
    });
  }
});

// for login page, auto redirect to user page or some other page after successful login

app.get('/login', function(req, res) {
  /*login page*/
  if(req.session.sign){
    console.log('login');
    console.log(req.session);
    res.redirect('/user');
  }
  else{
    res.render('login');
  }
});

app.post('/login', function(req, res) {
  /*authentication*/
  console.log("ok");
  console.log(req.body);
  if(req.session.sign){
    console.log("Already login");
    //res.send("Already login");
    console.log(req.session);
    res.redirect('user');
  }
  else if(req.body.password && (req.body.email || req.body.name)){
    var data;
    if(req.body.email == ''){
      data = {USERNAME: req.body.name, PASSWORD: req.body.password};
    }
    else data = {EMAIL: req.body.email, PASSWORD: req.body.password};
    var userObj = new User(data);
    console.log(data);
    userObj.login(function(err, user){
      if(err){
        console.log(err);
        return res.redirect('login');
      }
      else{
        sess = req.session;
        console.log(user);
        user = JSON.parse(user);
        console.log("Login success");
        sess.sign = true;
        sess.ID = user.ID;
        console.log(sess);
        //res.redirect('/user/' + user.name);
        return res.redirect('user');
      }
    })
  }
  else{
    res.render('login', {miss:true});
  };
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
      res.render('mainpage', {logout: true});
    })
  }
  else{
    console.log("did not login");
    res.redirect('/');
  }
});

// user pages
app.get('/user', function(req, res) {
  /*user data*/
  if(!Object.keys(req.session).includes('ID'))
  {
    return res.redirect('/');
  }
  const db1 = fork("connect_sql.js", ["fetch_code"]);
  const db2 = fork("connect_sql.js", ["find_user"]);
  db1.send(JSON.stringify({USER:req.session['ID']}));
  db1.on("message", msg => {
    if(msg=='fail')
    {
      return res.redirect('/');
    }
    db2.send(JSON.stringify({ID:req.session['ID']}));
    db2.on("message", msg2 => {
      if(msg2=="fail"||msg2=="no_user")
      {
        return res.redirect('/404.html');
      }
      var code = JSON.parse(msg);
      //console.log(code);
      //console.log(code.length);
      var tmp = {code:code, USERNAME:JSON.parse(msg2).USERNAME};
      return res.render('user', tmp);
    });
  });
});

app.put('/user', function(req, res) {
  /*update user data*/
});

app.delete('/user', function(req, res) {
  /*remove user*/
  const db = fork("connect_sql.js", ["delete_user"]);
  db.send(JSON.stringify({ID:req.query['user'], USERNAME:req.body.USERNAME}));
  db.on("message", msg => {
    if(msg)
    {
      return res.redirect('/');
    }
    return res.redirect('/404.html');
  })
});

// for account creation
app.get('/create_account*', function(req, res) {
  /*fetch account create page*/
  return res.render('create_account');
});

app.post('/create_account*', function(req, res) {
  /*create new account*/
  if(req.body.name && req.body.email && req.body.password){
    var data = {USERNAME: req.body.name, EMAIL: req.body.email, PASSWORD: req.body.password, ACC_TYPE: 0};
    var userObj = new User(data);
    userObj.registor(function(m){
      if(m == 'exist_email' || m == 'exist_name'){
        console.log(m);
        if(m == 'exist_email'){
          return res.render("create_account", {same_email: true});
        }
        else{
          return res.render("create_account", {same_name: true});
        }
      }
      else{
        console.log(m)
        console.log("registor success");
        return res.redirect('login');
      }
    })
  }
  else{
    res.render('create_account', {miss:true});
  };
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
        return response.redirect('404.html');
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
