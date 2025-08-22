import { v4 as uuidv4 } from 'uuid';
import { CustomersAPI , CreditsAPI , PaymentsAPI, SuppliersAPI, SupplierPaymentsAPI, DailySalesAPI, SettingsAPI, CreditAdjustmentsAPI} from './api.js';


// --- Chart.js Instances ---
let creditsStatusChartInstance = null;
let monthlyActivityChartInstance = null;

// --- Data Storage (localStorage) ---
const STORAGE_KEYS = {
    SETTINGS: 'creditApp_settings'
};

const getData = (key) => {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : [];
};

const saveData = (key, data) => {
    localStorage.setItem(key, JSON.stringify(data));
};

//const getCustomers = () => getData(STORAGE_KEYS.CUSTOMERS);]
//const saveCustomers = (customers) => saveData(STORAGE_KEYS.CUSTOMERS, customers);

//Crud Customers
const getCustomers = async () => await CustomersAPI.getAll();
const findCustomer = async (customerId) => await CustomersAPI.getById(customerId);
const saveCustomers = async (customers) => await CustomersAPI.create(customers);
const editCustomer = async (id,customer) => await CustomersAPI.update(id,customer);
const deleteCustomer = async (id) => await CustomersAPI.deleteAllData(id);
//Crud Credits
const getCredits = async () => await CreditsAPI.getAll();
const findCredit = async (creditId) => await CreditsAPI.getById(creditId);
const cancelCredit = async (creditId) => await CreditsAPI.delete(creditId);
const getCreditPayments = async (creditId) => await CreditsAPI.getCreditPayments(creditId);
const findCreditsCustomer = async (customerId) => await CustomersAPI.getCustomerCredits(customerId);
const saveCredits = async (credit) => await CreditsAPI.create(credit); 
const editCredit = async (id ,credit) => await CreditsAPI.update(id ,credit); 
//Crud Credit Adjustements
const createAdjustment = async (adjustment) => await CreditAdjustmentsAPI.create(adjustment);
const getAdjustmentsByCredit = async (creditId) => await CreditAdjustmentsAPI.getByCreditId(creditId);
//Crud Payments
const getPayments = async () => await PaymentsAPI.getAll();
const savePayment = async (id) => await PaymentsAPI.create(id);
//Crud Suppliers
const getSuppliers = async () => await SuppliersAPI.getAll();
const editSupplier = async (id , supplier) => SuppliersAPI.update(id , supplier);
const findSupplier = async (supplierId) => SuppliersAPI.getById(supplierId);
const deleteSupplier = async (supplierId) => SuppliersAPI.deleteAllData(supplierId);
const findSupplierPayments = async (supplierId) => SuppliersAPI.getPaymentsBySupplier(supplierId)
const saveSupplier = async (supplier) => SuppliersAPI.create(supplier);
//Crud Suppliers payments
const getSupplierPayments = async () => await SupplierPaymentsAPI.getAll();
const editSupplierPayment = async (id , Payment) => SupplierPaymentsAPI.update(id , Payment);
const saveSupplierPayments = async (supplierPayment) => SupplierPaymentsAPI.create(supplierPayment);

const getDailySales = async () => await DailySalesAPI.getAll();
const findDailySale = async (saleId) => await DailySalesAPI.getById(saleId);
const editDailySale = async (id , sale) => await DailySalesAPI.update(id , sale);
const saveDailySale = async (sale) => await DailySalesAPI.create(sale);
const deleteDailySale = async (id) => await DailySalesAPI.delete(id);

// --- Settings Management ---
const DEFAULT_SETTINGS = {
    empresa: 'Empresa',
    direccion: 'n/a',
    rnc: 'n/a',
    telefono: 'n/a',
    currencySymbol: '$',
    fontSizeScale: 100, // Use a percentage scale (e.g., 100 = 100%)
    databaseMode: 'api', // 'localStorage' or 'api'
    apiUrl: 'http://localhost:5000/api'
};

const getSettings = () => {
    const settings = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    const parsedSettings = settings ? JSON.parse(settings) : {};
    return { ...DEFAULT_SETTINGS, ...parsedSettings }; // Merge with defaults
};

const saveSettings = (settings) => {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
    // If database mode changes, we might need to re-initialize or warn user.
    // For now, just saving. Actual data source switching logic is not yet implemented.
};

const applySettings = () => {
    const settings = getSettings();
    // Apply font size scaling to the root HTML element
    document.documentElement.style.fontSize = `${settings.fontSizeScale}%`;

    // Currency symbol is used directly in rendering functions
    // Database mode and API URL are used by data functions (not yet fully implemented for API)
};

const renderSettings = () => {
    const settings = getSettings();
    document.getElementById('currency-symbol').value = settings.currencySymbol;
    
    const fontSizeSlider = document.getElementById('font-size-slider');
    const fontSizeValueSpan = document.getElementById('font-size-value');
    if (fontSizeSlider) { 
         fontSizeSlider.value = settings.fontSizeScale;
         if (fontSizeValueSpan) fontSizeValueSpan.textContent = settings.fontSizeScale; // Display only number
    }

    // Database Mode
    const dbModeLocalStorageRadio = document.getElementById('db-mode-localstorage');
    const dbModeApiRadio = document.getElementById('db-mode-api');
    const apiUrlContainer = document.getElementById('api-url-container');
    const apiUrlInput = document.getElementById('api-url');

    if (settings.databaseMode === 'api') {
        dbModeApiRadio.checked = true;
        apiUrlContainer.classList.remove('hidden');
    } else {
        dbModeLocalStorageRadio.checked = true;
        apiUrlContainer.classList.add('hidden');
    }
    apiUrlInput.value = settings.apiUrl || '';

    // Add event listeners to radio buttons to toggle API URL visibility
    dbModeLocalStorageRadio.addEventListener('change', () => {
        if (dbModeLocalStorageRadio.checked) {
            apiUrlContainer.classList.add('hidden');
        }
    });
    dbModeApiRadio.addEventListener('change', () => {
        if (dbModeApiRadio.checked) {
            apiUrlContainer.classList.remove('hidden');
        }
    });
};

const handleSettingsFormSubmit = (event) => {
    event.preventDefault();
    const currencySymbolInput = document.getElementById('currency-symbol');
    const fontSizeSlider = document.getElementById('font-size-slider');
    const dbMode = document.querySelector('input[name="database-mode"]:checked').value;
    const apiUrl = document.getElementById('api-url').value.trim();

    const currencySymbol = currencySymbolInput.value.trim();
    const fontSizeScale = parseInt(fontSizeSlider.value, 10); 

    if (dbMode === 'api' && !apiUrl) {
        showNotification('Por favor, ingrese la URL de la API si selecciona el modo API.', 'warning');
        document.getElementById('api-url').focus();
        return;
    }
     try {
        if (dbMode === 'api' && apiUrl) {
            new URL(apiUrl); // Validate URL format
        }
    } catch (e) {
        showNotification('La URL de la API no es válida.', 'error');
        document.getElementById('api-url').focus();
        return;
    }

    const newSettings = {
        ...getSettings(), 
        currencySymbol: currencySymbol || DEFAULT_SETTINGS.currencySymbol, 
        fontSizeScale: fontSizeScale,
        databaseMode: dbMode,
        apiUrl: dbMode === 'api' ? apiUrl : '' // Clear API URL if not in API mode
    };
    saveSettings(newSettings);
    applySettings(); 
    showNotification('Configuración guardada. Los cambios en el modo de base de datos pueden requerir recargar la aplicación para tomar efecto completamente.', 'success', 5000);
    // Optional: return to dashboard or stay? Stay for now.
    // showView('dashboard');
};

// --- Theme Management ---
const themeToggleBtn = document.getElementById('theme-toggle-btn');
const lightIcon = document.getElementById('theme-icon-light');
const darkIcon = document.getElementById('theme-icon-dark');

const setTheme = (theme) => {
    if (theme === 'dark') {
        document.body.classList.add('dark-theme');
        if(lightIcon) lightIcon.style.display = 'none';
        if(darkIcon) darkIcon.style.display = 'inline-block';
    } else {
        document.body.classList.remove('dark-theme');
        if(lightIcon) lightIcon.style.display = 'inline-block';
        if(darkIcon) darkIcon.style.display = 'none';
    }
    localStorage.setItem('theme', theme);
    if (document.getElementById('dashboard-view').classList.contains('active')) {
        renderDashboardCharts();
    }
    applySettings(); 
};

themeToggleBtn.addEventListener('click', () => {
    const currentTheme = document.body.classList.contains('dark-theme') ? 'dark' : 'light';
    setTheme(currentTheme === 'dark' ? 'light' : 'dark');
});

// --- Notification System ---
const notificationContainer = document.getElementById('notification-container');
const showNotification = (message, type = 'info', duration = 3000) => {
    const notification = document.createElement('div');
    notification.classList.add('notification', type);
    notification.textContent = message;
    notificationContainer.appendChild(notification);
    setTimeout(() => notification.style.transform = 'translateX(0)', 10);
    setTimeout(() => {
        notification.style.opacity = '0';
        notification.style.transform = 'translateX(110%)';
        setTimeout(() => notification.remove(), 300);
    }, duration);
};

// --- Modal System ---
const appModal = document.getElementById('app-modal');
const modalTitle = document.getElementById('modal-title');
const modalBody = document.getElementById('modal-body');
const modalConfirmBtn = document.getElementById('modal-confirm-btn');
const modalCancelBtn = document.getElementById('modal-cancel-btn');
const modalCloseBtn = document.getElementById('modal-close-btn');
let confirmCallback = null;
let cancelCallback = null;



const showModal = (title, bodyContent, confirmText = 'Confirmar', cancelText = 'Cancelar', onConfirm, onCancel) => {
    modalTitle.textContent = title;
    if (typeof bodyContent === 'string') {
        modalBody.innerHTML = `<p>${bodyContent}</p>`;
    } else {
        modalBody.innerHTML = '';
        modalBody.appendChild(bodyContent);
    }
    modalConfirmBtn.textContent = confirmText;
    modalCancelBtn.textContent = cancelText;
    confirmCallback = onConfirm;
    cancelCallback = onCancel;
    modalConfirmBtn.style.display = onConfirm ? 'inline-block' : 'none';
    modalCancelBtn.style.display = onCancel || !onConfirm ? 'inline-block' : 'none';
    if (!onCancel && !onConfirm) modalCancelBtn.textContent = "Cerrar";
    appModal.classList.remove('hidden');
};

function showAboutModal(autoClose = true, duration = 6000) {
    const aboutModal = document.getElementById('about-modal');
    const closeBtn = document.getElementById('about-modal-close-btn');
    const card = aboutModal.querySelector('.about-modal-card');
  
    // Mostrar el modal
    aboutModal.classList.remove('hidden');
  
    // Reiniciar animaciones internas
    card.classList.remove('animate-elements');
    void card.offsetWidth; // ← Fuerza el reinicio de animación
    card.classList.add('animate-elements');
  
    // Cerrar al hacer clic en el botón
    closeBtn.onclick = () => {
      aboutModal.classList.add('hidden');
      card.classList.remove('animate-elements');
    };
  
    // Cierre automático
    if (autoClose) {
        setTimeout(() => {
          hideAboutModal();
        }, duration);
      }
  }

  function hideAboutModal() {
    const aboutModal = document.getElementById('about-modal');
    const card = aboutModal.querySelector('.about-modal-card');
  
    // Añadir clase para animar salida
    card.classList.add('fade-out');
  
    // Esperar a que termine la animación para ocultar el modal y limpiar clases
    card.addEventListener('animationend', () => {
      aboutModal.classList.add('hidden');
      card.classList.remove('animate-elements', 'fade-out');
    }, { once: true });
  }
  


const hideModal = () => {
    appModal.classList.add('hidden');
    confirmCallback = null;
    cancelCallback = null;
};
modalConfirmBtn.addEventListener('click', () => { if (confirmCallback) confirmCallback(); hideModal(); });
modalCancelBtn.addEventListener('click', () => { if (cancelCallback) cancelCallback(); hideModal(); });
modalCloseBtn.addEventListener('click', hideModal);

// --- Navigation and View Management ---
const views = {
    dashboard: document.getElementById('dashboard-view'),
    customers: document.getElementById('customers-view'),
    activeCredits: document.getElementById('active-credits-view'),
    addCustomer: document.getElementById('add-customer-view'),
    customerDetails: document.getElementById('customer-details-view'),
    creditDetails: document.getElementById('credit-details-view'),
    settings: document.getElementById('settings-view'),
    suppliers: document.getElementById('suppliers-view'),
    addSupplier: document.getElementById('add-supplier-view'),
    supplierDetails: document.getElementById('supplier-details-view'),
    dailySales: document.getElementById('daily-sales-view'),
    addDailySale: document.getElementById('add-daily-sale-view'),
    customerActions: document.getElementById('customer-actions-view'), // New view
    supplierActions: document.getElementById('supplier-actions-view'), // New view
    dailySalesActions: document.getElementById('daily-sales-actions-view'), // New view
};
const navButtons = {
    dashboard: document.getElementById('show-dashboard-btn'),
    customers: document.getElementById('show-customers-btn'),
    // addCustomer: document.getElementById('add-customer-btn'), // Removed from main nav
    settings: document.getElementById('show-settings-btn'),
    suppliers: document.getElementById('show-suppliers-btn'),
    dailySales: document.getElementById('show-daily-sales-btn'),
};
// Track current IDs
let currentCustomerId = null;
let currentCreditId = null;
let currentSupplierId = null; 
let currentDailySaleId = null; 

