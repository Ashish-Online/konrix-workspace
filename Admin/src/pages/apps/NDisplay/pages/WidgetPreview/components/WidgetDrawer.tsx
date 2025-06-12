import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import Album from "./widgets/Album";
import Weather from "./widgets/Weather";

export type WidgetType = "Album" | "Weather";
export type Position =
  | "top-left" | "top-center" | "top-right"
  | "center-left" | "center"     | "center-right"
  | "bottom-left"| "bottom-center" | "bottom-right";

interface WidgetDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (
    type: WidgetType,
    position: Position,
    color?: string,
    imageFile?: File
  ) => void;
}

const colors = ["#f28b82", "#fbbc04"];

const WidgetDrawer: React.FC<WidgetDrawerProps> = ({
  isOpen,
  onClose,
  onAdd,
}) => {
  const [type, setType] = React.useState<WidgetType>("Album");
  const [position, setPosition] = React.useState<Position>("top-left");
  const [color, setColor] = React.useState<string>(colors[0]);
  const [imageFile, setImageFile] = React.useState<File | null>(null);

  const renderPreview = () =>
    type === "Album" ? (
      <Album image={imageFile ? URL.createObjectURL(imageFile) : ""} />
    ) : (
      <Weather location="Ahmedabad" />
    );

  const handleAdd = () => {
    onAdd(
      type,
      position,
      type === "Weather" ? color : undefined,
      type === "Album" ? imageFile! : undefined
    );
    onClose();
    setImageFile(null);
  };

  const isAddDisabled =
    type === "Album" ? imageFile === null : false;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ x: "100%" }}
          animate={{ x: 0 }}
          exit={{ x: "100%" }}
          transition={{ duration: 0.3 }}
          className="fixed top-0 right-0 h-full w-full max-w-lg bg-white shadow-xl z-50 overflow-y-auto"
        >
          {/* header omitted */}
          <div className="p-4 space-y-4">
            <div>
              <label>Widget Type</label>
              <select
                value={type}
                onChange={e => {
                  const val = e.target.value as WidgetType;
                  setType(val);
                  setImageFile(null);
                  if (val === "Weather") setColor(colors[0]);
                }}
                className="w-full border p-2 rounded mt-1"
              >
                <option value="Album">Album</option>
                <option value="Weather">Weather</option>
              </select>
            </div>

            <div>
              <label>Initial Position</label>
              <select
                value={position}
                onChange={e =>
                  setPosition(e.target.value as Position)
                }
                className="w-full border p-2 rounded mt-1"
              >
                {[
                  "top-left","top-center","top-right",
                  "center-left","center","center-right",
                  "bottom-left","bottom-center","bottom-right",
                ].map(pos => (
                  <option key={pos} value={pos}>
                    {pos.replace(/-/g," ").replace(/\b\w/g,l=>l.toUpperCase())}
                  </option>
                ))}
              </select>
            </div>

            {type === "Album" ? (
              <div>
                <label>Upload Image</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={e =>
                    setImageFile(e.target.files ? e.target.files[0] : null)
                  }
                  className="w-full mt-1"
                />
              </div>
            ) : (
              <div>
                <label>Color</label>
                <div className="flex gap-2 mt-1">
                  {colors.map(c => (
                    <div
                      key={c}
                      onClick={() => setColor(c)}
                      className={`w-8 h-8 rounded-full cursor-pointer border-2 ${
                        c === color ? "border-black" : "border-white"
                      }`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
              </div>
            )}

            <div>
              <label className="font-semibold">Preview</label>
              <div className="mt-2 border p-2">
                {renderPreview()}
              </div>
            </div>

            <button
              onClick={handleAdd}
              disabled={isAddDisabled}
              className={`w-full px-4 py-2 rounded text-white ${
                isAddDisabled ?
                  "bg-gray-400 cursor-not-allowed" :
                  "bg-blue-600 hover:bg-blue-700"
              }`}
            >
              Add to Board
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default WidgetDrawer;
