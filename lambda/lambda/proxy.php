<?php
$userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.3';

$requestUri = $_SERVER['REQUEST_URI'];
$scriptName = $_SERVER['SCRIPT_NAME'];
$path = str_replace($scriptName, '', $requestUri);
$query = $_SERVER['QUERY_STRING'];

$allowedHosts = [
    'www.ultimate-guitar.com',
    'tabs.ultimate-guitar.com',
];

if (strpos($path, '/search') === 0) {
    $targetUrl = 'https://www.ultimate-guitar.com/search.php';
    if ($query) {
        $targetUrl .= '?' . $query;
    }
    $host = 'www.ultimate-guitar.com';
} elseif (strpos($path, '/tab/') === 0) {
    $tabPath = substr($path, 5);
    $targetUrl = 'https://tabs.ultimate-guitar.com/tab/' . $tabPath;
    if ($query) {
        $targetUrl .= '?' . $query;
    }
    $host = 'tabs.ultimate-guitar.com';
} else {
    http_response_code(404);
    echo 'Not found';
    exit;
}

$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $targetUrl);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_USERAGENT, $userAgent);
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Accept: text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
    'Accept-Language: en-US,en;q=0.9',
    'Accept-Encoding: gzip, deflate, br',
    'Connection: keep-alive',
    'Upgrade-Insecure-Requests: 1',
]);
curl_setopt($ch, CURLOPT_HEADER, true);
curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
curl_setopt($ch, CURLOPT_TIMEOUT, 30);

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$headerSize = curl_getinfo($ch, CURLINFO_HEADER_SIZE);
curl_close($ch);

$headers = substr($response, 0, $headerSize);
$body = substr($response, $headerSize);

foreach (explode("\r\n", $headers) as $header) {
    if (stripos($header, 'Content-Type:') !== false) {
        header($header);
    }
}

header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

http_response_code($httpCode);
echo $body;
