import React from "react";
import Swal from "sweetalert2";
import Draggable from "react-draggable";

export default function Control({
  hint,
  visible,
  score,
  nextTurn,
  location,
  turn,
  setHint,
  hintAmount,
  highScore,
  setHintAmount,
}) {
  const getHint = () => {
    if (!hint && !visible) {
      if (hintAmount === 0) {
        Swal.fire({
          title: "נגמרו לך הרמזים",
          text: `אם תפגע במטרה תקבל רמז נוסף`,
          icon: "error",
        });
      } else {
        setHint(true);
        setHintAmount(hintAmount - 1);
      }
    } else if (!visible) {
      Swal.fire({
        title: "!כבר קיבלת רמז",
        icon: "error",
      });
    } else {
      Swal.fire({
        title: "המשך לתור הבא",
        icon: "error",
      });
    }
  };
  return (
    <Draggable bounds="*">
      <div className="test">
        <h2>מרחק טעויות: {score}</h2>
        <h3>:עליך למצוא את</h3>
        <div className="locationText">
          <h2>{location}</h2>
        </div>
        <button className="nextButton" onClick={getHint}>
          קבל רמז
        </button>

        <button className="nextButton" onClick={nextTurn}>
          {turn === 5 ? "סיים" : "המשך"}
        </button>
        <h2>רמזים: {hintAmount}</h2>
        <h2>תור מספר: {turn}/5</h2>
        {highScore && <strong>ציון הכי טוב: {highScore}</strong>}
      </div>
    </Draggable>
  );
}
