/*
  MODULE TO HANDLE HTTP REQUESTS

  PROGRAMMER: YU CHI TO, Lee Tsz Yan
  VERSION: 2.1.0 (10-5-2020)

  Purpose:
  Handles http request of the codeblock IDE from http(8080) and https(8443)
  Provides as a controller to redirect the server to handle different request using different modules
  Checks upon login session from user and render corresponding pages using ejs

  Dependencies:
    express
    http
    https
    url
    fs
    child_process
    querystring
    express-session
    cookie-parser
    nedb-session-store
    body-parser
    forum
    user
    code
*/
var express = require('express');
var app = express();
var http = require('http');
var https = require('https');
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

var hskey = fs.readFileSync('key.pem');
var hscert = fs.readFileSync('cert.pem');
var credentials = {
  key:hskey,
  cert:hscert,
  passphrase:"CSCI3100GRP18"
};
var httpsServer = https.createServer(credentials, app);

// use embedded javascript as html template generator
app.set('view engine', 'ejs');
app.use(bdp.urlencoded({extended:true}));
app.use(bdp.json());
app.use(function(req, res, next){
  res.locals.login = req.session.sign;
  next();
});

// prepare for homepage
app.get('/', function(req, res) {
  //console.log(req);
  return res.render('mainpage');
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
  coder.fetch({ID:req.query['code']}, ret => {
    if(ret=="fail")
    {
      return res.redirect('/404.html');
    }
    var tmp = {code:ret[0], action:"", stdin:""};
    return res.render('code', tmp);
  });
});

app.get('/code/write', function(req, res) {
  if(!Object.keys(req.session).includes('ID'))
  {
    return res.redirect('/login');
  }
  var codehold = {NAME:"", USER:req.session['ID'], SRC:"", BLK:""};
  var tmp = {code:codehold, action:""};
  return res.render('Workspace', tmp);
});

app.post('/code', function(req, res) {
  console.log(req.body);
  console.log(`action on code: ${req.body.action}`);
  const coder = new Code((req.session['ID'])?req.session['ID']:0);
  var stdin = req.body.stdin;

  if(req.body.action=='cpar')
  {
    coder.cpar(req.query['code'], stdin, msg => {
      var tmp = {res:msg, loc:req.query['code']};

      return res.render('code_result',tmp);
    });
  }

  if(!Object.keys(req.session).includes('ID') && req.body.action!='cpar')
  {
    console.log(req.session);
    return res.redirect('/404.html');
  }
  // previlleged actions

  /*save code*/
  // if return is success, indicates an update, not fail a new code
  if(req.body.action=='save')
  {
    coder.save(req.body.SRC, "nothing", req.body.NAME, m => {
      if(m=='success')
      {
        coder.fetch({USER:req.session['ID'], NAME:req.body.NAME}, codec => {
          if(codec!='fail')
          {
            var tmp = {code:codec[0], action:""};
            return res.render('code',tmp);
          }
          return res.redirect('/404.html');
        });
      }
      else if(m != 'fail')
      {
        return res.redirect('/code?code='+m);
      }
      else
        return res.redirect('/404.html');
    });
  }
  /*compile and run*/
  if(req.body.action=='sacpar')
  {
    coderT.sacpar(req.body.SRC, "nothing", req.body.NAME, m => {
      if(m.loc=='success')
      {
        var tmp = {res:m.res, loc:req.query['code']};
        return res.render('code_result', tmp);
      }
      else if(m.loc != 'fail')
      {
        var tmp = {res:m.res, loc:m.loc, action:""};
        return res.render('code_result', tmp);
      }
      return res.redirect('/404.html');
    });
  }
});

app.delete('/code', function(req, res) {
  /*delete code from database*/
  if(!Object.keys(req.session).includes('ID'))
  {
    console.log("not logged in");
    return res.redirect('/');
  }
  if(!Object.keys(req.query).includes('code'))
  {
    console.log("no code id");
    return res.redirect('/');
  }
  var deleter = fork("./connect_sql.js",["delete_code"]);
  deleter.send(JSON.stringify({USER:req.session['ID'], ID:req.query['code']}));
  deleter.on("message", msg => {
    if(msg=="fail")
    {
      return res.redirect('/404.html');
    }
    return res.redirect('/');
  })
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
  console.log("GET post");
  //console.log(req.query);
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
  console.log("delete post");
  //console.log(req.query);
  if(Object.keys(req.session).includes('ID'))
  {
    var forumObj = new Forum(req.session['ID']);
    forumObj.delete(req.query['post'], m => {
      //console.log(m);
      if(m=="fail")
      {
        console.log("delete post failed");
        return res.status(400).send(); // no right to do the delete
      }
      console.log("delete post success");
      return res.status(200).send();
    });
  }
  return res.status(200).send();
});

app.get('/post/new', function(req, res) {
  /* page to write new post */
  console.log('/post/new');
  if(!Object.keys(req.session).includes('ID'))
  {
    return res.redirect('/login');
  }
  const coda = fork("connect_sql.js", ["all_code"]);
  coda.send(JSON.stringify({USER:req.session['ID']}));
  coda.on("message", msg => {
    // give all code to choose, and prepare for response
    if(msg=='fail')
    {
      return res.redirect('/404.html');
    }
    var tmp = {
      newPost:[{TITLE:"", CONTENT:"", CODE:0}],
      codes:JSON.parse(msg)
    };
    return res.render('new_post',tmp);
  });
});

