import {useState} from "react";
import { Rnd } from "react-rnd";
import spiderman from "../../../../ui/images/spiderman.jpg";
import { MdKeyboardBackspace } from "react-icons/md";
import WidgetDrawer from "./components/WidgetDrawer";

const WidgetPreview = () => {
  
  const [showWidget, setShowWidget] = useState<boolean>(false);

  return (
    <div className="App">
      <div className="flex items-center justify-center gap-1 mb-4">
        <button
          type="button"
          className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-700 text-white"
        >
          <MdKeyboardBackspace />
        </button>
        <button
          type="button"
          onClick={() => setShowWidget(true)}
          className="btn bg-gray-700 text-white align-baseline text-m font-semibold "
        >
          + Widget
        </button>
      </div>
      {/* Responsive parent container */}
      <WidgetDrawer isOpen={showWidget} onClose={() => setShowWidget(false)} />
      <div className="parent-container mt-5 w-full h-[80vh] relative border border-gray-300 rounded-lg overflow-hidden">
        <Rnd
          default={{ x: 0, y: 0, width: 200, height: 150 }}
          bounds="parent"
          minWidth={100}
          minHeight={100}
          enableResizing={{ bottom: true, bottomRight: true, right: true }}
          className="bg-slate-300 border-blue-400 border-2 rounded-[8px] p-2 overflow-hidden"
        >
          <div className="w-full h-full flex flex-col items-center justify-center overflow-hidden">
            <img
              src={spiderman}
              alt="img"
              className="w-full h-full object-contain max-w-full max-h-full"
            />
          </div>
        </Rnd>
      </div>
    </div>
  );
};

export default WidgetPreview;
