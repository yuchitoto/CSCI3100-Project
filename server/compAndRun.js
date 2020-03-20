const util = require('util');
const {spawn} = require("child_process");
const exec = util.promisify(require('child_process').exec);

var myArgs = process.argv.slice(2);

async function compile(filename, user) {
  const fln = 'g++ '+filename+' -o '+user;
  const {error, stderr} = await exec(fln);

  if(error)
  {
    console.log(`error: ${error.message}`);
    return error;
  }
  return stderr;
};

async function run(filename, user) {
  const comperr = compile(filename, user);

  if(comperr)
  {
    console.log(`1: ${comperr}`);
    return comperr;
  }

  const {stdout, stderr} = await exec(user+'.exe');
  if(stderr)
  {
    console.log(`2: ${stderr}`);
    return stderr;
  }

  spawn('del',[user+'.exe'], (error, stdout, stderr) => {
    if(error)
    {
      console.log(`error: ${error.message}`);
      return;
    }
    if(stderr)
    {
      console.log(`stderr: ${stderr}`);
      return;
    }
    return;
  });

  return stdout;
}

process.on('message', m => {
  if(m==1) {
    var result = run(myArgs[0], myArgs[1]);
    process.send(result);
  }
});
