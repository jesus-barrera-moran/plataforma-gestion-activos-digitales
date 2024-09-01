import React, { useState } from "react";
import Web3Modal from "web3modal";
import { ethers } from "ethers";
import { useRouter } from "next/router";
import axios from "axios";

//INTERNAL  IMPORT
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

  //---CHECK IF WALLET IS CONNECTD

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
        // setError("No Account Found");
        // setOpenError(true);
        console.log("No account");
      }
    } catch (error) {
      // setError("Something wrong while connecting to wallet");
      // setOpenError(true);
      console.log("Cartera digital no conectada");
    }
  };

  //---CONNET WALLET FUNCTION
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

  //---CREATENFT FUNCTION
  const createNFT = async (name, price, image, description, router) => {
    if (!name || !description || !price || !image)
      return setError("La información se encuentra incompleta"), setOpenError(true);

    const data = JSON.stringify({ name, description, image });

    try {
      const response = await axios({
        method: "POST",
        url: "https://api.pinata.cloud/pinning/pinJSONToIPFS",
        data: data,
        headers: {
          pinata_api_key: `d8c2c12c94c2f96e41a2`,
          pinata_secret_api_key: `b5ee13f9407bf0688c082aa9fd54449a2d4b2b05a73bfbe05bca731f7fcbd607`,
          "Content-Type": "application/json",
        },
      });

      const url = `https://gateway.pinata.cloud/ipfs/${response.data.IpfsHash}`;
      console.log(url);

      await createSale(url, price);
      router.push("/searchPage");
    } catch (error) {
      setError("Ha ocurrido un error al registrar el activo digital");
      setOpenError(true);
    }
  };

  //--- createSale FUNCTION
  const createSale = async (url, formInputPrice, isReselling, id) => {
    try {
      const price = ethers.utils.parseUnits(formInputPrice, "ether");

      const contract = await connectingWithSmartContract();

      const listingPrice = await contract.getListingPrice();

      const transaction = !isReselling
        ? await contract.createToken(url, price, {
            value: listingPrice.toString(),
          })
        : await contract.resellToken(id, price, {
            value: listingPrice.toString(),
          });

      await transaction.wait();
      console.log(transaction);
    } catch (error) {
      setError("Ha ocurrido un error al listar el activo ditigal en el mercado");
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
                data: { image, name, description },
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
                data: { image, name, description },
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
      }}
    >
      {children}
    </NFTMarketplaceContext.Provider>
  );
};
