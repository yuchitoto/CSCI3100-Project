/*
  MODULE TO COMPILE AND RUN SOURCE CODE

  PROGRAMMER: YU CHI TO
  VERSION: 1.1 (10-5-2020)

  Purpose:
  A slave module to compile and run C source code and return compilation errors and output of the source code

  Dependencies:
  util
  child_process

  Environment
  Microsoft Windows with GNU C COMPILER installed
*/
const util = require('util');
const {spawn, exec} = require("child_process");
const pexec = util.promisify(require('child_process').exec);

// var myArgs = process.argv.slice(1); will be used when different compile is used

// function to write JSON buffer src code file to server
/*async function tmpFile()*/

// compile the file written on server
function compile(filename, user, callback) {
  const fln = 'gcc '+filename+' -o '+user;
  exec(fln, (error, stdout, stderr)=> {
    if(error)
    {
      console.log(`error: ${error.message}`);
      if(stderr)
      {
        console.log(`stderr: ${stderr}`);
        return callback(stderr);
      }
      return callback(error);
    }
    if(stderr)
    {
      console.log(`stderr: ${stderr}`);
      return callback(stderr);
    }
    return callback(stdout);
  });
};

// run the corresponding excutable
function run(filename, user, callback) {
  console.log(filename);
  var result = {comp:"", prog:""};
  compile(filename, user, res => {
    if(res)
    {
      result.comp = res;
      return callback(result);
    }
    exec(user+'.exe < '+user+'.txt', function(err, stdout, stderr) {
      if(err)
      {
        console.log(err);
        if(stderr)
        {
          console.log(stderr);
          result.prog = stderr;
        }
        return callback(result);
      }
      if(stderr)
      {
        console.log(stderr);
        result.prog = stderr;
        return callback(result);
      }
      exec('del '+user+'.exe '+user+'.txt', (rerr) => {
        if(rerr)
        {
          console.log(rerr);
        }
      });
      exec('del '+filename, (rserr) => {
        if(rserr)
        {
          console.log(rserr);
        }
      });
      result.prog = stdout;
      return callback(result);
    });
  });
}

// handle requests upon invoke
process.on('message', m => {
    const data = JSON.parse(m); // user: userID, name: src code name
    run(data.USER, data.NAME, msg => {
      return process.send(JSON.stringify(msg));
    })
});
