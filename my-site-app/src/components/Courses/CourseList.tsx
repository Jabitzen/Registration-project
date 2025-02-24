import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState, AppDispatch } from "../../store/store";
import {
  setCourses,
  removeCourse,
  updateCourse,
} from "../../store/coursesSlice";
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
import { format } from "date-fns";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

interface Course {
  _id?: string;
  CourseID: string;
  Title: string;
  Description: string;
  Prerequisites: string[];
  InstructorAssignments: string[];
  FacilityUsage: string;
  ConsumablesUsage: string;
  ClassName: string;
  Location: string;
  Capacity: string;
  BringList: string;
  Credits: string;
  Certificates: string[];
  Status: string;
  Duration: string;
  DateFrom: Date | string;
  DateTo: Date | string;
  Repeats: boolean;
  Until: Date | string;
  NumberOfTimes: string;
  TimeFrom: string;
  TimeTo: string;
  TotalRegistered: string;
  RegisteredUsers: string[];
  TotalAttended: string;
  InventoryItemUsed: string;
  Amount: string;
  InstructorPayment: string;
  InstructorTravel: string;
  FacilityCostAssignment: string;
  TotalClassRevenue: string;
  TotalClassCost: string;
  TotalClassGrossProfit: string;
  PostToStateCLEE: boolean;
}

interface DecodedToken {
  id: string;
  role: string;
  exp: number;
}

export default function CourseList() {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const courses = useSelector((state: RootState) => state.courses.courses);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loadingCourseId, setLoadingCourseId] = useState<string | null>(null);
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

  useEffect(() => {
    axios
      .get("http://localhost:5000/courses")
      .then((response) => dispatch(setCourses(response.data)))
      .catch((error) => console.error("Error fetching courses:", error));
  }, [dispatch]);

  const isLoggedIn = !!token;
  const decodedToken = token ? jwtDecode<DecodedToken>(token) : null;
  const userId = decodedToken?.id || "";
  const userRole = decodedToken?.role || "";

  const handleDelete = async (id: string) => {
    try {
      await axios.delete(`http://localhost:5000/courses/${id}`);
      dispatch(removeCourse(id));
    } catch (error) {
      console.error("Error deleting course:", error);
    }
  };

  const handleRegister = async (course: Course) => {
    if (!isLoggedIn || !token) {
      setError("Please log in to register for a course");
      setTimeout(() => navigate("/"), 2000);
      return;
    }

    const decoded = jwtDecode<{ exp: number }>(token);
    if (decoded.exp * 1000 < Date.now()) {
      setError("Your session has expired. Please log in again.");
      localStorage.removeItem("token");
      setToken(null);
      setTimeout(() => navigate("/"), 2000);
      return;
    }

    setLoadingCourseId(course._id!);
    setError("");
    setSuccess("");

    console.log("Token being sent:", token);
    console.log("Headers:", { Authorization: `Bearer ${token}` });

    try {
      const response = await axios.post(
        `http://localhost:5000/courses/${course._id}/register`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const updatedCourse: Course = {
        ...course,
        RegisteredUsers: [...course.RegisteredUsers, userId],
        TotalRegistered: (parseInt(course.TotalRegistered) + 1).toString(),
      };
      dispatch(updateCourse(updatedCourse));

      setSuccess(response.data.message);
      setTimeout(() => setSuccess(""), 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to register");
      console.error("Registration error:", err.response?.data);
      setTimeout(() => setError(""), 3000);
    } finally {
      setLoadingCourseId(null);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle>Courses</CardTitle>
        </CardHeader>
        <CardContent>
          {error && (
            <p className="text-center text-red-500 bg-red-100 p-2 rounded-md border border-red-400 mb-4">
              {error}
            </p>
          )}
          {success && (
            <p className="text-center text-green-500 bg-green-100 p-2 rounded-md border border-green-400 mb-4">
              {success}
            </p>
          )}
          <Table>
            <TableHead>
              <TableRow>
                <TableHeader>Instructor</TableHeader>
                <TableHeader>Title</TableHeader>
                <TableHeader>Status</TableHeader>
                <TableHeader>Range</TableHeader>
                <TableHeader>Course ID</TableHeader>
                <TableHeader>Capacity</TableHeader>
                <TableHeader>Actions</TableHeader>
              </TableRow>
            </TableHead>
            <TableBody>
              {courses.map((course) => {
                const isFull =
                  parseInt(course.TotalRegistered) >= parseInt(course.Capacity);
                const isRegistered = course.RegisteredUsers.includes(userId);

                return (
                  <TableRow key={course._id}>
                    <TableCell>
                      {course.InstructorAssignments[0] || "N/A"}
                    </TableCell>
                    <TableCell>{course.Title}</TableCell>
                    <TableCell>{course.Status}</TableCell>
                    <TableCell>
                      {course.DateFrom && course.DateTo
                        ? `${format(
                            new Date(course.DateFrom),
                            "yyyy-MM-dd"
                          )} - ${format(new Date(course.DateTo), "yyyy-MM-dd")}`
                        : "N/A"}
                    </TableCell>
                    <TableCell>{course.CourseID}</TableCell>
                    <TableCell>
                      {course.TotalRegistered}/{course.Capacity}
                    </TableCell>
                    <TableCell>
                      <div className="flex justify-center gap-2">
                        {userRole === "admin" && (
                          <>
                            <Button
                              className="bg-blue-600 hover:bg-blue-700 text-white"
                              onClick={() =>
                                navigate(`Update/${course.CourseID}`)
                              }
                            >
                              Update
                            </Button>
                            <Button
                              className="bg-red-600 hover:bg-blue-700 text-white"
                              onClick={() => handleDelete(course._id!)}
                            >
                              Delete
                            </Button>
                          </>
                        )}
                        {isLoggedIn && (
                          <Button
                            onClick={() =>
                              !isRegistered && handleRegister(course)
                            } // Only trigger if not registered
                            disabled={
                              loadingCourseId === course._id ||
                              (isFull && !isRegistered)
                            }
                            className={`${
                              loadingCourseId === course._id
                                ? "bg-blue-400"
                                : isFull && !isRegistered
                                ? "bg-gray-600"
                                : isRegistered
                                ? "bg-green-600"
                                : "bg-blue-600 hover:bg-blue-700"
                            }`}
                          >
                            {loadingCourseId === course._id
                              ? "Registering..."
                              : isRegistered
                              ? "Registered"
                              : isFull
                              ? "Full"
                              : "Register"}
                          </Button>
                        )}
                      </div>
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
