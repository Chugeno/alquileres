import { db } from './index.html';
import { collection, addDoc, getDocs } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js';

// Referencias a elementos del DOM
const listaIngresos = document.getElementById('lista-ingresos');
const listaGastos = document.getElementById('lista-gastos');
const listaMiembros = document.getElementById('lista-miembros');
const repartoDiv = document.getElementById('reparto');

// Función para agregar un nuevo alquiler
document.getElementById('nuevo-alquiler').addEventListener('click', async () => {
    const nombreAlquiler = prompt('Nombre del alquiler:');
    const nombreInquilino = prompt('Nombre del inquilino:');
    const monto = parseFloat(prompt('Monto actual que está pagando:'));
    const fechaInicio = prompt('Fecha de inicio del contrato (YYYY-MM-DD):');
    const fechaFin = prompt('Fecha de fin del contrato (YYYY-MM-DD):');
    const frecuenciaAumento = parseInt(prompt('Cada cuántos meses aumenta el alquiler:'));

    if (nombreAlquiler && nombreInquilino && !isNaN(monto) && fechaInicio && fechaFin && !isNaN(frecuenciaAumento)) {
        try {
            await addDoc(collection(db, 'alquileres'), {
                nombreAlquiler,
                nombreInquilino,
                monto,
                fechaInicio: new Date(fechaInicio),
                fechaFin: new Date(fechaFin),
                frecuenciaAumento
            });
            cargarIngresos();
        } catch (error) {
            console.error("Error agregando alquiler: ", error);
        }
    } else {
        alert("Por favor, completa todos los campos correctamente.");
    }
});

// Función para cargar alquileres
async function cargarIngresos() {
    listaIngresos.innerHTML = '';
    try {
        const querySnapshot = await getDocs(collection(db, 'alquileres'));
        querySnapshot.forEach((doc) => {
            const alquiler = doc.data();
            const div = document.createElement('div');
            div.textContent = `${alquiler.nombreAlquiler} - ${alquiler.nombreInquilino} - ${alquiler.monto}`;
            listaIngresos.appendChild(div);
        });
    } catch (error) {
        console.error("Error cargando ingresos: ", error);
    }
}

// Función para agregar un nuevo gasto
document.getElementById('nuevo-gasto').addEventListener('click', async () => {
    const empresa = prompt('Empresa:');
    const nombreGasto = prompt('Nombre del gasto:');
    const id = prompt('ID (opcional):');
    const formaPago = prompt('Forma de pago:');
    const monto = parseFloat(prompt('Monto del gasto:'));
    const destinoAviso = prompt('Adónde llega el aviso (separar por comas):');

    if (empresa && nombreGasto && !isNaN(monto) && formaPago && destinoAviso) {
        try {
            await addDoc(collection(db, 'gastos'), {
                empresa,
                nombreGasto,
                id,
                formaPago,
                monto,
                destinoAviso: destinoAviso.split(',')
            });
            cargarGastos();
        } catch (error) {
            console.error("Error agregando gasto: ", error);
        }
    } else {
        alert("Por favor, completa todos los campos correctamente.");
    }
});

// Función para cargar gastos
async function cargarGastos() {
    listaGastos.innerHTML = '';
    try {
        const querySnapshot = await getDocs(collection(db, 'gastos'));
        querySnapshot.forEach((doc) => {
            const gasto = doc.data();
            const div = document.createElement('div');
            div.textContent = `${gasto.empresa} - ${gasto.nombreGasto} - ${gasto.monto}`;
            listaGastos.appendChild(div);
        });
    } catch (error) {
        console.error("Error cargando gastos: ", error);
    }
}

// Función para agregar un nuevo miembro
document.getElementById('nuevo-miembro').addEventListener('click', async () => {
    const nombreMiembro = prompt('Nombre del miembro:');
    const porcentaje = parseFloat(prompt('Porcentaje de ganancias:'));

    if (nombreMiembro && !isNaN(porcentaje)) {
        try {
            await addDoc(collection(db, 'miembros'), {
                nombreMiembro,
                porcentaje
            });
            cargarMiembros();
        } catch (error) {
            console.error("Error agregando miembro: ", error);
        }
    } else {
        alert("Por favor, completa todos los campos correctamente.");
    }
});

// Función para cargar miembros
async function cargarMiembros() {
    listaMiembros.innerHTML = '';
    try {
        const querySnapshot = await getDocs(collection(db, 'miembros'));
        querySnapshot.forEach((doc) => {
            const miembro = doc.data();
            const div = document.createElement('div');
            div.textContent = `${miembro.nombreMiembro} - ${miembro.porcentaje}%`;
            listaMiembros.appendChild(div);
        });
    } catch (error) {
        console.error("Error cargando miembros: ", error);
    }
}

// Función para calcular y mostrar el reparto de ganancias
async function calcularReparto() {
    let totalIngresos = 0;
    let totalGastos = 0;

    try {
        // Obtener ingresos
        const ingresosSnapshot = await getDocs(collection(db, 'alquileres'));
        ingresosSnapshot.forEach((doc) => {
            const alquiler = doc.data();
            totalIngresos += alquiler.monto;
        });

        // Obtener gastos
        const gastosSnapshot = await getDocs(collection(db, 'gastos'));
        gastosSnapshot.forEach((doc) => {
            const gasto = doc.data();
            totalGastos += gasto.monto;
        });

        // Obtener miembros y calcular reparto
        const miembrosSnapshot = await getDocs(collection(db, 'miembros'));
        const miembros = [];
        miembrosSnapshot.forEach((doc) => {
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
    } catch (error) {
        console.error("Error calculando reparto: ", error);
    }
}

// Cargar datos al cargar la página
window.onload = function() {
    cargarIngresos();
    cargarGastos();
    cargarMiembros();
    calcularReparto();
};
