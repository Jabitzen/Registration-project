import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState, AppDispatch } from "../../store/store";
import { setCourses, removeCourse } from "../../store/coursesSlice";
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

export default function CourseList() {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const courses = useSelector((state: RootState) => state.courses.courses);

  useEffect(() => {
    axios
      .get("http://localhost:5000/courses")
      .then((response) => dispatch(setCourses(response.data)))
      .catch((error) => console.error("Error fetching courses:", error));
  }, [dispatch]);

  const handleDelete = async (id: string) => {
    try {
      await axios.delete(`http://localhost:5000/courses/${id}`);
      dispatch(removeCourse(id));
    } catch (error) {
      console.error("Error deleting course:", error);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle>Courses</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHead>
              <TableRow>
                <TableHeader>Instructor</TableHeader>
                <TableHeader>Title</TableHeader>
                <TableHeader>Status</TableHeader>
                <TableHeader>Range</TableHeader>
                <TableHeader>Course ID</TableHeader>
                <TableHeader>Actions</TableHeader>
              </TableRow>
            </TableHead>
            <TableBody>
              {courses.map((course) => (
                <TableRow key={course._id}>
                  <TableCell>{course.InstructorAssignments[0]}</TableCell>
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
                    <div className="flex justify-center gap-5">
                      <Button
                        className="bg-blue-600 hover:bg-blue-700 text-white"
                        onClick={() => navigate(`Update/${course.CourseID}`)} // Navigate to the update page
                      >
                        Update Course
                      </Button>
                      <Button
                        className="bg-red-600 hover:bg-red-700 text-white"
                        onClick={() => handleDelete(course._id!)}
                      >
                        Delete
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
