Guide d'installation de FlatFramework
-------------------------------------

Pour commencer nous allons commencer par installer PHP, nous utiliserons la version 7.
Pour installer PHP 7 vous devez avoir ca-certificates d'installer sur votre machine si ce n'est pas le cas exécuté la commande suivante :

    apt-get install ca-certificates

Ensuite vous pouvez installer les prérequis pour l'installation de  PHP via les commandes suivantes :

    echo "deb http://packages.dotdeb.org jessie all" > /etc/apt/sources.list.d/dotdeb.list
    wget -O- https://www.dotdeb.org/dotdeb.gpg | apt-key add -
    apt update

Note : Si PHP 5 est installer vous devez le désinstaller via les commandes suivantes :

    systemctl stop php5-fpm
    apt-get autoremove --purge php5


**Il est possible d'utilisé Flat Framework sur apache mais nous recommandons Nginx L'instllation qui suit sera donc sous nginx**

Vous pouvez maintenant installer PHP via c'est commandes :

    apt install php7.0 php7.0-fpm php7.0-mysql php7.0-curl php7.0-json php7.0-gd php7.0-mcrypt php7.0-msgpack php7.0-memcached php7.0-intl php7.0-sqlite3 php7.0-gmp php7.0-geoip php7.0-mbstring php7.0-xml php7.0-zip

nous allons maintenant installé nginx

    apt install nginx

Nous installons git pour récupéré le framework

    apt install git

Nous devons ensuite nous rendre dans le dossier courant de notre site web (la plupart du temps "/var/www/html/")

    cd /var/www/html/
    git clone https://github.com/PHMarc/FlatFramework.git

Nous allons maintenant configuré Ngnix pour FlatFramework

NOTE: Il est obligatoire d'avoir un FQDN (Fully qualified domaine name)  pour utilisé flat sinon vous ne pourrez pas utiliser le realtime proposer par le framework.

Pour configuré ngnix nous devons nous rendre dans /etc/nginx/sites-enabled/

    cd /etc/nginx/sites-enabled/


Dans ce dossier il y a un fichier "default" il faut édité ce fichier comme l'exemple suivant le montre :

    ################################## default ##################################
    map $http_upgrade $connection_upgrade {
            default upgrade;
            '' close;
    }
    upstream websocket {
    	#Liste de votre/vos serveur(s) socket le port doit par convention etre > à 1024 jusqu'a 65535
            server 127.0.0.1:1027;
    }

    server {
       listen 80;
       server_name %%NOMDEDOMAINE%%;
       return 301 https://$host$request_uri;
    }

    server {
            listen 443;

            root %%DOSSIEROUCESITUELEFRAMEWORK%%/public/;

            ssl on;
            ssl_certificate /root/ssl/cacert.pem;
            ssl_certificate_key /root/ssl/privkey.pem;

            server_name %%NOMDEDOMAINE%%;

              location /wss/ {


                proxy_pass http://websocket;
                proxy_http_version 1.1;
                proxy_set_header Upgrade $http_upgrade;
                proxy_set_header Connection $connection_upgrade;
            }
            location / {

                    try_files $uri /index.php$is_args$args;
                    fastcgi_param   HTTPS               on;
                    fastcgi_param   HTTP_SCHEME         https;

            }
            location ~ ^/(index)\.php(/|$) {
                    fastcgi_pass unix:/run/php/php7.0-fpm.sock;
                    fastcgi_split_path_info ^(.+\.php)(/.*)$;
                    include snippets/fastcgi-php.conf;
                    fastcgi_param SCRIPT_FILENAME $realpath_root$fastcgi_script_name;
                    fastcgi_param DOCUMENT_ROOT $realpath_root;
            }


            location ~ ^/index\.php(/|$) {
                    fastcgi_pass unix:/run/php/php7.0-fpm.sock;
                    fastcgi_param SCRIPT_FILENAME $document_root$fastcgi_script_name;
                    fastcgi_split_path_info ^(.+\.php)(/.*)$;
                    include snippets/fastcgi-php.conf;
                    fastcgi_param SCRIPT_FILENAME $realpath_root$fastcgi_script_name;
                    fastcgi_param DOCUMENT_ROOT $realpath_root;
                    internal;
            }
            location ~ \.php$ {
                    return 404;
            }



            error_log /var/log/nginx/%%NOMDEDOMAINE%%_error.log;
            access_log /var/log/nginx/%%NOMDEDMOAINE%%_access.log;
    }



    ############################### end default #################################

Avant de redémarrer nginx il vous faut un certificat SSL
nous allons donc installé les composant pour et généré le certificat

Note: ce cetificat n'est pas reconnus par une autorité de certfication il affichera donc une alert a touts les utilisateurs qui accederons au site Vous pouvez utilisé CloudFalre pour emulé la certification de votre certificat ou utilisé votre propre certificat signé!

    cd /root/
    mkdir ssl
    cd ssl
    openssl req -x509 -nodes -days 365 -newkey rsa:2048 -keyout  /root/ssl/privkey.pem -out  /root/ssl/cacert.pem

il faut ensuite restart nginx

    /etc/init.d/nginx restart

Vous devez ensuite configurer quelques permissions .

    cd /var/www/html/FlatFramework/
    chmod 777 -Rf app/tmp/
    chmod 777 -Rf resource/


Vous venez d'installer flatFramework nous allons maintenant passez a son étape de configuration.

Nous allons commencer par configurer  app/config/app.php

     nano app/config/app.php


        <?php


    use PrivateHeberg\Flat\Object\DBENGINE;
    use PrivateHeberg\Flat\Object\FIREWALLPOLICY;

    $_CONFIG = [
        'uri'                   => 'https://VotreSiteICI/',  
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
                'database' => 'web',
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

        ]

    ];

    define('_CONFIG', $_CONFIG);


Je vous invite a configurer votre base de donnée si vous en utilisez une.

Si vous voulez utilisé les fonctionnalité du réaltime il est alors nécessaire de configuré le luncher du serveur socket
il faudra donc installé screen afin de demarrer/stopper  les instances du serveur socket

    apt install screen

maintenant nous allons nous rendre dans /home et créer un fichier start_socket.sh

    cd /home && nano start_socket.sh

    ##################### start_socket.sh #####################################
    #!/bin/bash

    if [ $1 =  "start" ];  then
    screen -S SOCKET1027 -dm bash -c "while sleep 2; do php -q /var/www/html/FlatFramework/bin/socket.php 1027; done";
    fi

    if [ $1 = "stop" ];  then
    screen -S SOCKET1027 -X quit;
    fi

    ################### end start_socket.sh ####################################

> Note : si vous avez configuré plusieurs serveur socket dans ngnix il
> sera nécessaire d'adapté ce fichier
>
> Note : si vous choisissez de lancé plusieurs instance de serveur
> socket il sera alors néssaisare d'édité la configuration de ngnix

Pour lancé le(s) serveur(s) socket

    sh /home/start_socket.sh start

Pour stoppé le(s) serveur(s) socket (empéchera toute navigation sur votre site internet et empêchera le chargement des éléments load dynamiquement)

    sh /home/start_socket.sh stop
