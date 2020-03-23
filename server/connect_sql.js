const fs = require('fs');

const mysql = require('mysql');
var myArgs = process.argv.slice(2);
const qs = require('querystring');

const connection = mysql.createConnection({
  "host":"sql12.freesqldatabase.com",
  "port":3306,
  "user":"sql12328565",
  "password":"kQjmPhHsgA",
  "database":"sql12328565"
});

function getFilesizeInBytes(filename) {
    var stats = fs.statSync(filename);
    var fileSizeInBytes = stats["size"];
    return fileSizeInBytes;
}

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
      callback(er, da);
  }
  else if(num==1)
  {
    const query = "UPDATE SRC_CODE WHERE ? AND ? SET ?, ?, ?, ?";
    connection.query(query, values, function(er, da) {
      callback(er, da);
    })
  }
}

function fetch_code(param, callback) {
  const data = JSON.parse(param);
  const username = data.username;
  const filename = data.filename;
  console.log(`param: ${username} ${filename}`);
  const sql = "SELECT * FROM SRC_CODE WHERE USER=? AND NAME=?";
  connection.query(sql, [username, filename], function (err, result) {
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
}

function fetch_post(param, callback)
{
  /*if id or reply = post id ret json array of post*/
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
  else if(myArgs[0]=='new_user')
  {
    new_user(m, id => {
      if(id==0){
        return process.send('fail');
      }
      return process.send(id);
    });
  }
})
