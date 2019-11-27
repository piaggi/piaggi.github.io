<?php
if($_POST){
    $name = $_POST['name'];
    $email = $_POST['email'];
    $subject = "[Wiadomość ze strony sapiezko.pl]: ".$__POST['subject'];
    $message = $_POST['subject'];
    $header = "From:".$email."\nContent-Type:".
    			' text/plain;charset="utf-8"'.
    			"\nContent-Transfer-Encoding: 8bit";
    mail("piaggi@wp.pl", $subject, $message, $header);
}
?>