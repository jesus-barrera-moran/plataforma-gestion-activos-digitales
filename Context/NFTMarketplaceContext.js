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
    if (!name || !description || !price || !image) {
      setError("La información se encuentra incompleta");
      setOpenError(true);
      return;
    }

    const dataToStringify = { name, description, image };

    if (website) {
      dataToStringify.website = website;
    }

    const data = JSON.stringify(dataToStringify);

    try {
      const hash = await generateFileHash(image);

      // Llamar a la función `hashExists` en el contrato para verificar si el hash ya está registrado
      const contract = await connectingWithSmartContract();
      const hashAlreadyExists = await contract.isHashRegistered(ethers.utils.arrayify("0x" + hash)); // Pasar el hash en formato `bytes32`

      if (hashAlreadyExists) {
          // Mostrar un error si el hash ya existe
          setError("El activo digital que intentas registrar ya existe en la Blockchain. Por favor, intenta con otro archivo.");
          setOpenError(true);
          return;
      }

      // Proceder con la creación del token si el hash no existe
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
  // const fetchNFTs = async () => {
  //   try {
  //     const address = await checkIfWalletConnected();
  //     if (address) {
  //       const web3Modal = new Web3Modal();
  //       const connection = await web3Modal.connect();
  //       const provider = new ethers.providers.Web3Provider(connection);

  //       const contract = fetchContract(provider);

  //       const data = await contract.fetchMarketItems();

  //       console.log(data);

  //       const items = await Promise.all(
  //         data.map(
  //           async ({ tokenId, seller, owner, price: unformattedPrice }) => {
  //             const tokenURI = await contract.tokenURI(tokenId);

  //             const {
  //               data: { image, name, description, website },
  //             } = await axios.get(tokenURI, {});
  //             const price = ethers.utils.formatUnits(
  //               unformattedPrice.toString(),
  //               "ether"
  //             );

  //             return {
  //               price,
  //               tokenId: tokenId.toNumber(),
  //               seller,
  //               owner,
  //               image,
  //               name,
  //               description,
  //               website,
  //               tokenURI,
  //             };
  //           }
  //         )
  //       );
  //       console.log("NFT", items);
  //       return items;
  //     }

  //     // }
  //   } catch (error) {
  //     setError("Ha ocurrido un error al obtener los activos digitales");
  //     setOpenError(true);
  //     console.log(error);
  //   }
  // };

  const fakeMarketItems = [
    {
      price: "0.89",
      tokenId: 1,
      seller: "0x8E4a5B7cC3b9a2F1B6e5f7D8d9c4e5A3b2A4c7D9",
      owner: NFTMarketplaceAddress,
      image: "https://gateway.pinata.cloud/ipfs/QmfTjXUqgms6wL9gHyFaYoxj81W7wwE1ZatxiEK2LVvHxp",
      name: "Rupestre maya",
      description: "Foto de una pintura rupestre maya en una cueva en Peten, Guatemala.",
      website: "",
      tokenURI: "https://gateway.pinata.cloud/ipfs/QmfTjXUqgms6wL9gHyFaYoxj81W7wwE1ZatxiEK2LVvHxp/metadata1.json",
    },
    {
      price: "0.25",
      tokenId: 3,
      seller: "0x2E1a9B5cD7f4a8C3b6d2f5E9C4a1e3b7F8a6C2d9",
      owner: NFTMarketplaceAddress,
      image: "https://gateway.pinata.cloud/ipfs/QmfLAcJN3vv68AcC3uwQVEVELoB1zUmeEYrnsNeiDtLpEC",
      name: "Calle en antigua",
      description: "Calle tipica en Antigua Guatemala, con flores y vista del volcan.",
      website: "",
      tokenURI: "https://gateway.pinata.cloud/ipfs/QmfLAcJN3vv68AcC3uwQVEVELoB1zUmeEYrnsNeiDtLpEC/metadata3.json",
    },
    {
      price: "2",
      tokenId: 6,
      seller: "0x6A3b1e7d5C8f9B4c2A9d6E2f4A3e1B7C9D5a4f8E",
      owner: NFTMarketplaceAddress,
      image: "https://gateway.pinata.cloud/ipfs/QmbjzUgtTb1N1zhgreRAe2Tt1ixzFvL5WMiPrGbNVuspU2",
      name: "Antiguo convento",
      description: "Patio interior de un convento viejo en la ciudad de Guatemala.",
      website: "",
      tokenURI: "https://gateway.pinata.cloud/ipfs/QmbjzUgtTb1N1zhgreRAe2Tt1ixzFvL5WMiPrGbNVuspU2/metadata6.json",
    }
  ];
  
  const fetchNFTs = async () => {
    try {
      const address = await checkIfWalletConnected();
      if (address) {
        console.log("NFT Market Items (falsos)", fakeMarketItems);
        return fakeMarketItems;
      }
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

  // const getNFTTransactionHistory = async (tokenId) => {
  //   try {
  //     const provider = new ethers.providers.Web3Provider(window.ethereum);
  //     const contract = new ethers.Contract(
  //       NFTMarketplaceAddress,
  //       NFTMarketplaceABI,
  //       provider
  //     );
  
  //     // Filtra eventos Transfer sin tokenId específico
  //     const transferEvents = await contract.queryFilter(
  //       contract.filters.Transfer()
  //     );
  
  //     // Filtra solo las transacciones relevantes para el tokenId proporcionado
  //     const history = await Promise.all(
  //       transferEvents
  //         .filter((event) => event.args[2].toString() === tokenId)
  //         .map(async (event) => {
  //           // Obtener el bloque para la marca de tiempo
  //           const block = await provider.getBlock(event.blockNumber);
  //           const timestamp = block.timestamp * 1000; // Convertir a milisegundos para formatear como fecha
  
  //           // Determinar el precio solo si la transacción es de tipo "Compra" o "Publicación"
  //           let price = null;
  //           if (
  //             event.args[1].toLowerCase() === NFTMarketplaceAddress.toLowerCase() || // Publicación
  //             event.args[0].toLowerCase() === NFTMarketplaceAddress.toLowerCase()    // Compra
  //           ) {
  //             const marketItem = await contract.getMarketItem(tokenId);
  //             price = ethers.utils.formatEther(marketItem.price);
  //           }
  
  //           return {
  //             from: event.args[0],
  //             to: event.args[1],
  //             transactionHash: event.transactionHash,
  //             blockNumber: event.blockNumber,
  //             timestamp,
  //             price,
  //           };
  //         })
  //     );
  
  //     console.log("Transaction History:", history);
  
  //     return history;
  //   } catch (error) {
  //     console.error("Error fetching transaction history: ", error);
  //     return [];
  //   }
  // };

  const fakeTransactions = [
    {
      from: "0x0000000000000000000000000000000000000000", // Creación
      to: "0x8E4a5B7cC3b9a2F1B6e5f7D8d9c4e5A3b2A4c7D9",
      tokenId: "1",
      transactionHash: "0x1a9c3b6d5e8f7a4c2b5d8a1c9e3f4b7d6e1a9c2b5f8a7e3d4c9b2e5a6d7f8b3c",
      blockNumber: 18245210,
      timestamp: 1727731530000, // 30 de octubre de 2024, 09:12:13 AM
      price: null,
    },
    {
      from: "0x8E4a5B7cC3b9a2F1B6e5f7D8d9c4e5A3b2A4c7D9",
      to: NFTMarketplaceAddress, // Publicación
      tokenId: "1",
      transactionHash: "0x5d8f7a3b1e4c6b9d2a5e1f9c3b7d6e4a9c1b5f2a8c7d3e5f6a4b8e7c9d1a2b5",
      blockNumber: 18245711,
      timestamp: 1727846785000, // 31 de octubre de 2024, 01:33:05 PM
      price: "0.89",
    },
    {
      from: "0x0000000000000000000000000000000000000000",
      to: "0x2E1a9B5cD7f4a8C3b6d2f5E9C4a1e3b7F8a6C2d9", // Transferencia
      tokenId: "3",
      transactionHash: "0x2d7f4a1c9e5b6d8a3b2f7c9a1e3b8d4c7f5e9a6b1f3c2e4d5a7b9f1e3c6d5a8",
      blockNumber: 18246012,
      timestamp: 1728028524000, // 2 de noviembre de 2024, 10:55:24 AM
      price: null,
    },
    {
      from: "0x2E1a9B5cD7f4a8C3b6d2f5E9C4a1e3b7F8a6C2d9",
      to: NFTMarketplaceAddress, // Publicación
      tokenId: "3",
      transactionHash: "0x8c7b9f2e1d5a3c4e6a8b1f7d3b9a2f6d5c4e8a1f7b3d6e4c9a7b1e5c3d8a4f9",
      blockNumber: 18246500,
      timestamp: 1728275478000, // 5 de noviembre de 2024, 08:51:18 PM
      price: "2.85",
    },
    {
      from: "0x0000000000000000000000000000000000000000", // Creación
      to: "0x6A3b1e7d5C8f9B4c2A9d6E2f4A3e1B7C9D5a4f8E",
      tokenId: "6",
      transactionHash: "0x6b7d3a8f2e5c9d1a4e3f7b6a9f2c1e8d4c9b7e5a3f1d6a4e3c8b9d1f5a7e6c2",
      blockNumber: 18247400,
      timestamp: 1729125490000, // 15 de noviembre de 2024, 12:18:10 PM
      price: null,
    },
    {
      from: "0x6A3b1e7d5C8f9B4c2A9d6E2f4A3e1B7C9D5a4f8E",
      to: NFTMarketplaceAddress, // Publicación
      tokenId: "6",
      transactionHash: "0x3e5c7f1a8b4d2a6f9e3c5b9a1d7a4f8c2b6e9f5a4c3e7d1f5b2c6a8d4e1f9b3",
      blockNumber: 18248000,
      timestamp: 1729580452000, // 20 de noviembre de 2024, 02:27:32 PM
      price: "2.63",
    }
  ];
  
  const getNFTTransactionHistory = async (tokenId) => {
    try {
      // Filtra solo las transacciones relevantes para el tokenId proporcionado
      const history = fakeTransactions
        .filter((transaction) => transaction.tokenId === tokenId.toString())
        .map((transaction) => {
          return {
            from: transaction.from,
            to: transaction.to,
            transactionHash: transaction.transactionHash,
            blockNumber: transaction.blockNumber,
            timestamp: transaction.timestamp,
            price: transaction.price,
          };
        });
  
      console.log("Transaction History for tokenId", tokenId, ":", history);
      return history;
    } catch (error) {
      console.error("Error fetching transaction history: ", error);
      return [];
    }
  };
  

  // const getContractTransactionHistory = async () => {
  //   try {
  //     const provider = new ethers.providers.Web3Provider(window.ethereum);
  //     const contract = new ethers.Contract(
  //       NFTMarketplaceAddress,
  //       NFTMarketplaceABI,
  //       provider
  //     );
  
  //     // Obtén todos los eventos de Transferencia sin filtrar por tokenId
  //     const transferEvents = await contract.queryFilter(
  //       contract.filters.Transfer()
  //     );
  
  //     // Mapea los eventos a una estructura de transacción
  //     const history = await Promise.all(
  //       transferEvents.map(async (event) => {
  //         // Obtén el bloque para acceder a la marca de tiempo
  //         const block = await provider.getBlock(event.blockNumber);
  //         const timestamp = block.timestamp * 1000; // Convierte a milisegundos para formatear como fecha
  
  //         // Determina el precio solo si la transacción es de tipo "Compra" o "Publicación"
  //         let price = null;
  //         const tokenId = event.args[2].toString();
  //         if (
  //           event.args[1].toLowerCase() === NFTMarketplaceAddress.toLowerCase() || // Publicación
  //           event.args[0].toLowerCase() === NFTMarketplaceAddress.toLowerCase()    // Compra
  //         ) {
  //           const marketItem = await contract.getMarketItem(tokenId);
  //           price = ethers.utils.formatEther(marketItem.price);
  //         }
  
  //         return {
  //           from: event.args[0],
  //           to: event.args[1],
  //           tokenId,
  //           transactionHash: event.transactionHash,
  //           blockNumber: event.blockNumber,
  //           timestamp,
  //           price,
  //         };
  //       })
  //     );
  
  //     console.log("Contract Transaction History:", history);
  //     return history;
  //   } catch (error) {
  //     console.error("Error fetching contract transaction history: ", error);
  //     return [];
  //   }
  // };  

  const getContractTransactionHistory = async () => {
    return [
      {
        from: "0x0000000000000000000000000000000000000000", // Creación
        to: "0x8E4a5B7cC3b9a2F1B6e5f7D8d9c4e5A3b2A4c7D9",
        tokenId: "1",
        transactionHash: "0x1a9c3b6d5e8f7a4c2b5d8a1c9e3f4b7d6e1a9c2b5f8a7e3d4c9b2e5a6d7f8b3c",
        blockNumber: 18245210,
        timestamp: 1727731530000, // 30 de octubre de 2024, 09:12:13 AM
        price: null,
      },
      {
        from: "0x8E4a5B7cC3b9a2F1B6e5f7D8d9c4e5A3b2A4c7D9",
        to: NFTMarketplaceAddress, // Publicación
        tokenId: "1",
        transactionHash: "0x5d8f7a3b1e4c6b9d2a5e1f9c3b7d6e4a9c1b5f2a8c7d3e5f6a4b8e7c9d1a2b5",
        blockNumber: 18245711,
        timestamp: 1727846785000, // 31 de octubre de 2024, 01:33:05 PM
        price: "0.89",
      },
      {
        from: "0x0000000000000000000000000000000000000000", // Creación
        to: "0x9eF5C8a6D2f4B3d7A5E1c9f7d3a4c2B9E8f7D3c1",
        tokenId: "2",
        transactionHash: "0x3b9d4e1f8a7c5d6b2a4f9e1c7d3e2b8a9f5d4c3e1b7a2f6d8e4c9f1a6e3d5b7",
        blockNumber: 18245900,
        timestamp: 1727919232000, // 1 de noviembre de 2024, 06:20:32 PM
        price: null,
      },
      {
        from: "0x0000000000000000000000000000000000000000",
        to: "0x2E1a9B5cD7f4a8C3b6d2f5E9C4a1e3b7F8a6C2d9", // Transferencia
        tokenId: "3",
        transactionHash: "0x2d7f4a1c9e5b6d8a3b2f7c9a1e3b8d4c7f5e9a6b1f3c2e4d5a7b9f1e3c6d5a8",
        blockNumber: 18246012,
        timestamp: 1728028524000, // 2 de noviembre de 2024, 10:55:24 AM
        price: null,
      },
      {
        from: "0x0000000000000000000000000000000000000000", // Creación
        to: "0x4B9d3E5a1f6C7a8B2c5D4f9a3E2b6d1C7F8a2e3D",
        tokenId: "4",
        transactionHash: "0x9e2f7d4a1c5b8e3a6d9f1b2c7d6a9e4f3b5d8a1f3c6e5d2a4c7f9b3d1e8a6b2",
        blockNumber: 18246255,
        timestamp: 1728102836000, // 3 de noviembre de 2024, 05:20:36 PM
        price: null,
      },
      {
        from: "0x2E1a9B5cD7f4a8C3b6d2f5E9C4a1e3b7F8a6C2d9",
        to: NFTMarketplaceAddress, // Publicación
        tokenId: "3",
        transactionHash: "0x8c7b9f2e1d5a3c4e6a8b1f7d3b9a2f6d5c4e8a1f7b3d6e4c9a7b1e5c3d8a4f9",
        blockNumber: 18246500,
        timestamp: 1728275478000, // 5 de noviembre de 2024, 08:51:18 PM
        price: "2.85",
      },
      {
        from: "0x0000000000000000000000000000000000000000",
        to: "0x5a7E1C3f6B9d2a4C8D3b6E2F4a1f7B5e9d4A3C6f", // Transferencia
        tokenId: "5",
        transactionHash: "0x7f3d1c8a5b2e6d4c9a1f9b3e7a2c6f8d5b9a4e3c1d5a7b8f4e2c9d3a6f1b7e4",
        blockNumber: 18247045,
        timestamp: 1728686890000, // 10 de noviembre de 2024, 12:34:50 PM
        price: null,
      },
      {
        from: "0x0000000000000000000000000000000000000000", // Creación
        to: "0x6A3b1e7d5C8f9B4c2A9d6E2f4A3e1B7C9D5a4f8E",
        tokenId: "6",
        transactionHash: "0x6b7d3a8f2e5c9d1a4e3f7b6a9f2c1e8d4c9b7e5a3f1d6a4e3c8b9d1f5a7e6c2",
        blockNumber: 18247400,
        timestamp: 1729125490000, // 15 de noviembre de 2024, 12:18:10 PM
        price: null,
      },
      {
        from: "0x6A3b1e7d5C8f9B4c2A9d6E2f4A3e1B7C9D5a4f8E",
        to: NFTMarketplaceAddress, // Publicación
        tokenId: "6",
        transactionHash: "0x3e5c7f1a8b4d2a6f9e3c5b9a1d7a4f8c2b6e9f5a4c3e7d1f5b2c6a8d4e1f9b3",
        blockNumber: 18248000,
        timestamp: 1729580452000, // 20 de noviembre de 2024, 02:27:32 PM
        price: "2.63",
      },
      {
        from: "0x0000000000000000000000000000000000000000", // Creación
        to: "0x1f8c4B9d5E3a6A9c2b7F5D4C3E8a2d7e4B1a6C8f",
        tokenId: "7",
        transactionHash: "0x4b2e7d3f1a8c9e5a6d1c7b4f9e3a2f6c8d5a9b1e3c7f5d2a9f4b3e8c1d6a5f7",
        blockNumber: 18248500,
        timestamp: 1730017260000, // 25 de noviembre de 2024, 10:21:00 AM
        price: null,
      },
      {
        from: "0x0000000000000000000000000000000000000000", // Creación
        to: "0x5c8E3a7d5F4A9b6C2a9D3e7F1B6c8D2e3A9f4E1B",
        tokenId: "8",
        transactionHash: "0xa9d5c3e2f8b4d7a6c1e3b9f7a5d6c2b3e1a7c4f8b5e2d9c1f4a8d6e7c1f9b3",
        blockNumber: 18248750,
        timestamp: 1730103451000, // 26 de noviembre de 2024, 12:10:51 PM
        price: "1.75",
      },
      {
        from: "0x0000000000000000000000000000000000000000",
        to: "0x7b3D6c8A4e2F9a1C5b6D4f3A7c9E8d5A2B4C6f1D", // Publicación
        tokenId: "9",
        transactionHash: "0x7db74c6d5c39e8fb34bdc60e83ff436fd3039bf4ea15bdc88caf59f8ce365e28",
        blockNumber: 18249000,
        timestamp: 1730168327000, // 27 de noviembre de 2024, 03:32:07 PM
        price: "3.25",
      }
    ];
  }

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
        getContractTransactionHistory,
        getNFTCertificateHash,
        generateFileHash,
      }}
    >
      {children}
    </NFTMarketplaceContext.Provider>
  );
};
