import { useState, useEffect, useRef, useCallback } from "react";
import { Rnd } from "react-rnd";
import { MdKeyboardBackspace, MdClose } from "react-icons/md";
import WidgetDrawer, { WidgetType, Position } from "./components/WidgetDrawer";
import Album from "./components/widgets/Album";
import Weather from "./components/widgets/Weather";
import PreviewOverlay from "./components/PreviewOverlay";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";

// widget interface
export interface BoardWidget {
  id: string;
  type: WidgetType;
  position: Position;
  color?: string;
  imageUrl?: string;

  // raw px from original canvas
  x: number;
  y: number;
  width: number;
  height: number;

  // ratios (unused downstream)
  xRatio: number;
  yRatio: number;
  widthRatio: number;
  heightRatio: number;
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
  const { id: layoutId } = useParams<{ id?: string }>();
  const navigate = useNavigate();
  const parentRef = useRef<HTMLDivElement>(null);

  // board + canvas state
  const [boardWidgets, setBoardWidgets]   = useState<BoardWidget[]>([]);
  const [parentSize, setParentSize]       = useState({ width: 0, height: 0 });
  const [originalCanvas, setOriginalCanvas] = useState({ width: 0, height: 0 });

  // UI state
  const [showDrawer, setShowDrawer]       = useState(false);
  const [showPreview, setShowPreview]     = useState(false);
  const [showNamePrompt, setShowNamePrompt] = useState(false);
  const [layoutName, setLayoutName]       = useState("");
  const [saving, setSaving]               = useState(false);

