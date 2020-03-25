
const {fork} = require('child_process');

function main() {
  const run = fork('connect_sql.js', ['fetch_code']);
  const msg = JSON.stringify({USER:'TEST', NAME:'hello_world.cpp'});
  run.send(msg);
  run.on('message', result => {
    console.log(`result: ${result}`);
  });
  return;
}

main()
