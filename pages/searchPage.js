import React, { useEffect, useState, useContext } from "react";

//INTERNAL IMPORT
import Style from "../styles/searchPage.module.css";
import { Slider, Brand, Loader } from "../components/componentsindex";
import { SearchBar } from "../SearchPage/searchBarIndex";
import { Filter } from "../components/componentsindex";
import { NFTCardTwo, Banner } from "../collectionPage/collectionIndex";
import images from "../img";

//SMART CONTRACT IMPORT
import { NFTMarketplaceContext } from "../Context/NFTMarketplaceContext";

const searchPage = () => {
  const { fetchNFTs, setError, currentAccount, checkIfWalletConnected } = useContext(
    NFTMarketplaceContext
  );

  // State hooks
  const [nfts, setNfts] = useState([]);
  const [nftsCopy, setNftsCopy] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    checkIfWalletConnected();
  }, []);

  useEffect(() => {
    try {
      if (currentAccount) {
        setLoading(true); // Start loading when fetching data
        fetchNFTs().then((items) => {
          setNfts(items?.reverse());
          setNftsCopy(items);
          setLoading(false); // Stop loading after fetching data
        });
      }
    } catch (error) {
      setError("Please reload the browser", error);
      setLoading(false); // Stop loading if there's an error
    }
  }, [currentAccount]);

  const onHandleSearch = (value) => {
    const filteredNFTS = nfts?.filter(({ name }) =>
      name.toLowerCase().includes(value.toLowerCase())
    );

    if (filteredNFTS.length === 0) {
      setNfts(nftsCopy);
    } else {
      setNfts(filteredNFTS);
    }
  };

  const onClearSearch = () => {
    if (nfts?.length && nftsCopy.length) {
      setNfts(nftsCopy);
    }
  };

  return (
    <div className={Style.searchPage}>
      <Banner bannerImage={images.creatorbackground2} />
      <SearchBar onHandleSearch={onHandleSearch} onClearSearch={onClearSearch} />
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
        <NFTCardTwo NFTData={nfts} />
      )}
    </div>
  );
};

export default searchPage;
