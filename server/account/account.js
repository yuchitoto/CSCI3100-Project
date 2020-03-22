var mysql = require('mysql');
//var express = require('express');
//var app = express()

var connection = mysql.createConnection({
  "host":"sql12.freesqldatabase.com",
  "port":3306,
  "user":"sql12328565",
  "password":"kQjmPhHsgA",
  "database":"sql12328565"
});

exports.register = (req, res)=>{
  var users={
    USERNAME: req.username,
    EMAIL: req.email,
    PASSWORD_HASH: req.passward
  }
  connection.query('INSERT INTO USER SET?', users, function(err, result){
    if(err){
      console.log('registor error: ', err);
      throw err;
    }
  })
}