const fs = require('fs');

var mysql = require('mysql');

var connection = mysql.createConnection({
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

fs.open('hello_world.cpp','r', function(err, fd) {
  if (err)
  {
    console.log(`error: ${err}`);
    throw err;
  }
  var buf = new Buffer(getFilesizeInBytes('hello_world.cpp'));

  fs.read(fd, buf, 0, buf.length, 0, function(err, num) {
    var query = "INSERT INTO SRC_CODE SET?",
    values = {
      USER:'test',
      NAME:'hello_world.cpp',
      SRC:buf,
      SRC_SZ:buf.length
    };
    connection.query(query,values, function(er, da) {
      if(er) throw er;
    })
  })
})
