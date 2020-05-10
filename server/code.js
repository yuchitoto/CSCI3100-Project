/*
  MODULE FOR SOURCE CODE SAVING AND COMPILATION AND RUNNING

  CLASS NAME: Code
  PROGRAMMER: YU CHI TO
  VERSION: 1.1 (10-5-2020)

  Purpose:
  Provides an interface to communicate between master module (app.js) and slave modules (compAndRun.js, connect_sql.js) to handle requests related to source codes
  Provides specific methods and parse input into suitable format for slave modules to process on the input such as saving and update of code or compilation of code
  Returns the result of the slave modules

  Dependencies:
  child_process
  compAndRun
  connect_sql
*/
const {fork} = require('child_process');
const fs = require('fs');

class Code{
  constructor(userid = -1)
  {
    this.userid = userid;
  }

  fetch(param, callback)
  {
    const fetcher = fork("connect_sql.js", ["fetch_code"]);
    fetcher.send(JSON.stringify(param));
    fetcher.on("message", msg => {
      if(msg=='fail')
      {
        return callback('fail');
      }
      return callback(JSON.parse(msg));
    });
  }

  save(code, block, name, callback)
  {
    const db = fork("connect_sql.js", ["save_code"]);
    db.send(JSON.stringify({
      USER:this.userid,
      SRC:code,
      BLK:block,
      SRC_SZ:code.length,
      BLK_SZ:block.length,
      NAME:name
    }));
    db.on("message", msg => {
      if(msg=='fail')
      {
        return callback('fail');
      }
      return callback(msg);
    });
  }

/*
compile and run

return false for error, and compiler or program result
*/
  cpar(codeID, stdin, callback)
  {
    const runner = fork("compAndRun.js");
    this.fetch({ID:codeID}, msg => {
      if(msg=='fail')
      {
        return callback(false);
      }
      const name = 'tmp_data\\'+msg[0].USER.toString(10)+"_"+codeID.toString(10)+".c";
      fs.writeFile(name, msg[0].SRC, (err) => {
        if(err)
        {
          console.log(`error: ${err.message}`);
          return callback(false);
        }
        fs.writeFile(codeID.toString(10)+".txt", stdin, (err1)=>{
          if(err1)
          {
            console.log(`error: ${err1.message}`);
            return callback(false)
          }
          runner.send(JSON.stringify({USER:name, NAME:codeID.toString(10)}));
          runner.on("message", res => {
            return callback(JSON.parse(res));
        });
        });
      });
    });
  }

/*
save and compile and run

return false for error, compiler or program result otherwise
*/
  sacpar(code, block, stdin, name, callback)
  {
    this.save(codeID, code, block, name, sres => {
      if(sres=='fail')
      {
        return callback(false);
      }
      this.cpar(codeID, stdin, pres => {
        return callback({res:pres, loc:sres});
      });
    });
  }
}

module.exports = {Code:Code};
