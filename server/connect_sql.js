/**
* MODULES TO CONNECT TO MYSQL DATABASE
*
* CLASS NAME: MySQLDatabase
* PROGRAMMER: YU CHI TO
* VERSION: 1.1 (10-5-2020)
*
* Purpose:
* Provides the basic framework for querying in MySQL database
* This module provides basic functions for select, insert, delete and update queries.
*
*
* CLASS NAME: SRC_CODE
* PROGRAMMER: YU CHI TO
* VERSION: 1.1 (10-5-2020)
*
* Purpose: Provides interface to SRC_CODE table in MySQL database for
          customized queries related to operations of source codes.
          Extends MySQLDatabase.
*
* Dependencies:
* mysql
* fs
* querystring
*
* Environment:
* MySQL installed
*
*
* CLASS NAME: POST
* PROGRAMMER: YU CHI TO
* VERSION: 1.1 (10-5-2020)
*
* Purpose: Provides interface to POST table in MySQL database for
          customized queries related to operations of posts and replies.
          Extends MySQLDatabase.
*
*
* CLASS NAME: USER
* PROGRAMMER: YU CHI TO, Lee Tsz Yan
* VERSION: 1.1 (10-5-2020)
*
* Purpose: Provides interface to USER table in MySQL database for
          customized queries related to operations of user data.
          Extends MySQLDatabase.
*
*
* CLASS NAME: RATING
* PROGRAMMER: YU CHI TO
* VERSION: 1.0 (10-5-2020)
*
* Purpose: Provides interface to RATING table in MySQL database for
          customized queries related to operations of ratings.
          Extends MySQLDatabase.
*/

const fs = require('fs');

const mysql = require('mysql');
var myArgs = process.argv.slice(2);
const qs = require('querystring');

/*
methods use parsed data
functions handles raw JSON
*/

// base class for specific database table accessing using mysql
class MySQLDatabase {
  constructor(table) {
    this.connection = mysql.createConnection({
      "host":"localhost",
      "port":3306,
      "user":"csci3100grp18",
      "password":"csci3100#Grp18",
      "database":"CSCI3100GRP18"
    });
    this.table = table;
  }

  insert(values, callback) {
    var query = "INSERT INTO ?? SET ?";
    //console.log(values);
    const key = Object.keys(values);
    const value = Object.values(values);
    var pr = [this.table];
    for(var i=0; i<key.length;i++)
    {
      if(i>0) {
        query += ", ?";
      }
      pr.push({[key[i]]:value[i]});
    }
    this.connection.query(query, pr, function(err, data) {
      return callback(err, data);
    });
  }

  simpleSelect(params, callback) {
    var query = "SELECT "+params.data+" FROM "+params.table+" WHERE "+params.query;
    this.connection.query(query, function(err, data) {
      return callback(err, data);
    });
  }

  selectWhenAllTrue(params, callback) {
    var query = "SELECT * FROM ?? WHERE ?";
    const key = Object.keys(params);
    const value = Object.values(params);
    var pr = [this.table];
    for(var i=0; i<key.length;i++)
    {
      if(i>0) {
        query += " AND ?";
      }
      pr.push({[key[i]]:value[i]});
    }
    this.connection.query(query, pr, function(err, data) {
      if(err)
      {
        console.log(`error: ${err.message}`);
      }
      return callback(err, data);
    });
  }

  deleteWhenAllTrue(cond, callback) {
    var query = "DELETE FROM ?? WHERE ?";
    const key = Object.keys(cond);
    const value = Object.values(cond);
    var pr = [this.table];
    for(var i=0;i<key.length;i++)
    {
      if(i>0)
      {
        query += " AND ?";
      }
      pr.push({[key[i]]:value[i]});
    }
    this.connection.query(query, pr, function(err, data) {
      return callback(err, data);
    });
  }