app.post('/post', function(req, res) {
  /*new discussion or reply*/
  //console.log(req);
  if(!Object.keys(req.session).includes("ID"))
  {
    return res.redirect('/login');
  }
  var user = req.session['ID'];
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
    return res.redirect('/user');
  }
  else{
    return res.render('login');
  }
});

app.post('/login', function(req, res) {
  /*authentication*/
  if(req.session.sign){
    console.log("Already login");
    //res.send("Already login");
    console.log(req.session);
    return res.redirect('user');
  }
  else if(req.body.password && req.body.name){
    var data;
    if(req.body.name.includes('@')){
      data = {EMAIL: req.body.email, PASSWORD: req.body.password};
    }
    else data = {USERNAME: req.body.name, PASSWORD: req.body.password};
    var userObj = new User(data);
    console.log(data);
    userObj.login(function(err, user){
      if(err){
        console.log(err);
        return res.render('login', {no_user:true});
      }
      else{
        sess = req.session;
        console.log(user);
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
    return res.redirect("404.html");
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
      console.log("logout success");
      console.log(req.session);
      return res.redirect('logout');
    })
  }
  else{
    console.log("did not login");
    return res.redirect('/');
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
  const posts = new Forum(req.session['ID']);
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
      msg2 = JSON.parse(msg2)[0];
      //console.log(msg2);
      //console.log(code);
      //console.log(code.length);
      if (msg2["ACC_TYPE"]==0)
      {
        posts.titles(function(post_title) {
        var post = [];
        if (post_title=='fail')
        {
          console.log("failed to fetch titles");
          //console.log(post_title);
          var tmp = {code:code, USERNAME:msg2.USERNAME, post:post};
          return res.render('user',tmp);
        }
        var tmp = {code:code, USERNAME:msg2.USERNAME, post:post_title};
        return res.render('user', tmp);
        });
      }
      else if(msg2["ACC_TYPE"]==1)
      {
        posts.titles(function(post_title) {
        var post = [];
        if (post_title=='fail')
        {
          console.log("failed to fetch titles");
          //console.log(post_title);
          var tmp = {code:code, USERNAME:msg2.USERNAME, post:post};
          return res.render('user',tmp);
        }
        const search = fork("connect_sql", ["find_user"]);
        search.send(JSON.stringify({GROUP:msg2["GROUP"]}));
        search.on("message", msg3 => {
          if(msg3=="fail"||msg3=="no_user")
          {
            console.log("failed to find group");
            var tmp = {code:code, USERNAME:msg2.USERNAME, post:post};
            return res.render('user',tmp);
          }
          var student = JSON.parse(msg3);
          //console.log(student);
          var tmp = {code:code, USERNAME:msg2.USERNAME, post:post_title, students:student};
          return res.render('teacher',tmp)
        });
        });
      }
    });
  });
});

app.get('/student', function(req, res) {
  if(!Object.keys(req.session).includes('ID'))
  {
    return res.redirect('/');
  }
  const authen = fork("connect_sql", ["find_user"]);
  authen.send(JSON.stringify({ID:req.session['ID']}));
  authen.on("message", au => {
    if (au=="fail"||au=="no_user"||JSON.parse(au)[0]['ACC_TYPE']!=1)
    {
      return res.redirect('/user');
    }
    const db1 = fork("connect_sql.js", ["fetch_code"]);
    const db2 = fork("connect_sql.js", ["find_user"]);
    const post = new Forum();
    db1.send(JSON.stringify({USER:req.query['user']}));
    db1.on("message", msg=>{
      if(msg=='fail')
      {
        return res.redirect('/');
      }
      db2.send(JSON.stringify({ID:req.query['user']}));
      db2.on("message", msg2 => {
        if(msg2=="fail"||msg2=="no_user")
        {
          return res.redirect('/404.html');
        }
        var code = JSON.parse(msg);
        msg2 = JSON.parse(msg2)[0];
        //console.log(msg2);
        //console.log(code);
        //console.log(code.length);
        post.titles(function(post_title) {
        var post = [];
        if (post_title=='fail')
        {
          console.log("failed to fetch titles");
          //console.log(post_title);
          var tmp = {code:code, USERNAME:msg2.USERNAME, post:post};
          return res.render('student',tmp);
        }
        var tmp = {code:code, USERNAME:msg2.USERNAME, post:post_title};
        return res.render('student', tmp);
        });
    });
  });
});
});

app.post('/change_password', function(req, res) {
  /*update user data*/
  if(!Object.keys(req.session).includes('ID'))
  {
    return res.redirect('/');
  }
  const db = fork("connect_sql.js", ["update_user"]);
  db.send(JSON.stringify({ID:req.session['ID'], PASSWORD:req.body.password}));
  db.on("message", msg => {
    if(msg){
      //console.log(msg);
      return res.redirect('/user'); //shd create new page
    }
    return res.redirect('/404.html');
  })
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
  if(req.session.sign){
    console.log('login');
    console.log(req.session);
    return res.redirect('/user');
  }
  return res.render('create_account');
});

app.post('/create_account*', function(req, res) {
  /*create new account*/
  if(req.body.name && req.body.email && req.body.password && req.body.retype_password){
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
    return res.render('create_account');
  };
});

app.get('/change_password', function(req, res) {
  /*login page*/
  // if(!req.session.sign){
  //   return res.redirect('/404.html');
  // }
  // else{
  //   return res.render('change_password');
  // }
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
      return res.render('change_password', tmp);
    });
  });
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
  console.log(req._parsedUrl['path']);
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
httpsServer.listen(8443);
