const {fork} = require('child_process');
const fs = require('fs');

class Code{
  constructor(userid = -1)
  {
    this.userid = userid;
  }

  fetch(codeID, callback)
  {
    const fetcher = fork("connect_sql.js", ["fetch_code"]);
    fetcher.send(JSON.stringify({ID:codeID}));
    fetcher.on("message", msg => {
      if(msg=='fail')
      {
        return callback('fail');
      }
      return callback(JSON.parse(msg));
    });
  }

  save(codeID, code, block, name, callback)
  {
    const db = fork("connect_sql.js", ["save_code"]);
    db.send(JSON.stringify({
      ID:codeID,
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
      return callback('success');
    });
  }

/*
compile and run

return false for error, and compiler or program result
*/
  cpar(codeID, callback)
  {
    const runner = fork("compAndRun.js");
    this.fetch(codeID, msg => {
      if(msg=='fail')
      {
        return callback(false);
      }
      const name = msg[0].USER.toString(10)+"_"codeID.toString(10)+".cpp";
      fs.writeFile(name, msg[0].SRC, (err) => {
        if(err)
        {
          console.log(`error: ${err.message}`);
          return callback(false);
        }
        runner.send(JSON.stringify({USER:msg[0].USER.toString(10), NAME:codeID.toString(10)}));
        runner.on("message", res => {
          return callback(JSON.parse(res));
        });
      });
    });
  }

/*
save and compile and run

return false for error, compiler or program result otherwise
*/
  sacpar(codeID, code, block, name, callback)
  {
    this.save(codeID, code, block, name, sres => {
      if(sres=='fail')
      {
        return callback(false);
      }
      this.cpar(codeID, pres => {
        return callback(pres);
      });
    });
  }
}
