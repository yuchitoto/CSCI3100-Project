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
    window.alert("Please select code to mention");
  }
}
