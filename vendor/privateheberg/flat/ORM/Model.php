<?php

namespace PrivateHeberg\Flat\ORM;

use PrivateHeberg\Flat\BasicWrapper;
use ReflectionClass;
use ReflectionProperty;


class Model
{
    public $id;
    /** @var \NotORM */
    private $connexion;
    private $table;
    private $dbid;

    public function __construct()
    {
        $this->table = self::getTable();
        $this->dbid = self::getBDD();
        $this->connexion = BasicWrapper::getDatabase($this->dbid);
    }

    /**
     * Retourne le nom de la table
     * @return string table name
     */
    private static function getTable() {
        $rc = new ReflectionClass(get_called_class());
        $annon = $rc->getDocComment();
        preg_match_all('/\@table (.*)/', $annon, $matches, PREG_SET_ORDER, 0);
        return str_replace(' ', '', $matches[0][1]);

    }


    /**
     * Retourne l'id de la pbb
     * @return int BDDID
     */
    private static function getBDD() {
        $rc = new ReflectionClass(get_called_class());
        $annon = $rc->getDocComment();
        preg_match_all('/\@table (.*)/', $annon, $matches, PREG_SET_ORDER, 0);
        return intval(str_replace(' ', '', $matches[0][1]));
    }

    /**
     * @param $where string Condition de récupération de la bdd
     * @param array $array
     *
     * @return $this
     */
    public static function getOne($where = null, ...$array)
    {
        $table = self::getTable();
        $dbid = self::getBDD();
        $connexion = BasicWrapper::getDatabase($dbid);
        if ($where == null) {
            $req = $connexion->$table()->select('*')->fetch();
        } else {
            $req = $connexion->$table()->select('*')->where($where, $array)->fetch();
        }


        if (!$req) {
            return null;
        }

        $array = self::toArray($req);
        return self::deserialize($array);


    }

    /**
     * Retourne le nombre d'occurence dans la table dbb
     * @param null $where
     * @param array ...$array
     *
     * @return int Nombre d'occurence
     */
    public static function count($where = null, ...$array)
    {
        $table = self::getTable();
        $dbid = self::getBDD();
        $connexion = BasicWrapper::getDatabase($dbid);
        return intval($connexion->$table()->where($where, $array)->count('id'));
    }

    /**
     * @param null $where
     * @param array $array
     *
     * @return $this[]
     */
    public static function getAll($where = null, ...$array)
    {

        $table = self::getTable();
        $dbid = self::getBDD();
        $connexion = BasicWrapper::getDatabase($dbid);

        if ($where == null) {
            $req = $connexion->$table()->select('*');
        } else {
            $req = $connexion->$table()->select('*')->where($where, $array);
        }


        if (!$req) {
            return null;
        }
        $occurence = [];
        foreach ($req as $dats) {
            $array = self::toArray($dats);

            $occurence[] = self::deserialize($array);

        }

        return $occurence;
    }

    /**
     * @param $where
     * @param array $array
     *
     * @return bool true if this action work
     */
    public static function delete($where, ...$array)
    {
        $table = self::getTable();
        $dbid = self::getBDD();
        $connexion = BasicWrapper::getDatabase($dbid);
        if ($connexion->$table()->where($where, $array)->delete())
            return true;

        return false;

    }

    /**
     * @return bool true if this action work
     */
    public function update()
    {
        $table = $this->table;
        if ($this->connexion->$table()->where('id = ?', $this->id)->update(
            self::toArray($this)
        )
        )
            return true;

        return false;
    }


    /**
     * Insert L'objet courant en bdd
     * @return bool
     */
    public  function insert()
    {
        $table = $this->table;
        $array = static::toArray($this);
        unset($array['id']);
        $insert = $this->connexion->$table()->insert(
            $array
        );
        $this->id = $insert['id'];
        if ($insert)
            return true;

        return false;

    }

    /**
     *
     * Convertit un object en array
     * @param $data object
     *
     * @return array
     */
    private static function toArray($data)
    {
        return json_decode(json_encode($data), true);
    }

    /**
     * @param $array
     *
     * @return $this
     */
    private static function deserialize($array)
    {
        $reflect = new ReflectionClass(get_called_class());
        $props = self::toArray($reflect->getProperties(ReflectionProperty::IS_PUBLIC));

        $new_class_name = get_called_class();
        $instance_new = new $new_class_name();
        foreach ($props as $p) {
            $name_field = $p['name'];
            if (isset($array[$name_field])) {
                $instance_new->$name_field = $array[$name_field];
            }
        }


        return $instance_new;
    }

}