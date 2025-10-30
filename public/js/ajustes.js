// Script para la página de ajustes y perfil de usuario
// Maneja la carga de información del perfil y historial de tareas

// Verificar autenticación al cargar
const token = localStorage.getItem("token");
if (!token) {
  window.location.href = "/"; // Redirigir si no hay token
}

// Función para cargar datos del perfil y historial
async function cargarPerfil() {
  try {
    // Obtener información del usuario actual
    const res = await fetch("http://localhost:3000/api/users/me", {
      headers: { Authorization: `Bearer ${token}` },
    });

    const user = await res.json();
    document.getElementById("userEmail").textContent = user.email;

    // Obtener historial de tareas del usuario
    const historialRes = await fetch("http://localhost:3000/api/tasks/history", {
      headers: { Authorization: `Bearer ${token}` },
    });

    const historial = await historialRes.json();
    const lista = document.getElementById("historial");

    lista.innerHTML = ""; // Limpiar lista previa

    // Mostrar mensaje si no hay historial
    if (historial.length === 0) {
      lista.innerHTML = "<p>No hay historial todavía.</p>";
      return;
    }

    // Renderizar cada tarea del historial
    historial.forEach((t) => {
      const li = document.createElement("li");
      li.textContent = `${t.title} - ${t.status}`;
      lista.appendChild(li);
    });
  } catch (err) {
    console.error("Error:", err);
  }
}

// Función para cerrar sesión
function logout() {
  localStorage.removeItem("token"); // Eliminar token
  window.location.href = "/"; // Redirigir a login
}

// Inicializar carga de perfil cuando el DOM esté listo
document.addEventListener("DOMContentLoaded", cargarPerfil);
