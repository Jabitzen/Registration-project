import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode"; // ES module import for TypeScript

interface SignUpProps {
  onSuccess?: () => void; // Callback to close the modal
}

interface JwtPayload {
  id: string;
  role: string;
  name: string; // Adjust based on your token payload
  iat?: number;
  exp?: number;
}

const SignUp: React.FC<SignUpProps> = ({ onSuccess }) => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Step 1: Register the user
      const registerResponse = await axios.post(
        `${import.meta.env.VITE_API_URL}/register`,
        {
          username,
          email,
          password,
          role: "student",
        }
      );

      // Step 2: Automatically log in the user
      const loginResponse = await axios.post(
        `${import.meta.env.VITE_API_URL}/login`,
        {
          username,
          password,
        }
      );

      // Step 3: Clear and save the new token and role to local storage
      localStorage.removeItem("token"); // Clear any old token
      localStorage.removeItem("role"); // Clear any old role
      localStorage.removeItem("name"); // Clear any old password
      localStorage.setItem("token", loginResponse.data.token);
      localStorage.setItem("role", loginResponse.data.role);
      localStorage.setItem("name", loginResponse.data.name);

      // Debug: Log the new token to verify
      console.log("New token saved to localStorage:", loginResponse.data.token);

      // Decode the token to verify name is included
      const decodedToken: JwtPayload = jwtDecode(loginResponse.data.token);
      console.log("Decoded token:", decodedToken); // Should show { id, role, name }

      setSuccess("Registration and login successful! Redirecting...");
      setError("");
      setTimeout(() => {
        navigate("/dashboard");
        if (onSuccess) onSuccess(); // Close the modal
      }, 1000);
    } catch (err: any) {
      console.error("Registration or login error:", err);
      setError(err.response?.data?.error || "Registration failed");
      setSuccess("");
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-white text-center mb-6">
        Sign Up
      </h2>
      <form onSubmit={handleSignUp} className="space-y-4">
        <div>
          <label
            htmlFor="username"
            className="block text-sm font-medium text-gray-300 mb-2"
          >
            Username
          </label>
          <input
            id="username"
            type="text"
            placeholder="Enter your username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full p-3 bg-gray-700 text-white border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-400"
            required
          />
        </div>
        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium text-gray-300 mb-2"
          >
            Email
          </label>
          <input
            id="email"
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-3 bg-gray-700 text-white border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-400"
            required
          />
        </div>
        <div>
          <label
            htmlFor="password"
            className="block text-sm font-medium text-gray-300 mb-2"
          >
            Password
          </label>
          <input
            id="password"
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-3 bg-gray-700 text-white border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-400"
            required
          />
        </div>
        <button
          type="submit"
          className="w-full p-3 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 transition-colors duration-200"
        >
          Sign Up
        </button>
      </form>
      {error && (
        <p className="mt-4 text-center text-red-500 bg-red-100 p-2 rounded-md border border-red-400">
          {error}
        </p>
      )}
      {success && (
        <p className="mt-4 text-center text-green-500 bg-green-100 p-2 rounded-md border border-green-400">
          {success}
        </p>
      )}
    </div>
  );
};

export default SignUp;
