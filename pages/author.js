import React, { useState, useEffect, useContext } from "react";

//INTERNAL IMPORT
import Style from "../styles/author.module.css";
import { Banner } from "../collectionPage/collectionIndex";
import images from "../img";
import {
  AuthorTaps,
  AuthorNFTCardBox,
} from "../authorPage/componentIndex";

//IMPORT SMART CONTRACT DATA
import { NFTMarketplaceContext } from "../Context/NFTMarketplaceContext";

const author = () => {

  const [isOnSale, setIsOnSale] = useState(true);

  //IMPORT SMART CONTRACT DATA
  const { fetchMyNFTsOrListedNFTs, currentAccount } = useContext(
    NFTMarketplaceContext
  );

  const [nfts, setNfts] = useState([]);
  const [myNFTs, setMyNFTs] = useState([]);

  useEffect(() => {
    fetchMyNFTsOrListedNFTs("fetchItemsListed").then((items) => {
      setNfts(items);

      console.log(nfts);
    });
  }, []);

  useEffect(() => {
    fetchMyNFTsOrListedNFTs("fetchMyNFTs").then((items) => {
      setMyNFTs(items);
      console.log(myNFTs);
    });
  }, []);

  return (
    <div className={Style.author}>
      <Banner bannerImage={images.creatorbackground2} />
      {/* <AuthorProfileCard currentAccount={currentAccount} /> */}
      <AuthorTaps
        setIsOnSale={setIsOnSale}
        currentAccount={currentAccount}
      />

      <AuthorNFTCardBox
        isOnSale={isOnSale}
        nfts={nfts}
        myNFTS={myNFTs}
      />
    </div>
  );
};

export default author;
