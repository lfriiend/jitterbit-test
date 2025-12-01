const pool = require('../database/db');
const OrderModel = require('../models/OrderModel'); // Importando o Model
const ItemModel = require('../models/ItemModel');   // Importando o Model
const mapOrderData = require('../utils/orderMapper');

// Helper apenas para a Listagem (que ainda usa JOIN raw por performance)
const groupOrders = (rows) => {
    const ordersMap = new Map();
    rows.forEach(row => {
        if (!ordersMap.has(row.orderId)) {
            ordersMap.set(row.orderId, {
                orderId: row.orderId,
                value: Number(row.value),
                creationDate: row.creationDate,
                items: []
            });
        }
        if (row.productId) {
            ordersMap.get(row.orderId).items.push({
                productId: row.productId,
                quantity: row.quantity,
                price: Number(row.price)
            });
        }
    });
    return Array.from(ordersMap.values());
};

module.exports = {
    // CRIAR PEDIDO
    async createOrder(req, res) {
        const client = await pool.connect();
        try {
            const mappedData = mapOrderData(req.body);
            
            await client.query('BEGIN'); // Inicia Transação

            // 1. Cria a Order usando o Model
            const newOrder = await OrderModel.create(client, mappedData);

            // 2. Cria os Itens usando o Model (Loop)
            const itemsCreated = [];
            for (const item of mappedData.items) {
                // Adicionamos o orderId ao item antes de salvar
                const itemToSave = { ...item, orderId: newOrder.orderId };
                const savedItem = await ItemModel.create(client, itemToSave);
                itemsCreated.push(savedItem);
            }

            await client.query('COMMIT'); // Confirma

            // Retorna o objeto montado
            return res.status(201).json({
                ...newOrder,
                items: mappedData.items
            });

        } catch (error) {
            await client.query('ROLLBACK');
            return res.status(400).json({ error: 'Erro ao criar pedido', details: error.message });
        } finally {
            client.release();
        }
    },

    // OBTER POR ID
    async getOrderById(req, res) {
        try {
            const { id } = req.params;

            // Busca o Pedido
            const order = await OrderModel.findById(id);
            if (!order) {
                return res.status(404).json({ message: 'Pedido não encontrado' });
            }

            // Busca os Itens separadamente (muito mais limpo que fazer JOIN manual aqui)
            const items = await ItemModel.findByOrderId(id);

            // Monta a resposta
            const response = {
                ...order,
                value: Number(order.value), // Garante que venha como numero
                items: items.map(i => ({
                    productId: i.productId,
                    quantity: i.quantity,
                    price: Number(i.price)
                }))
            };

            return res.status(200).json(response);
        } catch (error) {
            return res.status(500).json({ error: error.message });
        }
    },

    // ATUALIZAR PEDIDO
    async updateOrder(req, res) {
        const client = await pool.connect();
        try {
            const { id } = req.params;
            const mappedData = mapOrderData(req.body);

            // Verifica existência
            const exists = await OrderModel.findById(id);
            if (!exists) {
                return res.status(404).json({ message: 'Pedido não encontrado' });
            }

            await client.query('BEGIN');

            // 1. Atualiza Order
            await OrderModel.update(client, id, mappedData);

            // 2. Remove itens antigos
            await ItemModel.deleteAllByOrderId(client, id);

            // 3. Insere novos itens
            for (const item of mappedData.items) {
                const itemToSave = { ...item, orderId: id };
                await ItemModel.create(client, itemToSave);
            }

            await client.query('COMMIT');

            // --- CORREÇÃO AQUI ---
            // Em vez de chamar this.getOrderById(req, res), buscamos os dados manualmente:
            
            // A. Busca o Pedido Atualizado
            const orderUpdated = await OrderModel.findById(id);
            
            // B. Busca os Itens Atualizados
            const itemsUpdated = await ItemModel.findByOrderId(id);

            // C. Monta a resposta
            const response = {
                ...orderUpdated,
                value: Number(orderUpdated.value),
                items: itemsUpdated.map(i => ({
                    productId: i.productId,
                    quantity: i.quantity,
                    price: Number(i.price)
                }))
            };

            return res.status(200).json(response);
            // ---------------------

        } catch (error) {
            await client.query('ROLLBACK');
            return res.status(500).json({ error: 'Erro ao atualizar pedido', details: error.message });
        } finally {
            client.release();
        }
    },

    // DELETAR PEDIDO
    async deleteOrder(req, res) {
        try {
            const { id } = req.params;
            
            // O Banco com 'ON DELETE CASCADE' cuidará dos itens, 
            // basta chamar o delete do OrderModel
            const deleted = await OrderModel.delete(id);

            if (!deleted) {
                return res.status(404).json({ message: 'Pedido não encontrado' });
            }

            return res.status(200).json({ message: 'Pedido deletado com sucesso' });
        } catch (error) {
            return res.status(500).json({ error: error.message });
        }
    },

    // LISTAR TODOS (Mantive o SQL aqui pois o OrderModel.findAll era simples demais)
    async listOrders(req, res) {
        try {
            const query = `
                SELECT o.*, i."productId", i.quantity, i.price
                FROM "Order" o
                LEFT JOIN "Items" i ON o."orderId" = i."orderId"
            `;
            const { rows } = await pool.query(query);
            
            const structuredOrders = groupOrders(rows);

            return res.status(200).json(structuredOrders);
        } catch (error) {
            return res.status(500).json({ error: error.message });
        }
    }
};