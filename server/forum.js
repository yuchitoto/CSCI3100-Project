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
    var msg = {userID:this.userid, postID:postID};
    const fetcher = fork("connect_sql.js", ["fetch_post"]);
    const code = fork("connect_sql.js", ["fetch_code"]);
    const user = fork("connect_sql.js", ["find_user"]);
    fetcher.send(JSON.stringify(msg));
    fetcher.on("message", m => {
      console.log(m);
      var post = JSON.parse(m);
      if(m=='fail')
      {
        callback(1, m);
      }
      var msg2 = {ID:post[0].CODE};
      console.log(msg2);
      code.send(JSON.stringify(msg2));
      code.on("message", n => {
        var cod = JSON.parse(n);
        if(n=="fail")
        {
          callback(1, m);
        }
        post[0].CODE = cod.SRC;
        var flag = 0;
        for(var i=0;i<post.length;i++)
        {
          user.send(JSON.stringify({ID:post[i].USER}));
          user.on("message", l => {
            var userdata = JSON.parse(l);
            console.log(userdata.USERNAME);
            post[i].USER = userdata.USERNAME;
            flag += 1;
          });
        }
        if(flag == post.length - 1)
        {
          callback(0, post);
        }
      });
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
