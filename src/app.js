const express = require('express');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const app = express();

// Rota de login simulada:
app.post('/login', (req, res) => {
  // Apenas simula um login bem-sucedido e gera um token
  const userId = 'simulated_user_123'; 
  const token = jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: 86400
  });

  return res.json({ 
    message: 'Login simulado bem-sucedido', 
    token: token 
  });
});