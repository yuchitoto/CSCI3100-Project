const util = require('util');
const {spawn} = require("child_process");
const exec = util.promisify(require('child_process').exec);

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
  /*const result = run(filename, user);*/
  process.send(m)
});
