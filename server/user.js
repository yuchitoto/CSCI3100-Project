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
        console.log(msg[0]);
        return msg[0];
      });
    }

    registor(callback){
      const check = fork("connect_sql.js", ["new_user"]);
      check.send(JSON.stringify(this.data));

      check.on("message", m =>{
        /* handle message */
        return callback(m);
      });
    }

    login(callback){
      const check = fork("connect_sql.js", ["find_user"]);
      check.send(JSON.stringify(this.data));

      check.on("message", m => {
        if(m == "fail" || m == "no_user" || JSON.parse(m).length > 1){
          return callback(m, 0);
        }
        else if(this.data.USERNAME!=undefined && this.data.USERNAME!=JSON.parse(m)[0].USERNAME)
        {
          return callback("fail", 0);
        }
        else if(this.data.EMAIL!=undefined && this.data.EMAIL!=JSON.parse(m)[0].EMAIL)
        {
          return callback("fail", 0);
        }
        else if(this.data.PASSWORD != JSON.parse(m)[0].PASSWORD)
        {
          return callback("fail", 0);
        }
        else return callback(0, JSON.parse(m)[0]);
      })
    }

    delete_user(callback){
      const check = fork("connect_sql.js", ["find_user"]);
      check.send(JSON.stringify(this.data));

      check.on("message", m => {
        if(m == "fail"){
          return callback(m, 0);
        }
        else return callback(0, JSON.parse(m)[0]);
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
