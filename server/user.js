const {fork} = require("child_process");
const sql = require("./connect_sql.js");

class User {
    constructor(data){
      this.data = data;
    }

    verify_password(callback){
      /* verify password and return id */
      console.log(this.data);
      const check = fork("connect_sql.js", ["find_user"]);
      check.send(JSON.stringify(this.data));

      check.on("message", m => {
        // handle message
        console.log(m);
        var msg = JSON.parse(m);
        console.log(msg);
        return msg;
      });
    }

    registor(callback){
      const check = fork("connect_sql.js", ["new_user"]);
      check.send(JSON.stringify(this.data));

      check.on("message", m =>{
        /* handle message */
        return callback(m);
      })
    }

    login(callback){
      const check = fork("connect_sql.js", ["find_user"]);
      check.send(JSON.stringify(this.data));

      check.on("message", m => {
        if(m == "fail" || m == "no_user"){
          return callback(m, 0);
        }
        else return callback(0, m);
      })
    }

    delete_user(callback){
      const check = fork("connect_sql.js", ["find_user"]);
      check.send(JSON.stringify(this.data));

      check.on("message", m => {
        if(m == "fail"){
          return callback(m, 0);
        }
        else return callback(0, m);
      })
    }

    change_type(type, callback){
      this.data.AC_TYPE = type;
      const change = fork("connect_sql.js", ["change_type"]);
      change.send(this.data);
      change.on("message", m => {
        // handle message
      })
      callback(/*msg*/);
    }

    update(param, callback) {
      /* update user data */
    }

    verifyData(param, callback) {
      /* verify username and email to avoid duplication
      called upon ajax request
      callback: 2 boolean for email and username*/
    }
}

module.exports = {User:User};
