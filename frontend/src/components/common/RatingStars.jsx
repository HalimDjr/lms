// RatingStars.jsx - Version complètement réécrite
import React from "react";
import { useSelector } from "react-redux";
import { motion } from "framer-motion";
import {
  TiStarFullOutline,
  TiStarHalfOutline,
  TiStarOutline,
} from "react-icons/ti";

function RatingStars({
  Review_Count,
  Star_Size,
  interactive = false,
  onRatingChange = null,
}) {
  const { darkMode } = useSelector((state) => state.theme);

  // Couleurs selon le mode
  const starColors = {
    filled: darkMode ? "#FFD700" : "#FFB800", // Or plus brillant en mode sombre
    empty: darkMode ? "#4B5563" : "#D1D5DB", // Gris plus foncé en mode sombre
    hover: darkMode ? "#FFC700" : "#F59E0B", // Ambre en survol
  };

  // Gestion du clic sur une étoile (si interactif)
  const handleStarClick = (rating) => {
    if (interactive && onRatingChange) {
      onRatingChange(rating);
    }
  };

  // Calculer directement les étoiles à afficher
  const rating = parseFloat(Review_Count) || 0;
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.3 && rating % 1 < 0.8;
  const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

  // Créer les tableaux d'étoiles
  const fullStarsArray = Array(fullStars).fill("full");
  const halfStarsArray = hasHalfStar ? [0] : [];
  const emptyStarsArray = Array(emptyStars).fill("empty");

  // Combiner les tableaux
  const starsArray = [...fullStarsArray, ...halfStarsArray, ...emptyStarsArray];

  return (
    <motion.div
      className="flex gap-1 items-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      {starsArray.map((type, index) => {
        let StarIcon;
        let starColor;

        if (type === "full") {
          StarIcon = TiStarFullOutline;
          starColor = starColors.filled;
        } else if (type === 0) {
          // half star
          StarIcon = TiStarHalfOutline;
          starColor = starColors.filled;
        } else {
          StarIcon = TiStarOutline;
          starColor = starColors.empty;
        }

        return (
          <StarIcon
            key={index}
            size={Star_Size || 24}
            style={{ color: starColor }}
            className="drop-shadow-sm"
          />
        );
      })}
    </motion.div>
  );
}

export default RatingStars;
