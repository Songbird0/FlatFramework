<?php

use PrivateHeberg\Flat\Bootstrap;
use Privateheberg\Flat\Socket\BasePacket;
use PrivateHeberg\Flat\Socket\WebSocket as WebSocketServer;
use PrivateHeberg\Flat\Socket\WebSocketUser;

define('SOCKET', true);

require_once(__DIR__ . '/../app/autoload.php');

/**
 * Mananger du socket server
 * Class Socket
 */
class Socket extends WebSocketServer
{

    /**
     * @param WebSocketUser $user
     * @param BasePacket $message
     */
    protected function onUpdate(WebSocketUser $user, BasePacket $message)
    {
        ob_start();
        new Bootstrap(['socket' => $this, 'user' => $user,  'emulate_route' => $message->path, 'emulate_method' => 'GET', 'update' => true]);
        $buffer_result = ob_get_clean();
        if ($this->isJson($buffer_result)) {
            $this->send($user, $buffer_result);
        } else {
            if (!empty($buffer_result)) {
                $this->logError("Une erreur c'est produite pendant la gestion de l'update" . $buffer_result);
            }

        }


    }

    /**
     * @param WebSocketUser $user
     * @param BasePacket $message
     */
    protected function onPost(WebSocketUser $user, BasePacket $message)
    {
        ob_start();
        new Bootstrap(['socket' => $this, 'emulate_route' => $message->path, 'emulate_method' => 'POST', 'update' => false]);
        $buffer_result = ob_get_clean();
        if ($this->isJson($buffer_result)) {
            $this->send($user, $buffer_result);
        } else {
            if (!empty($buffer_result)) {
                $this->logError("Une erreur c'est produite pendant la gestion de l'update" . $buffer_result);
            }
        }
    }

    /**
     * @param WebSocketUser $user
     * @param BasePacket $message
     */
    protected function onGet(WebSocketUser $user, BasePacket $message)
    {
        ob_start();
        new Bootstrap(['socket' => $this, 'emulate_route' => $message->path, 'emulate_method' => 'GET', 'update' => false]);
        $buffer_result = ob_get_clean();

        if ($this->isJson($buffer_result)) {
            $this->send($user, $buffer_result);
        } else {
            if (!empty($buffer_result)) {
                $this->logError("Une erreur c'est produite pendant la gestion de l'update" . $buffer_result);
            }
        }
    }

    /**
     * @param WebSocketUser $user
     * @param BasePacket $message
     */
    protected function onLoad(WebSocketUser $user, BasePacket $message)
    {

        ob_start();
        new Bootstrap(['socket' => $this, 'emulate_route' => $message->path, 'emulate_method' => 'GET', 'update' => false]);
        $buffer_result = ob_get_clean();


        $buffer_result = json_encode([['action' => 'load', 'route' => $message->path, 'html' => $buffer_result]]);
        $this->send($user, $buffer_result);
    }

    /**
     * @param WebSocketUser $user
     */
    protected function connected(WebSocketUser $user)
    {
        // TODO: Implement connected() method.
    }

    /**
     * @param WebSocketUser $user
     */
    protected function closed(WebSocketUser $user)
    {
        // TODO: Implement closed() method.
    }


}

$echo = new Socket("0.0.0.0", $argv[1]);
try {
    $echo->run();
} catch (Exception $e) {
    $echo->stdout($e->getMessage());
}