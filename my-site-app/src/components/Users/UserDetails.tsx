import { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import { Card, CardHeader, CardTitle, CardContent } from "../ui/card";
import { format } from "date-fns";
import {
  Table,
  TableHead,
  TableHeader,
  TableRow,
  TableCell,
  TableBody,
} from "../ui/table";

interface User {
  _id: string;
  username: string;
  email: string;
  role: string;
}

interface Course {
  _id: string;
  Title: string;
  CourseID: string;
  DateFrom: string | Date;
  DateTo: string | Date;
  Status: string;
}

interface DecodedToken {
  id: string;
  role: string;
  exp: number;
}

export default function UserDetails() {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [courses, setCourses] = useState<Course[]>([]);
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
    if (userRole !== "admin" || !token || !userId) return;

    const fetchUserDetails = async () => {
      try {
        const response = await axios.get(
          `http://localhost:5000/users/${userId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setUser(response.data.user);
        setCourses(response.data.registeredCourses);
      } catch (err: any) {
        setError(err.response?.data?.message || "Failed to fetch user details");
      }
    };
    fetchUserDetails();
  }, [token, userRole, userId]);

  if (!token || userRole !== "admin") {
    return <div className="p-6 text-center">Admin access required.</div>;
  }

  if (!user) {
    return <div className="p-6 text-center">Loading...</div>;
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle>User Details: {user.username}</CardTitle>
        </CardHeader>
        <CardContent>
          {error && (
            <p className="text-center text-red-500 bg-red-100 p-2 rounded-md border border-red-400 mb-4">
              {error}
            </p>
          )}
          <div className="mb-6">
            <p>
              <strong>Username:</strong> {user.username}
            </p>
            <p>
              <strong>Email:</strong> {user.email}
            </p>
            <p>
              <strong>Role:</strong> {user.role}
            </p>
          </div>
          <h2 className="text-xl font-bold mb-4">Registered Courses</h2>
          {courses.length === 0 ? (
            <p>No registered courses.</p>
          ) : (
            <Table>
              <TableHead>
                <TableRow>
                  <TableHeader>Title</TableHeader>
                  <TableHeader>Course ID</TableHeader>
                  <TableHeader>Date Range</TableHeader>
                  <TableHeader>Status</TableHeader>
                </TableRow>
              </TableHead>
              <TableBody>
                {courses.map((course) => (
                  <TableRow key={course._id}>
                    <TableCell>{course.Title}</TableCell>
                    <TableCell>{course.CourseID}</TableCell>
                    <TableCell>
                      {course.DateFrom && course.DateTo
                        ? `${format(
                            new Date(course.DateFrom),
                            "yyyy-MM-dd"
                          )} - ${format(new Date(course.DateTo), "yyyy-MM-dd")}`
                        : "N/A"}
                    </TableCell>
                    <TableCell>{course.Status}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
