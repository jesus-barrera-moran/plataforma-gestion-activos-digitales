import React from "react";
import { BsImage } from "react-icons/bs";
import Link from "next/link";

//INTERNAL IMPORT
import Style from "./NFTCardTwo.module.css";

const NFTCardTwo = ({ NFTData, isOnSale }) => {

  return (
    (!NFTData || NFTData.length === 0) ? (
      <div className={Style.noItemsMessage}>
        <h2>No posees activos digitales</h2>
        <p>
          Actualmente no tienes ningún activo digital en la sección "{isOnSale ? 'En Venta' : 'No en Venta'}". Explora el mercado o crea un nuevo activo para empezar.
        </p>
      </div>
    ) : (
    <div className={Style.NFTCardTwo}>
      {NFTData?.map((el, i) => (
        <Link href={{ pathname: "/NFT-details", query: el }} key={i + 1}>
          <div className={Style.NFTCardTwo_box} key={i + 1}>
            <div>
              <div className={Style.NFTCardTwo_box_like}>
                <div className={Style.NFTCardTwo_box_like_box}>
                  <div className={Style.NFTCardTwo_box_like_box_box}>
                    <BsImage className={Style.NFTCardTwo_box_like_box_box_icon} />
                  </div>
                </div>
              </div>

              <div className={Style.NFTCardTwo_box_img}>
                <img
                  src={el.image}
                  alt="NFT"
                  className={Style.NFTCardTwo_box_img_img}
                  objectFit="cover"
                />
              </div>
            </div>

            <div>
              <div className={Style.NFTCardTwo_box_info}>
                <div className={Style.NFTCardTwo_box_info_left}>
                  <p>{el.name}</p>
                </div>
              </div>

              <div className={Style.NFTCardTwo_box_price}>
                <div className={Style.NFTCardTwo_box_price_box}>
                  <small>Precio</small>
                  <p>{el.price} ETH</p>
                </div>
              </div>
            </div>
          </div>
        </Link>
      ))}
    </div>
    )
  );
};

export default NFTCardTwo;
