import React from "react";
import dziesiecImage from "../../../assets/zetony/dziesiec.png";
import piecdziesiatImage from "../../../assets/zetony/piecdziesiat.png";
import stoImage from "../../../assets/zetony/sto.png";
import piecsetImage from "../../../assets/zetony/piecset.png";

const Chips = ({ onChipSelect }) => {
    return (
        <div className="betting-ui">
            <div className="chip-selection">
                <img src={dziesiecImage} alt="10" className="chip-image chip-z4" onClick={() => onChipSelect(10)} />
                <img src={piecdziesiatImage} alt="50" className="chip-image chip-z3" onClick={() => onChipSelect(50)} />
                <img src={stoImage} alt="100" className="chip-image chip-z2" onClick={() => onChipSelect(100)} />
                <img src={piecsetImage} alt="500" className="chip-image chip-z1" onClick={() => onChipSelect(500)} />
            </div>
        </div>
    );
};

export default Chips;