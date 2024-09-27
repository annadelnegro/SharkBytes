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
$userAnswer = $inData["securityAnswer"];

$conn = new mysqli("localhost", "TheBeast", "WeLoveCOP4331", "COP4331"); 
if ($conn->connect_error) {
    returnWithError($conn->connect_error);
} else {
    $stmt = $conn->prepare("SELECT SecurityAnswer FROM Users WHERE Login=?");
    $stmt->bind_param("s", $username);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows > 0) {
        $row = $result->fetch_assoc();
        $hashedAnswer = $row['SecurityAnswer'];

        if (password_verify($userAnswer, $hashedAnswer)) {
            returnWithSuccess("Security answer verified");  // Send success response
        } else {
            error_log("Incorrect security answer");
            returnWithError("Incorrect security answer.");
        }
    } else {
        returnWithError("User not found.");
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
    $retValue = json_encode(["error" => $err]);
    sendResultInfoAsJson($retValue);
}

function returnWithSuccess($mes)
{
    $retValue = json_encode(["message" => $mes]);
    sendResultInfoAsJson($retValue);
}

?>