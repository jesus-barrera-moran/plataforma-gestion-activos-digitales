import React, { useState, useEffect, useContext } from "react";

//INTERNAL IMPORT
import Style from "../styles/index.module.css";
import {
  HeroSection,
  Service,
  // BigNFTSilder,
  Subscribe,
  Title,
  Category,
  Filter,
  NFTCard,
  // Collection,
  // AudioLive,
  FollowerTab,
  // Slider,
  // Brand,
  // Video,
  Loader,
} from "../components/componentsindex";
import { getTopCreators } from "../TopCreators/TopCreators";

//IMPORTING CONTRCT DATA
import { NFTMarketplaceContext } from "../Context/NFTMarketplaceContext";

const Home = () => {
  const { checkIfWalletConnected, currentAccount } = useContext(
    NFTMarketplaceContext
  );
  useEffect(() => {
    checkIfWalletConnected();
  }, []);

  const { fetchNFTs } = useContext(NFTMarketplaceContext);
  const [nfts, setNfts] = useState([]);
  const [nftsCopy, setNftsCopy] = useState([]);

  useEffect(() => {
    if (currentAccount) {
      fetchNFTs().then((items) => {
        console.log(nfts);
        setNfts(items?.reverse());
        setNftsCopy(items);
      });
    }
  }, [currentAccount]);

  //CREATOR LIST

  const creators = getTopCreators(nfts);
  // console.log(creators);

  return (
    <div className={Style.homePage}>
      <HeroSection />
      <Service />
      {/* <BigNFTSilder /> */}
      {/* <Title
        heading="Audio Collection"
        paragraph="Discover the most outstanding NFTs in all topics of life."
      />
      <AudioLive /> */}
      {creators.length == 0 ? (
        <Loader />
      ) : (
        <FollowerTab TopCreator={creators} />
      )}

      {/* <Slider /> */}
      {/* <Collection /> */}
      <Title
        heading="Mercado de Activos Digitales"
        paragraph="Descubre los activos digitales que se encuentran disponibles en el mercado."
      />
      <Filter />
      {nfts?.length == 0 ? <Loader /> : <NFTCard NFTData={nfts} />}

      <Title
        heading="Explora por Categoría"
        paragraph="Busca entre las diferentes categorías de activos digitales."
      />
      <Category />
      <Subscribe />
      {/* <Brand /> */}
      {/* <Video /> */}
    </div>
  );
};

export default Home;
