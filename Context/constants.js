import nftMarketplace from "../build/contracts/NFTMarketplace.json";

export const NFTMarketplaceAddress = "0x12CF304C107972828380D9237DA72b5fA339b15a";

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
      params: [{ chainId: web3.utils.toHex(`0x${Number(1337).toString(16)}`) }]
    });
  } catch (err) {
      // This error code indicates that the chain has not been added to MetaMask
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
  const networkName = "localhost";
  await changeNetwork({ networkName });
};
