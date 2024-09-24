const urlBase = 'http://cop4331-team10.xyz/LAMPAPI';
const extension = 'php';

let userId = 0;
let firstName = "";
let lastName = "";

let currentPage = 1;
const contactsPerPage = 5;
let allContacts = [];


// display the current users name in the dashboard 
document.addEventListener("DOMContentLoaded", function() {
    if (document.getElementById("title-dashboard")) {
        displayUserName();  
    }
});
function displayUserName() {
    readCookie(); 

   
    if (userId > 0) {
        let titleDashboard = document.getElementById("title-dashboard");
        titleDashboard.innerHTML = "Hello, " + firstName + " " + lastName;
        console.log( titleDashboard.innerHTML);
    }
}


// Update contactList to fetch and store all contacts
function contactList() {
    readCookie();
    let url = urlBase + '/Contactlist.' + extension;
    let tmp = { userId: userId };
    let jsonPayload = JSON.stringify(tmp);

    let xhr = new XMLHttpRequest();
    xhr.open("POST", url, true);
    xhr.setRequestHeader("Content-type", "application/json; charset=UTF-8");
    xhr.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
            let jsonObject;
            try {
                jsonObject = JSON.parse(xhr.responseText);
                if (jsonObject.error) {
                    console.error(jsonObject.error);
                    allContacts = [];
                } else {
                    allContacts = jsonObject.contacts || [];
                }
                displayContacts(); // Display the first page
            } catch (parseError) {
                console.error("Error parsing response:", parseError);
                allContacts = [];
                displayContacts();
            }
        }
    };
    xhr.send(jsonPayload);
}

