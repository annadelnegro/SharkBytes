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

function returnWithSuccess($message)
{
    $retValue = '{"message":"' . $message . '","error":""}';
    sendResultInfoAsJson($retValue);
}

$inData = getRequestInfo();
$idToDelete = $inData["contactId"];

$conn = new mysqli("localhost", "TheBeast", "WeLoveCOP4331", "COP4331");

if ($conn->connect_error) {
    returnWithError($conn->connect_error);
} else {
    $conn->begin_transaction();

    try {
        $deleteStmt = $conn->prepare("DELETE FROM Contacts WHERE ID = ?");
        $deleteStmt->bind_param("i", $idToDelete);
        $deleteStmt->execute();
        $deleteStmt->close();

        $conn->query("SET @new_id = 0");
        $conn->query("UPDATE Contacts SET ID = (@new_id := @new_id + 1) ORDER BY ID");

        $conn->query("ALTER TABLE Contacts AUTO_INCREMENT = 1");

        $conn->commit();
        returnWithSuccess("Record deleted and IDs reset successfully.");
    } catch (Exception $e) {
        $conn->rollback();
        returnWithError($e->getMessage());
    }

    $conn->close();
}

?>
