<?php
$host = 'localhost';
$user = 'root'; // default user Laragon
$pass = '';     // default password kosong
$dbname = 'todo_db';

$conn = new mysqli($host, $user, $pass, $dbname);

if ($conn->connect_error) {
    die("Koneksi gagal: " . $conn->connect_error);
}
?>
