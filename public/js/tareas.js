// Script principal para la gestión de tareas en vista Kanban
// Maneja drag & drop, edición, creación y eliminación de tareas

// Verificar autenticación al cargar
const token = localStorage.getItem('token');

if (!token) {
  window.location.href = '/'; // Redirigir a login si no hay token
}

// Determinar URL base de la API
const API =
  (window.VITE_API_URL || window.NEXT_PUBLIC_API_URL || window.location.origin).replace(/\/+$/, '');

// Función auxiliar para generar headers de autenticación
const authHeaders = () => ({
  Authorization: `Bearer ${token}`,
  'Content-Type': 'application/json'
});

// Estado global para manejo de tareas
let currentTasks = []; // Array de tareas actuales
let currentEditingTask = null; // Tarea siendo editada actualmente

// Funciones API centralizadas para operaciones CRUD con tareas

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

// Función para obtener una tarea específica por ID
async function fetchTaskById(id) {
  try {
    const res = await fetch(`${API}/api/tasks/${id}`, {
      headers: authHeaders(),
      credentials: 'include'
    });

    if (!res.ok) throw new Error(`Error al obtener tarea: ${res.status}`);

    return await res.json();
  } catch (error) {
    console.error('fetchTaskById error:', error);
    throw error;
  }
}

// Función para actualizar una tarea existente
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

// Función para eliminar una tarea
async function deleteTask(id) {
  try {
    const res = await fetch(`${API}/api/tasks/${id}`, {
      method: 'DELETE',
      headers: authHeaders(),
      credentials: 'include'
    });

    if (!res.ok) {
      const error = await res.json().catch(() => ({ message: 'Error desconocido' }));
      throw new Error(error.message || `Error al eliminar tarea: ${res.status}`);
    }

    return await res.json();
  } catch (error) {
    console.error('deleteTask error:', error);
    throw error;
  }
}

// Función principal para renderizar el tablero Kanban
function renderKanban(tasks) {
  currentTasks = tasks; // Actualizar estado global

  // Referencias a las columnas del DOM
  const columns = {
    pending: document.getElementById('pending-column'),
    in_progress: document.getElementById('in-progress-column'),
    completed: document.getElementById('completed-column')
  };

  // Limpiar todas las columnas antes de renderizar
  Object.values(columns).forEach(col => col.innerHTML = '');

  // Agrupar tareas por su estado actual
  const tasksByStatus = {
    pending: tasks.filter(t => t.status === 'pending'),
    in_progress: tasks.filter(t => t.status === 'in_progress'),
    completed: tasks.filter(t => t.status === 'completed')
  };

  // Renderizar tareas en cada columna correspondiente
  Object.entries(tasksByStatus).forEach(([status, statusTasks]) => {
    statusTasks.forEach(task => {
      const taskElement = createTaskCard(task); // Crear elemento visual de la tarea
      columns[status].appendChild(taskElement);
    });
  });

  // Actualizar contadores de tareas por columna
  updateCounters(tasksByStatus);
}

// Función para crear el elemento visual de una tarjeta de tarea
function createTaskCard(task) {
  const card = document.createElement('div');
  card.className = 'bg-gray-900 border border-gray-600 rounded p-3 cursor-pointer hover:border-green-400 transition-colors';
  card.draggable = true; // Habilitar drag & drop
  card.dataset.taskId = task._id; // ID de la tarea para referencia

  // Configurar event listeners para la tarjeta
  card.addEventListener('click', () => openTaskModal(task)); // Abrir modal de edición
  card.addEventListener('dragstart', handleDragStart); // Iniciar drag

  // Preparar contenido de la tarjeta
  const truncatedDescription = task.description && task.description.length > 80
    ? task.description.substring(0, 80) + '...' // Truncar descripción larga
    : task.description || '';

  const createdDate = new Date(task.createdAt).toLocaleDateString(); // Formatear fecha

  // Estructura HTML de la tarjeta
  card.innerHTML = `
    <div class="flex justify-between items-start mb-2">
      <h4 class="font-semibold text-sm text-white">${escapeHtml(task.title)}</h4>
    </div>
    ${task.description ? `<p class="text-xs text-gray-300 mb-2">${escapeHtml(truncatedDescription)}</p>` : ''}
    <div class="flex justify-between items-center text-xs text-gray-400">
      <span>${createdDate}</span>
      ${task.link ? '<span class="text-blue-400">🔗</span>' : ''} <!-- Indicador de enlace -->
    </div>
  `;

  return card;
}

// Función para actualizar los contadores de tareas en cada columna
function updateCounters(tasksByStatus) {
  document.getElementById('pending-count').textContent = `[${tasksByStatus.pending.length}]`;
  document.getElementById('in-progress-count').textContent = `[${tasksByStatus.in_progress.length}]`;
  document.getElementById('completed-count').textContent = `[${tasksByStatus.completed.length}]`;
}

