const fs = require('fs');

const mysql = require('mysql');
var myArgs = process.argv.slice(2);
const qs = require('querystring');

/*
methods use parsed data
functions handles raw JSON
*/

class MySQLDatabase {
  constructor(table) {
    this.connection = mysql.createConnection({
      "host":"sql12.freesqldatabase.com",
      "port":3306,
      "user":"sql12328565",
      "password":"kQjmPhHsgA",
      "database":"sql12328565"
    });
    this.table = table;
  }

  insert(values, callback) {
    var query = "INSERT INTO ? SET ?";
    this.connection.query(query, [this.table, values], function(err, data) {
      callback(err, data);
    });
  }

  select_when_all_true(params, callback) {
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
      callback(err, data);
    });
  }

  delete_when_all_true(cond, callback) {
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
      callback(err, data);
    });
  }

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
      pr.push({[key[i]]:values[i]});
    }
    this.connection.query(query, pr, function(err, data) {
      callback(err, data);
    });
  }
}

function getFilesizeInBytes(filename) {
    var stats = fs.statSync(filename);
    var fileSizeInBytes = stats["size"];
    return fileSizeInBytes;
}

class SRC_CODE extends MySQLDatabase {
  constructor() {
    super(SRC_CODE);
  }

  validate_save(param, callback) {
    const query = "SELECT COUNT(*) FROM SRC_CODE WHERE USRE=? AND NAME=?";
    this.connection.query(query, [param.USER, param.NAME], function(err, data) {
      if(err)
      {
        console.log(`error ${err.message}`);
        return false;
      }
      if(result[0]>1)
      {
        return false;
      }
      return true;
    });
  }

  save_code(values, callback) {
    this.insert(values, function(err, data) {
      callback(err, data);
    });
  }

  fetch_code(data, callback) {
    this.select_when_all_true(data, function(err, data) {
      callback(err, data);
    });
  }

  delete_code(data, callback) {
    /*use parsed data to delete*/
  }
}

class USER extends MySQLDatabase {
  constructor() {
    super("USER");
  }

  new_user(data, callback) {
    /*new user*/
  }

  exist_name(data, callback) {
    /*check if exists same name*/
  }

  exist_email(data, callback) {
    /*check if exists email*/
  }

  find_user(data, callback) {
    //find user
  }

  verify_password(data, callback) {
    //verify password
  }

  delete_user(data, callback) {
    //remove user
  }

  userID(data, callback) {
    //return userID on callback
  }
}

class POST extends MySQLDatabase {
  constructor() {
    super("POST");
  }

  newPost(data, callback) {
    //insert new post or reply
  }

  fetchPost(data, callback) {
    //fetch post
  }

  deletePost(data, callback) {
    //delete reply or post and replies
  }

  searchPost(data, callback) {
    //parse keywords into sql database
  }

  /*updateGrade(data, callback) {
    //update grade
  }

  calculateGrade(postID, callback) {
    //calc grade for post
  }*/
}

const connection = mysql.createConnection({
  "host":"sql12.freesqldatabase.com",
  "port":3306,
  "user":"sql12328565",
  "password":"kQjmPhHsgA",
  "database":"sql12328565"
});

function validate_save() {
  const username = myArgs[0];
  const filename = myArgs[1];
  const query = "SELECT COUNT(*) FROM SRC_CODE WHERE USRE=? AND NAME=?";
  connection.query(query, [username, filename], function (err, result) {
    if(err)
    {
      console.log(`error ${err.message}`);
      return -1;
    }
    if(result[0]>1)
    {
      return -1;
    }
    return result[0];
  })
}

function save_code(param, num, callback) {
  const data = JSON.parse(param);
  var path = "../tmp_data/"+username+"__"+filename;
  var values = {
    USER:data.username,
    NAME:data.filename,
    SRC:data.src,
    SRC_SZ:data.src_sz,
    BLK:data.blk,
    BLK_SZ:data.blk_sz
  };
  if(num==0)
  {
    const query = "INSERT INTO SRC_CODE SET?";
    connection.query(query,values, function(er, da) {
      callback(er, da);});
  }
  else if(num==1)
  {
    const query = "UPDATE SRC_CODE WHERE ? AND ? SET ?, ?, ?, ?";
    connection.query(query, values, function(er, da) {
      callback(er, da);
    });
  }
}

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

function delete_code(param, callback)
{
  /*delete code also delete all posts related*/
}

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

function exist_email(data)
{
  const datan = qs.parse(data);
  const query = "SELECT EMAIL FROM USER WHERE ?";

  values = {EMAIL:datan.email};

  connection.query(query, values, function(err, row, reply){
    if(err){
      throw err;
    }
    return row
  });
}

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

function verify_password(user){
  // verify password
}

function delete_user(id){
  // delete given id in USER
  // receive id
}

function new_post(param, callback)
{
  //assume take on userid, title, content, reply(0 for new post), code id
  const data = JSON.parse(param);
  const query2 = "INSERT INTO POST SET ?";
  connection.query(query2, data, function(err, res) {
    if(err)
    {
      callback(err, 0);
    }
    callback(err, res);
  })
}

function fetch_post(param, callback)
{
  /*if id or reply = post id ret json array of post*/
  const data = JSON.parse(param);
  const query = "SELECT * FROM POST WHERE ? OR ?";
  connection.query(query, [{ID:data.postID}, {REPLY:data.postID}], function(err, data) {
    callback(err, data);
  });
}

function delete_post(param, callback)
{
  /*delete all post if is post head, else single*/
}

function search_post(param, callback)
{
  /*search post head*/
}

function userID(param, callback)
{
  /*ret user id*/
}

/*advanced
function updateGrade(param, callback)
{

}*/

process.on('message', m => {
  console.log(myArgs[0]);
  console.log(m);
  if(myArgs[0]=='save_code')
  {
    validate_save(m, r => {
      if(r<0)
      {
        return process.send('fail');
      }
      save_code(m, r, function(err, res) {
        if(err)
        {
          return process.send('fail');
        }
        return process.send('success');
      });
    });
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
    fetch_post(m, function(err, data) {
      if(err)
      {
        console.log(`error: ${err.message}`);
        return process.send('fail');
      }
      return process.send(JSON.stringify(data));
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
})
