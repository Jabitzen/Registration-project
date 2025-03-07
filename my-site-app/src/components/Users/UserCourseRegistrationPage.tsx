import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Input } from "../../components/ui/input";
import { Button } from "../../components/ui/button";
import { Label } from "../../components/ui/label"; // Updated to use your custom Label
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import { Dialog, DialogContent } from "../../components/ui/dialog"; // Using only Dialog and DialogContent
import { jwtDecode } from "jwt-decode"; // For decoding JWT tokens

interface User {
  _id: string;
  username: string;
  email: string;
  role: string;
}

interface Course {
  _id: string;
  CourseID: string;
  Title: string;
  RegisteredUsers: string[];
  Capacity: string;
}

interface DecodedToken {
  id: string;
  role: string;
  exp: number;
  name: string;
}

const getToken = () => localStorage.getItem("token");

export default function UserCourseRegistrationPage() {
  const navigate = useNavigate();
  const [users, setUsers] = useState<User[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [currentUserRole, setCurrentUserRole] = useState<string | null>(null);
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);

  useEffect(() => {
    const token = getToken();
    if (!token) {
      console.warn("No token found in localStorage");
      setLoading(false);
      navigate("/login");
      return;
    }

    let decoded: DecodedToken | null = null;

    try {
      decoded = jwtDecode<DecodedToken>(token);
      console.log("Decoded token:", decoded);
      setCurrentUserId(decoded.id);
      setCurrentUserRole(decoded.role);
    } catch (error) {
      console.error("Error decoding token:", error);
      setCurrentUserRole(null);
    }

    if (!currentUserRole || currentUserRole !== "admin") {
      navigate("/");
      return;
    }

    fetchUsers();
    fetchCourses();
  }, [navigate]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const token = getToken();
      const response = await axios.get("http://localhost:5000/users", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers(response.data);
    } catch (error: any) {
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const token = getToken();
      const response = await axios.get("http://localhost:5000/courses", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCourses(
        response.data.map((course: any) => ({
          _id: course._id,
          CourseID: course.CourseID,
          Title: course.Title,
          RegisteredUsers: course.RegisteredUsers || [],
          Capacity: course.Capacity || "0",
        }))
      );
    } catch (error: any) {
      console.error("Error fetching courses:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleUserSelect = (userId: string, checked: boolean) => {
    setSelectedUsers((prev) =>
      checked ? [...prev, userId] : prev.filter((id) => id !== userId)
    );
  };

  const handleCourseChange = (value: string) => {
    setSelectedCourse(value);
  };

  const handleRegisterUsers = async () => {
    if (!selectedCourse || selectedUsers.length === 0) {
      alert("Please select a course and at least one user.");
      return;
    }

    if (currentUserRole !== "admin") {
      alert("Only admins can register users for courses.");
      return;
    }

    setIsConfirmDialogOpen(true);
  };

  const handleConfirmRegistration = async () => {
    const token = getToken();
    if (!token) {
      setLoading(false);
      navigate("/login");
      return;
    }

    try {
      const course = courses.find((c) => c._id === selectedCourse);
      if (!course) throw new Error("Course not found.");

      const courseResponse = await axios.get(
        `http://localhost:5000/courses/${selectedCourse}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const registeredUsers = courseResponse.data.RegisteredUsers || [];

      const usersToRegister = selectedUsers.filter(
        (userId) => !registeredUsers.includes(userId)
      );

      if (usersToRegister.length === 0) {
        alert("All selected users are already registered for this course.");
        setIsConfirmDialogOpen(false);
        return;
      }

      const capacity = parseInt(course.Capacity, 10) || 0;
      const currentRegistrations = registeredUsers.length;
      if (
        capacity > 0 &&
        currentRegistrations + usersToRegister.length > capacity
      ) {
        alert("Cannot register users: Course capacity exceeded.");
        setIsConfirmDialogOpen(false);
        return;
      }

      for (const userId of usersToRegister) {
        await axios.post(
          `http://localhost:5000/courses/${selectedCourse}/register`,
          { userId },
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
      }

      console.log("Users registered successfully for course:", selectedCourse);
      alert(
        `Successfully registered ${usersToRegister.length} user(s) for ${course.Title}!`
      );
      setSelectedUsers([]);
      setIsConfirmDialogOpen(false);
    } catch (error: any) {
      console.error("Error registering users:", error);
      alert(
        error.response?.data?.message ||
          "Failed to register users. Please check your input or server status."
      );
    }
  };

  if (loading) {
    return <div className="p-6 text-center">Loading...</div>;
  }

  if (!currentUserRole || currentUserRole !== "admin") {
    return <div className="p-6 text-center">Admin access required.</div>;
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">User Course Registration</h1>

      <div className="mb-6">
        <Label htmlFor="users-selection" className="text-sm">
          Select Users
        </Label>
        <div className="grid gap-4 max-h-60 overflow-y-auto">
          {users.map((user) => (
            <div key={user._id} className="flex items-center space-x-2">
              <input
                type="checkbox"
                id={user._id}
                checked={selectedUsers.includes(user._id)}
                onChange={(e) => handleUserSelect(user._id, e.target.checked)}
                className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
              />
              <Label htmlFor={user._id} className="text-sm">
                {user.username} ({user.role})
              </Label>
            </div>
          ))}
        </div>
      </div>

      <div className="mb-6">
        <Label htmlFor="course-selection" className="text-sm">
          Select Course
        </Label>
        <Select onValueChange={handleCourseChange} value={selectedCourse}>
          <SelectTrigger id="course-selection">
            <SelectValue placeholder="Select a course" />
          </SelectTrigger>
          <SelectContent>
            {courses.map((course) => (
              <SelectItem key={course._id} value={course._id}>
                {course.Title}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Button
        onClick={handleRegisterUsers}
        className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-green-500 text-white hover:bg-green-600"
      >
        Register Selected Users
      </Button>

      {/* Confirmation Dialog for Registration */}
      <Dialog open={isConfirmDialogOpen} onOpenChange={setIsConfirmDialogOpen}>
        <DialogContent className="bg-gray-800 text-white p-6 rounded-lg shadow-lg max-w-md w-full fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
          <div className="mb-4">
            <h2 className="text-lg font-semibold">Confirm Registration</h2>
          </div>
          <p className="mb-4">
            Are you sure you want to register {selectedUsers.length} user(s) for{" "}
            {courses.find((c) => c._id === selectedCourse)?.Title ||
              "the selected course"}
            ?
          </p>
          <div className="flex justify-end gap-2">
            <Button
              onClick={() => {
                console.log("Cancel registration, closing dialog");
                setIsConfirmDialogOpen(false);
              }}
              className="bg-blue-500 text-white hover:bg-blue-600"
            >
              Cancel
            </Button>
            <Button
              onClick={() => {
                console.log(
                  "Confirm registration clicked for users:",
                  selectedUsers
                );
                handleConfirmRegistration();
              }}
              className="bg-green-500 text-white hover:bg-green-600"
            >
              Confirm
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
