<?php

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
        http_response_code(200);
        exit();
    }

function getRequestInfo()
{
    return json_decode(file_get_contents('php://input'), true);
}

function sendResultInfoAsJson($obj)
{
    header('Content-type: application/json');
    echo $obj;
}

function returnWithError($err)
{
    $retValue = '{"id":0,"error":"' . $err . '"}';
    sendResultInfoAsJson($retValue);
}

function returnWithSuccess($id)
{
    $retValue = '{"id":' . $id . ',"error":""}';
    sendResultInfoAsJson($retValue);
}

$inData = getRequestInfo();

$name = $inData["name"];
$phone = $inData["phone"];
$email = $inData["email"];
$userId = $inData["userId"];  

$conn = new mysqli("localhost", "TheBeast", "WeLoveCOP4331", "COP4331"); 

if ($conn->connect_error) 
{
    returnWithError($conn->connect_error);
} 
else 
{
    // INSERT the contact along with the UserID
    $stmt = $conn->prepare("INSERT INTO Contacts (name, phone, email, UserID) VALUES (?, ?, ?, ?)");
    $stmt->bind_param("sssi", $name, $phone, $email, $userId);

    if ($stmt->execute()) 
    {
        $id = $conn->insert_id;
        returnWithSuccess($id);  // Send success message with the inserted contact's ID
    } 
    else 
    {
        returnWithError($stmt->error);
    }

    $stmt->close();
    $conn->close();
}

?>
