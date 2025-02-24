import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import axios from "axios";
import { Button } from "../ui/button";
import {
  Table,
  TableHead,
  TableHeader,
  TableRow,
  TableCell,
  TableBody,
} from "../ui/table";
import { Card, CardHeader, CardTitle, CardContent } from "../ui/card";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

interface User {
  _id: string;
  username: string;
  email: string;
  role: string;
}

interface DecodedToken {
  id: string;
  role: string;
  exp: number;
}

export default function UserList() {
  const navigate = useNavigate();
  const dispatch = useDispatch(); // Note: Not used currently, kept for consistency
  const [users, setUsers] = useState<User[]>([]);
  const [error, setError] = useState("");
  const [token, setToken] = useState(localStorage.getItem("token"));

  useEffect(() => {
    const handleStorageChange = () => {
      const newToken = localStorage.getItem("token");
      setToken(newToken);
    };
    window.addEventListener("storage", handleStorageChange);
    handleStorageChange();
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  const decodedToken = token ? jwtDecode<DecodedToken>(token) : null;
  const userRole = decodedToken?.role || "";

  useEffect(() => {
    if (userRole !== "admin" || !token) return;

    const fetchUsers = async () => {
      try {
        const response = await axios.get("http://localhost:5000/users", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUsers(response.data);
      } catch (err: any) {
        setError(err.response?.data?.message || "Failed to fetch users");
      }
    };
    fetchUsers();
  }, [token, userRole]);

  if (!token || userRole !== "admin") {
    return <div className="p-6 text-center">Admin access required.</div>;
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle>Users</CardTitle>
        </CardHeader>
        <CardContent>
          {error && (
            <p className="text-center text-red-500 bg-red-100 p-2 rounded-md border border-red-400 mb-4">
              {error}
            </p>
          )}
          <Table>
            <TableHead>
              <TableRow>
                <TableHeader>Username</TableHeader>
                <TableHeader>Email</TableHeader>
                <TableHeader>Role</TableHeader>
                <TableHeader>Actions</TableHeader>
              </TableRow>
            </TableHead>
            <TableBody>
              {users.map((user) => {
                // Determine row background color based on role
                const rowColor =
                  user.role === "instructor"
                    ? "bg-yellow-100"
                    : user.role === "admin"
                    ? "bg-red-100"
                    : user.role === "student"
                    ? "bg-green-100"
                    : "bg-white";

                return (
                  <TableRow key={user._id} className={rowColor}>
                    <TableCell>{user.username}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{user.role}</TableCell>
                    <TableCell>
                      <Button
                        className="bg-blue-600 hover:bg-blue-700 text-white"
                        onClick={() => navigate(`/users/${user._id}`)}
                      >
                        Details
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
