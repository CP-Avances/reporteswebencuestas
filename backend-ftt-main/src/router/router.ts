import { Router, Request, Response } from 'express';
import { TokenValidation } from '../libs/verifivarToken';
import multer from 'multer';
import MySQL from '../mysql/mysql';
import cors from 'cors';
import path from 'path';
import fs from 'fs';

let jwt = require('jsonwebtoken');

const router = Router();

// MANEJO DE RUTAS DE ALMACENAMIENTO DE ARCHIVOS
const ObtenerRuta = function () {
    var ruta = '';
    let separador = path.sep;
    for (var i = 0; i < __dirname.split(separador).length - 2; i++) {
        if (ruta === '') {
            ruta = __dirname.split(separador)[i];
        }
        else {
            ruta = ruta + separador + __dirname.split(separador)[i];
        }
    }
    return ruta + separador + 'imagenesReportes';
}

const storage = multer.diskStorage({

    destination: function (req, file, cb) {
        cb(null, ObtenerRuta())
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname)
    }
})

const upload = multer({ storage: storage });

// GUARDAR NOMBRE IMAGEN EN LA BASE DE DATOS
router.post('/uploadImage', TokenValidation, upload.single('image'), (req, res) => {

    let separador = path.sep;
    const filename = req.file?.originalname;

    // BUSQUEDA DE LOGO
    const logo =
        `
        SELECT gene_valor FROM general WHERE gene_codigo = 8;
        `
        ;

    let nombreImagen: any[];


    MySQL.ejecutarQuery(logo, (err: any, imagen: Object[]) => {
        if (err) {
            res.status(400).json({
                ok: false,
                error: err,
            });
        } else {
            nombreImagen = imagen;
            if (nombreImagen[0].gene_valor != null && nombreImagen[0].gene_valor != '') {

                if (nombreImagen[0].gene_valor === filename) {
                    ActualizarImagen(res, filename);
                }
                else {
                    var direccion = ObtenerRuta() + separador + nombreImagen[0].gene_valor
                    // ELIMINAR REGISTRO DEL SERVIDOR
                    fs.unlinkSync(direccion);
                    ActualizarImagen(res, filename);
                }
            }
            else {
                ActualizarImagen(res, filename);
            }
        }
    });

}
);

// METODO PARA BUSCAR IMAGEN REGISTRADA
const ImagenBase64LogosEmpresas = function (path_file: string) {
    let separador = path.sep;
    try {
        var ruta = ObtenerRuta() + separador + path_file;
        let data = fs.readFileSync(ruta);
        return data.toString('base64');
    } catch (error) {
        return 0
    }
}


// RUTAS PRUEBA
router.get('/heroes', (req: Request, res: Response) => {
    res.json({
        ok: true,
        mensaje: 'todo esta bien'
    })
});

router.get('/heroes/:id', (req: Request, res: Response) => {
    const id = req.params.id;
    res.json({
        ok: true,
        mensaje: 'todo esta bien',
        id: id
    })
});


// QUERYS
router.get('/usuarios', TokenValidation, cors(), (req: Request, res: Response) => {

    const query =
        `
        SELECT * FROM usuarios
        `
    MySQL.ejecutarQuery(query, (err: any, usuarios: Object[]) => {
        if (err) {
            res.status(400).json({
                ok: false,
                error: err
            });
        } else {
            res.json({
                ok: true,
                usuarios: usuarios
            })
        }
    })
});


router.get('/usuario/:id', TokenValidation, (req: Request, res: Response) => {
    const id = req.params.id;
    const escapeId = MySQL.instance.cnn.escape(id);
    const query =
        `
        SELECT * FROM usuarios WHERE usua_codigo = ${escapeId}
        `
    MySQL.ejecutarQuery(query, (err: any, usuario: Object[]) => {

        if (err) {
            res.status(400).json({
                ok: false,
                error: err
            });
        } else {
            res.json({
                ok: true,
                usuario: usuario[0]
            })
        }
    })
});


// GETUSER
router.get('/username/:usua_login', TokenValidation, (req: Request, res: Response) => {

    const username = req.params.usua_login;
    const escapeUsername = MySQL.instance.cnn.escape(username);
    const query =
        `
        SELECT * FROM usuarios where usua_login = ${escapeUsername}
        `
    MySQL.ejecutarQuery(query, (err: any, usuario: Object[]) => {
        if (err) {
            res.status(400).json({
                ok: false,
                error: err
            });
        } else {
            res.json({
                ok: true,
                usuario: usuario[0]
            })
        }
    })
});