  // universal update statement, problematic when 2nd level is obj
  update(val, cond, callback) {
    //console.log(val);
    //console.log(cond);
    var query = "UPDATE ?? SET ? ";
    const key = Object.keys(cond);
    const value = Object.values(cond);
    var pr = [this.table].concat(val);
    for (var i=1;i<val.length;i++)
    {
      query += ",? ";
    }
    query += "WHERE ?";
    for (var i=0;i<key.length;i++)
    {
      if(i>0)
      {
        query += " AND ?";
      }
      pr.push({[key[i]]:value[i]});
    }
    //console.log(pr);
    this.connection.query(query, pr, function(err, data) {
      if(err) console.log('error');
      return callback(err, data);
    });
  }
}

/*
// calculating size of file
function getFilesizeInBytes(filename) {
    var stats = fs.statSync(filename);
    var fileSizeInBytes = stats["size"];
    return fileSizeInBytes;
}
*/

// mysql table SRC_CODE
class SRC_CODE extends MySQLDatabase {
  constructor() {
    super('SRC_CODE');
  }

  validateSave(param, callback) {
    // ensures no duplication and check for whether new file or updates
    const query = "SELECT COUNT(*) FROM SRC_CODE WHERE USER=? AND NAME=?";
    this.connection.query(query, [param.USER, param.NAME], function(err, data) {
      if(err)
      {
        console.log(`error ${err.message}`);
        return callback(-1);
      }
      if(data[0]>1)
      {
        return callback(-1);
      }
      return callback(data[0]);
    });
  }

  newCode(values, callback) {
    //save entry to database
    this.insert(values, function(err, res) {
      return callback(err, res);
    });
  }

  fetchCode(data, callback) {
    //fetch entry from database
    this.selectWhenAllTrue(data, function(err, data) {
      return callback(err, data);
    });
  }

  deleteCode(data, callback) {
    /*use parsed data to delete*/
    this.deleteWhenAllTrue(data, function(err, res) {
      if(err)
      {
        console.log(`error: ${err.message}`);
        return callback('fail');
      }
      //console.log(res);
      if(res.affectedRows>0)
      {
        return callback('success');
      }
      return callback('fail');
    });
  }

  updateCode(data, callback) {
    // update entry
    this.update(data, {USER:data.USER, NAME:data.NAME}, function(err, res) {
      return callback(err, res);
    });
    /*const query = "UPDATE SRC_CODE SET ? WHERE USER=? AND NAME=?";
    this.connection.query(query, [data, data.USER, data.NAME], function(err, res) {
      return callback(err, res);
    });*/
  }

  saveCode(data, callback) {
    // basic handler for updating or saving code entry
    //console.log(data);
    this.validateSave(data, tmpres => {
      if(tmpres['COUNT(*)'] < 0)
      {
        return callback('fail');
      }
      else if(tmpres['COUNT(*)'] == 0)
      {
        this.newCode(data, function(err, res) {
          if(err) {
            console.log(`error: ${err.message}`);
            return callback('fail');
          }
          //console.log(res);
          return callback(res.insertId);
        });
      }
      else if (tmpres['COUNT(*)'] == 1) {
        this.updateCode(data, function(err, res) {
          if(err) {
            console.log(`error: ${err.message}`);
            return callback('fail');
          }
          //console.log(res);
          return callback('success');
        });
      }
      else
      return callback('fail');
    });
  }

  allCode(user, callback) {
    this.selectWhenAllTrue(user, function(err, res) {
      if(err)
      {
        console.log(`error: ${err.message}`);
        return callback('fail');
      }
      //console.log(res);
      return callback(res);
    });
  }
}

// mysql table USER
class USER extends MySQLDatabase {
  constructor() {
    super("USER");
  }

  insertUser(data, callback){
    this.insert(data, function(err1, res1) {
      if(err1)
      {
        console.log(`error: ${err1.message}`);
        return callback(0);
      }
      return callback(res1);
    });
  }

