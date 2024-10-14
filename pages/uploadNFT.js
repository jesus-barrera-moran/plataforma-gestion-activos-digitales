import React, { useEffect, useState, useContext } from "react";

//INTERNAL IMPORT
import Style from "../styles/upload-nft.module.css";
import { UploadNFT } from "../UploadNFT/uploadNFTIndex";

//SMART CONTRACT IMPORT
import { NFTMarketplaceContext } from "../Context/NFTMarketplaceContext";

const uploadNFT = () => {
  const { uploadToIPFS, createNFT, uploadToPinata } = useContext(
    NFTMarketplaceContext
  );
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

        <div className={Style.uploadNFT_box_title}>
          <h2>Imagen, Video, Audio, entre otros.</h2>
          <p>
            Tipos de archivos permitidos: JPG, PNG, GIF, SVG, MP4, WEBM, MP3, WAV. 
            Max size: 100 MB
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
