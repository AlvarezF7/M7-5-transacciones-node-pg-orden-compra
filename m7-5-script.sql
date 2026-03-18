-------------------------------------------------------------
--M7 tarea 5  
-------------------------------------------------------------
-- Tabla clientes (renombrada)
CREATE TABLE clientes_t5 (
    rut VARCHAR(10) PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL
);

-- Tabla direcciones
CREATE TABLE direcciones (
    id_direcciones SERIAL PRIMARY KEY,
    rut VARCHAR(10),
    direccion VARCHAR(200),
    CONSTRAINT fk_direcciones_clientes
        FOREIGN KEY (rut) REFERENCES clientes_t5(rut)
        ON DELETE CASCADE
);

-- Tabla productos
CREATE TABLE productos (
    id_producto SERIAL PRIMARY KEY,
    nombre VARCHAR(200) NOT NULL,
    precio INTEGER NOT NULL,
    existencias INTEGER NOT NULL
);

-- Tabla orden
CREATE TABLE orden (
    id_orden SERIAL PRIMARY KEY,
    rut VARCHAR(10),
    id_direccion INTEGER,
    precio_total INTEGER,
    CONSTRAINT fk_orden_clientes
        FOREIGN KEY (rut) REFERENCES clientes_t5(rut)
        ON DELETE SET NULL,
    CONSTRAINT fk_orden_direcciones
        FOREIGN KEY (id_direccion) REFERENCES direcciones(id_direcciones)
        ON DELETE SET NULL
);

-- Tabla lista_productos (detalle de orden)
CREATE TABLE lista_productos (
    id_lista SERIAL PRIMARY KEY,
    id_orden INTEGER,
    id_producto INTEGER,
    cantidad_producto INTEGER,
    CONSTRAINT fk_lista_orden
        FOREIGN KEY (id_orden) REFERENCES orden(id_orden)
        ON DELETE CASCADE,
    CONSTRAINT fk_lista_productos
        FOREIGN KEY (id_producto) REFERENCES productos(id_producto)
        ON DELETE CASCADE
);

-- Tabla despachos
CREATE TABLE despachos (
    id_despacho SERIAL PRIMARY KEY,
    id_orden INTEGER,
    id_direccion INTEGER,
    CONSTRAINT fk_despachos_orden
        FOREIGN KEY (id_orden) REFERENCES orden(id_orden)
        ON DELETE CASCADE,
    CONSTRAINT fk_despachos_direcciones
        FOREIGN KEY (id_direccion) REFERENCES direcciones(id_direcciones)
        ON DELETE SET NULL
);

------------------------------------------------------------------------
-- Crea data de prueba
------------------------------------------------------------------------

INSERT INTO clientes_t5 (rut, nombre)
VALUES
('12345678-9', 'Juan Perez'),
('98765432-1', 'Maria Gomez'),
('11111111-1', 'Pedro Soto');

------- tabla direcciones-----------------
INSERT INTO direcciones (rut, direccion )
VALUES
('12345678-9', 'Av. los Alamos 123, Santiago'),
('12345678-9', 'Calle Fontecilla 456, Santiago'),
('98765432-1', 'Calle Luna Nueva 789, Valparaiso');

------- Tabla Productos-------------------
INSERT INTO productos (id_producto, nombre, precio, existencias)
VALUES
(1, 'Notebook Lenovo', 850000, 10),
(2, 'Mouse Inalambrico', 5000, 50),
(3, 'Teclado simple', 25000, 20),
(4, 'Monitor Xaomi 24"', 150000, 15);


------- Tabla Ordenes-------------------
INSERT INTO orden (rut, id_direccion, precio_total)
VALUES
('12345678-9', 1, 0),
('98765432-1', 3, 0);


------- Tabla lista_Productos-------------------
-- id-orden-1
INSERT INTO lista_productos (id_orden, id_producto, cantidad_producto)
VALUES
(1, 1, 2),  -- 2 Notebooks
(1, 2, 3);  -- 3 Mouses

--id_orden-2
INSERT INTO lista_productos (id_orden, id_producto, cantidad_producto)
VALUES
(2, 3, 1),  -- 1 Teclado
(2, 4, 2);  -- 2 Monitores

-------Tabla despachos---------------------
-- Suponiendo id_orden = 1 → id_direccion = 1
-- Suponiendo id_orden = 2 → id_direccion = 3
INSERT INTO despachos (id_orden, id_direccion)
VALUES
(1, 1),
(2, 3);

----------------------------------------
-- Corrige error en orden de compra
---------------------------------------
SELECT 
  o.id_orden,
  o.rut AS rut_orden,
  d.id_direcciones,
  d.rut AS rut_direccion,
  d.direccion,
  o.precio_total
FROM orden o
JOIN direcciones d ON o.id_direccion = d.id_direcciones;

--borra orden  inconsistente----
DELETE FROM orden
WHERE id_orden = 5;

--- corrige rut en tabla de direcciones
UPDATE direcciones
SET rut = '11111111-1'
WHERE direccion = 'Calle Fontecilla 456, Santiago';

SELECT * FROM direcciones;

SELECT * FROM orden;