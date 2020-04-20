const {fork} = require("child_process");

// forum definition
class Forum {
  constructor(userid) {
    this.userid = userid;
  }

// fetch post, return success of failure using 1st callback argument, and result array in 2nd
  fetch(postID, callback)
  {
    /*fetch json object list*/
    var msg;
    if (this.userID != 0)
    {
      msg = {USER:this.userid, ID:postID};
    }
    else {
      msg = {ID:postID};
    }

    const fetcher = fork("connect_sql.js", ["fetch_post"]);
    const code = fork("connect_sql.js", ["fetch_code"]);
    const user = fork("connect_sql.js", ["find_user"]);
    fetcher.send(JSON.stringify(msg));
    fetcher.on("message", m => {
      //console.log(m);
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
      return callback(m);
    });
  }

// post new replies, return success or fail
  post_reply(postID, content, callback)
  {
    /*send to mysql*/
    const data = {
      REPLY:postID,
      USER:this.userid,
      CONTENT:content
    };
    console.log(data);
    const eng = fork("connect_sql.js", ["new_post"]);
    eng.send(JSON.stringify(data));
    eng.on("message", msg => {return callback(msg);});
  }

// delete reply or post
  delete(id, callback)
  {
    /*delete reply or post*/
    const eng = fork("connect_sql.js", ["delete_post"]);
    eng.send({ID:id});
    eng.on("message", msg => {
      if(msg=="success")
      {
        return callback(true);
      }
      else {
        return callback(false);
      }
    });
  }

/*
return all posts that are not reply,
with username of author, title and create date and id
*/
  titles(callback)
  {
    const eng = fork("connect_sql.js", ["search_post_head"]);
    eng.send(JSON.stringify({existsTitle:[],user:[],inContext:[],id:[]}));
    eng.on("message", msg => {
      if(msg=='fail')
      {
        return callback('fail');
      }
      //console.log(msg);
      return callback(JSON.parse(msg));
    });
  }

  /*advanced
  grading(postID, mark, callback)
  {
    //add grading
  }*/
}

module.exports = {Forum:Forum};
