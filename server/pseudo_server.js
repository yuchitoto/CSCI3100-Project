
const {fork} = require('child_process');

function main() {
  const run = fork('compAndRun.js');
  run.send(1);
  run.on('message', result => {
    console.log(`result: ${result}`);
  });
  return;
}

main()
