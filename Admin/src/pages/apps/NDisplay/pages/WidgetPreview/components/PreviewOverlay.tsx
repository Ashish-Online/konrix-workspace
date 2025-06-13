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
    <div className="fixed inset-0 bg-white z-50 overflow-hidden flex flex-col">
      {/* Main Content */}
      <div className="relative w-full h-full">
        {widgets.map((w) => (
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

      <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 z-50">
        <button
          onClick={onClose}
          className="flex items-center gap-2 text-red-600 rounded-full shadow-lg transition"
        >
          <MdClose size={16} className="text-red-600" />
        </button>
      </div>
    </div>
  );
};

export default PreviewOverlay;
