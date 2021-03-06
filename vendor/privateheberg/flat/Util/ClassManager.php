<?php
/**
 * Created by PhpStorm.
 * User: Marc Moreau
 * Date: 22/03/2017
 * Time: 18:55
 */

namespace PrivateHeberg\Flat\Util;

/**
 * Class ClassManager
 * @package PrivateHeberg\Flat\Util
 */
class ClassManager
{
    //This value should be the directory that contains composer.json
    const appRoot = __DIR__ . "/../../../../";

    /**
     * Get all class on namespace
     *
     * @param $namespace
     *
     * @return array
     */
    public static function getClassesInNamespace($namespace)
    {
        $files = scandir(self::getNamespaceDirectory($namespace));

        $classes = array_map(function ($file) use ($namespace) {
            return $namespace . '\\' . str_replace('.php', '', $file);
        }, $files);

        return array_filter($classes, function ($possibleClass) {
            return class_exists($possibleClass);
        });
    }

    /**
     *
     * @param $namespace
     *
     * @return bool|string
     */
    private static function getNamespaceDirectory($namespace)
    {
        $composerNamespaces = self::getDefinedNamespaces();

        $namespaceFragments = explode('\\', $namespace);
        $undefinedNamespaceFragments = [];

        while ($namespaceFragments) {
            $possibleNamespace = implode('\\', $namespaceFragments) . '\\';

            if (array_key_exists($possibleNamespace, $composerNamespaces)) {
                return realpath(self::appRoot . $composerNamespaces[$possibleNamespace] . implode('/', $undefinedNamespaceFragments));
            }

            $undefinedNamespaceFragments[] = array_pop($namespaceFragments);
        }

        return false;
    }

    /**
     * @return array
     */
    private static function getDefinedNamespaces()
    {
        $composerJsonPath = self::appRoot . 'composer.json';
        $composerConfig = json_decode(file_get_contents($composerJsonPath));

        //Apparently PHP doesn't like hyphens, so we use variable variables instead.
        $psr4 = "psr-4";

        return (array)$composerConfig->autoload->$psr4;
    }
}