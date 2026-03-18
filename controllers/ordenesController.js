const pool = require('../dataBase');

// GET con filtros
const handleGet = async (req, res) => {
  try {
    const { filtro, id, orden, rut } = req.query;

    switch (filtro) {

      case 'productos':
        if (id) {
          // Producto por id
          const q = { text: 'SELECT * FROM productos WHERE id_producto = $1', values: [id] };
          const { rows } = await pool.query(q);
          if (rows.length === 0) return res.status(404).json({ ok: false, mensaje: 'Producto no encontrado' });
          return res.json({ ok: true, data: rows[0] });
        } else if (orden) {
          // Productos de una orden
          const q = {
            text: `
              SELECT p.*, lp.cantidad_producto
              FROM lista_productos lp
              JOIN productos p ON p.id_producto = lp.id_producto
              WHERE lp.id_orden = $1
            `,
            values: [orden],
          };
          const { rows } = await pool.query(q);
          return res.json({ ok: true, data: rows });
        } else {
          // Todos los productos
          const q = { text: 'SELECT * FROM productos' };
          const { rows } = await pool.query(q);
          return res.json({ ok: true, data: rows });
        }

      case 'ordenes':
        if (!rut) return res.status(400).json({ ok: false, mensaje: 'Debe especificar rut' });

        const qOrdenes = {
          text: `
            SELECT o.id_orden, o.precio_total, c.nombre, d.direccion
            FROM orden o
            JOIN clientes_t5 c ON o.rut = c.rut
            JOIN direcciones d ON o.id_direccion = d.id_direcciones
            WHERE o.rut = $1
          `,
          values: [rut],
        };
        const { rows: ordenes } = await pool.query(qOrdenes);

        if (ordenes.length === 0) {
          return res.json({ ok: true, data: [], mensaje: 'No hay órdenes de compra para este RUT' });
        }
        return res.json({ ok: true, data: ordenes });

      case 'clientes':
        if (rut) {
          const qCliente = { text: 'SELECT * FROM clientes_t5 WHERE rut = $1', values: [rut] };
          const { rows } = await pool.query(qCliente);
          if (rows.length === 0) return res.status(404).json({ ok: false, mensaje: 'Cliente no encontrado' });
          return res.json({ ok: true, data: rows[0] });
        } else {
          const qClientes = { text: 'SELECT * FROM clientes_t5' };
          const { rows } = await pool.query(qClientes);
          return res.json({ ok: true, data: rows });
        }

      case 'direcciones':
        if (!rut) return res.status(400).json({ ok: false, mensaje: 'Debe especificar rut' });
        const qDirecciones = { text: 'SELECT * FROM direcciones WHERE rut = $1', values: [rut] };
        const { rows: direcciones } = await pool.query(qDirecciones);
        return res.json({ ok: true, data: direcciones });

      case 'despachos':
        if (!orden) return res.status(400).json({ ok: false, mensaje: 'Debe especificar id de orden' });
        const qDespachos = { text: 'SELECT * FROM despachos WHERE id_orden = $1', values: [orden] };
        const { rows: despachos } = await pool.query(qDespachos);
        return res.json({ ok: true, data: despachos });

      default:
        return res.status(400).json({ ok: false, mensaje: 'Filtro inválido' });
    }

  } catch (err) {
    console.error(err);
    return res.status(500).json({ ok: false, mensaje: 'Error interno del servidor' });
  }
};

// POST /orden (transacción)
const crearOrden = async (req, res) => {
  const client = await pool.connect();
  try {
    const { rut, id_direccion, productos } = req.body;

    // Validaciones básicas
    if (!rut || !id_direccion || !productos || !Array.isArray(productos) || productos.length === 0) {
      return res.status(400).json({ ok: false, mensaje: 'Datos incompletos para crear orden' });
    }

    // Validar que la dirección pertenece al cliente
    const qDireccion = {
      text: 'SELECT * FROM direcciones WHERE id_direcciones = $1 AND rut = $2',
      values: [id_direccion, rut]
    };
    const { rows: direccion } = await client.query(qDireccion);
    if (direccion.length === 0) {
      return res.status(400).json({ ok: false, mensaje: 'La dirección no pertenece al cliente' });
    }

    await client.query('BEGIN');

    // Insertar orden
    const insertOrdenQ = {
      text: 'INSERT INTO orden (rut, id_direccion, precio_total) VALUES ($1, $2, 0) RETURNING id_orden',
      values: [rut, id_direccion],
    };
    const { rows: ordenRows } = await client.query(insertOrdenQ);
    const id_orden = ordenRows[0].id_orden;

    // Insertar despacho
    const insertDespachoQ = {
      text: 'INSERT INTO despachos (id_orden, id_direccion) VALUES ($1, $2)',
      values: [id_orden, id_direccion],
    };
    await client.query(insertDespachoQ);

    let precio_total = 0;

    // Insertar productos y actualizar stock
    for (const p of productos) {
      const stockQ = { text: 'SELECT existencias, precio FROM productos WHERE id_producto = $1', values: [p.id_producto] };
      const { rows } = await client.query(stockQ);

      if (rows.length === 0) throw new Error(`Producto con id ${p.id_producto} no encontrado`);

      const existencias = rows[0].existencias;
      const precio = rows[0].precio;

      if (existencias < p.cantidad_producto) throw new Error(`Stock insuficiente para producto id ${p.id_producto}`);

      // Insertar en lista_productos
      const insertListaQ = {
        text: 'INSERT INTO lista_productos (id_orden, id_producto, cantidad_producto) VALUES ($1, $2, $3)',
        values: [id_orden, p.id_producto, p.cantidad_producto],
      };
      await client.query(insertListaQ);

      // Actualizar stock
      const updateStockQ = {
        text: 'UPDATE productos SET existencias = existencias - $1 WHERE id_producto = $2',
        values: [p.cantidad_producto, p.id_producto],
      };
      await client.query(updateStockQ);

      precio_total += precio * p.cantidad_producto;
    }

    // Actualizar precio total en orden
    const updateOrdenQ = {
      text: 'UPDATE orden SET precio_total = $1 WHERE id_orden = $2',
      values: [precio_total, id_orden],
    };
    await client.query(updateOrdenQ);

    // Obtener orden completa para respuesta
    const ordenCompletaQ = {
      text: `
        SELECT 
          o.id_orden,
          o.rut,
          c.nombre AS cliente,
          d.direccion,
          p.nombre AS producto,
          lp.cantidad_producto,
          o.precio_total
        FROM orden o
        JOIN clientes_t5 c ON o.rut = c.rut
        JOIN direcciones d ON o.id_direccion = d.id_direcciones
        JOIN lista_productos lp ON o.id_orden = lp.id_orden
        JOIN productos p ON lp.id_producto = p.id_producto
        WHERE o.id_orden = $1
      `,
      values: [id_orden],
    };

    const { rows: ordenCompleta } = await client.query(ordenCompletaQ);

    await client.query('COMMIT');

    res.status(201).json({
      ok: true,
      mensaje: 'Orden creada correctamente',
      id_orden,
      orden: ordenCompleta
    });

  } catch (err) {
    await client.query('ROLLBACK');
    console.error(err);
    res.status(409).json({ ok: false, mensaje: err.message });
  } finally {
    client.release();
  }
};

module.exports = { handleGet, crearOrden };