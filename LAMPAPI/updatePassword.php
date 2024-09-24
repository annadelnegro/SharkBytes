<?php

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit();
}

$inData = getRequestInfo();
$username = $inData["login"];
$password = $inData["password"];

$conn = new mysqli("localhost", "TheBeast", "WeLoveCOP4331", "COP4331"); 
if ($conn->connect_error) {
    returnWithError($conn->connect_error);
} else {
    // Assuming $password and $username are already set and sanitized
    // Hash the password before saving it
    $hashedPassword = password_hash($password, PASSWORD_DEFAULT);
    
    $stmt = $conn->prepare("UPDATE Users SET Password=? WHERE Login=?");
    $stmt->bind_param("ss", $hashedPassword, $username);
    $stmt->execute();

    // Check if any rows were affected
    if ($stmt->affected_rows > 0) {
        returnWithInfo("Password reset successful");
    } else {
        returnWithError("Unable to reset password");
    }

    $stmt->close();
    $conn->close();
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
    $retValue = '{"error":"' . $err . '"}';
    sendResultInfoAsJson($retValue);
}

function returnWithInfo($info)
{
    $retValue = '{"message":"' . $info . '"}';
    sendResultInfoAsJson($retValue);
}

?>