// Track editing state
let editingCustomerId = null;
let editingSupplierId = null;
let editingDailySaleId = null;
// let editingCreditId = null; // For future use
// let editingPaymentId = null; // For future use

const showView = (viewName, associatedId = null) => {
    Object.values(views).forEach(view => view.classList.remove('active'));
    if (views[viewName]) {
        views[viewName].classList.add('active');
    } else {
        console.error(`View "${viewName}" not found.`);
        showNotification(`Error interno: Vista "${viewName}" no encontrada.`, 'error');
        showView('dashboard'); // Fallback
        return;
    }

    Object.values(navButtons).forEach(btn => {
        if (btn) btn.classList.remove('active-nav');
    });
    
    let currentTopLevelViewKey = viewName;
    if (['customers', 'addCustomer', 'customerDetails', 'creditDetails', 'customerActions','activeCredits'].includes(viewName)) {
        currentTopLevelViewKey = 'customers'; 
    } else if (['suppliers', 'addSupplier', 'supplierDetails', 'supplierActions'].includes(viewName)) {
        currentTopLevelViewKey = 'suppliers';
    } else if (['dailySales', 'addDailySale', 'dailySalesActions'].includes(viewName)) {
        currentTopLevelViewKey = 'dailySales';
    }

    if (navButtons[currentTopLevelViewKey]) {
        navButtons[currentTopLevelViewKey].classList.add('active-nav');
    }

    // Specific rendering/reset logic based on viewName
    switch (viewName) {
        case 'dashboard':
            renderDashboard();
            break;
        case 'customers':
            // editingCustomerId = null; // This is now handled at the end
            renderCustomerList();
            break;
        case 'addCustomer':
            if (!editingCustomerId) { // Only reset fully if not editing
                 document.getElementById('add-customer-form').reset();
                 document.querySelector('#add-customer-form button[type="submit"]').textContent = 'Guardar Cliente';
            }
            // If editingCustomerId is set, startEditCustomer would have populated the form.
            break;
        case 'activeCredits':
            renderActiveCreditList();
            break;
        case 'customerDetails':
            // This view is typically shown via showCustomerDetails(id) which handles rendering and setting currentCustomerId.
            // If somehow navigated here directly without currentCustomerId, it's an issue.
            if (!currentCustomerId && associatedId) {
                showCustomerDetails(associatedId); // Attempt to render if ID provided
            } else if (!currentCustomerId && !associatedId) {
                 console.warn("Tried to show customerDetails without a customer ID being set.");
                 showNotification("No se ha especificado un cliente para ver detalles.", "warning");
                 showView('customerActions'); // fallback to a safe view
            }
            break;
        case 'creditDetails':
            if (!currentCreditId && associatedId) {
                showCreditDetails(associatedId);
            } else if (!currentCreditId && !associatedId) {
                 console.warn("Tried to show creditDetails without a credit ID being set.");
                 showNotification("No se ha especificado un crédito para ver detalles.", "warning");
                 if(currentCustomerId) showView('customerDetails'); else showView('customerActions');
            }
            break;
        case 'settings':
            renderSettings();
            break;
        case 'suppliers':
            
            renderSupplierList();
            break;
        case 'addSupplier':
            console.log(!editingSupplierId)
            if (!editingSupplierId) {
                document.getElementById('add-supplier-form').reset();
                document.getElementById('save-supplier-btn').textContent = 'Guardar Suplidor';
            } else {
                document.getElementById('save-supplier-btn').textContent = 'Editar Suplidor';
            }
            break;
        case 'supplierDetails':
            if (!currentSupplierId && associatedId) {
                showSupplierDetails(associatedId);
            } else if (!currentSupplierId && !associatedId) {
                 console.warn("Tried to show supplierDetails without a supplier ID being set.");
                 showNotification("No se ha especificado un suplidor para ver detalles.", "warning");
                 showView('supplierActions'); 
            }
            break;
        case 'dailySales':
            renderDailySalesList(); // Default to current month or last selected
            break;
        case 'addDailySale':
            if (!editingDailySaleId) {
                const form = document.getElementById('add-daily-sale-form');
                form.reset();
                document.getElementById('daily-sale-date').valueAsDate = new Date();
                document.getElementById('save-daily-sale-btn').textContent = 'Guardar Venta';
            }
            break;
        // 'customerActions', 'supplierActions', 'dailySalesActions' views don't need special logic here.
    }
    
    // Clear editing state if navigating to a view that is not an add/edit form for that specific entity.
    // This helps ensure that opening an "add" form is always fresh unless explicitly editing.
    if (viewName !== 'addCustomer' && viewName !== 'customerDetails' && viewName !== 'creditDetails') {
        document.getElementById('addCustomerTitle').textContent = 'Nuevo Cliente';
        editingCustomerId = null;
    }
    if (viewName !== 'addSupplier' && viewName !== 'supplierDetails') {
        editingSupplierId = null;
    }
    if (viewName !== 'addDailySale') {
        editingDailySaleId = null;
    }
    // currentCustomerId, currentCreditId, currentSupplierId should persist if relevant for the active view or subsequent views.
    // They are typically set by functions like showCustomerDetails(id).

    window.scrollTo({ top: 0, behavior: 'smooth' });
};

const renderDashboardCharts = async () => {
    const credits = await getCredits();
    const payments = await getPayments();
    const isDarkTheme = document.body.classList.contains('dark-theme');
    const rootStyles = getComputedStyle(document.documentElement);
    const textColor = isDarkTheme ? rootStyles.getPropertyValue('--text-color-dark').trim() : rootStyles.getPropertyValue('--text-color-light').trim();
    const gridColor = isDarkTheme ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)';
    const tooltipBg = isDarkTheme ? 'rgba(44, 44, 44, 0.9)' : 'rgba(255,255,255,0.9)'; 
    const tooltipBorder = isDarkTheme ? rootStyles.getPropertyValue('--border-color-dark').trim() : rootStyles.getPropertyValue('--border-color-light').trim();
    const tooltipColor = textColor;

    const creditsStatusCtx = document.getElementById('credits-status-chart').getContext('2d');
    let paidCount = 0;
    let activeCount = 0;
    credits.forEach(credit => {
        const paymentsForCredit = payments.filter(p => p.creditId === credit.id);
        const totalPaid = paymentsForCredit.reduce((sum, payment) => sum + payment.amount, 0);
        if (credit.amount - totalPaid <= 0.001) paidCount++;
        else activeCount++;
    });

    if (creditsStatusChartInstance) creditsStatusChartInstance.destroy();
    creditsStatusChartInstance = new Chart(creditsStatusCtx, {
        type: 'doughnut',
        data: {
            labels: ['Pagados', 'Activos'],
            datasets: [{
                data: [paidCount, activeCount],
                backgroundColor: [
                    rootStyles.getPropertyValue('--success-color').trim(),
                    rootStyles.getPropertyValue('--warning-color').trim()
                ],
                borderColor: [
                    isDarkTheme ? rootStyles.getPropertyValue('--card-bg-dark').trim() : rootStyles.getPropertyValue('--card-bg-light').trim()
                ],
                borderWidth: 2 
            }]
        },
        options: {
            responsive: true, maintainAspectRatio: false,
            plugins: {
                legend: { position: 'top', labels: { color: textColor, boxWidth: 15, padding: 15 } },
                title: { display: false },
                tooltip: {
                    backgroundColor: tooltipBg, borderColor: tooltipBorder, borderWidth: 1,
                    bodyColor: tooltipColor, titleColor: tooltipColor,
                    padding: 10, cornerRadius: 4
                }
            }
        }
    });

    const monthlyActivityCtx = document.getElementById('monthly-activity-chart').getContext('2d');
    const last6Months = [];
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        last6Months.push({
            label: d.toLocaleString('es-ES', { month: 'short', year: 'numeric' }),
            year: d.getFullYear(), month: d.getMonth()
        });
    }
    const monthlyCredits = last6Months.map(m => credits.filter(c => { const cd = new Date(c.date); return cd.getFullYear() === m.year && cd.getMonth() === m.month; }).length);
    const monthlyPaymentsCount = last6Months.map(m => payments.filter(p => { const pd = new Date(p.date); return pd.getFullYear() === m.year && pd.getMonth() === m.month; }).length);
    const monthlySalesAmount = await Promise.all(
        last6Months.map(async m => {
          const allSales = await getDailySales(); // Asegúrate de que esto devuelve un array de ventas
          return allSales
            .filter(s => {
              const sd = new Date(s.date);
              return sd.getFullYear() === m.year && sd.getMonth() === m.month;
            })
            .reduce((sum, s) => sum + s.amount, 0);
        })
      );
      
    if (monthlyActivityChartInstance) monthlyActivityChartInstance.destroy();
    monthlyActivityChartInstance = new Chart(monthlyActivityCtx, {
        type: 'bar',
        data: {
            labels: last6Months.map(m => m.label),
            datasets: [
                {
                    label: 'Nuevos Créditos', data: monthlyCredits,
                    backgroundColor: rootStyles.getPropertyValue('--primary-color').trim(),
                    borderColor: rootStyles.getPropertyValue('--primary-color-darker').trim(),
                    borderWidth: 1, barThickness: 'flex', maxBarThickness: 30,
                    yAxisID: 'yActivity'
                },
                {
                    label: 'Pagos Registrados', data: monthlyPaymentsCount,
                    backgroundColor: rootStyles.getPropertyValue('--secondary-color').trim(),
                    borderColor: rootStyles.getPropertyValue('--secondary-color-darker').trim(),
                    borderWidth: 1, barThickness: 'flex', maxBarThickness: 30,
                    yAxisID: 'yActivity'
                },
                {
                    label: `Ventas (${getSettings().currencySymbol})`, data: monthlySalesAmount,
                    backgroundColor: rootStyles.getPropertyValue('--success-color').trim(),
                    borderColor: rootStyles.getPropertyValue('--success-color-darker').trim(),
                    borderWidth: 1, barThickness: 'flex', maxBarThickness: 30,
                    type: 'line', 
                    yAxisID: 'ySalesAmount',
                    tension: 0.3
                }
            ]
        },
        options: {
            responsive: true, maintainAspectRatio: false,
            plugins: {
                legend: { position: 'top', labels: { color: textColor, boxWidth: 15, padding: 15 } },
                title: { display: false },
                tooltip: {
                    backgroundColor: tooltipBg, borderColor: tooltipBorder, borderWidth: 1,
                    bodyColor: tooltipColor, titleColor: tooltipColor,
                    padding: 10, cornerRadius: 4,
                    callbacks: {
                        label: function(context) {
                            let label = context.dataset.label || '';
                            if (label) {
                                label += ': ';
                            }
                            if (context.parsed.y !== null) {
                                if (context.dataset.yAxisID === 'ySalesAmount') {
                                    label += new Intl.NumberFormat('es-ES', { style: 'currency', currency: getSettings().currencySymbol === '$' ? 'USD' : getSettings().currencySymbol }).format(context.parsed.y);
                                } else {
                                    label += context.parsed.y;
                                }
                            }
                            return label;
                        }
                    }
                }
            },
            scales: {
                yActivity: { 
                    type: 'linear', display: true, position: 'left',
                    beginAtZero: true, ticks: { color: textColor, stepSize: 1 }, grid: { color: gridColor },
                    title: { display: true, text: 'Cantidad', color: textColor }
                },
                ySalesAmount: {
                    type: 'linear', display: true, position: 'right',
                    beginAtZero: true, ticks: { color: textColor, callback: value => `${getSettings().currencySymbol}${value}` }, 
                    grid: { drawOnChartArea: false, color: gridColor }, 
                    title: { display: true, text: `Monto Ventas (${getSettings().currencySymbol})`, color: textColor }
                },
                x: { ticks: { color: textColor }, grid: { color: gridColor } }
            }
        }
    });
};

