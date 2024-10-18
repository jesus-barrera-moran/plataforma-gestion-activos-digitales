import React, { useState, useEffect, useContext } from "react";
// import Image from "next/image";
// import Link from "next/link";
import { useRouter } from "next/router";
// import {
//   MdVerified,
//   MdCloudUpload,
//   MdTimer,
//   MdReportProblem,
//   MdOutlineDeleteSweep,
// } from "react-icons/md";
import { BsThreeDots } from "react-icons/bs";
import { FaWallet, FaPercentage, FaCheckCircle } from "react-icons/fa";
// import {
//   TiSocialFacebook,
//   TiSocialLinkedin,
//   TiSocialTwitter,
//   TiSocialYoutube,
//   TiSocialInstagram,
// } from "react-icons/ti";
// import { BiTransferAlt, BiDollar } from "react-icons/bi";

//INTERNAL IMPORT
import Style from "./NFTDescription.module.css";
// import images from "../../img";
import { Button } from "../../components/componentsindex.js";
// import { NFTTabs } from "../NFTDetailsIndex";

//IMPORT SMART CONTRACT
import { NFTMarketplaceContext } from "../../Context/NFTMarketplaceContext";

const NFTDescription = ({ nft }) => {
  // const [social, setSocial] = useState(false);
  // const [NFTMenu, setNFTMenu] = useState(false);
  // const [history, setHistory] = useState(true);
  // const [provanance, setProvanance] = useState(false);
  // const [owner, setOwner] = useState(false);
  const [displayPriceForm, setDisplayPriceForm] = useState(false);
  const [price, setPrice] = useState(0);
  const [displayRecipientForm, setDisplayRecipientForm] = useState(false);
  const [recipient, setRecipient] = useState("");
  const [isButtonDisabled, setIsButtonDisabled] = useState(true);

  const router = useRouter();

  useEffect(() => {
    if ((displayPriceForm && price > 0) || (displayRecipientForm && recipient !== "")) {
      setIsButtonDisabled(false);
    } else {
      setIsButtonDisabled(true);
    }
  }, [price, recipient]);

  // const historyArray = [
  //   images.user1,
  //   images.user2,
  //   images.user3,
  //   images.user4,
  //   images.user5,
  // ];
  // const provananceArray = [
  //   images.user6,
  //   images.user7,
  //   images.user8,
  //   images.user9,
  //   images.user10,
  // ];
  // const ownerArray = [
  //   images.user1,
  //   images.user8,
  //   images.user2,
  //   images.user6,
  //   images.user5,
  // ];

  // const openSocial = () => {
  //   if (!social) {
  //     setSocial(true);
  //     setNFTMenu(false);
  //   } else {
  //     setSocial(false);
  //   }
  // };

  // const openNFTMenu = () => {
  //   if (!NFTMenu) {
  //     setNFTMenu(true);
  //     setSocial(false);
  //   } else {
  //     setNFTMenu(false);
  //   }
  // };

  // const openTabs = (e) => {
  //   const btnText = e.target.innerText;

  //   if (btnText == "Bid History") {
  //     setHistory(true);
  //     setProvanance(false);
  //     setOwner(false);
  //   } else if (btnText == "Provanance") {
  //     setHistory(false);
  //     setProvanance(true);
  //     setOwner(false);
  //   }
  // };

  // const openOwmer = () => {
  //   if (!owner) {
  //     setOwner(true);
  //     setHistory(false);
  //     setProvanance(false);
  //   } else {
  //     setOwner(false);
  //     setHistory(true);
  //   }
  // };

  //SMART CONTRACT DATA
  const { buyNFT, createSale, cancelSale, donateDigitalAsset, currentAccount } = useContext(NFTMarketplaceContext);

  const listOnMarketplace = async (tokenURI, price, isReselling, id) => {
    try {
      await createSale(tokenURI, price, isReselling, id);
      router.push("/author");
    } catch (error) {
      console.log("Ha ocurrido un error al listar el activo ditigal en el mercado", error);
    }
  };

  const transferDigitalAsset = async (tokenURI, recipient) => {
    try {
      await donateDigitalAsset(tokenURI, recipient);
      router.push("/author");
    } catch (error) {
      console.log("Ha ocurrido un error al transferir el activo ditigal", error);
    }
  };

  return (
    <div className={Style.NFTDescription}>
      <div className={Style.NFTDescription_box}>
        {/* //Part ONE */}
        <div className={Style.NFTDescription_box_share}>
          {/* <p>Virtual Worlds</p> */}
          {/* <div className={Style.NFTDescription_box_share_box}>
            <MdCloudUpload
              className={Style.NFTDescription_box_share_box_icon}
              onClick={() => openSocial()}
            />

            {social && (
              <div className={Style.NFTDescription_box_share_box_social}>
                <a href="#">
                  <TiSocialFacebook /> Facebooke
                </a>
                <a href="#">
                  <TiSocialInstagram /> Instragram
                </a>
                <a href="#">
                  <TiSocialLinkedin /> LinkedIn
                </a>
                <a href="#">
                  <TiSocialTwitter /> Twitter
                </a>
                <a href="#">
                  <TiSocialYoutube /> YouTube
                </a>
              </div>
            )}

            <BsThreeDots
              className={Style.NFTDescription_box_share_box_icon}
              onClick={() => openNFTMenu()}
            />

            {NFTMenu && (
              <div className={Style.NFTDescription_box_share_box_social}>
                <a href="#">
                  <BiDollar /> Change price
                </a>
                <a href="#">
                  <BiTransferAlt /> Transfer
                </a>
                <a href="#">
                  <MdReportProblem /> Report abouse
                </a>
                <a href="#">
                  <MdOutlineDeleteSweep /> Delete item
                </a>
              </div>
            )}
          </div> */}
        </div>
        {/* //Part TWO */}
        <div className={Style.NFTDescription_box_profile}>
          <h1>
            {nft.name} #{nft.tokenId}
          </h1>
          {/* <div className={Style.NFTDescription_box_profile_box}>
            <div className={Style.NFTDescription_box_profile_box_left}>
              <Image
                src={images.user1}
                alt="profile"
                width={40}
                height={40}
                className={Style.NFTDescription_box_profile_box_left_img}
              />
              <div className={Style.NFTDescription_box_profile_box_left_info}>
                <small>Creator</small> <br />
                <Link href={{ pathname: "/author", query: `${nft.seller}` }}>
                <Link href={{ pathname: "/author" }}>
                  <span>
                    Karli Costa <MdVerified />
                  </span>
                </Link>
              </div>
            </div>

            <div className={Style.NFTDescription_box_profile_box_right}>
              <Image
                src={images.creatorbackground1}
                alt="profile"
                width={40}
                height={40}
                className={Style.NFTDescription_box_profile_box_left_img}
              />

              <div className={Style.NFTDescription_box_profile_box_right_info}>
                <small>Collection</small> <br />
                <span>
                  Mokeny app <MdVerified />
                </span>
              </div>
            </div>
          </div> */}

          <div className={Style.NFTDescription_box_profile_biding}>

            <div className={Style.NFTDescription_box_profile_biding_box_price}>
              <div
                className={
                  Style.NFTDescription_box_profile_biding_box_price_bid
                }
              >
                <small>Precio</small>
                <p>
                  {nft.price} ETH
                </p>
              </div>
            </div>

            <div className={Style.NFTDescription_box_profile_biding_box_button}>
              {currentAccount == nft.seller?.toLowerCase() ? (
                <div>
                    <Button
                    icon={<FaPercentage />}
                    btnName="Remover del Mercado"
                    handleClick={() => cancelSale(nft.tokenId)}
                    classStyle={Style.button}
                    />
                </div>
              ) : currentAccount == nft.owner?.toLowerCase() ? (
                <>
                  <Button
                    icon={<FaWallet />}
                    btnName="Listar en el Mercado"
                    handleClick={() => {
                      // router.push(
                      //   `/reSellToken?id=${nft.tokenId}&tokenURI=${nft.tokenURI}&price=${nft.price}&name=${nft.name}`
                      // )
                      setDisplayPriceForm(!displayPriceForm);
                      setDisplayRecipientForm(false);
                    }}
                    classStyle={Style.button}
                  />
                  <Button
                    icon={<FaWallet />}
                    btnName="Transferir Activo Digital"
                    handleClick={() => {
                      // router.push(
                      //   `/reSellToken?id=${nft.tokenId}&tokenURI=${nft.tokenURI}&price=${nft.price}`
                      // )
                      setDisplayRecipientForm(!displayRecipientForm);
                      setDisplayPriceForm(false);
                    }}
                    classStyle={Style.button}
                  />
                </>
              ) : (
                <Button
                  icon={<FaWallet />}
                  btnName="Comprar Activo Digital"
                  handleClick={() => buyNFT(nft)}
                  classStyle={Style.button}
                />
              )}
            </div>

            {(displayPriceForm || displayRecipientForm) && (
              <div className={Style.NFTDescription_box_profile_biding_list_on_marketplace}>
                {displayPriceForm ? (
                  <form>
                    <label>Precio</label>
                    <input
                      type="number"
                      min={1}
                      placeholder="Ingresa el precio..."
                      onChange={(e) => setPrice(e.target.value)}
                    />
                  </form>
                ) :
                displayRecipientForm ? (
                  <form>
                    <label>Destinatario</label>
                    <input
                      type="text"
                      min={1}
                      placeholder="Ingresa el destinatario..."
                      onChange={(e) => setRecipient(e.target.value)}
                    />
                  </form>
                ) : null}
                <Button
                  icon={<FaCheckCircle />}
                  disabled={isButtonDisabled}
                  handleClick={() => { displayPriceForm ? listOnMarketplace(nft.tokenURI, price, true, nft.tokenId) : transferDigitalAsset(nft.tokenId, recipient) }}
                />
              </div>
            )}

            {/* <div className={Style.NFTDescription_box_profile_biding_box_tabs}>
              <button onClick={(e) => openTabs(e)}>Bid History</button>
              <button onClick={(e) => openTabs(e)}>Provanance</button>
              <button onClick={() => openOwmer()}>Owner</button>
            </div> */}

            {/* {history && (
              <div className={Style.NFTDescription_box_profile_biding_box_card}>
                <NFTTabs dataTab={historyArray} />
              </div>
            )} */}
            {/* {provanance && (
              <div className={Style.NFTDescription_box_profile_biding_box_card}>
                <NFTTabs dataTab={provananceArray} />
              </div>
            )} */}

            {/* {owner && (
              <div className={Style.NFTDescription_box_profile_biding_box_card}>
                <NFTTabs dataTab={ownerArray} icon={<MdVerified />} />
              </div>
            )} */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default NFTDescription;
