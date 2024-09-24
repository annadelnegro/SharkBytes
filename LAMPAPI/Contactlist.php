<?php

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
        http_response_code(200);
        exit();
    }

ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

function getRequestInfo()
{
    return json_decode(file_get_contents('php://input'), true);
}

function sendResultInfoAsJson($obj)
{
    header('Content-type: application/json');
    echo json_encode($obj);
}

function sendResponse($contacts = [], $error = "")
{
    $response = ['contacts' => $contacts, 'error' => $error];
    sendResultInfoAsJson($response);
}

$inData = getRequestInfo();

if (!isset($inData["userId"]) || !is_numeric($inData["userId"])) {
    sendResponse([], "Invalid UserID");
    exit();
}

$conn = new mysqli("localhost", "TheBeast", "WeLoveCOP4331", "COP4331");

if ($conn->connect_error) 
{
    sendResponse([], "Connection failed: " . $conn->connect_error);
} 
else 
{
    $stmt = $conn->prepare("SELECT ID, Name, Phone, Email FROM Contacts WHERE UserID=?");
    
    if (!$stmt) {
        sendResponse([], "Failed to prepare SQL statement: " . $conn->error);
        exit();
    }

    if (!$stmt->bind_param("i", $inData["userId"])) {
        sendResponse([], "Failed to bind parameters: " . $stmt->error);
        exit();
    }

    if (!$stmt->execute()) {
        sendResponse([], "Failed to execute SQL statement: " . $stmt->error);
        exit();
    }

    $result = $stmt->get_result();
    $contacts = [];
    
    while ($row = $result->fetch_assoc())
    {
        $contacts[] = [
            "Name" => htmlspecialchars($row["Name"]),
            "Phone" => htmlspecialchars($row["Phone"]),
            "Email" => htmlspecialchars($row["Email"]),
            "ID" => $row["ID"]
            
        ];
    }
    
    if (count($contacts) == 0)
    {
        sendResponse([], "No Contacts Found");
    }
    else
    {
        sendResponse($contacts);
    }

    $stmt->close();
    $conn->close();
}

?>