// Funciones para manejo del modal de edición de tareas

// Función para abrir el modal de edición con datos de la tarea
function openTaskModal(task) {
  currentEditingTask = task; // Establecer tarea actual en edición

  // Llenar campos del formulario con datos de la tarea
  document.getElementById('modalTitle').value = task.title || '';
  document.getElementById('modalDescription').value = task.description || '';
  document.getElementById('modalStatus').value = task.status || 'pending';
  document.getElementById('modalLink').value = task.link || '';

  // Limpiar mensajes previos y errores
  clearModalMessages();

  // Mostrar modal (cambiar clases para visibilidad)
  const modal = document.getElementById('taskModal');
  modal.classList.remove('hidden');
  modal.classList.add('flex');

  // Enfocar el campo de título para mejor UX
  document.getElementById('modalTitle').focus();
}

// Función para cerrar el modal de edición
function closeTaskModal() {
  const modal = document.getElementById('taskModal');
  modal.classList.add('hidden');
  modal.classList.remove('flex');

  currentEditingTask = null; // Limpiar tarea en edición
  clearModalMessages(); // Limpiar mensajes
}

// Función para limpiar mensajes y errores del modal
function clearModalMessages() {
  const titleError = document.getElementById('titleError');
  const modalMessage = document.getElementById('modalMessage');

  titleError.classList.add('hidden');
  modalMessage.classList.add('hidden');
  modalMessage.textContent = '';
}

// Función para mostrar mensaje de error en el modal
function showModalError(message) {
  const modalMessage = document.getElementById('modalMessage');
  modalMessage.textContent = message;
  modalMessage.className = 'text-sm text-red-400 mb-4';
}

// Función para mostrar mensaje de éxito en el modal
function showModalSuccess(message) {
  const modalMessage = document.getElementById('modalMessage');
  modalMessage.textContent = message;
  modalMessage.className = 'text-sm text-green-400 mb-4';
}

// Función para establecer estado de carga en el modal
function setModalLoading(loading) {
  const saveBtn = document.getElementById('saveBtn');
  const cancelBtn = document.getElementById('cancelBtn');
  const deleteBtn = document.getElementById('deleteBtn');

  // Deshabilitar botones durante carga
  saveBtn.disabled = loading;
  cancelBtn.disabled = loading;
  deleteBtn.disabled = loading;

  // Cambiar texto del botón de guardar
  if (loading) {
    saveBtn.textContent = 'Guardando...';
  } else {
    saveBtn.textContent = 'Guardar';
  }
}

// Función para manejar el envío del formulario de edición de tarea
async function handleTaskSubmit(e) {
  e.preventDefault(); // Prevenir envío por defecto

  if (!currentEditingTask) return; // Verificar que hay tarea en edición

  // Obtener valores del formulario
  const title = document.getElementById('modalTitle').value.trim();
  const description = document.getElementById('modalDescription').value.trim();
  const status = document.getElementById('modalStatus').value;
  const link = document.getElementById('modalLink').value.trim();

  // Validaciones básicas
  if (!title) {
    document.getElementById('titleError').classList.remove('hidden');
    return;
  }

  document.getElementById('titleError').classList.add('hidden');

  // Establecer estado de carga
  setModalLoading(true);
  showModalSuccess('');

  try {
    // Enviar actualización al servidor
    const updatedTask = await updateTask(currentEditingTask._id, {
      title,
      description,
      status,
      link: link || undefined // Enviar undefined si link está vacío
    });

    showModalSuccess('Tarea actualizada correctamente');

    // Actualizar estado local optimísticamente
    const taskIndex = currentTasks.findIndex(t => t._id === currentEditingTask._id);
    if (taskIndex !== -1) {
      currentTasks[taskIndex] = updatedTask;
    }

    // Re-renderizar: recargar si cambió el estado, sino solo renderizar
    if (updatedTask.status !== currentEditingTask.status) {
      await loadTasks(); // Recargar para actualizar contadores
    } else {
      renderKanban(currentTasks); // Renderizado local
    }

    // Cerrar modal después de delay para mostrar mensaje de éxito
    setTimeout(() => {
      closeTaskModal();
    }, 1000);

  } catch (error) {
    console.error('Error updating task:', error);
    showModalError(error.message);
  } finally {
    setModalLoading(false); // Restaurar estado de botones
  }
}

// Función para manejar la eliminación de una tarea
async function handleTaskDelete() {
  if (!currentEditingTask) return; // Verificar tarea en edición

  // Confirmación del usuario antes de eliminar
  const confirmed = confirm('¿Estás seguro de que deseas eliminar esta tarea?');
  if (!confirmed) return;

  setModalLoading(true); // Mostrar estado de carga

  try {
    // Enviar petición de eliminación al servidor
    await deleteTask(currentEditingTask._id);

    // Actualizar UI local removiendo la tarea eliminada
    currentTasks = currentTasks.filter(t => t._id !== currentEditingTask._id);
    renderKanban(currentTasks); // Re-renderizar tablero

    closeTaskModal(); // Cerrar modal

  } catch (error) {
    console.error('Error deleting task:', error);
    showModalError(error.message); // Mostrar error
  } finally {
    setModalLoading(false); // Restaurar botones
  }
}

