/*
this script is for testing each module,
or demonstrating actions to others,
not related to the website directly
*/
const {fork} = require('child_process');
const fs = require('fs');
//const sql = require('./connect_sql');
//let POST = sql.POST;

function main() {
  const sql = fork('./connect_sql.js', ['fetch_code']);
  /*sql.send(JSON.stringify({existsTitle:[],user:[],inContext:['intro'],id:[]}));
  sql.on("message", msg => {
    if(msg=='fail')
    {
      console.log(msg);
      return;
    }
    const dep = JSON.parse(msg);
    console.log(dep);
  });*/
  sql.send(JSON.stringify({USER:1, NAME:"hello_world.cpp"}));
  sql.on("message", msg => {
    console.log(msg);
  });
}

main()
