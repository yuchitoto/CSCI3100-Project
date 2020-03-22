var http = require('http');
var url = require('url');
var fs = require('fs');
var {fork} = require('child_process');
var qs = require('querystring')

var server = http.createServer( function(request, response) {
  var qurl = url.parse(request.url, true);
  console.log(qurl.pathname);
  var action = qurl.pathname.split('/')
  if(action[0]=='code')
  {
    /*entertain coding*/
  }
  else if(action[0]=='forum')
  {
    /*entertain forum*/
  }
  else if(action[0]=='new_user')
  {
    /*new_user*/
    var data = '';
    request.on('user_info', function(user_info) {
        data += user_info;
        request.on('end', function(in) {
          var user = qs.parse(data);
          const add_data = fork('connection_sql.js new_user');
          add_data.send(JSON.stringify(user));
          add_data.on('message', result => {
            if(result)
            {
              console.log(result);
              var ret = JSON.stringify({USERNAME:user.USERNAME, ID:result});
              response.writeHead(200, {"Content-Type":"application/json","Content-Length":ret.length});
              response.end(ret);
            }
          })
        })
      });
  }
  fs.readFile(pthn, function(err, data) {
    if(err)
    {
      response.writeHead(404, {'Content-Type':'text/html'});
      return response.end("404 Not Found");
    }
    response.writeHead(200, {'Content-Type':'text/html'});
    response.write(data);
    return response.end();
  });
}).listen(8000);
