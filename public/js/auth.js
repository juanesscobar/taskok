// Script de autenticación para la página de login
// Maneja el proceso de inicio de sesión y validación de credenciales

// Event listener para el envío del formulario de login
document.getElementById("loginForm").addEventListener("submit", async (e) => {
  e.preventDefault(); // Prevenir envío por defecto del formulario

  // Obtener valores de los campos del formulario
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  try {
    // Enviar petición POST al endpoint de login
    const res = await fetch("http://localhost:3000/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }), // Datos en formato JSON
    });

    const data = await res.json();

    // Verificar respuesta exitosa y presencia de token
    if (res.ok && data.token) {
      // Almacenar token JWT en localStorage
      localStorage.setItem("token", data.token);
      // Redirigir al dashboard principal
      window.location.href = "/dashboard";
    } else {
      // Mostrar mensaje de error si credenciales inválidas
      document.getElementById("error").classList.remove("hidden");
    }
  } catch (error) {
    console.error("Error de conexión:", error);
  }
});
