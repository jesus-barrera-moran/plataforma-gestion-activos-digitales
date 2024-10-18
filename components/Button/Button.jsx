import React from "react";

//INTERNAL IMPORT
import Style from "./Button.module.css";

const Button = ({ btnName, handleClick, icon, classStyle, disabled = false }) => {
  return (
    <div className={Style.box}>
      <button
        disabled={disabled}
        className={`${disabled ? Style.button_disabled : Style.button} ${classStyle}`}
        onClick={() => handleClick()}
      >
        {icon} {btnName}
      </button>
    </div>
  );
};

export default Button;
