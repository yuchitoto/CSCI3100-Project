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
  const sql = fork('./connect_sql.js', ['new_user']);
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
  sql.send(JSON.stringify({USERNAME:"TEST", EMAIL:"TESTER", PASSWORD:"ABC", ACC_TYPE:0}));
  sql.on("message", msg => {
    console.log(msg);
  });
}

main()
