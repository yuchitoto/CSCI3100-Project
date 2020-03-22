var http = require('http');
var url = require('url');
var fs = require('fs');

var server = http.createServer( function(request, response) {
  var qurl = url.parse(request.url, true);
  console.log(qurl.pathname);
  var pthn = "./html"+qurl.pathname
  /*if(qurl.pathname=='')*/
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
