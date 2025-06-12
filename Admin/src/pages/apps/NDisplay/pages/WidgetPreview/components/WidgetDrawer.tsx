import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import Clock from "./widgets/Clock";
import Weather from "./widgets/Weather";

interface WidgetDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

const WidgetDrawer: React.FC<WidgetDrawerProps> = ({ isOpen, onClose }) => {
  const colors: string[] = [
    "#f28b82",
    "#fbbc04",
  ];
const [widgetType, setWidgetType] = React.useState<string>("calendar");

 const renderWidgetSelection = () => {
    switch (widgetType) {
      case "Weather":
        return <div><Weather location="Ahmedabad"/></div>;
      case "Clock":
        return <div><Clock/></div>;
      default:
        return <div>Default</div>;
    }
  };

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
          {/* Header */}
          <div className="drop-shadow-xl flex justify-between items-center py-5 px-4 border-b border-gray-300">
            <h3 className="font-bold text-gray-800 text-lg">Widget Details</h3>
            <button onClick={onClose} className="text-red-500 hover:text-red-700">
              <svg
                width="35"
                height="35"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="15" y1="9" x2="9" y2="15"></line>
                <line x1="9" y1="9" x2="15" y2="15"></line>
              </svg>
            </button>
          </div>

          {/* Body */}
          <div className="p-4 space-y-4">
            <div>
              <label>Widget Type</label>
              <select
                value={widgetType}
                onChange={(e) => setWidgetType(e.target.value)}
                className="w-full border p-2 rounded mt-1"
              >
                <option value="Weather">Weather</option>
                <option value="Clock">Clock</option>
              </select>
            </div>

            <div>
              <label>Initial Position</label>
              <select className="w-full border p-2 rounded mt-1">
                <option value="top-left">Top Left</option>
                <option value="top-center">Top Center</option>
                <option value="top-right">Top Right</option>
                <option value="center-left">Center Left</option>
                <option value="center">Center</option>
                <option value="center-right">Center Right</option>
                <option value="bottom-left">Bottom Left</option>
                <option value="bottom-center">Bottom Center</option>
                <option value="bottom-right">Bottom Right</option>
              </select>
            </div>

            <div>
              <label>Color</label>
              <div className="flex gap-2 flex-wrap mt-1">
                {colors.map((color: string) => (
                  <div
                    key={color}
                    className="w-8 h-8 rounded-full cursor-pointer border-2"
                    style={{
                      backgroundColor: color,
                      borderColor: color === "#cbf0f8" ? "black" : "white",
                    }}
                  ></div>
                ))}
              </div>
            </div>

            {/* Preview */}
            <div>
  <label className="font-semibold">Preview</label>
  {renderWidgetSelection()}
</div>


            <button className="bg-blue-600 text-white px-4 py-2 rounded w-full">
              Add to Board
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default WidgetDrawer;
