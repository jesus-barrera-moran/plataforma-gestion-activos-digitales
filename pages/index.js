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
} from "../components/componentsindex";

//IMPORTING CONTRACT DATA
import { NFTMarketplaceContext } from "../Context/NFTMarketplaceContext";

const Home = () => {
  const { checkIfWalletConnected, currentAccount, getAllDigitalAssets, getTokenIdCounter, getItemsSoldCounter, } = useContext(
    NFTMarketplaceContext
  );

  // State hooks
  const [nfts, setNfts] = useState([]);
  const [loading, setLoading] = useState(false);

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
    </div>
  );
};

export default Home;
