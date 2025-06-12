import { useState, useEffect, useRef } from "react";
import { Rnd } from "react-rnd";
import { MdKeyboardBackspace, MdClose } from "react-icons/md";
import WidgetDrawer, { WidgetType, Position } from "./components/WidgetDrawer";
import Album from "./components/widgets/Album";
import Weather from "./components/widgets/Weather";

// a single widget instance on the board:
interface BoardWidget {
  id: string;
  type: WidgetType;
  position: Position;
  color?: string;
  imageUrl?: string;
  width: number;
  height: number;
}

const positionMap: Record<Position, { x: number; y: number }> = {
  "top-left":     { x: 0,   y: 0   },
  "top-center":   { x: 0.5, y: 0   },
  "top-right":    { x: 1,   y: 0   },
  "center-left":  { x: 0,   y: 0.5 },
  center:         { x: 0.5, y: 0.5 },
  "center-right": { x: 1,   y: 0.5 },
  "bottom-left":  { x: 0,   y: 1   },
  "bottom-center":{ x: 0.5, y: 1   },
  "bottom-right": { x: 1,   y: 1   },
};

const WidgetPreview = () => {
  const [showDrawer, setShowDrawer] = useState(false);
  const [boardWidgets, setBoardWidgets] = useState<BoardWidget[]>([]);
  const [parentSize, setParentSize] = useState({ width: 0, height: 0 });
  const parentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!parentRef.current) return;
    const { width, height } = parentRef.current.getBoundingClientRect();
    setParentSize({ width, height });
    // optionally: observe with ResizeObserver for dynamic container-resizing
  }, []);

  const handleAddWidget = (
    type: WidgetType,
    position: Position,
    color?: string,
    imageFile?: File
  ) => {
    const id = Date.now().toString();
    const imageUrl = imageFile ? URL.createObjectURL(imageFile) : undefined;
    setBoardWidgets(ws => [
      ...ws,
      { id, type, position, color, imageUrl, width: 200, height: 150 },
    ]);
    setShowDrawer(false);
  };

  const handleDelete = (id: string) => {
    setBoardWidgets(ws => ws.filter(w => w.id !== id));
  };

  return (
    <div className="App">
      <div className="flex items-center justify-center gap-1 mb-4">
        <button className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-700 text-white">
          <MdKeyboardBackspace />
        </button>
        <button
          onClick={() => setShowDrawer(true)}
          className="btn bg-gray-700 text-white text-m font-semibold px-4 py-2 rounded"
        >
          + Widget
        </button>
      </div>

      <WidgetDrawer
        isOpen={showDrawer}
        onClose={() => setShowDrawer(false)}
        onAdd={handleAddWidget}
      />

      <div
        ref={parentRef}
        className="parent-container mt-5 w-full h-[80vh] relative border border-gray-300 rounded-lg overflow-hidden"
      >
        {boardWidgets.map(w => {
          const rel = positionMap[w.position];
          const initialX = rel.x * parentSize.width;
          const initialY = rel.y * parentSize.height;

          return (
            <Rnd
              key={w.id}
              size={{ width: w.width, height: w.height }}
              default={{
                x: initialX,
                y: initialY,
                width: w.width,
                height: w.height,
              }}
              bounds="parent"
              minWidth={100}
              minHeight={100}
              enableResizing={{ bottom: true, bottomRight: true, right: true }}
              onResizeStop={(e, dir, ref) => {
                setBoardWidgets(ws =>
                  ws.map(x =>
                    x.id === w.id
                      ? {
                          ...x,
                          width: parseInt(ref.style.width, 10),
                          height: parseInt(ref.style.height, 10),
                        }
                      : x
                  )
                );
              }}
              className="bg-slate-100 border-blue-400 border-2 rounded p-2"
            >
              {/* container to position the delete button */}
              <div className="relative w-full h-full">
                {/* Delete button in the top-right corner */}
                <button
                  onClick={() => handleDelete(w.id)}
                  className="absolute top-1 right-1 z-10 bg-white rounded-full p-1 shadow hover:bg-red-100"
                >
                  <MdClose size={16} className="text-red-600" />
                </button>

                {/* actual widget */}
                {w.type === "Album" ? (
                  <Album image={w.imageUrl!} />
                ) : (
                  <Weather
                    location="Ahmedabad"
                  />
                )}
              </div>
            </Rnd>
          );
        })}
      </div>
    </div>
  );
};

export default WidgetPreview;