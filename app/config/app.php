<?php


use PrivateHeberg\Flat\Object\DBENGINE;
use PrivateHeberg\Flat\Object\FIREWALLPOLICY;

$_CONFIG = [
    'uri'                   => 'http://127.0.0.1',
    'environement'          => 'dev',
    'lang'                  => 'FR',
    'listener'              => [
        DefaultListener::class,
    ],
    'firewallDefaultPolicy' => FIREWALLPOLICY::REJECT,
    'dirs'                  => [
        'router'          => [
            __DIR__ . '/routing.php'
        ],
        'static_template' => __DIR__ . '/../../resource/static_view',
        'dyn_template'    => __DIR__ . '/../../resource/dyn_view',
        'tmp'             => __DIR__ . '/../tmp',
        'trans'           => __DIR__ . '/../trans',
        'replace'         => __DIR__ . '/../replacer',
        'permissions'     => __DIR__ . '/../permissions',
        'global'          => __DIR__ . '/../config/global.php'
    ],
    'database'              => [
        [
            'host'     => '',
            'username' => '',
            'password' => '',
            'database' => '',
            'engine'   => DBENGINE::MYSQL
        ]
    ],
    'module'                => [
        'PHPMailer' => [
            [
                'smtp_server'   => '',
                'smtp_port'     => '',
                'smtp_username' => '',
                'smtp_password' => '',
                'smtp_name'     => '',
            ]

        ]
    ],
    'conf'                  => [
        '404' => [
            'url' => '/404',
            'route' => 'Error@on404'
        ],
    ]

];

define('_CONFIG', $_CONFIG);
