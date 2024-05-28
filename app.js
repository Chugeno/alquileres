// Configuración de Firebase
const firebaseConfig = {
    apiKey: "AIzaSyA538me1VWuKmN7UIrmgWQq1ZChaMZsCJ0",
    authDomain: "alquileres-azurmendi.firebaseapp.com",
    projectId: "alquileres-azurmendi",
    storageBucket: "alquileres-azurmendi.appspot.com",
    messagingSenderId: "1023417131283",
    appId: "1:1023417131283:web:c6b95538415f42de3c3ae6"
};

// Inicializar Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// Referencias a elementos del DOM
const listaIngresos = document.getElementById('lista-ingresos');
const listaGastos = document.getElementById('lista-gastos');
const listaMiembros = document.getElementById('lista-miembros');
const repartoDiv = document.getElementById('reparto');

// Función para agregar un nuevo alquiler
document.getElementById('nuevo-alquiler').addEventListener('click', () => {
    const nombreAlquiler = prompt('Nombre del alquiler:');
    const nombreInquilino = prompt('Nombre del inquilino:');
    const monto = parseFloat(prompt('Monto actual que está pagando:'));
    const fechaInicio = prompt('Fecha de inicio del contrato (YYYY-MM-DD):');
    const fechaFin = prompt('Fecha de fin del contrato (YYYY-MM-DD):');
    const frecuenciaAumento = parseInt(prompt('Cada cuántos meses aumenta el alquiler:'));

    db.collection('alquileres').add({
        nombreAlquiler,
        nombreInquilino,
        monto,
        fechaInicio: new Date(fechaInicio),
        fechaFin: new Date(fechaFin),
        frecuenciaAumento
    }).then(() => {
        cargarIngresos();
    });
});

// Función para cargar alquileres
function cargarIngresos() {
    listaIngresos.innerHTML = '';
    db.collection('alquileres').get().then((snapshot) => {
        snapshot.forEach((doc) => {
            const alquiler = doc.data();
            const div = document.createElement('div');
            div.textContent = `${alquiler.nombreAlquiler} - ${alquiler.nombreInquilino} - ${alquiler.monto}`;
            listaIngresos.appendChild(div);
        });
    });
}

// Función para agregar un nuevo gasto
document.getElementById('nuevo-gasto').addEventListener('click', () => {
    const empresa = prompt('Empresa:');
    const nombreGasto = prompt('Nombre del gasto:');
    const id = prompt('ID (opcional):');
    const formaPago = prompt('Forma de pago:');
    const monto = parseFloat(prompt('Monto del gasto:'));
    const destinoAviso = prompt('Adónde llega el aviso (separar por comas):');

    db.collection('gastos').add({
        empresa,
        nombreGasto,
        id,
        formaPago,
        monto,
        destinoAviso: destinoAviso.split(',')
    }).then(() => {
        cargarGastos();
    });
});

// Función para cargar gastos
function cargarGastos() {
    listaGastos.innerHTML = '';
    db.collection('gastos').get().then((snapshot) => {
        snapshot.forEach((doc) => {
            const gasto = doc.data();
            const div = document.createElement('div');
            div.textContent = `${gasto.empresa} - ${gasto.nombreGasto} - ${gasto.monto}`;
            listaGastos.appendChild(div);
        });
    });
}

// Función para agregar un nuevo miembro
document.getElementById('nuevo-miembro').addEventListener('click', () => {
    const nombreMiembro = prompt('Nombre del miembro:');
    const porcentaje = parseFloat(prompt('Porcentaje de ganancias:'));

    db.collection('miembros').add({
        nombreMiembro,
        porcentaje
    }).then(() => {
        cargarMiembros();
    });
});

// Función para cargar miembros
function cargarMiembros() {
    listaMiembros.innerHTML = '';
    db.collection('miembros').get().then((snapshot) => {
        snapshot.forEach((doc) => {
            const miembro = doc.data();
            const div = document.createElement('div');
            div.textContent = `${miembro.nombreMiembro} - ${miembro.porcentaje}%`;
            listaMiembros.appendChild(div);
        });
    });
}

// Función para calcular y mostrar el reparto de ganancias
function calcularReparto() {
    let totalIngresos = 0;
    let totalGastos = 0;

    // Obtener ingresos
    db.collection('alquileres').get().then((snapshot) => {
        snapshot.forEach((doc) => {
            const alquiler = doc.data();
            totalIngresos += alquiler.monto;
        });

        // Obtener gastos
db.collection('gastos').get().then((snapshot) => {
    snapshot.forEach((doc) => {
        const gasto = doc.data();
        totalGastos += gasto.monto;
    });

    // Obtener miembros y calcular reparto
    db.collection('miembros').get().then((snapshot) => {
        const miembros = [];
        snapshot.forEach((doc) => {
            const miembro = doc.data();
            miembros.push(miembro);
        });

        // Calcular reparto
        const ganancias = totalIngresos - totalGastos;
        repartoDiv.innerHTML = '';
        miembros.forEach((miembro) => {
            const gananciaMiembro = (ganancias * miembro.porcentaje) / 100;
            const div = document.createElement('div');
            div.textContent = `${miembro.nombreMiembro} - ${gananciaMiembro.toFixed(2)} €`;
            repartoDiv.appendChild(div);
        });
    });
});