router.post('/login/:usua_login/:usua_password', (req: Request, res: Response) => {

    const username = req.params.usua_login;
    const pass = req.params.usua_password;
    const query =
        `
        SELECT 1 FROM login l
        JOIN usuario u ON l.COD_US = u.COD_US 
        WHERE USERNAME = '${username}' AND PASSWORD=MD5('${pass}') 
        AND u.TIPO_US = 'Administrador';
        `;

    MySQL.ejecutarQuery(query, (err: any, usuario: Object[]) => {
        if (err) {
            res.status(400).json({
                ok: false,
                error: err
            });

        } else {
            let token = jwt.sign({ data: usuario[0] }, 'llaveSecreta', { expiresIn: 60 * 60 * 23 });
            res.json({
                ok: true,
                token
            })
        }
    })
});

router.get('/renew', (req: Request, res: Response) => {
    res.json({
        ok: true,
        mensaje: 'todo esta bien'
    })
});

function ActualizarImagen(res: any, archivo: any) {
    const query =
        `
        UPDATE general SET gene_valor = '${archivo}' WHERE gene_codigo = 8;
        `
    MySQL.ejecutarQuery(query, (err: any, usuario: Object[]) => {
        if (err) {
            res.status(400).json({
                ok: false,
                error: err
            });
        } else {
            res.json({
                ok: true,
            })
        }
    })
}

router.get('/nombreImagen', TokenValidation, (req: Request, res: Response) => {
    const query =
        `
        SELECT gene_valor FROM general WHERE gene_codigo = 8;
        `;
    ;

    let nombreImagen: any[];

    MySQL.ejecutarQuery(query, (err: any, imagen: Object[]) => {
        if (err) {
            res.status(400).json({
                ok: false,
                error: err,
            });
        } else {
            nombreImagen = imagen;
            const codificado = ImagenBase64LogosEmpresas(nombreImagen[0].gene_valor);
            res.json({
                ok: true,
                imagen: codificado,
            });
        }
    });
});

// GUARDAR META DE TURNOS EN LA BASE DE DATOS
router.get('/setMeta/:valor', TokenValidation, (req, res) => {

    const valor = req.params.valor;
    const query =
        `
        UPDATE general SET gene_valor = '${valor}' WHERE gene_codigo = 9;
        `

    MySQL.ejecutarQuery(query, (err: any, usuario: Object[]) => {
        if (err) {
            res.status(400).json({
                ok: false,
                error: err
            });

        } else {
            res.json({
                ok: true,
            })
        }
    })
}
);

router.get('/getMeta', TokenValidation, (req: Request, res: Response) => {
    const query =
        `
        SELECT gene_valor FROM general WHERE gene_codigo = 9;
        `;

    MySQL.ejecutarQuery(query, (err: any, valor: any) => {
        if (err) {
            res.status(400).json({
                ok: false,
                error: err,
            });
        } else {
            res.json({
                ok: true,
                valor: valor[0].gene_valor,
            });
        }
    });
});


// GUARDAR MARCA DE AGUA
router.get('/setMarca/:marca', TokenValidation, (req, res) => {

    let marca = req.params.marca;
    if (marca == "desactivar") {
        marca = " ";
    }
    const query =
        `
        UPDATE general SET gene_valor = '${marca}' WHERE gene_codigo = 10;
        `

    MySQL.ejecutarQuery(query, (err: any, usuario: Object[]) => {
        if (err) {
            res.status(400).json({
                ok: false,
                error: err
            });

        } else {
            res.json({
                ok: true,
            })
        }
    })
}
);


router.get('/getMarca', TokenValidation, (req: Request, res: Response) => {
    const query =
        `
        SELECT gene_valor FROM general WHERE gene_codigo = 10;
        `;

    MySQL.ejecutarQuery(query, (err: any, marca: any) => {
        if (err) {
            res.status(400).json({
                ok: false,
                error: err,
            });
        } else {
            res.json({
                ok: true,
                marca: marca[0].gene_valor,
            });
        }
    });
});

export default router;
