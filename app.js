const express = require('express');
const session = require('express-session');
const path = require('path');
const dbManager = require('database-manager');
const cors = require('cors');
const authenticateToken = require('./src/middlewares/authenticateToken'); 


// Configuración de la base de datos (SQLite)
console.log(dbManager.getModuleVersion());
dbManager.initializeDB({
  type: 'sqlite',
  path: './data/db.sqlite'
});


const authRoutes = require('./src/routes/auth-routes');
const apiRoutes = require('./src/routes/api-routes');

const app = express();
const port = 5000;


// Middleware para servir archivos estáticos
app.use(express.static(path.join(__dirname, 'public')));

// Ruta para la vista principal
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'index.html'));
});



// Middleware para permitir JSON
app.use(express.json());
app.use(cors({
  origin: 'http://localhost:3000', // Cambia esto a la URL de tu frontend
  credentials: true // Permite el envío de cookies de sesión
}));

// Configurar express-session
app.use(session({
  secret: 'mi_secreto_super_seguro', // Cambia esto por una clave más segura
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false } // En producción, cambia a true si usas HTTPS
}));

app.use('/auth', authRoutes);
app.use('/api', apiRoutes);


// Iniciamos el servidor
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
