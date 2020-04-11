const util = require('util');
const {spawn} = require("child_process");
const exec = util.promisify(require('child_process').exec);

// var myArgs = process.argv.slice(1); will be used when different compile is used

// function to write JSON buffer src code file to server
/*async function tmpFile()*/

// compile the file written on server
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

// run the corresponding excutable
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

// handle requests upon invoke
process.on('message', m => {
    const data = JSON.parse(m); // user: userID, name: src code name
    var result = run(data['user'], data['name']);
    process.send(result);
});
