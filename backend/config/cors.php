<?php

$frontendUrls = array_filter(array_map('trim', explode(',', env('FRONTEND_URLS', env('FRONTEND_URL', 'http://127.0.0.1:5173')))));

return [
    'paths' => ['api/*', 'sanctum/csrf-cookie'],
    'allowed_methods' => ['*'],
    'allowed_origins' => [
        ...$frontendUrls,
        'http://localhost:5173',
    ],
    'allowed_origins_patterns' => array_filter([
        env('FRONTEND_URL_PATTERN'),
    ]),
    'allowed_headers' => ['*'],
    'exposed_headers' => [],
    'max_age' => 0,
    'supports_credentials' => false,
];
