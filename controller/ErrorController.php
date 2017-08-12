<?php

use PrivateHeberg\Flat\Controller;


/**
 * Created by PhpStorm.
 * User: Marc Moreau
 * Date: 28/06/2017
 * Time: 17:46
 */
class ErrorController extends Controller {


    public function on404Action() {
        $this->render('404');
    }
}