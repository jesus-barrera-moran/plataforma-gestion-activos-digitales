import React, { useState } from "react";
import Web3Modal from "web3modal";
import { ethers } from "ethers";
import { useRouter } from "next/router";
import axios from "axios";
import SHA256 from "crypto-js/sha256";

// INTERNAL IMPORT
import {
  NFTMarketplaceAddress,
  NFTMarketplaceABI,
  handleNetworkSwitch,
} from "./constants";

//---FETCHING SMART CONTRACT
const fetchContract = (signerOrProvider) =>
  new ethers.Contract(
    NFTMarketplaceAddress,
    NFTMarketplaceABI,
    signerOrProvider
  );

//---CONNECTING WITH SMART CONTRACT

const connectingWithSmartContract = async () => {
  try {
    const web3Modal = new Web3Modal();
    const connection = await web3Modal.connect();
    const provider = new ethers.providers.Web3Provider(connection);
    const signer = provider.getSigner();

    const contract = fetchContract(signer);
    return contract;
  } catch (error) {
    console.log("Something went wrong while connecting with contract", error);
  }
};

export const NFTMarketplaceContext = React.createContext();

export const NFTMarketplaceProvider = ({ children }) => {
  const titleData = "Protege y Gestiona tus Activos Digitales";

  //------USESTAT
  const [error, setError] = useState("");
  const [openError, setOpenError] = useState(false);
  const [currentAccount, setCurrentAccount] = useState("");
  const [accountBalance, setAccountBalance] = useState("");
  const router = useRouter();

  //---CHECK IF WALLET IS CONNECTED
  const checkIfWalletConnected = async () => {
    try {
      if (!window.ethereum)
        return setOpenError(true), setError("Instala Metamask en tu navegador");
      const network = await handleNetworkSwitch();

      const accounts = await window.ethereum.request({
        method: "eth_accounts",
      });

      if (accounts.length) {
        setCurrentAccount(accounts[0]);
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const getBalance = await provider.getBalance(accounts[0]);
        const bal = ethers.utils.formatEther(getBalance);
        setAccountBalance(bal);
        return accounts[0];
      } else {
        console.log("No account");
      }
    } catch (error) {
      console.log("Cartera digital no conectada");
    }
  };

  //---CONNECT WALLET FUNCTION
  const connectWallet = async () => {
    try {
      if (!window.ethereum)
        return setOpenError(true), setError("Instala Metamask en tu navegador");
      const network = await handleNetworkSwitch();
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });

      console.log(accounts);
      setCurrentAccount(accounts[0]);

      connectingWithSmartContract();
    } catch (error) {
      setError("Ha ocurrido un error al conectar la cartera digital");
      setOpenError(true);
    }
  };

  //---UPLOAD TO IPFS FUNCTION
  const uploadToPinata = async (file) => {
    if (file) {
      try {
        const formData = new FormData();
        formData.append("file", file);

        const response = await axios({
          method: "post",
          url: "https://api.pinata.cloud/pinning/pinFileToIPFS",
          data: formData,
          headers: {
            pinata_api_key: `d8c2c12c94c2f96e41a2`,
            pinata_secret_api_key: `b5ee13f9407bf0688c082aa9fd54449a2d4b2b05a73bfbe05bca731f7fcbd607`,
            "Content-Type": "multipart/form-data",
          },
        });
        const ImgHash = `https://gateway.pinata.cloud/ipfs/${response.data.IpfsHash}`;

        return ImgHash;
      } catch (error) {
        setError("No es posible cargar la imagen");
        setOpenError(true);
        console.log(error);
      }
    }
    setError("Archivo no proporcionado");
    setOpenError(true);
  };

  const generateFileHash = async (file) => {
    try {
      let arrayBuffer;
  
      // Verificar si file es una URL (cadena de texto) y convertir a Blob
      if (typeof file === "string") {
        const response = await fetch(file); // Descargar el archivo
        const blob = await response.blob();
        arrayBuffer = await blob.arrayBuffer();
      
      // Verificar si file es un objeto base64 y convertirlo
      } else if (typeof file === "object" && file.base64) {
        const binary = atob(file.base64); // Decodificar base64 a binario
        const bytes = new Uint8Array(binary.length);
        for (let i = 0; i < binary.length; i++) {
          bytes[i] = binary.charCodeAt(i);
        }
        arrayBuffer = bytes.buffer;
      
      // Si file es un Blob o File, leerlo directamente
      } else if (file instanceof Blob) {
        arrayBuffer = await file.arrayBuffer();
  
      } else {
        throw new Error("Formato de archivo no compatible para el hash.");
      }
  
      // Calcular el hash con Web Crypto API
      const hashBuffer = await crypto.subtle.digest("SHA-256", arrayBuffer);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const hashHex = hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
      
      console.log("Hash generado:", hashHex);
      return hashHex;
    } catch (error) {
      console.error("Error al generar hash del archivo:", error);
      throw error;
    }
  };  

  //---CREATE NFT FUNCTION
  const createNFT = async (name, price, image, description, website, router) => {
    if (!name || !description || !price || !image)
      return setError("La información se encuentra incompleta"), setOpenError(true);

    const dataToStringify = { name, description, image };

    if (website) {
      dataToStringify.website = website;
    }

    const data = JSON.stringify(dataToStringify);

    try {
      const hash = await generateFileHash(image);

      const response = await axios({
        method: "POST",
        url: "https://api.pinata.cloud/pinning/pinJSONToIPFS",
        data: data,
        headers: {
          pinata_api_key: `b0376a909e2365f6df5d`,
          pinata_secret_api_key: `dc1af3b8b3a7aed7f21c087a360f08700dbcc4eec5789b8a8fab3671cd127111`,
          "Content-Type": "application/json",
        },
      });

      const url = `https://gateway.pinata.cloud/ipfs/${response.data.IpfsHash}`;
      console.log(url);

      await createSale(url, price, false, null, hash);
      router.push("/author");
    } catch (error) {
      console.log(error);
      setError("Ha ocurrido un error al registrar el activo digital");
      setOpenError(true);
    }
  };

  //--- createSale FUNCTION
  const createSale = async (url, formInputPrice, isReselling, id, hash) => {
    try {
      const price = ethers.utils.parseUnits(formInputPrice, "ether");

      const contract = await connectingWithSmartContract();

      const listingPrice = await contract.getListingPrice();

      const transaction = !isReselling
        ? await contract.createToken(url, price, ethers.utils.arrayify("0x" + hash), { // Pasa hashBytes32 aquí
            value: listingPrice.toString(),
          })
        : await contract.resellToken(id, price, {
            value: listingPrice.toString(),
          });

      await transaction.wait();
      console.log(transaction);
    } catch (error) {
      setError("Ha ocurrido un error al listar el activo digital en el mercado");
      setOpenError(true);
      console.log(error);
    }
  };

  const cancelSale = async (id) => {
    try {
      const contract = await connectingWithSmartContract();
      const transaction = await contract.cancelSale(id);
      await transaction.wait();
      router.push("/author");
    } catch (error) {
      setError("Ha ocurrido un error al retirar el activo digital del mercado");
      setOpenError(true);
      console.log(error);
    }
  };

  const donateDigitalAsset = async (id, address) => {
    try {
      const contract = await connectingWithSmartContract();
      const transaction = await contract.donateToken(id, address);
      await transaction.wait();
      router.push("/author");
    } catch (error) {
      setError("Ha ocurrido un error al transferir el activo digital");
      setOpenError(true);
      console.log(error);
    }
  };

  //---FETCH NFT CERTIFICATE HASH FUNCTION
  const getNFTCertificateHash = async (tokenId) => {
    try {
      const contract = await connectingWithSmartContract();
      const hash = await contract.getCertificateHash(tokenId); // Assuming this function exists in the smart contract
      return hash;
    } catch (error) {
      setError("Ha ocurrido un error al obtener el hash del certificado");
      setOpenError(true);
      console.log(error);
    }
  };

  //--FETCHNFTS FUNCTION
  const fetchNFTs = async () => {
    try {
      const address = await checkIfWalletConnected();
      if (address) {
        const web3Modal = new Web3Modal();
        const connection = await web3Modal.connect();
        const provider = new ethers.providers.Web3Provider(connection);

        const contract = fetchContract(provider);

        const data = await contract.fetchMarketItems();

        console.log(data);

        const items = await Promise.all(
          data.map(
            async ({ tokenId, seller, owner, price: unformattedPrice }) => {
              const tokenURI = await contract.tokenURI(tokenId);

              const {
                data: { image, name, description, website },
              } = await axios.get(tokenURI, {});
              const price = ethers.utils.formatUnits(
                unformattedPrice.toString(),
                "ether"
              );

              return {
                price,
                tokenId: tokenId.toNumber(),
                seller,
                owner,
                image,
                name,
                description,
                website,
                tokenURI,
              };
            }
          )
        );
        console.log("NFT", items);
        return items;
      }

      // }
    } catch (error) {
      setError("Ha ocurrido un error al obtener los activos digitales");
      setOpenError(true);
      console.log(error);
    }
  };

  //--FETCHING MY NFT OR LISTED NFTs
  const fetchMyNFTsOrListedNFTs = async (type) => {
    try {
      const address = await checkIfWalletConnected();
      if (address) {
        const contract = await connectingWithSmartContract();

        const data =
          type == "fetchItemsListed"
            ? await contract.fetchItemsListed()
            : await contract.fetchMyNFTs();

        const items = await Promise.all(
          data.map(
            async ({ tokenId, seller, owner, price: unformattedPrice }) => {
              const tokenURI = await contract.tokenURI(tokenId);
              const {
                data: { image, name, description, website },
              } = await axios.get(tokenURI);
              const price = ethers.utils.formatUnits(
                unformattedPrice.toString(),
                "ether"
              );

              return {
                price,
                tokenId: tokenId.toNumber(),
                seller,
                owner,
                image,
                name,
                description,
                website,
                tokenURI,
              };
            }
          )
        );
        return items;
      }
    } catch (error) {
      setError("Ha ocurrido un error al obtener el mercado de activos digitales");
      setOpenError(true);
      console.log(error);
    }
  };

  //---BUY NFTs FUNCTION
  const buyNFT = async (nft) => {
    try {
      const address = await checkIfWalletConnected();
      if (address) {
        const contract = await connectingWithSmartContract();
        const price = ethers.utils.parseUnits(nft.price.toString(), "ether");

        const transaction = await contract.createMarketSale(nft.tokenId, {
          value: price,
        });

        await transaction.wait();
        router.push("/author");
      }
    } catch (error) {
      setError("Ha ocurrido un error al comprar el activo digital");
      setOpenError(true);
    }
  };

  // 1. Obtener todos los activos digitales registrados
  const getAllDigitalAssets = async () => {
    try {
      const contract = await connectingWithSmartContract();
      const data = await contract.getAllDigitalAssets();

      const items = await Promise.all(
        data.map(
          async ({ tokenId, seller, owner, price, sold }) => {
            const tokenURI = await contract.tokenURI(tokenId);
            const {
              data: { image, name, description, website },
            } = await axios.get(tokenURI);

            const formattedPrice = ethers.utils.formatUnits(
              price.toString(),
              "ether"
            );

            return {
              tokenId: tokenId.toNumber(),
              seller,
              owner,
              price: formattedPrice,
              sold,
              name,
              description,
              image,
              website,
              tokenURI,
            };
          }
        )
      );
      console.log("All Digital Assets:", items);
      return items;
    } catch (error) {
      setError("Ha ocurrido un error al obtener todos los activos digitales");
      setOpenError(true);
      console.log(error);
    }
  };

  // 2. Obtener el valor del contador de IDs de tokens
  const getTokenIdCounter = async () => {
    try {
      const contract = await connectingWithSmartContract();
      const tokenIdCounter = await contract.getTokenIdCounter();
      console.log("Token ID Counter:", tokenIdCounter.toNumber());
      return tokenIdCounter.toNumber();
    } catch (error) {
      setError("Ha ocurrido un error al obtener el contador de IDs de tokens");
      setOpenError(true);
      console.log(error);
    }
  };

  // 3. Obtener el valor del contador de ítems vendidos
  const getItemsSoldCounter = async () => {
    try {
      const contract = await connectingWithSmartContract();
      const itemsSoldCounter = await contract.getItemsSoldCounter();
      console.log("Items Sold Counter:", itemsSoldCounter.toNumber());
      return itemsSoldCounter.toNumber();
    } catch (error) {
      setError("Ha ocurrido un error al obtener el contador de ítems vendidos");
      setOpenError(true);
      console.log(error);
    }
  };

  const getNFTTransactionHistory = async (tokenId) => {
    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const contract = new ethers.Contract(
        NFTMarketplaceAddress,
        NFTMarketplaceABI,
        provider
      );
  
      // Filtra eventos Transfer sin tokenId específico
      const transferEvents = await contract.queryFilter(
        contract.filters.Transfer()
      );
  
      // Filtra solo las transacciones relevantes para el tokenId proporcionado
      const history = await Promise.all(
        transferEvents
          .filter((event) => event.args[2].toString() === tokenId)
          .map(async (event) => {
            // Obtener el bloque para la marca de tiempo
            const block = await provider.getBlock(event.blockNumber);
            const timestamp = block.timestamp * 1000; // Convertir a milisegundos para formatear como fecha
  
            // Determinar el precio solo si la transacción es de tipo "Compra" o "Publicación"
            let price = null;
            if (
              event.args[1].toLowerCase() === NFTMarketplaceAddress.toLowerCase() || // Publicación
              event.args[0].toLowerCase() === NFTMarketplaceAddress.toLowerCase()    // Compra
            ) {
              const marketItem = await contract.getMarketItem(tokenId);
              price = ethers.utils.formatEther(marketItem.price);
            }
  
            return {
              from: event.args[0],
              to: event.args[1],
              transactionHash: event.transactionHash,
              blockNumber: event.blockNumber,
              timestamp,
              price,
            };
          })
      );
  
      console.log("Transaction History:", history);
  
      return history;
    } catch (error) {
      console.error("Error fetching transaction history: ", error);
      return [];
    }
  };

  return (
    <NFTMarketplaceContext.Provider
      value={{
        uploadToPinata,
        checkIfWalletConnected,
        connectWallet,
        createNFT,
        fetchNFTs,
        fetchMyNFTsOrListedNFTs,
        buyNFT,
        createSale,
        cancelSale,
        donateDigitalAsset,
        currentAccount,
        titleData,
        setOpenError,
        openError,
        error,
        accountBalance,
        getAllDigitalAssets,
        getTokenIdCounter,
        getItemsSoldCounter,
        getNFTTransactionHistory,
        getNFTCertificateHash,
        generateFileHash,
      }}
    >
      {children}
    </NFTMarketplaceContext.Provider>
  );
};
