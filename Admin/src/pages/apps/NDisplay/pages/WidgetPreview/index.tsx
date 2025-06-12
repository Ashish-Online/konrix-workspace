import { useState, useEffect, useRef } from "react";
import { Rnd } from "react-rnd";
import { MdKeyboardBackspace, MdClose } from "react-icons/md";
import WidgetDrawer, { WidgetType, Position } from "./components/WidgetDrawer";
import Album from "./components/widgets/Album";
import Weather from "./components/widgets/Weather";
import PreviewOverlay from "./components/PreviewOverlay";

// a single widget instance on the board:
export interface BoardWidget {
  id: string;
  type: WidgetType;
  position: Position;
  color?: string;
  imageUrl?: string;
  x: number;
  y: number;
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
  const [showPreview, setShowPreview] = useState(false);
  const parentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!parentRef.current) return;
    const { width, height } = parentRef.current.getBoundingClientRect();
    setParentSize({ width, height });
  }, []);

  const handleAddWidget = (
    type: WidgetType,
    position: Position,
    color?: string,
    imageFile?: File
  ) => {
    const id = Date.now().toString();
    const rel = positionMap[position];
    const w0 = 200, h0 = 150;
    const x = rel.x * (parentSize.width - w0);
    const y = rel.y * (parentSize.height - h0);
    const imageUrl = imageFile ? URL.createObjectURL(imageFile) : undefined;
    setBoardWidgets(ws => [
      ...ws,
      { id, type, position, color, imageUrl, x, y, width: w0, height: h0 },
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
        {boardWidgets.length > 0 && (
          <button
            onClick={() => setShowPreview(true)}
            className="ml-2 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
          >
            Preview
          </button>
        )}
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
        {boardWidgets.map(w => (
          <Rnd
            key={w.id}
            size={{ width: w.width, height: w.height }}
            position={{ x: w.x, y: w.y }}
            bounds="parent"
            minWidth={100}
            minHeight={100}
            enableResizing={{ bottom: true, bottomRight: true, right: true }}
            onDragStop={(_, d) => {
              setBoardWidgets(ws =>
                ws.map(x =>
                  x.id === w.id ? { ...x, x: d.x, y: d.y } : x
                )
              );
            }}
            onResizeStop={(e, dir, ref, delta, pos) => {
              setBoardWidgets(ws =>
                ws.map(x =>
                  x.id === w.id
                    ? {
                        ...x,
                        width: ref.offsetWidth,
                        height: ref.offsetHeight,
                        x: pos.x,
                        y: pos.y,
                      }
                    : x
                )
              );
            }}
            className="bg-slate-100 border-blue-400 border-2 rounded p-2"
          >
            <div className="relative w-full h-full">
              <button
                onClick={() => handleDelete(w.id)}
                className="absolute top-1 right-1 z-10 bg-white rounded-full p-1 shadow hover:bg-red-100"
              >
                <MdClose size={16} className="text-red-600" />
              </button>

              {w.type === "Album" ? (
                <Album image={w.imageUrl!} />
              ) : (
                <Weather location="Ahmedabad"/>
              )}
            </div>
          </Rnd>
        ))}
      </div>

      {showPreview && (
        <PreviewOverlay
          widgets={boardWidgets}
          onClose={() => setShowPreview(false)}
        />
      )}
    </div>
  );
};

export default WidgetPreview;
