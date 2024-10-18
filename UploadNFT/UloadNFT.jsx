import React, { useState } from "react";
import { MdOutlineHttp } from "react-icons/md";
import { AiTwotonePropertySafety } from "react-icons/ai";
import { useRouter } from "next/router";

//INTERNAL IMPORT
import Style from "./Upload.module.css";
import formStyle from "../AccountPage/Form/Form.module.css";
import { Button } from "../components/componentsindex.js";
import { DropZone } from "../UploadNFT/uploadNFTIndex.js";

const UloadNFT = ({ uploadToIPFS, createNFT, uploadToPinata }) => {
  const [price, setPrice] = useState("");
  const [name, setName] = useState("");
  const [website, setWebsite] = useState("");
  const [description, setDescription] = useState("");
  const [royalties, setRoyalties] = useState("");
  const [fileSize, setFileSize] = useState("");
  const [category, setCategory] = useState(0);
  const [properties, setProperties] = useState("");
  const [image, setImage] = useState(null);

  const router = useRouter();

  return (
    <div className={Style.upload}>
      <DropZone
        title="MAX 100MB"
        heading="Arrastra y suelta tu archivo aquí"
        subHeading="o navega para elegir un archivo"
        name={name}
        website={website}
        description={description}
        royalties={royalties}
        fileSize={fileSize}
        category={category}
        properties={properties}
        setImage={setImage}
        uploadToIPFS={uploadToIPFS}
        uploadToPinata={uploadToPinata}
      />

      <div className={Style.upload_box}>
        <div className={formStyle.Form_box_input}>
          <label htmlFor="nft">Nombre</label>
          <input
            type="text"
            placeholder="Ingresa el nombre del activo digital"
            className={formStyle.Form_box_input_userName}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        <div className={formStyle.Form_box_input}>
          <label htmlFor="website">Website</label>
          <div className={formStyle.Form_box_input_box}>
            <div className={formStyle.Form_box_input_box_icon}>
              <MdOutlineHttp />
            </div>

            <input
              type="text"
              placeholder="Ingresa el URL del sitio web de referencia"
              onChange={(e) => setWebsite(e.target.value)}
            />
          </div>

          <p className={Style.upload_box_input_para}>
            Se incluirá un enlace a esta URL en la página de detalles de este elemento, 
            para que los usuarios puedan hacer clic para obtener más información al respecto. 
            Le invitamos a vincularse a su propia página web con más detalles.
          </p>
        </div>

        <div className={formStyle.Form_box_input}>
          <label htmlFor="description">Descripción</label>
          <textarea
            name=""
            id=""
            cols="30"
            rows="6"
            placeholder="Ingresa la descripción del activo digital"
            onChange={(e) => setDescription(e.target.value)}
          ></textarea>
          <p>
            La descripción se incluirá en la página de detalles del artículo debajo de su imagen.
          </p>
        </div>

        <div className={formStyle.Form_box_input_social}>
          <div className={formStyle.Form_box_input}>
            <label htmlFor="Price">Precio</label>
            <div className={formStyle.Form_box_input_box}>
              <div className={formStyle.Form_box_input_box_icon}>
                <AiTwotonePropertySafety />
              </div>
              <input
                type="text"
                placeholder="Ingresa el precio del activo digital"
                onChange={(e) => setPrice(e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className={Style.upload_box_btn}>
          <Button
            btnName="Crear Activo Digital"
            handleClick={async () =>
              createNFT(
                name,
                price,
                image,
                description,
                router
              )
            }
            classStyle={Style.upload_box_btn_style}
          />
        </div>
      </div>
    </div>
  );
};

export default UloadNFT;
