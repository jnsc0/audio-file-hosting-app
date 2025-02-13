import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
      <h2 className="text-3xl font-bold mb-6">Welcome</h2>

      {/* Link to Audio Upload */}
      <div
        className="cursor-pointer bg-white shadow-md rounded-lg p-6 w-80 text-center hover:shadow-xl transition duration-300 mt-6"
        onClick={() => navigate("/audio/upload")}
      >
        <h3 className="text-xl font-semibold">Upload Audio</h3>
        <p className="text-gray-600">Upload your audio files here</p>
      </div>

      {/* Link to Audio List */}
      <div
        className="cursor-pointer bg-white shadow-md rounded-lg p-6 w-80 text-center hover:shadow-xl transition duration-300 mt-6"
        onClick={() => navigate("/audio/list")}
      >
        <h3 className="text-xl font-semibold">Your Audio Files</h3>
        <p className="text-gray-600">View your uploaded audio files</p>
      </div>
    </div>
  );
};

export default Dashboard;
