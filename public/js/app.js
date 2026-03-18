const baseURL = "http://localhost:3000/ordenes";

// Secciones del HTML
const productosSection = document.getElementById("productosSection");
const ordenesSection = document.getElementById("ordenesSection");
const crearOrdenSection = document.getElementById("crearOrdenSection");

// Mensajes y contenedores
const mensajeOrdenes = document.getElementById("mensajeOrdenes");
const resultadoOrden = document.getElementById("resultadoOrden");

// Función para ocultar todas las secciones
function ocultarTodo() {
  productosSection.classList.add("hidden");
  ordenesSection.classList.add("hidden");
  crearOrdenSection.classList.add("hidden");
  mensajeOrdenes.textContent = "";
  resultadoOrden.textContent = "";
  const boletaDiv = document.getElementById("boletaOrden");
  if (boletaDiv) boletaDiv.innerHTML = "";
}

// Botones del menú
document.getElementById("btnProductos").onclick = () => {
  ocultarTodo();
  productosSection.classList.remove("hidden");
};

document.getElementById("btnOrdenes").onclick = () => {
  ocultarTodo();
  ordenesSection.classList.remove("hidden");
};

document.getElementById("btnCrearOrden").onclick = () => {
  ocultarTodo();
  crearOrdenSection.classList.remove("hidden");
};

// LISTAR PRODUCTOS
document.getElementById("listarProductos").onclick = async () => {
  try {
    const res = await fetch(`${baseURL}?filtro=productos`);
    const data = await res.json();
    const lista = document.getElementById("listaProductos");
    lista.innerHTML = "";

    if (!data.ok || !data.data || data.data.length === 0) {
      lista.innerHTML = "<li>No hay productos disponibles</li>";
    } else {
      data.data.forEach(p => {
        const li = document.createElement("li");
        li.textContent = `${p.id_producto} - ${p.nombre} - Precio $${p.precio} - Stock ${p.existencias}`;
        lista.appendChild(li);
      });
    }
  } catch (err) {
    alert("Error al conectar con el servidor");
    console.error(err);
  }
};

// BUSCAR ÓRDENES POR RUT
document.getElementById("buscarOrdenes").onclick = async () => {
  const rut = document.getElementById("rutCliente").value.trim();
  const res = await fetch(`${baseURL}?filtro=ordenes&rut=${rut}`);
  const data = await res.json();
  const lista = document.getElementById("listaOrdenes");
  const mensaje = document.getElementById("mensajeOrdenes");

  lista.innerHTML = "";
  mensaje.textContent = "";

  if (!data.data || data.data.length === 0) {
    mensaje.textContent = "No hay órdenes de compra para este RUT";
  } else {
    data.data.forEach(o => {
      const li = document.createElement("li");
      li.textContent = `Orden ${o.id_orden} - Total $${o.precio_total}`;
      lista.appendChild(li);
    });
  }
};

// AGREGAR FILA DE PRODUCTO PARA ORDEN
document.getElementById("agregarProducto").onclick = () => {
  const div = document.createElement("div");
  div.className = "productoRow";
  div.innerHTML = `
    <input placeholder="ID producto" class="prodId">
    <input placeholder="Cantidad" class="prodCant">
  `;
  document.getElementById("productosOrden").appendChild(div);
};

// CREAR ORDEN Y MOSTRAR BOLETA
document.getElementById("enviarOrden").onclick = async () => {
  const rut = document.getElementById("rutOrden").value.trim();
  const id_direccion = document.getElementById("direccionOrden").value.trim();

  if (!rut || !id_direccion) {
    resultadoOrden.textContent = "Debe ingresar RUT y dirección";
    return;
  }

  const ids = document.querySelectorAll(".prodId");
  const cantidades = document.querySelectorAll(".prodCant");
  const productos = [];

  for (let i = 0; i < ids.length; i++) {
    const id = parseInt(ids[i].value);
    const cant = parseInt(cantidades[i].value);
    if (!id || !cant || cant <= 0) continue;
    productos.push({ id_producto: id, cantidad_producto: cant });
  }

  if (productos.length === 0) {
    resultadoOrden.textContent = "Debe agregar al menos un producto válido";
    return;
  }

  try {
    const res = await fetch(`${baseURL}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ rut, id_direccion, productos }),
    });

    const data = await res.json();
    resultadoOrden.textContent = data.mensaje;

    // Mostrar boleta en un div debajo del formulario
    let boletaDiv = document.getElementById("boletaOrden");
    if (!boletaDiv) {
      boletaDiv = document.createElement("div");
      boletaDiv.id = "boletaOrden";
      crearOrdenSection.appendChild(boletaDiv);
    }
    boletaDiv.innerHTML = "";

    if (data.ok && data.orden && data.orden.length > 0) {
      const orden = data.orden;
      const cliente = orden[0].cliente;
      const direccion = orden[0].direccion;
      const id_orden = orden[0].id_orden;
      const total = orden[0].precio_total;

      const header = document.createElement("h3");
      header.textContent = `Boleta Orden #${id_orden}`;
      boletaDiv.appendChild(header);

      const infoCliente = document.createElement("p");
      infoCliente.textContent = `Cliente: ${cliente} (RUT: ${rut})`;
      boletaDiv.appendChild(infoCliente);

      const infoDireccion = document.createElement("p");
      infoDireccion.textContent = `Dirección: ${direccion}`;
      boletaDiv.appendChild(infoDireccion);

      const ul = document.createElement("ul");
      orden.forEach(item => {
        const li = document.createElement("li");
        li.textContent = `${item.producto} - Cantidad: ${item.cantidad_producto}`;
        ul.appendChild(li);
      });
      boletaDiv.appendChild(ul);

      const totalP = document.createElement("p");
      totalP.textContent = `Total a pagar: $${total}`;
      boletaDiv.appendChild(totalP);
    }

  } catch (err) {
    alert("Error al crear la orden");
    console.error(err);
  }
};