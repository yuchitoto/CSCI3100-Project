/*
this script is for testing each module,
or demonstrating actions to others,
not related to the website directly
*/
const {fork} = require('child_process');
const fs = require('fs');

function main() {
  const run = fork('connect_sql.js', ['save_code']);
  fs.readFile('./tmp_data/hello_world.cpp', function(err, data) {

    run.send(JSON.stringify({USER:1, NAME:'hello_world.cpp', SRC:data.toString('utf8'), SRC_SZ:data.length}));
    run.on('message', m=>{
      console.log(m);
    });
  });
  return;
}

main()
