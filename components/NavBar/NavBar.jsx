import React, { useState, useContext } from "react";
import Link from "next/link";
import { DiJqueryLogo } from "react-icons/di";
//----IMPORT ICON
import { CgMenuRight } from "react-icons/cg";
import { useRouter } from "next/router";

//INTERNAL IMPORT
import Style from "./NavBar.module.css";
import { SideBar } from "./index";
import { Button, Error } from "../componentsindex";

//IMPORT FROM SMART CONTRACT
import { NFTMarketplaceContext } from "../../Context/NFTMarketplaceContext";

const NavBar = () => {
  //----USESTATE COMPONNTS
  const [openSideMenu, setOpenSideMenu] = useState(false);

  const router = useRouter();

  const openSideBar = () => {
    if (!openSideMenu) {
      setOpenSideMenu(true);
    } else {
      setOpenSideMenu(false);
    }
  };

  //SMART CONTRACT SECTION
  const { currentAccount, connectWallet, openError } = useContext(
    NFTMarketplaceContext
  );

  const menu = [
    {
      name: "Mis Activos Digitales",
      link: "author",
    },
    {
      name: "Explorar Mercado",
      link: "searchPage",
    },
    {
      name: "Crear Activo Digital",
      link: "uploadNFT",
    },
  ];

  return (
    <div className={Style.navbar}>
      <div className={Style.navbar_container}>

        {/* //END OF LEFT SECTION */}
        <div className={Style.navbar_container_right}>
          <div className={Style.logo} onClick={() => router.push("/")}>
            PGAD
            {/* <DiJqueryLogo onClick={() => router.push("/")} /> */}
          </div>

          {menu.map((el, i) => (
            <div key={i + 1} className={Style.navbar_container_right_menu_item}>
              <Link href={{ pathname: `${el.link}` }}>{el.name}</Link>
            </div>
          ))}

          {/* CREATE BUTTON SECTION */}
          {currentAccount == "" ? (
          <div className={Style.navbar_container_right_button}>
            <Button btnName="Conectar" handleClick={() => connectWallet()} />
          </div>
          ) : (
            <div className={Style.navbar_container_right_wallet}>
              <div>{currentAccount.slice(0, 18) + "..."}</div>
            </div>
          )}
        </div>
      </div>

      {/* SIDBAR CPMPONE/NT */}
      {openSideMenu && (
        <div className={Style.sideBar}>
          <SideBar
            setOpenSideMenu={setOpenSideMenu}
            currentAccount={currentAccount}
            connectWallet={connectWallet}
          />
        </div>
      )}

      {openError && <Error />}
    </div>
  );
};

export default NavBar;
