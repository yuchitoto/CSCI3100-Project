$(document).ready(function () {
  $("#submit").click(function () {
    var name = $("#username").val()
    var email = $("#email").val();
    var password = $("#password").val();
    if (neme.length == "" || email.length == "" || password.length == ""){
      $("#message").html("please fill out this field first").fadeIn();
      $("#message").addClass("error");
      return false;
    }else if(check_email() === true || check_password() === true){
      $("#message").html("wrong").fadeIn();
      return false
    }
    else {
      $.ajax({
        type: 'POST',
        url: 'redirect.php?action=registor',
        data: {USERNAME: name, EMAIL: email, PASSWORD_HASH: password },
        success: function (feedback) {
          $("#text").html(feedback);
        }
      });
    }
  });
  $(".email_error_text").hide();
  $(".password_error_text").hide();
  var error_email = false;
  var error_password = false;
  $("#email").focusout(function () {
    console.log("check");
    check_email();
  });
  $("#password").focusout(function () {
    check_password();
  });
  function check_email() {
    $("#message").hide();
    var pattern = new RegExp(/^([a-zA-Z0–9_\.\-])+\@(([a-zA-Z0–9\-])+\.)+([a-zA-Z0–9]{2,4})+$/);
    if (pattern.test($("#email").val())) {
      $(".email_error_text").hide();
    } else {
      $(".email_error_text").html("Invalid email address");
      $(".email_error_text").show().addClass("error");
      error_email = true;  
    }
    return error_email;
  }
  function check_password() {
    $("#message").hide();
    var password_length = $("#password").val().length;
    if (password_length < 8) {
      $(".password_error_text").html("Should be at least 8 characters");
      $(".password_error_text").show().addClass("error");
      error_password = true;
    } else {
      $(".password_error_text").hide();
    }
    return error_password;
  }
});