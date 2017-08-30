<?php

namespace PrivateHeberg\Flat;


use PrivateHeberg\Flat\Event\Event;
use PrivateHeberg\Flat\Event\EventWrapper\FinishLoadEvent;
use PrivateHeberg\Flat\Exception\ActionNotFoundException;
use PrivateHeberg\Flat\Exception\BadRouteSyntaxeException;
use PrivateHeberg\Flat\Exception\BootstrapArgumentException;
use PrivateHeberg\Flat\Exception\ControllerNotFoundException;
use PrivateHeberg\Flat\Exception\RouterNotFoundException;

class Bootstrap
{
    public  $route_list;
    public  $isUpdate;
    private $router;

    public function __construct(array $args = null)
    {


        $router = new Router();


        //Loading all route
        foreach (_CONFIG['dirs']['router'] as $rt) {
            if (file_exists($rt)) {
                /** @noinspection PhpIncludeInspection */
                include $rt;
            } else {
                throw new RouterNotFoundException("Cannot find router on " . $rt);
            }
        }
        $this->router = $router;
        //Removing blade cache if developper use dev environement

        $files = glob(_CONFIG['dirs']['tmp'] . '/view/*');
        foreach ($files as $file) { // iterate files
            if (is_file($file))
                unlink($file); // delete file
        }

        $this->route_list = $this->router->getAllRoute();


        if ($args != null) {
            if (isset($args['update']) && isset($args['emulate_route']) && isset($args['emulate_method'])) {
                $route_match = $this->router->match($args['emulate_route'], $args['emulate_method']);
            } else {
                throw new BootstrapArgumentException("Error with args on Boostrap proccesing");
            }


        } else {
            $route_match = $this->router->match();
        }


        if ($route_match) { //Si une route match

            $explode_callback = explode('@', $route_match['target']); //on sépare le controller de l'action
            if (count($explode_callback) == 2) { //Si on tourve le controller et l'action
                $className = $explode_callback['0'] . "Controller"; //ont set ne nom de la class a call


                if (class_exists($className)) { //Si cette class existe

                    $class = new $className(); //On créer l'instace de la class

                    if (!$args['update']) { //Si il s'agit pas d'une requette d'update
                        $this->isUpdate = false;
                        $methodName = $explode_callback[1] . 'Action'; //ont génére le nom de l'action


                        if (method_exists($class, $methodName)) { //Si l'action existe

                            if (method_exists($class, 'setProcess')) { //Si la method setProcess existe

                                call_user_func_array(array($class, 'setProcess'), array($this)); //On set le boostrap dans le controller
                                call_user_func_array(array($class, $methodName), $route_match['params']); //On call la methode

                                $loadEvent = new FinishLoadEvent();
                                $loadEvent->setErrorCode(200);
                                Event::call('onFinishLoader', $loadEvent);

                            } else { //Si la method setProcess existe pas c'est que la class extends pas de controller

                                throw new ControllerNotFoundException($className . " is not a controller, " . $className . " need extends to Controller");
                            }

                        } else { //Si l'action existe pas
                            throw new ActionNotFoundException("Cannot find method " . $methodName . " on controler " . $className);
                        }

                    } else {
                        $methodName = $explode_callback[1] . 'Update';
                        $this->isUpdate = true;
                        if (method_exists($class, 'setProcess')) {
                            if (method_exists($class, $methodName)) {
                                call_user_func_array(array($class, 'setProcess'), array($this));
                                call_user_func_array(array($class, $methodName), $route_match['params']);
                                $loadEvent = new FinishLoadEvent();
                                $loadEvent->setErrorCode(200);
                                Event::call('onFinishLoader', $loadEvent);

                            } else {
                                call_user_func_array(array($class, 'setProcess'), array($this));
                                call_user_func_array(array($class, 'result'), $route_match['params']);
                                $loadEvent = new FinishLoadEvent();
                                $loadEvent->setErrorCode(200);
                                Event::call('onFinishLoader', $loadEvent);
                            }
                        }
                    }
                } else {
                    throw new ControllerNotFoundException("Cannot find controller" . $className);
                }
            } else {
                throw new BadRouteSyntaxeException("Error with route syntaxe for " . $route_match['target']);
            }
        } else {
            $loadEvent = new FinishLoadEvent();
            $loadEvent->setErrorCode(404);
            Event::call('onFinishLoader', $loadEvent);
        }

    }

}