import nftMarketplace from "../build/contracts/NFTMarketplace.json";

export const NFTMarketplaceAddress = "0x7579aE8D8A36A3c76B5f151D4F22F295d46ebB78";

export const NFTMarketplaceABI = nftMarketplace.abi;

//NETWORK
const networks = {
  cardona: {
    chainId: "0x98a",
    chainName: "Cardona zkEVM",
    nativeCurrency: {
      name: "Cardona Ether",
      symbol: "ETH",
      decimals: 18,
    },
    rpcUrls: ["https://rpc.cardona.zkevm-rpc.com"],
    // blockExplorerUrls: ["https://explorer.cardona.zkevm-rpc.com"],
  },
  localhost: {
    chainId: `0x${Number(1337).toString(16)}`,
    chainName: "localhost",
    nativeCurrency: {
      name: "ETH",
      symbol: "ETH",
      decimals: 18,
    },
    rpcUrls: ["http://127.0.0.1:8545/"],
    // blockExplorerUrls: ["https://bscscan.com"],
  },
};

const changeNetwork = async ({ networkName }) => {
  try {
    await window.ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: networks[networkName].chainId }]
    });
  } catch (err) {
    // Este código de error indica que la red no ha sido añadida a MetaMask
    if (err.code === 4902) {
      await window.ethereum.request({
        method: 'wallet_addEthereumChain',
        params: [
          {
            ...networks[networkName],
          },
        ]
      });
    }
  }
};

export const handleNetworkSwitch = async () => {
  const networkName = "cardona";
  await changeNetwork({ networkName });
};