  // measure the “current” canvas on mount+resize
  useEffect(() => {
    if (!parentRef.current) return;
    const measure = () => {
      const { width, height } = parentRef.current!.getBoundingClientRect();
      setParentSize({ width, height });
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  // when loading existing, pull layout + originalCanvas
  useEffect(() => {
    if (!layoutId) return;
    axios
      .get(`/layouts/${layoutId}`, { withCredentials: true })
      .then((res) => {
        const { layout, originalCanvas } = res.data;
        setOriginalCanvas(originalCanvas);
        setBoardWidgets(
          (layout as BoardWidget[]).map((w) => ({
            ...w,
            xRatio:       w.x /  originalCanvas.width,
            yRatio:       w.y /  originalCanvas.height,
            widthRatio:   w.width  / originalCanvas.width,
            heightRatio:  w.height / originalCanvas.height,
          }))
        );
      })
      .catch(console.error);
  }, [layoutId]);

  // map from the “base” canvas → current canvas
  const mapToCurrentCanvas = useCallback((w: BoardWidget) => {
    // if updating: use saved originalCanvas; else: new layout 1:1 → parentSize
    const baseW = layoutId ? originalCanvas.width  : parentSize.width;
    const baseH = layoutId ? originalCanvas.height : parentSize.height;
    const fx    = parentSize.width  / baseW;
    const fy    = parentSize.height / baseH;
    return {
      x:      Math.round(w.x      * fx),
      y:      Math.round(w.y      * fy),
      width:  Math.round(w.width  * fx),
      height: Math.round(w.height * fy),
    };
  }, [layoutId, originalCanvas, parentSize]);

  // Create vs Update
  const updateExisting = async () => {
    setSaving(true);
    try {
      await axios.put(
        `/api/layouts/${layoutId}`,
        { layout: boardWidgets, originalCanvas: parentSize },
        { withCredentials: true }
      );
      alert("Layout updated!");
    } catch {
      alert("Update failed");
    } finally {
      setSaving(false);
    }
  };
  const handleSaveClick = () =>
    layoutId ? updateExisting() : setShowNamePrompt(true);

  const confirmSave = async () => {
    if (!layoutName.trim()) return;
    setSaving(true);
    try {
      await axios.post(
        "/api/layouts",
        { widget_name: layoutName, layout: boardWidgets, originalCanvas: parentSize },
        { withCredentials: true }
      );
      alert("Saved!");
      setShowNamePrompt(false);
    } catch {
      alert("Save failed");
    } finally {
      setSaving(false);
    }
  };

  // add new widget
  const handleAddWidget = (
    type: WidgetType,
    position: Position,
    color?: string,
    imageFile?: File
  ) => {
    const id = Date.now().toString();
    const rel = positionMap[position];
    const w0 = 200, h0 = 150;
    const x0 = rel.x * (parentSize.width  - w0);
    const y0 = rel.y * (parentSize.height - h0);

    const newW: BoardWidget = {
      id, type, position, color,
      imageUrl: imageFile ? URL.createObjectURL(imageFile) : undefined,
      x: x0, y: y0, width: w0, height: h0,
      xRatio:      x0 / parentSize.width,
      yRatio:      y0 / parentSize.height,
      widthRatio:  w0 / parentSize.width,
      heightRatio: h0 / parentSize.height,
    };
    setBoardWidgets((ws) => [...ws, newW]);
    setShowDrawer(false);
  };

  // drag & resize handlers
  const onDragStop = useCallback((w: BoardWidget, d: { x: number; y: number }) => {
    const updated = {
      ...w,
      x: d.x, y: d.y,
      xRatio: d.x / parentSize.width,
      yRatio: d.y / parentSize.height,
    };
    setBoardWidgets((ws) => ws.map((x) => x.id === w.id ? updated : x));
  }, [parentSize]);

  const onResizeStop = useCallback((
    w: BoardWidget,
    _dir: any,
    ref: HTMLElement,
    _delta: any,
    pos: { x: number; y: number }
  ) => {
    const newW = ref.offsetWidth, newH = ref.offsetHeight;
    const updated = {
      ...w,
      width: newW, height: newH,
      x: pos.x, y: pos.y,
      widthRatio:  newW / parentSize.width,
      heightRatio: newH / parentSize.height,
      xRatio:      pos.x / parentSize.width,
      yRatio:      pos.y / parentSize.height,
    };
    setBoardWidgets((ws) => ws.map((x) => x.id === w.id ? updated : x));
  }, [parentSize]);


  return (
    <div className="App">
      {/* Top Bar */}
      <div className="flex items-center justify-center gap-1 mb-4">
        <button
          onClick={() => navigate("/apps/ndisplay/")}
          className="w-10 h-10 rounded-full bg-gray-700 text-white"
        >
          <MdKeyboardBackspace />
        </button>
        <button
          onClick={() => setShowDrawer(true)}
          className="btn bg-gray-700 text-white px-4 py-2 rounded"
        >
          + Widget
        </button>
        {boardWidgets.length > 0 && (
          <>
            <button
              onClick={() => setShowPreview(true)}
              className="ml-2 bg-green-600 text-white px-4 py-2 rounded"
            >
              Preview
            </button>
            <button
              onClick={handleSaveClick}
              disabled={saving}
              className={`ml-2 px-4 py-2 rounded text-white ${
                saving
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700"
              }`}
            >
              {saving
                ? layoutId
                  ? "Updating…"
                  : "Saving…"
                : layoutId
                ? "Update Layout"
                : "Save Changes"}
            </button>
          </>
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
        {boardWidgets.map((w) => {
          const { x, y, width, height } = mapToCurrentCanvas(w);
          return (
            <Rnd
              key={w.id}
              size={{ width, height }}
              position={{ x, y }}
              bounds="parent"
              enableResizing={{ bottom: true, bottomRight: true, right: true }}
              onDragStop={(_e, d) => onDragStop(w, d)}
              onResizeStop={(e, dir, ref, delta, pos) =>
                onResizeStop(w, dir, ref, delta, pos)
              }
              className="bg-slate-100 border-blue-400 border-2 rounded p-2"
            >
              <div className="relative w-full h-full">
                <button className="absolute top-1 right-1 z-10 bg-white rounded-full p-1 shadow hover:bg-red-100">
                  <MdClose size={16} className="text-red-600" />
                </button>
                {w.type === "Album" ? (
                  <Album image={w.imageUrl!} />
                ) : (
                  <Weather location="Ahmedabad" />
                )}
              </div>
            </Rnd>
          );
        })}
      </div>

      {showPreview && (
        <PreviewOverlay
          widgets={boardWidgets}
          parentSize={parentSize}
          originalCanvas={originalCanvas}
          onClose={() => setShowPreview(false)}
        />
      )}

      {showNamePrompt && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-sm">
            <h2 className="text-xl font-semibold mb-2">Enter Layout Name</h2>
            <input
              type="text"
              className="w-full border p-2 rounded mb-4"
              placeholder="Enter a name for this layout"
              value={layoutName}
              onChange={(e) => setLayoutName(e.target.value)}
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowNamePrompt(false)}
                className="px-4 py-2 bg-gray-300 rounded"
              >
                Cancel
              </button>
              <button
                onClick={confirmSave}
                className="px-4 py-2 bg-blue-600 text-white rounded"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WidgetPreview;
