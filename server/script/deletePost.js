function deletePost(id)
{
  var request = new XMLHttpRequest();
  request.onreadystatechange = function()
  {
    if (this.readyState==4 && this.status==200)
    {
      window.location.href=("/user");
    }
    else if (this.readyState==4 && this.status==400) {
      alert("Delete operation failed");
    }
  }
  if(confirm("The post will be deleted permanently, please confirm whether you want to perform this action."))
  {
    request.open('DELETE',"/post?post="+id.toString(10));
    request.send();
  }
}
