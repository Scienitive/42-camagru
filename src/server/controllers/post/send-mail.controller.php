<?php

$url = "https://api.sendgrid.com/v3/mail/send";
$api_key = $_ENV['SENDGRID_API_KEY'];

$to = $_POST['email'];
$subject = $_POST['subject'];
$content = $_POST['content'];

$data = [
    "personalizations" => [
        [
            "to" => [
                [
                    "email" => $to
                ]
            ]
        ]
    ],
    "from" => [
        "email" => "camagru.alyasar@gmail.com"
    ],
    "subject" => $subject,
    "content" => [
        [
            "type" => "text/plain",
            "value" => $content
        ]
    ]
];

$ch = curl_init($url);
curl_setopt($ch, CURLOPT_POST, 1);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
curl_setopt($ch, CURLOPT_HTTPHEADER, array(
    'Content-Type: application/json',
    'Authorization: Bearer ' . $api_key
));
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);

$response = curl_exec($ch);

if (curl_errno($ch)) {
    http_response_code(500); // 500 Internal Server Error
    echo "Server can't send mails right now.";
}

$httpStatusCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
http_response_code($httpStatusCode);
if ($httpStatusCode >= 400) {
    echo "Server can't send mails right now.";
}

curl_close ($ch);
exit;
?>