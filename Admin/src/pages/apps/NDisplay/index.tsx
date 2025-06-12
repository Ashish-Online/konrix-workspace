import { useNavigate } from "react-router-dom";
import { Rnd } from "react-rnd";
import spiderman from "../../ui/images/spiderman.jpg";
import { IoMdHome } from "react-icons/io";

const NDisplay = () => {
  const navigate = useNavigate();
  const handleNewLayoutClick = () => {
    navigate("/apps/ndisplay/devicepreview");
  };

  return (
    <div className="App">
      <h2>Display</h2>
      <div className="flex items-center justify-center gap-1 mb-4">
        <button
          type="button"
          className="flex btn bg-primary text-white align-baseline text-m font-semibold mb-5 mr-2"
        >
          Home <IoMdHome size={18} />
        </button>
        <button
          type="button"
          className="btn bg-gray-700 text-white align-baseline text-m font-semibold mb-5"
          onClick={handleNewLayoutClick}
        >
          + New Layout
        </button>
      </div>
      <div className="border rounded-lg divide-y divide-gray-200 dark:border-gray-700 dark:divide-gray-700">
        
      </div>
    </div>
  );
};

export default NDisplay;
