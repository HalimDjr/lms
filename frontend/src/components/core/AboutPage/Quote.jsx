import React from "react";
import { useSelector } from "react-redux";
import HighlightText from "../HomePage/HighlightText";

const Quote = () => {
  const { darkMode } = useSelector((state) => state.theme);

  return (
    <div
      className={`text-xl md:text-4xl font-semibold mx-auto py-5 pb-20 text-center ${
        darkMode ? "text-white" : "text-gray-800"
      }`}
    >
      Nous sommes passionnés par la révolution de l'apprentissage portuaire.
      Notre plateforme innovante{" "}
      <HighlightText text={"combine la technologie"} />,{" "}
      <span className="bg-gradient-to-b from-[#FF512F] to-[#F09819] text-transparent bg-clip-text font-bold">
        {" "}
        l'expertise
      </span>
      , et la communauté pour créer une
      <span className="bg-gradient-to-b from-[#E65C00] to-[#F9D423] text-transparent bg-clip-text font-bold">
        {" "}
        expérience éducative sans pareille.
      </span>
    </div>
  );
};

export default Quote;