const renderDashboard = async () => {
    const customers = await getCustomers();
    const credits = await getCredits();
    const payments = await getPayments();
    const supplierPayments = await getSupplierPayments();
    const dailySales = await getDailySales();
    const settings = await getSettings();

    document.getElementById('stat-total-customers').textContent = customers.length;
    let activeCreditsCount = 0;
    let totalOutstandingBalance = 0;
    credits.forEach(credit => {
        const totalPaid = payments.filter(p => p.creditId === credit.id).reduce((sum, p) => sum + p.amount, 0);
        if (credit.amount - totalPaid > 0.001) {
            activeCreditsCount++;
            totalOutstandingBalance += (credit.amount - totalPaid);
        }
    });
    document.getElementById('stat-active-credits').textContent = activeCreditsCount;
    document.getElementById('stat-total-balance').textContent = `${settings.currencySymbol}${totalOutstandingBalance.toFixed(2)}`;

    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();
    const supplierPaymentsThisMonth = supplierPayments
        .filter(sp => {
            const paymentDate = new Date(sp.date);
            return paymentDate.getMonth() === currentMonth && paymentDate.getFullYear() === currentYear;
        })
        .reduce((sum, sp) => sum + sp.amount, 0);
    document.getElementById('stat-supplier-payments-month').textContent = `${settings.currencySymbol}${supplierPaymentsThisMonth.toFixed(2)}`;

    const todayStr = today.toISOString().split('T')[0]; 
    const dailySalesToday = dailySales
        .filter(ds => ds.date === todayStr)
        .reduce((sum, ds) => sum + ds.amount, 0);
    document.getElementById('stat-daily-sales-today').textContent = `${settings.currencySymbol}${dailySalesToday.toFixed(2)}`;
    
    renderDashboardCharts();
};

const renderCustomerList = async (searchTerm = '') => {
    const customerListTbody = document.getElementById('customer-list-tbody');
    const noCustomersMessage = document.getElementById('no-customers-message');
    customerListTbody.innerHTML = '';
    const customers = await getCustomers();

    const filteredCustomers = customers.filter(customer =>
        customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (customer.phone && customer.phone.toLowerCase().includes(searchTerm.toLowerCase()))
    ).sort((a, b) => a.name.localeCompare(b.name));

    if (filteredCustomers.length === 0) {
        //noCustomersMessage.classList.remove('hidden');
        customerListTbody.innerHTML = `<tr><td colspan="4" class="empty-list-message">${searchTerm ? 'No se encontraron clientes.' : 'No hay clientes registrados.'}</td></tr>`;
        return;
    }
    noCustomersMessage.classList.add('hidden');

    filteredCustomers.forEach(customer => {
        const row = customerListTbody.insertRow();
        row.classList.add('clickable-row');
        row.insertCell().textContent = customer.name;
        row.insertCell().textContent = customer.phone || 'N/A';
        row.insertCell().textContent = customer.address || 'N/A';

        const actionsCell = row.insertCell();
        const viewDetailsBtn = document.createElement('button');
        viewDetailsBtn.textContent = 'Ver Detalles';
        viewDetailsBtn.classList.add('action-button', 'button-secondary'); 
        viewDetailsBtn.onclick = (e) => { e.stopPropagation(); showCustomerDetails(customer.id); };
        actionsCell.appendChild(viewDetailsBtn);

        const editBtn = document.createElement('button');
        editBtn.textContent = 'Editar';
        editBtn.classList.add('action-button', 'button-secondary');
        editBtn.onclick = (e) => { e.stopPropagation(); startEditCustomer(customer.id); };
        actionsCell.appendChild(editBtn);

        const deleteBtn = document.createElement('button');
        deleteBtn.textContent = 'Eliminar';
        deleteBtn.classList.add('action-button', 'button-danger');
        deleteBtn.onclick = (e) => { e.stopPropagation(); confirmDeleteCustomer(customer.id); };
        actionsCell.appendChild(deleteBtn);

        row.addEventListener('click', () => showCustomerDetails(customer.id));
    });
};

/*aqui1*/
const renderActiveCreditList = async (searchTerm = '') => {
    const activeCreditsListTbody = document.getElementById('active-credits-list-tbody');
    activeCreditsListTbody.innerHTML = '';
    const credits = await getCredits();
    let totalOutstanding = 0;

    const filteredCredits = credits
        .filter(credit => {
            const isActive = credit.status === "active";
            const nameMatch = credit.Customer.name.toLowerCase().includes(searchTerm.toLowerCase());
            const amountMatch = credit.amount?.toString().includes(searchTerm);
            const dateMatch = credit.date?.toString().toLowerCase().includes(searchTerm.toLowerCase());
            return isActive && (nameMatch || amountMatch || dateMatch);
        })
        .sort((a, b) => new Date(a.date) - new Date(b.date));

    if (filteredCredits.length === 0) {
        activeCreditsListTbody.innerHTML = `
            <tr>
                <td colspan="6" class="empty-list-message">
                    ${searchTerm ? 'No se encontraron créditos activos.' : 'No hay créditos activos registrados.'}
                </td>
            </tr>`;
        return;
    }

    for (const credit of filteredCredits) {
        const payments = await getCreditPayments(credit.id);
        const totalPaid = payments.reduce((sum, payment) => sum + payment.amount, 0);
        const balance = credit.amount - totalPaid;
        if (balance > 0.001) totalOutstanding += balance;

        const row = activeCreditsListTbody.insertRow();
        row.classList.add('clickable-row');

        // Nombre del cliente (clic para ver cliente)
        const nameCell = row.insertCell();
        nameCell.textContent = credit.Customer.name;
        nameCell.classList.add('link-cell');
        nameCell.style.cursor = 'pointer';
        nameCell.onclick = () => showCustomerDetails(credit.Customer.id);

        // Fecha
        const dateCell = row.insertCell();
        dateCell.textContent = new Date(credit.date).toLocaleDateString();

        // Monto total
        row.insertCell().textContent = credit.amount?.toFixed(2) || 'N/A';

        // Total pagado
        row.insertCell().textContent = totalPaid.toFixed(2);

        // Acciones
        const actionsCell = row.insertCell();

        const viewDetailsBtn = document.createElement('button');
        viewDetailsBtn.textContent = 'Ver Cliente';
        viewDetailsBtn.classList.add('action-button', 'button-secondary');
        viewDetailsBtn.onclick = (e) => {
            e.stopPropagation();
            showCustomerDetails(credit.Customer.id);
        };
        actionsCell.appendChild(viewDetailsBtn);

        const viewCreditBtn = document.createElement('button');
        viewCreditBtn.textContent = 'Ver Crédito';
        viewCreditBtn.classList.add('action-button', 'button-secondary');
        viewCreditBtn.onclick = (e) => {
            e.stopPropagation();
            showCreditDetails(credit.id);
        };
        actionsCell.appendChild(viewCreditBtn);
    }
    document.getElementById('credits-total-balance').textContent = totalOutstanding.toFixed(2);
};



const renderCustomerDetails = async (customerId)  =>  {
    const customer = await findCustomer(customerId);
    console.log(customer)
    if (!customer) { 
        showNotification(`Cliente no encontrado (ID: ${customerId}). Volviendo a la lista.`, 'error', 5000); 
        currentCustomerId = null; // Clear invalid ID
        showView('customerActions'); return; 
    }
    currentCustomerId = customerId; // Set currentCustomerId only after successfully finding the customer
    document.getElementById('customer-detail-name').textContent = customer.name;
    document.getElementById('customer-detail-phone').textContent = customer.phone || 'N/A';
    document.getElementById('customer-detail-address').textContent = customer.address || 'N/A';

    const settings = await getSettings();
    const custCredits = await findCreditsCustomer(customerId)

    const customerCredits = custCredits.sort((a, b) => new Date(b.date) - new Date(a.date));
    let totalOutstanding = 0;

for (const credit of customerCredits) {
    const payments = await getCreditPayments(credit.id);
    const totalPaid = payments.reduce((sum, payment) => sum + payment.amount, 0);
    const balance = credit.amount - totalPaid;
    if (balance > 0.001) {
        totalOutstanding += balance;
    }
}

document.getElementById('customer-detail-total-balance').textContent = `${settings.currencySymbol} ${totalOutstanding.toFixed(2)}`;

    document.getElementById('print-customer-report-pdf-btn').onclick = async () => generateCustomerReportPDF(customerId);
    document.getElementById('print-customer-receipt-btn').onclick = async () => printCustomerReceipt(customerId);
    document.getElementById('print-customer-active-credits-report-pdf-btn').onclick = async () => generateCustomerActiveCreditsReportPDF(customerId);
    document.getElementById('print-customer-active-credits-receipt-btn').onclick = async () => printCustomerActiveCreditsReceipt(customerId);

    renderCustomerCredits(customerId);
    showView('customerDetails');
};


const renderCustomerCredits = async (customerId) => {
    const creditsTbody = document.getElementById('customer-credits-tbody');
    const noCreditsMessage = document.getElementById('no-credits-message');
    creditsTbody.innerHTML = '';
    const custCredits = await findCreditsCustomer(customerId);
    const customerCredits = custCredits.sort((a, b) => new Date(b.date) - new Date(a.date));
    

    if (customerCredits.length === 0) {
        //noCreditsMessage.classList.remove('hidden');
        creditsTbody.innerHTML = `<tr><td colspan="5" class="empty-list-message">Este cliente no tiene créditos registrados.</td></tr>`;
        return;
    }
    noCreditsMessage.classList.add('hidden');

    customerCredits.forEach(async credit => {

        const totalP = await getCreditPayments(credit.id);
        const totalPaid = totalP.reduce((sum, p) => sum + p.amount, 0);
        const currentBalance = credit.amount - totalPaid;
        const status = currentBalance <= 0.001 ? 'Pagado' : 'Activo';

        const row = creditsTbody.insertRow();
        row.classList.add('clickable-row');
        row.insertCell().textContent = `${getSettings().currencySymbol}${credit.amount.toFixed(2)}`;
        row.insertCell().textContent = `${getSettings().currencySymbol}${currentBalance.toFixed(2)}`;
        row.insertCell().textContent = new Date(credit.date).toLocaleDateString();
        const statusCell = row.insertCell();
        statusCell.textContent = status;
        statusCell.className = status === 'Pagado' ? 'status-paid' : 'status-active';

        const actionsCell = row.insertCell();
        const viewDetailsBtn = document.createElement('button');
        viewDetailsBtn.textContent = 'Ver/Pagar';
        viewDetailsBtn.classList.add('action-button', 'button-secondary');
        viewDetailsBtn.onclick = (e) => { e.stopPropagation(); showCreditDetails(credit.id); };
        actionsCell.appendChild(viewDetailsBtn);

        const deleteBtn = document.createElement('button');
        deleteBtn.textContent = 'Cancelar';
        deleteBtn.classList.add('action-button', 'button-danger');
        deleteBtn.onclick = (e) => { e.stopPropagation(); confirmCancelCredit(credit.id); };
        actionsCell.appendChild(deleteBtn);

        row.addEventListener('click', () => showCreditDetails(credit.id));

        const newStatusDB = currentBalance <= 0.001 ? 'paid' : 'active';
        if (credit.status !== newStatusDB) {
            const allCredits = await getCredits();
            const index = await findCredit(credit.id);
            console.log(credit.status , allCredits)
            if (index !== -1) {
                allCredits[index].status = newStatusDB;
                //saveCredits(allCredits);
            }
        }
    });
};

const renderCreditDetails = async (creditId) => {
    const credit = await findCredit(creditId);
    if (!credit) {
        showNotification(`Crédito no encontrado (ID: ${creditId}).`, 'error', 5000);
        currentCreditId = null; // Clear invalid ID
        if (currentCustomerId) showView('customerDetails'); else showView('customerActions');
        return;
    }
    currentCreditId = creditId; // Set after finding
    currentCustomerId = await credit.customerId;
    console.log(currentCustomerId)
    const customer = await findCustomer(currentCustomerId);
    document.getElementById('credit-detail-customer-name').textContent = `Cliente: ${customer ? customer.name : 'Desconocido'}`;
    const totalP = await getCreditPayments(credit.id);
    const totalPaid = totalP.reduce((sum, p) => sum + p.amount, 0);

    const currentBalance = credit.amount - totalPaid;
    document.getElementById('credit-detail-amount').textContent = `${getSettings().currencySymbol}${credit.amount.toFixed(2)}`;
    document.getElementById('credit-detail-balance').textContent = `${getSettings().currencySymbol}${currentBalance.toFixed(2)}`;
    document.getElementById('credit-detail-date').textContent = new Date(credit.date).toLocaleDateString();
    const status = currentBalance <= 0.001 ? 'Pagado' : 'Activo';
    const statusSpan = document.getElementById('credit-detail-status');
    statusSpan.textContent = status;
    statusSpan.className = status === 'Pagado' ? 'status-paid' : 'status-active';

    const addPaymentBtn = document.getElementById('add-payment-btn');
    if (status === 'Pagado') {
        addPaymentBtn.classList.add('hidden');
        document.getElementById('add-payment-form-container').classList.add('hidden');
    } else {
        addPaymentBtn.classList.remove('hidden');
    }

    document.getElementById('print-credit-statement-pdf-btn').onclick = () => generateCreditStatementPDF(creditId);
    document.getElementById('print-credit-receipt-btn').onclick = () => printCreditReceipt(creditId);

    renderCreditPayments(creditId);
    showView('creditDetails');
};

