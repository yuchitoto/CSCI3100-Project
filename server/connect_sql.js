const fs = require('fs');

const mysql = require('mysql');
var myArgs = process.argv.slice(2);
const qs = require('querystring');

/*
methods use parsed data
functions handles raw JSON
*/

// base class for specific database table accessing using mysql
class MySQLDatabase {
  constructor(table) {
    this.connection = mysql.createConnection({
      "host":"localhost",
      "port":3306,
      "user":"csci3100grp18",
      "password":"csci3100#Grp18",
      "database":"CSCI3100GRP18"
    });
    this.table = table;
  }

  insert(values, callback) {
    var query = "INSERT INTO ? SET ?";
    this.connection.query(query, [this.table, values], function(err, data) {
      return callback(err, data);
    });
  }

  selectWhenAllTrue(params, callback) {
    var query = "SELECT * FROM ? WHERE ?";
    const key = Object.keys(params);
    const value = Object.values(param);
    var pr = [this.table];
    for(var i=0; i<key.length;i++)
    {
      if(i>0) {
        query += " AND ?";
      }
      pr.push({[key[i]]:value[i]});
    }
    this.connection.query(query, pr, function(err, data) {
      return callback(err, data);
    });
  }

  deleteWhenAllTrue(cond, callback) {
    var query = "DELETE FROM ? WHERE ?";
    const key = Object.keys(cond);
    const value = Object.values(cond);
    var pr = [this.table];
    for(var i=0;i<key.length;i++)
    {
      if(i>0)
      {
        query += " AND ?";
      }
      pr.push({[key[i]]:value[i]});
    }
    this.connection.query(query, pr, function(err, data) {
      return callback(err, data);
    });
  }

  // universal update statement, problematic when 2nd level is obj
  update(val, cond, callback) {
    var query = "UPDATE ? SET ? WHERE ?";
    const key = Object.keys(cond);
    const value = Object.values(cond);
    var pr = [this.table, val];
    for (var i=0;i<key.length;i++)
    {
      if(i>0)
      {
        query += " AND ?";
      }
      pr.push({[key[i]]:value[i]});
    }
    console.log(pr);
    this.connection.query(query, pr, function(err, data) {
      if(err) console.log('error');
      return callback(err, data);
    });
  }
}

/*
// calculating size of file
function getFilesizeInBytes(filename) {
    var stats = fs.statSync(filename);
    var fileSizeInBytes = stats["size"];
    return fileSizeInBytes;
}
*/

// mysql table SRC_CODE
class SRC_CODE extends MySQLDatabase {
  constructor() {
    super('SRC_CODE');
  }

  validateSave(param, callback) {
    // ensures no duplication and check for whether new file or updates
    const query = "SELECT COUNT(*) FROM SRC_CODE WHERE USER=? AND NAME=?";
    this.connection.query(query, [param.USER, param.NAME], function(err, data) {
      if(err)
      {
        console.log(`error ${err.message}`);
        return callback(-1);
      }
      if(data[0]>1)
      {
        return callback(-1);
      }
      return callback(data[0]);
    });
  }

  newCode(values, callback) {
    //save entry to database
    this.insert(values, function(err, res) {
      return callback(err, res);
    });
  }

  fetchCode(data, callback) {
    //fetch entry from database
    this.selectWhenAllTrue(data, function(err, data) {
      return callback(err, data);
    });
  }

  deleteCode(data, callback) {
    /*use parsed data to delete*/
    this.delete(data, function(err, data) {
      return callback(err, data);
    });
  }

  updateCode(data, callback) {
    // update entry
    this.update(data, {USER:data.USER, NAME:data.NAME}, function(err, res) {
      return callback(err, res);
    });
    /*const query = "UPDATE SRC_CODE SET ? WHERE USER=? AND NAME=?";
    this.connection.query(query, [data, data.USER, data.NAME], function(err, res) {
      return callback(err, res);
    });*/
  }

  saveCode(data, callback) {
    // basic handler for updating or saving code entry
    console.log(data);
    this.validateSave(data, tmpres => {
      if(tmpres['COUNT(*)'] < 0)
      {
        return callback('fail');
      }
      else if(tmpres['COUNT(*)'] == 0)
      {
        this.newCode(data, function(err, res) {
          if(err) {
            console.log(`error: ${err.message}`);
            return callback('fail');
          }
          console.log(res);
          return callback('success');
        });
      }
      else if (tmpres['COUNT(*)'] == 1) {
        this.updateCode(data, function(err, res) {
          if(err) {
            console.log(`error: ${err.message}`);
            return callback('fail');
          }
          console.log(res);
          return callback('success');
        });
      }
      else
      return callback('fail');
    });
  }
}

