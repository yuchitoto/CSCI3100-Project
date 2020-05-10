/*
  MODULE FOR USER INFORMATION MANIPULATION

  CLASS NAME: User
  PROGRAMMER: Lee Tsz Yan

  Purpose:
  Provides an interface to communicate between master module (app.js) and slave module (connect_sql.js) for manipulation on user information
  Allows verification, registration and update of user account

  Dependencies:
  child_process
  connect_sql
*/
const {fork} = require("child_process");
//const sql = require("./connect_sql.js");

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

    updateUser(val, cond, callback) {
      /* update user data */
      this.data.ID = param.ID;
      const db = fork("connect_sql,js", ["update_user"]);
      db.send(JSON.stringify(this.data));
      db.on("message", m => {
        return callback(m);
      })
    }

    verifyData(param, callback) {
      /* verify username and email to avoid duplication
      called upon ajax request
      callback: 2 boolean for email and username*/
    }
}

module.exports = {User:User};
