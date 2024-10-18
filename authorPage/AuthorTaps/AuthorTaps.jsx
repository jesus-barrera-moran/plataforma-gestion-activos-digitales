import React, { useState } from "react";

//INTERNAL IMPORT
import Style from "./AuthorTaps.module.css";

const AuthorTaps = ({
  setIsOnSale,
}) => {
  const [activeBtn, setActiveBtn] = useState(1);

  const openTab = (e) => {
    const btnText = e.target.innerText;
    console.log(btnText);
    if (btnText == "En Venta") {
      setIsOnSale(true);
      setActiveBtn(1);
    } else if (btnText == "No en Venta") {
      setIsOnSale(false);
      setActiveBtn(2);
    }
  };

  return (
    <div className={Style.AuthorTaps}>
      <div className={Style.AuthorTaps_box}>
        <div className={Style.AuthorTaps_box_left}>
          <div className={Style.AuthorTaps_box_left_btn}>
            <button
              className={`${activeBtn == 1 ? Style.active : ""}`}
              onClick={(e) => openTab(e)}
            >
              En Venta
            </button>
            <button
              className={`${activeBtn == 2 ? Style.active : ""}`}
              onClick={(e) => openTab(e)}
            >
              No en Venta
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthorTaps;
