const {fork} = require("child_process");
const sql = require("../connect_sql.js");

class Account {
    constructor(data){
      this.data = data;
    }

    verify_password(){
      /* verify password and return id */
      const check = fork("../connect_sql.js", ["find_user"]);
      check.send(JSON.stringify(this.data));

      check.on("message", m => {
        // handle message
      });
    }

    registor(callback){
      const check = fork("connect_sql.js", ["exist_user"]);
      check.send(JSON.stringify(this.data));

      check.on("message", m =>{
        /* handle message */
        if(m == 'exist_name'){
          callback(/*msg*/);
        }
        else if(m == 'exist_email'){
          callback(/*msg*/);
        }
      })
    }

    login(callback){
      var id = this.verify_password();
      callback(/*msg*/);
    }

    logout(callback){
      // perform logout
    }

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
}

module.exports = {Account:Account};
