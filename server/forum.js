const {fork} = require("child_process");

// forum definition
class Forum {
  constructor(userid) {
    this.userid = userid;
  }

// fetch post, needs modification
  fetch(postID, callback)
  {
    /*fetch json object list*/
    var msg;
    if (this.userID != 0)
    {
      msg = {USER:this.userID, ID:postID};
    }
    else {
      msg = {ID:postID};
    }

    const fetcher = fork("connect_sql.js", ["fetch_post"]);
    const code = fork("connect_sql.js", ["fetch_code"]);
    const user = fork("connect_sql.js", ["find_user"]);
    fetcher.send(JSON.stringify(msg));
    fetcher.on("message", m => {
      console.log(m);
      if(m=='fail')
      {
        return callback(1, m);
      }
      return callback(0, JSON.parse(m));
    });
  }

// to search post and return titles
  search(param, callback)
  {
    var finde = JSON.parse(param);
    /*parse parameter*/
    var key = {exactTitle:finde[exactTitle], existsTitle:finde[existsTitle], user:finde[user], inContext:finde[inContext], exactContext:finde[exactContext]};
    const find = fork("connect_sql.js", ["search_post"]);
    find.send(JSON.stringify(key));

    find.on("message", m => {
      /*handle message*/
      const parsed = JSON.parse(m);
      if(parsed=='fail')
      {
        return callback(1, m);
      }
      return callback(0, m);
    });
  }

// post new posts
  post_post(title, content, codeID, callback)
  {
    var msg = {USER: this.userid, CODE:codeID, TITLE:title, CONTENT:content, REPLY:0};
    const poster = fork("connect_sql.js", ["new_post"]);
    poster.send(JSON.stringify(msg));
    poster.on("message", m => {
      var tmp = JSON.parse(m);
      return callback(m);
    });
  }

// post new replies
  post_reply(postID, content, callback)
  {
    /*send to mysql*/
    const data = {
      REPLY:postID,
      USER:this.userID,
      CONTENT:content
    };
    const eng = fork("connect_sql.js", ["new_post"]);
    eng.send(JSON.parse(data));
    eng.on("message", msg => {return callback(msg);});
  }

// delete reply or post
  delete(param, callback)
  {
    /*delete reply or post*/
  }

  titles(callback)
  {
    const eng = fork("connect_sql.js", ["search_post_head"]);
    eng.send(JSON.parse({existsTitle:[],user:[],inContext:[],id:[]}));
    eng.on("message", msg => {
      return callback(msg);
    });
  }

  /*advanced
  grading(postID, mark, callback)
  {
    //add grading
  }*/
}

module.exports = {Forum:Forum};
