function getQueryStringValue (key) {
  return decodeURIComponent(window.location.search.replace(new RegExp("^(?:.*[&\\?]" + encodeURIComponent(key).replace(/[\.\+\*]/g, "\\$&") + "(?:\\=([^&]*))?)?.*$", "i"), "$1"));
}

function codeResult()
{
  var code = getQueryStringValue('code');
  const form = document.createElement('form');
  form.method = 'post';
  form.action = '/code?code='+code;
  document.body.appendChild(form);
  form.submit();
}