  newUser(data, callback) {
    /*new user*/
    this.insertUser(data, res => {
      if(res==0)
      {
        return callback(0);
      }
      this.selectWhenAllTrue(data, function(err, result) {
        if(err)
        {
          return callback(0);
        }
        if(result.length==1)
        {
          return callback(result[0].ID);
        }
        return callback(0);
      });
    });
  }

  existName(data, callback) {
    /*check if exists same name*/
    this.selectWhenAllTrue({USERNAME:data.USERNAME}, function(err, data) {
      if(err) {
        console.log(`error: ${err.message}`);
        return callback(-1);
      }
      console.log(data.length);
      return callback(data.length);
    });
  }

  existEmail(data, callback) {
    /*check if exists email*/
    this.selectWhenAllTrue({EMAIL:data.EMAIL}, function(err, data) {
      if(err) {
        console.log(`error: ${err.message}`);
        return callback(-1);
      }
      return callback(data.length);
    });
  }

  findUser(data, callback) {
    //find user
    this.selectWhenAllTrue(data, function(err, data) {
      if(err) {
        console.log(`error: ${err.message}`);
        return callback('fail');
      }
      if(data.length == 0){
        return callback('no_user');
      }
      return callback(data);
    });
  }

  verifyPassword(data, callback) {
    //verify password
    this.selectWhenAllTrue(data, function(err, res) {
      if(err)
      {
        console.log(`error: ${err.message}`);
        return callback('fail');
      }
      if(res.length==1)
      {
        return callback('success');
      }
      return callback('fail');
    });
  }

  deleteUser(data, callback) {
    //remove user

    this.deleteWhenAllTrue(data, function(err, res) {
      if(err)
      {
        console.log(`error: ${err.message}`);
        return callback('fail');
      }
      //console.log(res);
      return callback(res.affectedRows);
    });
  }

  userID(data, callback) {
    //return userID on callback
    this.selectWhenAllTrue(data, function(err, data) {
      if(err) {
        return callback(-1);
      }
      if(data.length != 1) {
        return callback(-1);
      }
      return callback(data[0].ID);
    });
  }

  updateUser(val, cond, callback) {
    //console.log(cond);
    this.update(val, cond, function(err, res) {
      console.log("update time");
      if(err)
      {
        console.log(`error: ${err.message}`);
        return callback(false);
      }
      return callback(res.affectedRows);
    });
  }
}

// mysql table POST
class POST extends MySQLDatabase {
  constructor() {
    super("POST");
  }

  newPost(data, callback) {
    //insert new post or reply
    this.insert(data, function(err, data) {
      if(err)
      {
        console.log(`error: ${err.message}`);
        return callback("fail");
      }
      //console.log(data);
      return callback(data.insertId);
    });
  }

  fetchPostHead(id, callback) {
    const queryhead = "SELECT a.ID as ID, c.USERNAME AS USER, a.TITLE, a.CONTENT, b.SRC AS CODE FROM POST a, SRC_CODE b, USER c WHERE a.ID=? AND a.USER=c.ID AND a.CODE=b.ID";
    this.connection.query(queryhead, id, function(err1, hd) {
      if(err1) {
        console.log(`error: ${err1.message}`);
        return callback('fail');
      }
      callback(hd);
    });
  }

  fetchReply(id, callback) {
    const queryreply = "SELECT c.USERNAME AS USER, a.CONTENT FROM POST a, USER c WHERE a.REPLY=? AND a.USER=c.ID ORDER BY a.ID ASC";
    this.connection.query(queryreply, id, function(err2, rep) {
      if(err2) {
        console.log(`error: ${err2.message}`);
        return callback('fail');
      }
      return callback(rep);
    });
  }

  fetchPost(id, callback) {
    // fetch post
    // special solution used instead of general method inherited
    this.fetchPostHead(id, msg1=> {
      if(msg1=='fail') {
        return callback(msg1);
      }
      this.fetchReply(id, msg2 => {
        if(msg2=='fail')
        {
          return callback(msg2);
        }
        return callback(msg1.concat(msg2));
      });
    });
  }

