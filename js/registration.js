
const urlBase = 'http://cop4331-team10.xyz/LAMPAPI';
const extension = 'php';

let userId = 0;
let firstName = "";
let lastName = "";


function doRegister() {

    let username = document.getElementById("registerName").value;
    let password = document.getElementById("registerPassword").value;
    let confirmPassword = document.getElementById("confirmPassword").value;
    firstName = document.getElementById("registerFirstName").value;
    lastName = document.getElementById("registerLastName").value;
    
    let securityQuestion = document.getElementById("securityQuestion").value;
    let securityAnswer = document.getElementById("securityAnswer").value;

    if (!username || !password || !confirmPassword || !firstName || !lastName || !securityQuestion || !securityAnswer) {
        document.getElementById("registerResult").innerHTML = "All fields are required.";
        return;
	}

    if (/\s/.test(username)) {
        document.getElementById("registerResult").innerHTML = "Username cannot contain spaces.";
        return;
    }

    const passwordRegex = /^(?=.*[A-Z])(?=.*\d).+$/;
    if (!passwordRegex.test(password)) {
        document.getElementById("registerResult").innerHTML = "Password does not meet requirements.";
        return;
    }

	//Check for password match
    if (password !== confirmPassword) {
        document.getElementById("registerResult").innerHTML = "Passwords do not match.";
        return;
    }

    let tmp = {
        login: username,
        password: password,
        firstName: firstName,
        lastName: lastName,
        securityQuestion: securityQuestion,
        securityAnswer: securityAnswer
    };
    let jsonPayload = JSON.stringify(tmp);


    let url = urlBase + '/Register.' + extension;
    

    let xhr = new XMLHttpRequest();
    xhr.open("POST", url, true);
    xhr.setRequestHeader("Content-type", "application/json; charset=UTF-8");
    
    try {

        xhr.onreadystatechange = function() {
            if (this.readyState == 4 && this.status == 200) {
                let jsonObject = JSON.parse(xhr.responseText);
				userId = jsonObject.id;
                // Check for errors
                if (userId == -1) {
                    document.getElementById("registerResult").innerHTML = "Username already exist";
                    const login = document.querySelector(".login-container");
					login.classList.add("active");
                } else if (userId == 0) {
                    document.getElementById("registerResult").innerHTML = "Registration invalid";
				
                } else {
                    document.getElementById("registerResult").innerHTML = "Registration successful!";
					const login = document.querySelector(".login-container");
					login.classList.add("active");
                }
            }
        };
        
   
        xhr.send(jsonPayload);
    } catch (err) {
        document.getElementById("registerResult").innerHTML = err.message;
    }
}

function togglePasswordsVisibility() {
    const passwordField = document.getElementById('registerPassword');
    const confirmPasswordField = document.getElementById('confirmPassword');
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