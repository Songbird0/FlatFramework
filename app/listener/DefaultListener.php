<?php
use PrivateHeberg\Flat\Event\EventListener;
use PrivateHeberg\Flat\Event\EventWrapper\FinishLoadEvent;
use PrivateHeberg\Flat\Event\EventWrapper\GetGlobalUpdaterEvent;
use PrivateHeberg\Flat\Event\EventWrapper\GetUserInfoEvent;
use PrivateHeberg\Flat\Event\EventWrapper\PreLoadingEvent;


/**
 * Created by PhpStorm.
 * User: Marc Moreau
 * Date: 22/02/2017
 * Time: 05:50
 */
class DefaultListener extends EventListener {


    public function onFinishLoader(FinishLoadEvent $e)
    {

    }

    public function onPreLoading(PreLoadingEvent $e)
    {

    }

    public function onGetUserInfo(GetUserInfoEvent $e)
    {

    }

    public function onGetGlobalUpdater(GetGlobalUpdaterEvent $e)
    {

    }

    public function onSendEmailByTemplate($array)
    {
        try {


            $tempalte = $array['template_name'];  //name of template
            $template_info = $array['args'];  //args for buld template (ex title, unsubscribe link ... .... ...)


            return ['html' => '<b>My template body</b>', 'titre' => 'My Template title'];
        } catch (Exception $e) {

        }
    }


}