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
    /*parse parameter*/
    var key = "";
    const find = fork("connect_sql.js", ["search_post"]);
    find.send(JSON.stringify(key));

    find.on("message", m => {
      /*handle message*/
    });
  }

// post new posts
  post_post(title, content, codeID, callback)
  {
    var msg = {userid: this.userid, codeID:codeID, title:title, content:content, reply:0};
    const poster = fork("connect_sql.js", ["new_post"]);
    poster.send(JSON.stringify(msg));
    poster.on("message", m => {
      var tmp = JSON.parse(m);
      callback(m);
    });
  }

// post new replies
  post_reply(postID, content, callback)
  {
    /*send to mysql*/
  }

// delete reply or post
  delete(param, callback)
  {
    /*delete reply or post*/
  }

  /*advanced
  grading(postID, mark, callback)
  {
    //add grading
  }*/
}

module.exports = {Forum:Forum};
