const { query } = require('../config/database');

/**
 * Realiza o mapeamento dos campos do JSON de entrada para as colunas do banco.
 * @param {object} rawOrder - O JSON de pedido do request body.
 * @returns {{Order: object, Items: Array<object>}} - Objeto com os dados mapeados.
 */
function mapOrderData(rawOrder) {
  // Mapeamento para a tabela Order
  const orderData = {
    orderId: rawOrder.numeroPedido,
    value: rawOrder.valorTotal,
    creationDate: rawOrder.dataCriacao,
  };

  // Mapeamento para a tabela Items
  const itemsData = rawOrder.items.map(item => ({
    orderId: rawOrder.numeroPedido, // Chave estrangeira
    productId: item.idItem,
    quantity: item.quantidadeItem,
    price: item.valorItem,
  }));

  return { order: orderData, items: itemsData };
}

/**
 * Cria um novo pedido e seus itens no banco de dados, usando transação.
 */
async function createOrder(rawOrder) {
  const client = await query.pool.connect();
  const { order, items } = mapOrderData(rawOrder);

  try {
    await client.query('BEGIN');

    // 1. Inserir na tabela Order
    const orderQuery = `
      INSERT INTO "Order" (orderId, value, creationDate) 
      VALUES ($1, $2, $3) 
      RETURNING *;
    `;
    const orderValues = [order.orderId, order.value, order.creationDate];
    const resOrder = await client.query(orderQuery, orderValues);

    // 2. Inserir na tabela Items
    for (const item of items) {
      const itemQuery = `
        INSERT INTO "Items" (orderId, productId, quantity, price) 
        VALUES ($1, $2, $3, $4);
      `;
      const itemValues = [item.orderId, item.productId, item.quantity, item.price];
      await client.query(itemQuery, itemValues);
    }

    await client.query('COMMIT');
    return resOrder.rows[0];

  } catch (e) {
    await client.query('ROLLBACK');
    throw e; // Lança o erro para o controller tratar
  } finally {
    client.release();
  }
}

/**
 * Busca um pedido e seus itens por orderId.
 */
async function getOrderById(orderId) {
  // Busca o Order
  const orderResult = await query('SELECT * FROM "Order" WHERE "orderId" = $1', [orderId]);
  if (orderResult.rows.length === 0) return null;
  const order = orderResult.rows[0];

  // Busca os Items
  const itemsResult = await query('SELECT "productId", "quantity", "price" FROM "Items" WHERE "orderId" = $1', [orderId]);
  
  // Re-mapeia para o formato de resposta desejado (opcional, mas bom para consistência)
  return {
    numeroPedido: order.orderId,
    valorTotal: parseFloat(order.value),
    dataCriacao: order.creationDate.toISOString(),
    items: itemsResult.rows.map(item => ({
      idItem: item.productId,
      quantidadeItem: item.quantity,
      valorItem: parseFloat(item.price)
    }))
  };
}

/**
 * Lista todos os pedidos (apenas os dados da tabela Order para simplificar).
 */
async function getAllOrders() {
  const result = await query('SELECT "orderId", "value", "creationDate" FROM "Order" ORDER BY "creationDate" DESC');
  return result.rows.map(order => ({
    numeroPedido: order.orderId,
    valorTotal: parseFloat(order.value),
    dataCriacao: order.creationDate.toISOString(),
  }));
}

/**
 * Atualiza um pedido. Neste exemplo, apenas o valor total e data de criação são atualizáveis na tabela Order.
 * Se fosse atualizar itens, a lógica seria mais complexa (deletar todos os antigos e inserir os novos, ou fazer um upsert).
 */
async function updateOrder(orderId, updatedData) {
  // No caso real, a atualização de items também seria tratada aqui.
  const result = await query(
    'UPDATE "Order" SET value = $1, creationDate = $2 WHERE "orderId" = $3 RETURNING *',
    [updatedData.valorTotal, updatedData.dataCriacao, orderId]
  );
  return result.rows[0];
}

/**
 * Deleta um pedido (os items são deletados em cascata via ON DELETE CASCADE na definição da tabela Items).
 */
async function deleteOrder(orderId) {
  const result = await query('DELETE FROM "Order" WHERE "orderId" = $1 RETURNING *', [orderId]);
  return result.rowCount > 0;
}

module.exports = {
  createOrder,
  getOrderById,
  getAllOrders,
  updateOrder,
  deleteOrder,
};