// mysql table USER
class USER extends MySQLDatabase {
  constructor() {
    super("USER");
  }

  newUser(data, callback) {
    /*new user*/
    const query = "INSERT INTO USER SET ?";
    this.connection.query(query, data, function(err, num) {
      if(err)
      {
        console.log(`error: ${err.message}`);
        return callback(-1);
      }
      this.userID(data, function(error, num) {
        if(error)
        {
          console.log(`error: ${error.message}`);
          return callback(-1);
        }
        return callback(num);
      });
    });
  }

  existName(data, callback) {
    /*check if exists same name*/
    this.selectWhenAllTrue({USERNAME:data.NAME}, function(err, data) {
      if(err) {
        console.log(`error: ${err.message}`);
        return callback(-1);
      }
      return callback(data.length);
    });
  }

  existEmail(data, callback) {
    /*check if exists email*/
    this.selectWhenAllTrue({EMAIL:data.EMAIL}, function(err, data) {
      if(err) {
        console.log(`error: ${err.message}`);
        return callback(-1);
      }
      return callback(data.length);
    });
  }

  findUser(data, callback) {
    //find user
    this.selectWhenAllTrue(data, function(err, data) {
      if(err) {
        return callback(null);
      }
      return callback(data);
    });
  }

  verifyPassword(data, callback) {
    //verify password
  }

  deleteUser(data, callback) {
    //remove user
  }

  userID(data, callback) {
    //return userID on callback
    this.selectWhenAllTrue(data, function(err, data) {
      if(err) {
        return callback(-1);
      }
      if(data.length != 1) {
        return callback(-1);
      }
      return callback(data[0].ID);
    });
  }
}

// mysql table POST
class POST extends MySQLDatabase {
  constructor() {
    super("POST");
  }

  newPost(data, callback) {
    //insert new post or reply
    this.insert(data, function(err, data) {
      if(err)
      {
        return callback(false);
      }
      return callback(true);
    });
  }

  fetchPostHead(id, callback) {
    const queryhead = "SELECT c.USERNAME AS USER, a.TITLE, a.CONTENT, b.SRC AS CODE FROM POST a, SRC_CODE b, USER c WHERE a.ID=? AND a.USER=c.ID AND a.CODE=b.ID";
    this.connection.query(queryhead, id, function(err1, hd) {
      if(err1) {
        console.log(`error: ${err1.message}`);
        return callback('fail');
      }
      callback(hd);
    });
  }

  fetchReply(id, callback) {
    const queryreply = "SELECT c.USERNAME AS USER, a.CONTENT FROM POST a, USER c WHERE a.REPLY=? AND a.USER=c.ID ORDER BY a.ID ASC";
    this.connection.query(queryreply, id, function(err2, rep) {
      if(err2) {
        console.log(`error: ${err2.message}`);
        return callback('fail');
      }
      return callback(rep);
    });
  }

  fetchPost(id, callback) {
    // fetch post
    // special solution used instead of general method inherited
    this.fetchPostHead(id, msg1=> {
      if(msg1=='fail') {
        return callback(msg1);
      }
      this.fetchReply(id, msg2 => {
        if(msg2=='fail')
        {
          return callback(msg2);
        }
        return callback(msg1.concat(msg2));
      })
    })
  }

  deletePost(data, callback) {
    //delete reply or post and replies
  }

  searchPost(data, callback) {
    //parse keywords into sql database
  }

// planned advanced feature
  /*updateGrade(data, callback) {
    //update grade
  }

  calculateGrade(postID, callback) {
    //calc grade for post
  }*/
}

// to be removed
const connection = mysql.createConnection({
  "host":"localhost",
  "port":3306,
  "user":"csci3100grp18",
  "password":"csci3100#Grp18",
  "database":"CSCI3100GRP18"
});

const userT = new USER();
const codeT = new SRC_CODE();
const postT = new POST();

// function caller upon message invoke, handles JSON here

// saveCode wrapper
function save_code(param, callback) {
  const data = JSON.parse(param);

  codeT.saveCode(data, m => {callback(m);});
}

// fetchCode wrapper
function fetch_code(param, callback) {
  const data = JSON.parse(param);
  var sql = "SELECT * FROM SRC_CODE WHERE ?";
  var pr = [];
  var tmp1 = Object.keys(data);
  var tmp2 = Object.values(data);
  for (var i=0;i<tmp1.length;i++)
  {
    if (i>0){
      sql += " AND ?";
    }
    var tmp3 = tmp1[i];
    var tmp4 = tmp2[i];
    pr.push({[tmp3]:tmp4});
  }
  console.log(pr);
  connection.query(sql, pr, function (err, result) {
    result[0].SRC = result[0].SRC.toString('utf8');
    callback(err, result[0]);
  });
}

