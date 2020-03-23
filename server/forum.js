const {fork} = require("child_process");
const sql = require("connect_sql.js");

class Forum {
  constructor(user) {
    this.username = user;
    this.userid;
    sql.userID(JSON.stringify(user), res => {this.userid = res;});
  }

  search(param, callback)
  {
    /*pase parameter*/
    var key = "";
    const find = fork("connect_sql.js", ["search_post"]);
    find.send(JSON.stringify(key));

    find.on("message", m => {
      /*handle message*/
    });
  }

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

  post_reply(postID, content, callback)
  {
    /*send to mysql*/
  }

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
