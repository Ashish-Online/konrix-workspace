import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { IoMdHome } from "react-icons/io";
import { MdDelete } from "react-icons/md";
import axios from "axios";

import Album from "../NDisplay/pages/WidgetPreview/components/widgets/Album";
import Weather from "../NDisplay/pages/WidgetPreview/components/widgets/Weather";
 
type Layout = {
  _id: string;
  widget_name: string;
  created_at: string;
  layout: Array<{
    id: string;
    type: "Album" | "Weather";
    x: number;
    y: number;
    width: number;
    height: number;
    imageUrl?: string;
  }>;
};

const NDisplay = () => {
  const navigate = useNavigate();
  const [layouts, setLayouts] = useState<Layout[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchLayouts = async () => {
      setLoading(true);
      try {
        const { data } = await axios.get<Layout[]>(
          "http://localhost:5000/api/layouts/",
          { withCredentials: true }
        );
        setLayouts(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchLayouts();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this layout?")) return;
    try {
      await axios.delete(`/api/layouts/delete/${id}`, {
        withCredentials: true,
      });
      setLayouts((ls) => ls.filter((l) => l._id !== id));
    } catch (err) {
      console.error(err);
      alert("Could not delete");
    }
  };

  return (
    <div className="App">
      <h2>Display</h2>

      <div className="flex items-center justify-center gap-1 mb-4">
        <button
          onClick={() => navigate("/dashboard/")}
          className="flex btn bg-primary text-white font-semibold px-4 py-2 rounded"
        >
          Home <IoMdHome size={18} className="ml-1" />
        </button>
        <button
          onClick={() => navigate("/apps/ndisplay/devicepreview")}
          className="btn bg-gray-700 text-white font-semibold px-4 py-2 rounded"
        >
          + New Layout
        </button>
      </div>

      <div className="card shadow-2xl mb-5 p-4">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr className="text-center">
                <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase">
                  Name
                </th>
                <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase">
                  Preview
                </th>
                <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase">
                  Created At
                </th>
                <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={4} className="py-4 text-center">
                    Loading…
                  </td>
                </tr>
              ) : layouts.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-4 text-center">
                    No layouts found.
                  </td>
                </tr>
              ) : (
                layouts.map((l) => (
                  <tr key={l._id} className="text-center">
                    <td className="px-6 py-4 text-sm text-gray-800">
                      {l.widget_name}
                    </td>
                    {/* PREVIEW CELL */}
                    <td className="px-6 py-4">
                      <div
                        onClick={() =>
                          navigate(`/apps/ndisplay/devicepreview/${l._id}`)
                        }
                        className="w-[120px] h-[80px] border rounded overflow-hidden object-contain cursor-pointer mx-auto"
                      >
                        <div
                          className="relative w-full h-full"
                          style={{
                            transform: "scale(0.12)",
                            transformOrigin: "top left",
                          }}
                        >
                          {l.layout.map((w, i) => {
                            const style = {
                              position: "absolute" as const,
                              top: w.y,
                              left: w.x,
                              width: w.width,
                              height: w.height,
                            };
                            return (
                              <div key={i} style={style}>
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
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-800">
                      {new Date(l.created_at).toLocaleString()}
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleDelete(l._id)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <MdDelete size={20} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default NDisplay;
