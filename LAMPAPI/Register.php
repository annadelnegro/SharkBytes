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

function returnWithError2($err)
{
    $retValue = '{"id":-1,"error":"' . $err . '"}';
    sendResultInfoAsJson($retValue);
}

function returnWithSuccess($id)
{
    $retValue = '{"id":' . $id . ',"error":""}';
    sendResultInfoAsJson($retValue);
}

$inData = getRequestInfo();

$login = $inData["login"];
$hashedPassword = password_hash($inData["password"], PASSWORD_DEFAULT);
$firstName = $inData["firstName"];
$lastName = $inData["lastName"];
$securityQuestion = $inData["securityQuestion"];
$securityAnswer = password_hash($inData["securityAnswer"], PASSWORD_DEFAULT);


$conn = new mysqli("localhost", "TheBeast", "WeLoveCOP4331", "COP4331"); 

if ($conn->connect_error) 
{
    returnWithError($conn->connect_error);
} 
else 
{
    $stmt = $conn->prepare("SELECT ID FROM Users WHERE Login=?");
    $stmt->bind_param("s", $login);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows > 0)
    {
        returnWithError2("Username already exists");
    } 
    
    else 
    {
        $stmt = $conn->prepare("INSERT INTO Users (FirstName, LastName, Login, Password, SecurityQuestion, SecurityAnswer) VALUES (?, ?, ?, ?, ?, ?)");
        $stmt->bind_param("ssssss", $firstName, $lastName, $login, $hashedPassword, $securityQuestion, $securityAnswer);

        if ($stmt->execute()) 
        {
            // Retrieve the insert ID from the connection, not the statement
            $id = $conn->insert_id;
            returnWithSuccess($id);
        } 
        else 
        {
            returnWithError($stmt->error);
        }
    }

    $stmt->close();
    $conn->close();
}

?>
