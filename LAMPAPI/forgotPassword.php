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

$conn = new mysqli("localhost", "TheBeast", "WeLoveCOP4331", "COP4331"); 
if ($conn->connect_error) {
    returnWithError($conn->connect_error);
} else {
    $stmt = $conn->prepare("SELECT ID, SecurityQuestion, SecurityAnswer FROM Users WHERE Login=?");
    $stmt->bind_param("s", $username);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows > 0) {
        $row = $result->fetch_assoc();
        $id = $row['ID'];
        $securityQuestion = $row['SecurityQuestion'];
        $securityAnswer = $row['SecurityAnswer'];

        returnWithSecurityInfo($id, $securityQuestion, $securityAnswer);
    } else {
        returnWithError("Username not found");
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
    $retValue = '{"id":0,"securityQuestion":"","securityAnswer":"","error":"' . $err . '"}';
    sendResultInfoAsJson($retValue);
}

function returnWithSecurityInfo($id, $securityQuestion, $securityAnswer)
{
    $retValue = '{"id":' . $id . ',"securityQuestion":"' . $securityQuestion . '","securityAnswer":"' . $securityAnswer . '","error":""}';
    sendResultInfoAsJson($retValue);
}

?>
