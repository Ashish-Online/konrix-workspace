import React from "react";
import { BoardWidget } from "../index";
import Album from "./widgets/Album";
import Weather from "./widgets/Weather";
import { MdClose } from "react-icons/md";

interface PreviewOverlayProps {
  widgets: BoardWidget[];
  onClose: () => void;
}

const PreviewOverlay: React.FC<PreviewOverlayProps> = ({ widgets, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex flex-col">
      <div className="flex justify-end p-4">
        <button onClick={onClose} className="text-white">
          <MdClose size={24} />
        </button>
      </div>
      <div className="flex-1 overflow-auto p-8">
        <div className="relative w-full h-full border border-white rounded-lg">
          {widgets.map(w => (
            <div
              key={w.id}
              className="absolute"
              style={{
                left: w.x,
                top: w.y,
                width: w.width,
                height: w.height,
              }}
            >
              {w.type === "Album" ? (
                <Album image={w.imageUrl!} />
              ) : (
                <Weather location="Ahmedabad" />
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PreviewOverlay;