// Variables y funciones para manejo de Drag & Drop
let draggedTask = null; // Referencia a la tarea siendo arrastrada

// Función para iniciar el arrastre de una tarea
function handleDragStart(e) {
  draggedTask = e.target.closest('[data-task-id]'); // Encontrar elemento de tarea
  e.dataTransfer.effectAllowed = 'move'; // Tipo de operación permitida
  e.dataTransfer.setData('text/html', e.target.outerHTML); // Datos del elemento
  e.target.classList.add('opacity-50'); // Efecto visual durante arrastre
}

// Función para permitir soltar elementos en la zona
function handleDragOver(e) {
  e.preventDefault(); // Prevenir comportamiento por defecto
  e.dataTransfer.dropEffect = 'move'; // Indicar tipo de operación
}

// Función para resaltar zona de drop al entrar
function handleDragEnter(e) {
  e.preventDefault();
  e.target.classList.add('bg-gray-700'); // Resaltar zona
}

// Función para quitar resaltado al salir de zona de drop
function handleDragLeave(e) {
  e.target.classList.remove('bg-gray-700'); // Quitar resaltado
}

// Función para manejar el evento de soltar una tarea en una nueva columna
function handleDrop(e) {
  e.preventDefault();

  // Limpiar estilos visuales de hover y arrastre
  e.target.classList.remove('bg-gray-700');
  e.target.classList.remove('opacity-50');

  if (!draggedTask) return; // Verificar que hay tarea arrastrada

  // Obtener ID de la tarea y nuevo estado destino
  const taskId = draggedTask.dataset.taskId;
  const newStatus = e.target.dataset.status || e.target.closest('[data-status]')?.dataset.status;

  if (!newStatus) return; // Verificar que hay estado destino válido

  // Encontrar la tarea en el estado actual
  const task = currentTasks.find(t => t._id === taskId);
  if (!task) return;

  // Si el estado no cambió, no hacer nada
  if (task.status === newStatus) return;

  // Actualización optimista: cambiar estado localmente primero
  const originalStatus = task.status;
  task.status = newStatus;
  renderKanban(currentTasks); // Re-renderizar con nuevo estado

  // Restaurar apariencia del elemento arrastrado
  if (draggedTask) {
    draggedTask.classList.remove('opacity-50');
  }

  // Sincronizar cambio con el backend
  updateTask(taskId, { status: newStatus })
    .then(updatedTask => {
      // Actualizar con la respuesta confirmada del servidor
      const taskIndex = currentTasks.findIndex(t => t._id === taskId);
      if (taskIndex !== -1) {
        currentTasks[taskIndex] = updatedTask;
      }
    })
    .catch(error => {
      console.error('Error updating task status:', error);

      // Revertir cambios en caso de error del servidor
      task.status = originalStatus;
      renderKanban(currentTasks);

      // Mostrar mensaje de error al usuario
      alert(`Error al cambiar estado: ${error.message}`);
    });

  draggedTask = null; // Limpiar referencia
}

// Funciones utilitarias

// Función para escapar HTML y prevenir XSS
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// Función para cargar todas las tareas desde el servidor
async function loadTasks() {
  try {
    const tasks = await fetchTasks(); // Obtener tareas desde API
    renderKanban(tasks); // Renderizar tablero Kanban
  } catch (error) {
    console.error('Error loading tasks:', error);
    // TODO: Implementar notificación de error para el usuario
  }
}

// Inicialización del módulo de tareas
document.addEventListener('DOMContentLoaded', () => {
  loadTasks(); // Cargar tareas iniciales

  // Configurar event listeners para el modal de edición
  document.getElementById('closeModal').addEventListener('click', closeTaskModal);
  document.getElementById('cancelBtn').addEventListener('click', closeTaskModal);
  document.getElementById('deleteBtn').addEventListener('click', handleTaskDelete);
  document.getElementById('taskForm').addEventListener('submit', handleTaskSubmit);

  // Cerrar modal al hacer clic fuera del contenido
  document.getElementById('taskModal').addEventListener('click', (e) => {
    if (e.target.id === 'taskModal') {
      closeTaskModal();
    }
  });

  // Validación en tiempo real del campo título
  document.getElementById('modalTitle').addEventListener('input', (e) => {
    const titleError = document.getElementById('titleError');
    if (e.target.value.trim()) {
      titleError.classList.add('hidden'); // Ocultar error si hay texto
    }
  });
});
