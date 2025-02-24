import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Dashboard: React.FC = () => {
  const [message, setMessage] = useState("");
  const navigate = useNavigate();
  const role = localStorage.getItem("role");
  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchDashboard = async () => {
      if (!token || !role) {
        navigate("/");
        return;
      }

      try {
        const response = await axios.get(
          `${import.meta.env.VITE_API_URL}/${role}/dashboard`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setMessage(response.data.message);
      } catch (err) {
        navigate("/");
      }
    };
    fetchDashboard();
  }, [role, token, navigate]);

  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
  };

  return (
    <div>
      <h1>{message}</h1>
      <button onClick={handleLogout}>Logout</button>
    </div>
  );
};

export default Dashboard;
