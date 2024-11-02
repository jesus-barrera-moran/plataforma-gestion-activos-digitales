import React, { useState } from "react";

//INTERNAL IMPORT
import Style from "./Filter.module.css";

const Filter = () => {
  const [filter, setFilter] = useState(true);

  return (
    <div className={Style.filter}>
      <div className={Style.filter_box}>
        <div className={Style.filter_box_right}>
        </div>
      </div>

      {filter && (
        <div className={Style.filter_box_items}>
        </div>
      )}
    </div>
  );
};

export default Filter;
