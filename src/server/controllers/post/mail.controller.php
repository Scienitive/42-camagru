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

$result = curl_exec($ch);
if (curl_errno($ch)) {
    echo 'Error:' . curl_error($ch);
}
curl_close ($ch);
exit;
?>