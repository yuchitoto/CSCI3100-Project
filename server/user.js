const {fork} = require("child_process");
const sql = require("./connect_sql.js");

class User {
    constructor(data){
      this.data = data;
    }

    verify_password(callback){
      /* verify password and return id */
      const check = fork("connect_sql.js", ["find_user"]);
      check.send(JSON.stringify(this.data));

      check.on("message", m => {
        // handle message
        var msg = JSON.parse(m);
        console.log(msg);
        return msg.id;
      });
    }

    registor(callback){
      const check = fork("connect_sql.js", ["exist_user"]);
      check.send(JSON.stringify(this.data));

      check.on("message", m =>{
        /* handle message */
        if(m == 'exist_name' || m == 'exist_email'){
          callback(m);
        }
      })
    }

    login(callback){
      var id = this.verify_password();
      console.log("login");
      callback(0, {
        id: id,
      });
    }

    // logout(callback){
    //   // perform logout
    // }

    delete_user(callback){
      var id = this.verify_password();
      if(id == 0){

      }
      else{
        const del = fork("connect_sql.js", ["delete_user"]);
        del.send(this.data);
        del.on("message", m => {
          // handle message
        })
      }
      callback(/*msg*/);
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
