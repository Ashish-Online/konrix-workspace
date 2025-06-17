// PreviewOverlay.tsx
import React, { useState, useEffect, useCallback } from "react";
import { BoardWidget } from "../index";
import Album from "./widgets/Album";
import Weather from "./widgets/Weather";
import { MdClose } from "react-icons/md";

interface PreviewOverlayProps {
  widgets: BoardWidget[];
  parentSize: { width: number; height: number };     // current canvas size
  originalCanvas: { width: number; height: number }; // design‑time canvas
  onClose: () => void;
}

const PreviewOverlay: React.FC<PreviewOverlayProps> = ({
  widgets,
  parentSize,
  originalCanvas,
  onClose,
}) => {
  const { width: boardW, height: boardH } = parentSize;
  const [scale, setScale] = useState(1);

  // 1) Fit the board in the viewport
  useEffect(() => {
    const updateScale = () => {
      const wScale = window.innerWidth / boardW;
      const hScale = window.innerHeight / boardH;
      setScale(Math.min(wScale, hScale, 1));
    };
    updateScale();
    window.addEventListener("resize", updateScale);
    return () => window.removeEventListener("resize", updateScale);
  }, [boardW, boardH]);

  // 2) Map from original → current canvas coords
  const mapToCurrentCanvas = useCallback(
    (w: BoardWidget) => {
      const factorX = boardW / originalCanvas.width;
      const factorY = boardH / originalCanvas.height;
      return {
        x:      Math.round(w.x      * factorX),
        y:      Math.round(w.y      * factorY),
        width:  Math.round(w.width  * factorX),
        height: Math.round(w.height * factorY),
      };
    },
    [boardW, boardH, originalCanvas]
  );

  return (
    <div
      className="
        fixed inset-0
        bg-white
        z-50
        overflow-hidden
        flex items-center justify-center
      "
    >
      <div className="w-full h-full p-2 sm:p-4 md:p-6 lg:p-8 relative">
        <div
          className="relative mx-auto"
          style={{
            width:       boardW,
            height:      boardH,
            transform:   `scale(${scale})`,
            transformOrigin: "top left",
            maxWidth:    "100%",
            maxHeight:   "100%",
          }}
        >
          {widgets.map((w) => {
            const { x, y, width, height } = mapToCurrentCanvas(w);
            return (
              <div
                key={w.id}
                className="absolute"
                style={{ left: x, top: y, width, height }}
              >
                {w.type === "Album" ? (
                  <Album image={w.imageUrl!} />
                ) : (
                  <Weather location="Ahmedabad" />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* close button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 text-red-600 bg-white rounded-full p-2 shadow-lg"
      >
        <MdClose size={24} />
      </button>
    </div>
  );
};

export default PreviewOverlay;