const renderCreditPayments = async (creditId) => {
    const paymentsTbody = document.getElementById('credit-payments-tbody');
    const noPaymentsMessage = document.getElementById('no-payments-message');
    paymentsTbody.innerHTML = '';

    // --- Obtener pagos y ajustes de crédito ---
    const creditPayments = (await getCreditPayments(creditId)).sort((a, b) => new Date(b.date) - new Date(a.date));
    // Asumiendo que getAdjustmentsByCredit es la función correcta para obtener ajustes
    const creditAdjustments = (await getAdjustmentsByCredit(creditId)).sort((a, b) => new Date(b.date) - new Date(a.date));

    // --- Combinar pagos y ajustes para mostrar en la tabla ---
    const historyItems = [
        ...creditPayments.map(p => ({ type: 'Pago', date: new Date(p.date), amount: p.amount, notes: p.notes || '' })), // Añadir notas con valor por defecto
        ...creditAdjustments.map(adj => ({ type: 'Ajuste (Suma)', date: new Date(adj.date), amount: adj.amount, notes: adj.notes || '' })) // Añadir notas con valor por defecto
    ];

    // --- Ordenar todos los elementos del historial por fecha (ascendente para la vista) ---
    historyItems.sort((a, b) => a.date - b.date); // Orden ascendente para ver el historial en orden cronológico


    if (historyItems.length === 0) {
        paymentsTbody.innerHTML = `<tr><td colspan=\"4\" class=\"empty-list-message\">No hay movimientos registrados para este crédito.</td></tr>`; // Colspan 4 para las nuevas columnas
        return;
    }
    noPaymentsMessage.classList.add('hidden');

    historyItems.forEach(item => {
        const row = paymentsTbody.insertRow();
        let amountDisplay = '';

        if (item.type === 'Pago') {
            amountDisplay = `-${getSettings().currencySymbol}${item.amount.toFixed(2)}`; // Pagos restan en visualización de movimiento
        } else if (item.type === 'Ajuste (Suma)') {
             amountDisplay = `+${getSettings().currencySymbol}${item.amount.toFixed(2)}`; // Ajustes suman en visualización de movimiento
        }

        row.insertCell().textContent = new Date(item.date).toLocaleDateString();
        row.insertCell().textContent = item.type; // Mostrar el tipo de movimiento
        row.insertCell().textContent = amountDisplay; // Mostrar monto con signo
        row.insertCell().textContent = item.notes || 'N/A'; // Mostrar notas
    });
};

// Global access for utility functions if needed from HTML (try to avoid)
window.showCustomerDetails = renderCustomerDetails; 
window.showCreditDetails = renderCreditDetails;

// --- Form Handling and Actions ---
document.getElementById('add-customer-form').addEventListener('submit', async (event) => {
    event.preventDefault();
    const nameInput = document.getElementById('customer-name');
    const phoneInput = document.getElementById('customer-phone');
    const addressInput = document.getElementById('customer-address');
    const name = nameInput.value.trim();
    const phone = phoneInput.value.trim();
    const address = addressInput.value.trim();
    /* estandarizar en la version 1.0.1 como los customers */
    if (!name) { showNotification('El nombre del cliente es obligatorio.', 'error'); return; }
    const customerId = document.getElementById('customer-name').dataset.customerId ;
    const id = (customerId) ?  null : uuidv4();
    const customerData = { id: id, name: name , phone: phone , address: address};
    
    if (!customerId) {

        await saveCustomers(customerData);
        showNotification('Guardado satisfactorio' , 'success');
    } else {

        await editCustomer(customerId , customerData);
        showNotification('Edicion satisfactoria' , 'success');
        
        document.getElementById('customer-name').dataset.customerId = '';
    }

    event.target.reset();
    //renderCustomerList();
    showView('customers'); // Go to list after save/update
    renderDashboard();
});

const startEditCustomer = async (customerId) => {
    const customer = await findCustomer(customerId);
    if (!customer) {
        showNotification('Cliente no encontrado para editar.', 'error');
        return;
    }
    editingCustomerId = customerId;
    
    document.getElementById('addCustomerTitle').textContent = 'Editar Cliente';
    document.getElementById('customer-name').dataset.customerId = customerId;
    document.getElementById('customer-name').value = customer.name;
    document.getElementById('customer-phone').value = customer.phone || '';
    document.getElementById('customer-address').value = customer.address || '';
    document.querySelector('#add-customer-form button[type="submit"]').textContent = 'Actualizar Cliente';
    showView('addCustomer');
};

const confirmDeleteCustomer = async (customerId) => {
    console.log(customerId)
    if (!!customerId){
    const customer = await findCustomer(customerId);
    
   
    showModal(
        'Confirmar Eliminación',
        `¿Está seguro de que desea eliminar al cliente "${customer.name}"? Esto también eliminará todos sus créditos y pagos asociados. Esta acción no se puede deshacer.`,
        'Eliminar Cliente',
        'Cancelar',
       async () => {
            //eliminar customer
            await deleteCustomer(customerId);
            
            showNotification(`Cliente "${customer.name}" y sus datos asociados eliminados.`, 'success');
            showView('customers');
        }
    )
} else {
    showNotification('Cliente no encontrado para eliminar.', 'error');
};
};

const confirmCancelCredit = async (creditId) => {
    console.log(creditId)
    if (!!creditId){
    const credit = await findCredit(creditId);
    
   
    showModal(
        'Confirmar Eliminación',
        `¿Está seguro de que desea Cancelar el credito? Esto también eliminará todos sus pagos asociados. Esta acción no se puede deshacer.`,
        'Cancelar Credito',
        'Cancelar',
       async () => {
            //eliminar Credito
            await cancelCredit(creditId);
            
            showNotification(`Credito "${credit.id}" y sus datos asociados eliminados.`, 'success');
            renderCustomerCredits(currentCustomerId);
        }
    )
} else {
    showNotification('Credito no encontrado para eliminar.', 'error');
};
};

document.getElementById('add-credit-form').addEventListener('submit', async (event) => {
    event.preventDefault();
    const amountInput = document.getElementById('credit-amount');
    const amount = parseFloat(amountInput.value);

    if (amount <= 0) { showNotification('Ingrese un monto de crédito válido.', 'error'); return; }
    if (!currentCustomerId) {
        showNotification('Error: Seleccione un cliente primero.', 'error');
        showView('customers'); return;
    }

    // *** INICIO DE MODIFICACIÓN ***
    const allPayments = await getPayments();
    // 1. Buscar créditos activos para el cliente actual
    const customerCredits = await findCreditsCustomer(currentCustomerId);
    const activeCredit = customerCredits.find(credit => {
        // Asegurarse de que el crédito sea activo y no esté completamente pagado
        // Aquí también necesitamos asegurar que getPayments() devuelva un array
        const paymentsForCredit = allPayments.filter(p => p.creditId === credit.id);
        const totalPaid = paymentsForCredit.reduce((sum, p) => sum + p.amount, 0);
        return credit.status === 'active' && (credit.amount - totalPaid) > 0.001;
    });


    if (activeCredit) {
        // 2. Si existe un crédito activo, actualizar su monto
        const updatedAmount = activeCredit.amount + amount;
        activeCredit.amount = updatedAmount; // Actualizar el monto en el objeto

        await editCredit(activeCredit.id, activeCredit); // Guardar el crédito actualizado
        const newAdjustment = {
            id: uuidv4(), // Generar un ID único para el ajuste
            creditId: activeCredit.id,
            amount: amount, // El monto que se está agregando
            date: new Date().toISOString(),
            type: 'addition', // Tipo de ajuste: adición
            notes: 'Monto adicional agregado' // Puedes agregar un campo de notas al formulario si quieres
        };
        try {
            await CreditAdjustmentsAPI.create(newAdjustment);
            console.log('Registro de ajuste de crédito creado:', newAdjustment);
        } catch (adjustmentError) {
            console.error('Error al crear registro de ajuste de crédito:', adjustmentError);
            showNotification('Error al registrar el detalle del ajuste de crédito.', 'warning');
            // Considera qué hacer si falla la creación del ajuste (ej: notificar y continuar, o revertir el update del crédito)
        }
        showNotification('Monto agregado al crédito existente exitosamente.', 'success');

    } else {
        // 3. Si no hay crédito activo, crear uno nuevo (lógica existente)
        const newCredit = { id: uuidv4(), customerId: currentCustomerId, amount: amount, date: new Date().toISOString(), status: 'active' };
        await saveCredits(newCredit); // Corregido: Usar saveCredits (en plural)
        showNotification('Crédito registrado exitosamente.', 'success');
    }

    // *** FIN DE MODIFICACIÓN ***

    amountInput.value = '';
    document.getElementById('add-credit-form-container').classList.add('hidden');

    renderCustomerCredits(currentCustomerId);
    renderDashboard();
});


document.getElementById('cancel-add-credit').addEventListener('click', () => {
    document.getElementById('add-credit-form-container').classList.add('hidden');
    document.getElementById('add-credit-form').reset();
});

document.getElementById('add-payment-form').addEventListener('submit', async (event) => {
    event.preventDefault();
    const amountInput = document.getElementById('payment-amount');
    const amount = parseFloat(amountInput.value);
    if (isNaN(amount) || amount <= 0) { showNotification('Ingrese un monto de pago válido.', 'error'); return; }
    if (!currentCreditId) {
        showNotification('Error: Seleccione un crédito primero.', 'error');
        if (currentCustomerId) showCustomerDetails(currentCustomerId); else showView('customers');
        return;
    }
    const credit = await findCredit(currentCreditId);
    if (!credit) {
        showNotification('Error: Crédito no encontrado.', 'error');
        if (currentCustomerId) showCustomerDetails(currentCustomerId); else showView('customers');
        return;
    }
    const paymentsReg = await getCreditPayments(currentCreditId)
    

    const totalPaid = paymentsReg.reduce((sum, p) => {
      const amt = parseFloat(p.amount);
      return sum + (isNaN(amt) ? 0 : amt);
      }, 0);

    console.log('Total pagado:', totalPaid);
    
    const currentBalance = credit.amount - totalPaid;
    console.log(credit)
    console.log(currentBalance)

    if (currentBalance <= 0.001) {
        showNotification('Este crédito ya está pagado.', 'info');
        event.target.reset();
        document.getElementById('add-payment-form-container').classList.add('hidden');
        renderCreditDetails(currentCreditId); return;
    }
    if (amount > currentBalance + 0.001) {
        showNotification(`El pago no puede exceder el saldo pendiente de ${getSettings().currencySymbol} ${currentBalance.toFixed(2)}.`, 'warning');
        amountInput.value = currentBalance.toFixed(2); return;
    }
    const newPayment = { id: uuidv4(), creditId: currentCreditId, amount: amount, date: new Date().toISOString() };
    
    savePayment(newPayment);
    //marcar credito como pago
    if (currentBalance - amount <= 0.001) {
        credit.status = 'paid';
        await editCredit(currentCreditId , credit )
        showNotification(`El credito ${currentCreditId}, Ha sido Saldado`, 'success')
    }
    event.target.reset();
    document.getElementById('add-payment-form-container').classList.add('hidden');
    showNotification(`Pago de ${getSettings().currencySymbol} ${amount.toFixed(2)} registrado.`, 'success');
    renderCreditDetails(currentCreditId);
    renderDashboard();
});

document.getElementById('cancel-add-payment').addEventListener('click', () => {
    document.getElementById('add-payment-form-container').classList.add('hidden');
    document.getElementById('add-payment-form').reset();
});

// --- Supplier Form Handling ---
document.getElementById('add-supplier-form').addEventListener('submit', async (event) => {
    event.preventDefault();
    const name = document.getElementById('supplier-name').value.trim();
    const phone = document.getElementById('supplier-phone').value.trim();
    const email = document.getElementById('supplier-email').value.trim();
    const address = document.getElementById('supplier-address').value.trim();
    const notes = document.getElementById('supplier-notes').value.trim();
    
    if (!name) { showNotification('El nombre del suplidor es obligatorio.', 'error'); return; }
    const id = (editingSupplierId) ? editingSupplierId : uuidv4();
    const supplierData = { id: id, name: name, phone: phone, email: email, address: address, notes: notes  }

    if (editingSupplierId) {
        await editSupplier(editingSupplierId , supplierData);
        showNotification('Suplidor editado exitosamente.', 'success');

    } else {
        await saveSupplier(supplierData);
        showNotification('Suplidor registrado exitosamente.', 'success');
    }
    
    event.target.reset();
    //renderSupplierList();
    showView('suppliers'); // Go to list after save/update
    renderDashboard(); // If suppliers affect dashboard
});

const startEditSupplier = async (supplierId) => {
    const supplier = await findSupplier(supplierId);
    if (!supplier) {
        showNotification('Suplidor no encontrado para editar.', 'error');
        return;
    }
    editingSupplierId = supplierId;
    document.getElementById('supplier-name').value = supplier.name;
    document.getElementById('supplier-phone').value = supplier.phone || '';
    document.getElementById('supplier-email').value = supplier.email || '';
    document.getElementById('supplier-address').value = supplier.address || '';
    document.getElementById('supplier-notes').value = supplier.notes || '';
    document.getElementById('save-supplier-btn').textContent = 'Actualizar Suplidor';
    showView('addSupplier');
};

