import React from "react";

//INTERNAL IMPORT
import Style from "./AuthorNFTCardBox.module.css";
import { NFTCardTwo } from "../../collectionPage/collectionIndex";

const AuthorNFTCardBox = ({
  isOnSale,
  nfts,
  myNFTS,
}) => {

  return (
    <div className={Style.AuthorNFTCardBox}>
      {isOnSale && <NFTCardTwo NFTData={nfts} isOnSale={isOnSale} />}
      {!isOnSale && <NFTCardTwo NFTData={myNFTS} isOnSale={isOnSale} />}
    </div>
  );
};

export default AuthorNFTCardBox;
