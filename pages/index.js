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