// Display contacts based on the current page
function displayContacts() {
    const tableBody = document.querySelector('.table-container tbody');
    tableBody.innerHTML = '';

    const startIndex = (currentPage - 1) * contactsPerPage;
    const endIndex = startIndex + contactsPerPage;
    let contactsToDisplay = allContacts.slice(startIndex, endIndex);
    

    if (contactsToDisplay.length === 0) {
        tableBody.innerHTML = '<tr class="contact-row"><td colspan="5">No contacts found.</td></tr>';
        return;
    }

    contactsToDisplay.forEach(contact => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${contact.Name || 'N/A'}</td>
            <td>${contact.Phone || 'N/A'}</td>
            <td>${contact.Email || 'N/A'}</td>
            <td><a href="updateContact.html?id=${contact.ID}&name=${contact.Name}&phone=${contact.Phone}&email=${contact.Email}"><i class="fa-solid fa-pen"></i></a>
            <i class="fa-solid fa-trash" onclick="confirmDelete(${contact.ID})"></i></td>
        `;
        tableBody.appendChild(row);
    });

    updatePaginationInfo();
}

// Change the page number
function changePage(direction) {
    const totalPages = Math.ceil(allContacts.length / contactsPerPage);
    currentPage += direction;

    if (currentPage < 1) {
        currentPage = 1;
    } else if (currentPage > totalPages) {
        currentPage = totalPages;
    }
    updatePaginationInfo()
    displayContacts();
}

// Update pagination info
function updatePaginationInfo() {
    const totalPages = Math.ceil(allContacts.length / contactsPerPage);
    
    //Remove the disable class from the pagination buttons
    let buttons = document.getElementsByClassName("pagination-button")
    for (let btn of buttons) {
        btn.classList.remove("pagination-button-disabled");
    }

    if (currentPage == 1) {
        buttons[0].classList.add("pagination-button-disabled");
    }

    if (currentPage == totalPages) {
        buttons[1].classList.add("pagination-button-disabled");
    }

    document.getElementById('pageInfo').innerText = `Page ${currentPage} of ${totalPages}`;

    /*
    document.getElementById('prevPage').disabled = (currentPage === 1);
    document.getElementById('nextPage').disabled = (currentPage === totalPages);
    */
}

function doLogin() {
	useraId = 0;
	firstName = "";
	lastName = "";

	let login = document.getElementById("loginName").value;
	let password = document.getElementById("loginPassword").value;
	//	var hash = md5( password );
	let contact = document.getElementById("contctName")

	document.getElementById("loginResult").innerHTML = "";

	let tmp = { login: login, password: password };
	//	var tmp = {login:login,password:hash};
	let jsonPayload = JSON.stringify(tmp);

	let url = urlBase + '/Login.' + extension;

	let xhr = new XMLHttpRequest();
	xhr.open("POST", url, true);
	xhr.setRequestHeader("Content-type", "application/json; charset=UTF-8");
	try {
		xhr.onreadystatechange = function () {
			if (this.readyState == 4 && this.status == 200) {
				let jsonObject = JSON.parse(xhr.responseText);
				userId = jsonObject.id;

				if (userId < 1) {
					document.getElementById("loginResult").innerHTML = "User/Password combination incorrect";
					return;
				}

				firstName = jsonObject.firstName;
				lastName = jsonObject.lastName;

				saveCookie(firstName, lastName, userId);
				window.location.href = "dashboard.html";


			}
		};
		xhr.send(jsonPayload);

	}
	catch (err) {
		document.getElementById("loginResult").innerHTML = err.message;
	}

}





function doRegister() {

	let username = document.getElementById("registerName").value;
	let password = document.getElementById("registerPassword").value;
	let confirmPassword = document.getElementById("confirmPassword").value;
	let firstName = document.getElementById("registerFirstName").value;
	let lastName = document.getElementById("registerLastName").value;


	if (password !== confirmPassword) {
		document.getElementById("registerResult").innerHTML = "Passwords do not match.";
		return;
	}


	let tmp = {
		login: username,
		password: password,
		firstName: firstName,
		lastName: lastName
	};
	let jsonPayload = JSON.stringify(tmp);


	let url = urlBase + '/Register.' + extension;


	let xhr = new XMLHttpRequest();
	xhr.open("POST", url, true);
	xhr.setRequestHeader("Content-type", "application/json; charset=UTF-8");

	try {

		xhr.onreadystatechange = function () {
			if (this.readyState == 4 && this.status == 200) {
				let jsonObject = JSON.parse(xhr.responseText);
				userId = jsonObject.id;
				// Check for errors
				if (userId == -1) {
					document.getElementById("registerResult").innerHTML = "username already exist";

				} else if (userId == 0) {
					document.getElementById("registerResult").innerHTML = "registration invalid";
					const login = document.querySelector(".login-container");
					login.classList.add("active");
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

function confirmDelete(contactID) {

	let choice = confirm(`Are you sure you want to delete contact with ID: ${contactID}`)
	//console.log(`Deleting contact with ID: ${contactID}`)

	if (choice) {
		console.log("Deleting contact")
		deleteContact(contactID)
	} else {
		console.log("Not deleting contact")
	}

}

function saveCookie(firstName, lastName, userId) {
	let minutes = 20;
	let date = new Date();
	date.setTime(date.getTime() + (minutes * 60 * 1000));
	document.cookie = "firstName=" + firstName + ",lastName=" + lastName + ",userId=" + userId + ";expires=" + date.toGMTString();
}

function readCookie() {
	userId = -1;
	let data = document.cookie;
	let splits = data.split(",");
	for (var i = 0; i < splits.length; i++) {
		let thisOne = splits[i].trim();
		let tokens = thisOne.split("=");
		if (tokens[0] == "firstName") {
			firstName = tokens[1];
		}
		else if (tokens[0] == "lastName") {
			lastName = tokens[1];
		}
		else if (tokens[0] == "userId") {
			userId = parseInt(tokens[1].trim());
		}
	}

	if (userId < 0) {
		window.location.href = "index.html";
	}
	else {
		//		document.getElementById("userName").innerHTML = "Logged in as " + firstName + " " + lastName;
	}
}

function doLogout() {
	userId = 0;
	firstName = "";
	lastName = "";
	document.cookie = "firstName= ; expires = Thu, 01 Jan 1970 00:00:00 GMT";
	window.location.href = "index.html";
}

function addContact() {
	readCookie();
    let name = document.getElementById("contactName").value;
    let phone = document.getElementById("contactPhone").value;
    let email = document.getElementById("contactEmail").value;

	if (!name || !phone || !email) {
        document.getElementById("contactAddResult").innerHTML = "All fields are required.";
        return;
	}

    if (!isValidPhoneNumber(phone)) {
        document.getElementById("contactAddResult").innerHTML = "Invalid phone number format. Please use xxx-xxx-xxxx.";
        return;
    }

    if (!isValidEmail(email)) {
        document.getElementById("contactAddResult").innerHTML = "Invalid email format.";
        return;
    }

    document.getElementById("contactAddResult").innerHTML = "";

    let tmp = { name: name, phone: phone, email: email, userId: userId }; // Pass userId to the payload
    let jsonPayload = JSON.stringify(tmp);

    let url = urlBase + '/addContact.' + extension;

    let xhr = new XMLHttpRequest();
    xhr.open("POST", url, true);
    xhr.setRequestHeader("Content-type", "application/json; charset=UTF-8");

    xhr.onreadystatechange = function () {
        if (this.readyState === 4) {
            if (this.status === 200) {
                document.getElementById("contactAddResult").innerHTML = "Contact has been added";
			   const login = document.querySelector(".login-container");
			   login.classList.add("active");
			  // window.location.reload();
			  
            } else {
                document.getElementById("contactAddResult").innerHTML = "Error: " + this.statusText;
            }
        }
    };

    try {
        xhr.send(jsonPayload);
    } catch (err) {
        document.getElementById("contactAddResult").innerHTML = "Error: " + err.message;
    }
}

function isValidPhoneNumber(phone) {
    let phonePattern = /^\d{3}-\d{3}-\d{4}$/;
    return phonePattern.test(phone);
}

function isValidEmail(email) {
    let emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailPattern.test(email);
}


function deleteContact(contactId) {
 
    // Prepare JSON payload
    let tmp = { contactId: contactId };
    let jsonPayload = JSON.stringify(tmp);

    let url = urlBase + '/deleteContact.' + extension;

    let xhr = new XMLHttpRequest();
    xhr.open("POST", url, true);
    xhr.setRequestHeader("Content-type", "application/json; charset=UTF-8");

    xhr.onreadystatechange = function () {
        if (this.readyState === 4) {
            if (this.status === 200) {
                // Handle success
                let response = JSON.parse(xhr.responseText);
                if (response.error) {
                   console.log("Contact has not been Deleted")
                } else {
                    console.log("Contact was deleted")
					//Remove existing contact rows
					//Get the contacts again and repopulate the table
					contactList()
                }
            } else {
                // Handle error
                document.getElementById("deleteResult").innerHTML = "Error: " + this.statusText;
            }
        }
    };
    
    try {
        xhr.send(jsonPayload);
    } catch (err) {
        document.getElementById("deleteResult").innerHTML = "Error: " + err.message;
    }
}

function deleteContactOLD() {
    // Collect the contact ID from the input field
    let contactId = document.getElementById("contactId").value;
	
    // Clear any previous result messages
    document.getElementById("deleteResult").innerHTML = "";

    // Prepare JSON payload
    let tmp = { contactId: contactId };
    let jsonPayload = JSON.stringify(tmp);

    let url = urlBase + '/deleteContact.' + extension;

    let xhr = new XMLHttpRequest();
    xhr.open("POST", url, true);
    xhr.setRequestHeader("Content-type", "application/json; charset=UTF-8");

    xhr.onreadystatechange = function () {
        if (this.readyState === 4) {
            if (this.status === 200) {
                // Handle success
                let response = JSON.parse(xhr.responseText);
                if (response.error) {
                    document.getElementById("deleteResult").innerHTML = "Error: " + response.error;
                } else {
                    document.getElementById("deleteResult").innerHTML = "Contact has been deleted";
                }
            } else {
                // Handle error
                document.getElementById("deleteResult").innerHTML = "Error: " + this.statusText;
            }
        }
    };
    
    try {
        xhr.send(jsonPayload);
    } catch (err) {
        document.getElementById("deleteResult").innerHTML = "Error: " + err.message;
    }
}

function searchContacts() {
    readCookie();
    let query = document.getElementById("searchInput").value.trim();

    if (!query) {
        // If the search query is empty, fetch and display all contacts
        contactList();
        return;
    }

    currentPage = 1;

    document.getElementById("searchResult").innerHTML = "";

    console.log("Search query:", query);

    let tmp = { search: query, userId: userId };
    let jsonPayload = JSON.stringify(tmp);

    console.log("Sending payload:", jsonPayload);

    let url = urlBase + '/searchContact.' + extension;
    let xhr = new XMLHttpRequest();
    xhr.open("POST", url, true);
    xhr.setRequestHeader("Content-type", "application/json; charset=UTF-8");

    xhr.onreadystatechange = function() {
        if (this.readyState === 4) {
            console.log("Response received, status:", this.status);

            if (this.status === 200) {
                console.log("Raw server response:", this.responseText);
                try {
                    let response = JSON.parse(this.responseText);
                    console.log("Parsed server response:", response);

                    if (response.error) {
                        displayContacts([]);//if no contacts contain the substring
                        return;
                    }

                    let results = response.results; // Access the results array from the response
                    console.log("Results array:", results);

                    if (Array.isArray(results) && results.length > 0) {
                        allContacts = results
                        displayContacts(); // Assuming displayContacts can handle the array correctly
                    } else {
                        document.getElementById("searchResult").innerHTML = "No contacts found.";
                    }
                } catch (err) {
                    console.error("Error parsing JSON response:", err);
                    document.getElementById("searchResult").innerHTML = "Error parsing response.";
                }
            } else {
                console.error("Request failed, status:", this.statusText);
                document.getElementById("searchResult").innerHTML = "Error: " + this.statusText;
            }
        }
    };

    try {
        xhr.send(jsonPayload);
    } catch (err) {
        console.error("Error sending request:", err);
        document.getElementById("searchResult").innerHTML = "Error: " + err.message;
    }
}

function updateContact() {
    // Collect the contact ID and new details from input fields
    let contactId = document.getElementById("contactId").value;
    let contactName = document.getElementById("contactName").value;
    let contactPhone = document.getElementById("contactPhone").value;
    let contactEmail = document.getElementById("contactEmail").value;

    // Clear any previous result messages
    document.getElementById("updateResult").innerHTML = "";

    // Prepare JSON payload
    let tmp = {
        id: parseInt(contactId),
        name: contactName,
        phone: contactPhone,
        email: contactEmail
    };
    let jsonPayload = JSON.stringify(tmp);

    let url = urlBase + '/updateContact.' + extension;

    let xhr = new XMLHttpRequest();
    xhr.open("POST", url, true);
    xhr.setRequestHeader("Content-type", "application/json; charset=UTF-8");

    xhr.onreadystatechange = function () {
        if (this.readyState === 4) {
            if (this.status === 200) {
                // Handle success
                let response = JSON.parse(xhr.responseText);
                if (response.error) {
                    document.getElementById("updateResult").innerHTML = "Error: " + response.error;
                } else {
                    document.getElementById("updateResult").innerHTML = "Contact updated successfully.";
                }
            } else {
                // Handle error
                document.getElementById("updateResult").innerHTML = "Error: " + this.statusText;
            }
        }
    };
    
    try {
        xhr.send(jsonPayload);
    } catch (err) {
        document.getElementById("updateResult").innerHTML = "Error: " + err.message;
    }
}

function updateContact_populate() {

	let contactInfo = new URLSearchParams(window.location.search)

	console.log(contactInfo.get("name"))

	document.getElementById("contactName").value = contactInfo.get("name")
	document.getElementById("contactPhone").value = contactInfo.get("phone")
	document.getElementById("contactEmail").value = contactInfo.get("email")
	document.getElementById("contactId").value = contactInfo.get("id")
}

function togglePasswordVisibility() {
    const passwordInput = document.getElementById("loginPassword");
    const lockIcon = document.getElementById("lockIcon");

    if (passwordInput.type === "password") {
        passwordInput.type = "text";
        lockIcon.src = "unlock.png"; // Change the lock icon to unlocked (you'll need an "unlock.png" image)
    } else {
        passwordInput.type = "password";
        lockIcon.src = "lock.png"; // Change back to locked icon
    }
}