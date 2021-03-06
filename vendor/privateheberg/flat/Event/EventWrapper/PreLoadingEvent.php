<?php

namespace PrivateHeberg\Flat\Event\EventWrapper;

use PrivateHeberg\Flat\Controller;

class PreLoadingEvent
{
    private $errorCode;
    private $cancel = false;
    private $route;
    private $socket;
    /** @var  Controller */
    private $controller;

    /**
     * @return Controller
     */
    public function getController()
    {
        return $this->controller;
    }

    /**
     * @param Controller $controller
     */
    public function setController($controller)
    {
        $this->controller = $controller;
    }
    /**
     * @return mixed
     */
    public function getRoute()
    {
        return $this->route;
    }

    /**
     * @param mixed $route
     */
    public function setRoute($route)
    {
        $this->route = $route;
    }

    /**
     * @return mixed
     */
    public function getSocket()
    {
        return $this->socket;
    }

    /**
     * @param $socket
     *
     * @internal param mixed $Socket
     */
    public function setSocket($socket)
    {
        $this->Socket = $socket;
    }

    /**
     * @return mixed
     */
    public function getCancel()
    {
        return $this->cancel;
    }
    /**
     * @return int
     */
    public function getErrorCode()
    {
        return $this->errorCode;
    }

    /**
     * @param int $errorCode
     */
    public function setErrorCode(int $errorCode)
    {
        $this->errorCode = $errorCode;
    }

    public function setCancel(bool $val) {
        $this->cancel = $val;
    }




}