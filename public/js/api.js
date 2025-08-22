const API_BASE = 'https://gestordecreditos.onrender.com/api';

let serverOffline = false;

function showServerErrorModal() {
  const serverErrorModal = document.getElementById('server-error-modal');
  const card = serverErrorModal.querySelector('.server-error-modal-card');

  // Mostrar el modal
  serverErrorModal.classList.remove('hidden');


  // Animación de entrada
  card.classList.remove('animate-elements');
  void card.offsetWidth;
  card.classList.add('animate-elements');
}

function hideServerErrorModal() {
  const serverErrorModal = document.getElementById('server-error-modal');
  const card = serverErrorModal.querySelector('.server-error-modal-card');

    // Animación de salida
    serverErrorModal.classList.add('hidden');
    card.classList.remove('animate-elements', 'fade-out');
}

function checkServerConnection() {
  fetch('/auth/status')
    .then(response => {
      if (response.ok) {
        if (serverOffline) {
          // Si estaba caído y se recuperó
          hideServerErrorModal();
          serverOffline = false;
        }
        console.log('Servidor activo');
      } else {
        if (!serverOffline) {
          showServerErrorModal();
          serverOffline = true;
        }
        console.warn('Estado no OK:', response.status);
      }
    })
    .catch(error => {
      if (!serverOffline) {
        showServerErrorModal();
        serverOffline = true;
      }
      console.error('Error de conexión:', error);
    });
}

// Verificar la conexión cada 5 segundos
setInterval(checkServerConnection, 5000);

// Función genérica para manejar solicitudes
async function apiRequest(endpoint, method = 'GET', data = null) {
  const config = {
    method,
    headers: { 'Content-Type': 'application/json' },
  };
  if (data) config.body = JSON.stringify(data);

  try {
    const response = await fetch(`${API_BASE}/${endpoint}`, config);
    if (!response.ok) throw new Error(`Error ${method} en ${endpoint}`);
    return await response.json();
  } catch (error) {
    console.error(`apiRequest error: ${error.message}`);
    return null;
  }
}

// CRUD para Customers
export const CustomersAPI = {
  getAll: () => apiRequest('customers'),
  getById: (id) => apiRequest(`customers/${id}`),
  getCustomerCredits: (id) => apiRequest(`/customers/${id}/credits`),
  create: (data) => apiRequest('customers', 'POST', data),
  update: (id, data) => apiRequest(`customers/${id}`, 'PUT', data),
  delete: (id) => apiRequest(`customers/${id}`, 'DELETE'),
  deleteAllData: (id) => apiRequest(`customers/${id}/with-data`, 'DELETE'),
};

// CRUD para Credits
export const CreditsAPI = {
  getAll: () => apiRequest('credits'),
  getById: (id) => apiRequest(`credits/${id}`),
  getCreditPayments: (id) => apiRequest(`/credits/${id}/payments`),
  create: (data) => apiRequest('credits', 'POST', data),
  update: (id, data) => apiRequest(`credits/${id}`, 'PUT', data),
  delete: (id) => apiRequest(`credits/${id}`, 'DELETE'),
};

export const CreditAdjustmentsAPI = {
  create: (data) => apiRequest('credit-adjustments', 'POST', data),
  getByCreditId: (creditId) => apiRequest(`credits/${creditId}/adjustments`, 'GET'),
};

// CRUD para Payments
export const PaymentsAPI = {
  getAll: () => apiRequest('payments'),
  getById: (id) => apiRequest(`payments/${id}`),
  create: (data) => apiRequest('payments', 'POST', data),
  update: (id, data) => apiRequest(`payments/${id}`, 'PUT', data),
  delete: (id) => apiRequest(`payments/${id}`, 'DELETE'),
};

// CRUD para Suppliers
export const SuppliersAPI = {
  getAll: () => apiRequest('suppliers'),
  getById: (id) => apiRequest(`suppliers/${id}`),
  getPaymentsBySupplier: (id) => apiRequest(`/suppliers/${id}/payments`),
  create: (data) => apiRequest('suppliers', 'POST', data),
  update: (id, data) => apiRequest(`suppliers/${id}`, 'PUT', data),
  delete: (id) => apiRequest(`suppliers/${id}`, 'DELETE'),
  deleteAllData: (id) => apiRequest(`suppliers/${id}/with-data`, 'DELETE'),
};

// CRUD para Supplier Payments
export const SupplierPaymentsAPI = {
  getAll: () => apiRequest('supplier-payments'),
  getById: (id) => apiRequest(`supplier-payments/${id}`),
  create: (data) => apiRequest('supplier-payments', 'POST', data),
  update: (id, data) => apiRequest(`supplier-payments/${id}`, 'PUT', data),
  delete: (id) => apiRequest(`supplier-payments/${id}`, 'DELETE'),
};

// CRUD para Daily Sales
export const DailySalesAPI = {
  getAll: () => apiRequest('daily-sales'),
  getById: (id) => apiRequest(`daily-sales/${id}`),
  create: (data) => apiRequest('daily-sales', 'POST', data),
  update: (id, data) => apiRequest(`daily-sales/${id}`, 'PUT', data),
  delete: (id) => apiRequest(`daily-sales/${id}`, 'DELETE'),
};

// CRUD para Settings
export const SettingsAPI = {
  getAll: () => apiRequest('settings'),
  getByKey: (key) => apiRequest(`settings/${key}`),
  createOrUpdate: (data) => apiRequest('settings', 'POST', data),
  update: (key, data) => apiRequest(`settings/${key}`, 'PUT', data),
  delete: (key) => apiRequest(`settings/${key}`, 'DELETE'),
};
