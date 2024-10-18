import React, { useEffect, useContext } from "react";

//INTERNAL IMPORT
import Style from "../styles/upload-nft.module.css";
import { UploadNFT } from "../UploadNFT/uploadNFTIndex";

//SMART CONTRACT IMPORT
import { NFTMarketplaceContext } from "../Context/NFTMarketplaceContext";

const uploadNFT = () => {
  const { uploadToIPFS, createNFT, uploadToPinata, checkIfWalletConnected } = useContext(
    NFTMarketplaceContext
  );

  useEffect(() => {
    checkIfWalletConnected();
  }, []);

  return (
    <div className={Style.uploadNFT}>
      <div className={Style.uploadNFT_box}>
        <div className={Style.uploadNFT_box_heading}>
          <h1>Crea un nuevo activo digital</h1>
          <p>
            Puede establecer el nombre para mostrar preferido, 
            crear la URL de su perfil y administrar otras configuraciones personales.
          </p>
        </div>

        <div className={Style.uploadNFT_box_form}>
          <UploadNFT
            uploadToIPFS={uploadToIPFS}
            createNFT={createNFT}
            uploadToPinata={uploadToPinata}
          />
        </div>
      </div>
    </div>
  );
};

export default uploadNFT;