  deletePost(data, callback) {
    //delete reply or post and replies
    this.connection.query("DELETE FROM POST WHERE ? OR ?", [{ID:data.ID}, {REPLY:data.ID}], function(err, res) {
      if(err){
        console.log(`error: ${err.message}`);
        return callback('fail');
      }
      else
      {
        //console.log(res);
        if (res.affectedRows>0)
          return callback('success');
        else
          return callback('fail');
      }
    });
  }

  searchPostHead(data, callback) {
    //parse keywords into sql database
    const existsTitle = data.existsTitle;
    const user = data.user;
    const inContext = data.inContext;
    const id = data.id;
    var queryKey = "(";
    var k=0;

    existsTitle.forEach((item, i) => {
      if(k==0)
      {
        queryKey += "(";
      }
      if(k>0){
        queryKey = queryKey.concat(' OR ');
      }
      k+=1;
      queryKey = queryKey.concat('TITLE LIKE ','\'%', item,'%\'');
    });
    user.forEach((item, i) => {
      if(k==0)
      {
        queryKey += "(";
      }
      if(k>0){
        queryKey = queryKey.concat(' OR ');
      }
      k+=1;
      queryKey = queryKey.concat('USERNAME=\'', item, '\'');
    });
    inContext.forEach((item, i) => {
      if(k==0)
      {
        queryKey += "(";
      }
      if(k>0){
        queryKey = queryKey.concat(' OR ');
      }
      k+=1;
      queryKey = queryKey.concat('CONTENT LIKE ', '\'%', item, '%\'');
    });
    if(k>0){
      queryKey = queryKey.concat(') AND ');
    }
    queryKey = queryKey.concat('POST.USER=USER.ID AND REPLY=0)');

    k=0;
    if(id.length){
      queryKey += ' OR ('
      id.forEach((item, i) => {
        if(k>0){
          queryKey += ' OR ';
        }
        k+=1;
        queryKey = queryKey.concat('POST.ID=',item);
      });
      queryKey += ')';
    }

    //console.log(queryKey);

    this.simpleSelect({data:'POST.ID AS ID, USER.USERNAME AS USER, TITLE, CREATE_TIME', table:'USER, POST', query:queryKey}, function(err, ret) {
      if(err)
      {
        console.log(`error: ${err.message}`);
        return callback('fail');
      }
      return callback(ret);
    });
  }

  searchReply(data, callback)
  {
    // find in reply for post head id
    const user = data.user;
    const inContext = data.inContext;

    var queryKey = "";
    var k=0;
    user.forEach((item, i) => {
      if(k==0)
      {
        queryKey += "(";
      }
      if(k>0){
        queryKey = queryKey.concat(' OR ');
      }
      k+=1;
      queryKey = queryKey.concat('USERNAME=\'', item, '\'');
    });
    inContext.forEach((item, i) => {
      if(k==0)
      {
        queryKey += "(";
      }
      if(k>0){
        queryKey = queryKey.concat(' OR ');
      }
      k+=1;
      queryKey = queryKey.concat('CONTENT LIKE ', '\'%', item, '%\'');
    });
    if(k>0){
      queryKey = queryKey.concat(') AND ');
    }
    queryKey = queryKey.concat('REPLY!=0');
    //console.log(queryKey);
    this.simpleSelect({data:'POST.REPLY AS ID', table:'USER, POST', query:queryKey}, function(err, res) {
      if(err)
      {
        console.log(`error: ${err.message}`);
        return callback('fail');
      }
      var id = [];
      res.forEach((item, i) => {
        if(!id.includes(item.ID))
        {
          id.push(item.ID);
        }
      });
      return callback(id);
    });
  }

