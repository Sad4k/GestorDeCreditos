const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken'); // Para manejar tokens de sesión
const { User } = require('../models/data-model'); // Asegúrate de que el path sea correcto
const authenticateToken = require('../middlewares/authenticateToken'); 

const router = express.Router();

// Ruta para autenticar al usuario
router.post('/authenticate', async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ where: { email } });

    if (!user) {
      return res.status(401).json({ error: 'Usuario no encontrado' });
    }

    // Verificar la contraseña
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ error: 'Contraseña incorrecta' });
    }

    // Generar un token JWT
    const token = jwt.sign(
      { id: user.id, name: user.name, access: user.access },
      'secret_key',
      { expiresIn: '15m' }
    );

    res.status(200).json({
      message: 'Autenticación exitosa',
      token,
      user: { id: user.id, name: user.name, email: user.email, access: user.access }
    });

  } catch (error) {
    res.status(500).json({ error: 'Error al autenticar usuario' });
  }

});

router.get('/status', (req, res) => {
  res.sendStatus(200); 
});

router.get('/session', authenticateToken, (req, res) => {
  console.log("Verificando session")
  res.status(200).json({
    authenticated: true,
    user: req.user
  });
});

module.exports = router;
