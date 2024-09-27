const urlBase = 'http://cop4331-team10.xyz/LAMPAPI';
const extension = 'php';

let securityAnswer;
let securityQuestion;
let username;

function findMe() {
    username = document.getElementById("username").value;
    document.getElementById("findMeResult").innerHTML = "";

    if (!username) {
        document.getElementById("findMeResult").innerHTML = "Please enter username";
        return;
    }

    let tmp = {
        login: username
    };
    let jsonPayload = JSON.stringify(tmp);

    let url = urlBase + '/forgotPassword.' + extension;

    let xhr = new XMLHttpRequest();
    xhr.open("POST", url, true);
    xhr.setRequestHeader("Content-type", "application/json; charset=UTF-8");

    try {
        xhr.onreadystatechange = function () {
            if (this.readyState == 4 && this.status == 200) {
                let jsonObject = JSON.parse(xhr.responseText);

                if(jsonObject.error !== ""){
                    document.getElementById("findMeResult").innerHTML = jsonObject.error;
                    return;
                }

                securityAnswer = jsonObject.securityAnswer;
                securityQuestion = jsonObject.securityQuestion;
                console.log(securityQuestion);
                changeLayout();
            }
        };
        xhr.send(jsonPayload);
    } catch (err) {
        console.log(err.message);
    }
}

function changeLayout() {
    document.getElementById("beforeAnswerVerify").style.display = "none";
    document.getElementById("answerVerify").style.display = "flex";

    document.getElementById("securityQuestion").textContent = securityQuestion;
}

function doVerify() {
    let securityAns = document.getElementById("securityAns").value;

    let tmp = {
        login: username,
        securityAnswer: securityAns
    };

    let jsonPayload = JSON.stringify(tmp);
    let url = urlBase + '/verifySecurityAnswer.' + extension;

    let xhr = new XMLHttpRequest();
    xhr.open("POST", url, true);
    xhr.setRequestHeader("Content-type", "application/json; charset=UTF-8");

    try {
        xhr.onreadystatechange = function () {
            if (this.readyState == 4 && this.status == 200) {
                let jsonObject = JSON.parse(xhr.responseText);

                if (jsonObject.error) {
                    document.getElementById("tryAgain").innerHTML = jsonObject.error;
                    return;
                }

                document.getElementById("answerVerify").style.display = "none";
                document.getElementById("changePass").style.display = "flex";
            }
        };
        xhr.send(jsonPayload);
    } catch (err) {
        console.log(err.message);
    }
}

function changePassword(){
    let password = document.getElementById("newPassword");
    let passwordConfirm = document.getElementById("verifyNewPassword");

    if (!password.value || !passwordConfirm.value) {
        document.getElementById("newPasswordResult").innerHTML = "All fields are required.";
        return;
    }

    if (password.value !== passwordConfirm.value) {
        document.getElementById("newPasswordResult").innerHTML = "Passwords do not match.";
        password.value = "";
        passwordConfirm.value = "";
        return;
    }

    const passwordRegex = /^(?=.*[A-Z])(?=.*\d).+$/;
    if (!passwordRegex.test(password.value)) {
        document.getElementById("newPasswordResult").innerHTML = "Password does not meet requirements.";
        return;
    }
    
    let tmp = 
    {
        "login": username,
        "password": password.value
    }

    let jsonPayload = JSON.stringify(tmp);

    let url = urlBase + '/updatePassword.' + extension;


    let xhr = new XMLHttpRequest();
    xhr.open("POST", url, true);
    xhr.setRequestHeader("Content-type", "application/json; charset=UTF-8");

    try {
        xhr.onreadystatechange = function () {
            if (this.readyState == 4 && this.status == 200) {
                let jsonObject = JSON.parse(xhr.responseText);
                
                if(jsonObject.error){
                    document.getElementById("newPasswordResult").innerHTML = jsonObject.error;
                    return;
                }
                else {
                    document.getElementById("newPasswordResult").innerHTML = jsonObject.message;
                }

                window.location.href = "index.html";
            }
        };

        xhr.send(jsonPayload);
    } catch (err) {
        document.getElementById("registerResult").innerHTML = err.message;
    }
}

function togglePasswordsVisibility() {
    const passwordField = document.getElementById('newPassword');
    const confirmPasswordField = document.getElementById('verifyNewPassword');
    const lockIcon = document.getElementById('lockIcon');

    if (passwordField.type === 'password' && confirmPasswordField.type === 'password') {
        passwordField.type = 'text';
        confirmPasswordField.type = 'text';
        lockIcon.alt = 'Hide Passwords';
        lockIcon.src = 'unlock.png';
    } else {
        passwordField.type = 'password';
        confirmPasswordField.type = 'password';
        lockIcon.alt = 'Show Passwords';
        lockIcon.src = 'lock.png';
    }
}