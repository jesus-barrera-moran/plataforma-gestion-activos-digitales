import React from "react";
import { DiJqueryLogo } from "react-icons/di";

//INTERNAL IMPORT
import Style from "./Footer.module.css";
import { Discover, HelpCenter } from "../NavBar/index";

const Footer = () => {
  return (
    <div className={Style.footer}>
      <div className={Style.footer_box}>
        <div className={Style.footer_box_social}>
          <a href="/">
            <DiJqueryLogo className={Style.footer_box_social_logo} />
          </a>
          <p>
            Una plataforma para el registro, protección y comercialización de activos digitales.
            Registra, compra, vende y descubre artículos digitales exclusivos.
          </p>
        </div>

        <div className={Style.footer_box_discover}>
          <h3>Descubre</h3>
          <Discover />
        </div>

        <div className={Style.footer_box_help}>
          <h3>Centro de Ayuda</h3>
          <HelpCenter />
        </div>

      </div>
    </div>
  );
};

export default Footer;
