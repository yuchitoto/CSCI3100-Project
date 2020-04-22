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
  const sql = fork('compAndRun.js');
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
  sql.send(JSON.stringify({USER:'1_1.c',NAME:1}));
  sql.on("message", msg => {
    console.log(msg);
  });
}

main()
