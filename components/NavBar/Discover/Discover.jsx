import React from "react";
import Link from "next/link";

//INTERNAL IMPORT
import Style from "./Discover.module.css";

const Discover = () => {
  //--------DISCOVER NAVIGATION MENU
  const discover = [
    // {
    //   name: "Collection",
    //   link: "collection",
    // },
    {
      name: "Explorar Mercado",
      link: "searchPage",
    },
    // {
    //   name: "Author Profile",
    //   link: "author",
    // },
    // {
    //   name: "Account Setting",
    //   link: "account",
    // },
    {
      name: "Crear Activo Digital",
      link: "uploadNFT",
    },
    {
      name: "Conectar Cartera",
      link: "connectWallet",
    },
  ];
  return (
    <div>
      {discover.map((el, i) => (
        <div key={i + 1} className={Style.discover}>
          <Link href={{ pathname: `${el.link}` }}>{el.name}</Link>
        </div>
      ))}
    </div>
  );
};

export default Discover;
