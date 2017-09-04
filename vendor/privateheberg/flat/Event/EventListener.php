<?php
/**
 * Created by PhpStorm.
 * User: Marc Moreau
 * Date: 22/02/2017
 * Time: 05:51
 */

namespace PrivateHeberg\Flat\Event;


use PrivateHeberg\Flat\Event\EventWrapper\FinishLoadEvent;
use PrivateHeberg\Flat\Event\EventWrapper\GetGlobalUpdaterEvent;
use PrivateHeberg\Flat\Event\EventWrapper\GetUserInfoEvent;
use PrivateHeberg\Flat\Event\EventWrapper\PreLoadingEvent;
use PrivateHeberg\Flat\Exception\NotImplementedException;


/**
 * Class EventListener
 * @package PrivateHeberg\Flat\Event
 */
class  EventListener
{

    /**
     * Calback call after page loading
     *
     * @param FinishLoadEvent $e
     *
     * @throws NotImplementedException
     */
    public function onFinishLoader(FinishLoadEvent $e)
    {
        //IT'S A VIRTUAL METHOD

        throw new NotImplementedException("onFinishLoader is not implemented on yours listener");
    }


    /**
     * Calback call beafore page loading
     *
     * @param PreLoadingEvent $e
     *
     * @throws NotImplementedException
     */
    public function onPreLoading(PreLoadingEvent $e)
    {
        //IT'S A VIRTUAL METHOD

        throw new NotImplementedException("onPreLoading is not implemented on yours listener");
    }



    /**
     * Call on get player info
     *
     * @param GetUserInfoEvent $e
     *
     * @return string
     * @throws NotImplementedException
     */
    public function onGetUserInfo(GetUserInfoEvent $e)
    {
        //IT'S A VIRTUAL METHOD

        throw new NotImplementedException("onFinishLoader is not implemented on yours listener");
    }


    /**
     * Call on Update return update for all website page
     *
     * @param GetGlobalUpdaterEvent $e
     *
     * @throws NotImplementedException
     */
    public function onGetGlobalUpdater(GetGlobalUpdaterEvent $e)
    {
        //IT'S A VIRTUAL METHOD

        throw new NotImplementedException("onFinishLoader is not implemented on yours listener");
    }



}

