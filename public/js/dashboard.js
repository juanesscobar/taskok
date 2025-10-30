// Script principal del dashboard para gestión de tareas y asistencia
// Maneja la lógica del dashboard principal con funcionalidades CRUD de tareas

// Verificar autenticación al cargar el script
const token = localStorage.getItem('token');

if (!token) {
  window.location.href = '/'; // Redirigir a login si no hay token
}

// Determinar URL base de la API desde variables de entorno o ubicación actual
const API =
  (window.VITE_API_URL || window.NEXT_PUBLIC_API_URL || window.location.origin).replace(/\/+$/, '');

// Función auxiliar para generar headers de autenticación
const authHeaders = () => ({
  Authorization: `Bearer ${token}`,
  'Content-Type': 'application/json'
});

// Funciones API centralizadas para compatibilidad con el backend

// Función para obtener tareas con filtros opcionales
async function fetchTasks(filters = {}) {
  try {
    const params = new URLSearchParams(filters); // Convertir filtros a parámetros URL
    const res = await fetch(`${API}/api/tasks?${params}`, {
      headers: authHeaders(),
      credentials: 'include' // Incluir cookies para autenticación
    });

    if (!res.ok) throw new Error(`Error al obtener tareas: ${res.status}`);
    return await res.json();
  } catch (error) {
    console.error('fetchTasks error:', error);
    throw error;
  }
}

// Función para actualizar una tarea específica
async function updateTask(id, payload) {
  try {
    const res = await fetch(`${API}/api/tasks/${id}`, {
      method: 'PATCH',
      headers: authHeaders(),
      credentials: 'include',
      body: JSON.stringify(payload) // Datos de actualización en JSON
    });

    if (!res.ok) {
      const error = await res.json().catch(() => ({ message: 'Error desconocido' }));
      throw new Error(error.message || `Error al actualizar tarea: ${res.status}`);
    }

    return await res.json();
  } catch (error) {
    console.error('updateTask error:', error);
    throw error;
  }
}

// Elementos DOM para funcionalidad de asistencia
const attendanceStatusEl = document.getElementById('attendanceStatus');
const btnAttendance = document.getElementById('btnAttendance');

// Elementos DOM para formulario de creación de tareas
const titleEl = document.getElementById('taskTitle');
const descEl = document.getElementById('taskDescription');
const statusEl = document.getElementById('taskStatus');
const linkEl = document.getElementById('taskLink');
const btnCreateTask = document.getElementById('btnCreateTask');
const taskCreateMsgEl = document.getElementById('taskCreateMsg');

// Función auxiliar para formatear fechas ISO a formato local
function formatDateTime(iso) {
  try {
    return new Date(iso).toLocaleString(); // Convertir a formato local legible
  } catch {
    return new Date().toLocaleString(); // Fallback a fecha actual si hay error
  }
}

// Función para cargar y renderizar todas las tareas del usuario
async function cargarTareas() {
  try {
    const tasks = await fetchTasks(); // Obtener tareas desde API

    // Contenedores DOM para cada estado de tarea
    const byStatus = {
      pending: document.getElementById('tasksPending'),
      in_progress: document.getElementById('tasksInProgress'),
      completed: document.getElementById('tasksCompleted')
    };

    // Limpiar contenedores antes de renderizar
    Object.values(byStatus).forEach(el => { if (el) el.innerHTML = ''; });

    // Renderizar tarjetas de tareas con información básica
    tasks.forEach(t => {
      const item = document.createElement('div');
      item.className = 'p-3 rounded bg-gray-800 mb-2 cursor-pointer hover:bg-gray-700 transition-colors';
      item.dataset.taskId = t._id; // ID de la tarea para referencia

      // Construir contenido de la tarjeta
      const parts = [];
      parts.push(t.title || '(sin título)');
      if (t.link) parts.push(`🔗`); // Indicador de enlace
      if (t.description) parts.push(`— ${t.description}`);
      parts.push(`— ${t.status}`);
      item.textContent = parts.join(' ');

      // Agregar al contenedor correspondiente según estado
      const container = byStatus[t.status] || byStatus.pending;
      if (container) container.appendChild(item);

      // Agregar enlace externo si existe
      if (t.link) {
        const a = document.createElement('a');
        a.href = t.link;
        a.target = '_blank';
        a.rel = 'noopener noreferrer';
        a.className = 'text-blue-400 underline ml-2';
        a.textContent = '(abrir)';
        a.addEventListener('click', (e) => e.stopPropagation()); // Evitar bubbling
        item.appendChild(a);
      }

      // Evento click para editar tarea (redirige a vista detallada)
      item.addEventListener('click', () => {
        window.location.href = `/mis-tareas?edit=${t._id}`;
      });
    });

    // Actualizar contadores en los encabezados
    const counts = {
      pending: tasks.filter(t => t.status === 'pending').length,
      in_progress: tasks.filter(t => t.status === 'in_progress').length,
      completed: tasks.filter(t => t.status === 'completed').length
    };

    const headings = document.querySelectorAll('main h2');
    if (headings[0]) headings[0].innerHTML = `› PENDING <span class="text-base text-gray-400">[${counts.pending}]</span>`;
    if (headings[1]) headings[1].innerHTML = `› IN_PROGRESS <span class="text-base text-gray-400">[${counts.in_progress}]</span>`;
    if (headings[2]) headings[2].innerHTML = `› COMPLETED <span class="text-base text-gray-400">[${counts.completed}]</span>`;
  } catch (err) {
    console.error('Error:', err);
  }
}

