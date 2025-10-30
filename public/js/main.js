// Script principal para funcionalidad de check-in/check-out
// Maneja las operaciones de marcación de asistencia desde el frontend

// Obtener token de autenticación del localStorage
const token = localStorage.getItem("token");
// Elemento DOM para mostrar resultados de las operaciones
const result = document.getElementById("result");

// Event listener para botón de check-in
document.getElementById("checkin").addEventListener("click", async () => {
  // Enviar petición POST al endpoint de check-in
  const res = await fetch("/api/check/in", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}` // Incluir token JWT en headers
    }
  });
  const data = await res.json();
  // Mostrar mensaje de éxito o error según respuesta
  result.textContent = res.ok ? "Check-in registrado ✅" : data.message;
});

// Event listener para botón de check-out
document.getElementById("checkout").addEventListener("click", async () => {
  // Enviar petición POST al endpoint de check-out
  const res = await fetch("/api/check/out", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}` // Incluir token JWT en headers
    }
  });
  const data = await res.json();
  // Mostrar mensaje de éxito o error según respuesta
  result.textContent = res.ok ? "Check-out registrado ✅" : data.message;
});