const confirmDeleteSupplier = async (supplierId) => {
    const supplier = await findSupplier(supplierId);
    if (!supplier) {
        showNotification('Suplidor no encontrado para eliminar.', 'error');
        return;
    }
    showModal(
        'Confirmar Eliminación',
        `¿Está seguro de que desea eliminar al suplidor "${supplier.name}"? Esto también eliminará todos sus pagos asociados. Esta acción no se puede deshacer.`,
        'Eliminar Suplidor',
        'Cancelar',
        async () => {
            const response = await deleteSupplier(supplierId);
            console.log(response);
            showNotification(`Suplidor "${supplier.name}" y sus pagos asociados eliminados.`, 'success');
            showView('suppliers');
            //renderSupplierList();
            renderDashboard(); // Supplier payments affect dashboard stats
        }
    );
};

document.getElementById('add-supplier-payment-form').addEventListener('submit', async (event) => {
    event.preventDefault();
    const amountInput = document.getElementById('supplier-payment-amount');
    const dateInput = document.getElementById('supplier-payment-date');
    const notesInput = document.getElementById('supplier-payment-notes');

    const amount = parseFloat(amountInput.value);
    const date = dateInput.value; // Should be in YYYY-MM-DD format from <input type="date">
    const notes = notesInput.value.trim();

    if (isNaN(amount) || amount <= 0) { 
        showNotification('Ingrese un monto de pago válido.', 'error'); 
        amountInput.focus();
        return; 
    }
    if (!date) { 
        showNotification('Seleccione una fecha de pago.', 'error'); 
        dateInput.focus();
        return; 
    }
    if (!currentSupplierId) { 
        showNotification('Error: Suplidor no identificado. No se puede registrar el pago.', 'error', 5000); 
        showView('supplierActions'); // or 'suppliers'
        return; 
    }

    const SupplierPayment = { 
        id: uuidv4(), 
        supplierId: currentSupplierId, 
        amount, 
        date, 
        notes 
    };

    await saveSupplierPayments(SupplierPayment);

    showNotification(`Pago de ${getSettings().currencySymbol} ${amount.toFixed(2)} registrado al suplidor.`, 'success');
    
    event.target.reset(); // Reset the form
    document.getElementById('add-supplier-payment-form-container').classList.add('hidden'); // Hide the form
    
    // Re-render supplier details to show the new payment and update total
    if (views.supplierDetails.classList.contains('active')) {
        showSupplierDetails(currentSupplierId); // This function handles DOM update and calls showView
    }
    renderDashboard(); // Update dashboard stats which might include supplier payments
});

const finishDailySaleEdit = (formElement) => {
    formElement.reset();
    document.getElementById('daily-sale-date').valueAsDate = new Date();
    renderDailySalesList();
    showView('dailySales');
    renderDashboard();
};

const startEditDailySale = async (saleId) => {
    const sale = await findDailySale(saleId);
    if (!sale) {
        showNotification('Venta no encontrada para editar.', 'error');
        return;
    }
    editingDailySaleId = saleId;
    document.getElementById('daily-sale-date').value = sale.date;
    document.getElementById('daily-sale-amount').value = sale.amount;
    document.getElementById('daily-sale-notes').value = sale.notes || '';
    document.getElementById('save-daily-sale-btn').textContent = 'Actualizar Venta';
    showView('addDailySale');
};

document.getElementById('cancel-add-supplier-payment').addEventListener('click', () => {
    document.getElementById('add-supplier-payment-form-container').classList.add('hidden');
    document.getElementById('add-supplier-payment-form').reset();
});

// --- Daily Sale Form Handling ---
document.getElementById('add-daily-sale-form').addEventListener('submit', async (event) => {
    event.preventDefault();

    const dateInput = document.getElementById('daily-sale-date');
    const amountInput = document.getElementById('daily-sale-amount');
    const notesInput = document.getElementById('daily-sale-notes');

    const date = dateInput.value; 
    const amount = parseFloat(amountInput.value);
    const notes = notesInput.value.trim();

    if (!date) { 
        showNotification('Seleccione la fecha de la venta.', 'error'); 
        return; 
    }

    if (isNaN(amount) || amount < 0) { 
        showNotification('Ingrese un monto de venta válido.', 'error'); 
        return; 
    } 

    const existingSales = await getDailySales();

    const duplicatedSales = existingSales.filter(s => s.date === date);

    if (duplicatedSales.length > 0) {
        showModal(
            "Venta Duplicada",
            `Ya existe ${duplicatedSales.length > 1 ? "más de un registro" : "un registro"} de venta para el ${new Date(date + 'T00:00:00').toLocaleDateString()}. ¿Desea sobrescribir el primero o registrar una nueva venta adicional? (Si registra una nueva, se sumarán los montos en los reportes).`,
            "Sobrescribir", "Registrar Nuevo",
            // Opción: Sobrescribir
            async () => {
                console.log('sobre-escribiendo')
                const existing = duplicatedSales[0];
                const updatedSale = { ...existing, amount, notes }; // mantiene el mismo ID y fecha
                await editDailySale( updatedSale.id , updatedSale); // función que actualiza una venta existente
                showNotification('Venta diaria sobrescrita exitosamente.', 'success');
                
                event.target.reset();
                //renderDailySalesList();
                showView('dailySales');
                renderDashboard();
            },
            // Opción: Registrar nuevo
            async () => {
                console.log('Registrar nuevo');
                const newSale = { id: uuidv4(), date, amount, notes };
                await saveDailySale(newSale); // se guarda como nueva, no reemplaza ninguna
                event.target.reset();
                showNotification('Nueva venta diaria registrada exitosamente.', 'success');
                //renderDailySalesList();
                showView('dailySales');
                renderDashboard();
            }

        );
        return; 
    } else {
    // Si no hay duplicados, registrar normalmente
    const newSale = { id: uuidv4(), date, amount, notes };
    await saveDailySale(newSale);
    event.target.reset();
    showNotification('Venta diaria registrada exitosamente.', 'success');
    //renderDailySalesList();
    showView('dailySales');
    renderDashboard();
    }
});

document.getElementById('back-to-customer-actions-from-credit-list-btn').addEventListener('click', () => showView('customerActions'));

// --- Event Listeners for Navigation and UI ---
document.getElementById('show-dashboard-btn').addEventListener('click', () => showView('dashboard'));
document.getElementById('dashboard-show-customers-btn').addEventListener('click', () => showView('customers'));
document.getElementById('dashboard-add-customer-btn').addEventListener('click', () => showView('addCustomer'));
document.getElementById('dashboard-show-suppliers-btn').addEventListener('click', () => showView('suppliers'));
document.getElementById('dashboard-record-daily-sale-btn').addEventListener('click', () => showView('addDailySale'));

document.getElementById('show-customers-btn').addEventListener('click', () => showView('customerActions')); // Changed to show intermediate view
// document.getElementById('add-customer-btn').addEventListener('click', () => { // Button removed
//    document.getElementById('add-customer-form').reset(); showView('addCustomer');
// });
document.getElementById('show-suppliers-btn').addEventListener('click', () => showView('supplierActions'));
document.getElementById('show-daily-sales-btn').addEventListener('click', () => showView('dailySalesActions'));

// --- Additional navigation inside "customerActions" view ---
document.getElementById('action-show-add-customer-form-btn').addEventListener('click', () => {
    document.getElementById('add-customer-form').reset();
    showView('addCustomer');
});
document.getElementById('action-show-active-credits-list-btn').addEventListener('click', () => showView('activeCredits'));
document.getElementById('action-show-customer-list-btn').addEventListener('click', () => showView('customers'));

// Example "Volver" buttons inside the "customerActions" view
document.getElementById('back-to-customer-actions-from-add-btn').addEventListener('click', () => showView('customerActions'));
document.getElementById('back-to-customer-actions-from-list-btn').addEventListener('click', () => showView('customerActions'));

// --- Supplier Actions Navigation ---
document.getElementById('action-show-add-supplier-form-btn').addEventListener('click', () => {
    editingSupplierId = null; // Ensure not in edit mode
    showView('addSupplier');
});
document.getElementById('action-show-supplier-list-btn').addEventListener('click', () => showView('suppliers'));
document.getElementById('back-to-supplier-actions-from-add-btn').addEventListener('click', () => showView('supplierActions'));
document.getElementById('back-to-supplier-actions-from-list-btn').addEventListener('click', () => showView('supplierActions'));

// --- Daily Sales Actions Navigation ---
document.getElementById('action-show-add-daily-sale-form-btn').addEventListener('click', () => {
    editingDailySaleId = null; // Ensure not in edit mode
    showView('addDailySale');
});
document.getElementById('action-show-daily-sales-list-btn').addEventListener('click', () => showView('dailySales'));
document.getElementById('back-to-daily-sales-actions-from-add-btn').addEventListener('click', () => showView('dailySalesActions'));
document.getElementById('back-to-daily-sales-actions-from-list-btn').addEventListener('click', () => showView('dailySalesActions'));

const fontSizeSlider = document.getElementById('font-size-slider');
const fontSizeValueSpan = document.getElementById('font-size-value'); 
if (fontSizeSlider) {
    fontSizeSlider.addEventListener('input', (event) => {
        const scaleValue = event.target.value;
        document.documentElement.style.fontSize = `${scaleValue}%`; // Apply scaling to HTML element
        if (fontSizeValueSpan) fontSizeValueSpan.textContent = scaleValue; // Update span text
    });
}

