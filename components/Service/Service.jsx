import React from "react";
import Image from "next/image";

//INTERNAL IMPORT
import Style from "./Service.module.css";
import images from "../../img";
const Service = () => {
  return (
    <div className={Style.service}>
      <div className={Style.service_box}>
        <div className={Style.service_box_item}>
          <Image
            src={images.service1}
            alt="Instalar Cartera Digital"
            width={100}
            height={100}
          />
          <p className={Style.service_box_item_step}>
            <span>Paso 1</span>
          </p>
          <h3>Instalar Cartera Digital</h3>
          <p>
            Descarga e instala la cartera digital de Metamask desde la tienda de tu navegador 
          </p>
        </div>
        <div className={Style.service_box_item}>
          <Image
            src={images.service2}
            alt="Autenticar Cartera Digital"
            width={100}
            height={100}
          />
          <p className={Style.service_box_item_step}>
            <span>Paso 2</span>
          </p>
          <h3>Autenticar Cartera Digital</h3>
          <p>
            Crea una cuenta en Metamask y autentica tu cartera digital
          </p>
        </div>
        <div className={Style.service_box_item}>
          <Image
            src={images.service3}
            alt="Conectar Cartera Digital"
            width={100}
            height={100}
          />
          <p className={Style.service_box_item_step}>
            <span>Paso 3</span>
          </p>
          <h3>Conectar Cartera Digital</h3>
          <p>
            Conecta tu cartera digital con nuestra plataforma utilizando el botón de conectar
          </p>
        </div>
        <div className={Style.service_box_item}>
          <Image
            src={images.service1}
            alt="Gestionar Activos Digitales"
            width={100}
            height={100}
          />
          <p className={Style.service_box_item_step}>
            <span>Paso 4</span>
          </p>
          <h3>Gestionar Activos Digitales</h3>
          <p>
            Registra, protege y gestiona tus activos digitales de forma segura
          </p>
        </div>
      </div>
    </div>
  );
};

export default Service;
