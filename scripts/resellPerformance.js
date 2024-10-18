const NFTMarketplace = artifacts.require("NFTMarketplace");

module.exports = async function (callback) {
    const marketplace = await NFTMarketplace.deployed();
    const accounts = await web3.eth.getAccounts();

    try {
        console.log("\n====== FASE 1: CREACIÓN Y LISTADO DE UN NUEVO TOKEN ======\n");
        const tokenURI = "https://token-uri.com";
        const initialPrice = web3.utils.toWei('0.1', 'ether'); // Precio inicial

        console.log(`- Creando un nuevo Token con URI: "${tokenURI}" y precio: 0.1 ETH...`);
        const createTokenTx = await marketplace.createToken(tokenURI, initialPrice, {
            from: accounts[1],
            value: web3.utils.toWei('0.000001', 'ether') // Listing price
        });
        const newTokenId = createTokenTx.logs[0].args.tokenId.toString();
        console.log(`  ✓ Token #${newTokenId} creado y listado por el usuario 1`);
        console.log(`  → Gas utilizado: ${createTokenTx.receipt.gasUsed}`);
        console.log(`  → Hash de la transacción: ${createTokenTx.receipt.transactionHash}\n`);

        console.log("\n====== FASE 2: COMPRA DEL TOKEN POR OTRO USUARIO ======\n");
        const tokenPrice = await marketplace.getMarketItem(newTokenId).then(item => item.price);
        console.log(`- Usuario 2 intentará comprar el Token #${newTokenId} por ${web3.utils.fromWei(tokenPrice, 'ether')} ETH...`);
        const buyTokenTx = await marketplace.createMarketSale(newTokenId, {
            from: accounts[2],
            value: tokenPrice // Pago correcto por el token
        });
        console.log(`  ✓ Compra completada por el usuario 2`);
        console.log(`  → Gas utilizado: ${buyTokenTx.receipt.gasUsed}`);
        console.log(`  → Hash de la transacción: ${buyTokenTx.receipt.transactionHash}\n`);

        console.log("\n====== FASE 3: REVENTA DEL TOKEN ======\n");
        const resalePrice = web3.utils.toWei('0.2', 'ether'); // Nuevo precio de 0.2 ETH
        console.log(`- Usuario 2 intentará revender el Token #${newTokenId} por 0.2 ETH...`);
        const resellTx = await marketplace.resellToken(newTokenId, resalePrice, {
            from: accounts[2],
            value: web3.utils.toWei('0.000001', 'ether') // Listing price
        });
        console.log(`  ✓ Token #${newTokenId} listado nuevamente por el usuario 2`);
        console.log(`  → Gas utilizado: ${resellTx.receipt.gasUsed}`);
        console.log(`  → Hash de la transacción: ${resellTx.receipt.transactionHash}\n`);

        console.log("\n====== FASE 4: COMPRA DEL TOKEN REVENDEDIDO ======\n");
        console.log(`- Usuario 3 intentará comprar el Token #${newTokenId} por 0.2 ETH...`);
        const buyResaleTx = await marketplace.createMarketSale(newTokenId, {
            from: accounts[3],
            value: resalePrice // Pago correcto por el token revendido
        });
        console.log(`  ✓ Token #${newTokenId} comprado por el usuario 3`);
        console.log(`  → Gas utilizado: ${buyResaleTx.receipt.gasUsed}`);
        console.log(`  → Hash de la transacción: ${buyResaleTx.receipt.transactionHash}\n`);

        console.log("====== TODAS LAS FASES SE HAN COMPLETADO EXITOSAMENTE ======\n");

    } catch (error) {
        console.error("Error en la reventa o compra:", error);
    }

    callback();
};
