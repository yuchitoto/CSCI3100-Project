
var myname = document.getElementById("name");
var email = document.getElementById("email");
var password = document.getElementById("password");
var rePassword = document.getElementById("retype_password");
var button_div = document.getElementById("submit_button");

function submitLogin(){
    var nm = myname.value;
    var pw = password.value;
    
    var alert = document.createElement("p");
    alert.setAttribute("id", "alert");

    // remove the previous alert before creating a new one
    var prevAlt = document.getElementById("alert");
    if(prevAlt != null){
        prevAlt.parentNode.removeChild(prevAlt);
    }

    if(nm && pw){
        console.log("submit");
        document.getElementById("user_submit").submit();
    }
    else{
        if(!nm && !pw){
            var text = document.createTextNode("Login with nothing is not a good idea");
        }
        else if(!nm){
            var text = document.createTextNode("Show me your name or email so we can know who you are!");
        }
        else{
            var text = document.createTextNode("No password, no login");
        }
        alert.appendChild(text);
        button_div.appendChild(alert);
    }
    
}

function submitNewUser(){
    console.log("submit");
    var nm = myname.value;
    var mail = email.value;
    var pw = password.value;
    var rePw = rePassword.value;
    var text;
    var flag = 1;

    var alert = document.createElement("p");
    alert.setAttribute("id", "alert");

    // remove the previous alert before creating a new one
    var prevAlt = document.getElementById("alert");
    if(prevAlt != null){
        prevAlt.parentNode.removeChild(prevAlt);
    }

    var nameRegex = /^[a-zA-Z0-9\-]+$/;
    var mailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;

    if(!(nm && mail && pw && rePw)){
        text = document.createTextNode("You have to fill in ALL THE BLANK!!!");
        flag = 0;
    }
    else if(!nm.match(nameRegex)){
        text = document.createTextNode("Just give me a name with only alphabets and -");
        flag = 0;
    }
    else if(!mail.match(mailRegex)){
        text = document.createTextNode("You give me a fake email, right?!");
        flag = 0;
    }
    else if(pw.length < 8){
        text = document.createTextNode("Your password should contain at least 8 char so that you can forget password easily");
        flag = 0;
    }
    else if(rePw != pw){
        text = document.createTextNode("Typo is not allow in password and retye-password");
        flag = 0;
    }
    
    // to submit
    if(flag){
        document.getElementById("user_submit").submit();
    }
    else{
        alert.appendChild(text);
        button_div.appendChild(alert);
    }
        
}

function submitUpdate(){
    document.getElementById("update_submit").submit();
}
