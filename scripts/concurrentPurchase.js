const NFTMarketplace = artifacts.require("NFTMarketplace");

module.exports = async function(callback) {
    const marketplace = await NFTMarketplace.deployed();
    const accounts = await web3.eth.getAccounts();

    try {
        const tokenURIs = ["https://token-uri1.com", "https://token-uri2.com", "https://token-uri3.com"];
        for (let i = 0; i < tokenURIs.length; i++) {
            const price = web3.utils.toWei('0.1', 'ether'); // Precio de 0.1 ETH para cada token
            const createTokenTx = await marketplace.createToken(tokenURIs[i], price, {
                from: accounts[i + 1], // Cada token es creado por un usuario diferente
                value: web3.utils.toWei('0.000001', 'ether') // Listing price
            });
        }
        const purchasePromises = [];
        for (let i = 1; i <= 3; i++) {
            const marketItem = await marketplace.getMarketItem(i);
            const tokenPrice = marketItem.price;
            purchasePromises.push(
                marketplace.createMarketSale(i, {
                    from: accounts[i + 1],
                    value: tokenPrice // Pago correcto por cada token
                })
            );
        }
        // Esperar a que todas las compras se completen
        const results = await Promise.all(purchasePromises);
        // Mostrar los resultados de las compras
        results.forEach((result, index) => {
        });
    } catch (error) {}

    callback();
};
