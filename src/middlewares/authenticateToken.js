const jwt = require('jsonwebtoken');

function authenticateToken(req, res, next) {
  // Obtener el token del encabezado Authorization
  const token = req.headers['authorization']?.split(' ')[1];  // El token puede llegar como "Bearer <token>"

  if (!token) {
    return res.status(403).json({ error: 'Acceso denegado. No se proporcionó token.' });
  }

  // Verificar el token JWT
  jwt.verify(token, 'secret_key', (err, user) => { // Usar la misma clave secreta que al generar el token
    if (err) {
      return res.status(403).json({ error: 'Token no válido' });
    }

    // Almacenar la información del usuario en la solicitud
    req.user = user; 
    next(); // Continuar con la ejecución de la siguiente ruta
  });
}

module.exports = authenticateToken;
