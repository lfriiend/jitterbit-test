// const authMiddleware = (req, res, next) => {
//   const authHeader = req.headers.authorization;
  
//   if (!authHeader) {
//     return res.status(401).json({ error: 'Token não fornecido.' });
//   }

//   const parts = authHeader.split(' ');
  
//   if (parts.length !== 2) {
//     return res.status(401).json({ error: 'Formato do token inválido.' });
//   }

//   const [scheme, token] = parts;
  
//   if (!/^Bearer$/i.test(scheme)) {
//     return res.status(401).json({ error: 'Token mal formatado.' });
//   }

//   jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
//     if (err) {
//       // Token expirado, inválido, etc.
//       return res.status(401).json({ error: 'Token inválido.' });
//     }
    
//     // Adiciona o payload (por exemplo, o ID do usuário) à requisição
//     req.userId = decoded.id; 
//     return next();
//   });
// };

// module.exports = authMiddleware;