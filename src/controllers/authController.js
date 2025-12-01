const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const UserModel = require('../models/UserModel');

const SECRET = 'segredo_teste'; // Chumbado para o teste, idealmente viria de variáveis de ambiente

module.exports = {
    async register(req, res) {
        try {
            const { username, password } = req.body;
            if (await UserModel.findByUsername(username)) {
                return res.status(400).json({ error: 'Usuário já existe' });
            }
            const hash = await bcrypt.hash(password, 10);
            const user = await UserModel.create(username, hash);
            return res.status(201).json(user);
        } catch (e) { return res.status(500).json({ error: e.message }); }
    },

    async login(req, res) {
        try {
            const { username, password } = req.body;
            const user = await UserModel.findByUsername(username);
            if (!user || !(await bcrypt.compare(password, user.password))) {
                return res.status(400).json({ error: 'Login inválido' });
            }
            const token = jwt.sign({ id: user.id }, SECRET, { expiresIn: '1h' });
            return res.json({ token });
        } catch (e) { return res.status(500).json({ error: e.message }); }
    }
};