  searchPost(data, callback)
  {
    // search posts
    // search in reply first
    this.searchReply(data, id => {
      if(id=='fail')
      {
        return callback('fail');
      }
      data.id = id;
      this.searchPostHead(data, res => {
        return callback(res);
      });
    });
  }

// planned advanced feature
  /*updateGrade(data, callback) {
    //update grade
  }

  calculateGrade(postID, callback) {
    //calc grade for post
  }*/
}

class RATING extends MySQLDatabase{
  constructor()
  {
    super("RATING");
  }

  insertRating(data, callback)
  {
    this.insert(data, function(err, res) {
      if(err)
      {
        console.log(err);
        return callback('fail');
      }
      return callback('success');
    });
  }

  updateRating(data, callback)
  {
    this.update([{RATE:data.RATE}], {POSTID:data.POSTID, USERID:data.USERID}, function(err, res) {
      if(err)
      {
        console.log(err);
        return callback('fail');
      }
      return callback('success');
    });
  }

  rating(data, callback)
  {
    var mark = 0;
    const query = "SELECT a.COUNT(*) AS BASE, SUM(RATE) AS RATING FROM RATING WHERE ?";
    this.connection.query(query, [data], function(err, res) {
      if(err)
      {
        console.log(err);
        return callback(-1);
      }
      if(res[0].BASE>0)
      {
        mark = res[0].RATING / res[0].BASE;
      }
      return callback(mark);
    });
  }
}


const userT = new USER();
const codeT = new SRC_CODE();
const postT = new POST();

// function caller upon message invoke, handles JSON here

// saveCode wrapper
function save_code(param, callback) {
  const data = JSON.parse(param);

  codeT.saveCode(data, m => {callback(m);});
}

// fetchCode wrapper
function fetch_code(param, callback) {
  const data = JSON.parse(param);
  //console.log(data);
  codeT.fetchCode(data, function(err, res) {
    return callback(err, res);
  });
}

// deleteCode wrapper
function delete_code(param, callback)
{
  /*delete code also delete all posts related*/
  const data = JSON.parse(param);
  codeT.deleteCode(data, msg => {
    return callback(msg);
  });
}

// newUser wrapper
function new_user(data, callback)
{
  const datan = JSON.parse(data);
  userT.newUser(datan, msg => {return callback(msg);});
}

// existName wrapper
function exist_name(data, callback)
{
  const datan = JSON.parse(data);
  userT.existName(datan, msg => {return callback(msg);});
}

// existEmail wrapper
function exist_email(data, callback)
{
  const datan = JSON.parse(data);
  userT.existEmail(datan, msg => {return callback(msg);});
}

// findUser wrapper
function find_user(param, callback){
  // find user from database
  const data = JSON.parse(param);
  userT.findUser(data, msg => {return callback(msg);});
}

// verifyPassword wrapper
function verify_password(user, callback){
  // verify password
  const data = JSON.parse(user)
  userT.verifyPassword(data, msg => {return callback(msg);});
}

// update password
function update_user(param, callback){
  const data = JSON.parse(param);
  const val = {PASSWORD:data.PASSWORD};
  const cond = {ID:data.ID};
  //console.log(val);
  //console.log(cond);
  userT.updateUser(val, cond, msg=>{return callback(msg);});
}

// deleteUser wrapper
function delete_user(param, callback){
  // delete given id in USER
  const data=JSON.parse(param);
  userT.deleteUser(data, msg=>{return callback(msg);});
}

// newPost wrapper
function new_post(param, callback)
{
  //assume take on userid, title, content, reply(0 for new post), code id
  const data = JSON.parse(param);
  postT.newPost(data, msg => {return callback(msg);});
}

// fetchPost wrapper
function fetch_post(param, callback)
{
  /*if id or reply = post id ret json array of post*/
  const data = JSON.parse(param);
  postT.fetchPost(data.ID, msg => {return callback(msg);});
}

//deletePost wrapper
function delete_post(param, callback)
{
  /*delete all post if is post head, else single*/
  const data = JSON.parse(param);
  postT.deletePost(data, msg => {return callback(msg);});
}

