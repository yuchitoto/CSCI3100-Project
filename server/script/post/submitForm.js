function validation(o)
{
  var code=false;
  for(var i=0; i<o; i++)
  {
    if(document.getElementById('CODE'+i).checked)
    {
      code=true;
    }
  }
  if(document.getElementById('TITLE').value=="" || document.getElementById('TITLE').value.split(' ')[0]=="")
  {
    code=false;
  }
  return code;
}

function submitForm(o)
{
  if(validation(o))
  {
    document.getElementById("post_submit").submit();
  }
  else
  {
    window.alert("A new post needs a good title and a good source code for show off");
  }
}
