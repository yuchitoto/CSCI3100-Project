/*
this script is for testing each module,
or demonstrating actions to others,
not related to the website directly
*/
const {fork} = require('child_process');
const fs = require('fs');
//const sql = require('./connect_sql');
//let POST = sql.POST;
const code = require('./code.js');
let Code = code.Code;

function main() {
  //const sql = fork('compAndRun.js');
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
  /*sql.send(JSON.stringify({USER:'1_1.c',NAME:1}));
  sql.on("message", msg => {
    console.log(msg);
  });*/
  const coder = new Code(1);
  coder.fetch(5, msg => {
    console.log(msg);
  });
}

main()