function search_post_head(param, callback)
{
  /* search post head*/
  const data = JSON.parse(param);
  postT.searchPostHead(data, msg => {
    if(msg=='fail')
    {
      return callback(1, msg);
    }
    return callback(0, msg);
  })
}

// searchPost wrapper
function search_post(param, callback)
{
  /*search posts*/
  const data = JSON.parse(param);
  postT.searchPost(data, msg => {
    if(msg=='fail')
    {
      return callback(1, msg);
    }
    return callback(0, msg);
  });
}

// userID wrapper
function userID(param, callback)
{
  /*ret user id*/
  userT.selectWhenAllTrue(JSON.parse(param), function(err, res) {
    if(err)
    {
      console.log(`error: ${err.message}`);
      return callback('fail');
    }
    if(res.length!=1)
    {
      return callback('fail');
    }
    return callback(res[0].ID);
  });
}

/*advanced
function updateGrade(param, callback)
{

}*/

// invoke wrapper upon message
process.on('message', m => {
  console.log(myArgs[0]);
  if(myArgs[0]=='save_code')
  {
    save_code(m, res => {process.send(res);});
  }
  if(myArgs[0]=='fetch_code')
  {
    fetch_code(m, function(err, data) {
      if(err){
        console.log(`error: ${err.message}`);
        return process.send('fail');
      }
      return process.send(JSON.stringify(data));
    });
  }
  if(myArgs[0]=='new_user')
  {
    exist_name(m, msg => {
      if(msg != 0){
        return process.send('exist_name');
      }
      else{
        exist_email(m, msg2 => {
          if(msg2 != 0){
            return process.send('exist_email');
          }
          else{
            new_user(m, id => {
              if(id==0){
                return process.send('fail');
              }
            return process.send(id);
            });
          }
        });
      }
    })
  }
  if(myArgs[0]=='delete_user')
  {
    delete_user(m, res =>{return process.send(res);});
  }
  if (myArgs[0]=='fetch_post') {
    fetch_post(m, res => {
      if(res=='fail')
      {
        return process.send('fail');
      }
      return process.send(JSON.stringify(res));
    });
  }
  if (myArgs[0]=='find_user') {
    find_user(m, function(res) {
      if(res=='fail' || res=='no_user')
      {
        return process.send(res);
      }
      return process.send(JSON.stringify(res));
    });
  }
  if (myArgs[0]=='search_post_head') {
    search_post_head(m, function(err, data) {
      if(err)
      {
        return process.send('fail');
      }
      return process.send(JSON.stringify(data));
    });
  }
  if(myArgs[0]=='search_post') {
    search_post(m, function(err, res) {
      if(err)
      {
        return process.send('fail');
      }
      return process.send(JSON.stringify(res));
    });
  }
  if(myArgs[0]=='delete_post') {
    delete_post(m, msg => {return process.send(msg);});
  }
  if(myArgs[0]=='delete_code') {
    delete_code(m, msg => {return process.send(msg);});
  }
  if(myArgs[0]=='verify_password') {
    verify_password(m, msg=>{return process.send(msg);});
  }
  if(myArgs[0]=='userID') {
    userID(m, msg=>{return process.send(msg);});
  }
  if(myArgs[0]=="new_post") {
    new_post(m, msg => {return process.send(msg);});
  }
  if(myArgs[0]=="all_code"){
    codeT.allCode(JSON.parse(m), msg => {
      //console.log(msg);
      if(msg=="fail")
      {
        return process.send(msg);
      }
      return process.send(JSON.stringify(msg));
    })
  }
  if(myArgs[0]=="update_user")
  {
    /*var msg = JSON.parse(m);
    var val = {PASSWORD: msg.PASSWORD};
    var cond = {ID: msg.ID};
    console.log(val);
    console.log(cond);*/
    update_user(m, msg=>{return process.send(msg);});
  }
});

// export class definition
module.exports = {SRC_CODE:SRC_CODE, POST:POST, USER:USER};
