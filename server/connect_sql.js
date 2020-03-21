const fs = require('fs');

const mysql = require('mysql');
var myArgs = process.argv.slice(2);

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

function save_code() {
  const username = myArgs[0];
  const filename = myArgs[1];
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
        USER:username,
        NAME:filename,
        SRC:buf,
        SRC_SZ:buf.length
      };
      connection.query(query,values, function(er, da) {
        if(er) throw er;
        return;
      });
    });
  });
}

function fetch_code() {
  const username = myArgs[0];
  const filename = myArgs[1];
  const sql = "SELECT * FROM SRC_CODE WHERE USER=? AND NAME=?";
  connection.query(sql, [username, filename], function (err, result) {
    if(err)
    {
      console.log(`error: ${err.message}`);
      return;
    }
    console.log(result);
    var path = "../tmp_data/"+username+"__"+filename;
    fs.open(path, "w", function (err, fd) {
      fs.writeFile(fd, result[0].SRC, function (error) {
        if (error) throw error;
      });
    });
    return path;
  });
}

process.on('message', m => {
  if(m=='save_code')
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
  else if(m=='fetch_code')
  {
    var tmp_path = fetch_code()
    process.send(tmp_path)
  }
})
