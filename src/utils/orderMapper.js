const mapOrderData = (input) => {
    return {
        orderId: input.numeroPedido,
        value: input.valorTotal,
        creationDate: input.dataCriacao,
        items: input.items.map(item => ({
            productId: Number(item.idItem),
            quantity: item.quantidadeItem,
            price: item.valorItem
        }))
    };
};
module.exports = mapOrderData;