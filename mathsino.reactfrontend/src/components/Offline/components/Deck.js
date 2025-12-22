import React from "react";
import { motion } from "framer-motion";
import reverseCardImage from "../../../assets/karty/reverse2.png";

const Deck = ({ position, isShuffling }) => {
  return (
    <div
      style={{
        position: "absolute",
        left: `${position.left}%`,
        top: `${position.top}%`,
        zIndex: 5,
      }}
    >
      <img
        src={reverseCardImage}
        alt="Deck Base"
        style={{
          position: "absolute",
          width: "5vw",
          borderRadius: "4px",
          left: "0px",
          top: "0px",
        }}
      />
      <img
        src={reverseCardImage}
        alt="Deck Base"
        style={{
          position: "absolute",
          width: "5vw",
          borderRadius: "4px",
          left: "2px",
          top: "-2px",
        }}
      />
      <motion.img
        src={reverseCardImage}
        alt="Shuffling Card"
        style={{
          width: "5vw",
          borderRadius: "4px",
          position: "relative",
          left: "4px",
          top: "-4px",
        }}
        animate={
          isShuffling
            ? {
              x: [0, -20, 20, -20, 20, 0],
              y: [0, -5, 5, -5, 5, 0],
              rotateZ: [0, -10, 10, -10, 10, 0],
            }
            : { x: 0, y: 0, rotateZ: 0 }
        }
        transition={{ duration: 0.8, ease: "easeInOut" }}
      />
    </div>
  );
};

export default Deck;