// Función para marcar asistencia (check-in/check-out inteligente)
async function marcarAsistencia() {
  if (!attendanceStatusEl) return;
  attendanceStatusEl.textContent = 'Procesando...';

  // Primero intentar CHECK-IN
  try {
    const resIn = await fetch(`${API}/api/check/in`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      credentials: 'include'
    });

    if (resIn.ok) {
      const data = await resIn.json();
      attendanceStatusEl.textContent = `Check-in registrado: ${formatDateTime(data.checkIn)}`;
      return;
    }

    // Si ya estaba marcado check-in (400), intentar CHECK-OUT
    if (resIn.status === 400) {
      const resOut = await fetch(`${API}/api/check/out`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        credentials: 'include'
      });

      if (resOut.ok) {
        const data = await resOut.json();
        // Mostrar horas trabajadas si están disponibles
        const msg = data.workedHours != null
          ? `Check-out registrado: ${formatDateTime(data.checkOut)} — horas: ${data.workedHours}`
          : `Check-out registrado: ${formatDateTime(data.checkOut)}`;
        attendanceStatusEl.textContent = msg;
        return;
      }

      // Error diferente en checkout
      const errText = await resOut.text().catch(() => '');
      attendanceStatusEl.textContent = `Error al marcar check-out (${resOut.status}) ${errText}`;
      return;
    }

    // Otros errores en check-in
    const errText = await resIn.text().catch(() => '');
    attendanceStatusEl.textContent = `Error al marcar check-in (${resIn.status}) ${errText}`;
  } catch (e) {
    attendanceStatusEl.textContent = 'Error de conexión al marcar asistencia';
  }
}

// Función para crear una nueva tarea desde el formulario
async function crearTarea() {
  if (!btnCreateTask || !titleEl || !taskCreateMsgEl) return;

  taskCreateMsgEl.textContent = ''; // Limpiar mensajes previos
  const title = (titleEl.value || '').trim();
  const description = (descEl?.value || '').trim();
  const status = statusEl?.value || 'pending';
  const link = (linkEl?.value || '').trim();

  // Validación básica del título
  if (!title) {
    taskCreateMsgEl.textContent = 'El título es obligatorio';
    return;
  }

  try {
    // Enviar petición POST para crear tarea
    const res = await fetch(`${API}/api/tasks`, {
      method: 'POST',
      headers: authHeaders(),
      credentials: 'include',
      body: JSON.stringify({ title, description, status, link })
    });

    if (!res.ok) {
      const text = await res.text().catch(() => '');
      taskCreateMsgEl.textContent = `Error al crear tarea (${res.status}) ${text}`;
      return;
    }

    // Éxito: mostrar mensaje y limpiar formulario
    taskCreateMsgEl.textContent = 'Tarea creada ✅';
    titleEl.value = '';
    if (descEl) descEl.value = '';
    if (linkEl) linkEl.value = '';
    if (statusEl) statusEl.value = 'pending';

    // Refrescar listado de tareas
    await cargarTareas();
  } catch (e) {
    taskCreateMsgEl.textContent = 'Error de conexión al crear tarea';
  }
}

// Inicialización del dashboard cuando el DOM está listo
document.addEventListener('DOMContentLoaded', () => {
  cargarTareas(); // Cargar tareas iniciales

  // Configurar event listeners para botones si existen
  if (btnAttendance) {
    btnAttendance.addEventListener('click', marcarAsistencia);
  }

  if (btnCreateTask) {
    btnCreateTask.addEventListener('click', crearTarea);
  }
});
