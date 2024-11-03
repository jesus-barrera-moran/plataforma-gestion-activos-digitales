import React, { useState, useEffect, useContext } from "react";

//INTERNAL IMPORT
import Style from "../styles/index.module.css";
import {
  HeroSection,
  Service,
  Title,
  Filter,
  NFTCard,
  Loader,
  TransactionsTable,
} from "../components/componentsindex";

//IMPORTING CONTRACT DATA
import { NFTMarketplaceContext } from "../Context/NFTMarketplaceContext";
import { NFTMarketplaceAddress } from "../Context/constants";

const Home = () => {
  const { checkIfWalletConnected, currentAccount, getAllDigitalAssets, getTokenIdCounter, getItemsSoldCounter, getContractTransactionHistory } = useContext(
    NFTMarketplaceContext
  );

  // State hooks
  const [nfts, setNfts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [transactions, setTransactions] = useState([]);

  useEffect(() => {
    checkIfWalletConnected();

    getAllDigitalAssets();
    getTokenIdCounter();
    getItemsSoldCounter();
  }, []);

  const { fetchNFTs } = useContext(NFTMarketplaceContext);

  useEffect(() => {
    if (currentAccount) {
      // Set loading to true when fetching NFTs
      setLoading(true);
      fetchNFTs()
        .then((items) => {
          setNfts(items?.reverse());
          // Set loading to false after fetching
          setLoading(false);
        })
        .catch(() => {
          // Handle any errors, ensure loading stops in case of an error
          setLoading(false);
        });
    }
  }, [currentAccount]);

  // Lógica para determinar el método basado en la transacción
  const determineMethod = (tx, NFTMarketplaceAddress) => {
    if (tx.from === "0x0000000000000000000000000000000000000000") {
      return "Creación";
    }
    if (tx.to?.toLowerCase() === NFTMarketplaceAddress?.toLowerCase()) {
      return "Publicación";
    }
    if (tx.from?.toLowerCase() === NFTMarketplaceAddress?.toLowerCase()) {
      return "Compra";
    }
    return "Transferencia";
  };

  // Función para calcular el tiempo transcurrido
  const formatTimeAgo = (timestamp) => {
    const seconds = Math.floor((new Date() - new Date(timestamp)) / 1000);
    const intervals = [
      { label: 'año', seconds: 31536000 },
      { label: 'mes', seconds: 2592000 },
      { label: 'día', seconds: 86400 },
      { label: 'hora', seconds: 3600 },
      { label: 'minuto', seconds: 60 },
    ];
    for (const interval of intervals) {
      const count = Math.floor(seconds / interval.seconds);
      if (count >= 1) {
        return `hace ${count} ${interval.label}${count > 1 ? 's' : ''}`;
      }
    }
    return "ahora";
  };

  // const fakeTransactions = [
  //   {
  //     from: "0x0000000000000000000000000000000000000000", // Creación
  //     to: "0x8E4a5B7cC3b9a2F1B6e5f7D8d9c4e5A3b2A4c7D9",
  //     tokenId: "1",
  //     transactionHash: "0x7db74c6d5c39e8fb34bdc60e83ff436fd3039bf4ea15bdc88caf59f8ce365e28",
  //     blockNumber: 18245210,
  //     timestamp: 1730576663, // 30 de octubre de 2024, 09:12:13 AM
  //     price: null,
  //   },
  //   {
  //     from: "0x8E4a5B7cC3b9a2F1B6e5f7D8d9c4e5A3b2A4c7D9",
  //     to: NFTMarketplaceAddress, // Publicación
  //     tokenId: "1",
  //     transactionHash: "0x5d8f7a3b1e4c6b9d2a5e1f9c3b7d6e4a9c1b5f2a8c7d3e5f6a4b8e7c9d1a2b5",
  //     blockNumber: 18245711,
  //     timestamp: 1727846785000, // 31 de octubre de 2024, 01:33:05 PM
  //     price: "0.89",
  //   },
  //   {
  //     from: "0x0000000000000000000000000000000000000000", // Creación
  //     to: "0x9eF5C8a6D2f4B3d7A5E1c9f7d3a4c2B9E8f7D3c1",
  //     tokenId: "2",
  //     transactionHash: "0x3b9d4e1f8a7c5d6b2a4f9e1c7d3e2b8a9f5d4c3e1b7a2f6d8e4c9f1a6e3d5b7",
  //     blockNumber: 18245900,
  //     timestamp: 1727919232000, // 1 de noviembre de 2024, 06:20:32 PM
  //     price: null,
  //   },
  //   {
  //     from: "0x0000000000000000000000000000000000000000",
  //     to: "0x2E1a9B5cD7f4a8C3b6d2f5E9C4a1e3b7F8a6C2d9", // Transferencia
  //     tokenId: "3",
  //     transactionHash: "0x2d7f4a1c9e5b6d8a3b2f7c9a1e3b8d4c7f5e9a6b1f3c2e4d5a7b9f1e3c6d5a8",
  //     blockNumber: 18246012,
  //     timestamp: 1728028524000, // 2 de noviembre de 2024, 10:55:24 AM
  //     price: null,
  //   },
  //   {
  //     from: "0x0000000000000000000000000000000000000000", // Creación
  //     to: "0x4B9d3E5a1f6C7a8B2c5D4f9a3E2b6d1C7F8a2e3D",
  //     tokenId: "4",
  //     transactionHash: "0x9e2f7d4a1c5b8e3a6d9f1b2c7d6a9e4f3b5d8a1f3c6e5d2a4c7f9b3d1e8a6b2",
  //     blockNumber: 18246255,
  //     timestamp: 1728102836000, // 3 de noviembre de 2024, 05:20:36 PM
  //     price: null,
  //   },
  //   {
  //     from: "0x2E1a9B5cD7f4a8C3b6d2f5E9C4a1e3b7F8a6C2d9",
  //     to: NFTMarketplaceAddress, // Publicación
  //     tokenId: "3",
  //     transactionHash: "0x8c7b9f2e1d5a3c4e6a8b1f7d3b9a2f6d5c4e8a1f7b3d6e4c9a7b1e5c3d8a4f9",
  //     blockNumber: 18246500,
  //     timestamp: 1728275478000, // 5 de noviembre de 2024, 08:51:18 PM
  //     price: "2.85",
  //   },
  //   {
  //     from: "0x0000000000000000000000000000000000000000",
  //     to: "0x5a7E1C3f6B9d2a4C8D3b6E2F4a1f7B5e9d4A3C6f", // Transferencia
  //     tokenId: "5",
  //     transactionHash: "0x7f3d1c8a5b2e6d4c9a1f9b3e7a2c6f8d5b9a4e3c1d5a7b8f4e2c9d3a6f1b7e4",
  //     blockNumber: 18247045,
  //     timestamp: 1728686890000, // 10 de noviembre de 2024, 12:34:50 PM
  //     price: null,
  //   },
  //   {
  //     from: "0x0000000000000000000000000000000000000000", // Creación
  //     to: "0x6A3b1e7d5C8f9B4c2A9d6E2f4A3e1B7C9D5a4f8E",
  //     tokenId: "6",
  //     transactionHash: "0x6b7d3a8f2e5c9d1a4e3f7b6a9f2c1e8d4c9b7e5a3f1d6a4e3c8b9d1f5a7e6c2",
  //     blockNumber: 18247400,
  //     timestamp: 1729125490000, // 15 de noviembre de 2024, 12:18:10 PM
  //     price: null,
  //   },
  //   {
  //     from: "0x6A3b1e7d5C8f9B4c2A9d6E2f4A3e1B7C9D5a4f8E",
  //     to: NFTMarketplaceAddress, // Publicación
  //     tokenId: "6",
  //     transactionHash: "0x3e5c7f1a8b4d2a6f9e3c5b9a1d7a4f8c2b6e9f5a4c3e7d1f5b2c6a8d4e1f9b3",
  //     blockNumber: 18248000,
  //     timestamp: 1729580452000, // 20 de noviembre de 2024, 02:27:32 PM
  //     price: "2.63",
  //   },
  //   {
  //     from: "0x0000000000000000000000000000000000000000", // Creación
  //     to: "0x1f8c4B9d5E3a6A9c2b7F5D4C3E8a2d7e4B1a6C8f",
  //     tokenId: "7",
  //     transactionHash: "0x4b2e7d3f1a8c9e5a6d1c7b4f9e3a2f6c8d5a9b1e3c7f5d2a9f4b3e8c1d6a5f7",
  //     blockNumber: 18248500,
  //     timestamp: 1730017260000, // 25 de noviembre de 2024, 10:21:00 AM
  //     price: null,
  //   },
  //   {
  //     from: "0x0000000000000000000000000000000000000000", // Creación
  //     to: "0x5c8E3a7d5F4A9b6C2a9D3e7F1B6c8D2e3A9f4E1B",
  //     tokenId: "8",
  //     transactionHash: "0xa9d5c3e2f8b4d7a6c1e3b9f7a5d6c2b3e1a7c4f8b5e2d9c1f4a8d6e7c1f9b3",
  //     blockNumber: 18248750,
  //     timestamp: 1730103451000, // 26 de noviembre de 2024, 12:10:51 PM
  //     price: "1.75",
  //   },
  //   {
  //     from: "0x0000000000000000000000000000000000000000",
  //     to: "0x7b3D6c8A4e2F9a1C5b6D4f3A7c9E8d5A2B4C6f1D", // Publicación
  //     tokenId: "9",
  //     transactionHash: "0x8e5c2f1d7a4b9e3c5a6d1f8c7b3e4d2a9f1c5b7a6e8d3c9a2f7b4e1c9d5f6a3",
  //     blockNumber: 18249000,
  //     timestamp: 1730168327000, // 27 de noviembre de 2024, 03:32:07 PM
  //     price: "3.25",
  //   }
  // ];

  useEffect(() => {
    const fetchTransactionHistory = async () => {
      try {
        const history = await getContractTransactionHistory();
        const sortedHistory = history
          .sort((a, b) => b.blockNumber - a.blockNumber)
          .map((tx) => ({
            ...tx,
            fromDisplay: tx.from?.toLowerCase() === NFTMarketplaceAddress?.toLowerCase() ? "Mercado" : tx.from,
            toDisplay: tx.to?.toLowerCase() === NFTMarketplaceAddress?.toLowerCase() ? "Mercado" : tx.to,
            metodo: determineMethod(tx, NFTMarketplaceAddress),
            formattedTimestamp: tx.timestamp ? new Date(tx.timestamp).toLocaleString() : "N/A",
            relativeTime: tx.timestamp ? formatTimeAgo(tx.timestamp) : "N/A",
            item: tx.tokenId || "",
          }));

        setTransactions(sortedHistory);
      } catch (error) {
        console.error("Error al obtener el historial de transacciones:", error);
      }
    };

    fetchTransactionHistory();
  }, [getContractTransactionHistory, NFTMarketplaceAddress]);

  return (
    <div className={Style.homePage}>
      <HeroSection />
      <Service />
      <Title
        heading="Mercado de Activos Digitales"
        paragraph="Descubre los activos digitales que se encuentran disponibles en el mercado."
      />
      <Filter />

      {loading ? (
        // Show Loader while loading is true
        <Loader />
      ) : nfts?.length === 0 ? (
        // Styled message when no NFTs are available
        <div className={Style.noItemsMessage}>
          <h2>No hay elementos a la venta en este momento</h2>
          <p>
            Lo sentimos, pero actualmente no hay ningún activo digital disponible
            para la venta. Por favor, vuelve a intentarlo más tarde.
          </p>
        </div>
      ) : (
        // Show NFT cards when loading is false and NFTs are available
        <NFTCard NFTData={nfts} />
      )}

      <TransactionsTable transactions={transactions}/>
    </div>
  );
};

export default Home;
