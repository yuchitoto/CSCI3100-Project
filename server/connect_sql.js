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
      return false;
    }
    if(result[0]>0)
    {
      return false;
    }
    return true;
  })
}

function save_code(param, callback) {
  const data = JSON.parse(param);
  var path = "../tmp_data/"+username+"__"+filename;
  fs.open(path,'r', function(err, fd) {
    if (err)
    {
      console.log(`error: ${err}`);
      throw err;
    }
    var buf = new Buffer(getFilesizeInBytes('hello_world.cpp'));

    fs.read(fd, buf, 0, buf.length, 0, function(err, num) {
      var query = "INSERT INTO SRC_CODE SET?",
      values = {
        USER:data.username,
        NAME:data.filename,
        SRC:data.src,
        SRC_SZ:data.src_sz,
        BLK:data.blk,
        BLK_SZ:data.blk_sz
      };
      connection.query(query,values, function(er, da) {
        if(er) throw er;
        return;
      });
    });
  });
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
    })
  });
}

process.on('message', m => {
  console.log(myArgs[0]);
  console.log(m);
  if(myArgs[0]=='save_code')
  {
    if(validate_save())
    {
      save_code()
      process.send("Save success");
    }
    else
    {
      process.send("Save failed");
    }
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
