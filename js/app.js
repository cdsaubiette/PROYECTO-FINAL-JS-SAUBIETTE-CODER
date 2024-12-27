document.addEventListener('DOMContentLoaded', () => {
    const carritoKey = 'carrito';

    const getElementById = (id) => {
        const element = document.getElementById(id);
        if (!element) throw new Error(`Element with id ${id} not found`);
        return element;
    };

    const actualizarContadorCarrito = () => {
        const carrito = JSON.parse(localStorage.getItem(carritoKey)) || [];
        const contador = carrito.reduce((acc, { cantidad }) => acc + cantidad, 0);
        getElementById('carrito-count').textContent = contador;
    };

    const agregarProductoAlCarrito = (producto) => {
        let carrito = JSON.parse(localStorage.getItem(carritoKey)) || [];
        const index = carrito.findIndex(item => item.nombre === producto.nombre && item.talle === producto.talle);

        if (index !== -1) {
            carrito[index].cantidad += producto.cantidad;
        } else {
            carrito.push(producto);
        }

        localStorage.setItem(carritoKey, JSON.stringify(carrito));
        actualizarContadorCarrito();
        Toastify({ text: "Producto agregado al carrito", duration: 3000, backgroundColor: "blue" }).showToast();
    };

    const manejarProductoPage = () => {
        const params = new URLSearchParams(window.location.search);
        const productoNombre = params.get('producto');
        const productoPrecio = parseFloat(params.get('precio'));
        const productoImagen = params.get('imagen');

        getElementById('producto-nombre').textContent = productoNombre;
        getElementById('producto-imagen').src = productoImagen;
        getElementById('descripcion').textContent = `Remeras únicas con los logos de las principales tecnologías. Precio: $${productoPrecio.toFixed(2)}`;

        getElementById('agregar-carrito').addEventListener('click', (e) => {
            e.preventDefault();

            const talle = getElementById('producto-talle').value;
            const cantidad = parseInt(getElementById('cantidad').value);

            if (!talle || talle === '--Seleccionar Talle--') {
                Toastify({ text: "Por favor, selecciona el talle.", duration: 3000, backgroundColor: "orange" }).showToast();
                return;
            }

            if (!cantidad || cantidad < 1) {
                Toastify({ text: "Por favor, ingresa una cantidad válida.", duration: 3000, backgroundColor: "orange" }).showToast();
                return;
            }

            const producto = { nombre: productoNombre, precio: productoPrecio, imagen: productoImagen, talle, cantidad };
            agregarProductoAlCarrito(producto);
        });
    };

    const manejarCarritoPage = () => {
        const carritoContenido = getElementById('carrito-contenido');
        const carritoVacio = getElementById('carrito-vacio');
        const mensajeGracias = getElementById('mensaje-gracias');
        const finalizarCompraBtn = getElementById('finalizar-compra');
        const totalCarrito = getElementById('total-carrito');
        const carrito = JSON.parse(localStorage.getItem(carritoKey)) || [];

        if (carrito.length === 0) {
            carritoVacio.style.display = 'block';
            carritoContenido.style.display = 'none';
            finalizarCompraBtn.style.display = 'none';
            totalCarrito.style.display = 'none';
        } else {
            carritoVacio.style.display = 'none';
            carritoContenido.style.display = 'block';
            carritoContenido.innerHTML = '';

            let total = 0;

            carrito.forEach(({ nombre, imagen, talle, cantidad, precio }) => {
                total += precio * cantidad;
                const divProducto = document.createElement('div');
                divProducto.classList.add('producto-en-carrito');
                divProducto.innerHTML = `
                    <img class="producto-en-carrito__imagen" src="${imagen}" alt="${nombre}">
                    <div class="producto-en-carrito__info">
                        <p>${nombre}</p>
                        <p>Talle: ${talle}</p>
                        <p>Cantidad: ${cantidad}</p>
                        <p>Precio: $${(precio * cantidad).toFixed(2)}</p>
                        <button class="button is-small is-primary sumar-producto">+</button>
                        <button class="button is-small is-warning restar-producto">-</button>
                        <button class="button is-small is-danger eliminar-producto">Eliminar</button>
                    </div>
                `;
                carritoContenido.appendChild(divProducto);
            });

            totalCarrito.style.display = 'block';
            totalCarrito.innerHTML = `<p>Total: $${total.toFixed(2)}</p>`;

            document.querySelectorAll('.sumar-producto').forEach((btn, index) => {
                btn.addEventListener('click', () => {
                    carrito[index].cantidad++;
                    localStorage.setItem(carritoKey, JSON.stringify(carrito));
                    manejarCarritoPage();
                });
            });

            document.querySelectorAll('.restar-producto').forEach((btn, index) => {
                btn.addEventListener('click', () => {
                    if (carrito[index].cantidad > 1) {
                        carrito[index].cantidad--;
                        localStorage.setItem(carritoKey, JSON.stringify(carrito));
                        manejarCarritoPage();
                    }
                });
            });

            document.querySelectorAll('.eliminar-producto').forEach((btn, index) => {
                btn.addEventListener('click', () => {
                    carrito.splice(index, 1);
                    localStorage.setItem(carritoKey, JSON.stringify(carrito));
                    manejarCarritoPage();
                });
            });

            finalizarCompraBtn.style.display = 'block';
        }

        actualizarContadorCarrito();

        finalizarCompraBtn.addEventListener('click', () => {
            localStorage.removeItem(carritoKey);
            carritoContenido.style.display = 'none';
            carritoVacio.style.display = 'none';
            mensajeGracias.style.display = 'block';
            finalizarCompraBtn.style.display = 'none';
            totalCarrito.style.display = 'none';
            actualizarContadorCarrito();
        });
    };

    const fetchProductos = async () => {
        try {
            const response = await fetch('./json/productos.json');
            if (!response.ok) throw new Error('Network response was not ok');
            const productos = await response.json();
            return productos;
        } catch (error) {
            Toastify({ text: "Error al cargar productos", duration: 3000, backgroundColor: "red" }).showToast();
        }
    };

    const mostrarProductosEnIndex = async () => {
        const productosContenedor = getElementById('productos-contenedor');
        const productos = await fetchProductos();

        productos.forEach(({ nombre, precio, imagen, enlace }) => {
            const divProducto = document.createElement('div');
            divProducto.classList.add('column', 'is-one-third');
            divProducto.innerHTML = `
                <div class="card">
                    <div class="card-image">
                        <figure class="image is-4by3">
                            <img class="producto__imagen" src="${imagen}" alt="${nombre}" data-nombre="${nombre}" data-precio="${precio}" data-imagen="${imagen}">
                        </figure>
                    </div>
                    <div class="card-content">
                        <p class="title is-4">${nombre}</p>
                        <p class="subtitle is-6">Precio: $${parseFloat(precio).toFixed(2)}</p>
                    </div>
                </div>
            `;
            productosContenedor.appendChild(divProducto);
        });

        document.querySelectorAll('.producto__imagen').forEach(img => {
            img.addEventListener('click', (e) => {
                const { nombre, precio, imagen } = e.target.dataset;
                window.location.href = `producto.html?producto=${nombre}&precio=${precio}&imagen=${imagen}`;
            });
        });
    };

    const init = async () => {
        if (window.location.pathname.includes('index.html') || window.location.pathname === '/') {
            await mostrarProductosEnIndex();
        } else if (window.location.pathname.includes('producto.html')) {
            manejarProductoPage();
        } else if (window.location.pathname.includes('carrito.html')) {
            manejarCarritoPage();
        }

        actualizarContadorCarrito();
    };

    init();
});