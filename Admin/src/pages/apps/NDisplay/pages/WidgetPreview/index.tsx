import { useState, useEffect, useRef } from "react";
import { Rnd } from "react-rnd";
import { MdKeyboardBackspace, MdClose } from "react-icons/md";
import WidgetDrawer, { WidgetType, Position } from "./components/WidgetDrawer";
import Album from "./components/widgets/Album";
import Weather from "./components/widgets/Weather";
import PreviewOverlay from "./components/PreviewOverlay";
import { useNavigate, useParams } from "react-router-dom";
import axios from 'axios';


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
  "top-left": { x: 0, y: 0 },
  "top-center": { x: 0.5, y: 0 },
  "top-right": { x: 1, y: 0 },
  "center-left": { x: 0, y: 0.5 },
  center: { x: 0.5, y: 0.5 },
  "center-right": { x: 1, y: 0.5 },
  "bottom-left": { x: 0, y: 1 },
  "bottom-center": { x: 0.5, y: 1 },
  "bottom-right": { x: 1, y: 1 },
};

const WidgetPreview = () => {
  const { id: layoutId } = useParams<{ id?: string }>();
  const navigate = useNavigate();
  const parentRef = useRef<HTMLDivElement>(null);

  // board state
  const [boardWidgets, setBoardWidgets] = useState<BoardWidget[]>([]);
  const [parentSize, setParentSize] = useState({ width:0, height:0 });
  // drawer + preview
  const [showDrawer, setShowDrawer] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  // save flow
  const [showNamePrompt, setShowNamePrompt] = useState(false);
  const [layoutName, setLayoutName] = useState("");
  const [saving, setSaving] = useState(false);

// const handleSaveChanges = async () => {
//   if (boardWidgets.length === 0) return;
//   setSaving(true);
//   try {
//     await axios.post(
//       'http://localhost:5000/api/layouts/addlayouts',
//       {
//         widget_name: `Layout_${Date.now()}`,
//         layout: boardWidgets,
//       },
//       { withCredentials: true }
//     );
//     alert('Layout saved successfully!');
//   } catch (err: any) {
//   console.error(err);
//   if (axios.isAxiosError(err) && err.response) {
//     console.error('Response status:', err.response.status);
//     console.error('Response data:', err.response.data);
//   } else {
//     console.error('Network or other error:', err.message);
//   }
//   alert('Error saving layout.');
// }finally {
//     setSaving(false);
//   }
// };

  useEffect(() => {
    if (!parentRef.current) return;
    const { width, height } = parentRef.current.getBoundingClientRect();
    setParentSize({ width, height });
  }, []);

  // 2) if layoutId is present, fetch data
  useEffect(() => {
    if (!layoutId) return;
    axios.get(`/layouts/${layoutId}`, { withCredentials: true })
      .then(res => {
        console.log("Loaded Layout", res.data);
        
        setBoardWidgets(res.data.layout);
      })
      .catch(err => {
        console.error("Failed to load layout", err);
      });
  }, [layoutId]);

  const handleSaveClick = () => {
    setShowNamePrompt(true);
  };

  const confirmSave = async () => {
    if (!layoutName.trim()) return;
    setSaving(true);
    try {
      await axios.post(
        "/layouts/addlayouts",
        { widget_name: layoutName, layout: boardWidgets, creator: "anonymous" },
        { withCredentials: true }
      );
      alert("Saved!");
      setShowNamePrompt(false);
    } catch (err) {
      console.error(err);
      alert("Save failed");
    } finally {
      setSaving(false);
    }
  };

  const handleAddWidget = (
    type: WidgetType,
    position: Position,
    color?: string,
    imageFile?: File
  ) => {
    const id = Date.now().toString();
    const rel = positionMap[position];
    const w0 = 200,
      h0 = 150;
    const x = rel.x * (parentSize.width - w0);
    const y = rel.y * (parentSize.height - h0);
    const imageUrl = imageFile ? URL.createObjectURL(imageFile) : undefined;
    setBoardWidgets((ws) => [
      ...ws,
      { id, type, position, color, imageUrl, x, y, width: w0, height: h0 },
    ]);
    setShowDrawer(false);
  };

  return (
    <div className="App">
      <div className="flex items-center justify-center gap-1 mb-4">
        <button
          onClick={() => navigate("/apps/ndisplay/")}
          className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-700 text-white"
        >
          <MdKeyboardBackspace />
        </button>
        <button
          onClick={() => setShowDrawer(true)}
          className="btn bg-gray-700 text-white text-m font-semibold px-4 py-2 rounded"
        >
          + Widget
        </button>
        {boardWidgets.length > 0 && (
          <>
            <button
              onClick={() => setShowPreview(true)}
              className="ml-2 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
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
              {saving ? "Saving…" : "Save Changes"}
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
        {boardWidgets.map((w) => (
          <Rnd
            key={w.id}
            size={{ width: w.width, height: w.height }}
            position={{ x: w.x, y: w.y }}
            bounds="parent"
            minWidth={100}
            minHeight={100}
            enableResizing={{ bottom: true, bottomRight: true, right: true }}
            onDragStop={(_, d) => {
              setBoardWidgets((ws) =>
                ws.map((x) => (x.id === w.id ? { ...x, x: d.x, y: d.y } : x))
              );
            }}
            onResizeStop={(e, dir, ref, delta, pos) => {
              setBoardWidgets((ws) =>
                ws.map((x) =>
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
                // onClick={() => handleDelete(w.id)}
                className="absolute top-1 right-1 z-10 bg-white rounded-full p-1 shadow hover:bg-red-100"
              >
                <MdClose size={16} className="text-red-600" />
              </button>

              {w.type === "Album" ? (
                <Album image={w.imageUrl!} />
              ) : (
                <Weather location="Ahmedabad" />
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
      {showNamePrompt && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-sm">
            <h2 className="text-xl font-semibold mb-2">Enter Layout Name</h2>
            <input
              type="text"
              className="w-full border p-2 rounded mb-4"
              placeholder="Enter a name for this layout"
              value={layoutName}
              onChange={e => setLayoutName(e.target.value)}
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowNamePrompt(false)}
                className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
              >
                Cancel
              </button>
              <button
                onClick={confirmSave}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
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