// deleteCode wrapper
function delete_code(param, callback)
{
  /*delete code also delete all posts related*/
}

// newUser wrapper
function new_user(data, callback)
{
  const datan = qs.parse(data);
  const query1 = "INSERT INTO USER SET ?",
  values = {
    USERNAME:datan.USERNAME,
    EMAIL:datan.EMAIL,
    PASSWORD_HASH:datan.PASSWORD_HASH,
    AC_TYPE:datan.AC_TYPE,
    GROUP:datan.GROUP,
    DESCRIPTION:datan.DESCRIPTION,
    IS_PUBLIC:datan.IS_PUBLIC
  };
  const query2 = "SELECT ID FROM USER WHERE?";
  connection.query(query1, values, function(err, num) {
    if(err)
    {
      callback(0);
    }
    connection.query(query2,values, function(error, data) {
      if(error)
      {
        callback(0);
      }
      callback(data[0]);
    });
  });
}

// existName wrapper
function exist_name(data)
{
  const datan = qs.parse(data);
  const query = "SELECT USERNAME FROM USER WHERE ?";

  values = {USERNAME:datan.name};

  connection.query(query, values, function(err, row, reply){
    if(err){
      throw err;
    }
    return row;
  });
}

// existEmail wrapper
function exist_email(data, callback)
{
  const datan = qs.parse(data);
  userT.existEmail(datan, msg => {return callback(msg);});
}

// findUser wrapper
function find_user(param, callback){
  // find user from database
  const data = JSON.parse(param);
  var sql = "SELECT * FROM USER WHERE ?";
  var pr = [];
  const tmp1 = Object.keys(data);
  const tmp2 = Object.values(data);
  for(var i=0;i<tmp1.length;i++)
  {
    if(i>0)
    {
      sql += " AND ?";
    }
    pr.push({[tmp1[i]]:tmp2[i]});
  }
  connection.query(sql, pr, function(err, data) {
    console.log(data[0]);
    callback(err, data[0]);
  });
}

// verifyPassword wrapper
function verify_password(user){
  // verify password
}

// deleteUser wrapper
function delete_user(param, callback){
  // delete given id in USER
  // receive id
  const data = JSON.parse(param);
  userT.deleteUser(data, msg => {return callback(msg);});
}

// newPost wrapper
function new_post(param, callback)
{
  //assume take on userid, title, content, reply(0 for new post), code id
  const data = JSON.parse(param);
  postT.newPost(data, msg => {return callback(msg);});
}

// fetchPost wrapper
function fetch_post(param, callback)
{
  /*if id or reply = post id ret json array of post*/
  const data = JSON.parse(param);
  postT.fetchPost(data.ID, msg => {return callback(msg);});
}

//deletePost wrapper
function delete_post(param, callback)
{
  /*delete all post if is post head, else single*/
}

// searchPost wrapper
function search_post(param, callback)
{
  /*search post head*/
}

// userID wrapper
function userID(param, callback)
{
  /*ret user id*/
}

/*advanced
function updateGrade(param, callback)
{

}*/

// invoke wrapper upon message
process.on('message', m => {
  console.log(myArgs[0]);
  if(myArgs[0]=='save_code')
  {
    save_code(m, res => {process.send(res);});
  }
  else if(myArgs[0]=='fetch_code')
  {
    fetch_code(m, function(err, data) {
      var result = JSON.stringify(data);
      if(err){
        console.log(err);
        return process.send('fail');
      }
      return process.send(result);
    });
  }
  else if(myArgs[0]=='exist_user')
  {
    if(exist_name(m) != 0){
      process.send('exist_name');
    }
    else if(exist_email(m) != 0){
      process.send('exist_email');
    }
    else {
      process.send('success');
    }
  }
  else if(myArgs[0]=='new_user')
  {
    new_user(m, id => {
      if(id==0){
        return process.send('fail');
      }
      return process.send(id);
    });
  }
  else if (myArgs[0]=='fetch_post') {
    fetch_post(m, res => {
      if(res=='fail')
      {
        return process.send('fail');
      }
      return process.send(JSON.stringify(res));
    });
  }
  else if (myArgs[0]=='find_user') {
    find_user(m, function(err, data) {
      if(err)
      {
        return process.send('fail');
      }
      return process.send(JSON.stringify(data));
    });
  }
});

// export class definition
module.exports = {SRC_CODE:SRC_CODE, POST:POST, USER:USER};
