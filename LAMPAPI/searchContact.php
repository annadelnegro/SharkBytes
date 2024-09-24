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
    $retValue = '{"results":[],"error":"' . $err . '"}';
    sendResultInfoAsJson($retValue);
}

function returnWithSuccess($results)
{
    $retValue = '{"results":' . json_encode($results) . ',"error":""}';
    sendResultInfoAsJson($retValue);
}

$inData = getRequestInfo();

$searchTerm = $inData["search"];
$userId = $inData["userId"];

$conn = new mysqli("localhost", "TheBeast", "WeLoveCOP4331", "COP4331");

if ($conn->connect_error) 
{
    returnWithError($conn->connect_error);
} 
else 
{
    $stmt = $conn->prepare("SELECT ID, Name, Phone, Email FROM Contacts WHERE UserID=? AND (Name LIKE ? OR Phone LIKE ? OR Email LIKE ?)");
    $searchTerm = "%" . $searchTerm . "%";
    $stmt->bind_param("isss", $userId, $searchTerm, $searchTerm, $searchTerm);
    $stmt->execute();
    
    $result = $stmt->get_result();

    if ($result->num_rows > 0)
    {
        $searchResults = array();

        while ($row = $result->fetch_assoc())
        {
            $searchResults[] = $row;
        }

        returnWithSuccess($searchResults);
    } 
    else 
    {
        returnWithError("No Records Found");
    }

    $stmt->close();
    $conn->close();
}

?>
