
import mysql = require('mysql');

export default class MySQL {

    private static _instance: MySQL;

    cnn: mysql.Connection;
    conectado: boolean = false;

    constructor() {

        this.cnn = mysql.createConnection({
            host: '192.168.0.145',
            port: 3307,
            user: 'fte',
            password: 'admin123',
            database: 'fulltime_evalua'
        });

        this.conectarDB();
    }

    // OBTENER LA ISNTANCIA
    public static get instance() {
        return this._instance || (this._instance = new this());
    }

    // EJECUTAR QUERY
    static ejecutarQuery(query: string, callback: Function) {

        this.instance.cnn.query(query, (err: any, results: Object[]) => {
            if (err) {
                console.log('Error en query ', err);
                return callback(err);
            }

            if (results.length === 0) {
                callback('El registro solicitado no existe.');
                return;

            }
            callback(null, results);
        })

    }

    private conectarDB() {
        this.cnn.connect((err) => {
            if (err) {
                console.log('Base de datos no conecta!! : ' + JSON.stringify(err, undefined, 2));
                return;
            }
            this.conectado = true;
            console.log('Base de datos online!!');
        })
    }

}


