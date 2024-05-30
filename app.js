// Configuración de Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { getFirestore, collection, addDoc, getDocs } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyA538me1VWuKmN7UIrmgWQq1ZChaMZsCJ0",
    authDomain: "alquileres-azurmendi.firebaseapp.com",
    projectId: "alquileres-azurmendi",
    storageBucket: "alquileres-azurmendi.appspot.com",
    messagingSenderId: "1023417131283",
    appId: "1:1023417131283:web:c6b95538415f42de3c3ae6"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Referencias a elementos del DOM
const listaIngresos = document.getElementById('lista-ingresos');
const listaGastos = document.getElementById('lista-gastos');
const listaMiembros = document.getElementById('lista-miembros');
const repartoDiv = document.getElementById('reparto');
const authSection = document.getElementById('auth-section');
const registerEmail = document.getElementById('register-email');
const registerPassword = document.getElementById('register-password');
const registerButton = document.getElementById('register-button');
const loginEmail = document.getElementById('login-email');
const loginPassword = document.getElementById('login-password');
const loginButton = document.getElementById('login-button');

// Manejo de registro
registerButton.addEventListener('click', () => {
    const email = registerEmail.value;
    const password = registerPassword.value;
    createUserWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
            console.log('Usuario registrado:', userCredential.user);
            authSection.style.display = 'none';
        })
        .catch((error) => {
            console.error('Error al registrar usuario:', error);
        });
});

// Manejo de inicio de sesión
loginButton.addEventListener('click', () => {
    const email = loginEmail.value;
    const password = loginPassword.value;
    signInWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
            console.log('Usuario inició sesión:', userCredential.user);
            authSection.style.display = 'none';
        })
        .catch((error) => {
            console.error('Error al iniciar sesión:', error);
        });
});

// Verificar estado de autenticación
onAuthStateChanged(auth, (user) => {
    if (user) {
        console.log('Usuario autenticado:', user);
        authSection.style.display = 'none';
    } else {
        authSection.style.display = 'block';
    }
});

// Función para agregar un nuevo alquiler
document.getElementById('nuevo-alquiler').addEventListener('click', () => {
    const nombreAlquiler = prompt('Nombre del alquiler:');
    const nombreInquilino = prompt('Nombre del inquilino:');
    const monto = parseFloat(prompt('Monto actual que está pagando:'));
    const fechaInicio = prompt('Fecha de inicio del contrato (YYYY-MM-DD):');
    const fechaFin = prompt('Fecha de fin del contrato (YYYY-MM-DD):');
    const frecuenciaAumento = parseInt(prompt('Cada cuántos meses aumenta el alquiler:'));

    addDoc(collection(db, 'alquileres'), {
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
    getDocs(collection(db, 'alquileres')).then((snapshot) => {
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

    addDoc(collection(db, 'gastos'), {
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
    getDocs(collection(db, 'gastos')).then((snapshot) => {
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

    addDoc(collection(db, 'miembros'), {
        nombreMiembro,
        porcentaje
    }).then(() => {
        cargarMiembros();
    });
});

// Función para cargar miembros
function cargarMiembros() {
    listaMiembros.innerHTML = '';
    getDocs(collection(db, 'miembros')).then((snapshot) => {
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
    getDocs(collection(db, 'alquileres')).then((snapshot) => {
        snapshot.forEach((doc) => {
            const alquiler = doc.data();
            totalIngresos += alquiler.monto;
        });

        // Obtener gastos
        getDocs(collection(db, 'gastos')).then((snapshot) => {
            snapshot.forEach((doc) => {
                const gasto = doc.data();
                totalGastos += gasto.monto;
            });

            // Obtener miembros y calcular reparto
            getDocs(collection(db, 'miembros')).then((snapshot) => {
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
    });
}