// --- Supplier Management ---
const renderSupplierList = async (searchTerm = '') => {
    const supplierListTbody = document.getElementById('supplier-list-tbody');
    const noSuppliersMessage = document.getElementById('no-suppliers-message');
    supplierListTbody.innerHTML = '';
    const suppliers = await getSuppliers();

    const filteredSuppliers = suppliers.filter(supplier =>
        supplier.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (supplier.phone && supplier.phone.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (supplier.email && supplier.email.toLowerCase().includes(searchTerm.toLowerCase()))
    ).sort((a, b) => a.name.localeCompare(b.name));

    if (filteredSuppliers.length === 0) {
        //noSuppliersMessage.classList.remove('hidden');
        supplierListTbody.innerHTML = `<tr><td colspan="4" class="empty-list-message">${searchTerm ? 'No se encontraron suplidores.' : 'No hay suplidores registrados.'}</td></tr>`;
        return;
    }
    noSuppliersMessage.classList.add('hidden');

    filteredSuppliers.forEach(supplier => {
        const row = supplierListTbody.insertRow();
        row.classList.add('clickable-row');
        row.insertCell().textContent = supplier.name;
        row.insertCell().textContent = supplier.phone || 'N/A';
        row.insertCell().textContent = supplier.email || 'N/A';

        const actionsCell = row.insertCell();
        const viewDetailsBtn = document.createElement('button');
        viewDetailsBtn.textContent = 'Ver Detalles';
        viewDetailsBtn.classList.add('action-button', 'button-secondary'); 
        viewDetailsBtn.onclick = (e) => { e.stopPropagation(); showSupplierDetails(supplier.id); };
        actionsCell.appendChild(viewDetailsBtn);

        const editBtn = document.createElement('button');
        editBtn.textContent = 'Editar';
        editBtn.classList.add('action-button', 'button-secondary');
        editBtn.onclick = (e) => { e.stopPropagation(); startEditSupplier(supplier.id); };
        actionsCell.appendChild(editBtn);

        const deleteBtn = document.createElement('button');
        deleteBtn.textContent = 'Eliminar';
        deleteBtn.classList.add('action-button', 'button-danger');
        deleteBtn.onclick = (e) => { e.stopPropagation(); confirmDeleteSupplier(supplier.id); };
        actionsCell.appendChild(deleteBtn);

        row.addEventListener('click', () => showSupplierDetails(supplier.id));
    });
};

const showSupplierDetails = async (supplierId) => {
    const supplier = await findSupplier(supplierId);
    if (!supplier) { 
        showNotification(`Suplidor no encontrado (ID: ${supplierId}). Volviendo a la lista.`, 'error', 5000); 
        currentSupplierId = null; // Clear invalid ID
        showView('supplierActions'); return; 
    }
    currentSupplierId = supplierId; // Set currentSupplierId only after successfully finding the supplier

    document.getElementById('supplier-detail-name').textContent = supplier.name;
    document.getElementById('supplier-detail-phone').textContent = supplier.phone || 'N/A';
    document.getElementById('supplier-detail-email').textContent = supplier.email || 'N/A';
    document.getElementById('supplier-detail-address').textContent = supplier.address || 'N/A';
    document.getElementById('supplier-detail-notes').textContent = supplier.notes || 'N/A';
    //aqui
    const paymentsToSupplier = await findSupplierPayments(supplierId);
    const totalPaidToSupplier = paymentsToSupplier.reduce((sum, p) => sum + p.amount, 0);
    document.getElementById('supplier-detail-total-paid').textContent = `${getSettings().currencySymbol} ${totalPaidToSupplier.toFixed(2)}`;

    document.getElementById('print-supplier-payments-report-pdf-btn').onclick = async () => generateSupplierPaymentsReportPDF(supplierId);
    document.getElementById('print-supplier-payments-receipt-btn').onclick = async () => printSupplierPaymentsReceipt(supplierId);

    renderSupplierPaymentsTable(supplierId);
    showView('supplierDetails');
};

const renderSupplierPaymentsTable = async (supplierId) => {
    const paymentsTbody = document.getElementById('supplier-payments-tbody');
    const noPaymentsMessage = document.getElementById('no-supplier-payments-message');
    paymentsTbody.innerHTML = '';
    const SuppPayments = await findSupplierPayments(supplierId)
    console.log(SuppPayments);
    const supplierPaymentsMade = SuppPayments.sort((a, b) => new Date(b.date) - new Date(a.date));

    if (supplierPaymentsMade.length === 0) {
        //noPaymentsMessage.classList.remove('hidden');
        paymentsTbody.innerHTML = `<tr><td colspan="3" class="empty-list-message">No hay pagos registrados para este suplidor.</td></tr>`;
        return;
    }
    noPaymentsMessage.classList.add('hidden');

    supplierPaymentsMade.forEach(payment => {
        const row = paymentsTbody.insertRow();
        row.insertCell().textContent = `${getSettings().currencySymbol}${payment.amount.toFixed(2)}`;
        row.insertCell().textContent = new Date(payment.date).toLocaleDateString();
        row.insertCell().textContent = payment.notes || 'N/A';
    });
};

// --- Daily Sales Management ---
const renderDailySalesList = async (filterMonth = null) => {
    const salesTbody = document.getElementById('daily-sales-tbody');
    const noSalesMessage = document.getElementById('no-daily-sales-message');
   
    
    salesTbody.innerHTML = '';
    let salesData = await getDailySales();

    const salesMonthFilter = document.getElementById('sales-month-filter');
    if (!filterMonth) { 
        filterMonth = salesMonthFilter.value || new Date().toISOString().substring(0, 7); 
    }
    salesMonthFilter.value = filterMonth; 

    if (filterMonth) {
        salesData = salesData.filter(sale => sale.date.startsWith(filterMonth));
    }

    salesData.sort((a, b) => new Date(b.date) - new Date(a.date));

    if (salesData.length === 0) {
        //noSalesMessage.classList.remove('hidden');
        noSalesMessage.textContent = `No hay ventas diarias registradas para ${new Date(filterMonth + '-02').toLocaleString('default', { month: 'long', year: 'numeric' })}.`; 
        salesTbody.innerHTML = `<tr><td colspan="4" class="empty-list-message">${noSalesMessage.textContent}</td></tr>`;
        return;
    }
    noSalesMessage.classList.add('hidden');

    salesData.forEach(sale => {
        const row = salesTbody.insertRow();
        row.insertCell().textContent = new Date(sale.date + 'T00:00:00').toLocaleDateString(); 
        row.insertCell().textContent = `${getSettings().currencySymbol}${sale.amount.toFixed(2)}`;
        row.insertCell().textContent = sale.notes || 'N/A';
        
        const actionsCell = row.insertCell();
        const printBtn = document.createElement('button');
        printBtn.textContent = 'Recibo';
        printBtn.classList.add('action-button', 'button-secondary');
        printBtn.onclick = () => printDailySaleReceipt(sale.id);
        actionsCell.appendChild(printBtn);

        const editBtn = document.createElement('button');
        editBtn.textContent = 'Editar';
        editBtn.classList.add('action-button', 'button-secondary');
        editBtn.onclick = async () => startEditDailySale(sale.id);
        actionsCell.appendChild(editBtn);

        const deleteBtn = document.createElement('button');
        deleteBtn.textContent = 'Eliminar';
        deleteBtn.classList.add('action-button', 'button-danger'); 
        deleteBtn.onclick = () => {
            showModal('Confirmar Eliminación', `¿Está seguro de que desea eliminar el registro de venta del ${new Date(sale.date + 'T00:00:00').toLocaleDateString()} por ${getSettings().currencySymbol}${sale.amount.toFixed(2)}?`, 'Eliminar', 'Cancelar',
               async () => {
                    await deleteDailySale(sale.id);
                    showNotification('Venta eliminada.', 'success');
                    renderDailySalesList(filterMonth);
                    renderDashboard();
                }
            );
        };
        actionsCell.appendChild(deleteBtn);
    });
};

document.getElementById('back-to-suppliers-btn').addEventListener('click', () => showView('suppliers'));

document.getElementById('search-supplier').addEventListener('input', (event) => {
    renderSupplierList(event.target.value);
});
document.getElementById('search-credits').addEventListener('input', (event) => {
    renderActiveCreditList(event.target.value);
});
document.getElementById('sales-month-filter').addEventListener('change', async (event) => {
    renderDailySalesList(event.target.value);
});

document.getElementById('add-supplier-payment-btn').addEventListener('click', () => {
    if (!currentSupplierId) { showNotification('Seleccione un suplidor.', 'warning'); showView('suppliers'); return; }
    const formContainer = document.getElementById('add-supplier-payment-form-container');
    formContainer.classList.remove('hidden');
    document.getElementById('add-supplier-payment-form').reset();
    document.getElementById('supplier-payment-date').valueAsDate = new Date(); 
    document.getElementById('supplier-payment-amount').focus();
});

// --- PDF and Print Report Generation ---
const { jsPDF } = window.jspdf; 
const { autoTable } = window.jspdf; 

const generateCustomerReportPDF = async (customerId) => {
    const customer = await findCustomer(customerId);
    if (!customer) {
        showNotification('Cliente no encontrado para PDF.', 'error');
        return;
    }

    const customerCredits = (await findCreditsCustomer(customerId))
        .sort((a, b) => new Date(b.date) - new Date(a.date));

    const payments = await getPayments(); // Asumimos que puede ser async
    const settings = await getSettings(); // Igual
open
    let totalOutstandingBalance = 0;
    const creditData = [];

    for (const credit of customerCredits) {
        const paymentsForCredit = payments.filter(p => p.creditId === credit.id);
        const totalPaid = paymentsForCredit.reduce((sum, p) => sum + p.amount, 0);
        const balance = credit.amount - totalPaid;

        if (balance > 0.001) {
            totalOutstandingBalance += balance;
        }

        creditData.push([
            `${settings.currencySymbol} ${credit.amount.toFixed(2)}`,
            `${settings.currencySymbol} ${balance.toFixed(2)}`,
            new Date(credit.date).toLocaleDateString(),
            balance <= 0.001 ? 'Pagado' : 'Activo'
        ]);
    }

    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text(`Reporte de Cliente: ${customer.name}`, 14, 20);

    doc.setFontSize(11);
    doc.setTextColor(100);
    doc.text(`Teléfono: ${customer.phone || 'N/A'}`, 14, 30);
    doc.text(`Dirección: ${customer.address || 'N/A'}`, 14, 36);
    doc.text(`Fecha de Reporte: ${new Date().toLocaleDateString()}`, 14, 42);

    doc.autoTable({
        startY: 50,
        head: [[
            `Monto Principal (${settings.currencySymbol})`,
            `Saldo Pendiente (${settings.currencySymbol})`,
            'Fecha Registro',
            'Estado'
        ]],
        body: creditData,
        theme: 'striped',
        headStyles: { fillColor: [0, 112, 186] },
    });

    const finalY = doc.lastAutoTable ? doc.lastAutoTable.finalY || 50 : 50;

    doc.setFontSize(12);
    doc.setFont(undefined, 'bold');
    doc.text(`Saldo Pendiente Total del Cliente: ${settings.currencySymbol}${totalOutstandingBalance.toFixed(2)}`, 14, finalY + 10);

    doc.save(`Reporte_Cliente_${customer.name.replace(/\s/g, '_')}.pdf`);
    showNotification('Reporte PDF del cliente generado.', 'success');
};

const generateCustomerActiveCreditsReportPDF = async (customerId) => {
    const customer = await findCustomer(customerId);
    if (!customer) {
        showNotification('Cliente no encontrado para PDF.', 'error');
        return;
    }

    const allCustomerCredits = await findCreditsCustomer(customerId);
    const settings = await getSettings();
    let totalOutstandingBalanceActive = 0;

    const activeCustomerCredits = [];

    // Usar for...of en lugar de filter con async
    for (const credit of allCustomerCredits) {
        const payments = await getCreditPayments(credit.id);
        const totalPaid = payments.reduce((sum, p) => sum + p.amount, 0);
        const balance = credit.amount - totalPaid;

        if (balance > 0.001) {
            activeCustomerCredits.push({
                amount: credit.amount,
                balance,
                date: credit.date
            });
            totalOutstandingBalanceActive += balance;
        }
    }

    if (activeCustomerCredits.length === 0) {
        showNotification('El cliente no tiene créditos activos para generar el reporte.', 'info');
        return;
    }

    // Ordenar por fecha descendente
    activeCustomerCredits.sort((a, b) => new Date(b.date) - new Date(a.date));

    // Crear PDF
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text(`Reporte de Créditos Activos: ${customer.name}`, 14, 20);
    doc.setFontSize(11);
    doc.setTextColor(100);
    doc.text(`Teléfono: ${customer.phone || 'N/A'}`, 14, 30);
    doc.text(`Dirección: ${customer.address || 'N/A'}`, 14, 36);
    doc.text(`Fecha de Reporte: ${new Date().toLocaleDateString()}`, 14, 42);

    const creditData = activeCustomerCredits.map(c => [
        `${settings.currencySymbol}${c.amount.toFixed(2)}`,
        `${settings.currencySymbol}${c.balance.toFixed(2)}`,
        new Date(c.date).toLocaleDateString(),
        'Activo'
    ]);

    doc.autoTable({
        startY: 50,
        head: [[
            `Monto Principal (${settings.currencySymbol})`,
            `Saldo Pendiente (${settings.currencySymbol})`,
            'Fecha Registro',
            'Estado'
        ]],
        body: creditData,
        theme: 'striped',
        headStyles: { fillColor: [0, 112, 186] },
    });

    const finalY = doc.lastAutoTable?.finalY || 50;
    doc.setFontSize(12);
    doc.setFont(undefined, 'bold');
    doc.text(
        `Saldo Pendiente Total (Créditos Activos): ${settings.currencySymbol}${totalOutstandingBalanceActive.toFixed(2)}`,
        14,
        finalY + 10
    );

    doc.save(`Reporte_Creditos_Activos_${customer.name.replace(/\s/g, '_')}.pdf`);
    showNotification('Reporte PDF de créditos activos del cliente generado.', 'success');
};


const printCustomerReceipt = async (customerId) => {
    const customer = await findCustomer(customerId);
    if (!customer) { 
        showNotification('Cliente no encontrado para recibo.', 'error'); 
        return; 
    }

    const custCredits = await findCreditsCustomer(customerId);
    const customerCredits = custCredits.sort((a, b) => new Date(b.date) - new Date(a.date));
    let totalOutstandingBalance = 0;

    let receiptHTML = `
        <div class="printable-receipt">
            <h1>Recibo Cliente</h1>
            <h2>${customer.name}</h2>
            <p>Tel: ${customer.phone || 'N/A'}</p>
            <p>Dir: ${customer.address || 'N/A'}</p>
            <p>Fecha: ${new Date().toLocaleString()}</p>
            <hr>
            <h3>Créditos:</h3>
            <table>
                <thead><tr><th>Monto</th><th>Saldo</th><th>Fecha</th><th>Estado</th></tr></thead>
                <tbody>`;

    for (const credit of customerCredits) {
        const paymentsForCredit = await getCreditPayments(credit.id);
        const totalPaid = paymentsForCredit.reduce((sum, payment) => sum + payment.amount, 0);
        const balance = credit.amount - totalPaid;
        if (balance > 0.001) totalOutstandingBalance += balance;
        receiptHTML += `
            <tr>
                <td>${getSettings().currencySymbol} ${credit.amount.toFixed(2)}</td>
                <td>${getSettings().currencySymbol} ${balance.toFixed(2)}</td>
                <td>${new Date(credit.date).toLocaleDateString()}</td>
                <td>${balance <= 0.001 ? 'Pagado' : 'Activo'}</td>
            </tr>`;
    }

    receiptHTML += `
                </tbody>
            </table>
            <hr>
            <p><strong>SALDO TOTAL PENDIENTE: ${getSettings().currencySymbol}${totalOutstandingBalance.toFixed(2)}</strong></p>
            <hr>
            <p style="text-align:center;">Gracias por su preferencia.</p>
        </div>`;

    const printWindow = window.open('', '_blank');
    printWindow.document.write('<html><head><title>Recibo Cliente</title>');

    // Estilos en línea desde tu propia app
    const styles = Array.from(document.styleSheets)
        .map(styleSheet => {
            try {
                return Array.from(styleSheet.cssRules).map(rule => rule.cssText).join('');
            } catch (e) { return ''; }
        }).join('');

    printWindow.document.write(`<style>${styles}</style></head><body>`);
    printWindow.document.write(receiptHTML);
    printWindow.document.write('</body></html>');
    printWindow.document.close();
    printWindow.onload = function () {
        printWindow.focus();
        printWindow.print();
    };
};

const printCustomerActiveCreditsReceipt = async (customerId) => {
    const customer = await findCustomer(customerId);
    if (!customer) {
        showNotification('Cliente no encontrado para recibo.', 'error');
        return;
    }

    const allCustomerCredits = await findCreditsCustomer(customerId);
    const settings = await getSettings();
    let totalOutstandingBalanceActive = 0;
    const activeCustomerCredits = [];

    // Filtrar créditos activos de forma secuencial
    for (const credit of allCustomerCredits) {
        const payments = await getCreditPayments(credit.id);
        const totalPaid = payments.reduce((sum, p) => sum + p.amount, 0);
        const balance = credit.amount - totalPaid;

        if (balance > 0.001) {
            activeCustomerCredits.push({
                amount: credit.amount,
                balance,
                date: credit.date
            });
            totalOutstandingBalanceActive += balance;
        }
    }

    if (activeCustomerCredits.length === 0) {
        showNotification('El cliente no tiene créditos activos para imprimir recibo.', 'info');
        return;
    }

    // Ordenar por fecha descendente
    activeCustomerCredits.sort((a, b) => new Date(b.date) - new Date(a.date));

    // Crear HTML del recibo
    let receiptHTML = `
        <div class="printable-receipt">
            <h1>Recibo Créditos Activos</h1>
            <h2>${customer.name}</h2>
            <p>Tel: ${customer.phone || 'N/A'}</p>
            <p>Dir: ${customer.address || 'N/A'}</p>
            <p>Fecha: ${new Date().toLocaleString()}</p>
            <hr>
            <h3>Créditos Activos:</h3>
            <table>
                <thead><tr><th>Monto</th><th>Saldo</th><th>Fecha</th><th>Estado</th></tr></thead>
                <tbody>`;

    activeCustomerCredits.forEach(c => {
        receiptHTML += `
            <tr>
                <td>${settings.currencySymbol}${c.amount.toFixed(2)}</td>
                <td>${settings.currencySymbol}${c.balance.toFixed(2)}</td>
                <td>${new Date(c.date).toLocaleDateString()}</td>
                <td>Activo</td>
            </tr>`;
    });

    receiptHTML += `
                </tbody>
            </table>
            <hr>
            <p><strong>SALDO TOTAL PENDIENTE (ACTIVOS): ${settings.currencySymbol}${totalOutstandingBalanceActive.toFixed(2)}</strong></p>
            <hr>
            <p style="text-align:center;">Gracias por su preferencia.</p>
        </div>`;

    // Crear ventana para imprimir
    const printWindow = window.open('', '_blank');
    printWindow.document.write('<html><head><title>Recibo Créditos Activos Cliente</title>');

    const styles = Array.from(document.styleSheets).map(styleSheet => {
        try {
            return Array.from(styleSheet.cssRules).map(rule => rule.cssText).join('');
        } catch (e) {
            return '';
        }
    }).join('');

    printWindow.document.write(`<style>${styles}</style></head><body>`);
    printWindow.document.write(receiptHTML);
    printWindow.document.write('</body></html>');
    printWindow.document.close();

    // Esperar que se cargue antes de imprimir
    printWindow.onload = function () {
        printWindow.focus();
        printWindow.print();
    };
};

const generateCreditStatementPDF = async (creditId) => {
    const credit = await findCredit(creditId);
    if (!credit) {
        showNotification('Crédito no encontrado para PDF.', 'error');
        return;
    }
    const customer = await findCustomer(credit.customerId);
    const settings = await getSettings();

    // --- Obtener pagos y ajustes de crédito ---
    const paymentsForCredit = (await getCreditPayments(credit.id)).sort((a, b) => new Date(a.date) - new Date(b.date));
    const creditAdjustments = (await getAdjustmentsByCredit(credit.id)).sort((a, b) => new Date(a.date) - new Date(b.date)); // Obtener ajustes

    // --- Combinar pagos y ajustes para un historial completo ---
    const historyItems = [
        // Mapear pagos a un formato común
        ...paymentsForCredit.map(p => ({ type: 'Pago', date: new Date(p.date), amount: p.amount, notes: p.notes })), // Usamos 'Pago' como tipo
        // Mapear ajustes a un formato común
        ...creditAdjustments.map(adj => ({ type: 'Ajuste (Suma)', date: new Date(adj.date), amount: adj.amount, notes: adj.notes })) // Usamos 'Ajuste (Suma)'
    ];

    // --- Ordenar todos los elementos del historial por fecha ---
    historyItems.sort((a, b) => a.date - b.date);

    // Recalcular el saldo final basado en el monto inicial y todos los movimientos
    let finalBalance = credit.amount; // Empezamos con el monto principal
    historyItems.forEach(item => {
        if(item.type === 'Pago') {
            finalBalance -= item.amount;
        } else if (item.type === 'Ajuste (Suma)') {
            //finalBalance += item.amount;
        }
    });


    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text(`Estado de Cuenta: Crédito #${credit.id.substring(0, 8)}`, 14, 20);

    doc.setFontSize(11);
    doc.setTextColor(100);

    let y = 30;

    if (customer) {
        doc.text(`Cliente: ${customer.name}`, 14, y);
        y += 6;
    }

    doc.text(`Monto Principal Original (o base): ${settings.currencySymbol}${credit.amount.toFixed(2)}`, 14, y); // Ajustar el texto si es necesario
    y += 6;
    doc.text(`Fecha de Registro: ${new Date(credit.date).toLocaleDateString()}`, 14, y);
    y += 6;
    doc.text(`Estado: ${finalBalance <= 0.001 ? 'Pagado' : 'Activo'}`, 14, y); // Usar el saldo final para el estado
    y += 6;
    doc.text(`Fecha de Reporte: ${new Date().toLocaleDateString()}`, 14, y);
    y += 10;

    // --- Preparar datos para la tabla del historial ---
    const historyTableData = historyItems.map(item => {
        let amountDisplay = '';

        if (item.type === 'Pago') {
            amountDisplay = `-${settings.currencySymbol}${item.amount.toFixed(2)}`; // Pagos restan
        } else if (item.type === 'Ajuste (Suma)') {
             amountDisplay = `+${settings.currencySymbol}${item.amount.toFixed(2)}`; // Ajustes suman
        }

        return [
            new Date(item.date).toLocaleDateString(),
            item.type, // Mostrar el tipo (Pago o Ajuste)
            amountDisplay,
            item.notes || '' // Incluir notas si existen
        ];
    });


    doc.autoTable({
        startY: y,
        head: [['Fecha', 'Tipo', `Monto (${settings.currencySymbol})`, 'Notas']],
        body: historyTableData.length > 0 ? historyTableData : [['No hay movimientos registrados', '', '', '']],
        theme: 'striped',
        headStyles: { fillColor: [0, 112, 186] },
    });

    const finalY = doc.lastAutoTable ? doc.lastAutoTable.finalY || y : y;
    doc.setFontSize(12);
    doc.setFont(undefined, 'bold');
    // Mostrar el saldo final calculado
    doc.text(`Saldo Pendiente Actual: ${settings.currencySymbol}${finalBalance.toFixed(2)}`, 14, finalY + 10);


    doc.save(`Estado_Cuenta_Credito_${credit.id.substring(0, 8)}.pdf`);
    showNotification('Estado de cuenta PDF generado.', 'success');
};



const printCreditReceipt = async (creditId) => {
    const credit = await findCredit(creditId);
    if (!credit) {
        showNotification('Crédito no encontrado para recibo.', 'error');
        return;
    }

    const customer = await findCustomer(credit.customerId);
    const settings = await getSettings();

    // --- Obtener pagos y ajustes de crédito ---
    const paymentsForCredit = (await getCreditPayments(credit.id)).sort((a, b) => new Date(a.date) - new Date(b.date));
    const creditAdjustments = (await getAdjustmentsByCredit(credit.id)).sort((a, b) => new Date(a.date) - new Date(b.date));

    // --- Combinar pagos y ajustes para un historial completo (solo para mostrar) ---
    const historyItems = [
        ...paymentsForCredit.map(p => ({ type: 'Pago', date: new Date(p.date), amount: p.amount, notes: p.notes })),
        ...creditAdjustments.map(adj => ({ type: 'Ajuste (Suma)', date: new Date(adj.date), amount: adj.amount, notes: adj.notes }))
    ];

    // --- Ordenar todos los elementos del historial por fecha ---
    historyItems.sort((a, b) => a.date - b.date);

     // --- Calcular el saldo final (Monto Total del Crédito - Total de Pagos) ---
    const totalPaid = paymentsForCredit.reduce((sum, p) => sum + p.amount, 0);
    const totalOutstandingBalance = credit.amount - totalPaid;


    let receiptHTML = `
        <div class="printable-receipt">
            <h1>Recibo de Crédito</h1>
            ${customer ? `<h2>Cliente: ${customer.name}</h2>` : ''}
            <p>Crédito ID: #${credit.id.substring(0,8)}</p>
            <p>Fecha: ${new Date().toLocaleString()}</p>
            <hr>
            <p>Monto Total del Crédito: ${settings.currencySymbol}${credit.amount.toFixed(2)}</p> <!-- Mostrar monto total actualizado -->
            <p>Estado: ${totalOutstandingBalance <= 0.001 ? 'Pagado' : 'Activo'}</p>
            <hr>
            <h3>Historial de Movimientos:</h3>`;

    if (historyItems.length > 0) {
        receiptHTML += `
            <table>
                <thead><tr><th>Fecha</th><th>Tipo</th><th>Monto</th><th>Notas</th></tr></thead>
                <tbody>`;
        historyItems.forEach(item => {
             let amountDisplay = '';
             if (item.type === 'Pago') {
                 amountDisplay = `-${settings.currencySymbol}${item.amount.toFixed(2)}`;
             } else if (item.type === 'Ajuste (Suma)') {
                 amountDisplay = `+${settings.currencySymbol}${item.amount.toFixed(2)}`;
             }

            receiptHTML += `
                <tr>
                    <td>${new Date(item.date).toLocaleDateString()}</td>
                    <td>${item.type}</td>
                    <td>${amountDisplay}</td>
                    <td>${item.notes || ''}</td>
                </tr>`;
        });
        receiptHTML += `</tbody></table>`;
    } else {
        receiptHTML += `<p>No hay movimientos registrados para este crédito.</p>`;
    }

    receiptHTML += `
            <hr>
            <p><strong>Saldo Pendiente Actual: ${settings.currencySymbol}${totalOutstandingBalance.toFixed(2)}</strong></p> <!-- Mostrar saldo final -->
            <hr>
            <p style="text-align:center;">Gracias.</p>
        </div>`;

    const printWindow = window.open('', '_blank');
    printWindow.document.write('<html><head><title>Recibo Crédito</title>');

    const styles = Array.from(document.styleSheets)
        .map(styleSheet => {
            try {
                return Array.from(styleSheet.cssRules).map(rule => rule.cssText).join('');
            } catch (e) { return ''; }
        }).join('');

    printWindow.document.write(`<style>${styles}</style></head><body>`);
    printWindow.document.write(receiptHTML);
    printWindow.document.write('</body></html>');

    printWindow.onload = function () {
        printWindow.focus();
        printWindow.print();
    };
};



// --- Supplier Payment Reports ---
const generateSupplierPaymentsReportPDF = async (supplierId) => {
    const supplier = await findSupplier(supplierId);
    if (!supplier) { showNotification('Suplidor no encontrado para PDF.', 'error'); return; }

    const payments = await findSupplierPayments(supplierId)
    const paymentsToSupplier = payments.sort((a, b) => new Date(a.date) - new Date(b.date)); 

    const totalPaid = paymentsToSupplier.reduce((sum, p) => sum + p.amount, 0);

    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text(`Reporte de Pagos a Suplidor: ${supplier.name}`, 14, 20);
    doc.setFontSize(11);
    doc.setTextColor(100);
    doc.text(`Teléfono: ${supplier.phone || 'N/A'}`, 14, 30);
    doc.text(`Email: ${supplier.email || 'N/A'}`, 14, 36);
    doc.text(`Fecha de Reporte: ${new Date().toLocaleDateString()}`, 14, 42);

    const paymentData = paymentsToSupplier.map(payment => [
        new Date(payment.date).toLocaleDateString(),
        `${getSettings().currencySymbol}${payment.amount.toFixed(2)}`,
        payment.notes || ''
    ]);

    doc.autoTable({
        startY: 50,
        head: [['Fecha Pago', `Monto (${getSettings().currencySymbol})`, 'Concepto/Notas']],
        body: paymentData.length > 0 ? paymentData : [['No hay pagos registrados', '', '']],
        theme: 'striped',
        headStyles: { fillColor: [0, 112, 186] },
    });

    const finalY = doc.lastAutoTable ? doc.lastAutoTable.finalY || 50 : 50;
    doc.setFontSize(12);
    doc.setFont(undefined, 'bold');
    doc.text(`Total Pagado al Suplidor: ${getSettings().currencySymbol}${totalPaid.toFixed(2)}`, 14, finalY + 10);

    doc.save(`Reporte_Pagos_Suplidor_${supplier.name.replace(/\s/g, '_')}.pdf`);
    showNotification('Reporte PDF de pagos a suplidor generado.', 'success');
};

const printSupplierPaymentsReceipt = async (supplierId) => {
    const supplier = await findSupplier(supplierId);
    if (!supplier) { showNotification('Suplidor no encontrado para recibo.', 'error'); return; }

    const payments = await findSupplierPayments(supplierId)
    const paymentsToSupplier = payments.sort((a, b) => new Date(a.date) - new Date(b.date)); 

    const totalPaid = paymentsToSupplier.reduce((sum, p) => sum + p.amount, 0);

    let receiptHTML = `
        <div class="printable-receipt">
            <h1>Recibo Pagos a Suplidor</h1>
            <h2>${supplier.name}</h2>
            <p>Tel: ${supplier.phone || 'N/A'}</p>
            <p>Email: ${supplier.email || 'N/A'}</p>
            <p>Fecha Emisión: ${new Date().toLocaleString()}</p>
            <hr>
            <h3>Detalle de Pagos:</h3>`;
    
    if (paymentsToSupplier.length > 0) {
        receiptHTML += `
            <table>
                <thead><tr><th>Fecha</th><th>Monto</th><th>Concepto</th></tr></thead>
                <tbody>`;
        paymentsToSupplier.forEach(payment => {
            receiptHTML += `
                <tr>
                    <td>${new Date(payment.date).toLocaleDateString()}</td>
                    <td>${getSettings().currencySymbol}${payment.amount.toFixed(2)}</td>
                    <td>${payment.notes || ''}</td>
                </tr>`;
        });
        receiptHTML += `</tbody></table>`;
    } else {
        receiptHTML += `<p>No hay pagos registrados para este suplidor.</p>`;
    }
    
    receiptHTML += `
            <hr>
            <p><strong>TOTAL PAGADO: ${getSettings().currencySymbol}${totalPaid.toFixed(2)}</strong></p>
            <hr>
            <p style="text-align:center;">Comprobante de Pagos</p>
        </div>`;

    const printWindow = window.open('', '_blank');
    printWindow.document.write('<html><head><title>Recibo Pagos Suplidor</title>');
    const styles = Array.from(document.styleSheets)
        .map(styleSheet => { try { return Array.from(styleSheet.cssRules).map(rule => rule.cssText).join(''); } catch (e) { return ''; } }).join('');
    printWindow.document.write(`<style>${styles}</style></head><body>`);
    printWindow.document.write(receiptHTML);
    printWindow.document.write('</body></html>');
    printWindow.onload = function() { printWindow.focus(); printWindow.print(); };
};

// --- Daily Sales Reports ---
const generateDailySalesReportPDF = async (filterMonth = null) => {
    
    if (!filterMonth) {
        filterMonth = document.getElementById('sales-month-filter').value || new Date().toISOString().substring(0, 7);
    }
    const getSales = await getDailySales();

    let salesData = getSales.filter(sale => sale.date.startsWith(filterMonth));
    salesData.sort((a, b) => new Date(a.date) - new Date(b.date)); 

    if (salesData.length === 0) {
        showNotification(`No hay ventas registradas para ${new Date(filterMonth + '-02').toLocaleString('default', { month: 'long', year: 'numeric' })} para generar PDF.`, 'info');
        return;
    }

    const totalSalesAmount = salesData.reduce((sum, sale) => sum + sale.amount, 0);
    const monthYearDisplay = new Date(filterMonth + '-02').toLocaleString('es-ES', { month: 'long', year: 'numeric' });


    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text(`Reporte de Ventas Diarias - ${monthYearDisplay}`, 14, 20);
    doc.setFontSize(11);
    doc.setTextColor(100);
    doc.text(`Fecha de Reporte: ${new Date().toLocaleDateString()}`, 14, 30);

    const salesTableData = salesData.map(sale => [
        new Date(sale.date + 'T00:00:00').toLocaleDateString(),
        `${getSettings().currencySymbol}${sale.amount.toFixed(2)}`,
        sale.notes || ''
    ]);

    doc.autoTable({
        startY: 40,
        head: [['Fecha Venta', `Monto (${getSettings().currencySymbol})`, 'Notas']],
        body: salesTableData,
        theme: 'striped',
        headStyles: { fillColor: [0, 112, 186] },
    });

    const finalY = doc.lastAutoTable ? doc.lastAutoTable.finalY || 40 : 40;
    doc.setFontSize(12);
    doc.setFont(undefined, 'bold');
    doc.text(`Total Ventas del Mes (${monthYearDisplay}): ${getSettings().currencySymbol}${totalSalesAmount.toFixed(2)}`, 14, finalY + 10);

    doc.save(`Reporte_Ventas_${filterMonth.replace('-', '_')}.pdf`);
    showNotification(`Reporte PDF de ventas para ${monthYearDisplay} generado.`, 'success');
};

const printDailySalesReportReceipt = async (filterMonth = null) => { 
    if (!filterMonth) {
        filterMonth = document.getElementById('sales-month-filter').value || new Date().toISOString().substring(0, 7);
    }
    const getSales = await getDailySales();
    let salesData = getSales.filter(sale => sale.date.startsWith(filterMonth));
    salesData.sort((a, b) => new Date(a.date) - new Date(b.date));

    if (salesData.length === 0) {
        showNotification(`No hay ventas registradas para ${new Date(filterMonth + '-02').toLocaleString('default', { month: 'long', year: 'numeric' })} para imprimir resumen.`, 'info');
        return;
    }
    const totalSalesAmount = salesData.reduce((sum, sale) => sum + sale.amount, 0);
    const monthYearDisplay = new Date(filterMonth + '-02').toLocaleString('es-ES', { month: 'long', year: 'numeric' });


    let receiptHTML = `
        <div class="printable-receipt">
            <h1>Resumen de Ventas</h1>
            <h2>Mes: ${monthYearDisplay}</h2>
            <p>Fecha Emisión: ${new Date().toLocaleString()}</p>
            <hr>
            <h3>Detalle de Ventas Diarias:</h3>
            <table>
                <thead><tr><th>Fecha</th><th>Monto</th><th>Notas</th></tr></thead>
                <tbody>`;
    
    salesData.forEach(sale => {
        receiptHTML += `
            <tr>
                <td>${new Date(sale.date + 'T00:00:00').toLocaleDateString()}</td>
                <td>${getSettings().currencySymbol}${sale.amount.toFixed(2)}</td>
                <td>${sale.notes || ''}</td>
            </tr>`;
    });
    
    receiptHTML += `
                </tbody>
            </table>
            <hr>
            <p><strong>TOTAL VENTAS DEL MES: ${getSettings().currencySymbol}${totalSalesAmount.toFixed(2)}</strong></p>
            <hr>
            <p style="text-align:center;">Resumen Mensual</p>
        </div>`;

    const printWindow = window.open('', '_blank');
    printWindow.document.write('<html><head><title>Resumen Ventas</title>');
    const styles = Array.from(document.styleSheets)
        .map(styleSheet => { try { return Array.from(styleSheet.cssRules).map(rule => rule.cssText).join(''); } catch (e) { return ''; } }).join('');
    printWindow.document.write(`<style>${styles}</style></head><body>`);
    printWindow.document.write(receiptHTML);
    printWindow.document.write('</body></html>');
    printWindow.onload = function() { printWindow.focus(); printWindow.print(); };
};

const printDailySaleReceipt = async (saleId) => { 
    const sale = await findDailySale(saleId);
    if (!sale) { showNotification('Registro de venta no encontrado.', 'error'); return; }

    let receiptHTML = `
        <div class="printable-receipt">
            <h1>Comprobante de Venta Diaria</h1>
            <p>Fecha Venta: ${new Date(sale.date + 'T00:00:00').toLocaleDateString()}</p>
            <p>Fecha Emisión: ${new Date().toLocaleString()}</p>
            <hr>
            <p><strong>MONTO TOTAL: ${getSettings().currencySymbol}${sale.amount.toFixed(2)}</strong></p>
            ${sale.notes ? `<p>Notas: ${sale.notes}</p>` : ''}
            <hr>
            <p style="text-align:center;">Gracias.</p>
        </div>`;
    
    const printWindow = window.open('', '_blank');
    printWindow.document.write('<html><head><title>Comprobante Venta</title>');
    const styles = Array.from(document.styleSheets)
        .map(styleSheet => { try { return Array.from(styleSheet.cssRules).map(rule => rule.cssText).join(''); } catch (e) { return ''; } }).join('');
    printWindow.document.write(`<style>${styles}</style></head><body>`);
    printWindow.document.write(receiptHTML);
    printWindow.document.write('</body></html>');
    printWindow.onload = function() { printWindow.focus(); printWindow.print(); };
};

// --- Carga Inicial ---
document.addEventListener('DOMContentLoaded', () => {
    const savedTheme = localStorage.getItem('theme') || 'light'; 
    setTheme(savedTheme);
    applySettings(); 
    document.getElementById('sales-month-filter').value = new Date().toISOString().substring(0, 7); 
    showView('dashboard'); 
});

// Global access for utility functions if needed from HTML (try to avoid)
// Renaming these to match the actual function names used internally for showing details
window.navigateToCustomerDetails = showCustomerDetails; 
window.navigateToCreditDetails = showCreditDetails;
window.navigateToSupplierDetails = showSupplierDetails; // Added for consistency
window.handleSettingsFormSubmit = handleSettingsFormSubmit;

// --- Form Handling and Actions ---

// --- Supplier Form Handling ---


document.getElementById('cancel-add-supplier-payment').addEventListener('click', () => {
    document.getElementById('add-supplier-payment-form-container').classList.add('hidden');
    document.getElementById('add-supplier-payment-form').reset();
});


// --- Event Listeners for Navigation and UI ---
document.getElementById('show-dashboard-btn').addEventListener('click', () => showView('dashboard'));
document.getElementById('dashboard-show-customers-btn').addEventListener('click', () => showView('customers'));
document.getElementById('dashboard-add-customer-btn').addEventListener('click', () => showView('addCustomer'));
document.getElementById('dashboard-show-suppliers-btn').addEventListener('click', () => showView('suppliers'));
document.getElementById('dashboard-record-daily-sale-btn').addEventListener('click', () => showView('addDailySale'));

document.getElementById('show-customers-btn').addEventListener('click', () => showView('customerActions'));
/* document.getElementById('add-customer-btn').addEventListener('click', () => {
    document.getElementById('add-customer-form').reset(); showView('addCustomer');
}); */
document.getElementById('show-suppliers-btn').addEventListener('click', () => showView('supplierActions'));
//document.getElementById('nav-add-supplier-btn').addEventListener('click', () => showView('addSupplier'));
document.getElementById('show-daily-sales-btn').addEventListener('click', () => showView('dailySalesActions'));
//document.getElementById('nav-add-daily-sale-btn').addEventListener('click', () => showView('addDailySale'));

document.getElementById('show-settings-btn').addEventListener('click', () => showView('settings'));
document.getElementById('settings-form').addEventListener('submit', handleSettingsFormSubmit);

document.getElementById('search-customer').addEventListener('input', (event) => {
    renderCustomerList(event.target.value);
});

document.getElementById('add-credit-btn').addEventListener('click', () => {
    if (!currentCustomerId) { showNotification('Seleccione un cliente.', 'warning'); showView('customers'); return; }
    document.getElementById('add-credit-form').reset();
    document.getElementById('add-credit-form-container').classList.remove('hidden');
    document.getElementById('credit-amount').focus();
});

document.getElementById('add-payment-btn').addEventListener('click', async () => {
    if (!currentCreditId) {
        showNotification('Seleccione un crédito.', 'warning');
        if (currentCustomerId) showCustomerDetails(currentCustomerId); else showView('customers');
        return;
    }
    document.getElementById('add-payment-form').reset();
    document.getElementById('add-payment-form-container').classList.remove('hidden');
    const credit = await findCredit(currentCreditId) 
    if (credit) {
        const allPayments = await getCreditPayments(credit.id);
        const totalPaid = allPayments.reduce((sum, p) => sum + p.amount, 0);
        const currentBalance = credit.amount - totalPaid;
        const paymentAmountInput = document.getElementById('payment-amount');
        paymentAmountInput.placeholder = `Saldo: ${getSettings().currencySymbol}${currentBalance.toFixed(2)}`;
        paymentAmountInput.value = currentBalance > 0.001 ? currentBalance.toFixed(2) : '';
        paymentAmountInput.max = currentBalance.toFixed(2);
        paymentAmountInput.focus();
    }
});

document.getElementById('logo').addEventListener('click', () => showAboutModal());


document.getElementById('print-daily-sales-summary-receipt-btn').addEventListener('click', async () => await printDailySalesReportReceipt())
document.getElementById('print-daily-sales-report-pdf-btn').addEventListener('click', async () => await generateDailySalesReportPDF())


document.getElementById('back-to-customers-btn').addEventListener('click', () => showView('customers'));
document.getElementById('back-to-customer-details-btn').addEventListener('click', () => {
    if (currentCustomerId) renderCustomerDetails(currentCustomerId); 
    else showView('customers');
});

