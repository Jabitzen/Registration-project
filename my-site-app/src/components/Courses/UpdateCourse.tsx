import { useState, ChangeEvent, FormEvent, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Label } from "../ui/label";
import { format } from "date-fns";

interface Course {
  _id?: string; // MongoDB _id field is optional
  CourseID: string;
  Title: string;
  Description: string;
  Prerequisites: string[]; // Array of strings
  InstructorAssignments: string[]; // Array of instructor IDs or names
  FacilityUsage: string;
  ConsumablesUsage: string;
  ClassName: string;
  Location: string;
  Capacity: string;
  BringList: string;
  Credits: string;
  Certificates: string[]; // Array of certificate names
  Status: string;
  Duration: string;
  DateFrom: string; // Can be Date but typically stored as ISO string
  DateTo: string;
  Repeats: boolean;
  Until: string;
  NumberOfTimes: string;
  TimeFrom: string;
  TimeTo: string;
  TotalRegistered: string;
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

export default function UpdateCourse() {
  const { courseId } = useParams();
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [message, setMessage] = useState<string>("");

  useEffect(() => {
    if (!courseId) return;

    setLoading(true);
    axios
      .get(`http://localhost:5000/courses/${courseId}`)
      .then((response) => {
        if (Array.isArray(response.data) && response.data.length > 0) {
          setCourse(response.data[0]);
        } else {
          console.error("Course not found");
        }
      })
      .catch((error) => {
        console.error("Error fetching course:", error);
        setMessage("Failed to load course details.");
      })
      .finally(() => setLoading(false));
  }, [courseId]);

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    if (course) {
      setCourse({ ...course, [e.target.name]: e.target.value });
    }
  };

  const handleUpdate = async (e: FormEvent) => {
    e.preventDefault();
    if (!course) return;

    try {
      await axios.put(`http://localhost:5000/courses/${courseId}`, course);
      setMessage("Course updated successfully!");
    } catch (error) {
      console.error("Error updating course:", error);
      setMessage("Failed to update course.");
    }
  };

  if (loading) return <p>Loading course details...</p>;
  if (!course) return <p>No course found.</p>;

  return (
    <div className="max-w-4xl mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle>Update Course</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleUpdate}>
            <div className="grid grid-cols-2 gap-4">
              {/* Basic Fields */}
              <div>
                <Label>Course ID</Label>
                <Input
                  name="CourseID"
                  value={course.CourseID || ""}
                  onChange={handleChange}
                />
              </div>
              <div>
                <Label>Title</Label>
                <Input
                  name="Title"
                  value={course.Title || ""}
                  onChange={handleChange}
                />
              </div>
              <div>
                <Label>Description</Label>
                <Textarea
                  name="Description"
                  value={course.Description || ""}
                  onChange={handleChange}
                />
              </div>

              {/* Arrays (Prerequisites, Certificates, etc.) */}
              <div>
                <Label>Prerequisites</Label>
                <Textarea
                  name="Prerequisites"
                  value={course.Prerequisites.join(", ")}
                  onChange={(e) =>
                    setCourse({
                      ...course,
                      Prerequisites: e.target.value.split(", "),
                    })
                  }
                />
              </div>
              <div>
                <Label>Instructor Assignments</Label>
                <Textarea
                  name="InstructorAssignments"
                  value={course.InstructorAssignments.join(", ")}
                  onChange={(e) =>
                    setCourse({
                      ...course,
                      InstructorAssignments: e.target.value.split(", "),
                    })
                  }
                />
              </div>

              {/* Numeric Fields */}
              <div className="">
                <Label>Capacity</Label>
                <Input
                  name="Capacity"
                  type="number"
                  value={course.Capacity || ""}
                  onChange={handleChange}
                />
                <Label>Status</Label>
                <Input
                  name="Status"
                  value={course.Status || ""}
                  onChange={handleChange}
                />
              </div>
              <div>
                <Label>Credits</Label>
                <Input
                  name="Credits"
                  type="number"
                  value={course.Credits || ""}
                  onChange={handleChange}
                />
              </div>
              <div>
                <Label>Duration</Label>
                <Input
                  name="Duration"
                  type="number"
                  value={course.Duration || ""}
                  onChange={handleChange}
                />
              </div>
              <div>
                <Label>Amount</Label>
                <Input
                  name="Amount"
                  type="number"
                  value={course.Amount || ""}
                  onChange={handleChange}
                />
              </div>
              <div>
                <Label>Instructor Payment</Label>
                <Input
                  name="InstructorPayment"
                  type="number"
                  value={course.InstructorPayment || ""}
                  onChange={handleChange}
                />
              </div>
              <div>
                <Label>Instructor Travel</Label>
                <Input
                  name="InstructorTravel"
                  type="number"
                  value={course.InstructorTravel || ""}
                  onChange={handleChange}
                />
              </div>
              <div>
                <Label>Total Registered</Label>
                <Input
                  name="TotalRegistered"
                  type="number"
                  value={course.TotalRegistered || ""}
                  onChange={handleChange}
                />
              </div>

              {/* Boolean Fields */}
              <label>
                Repeats:
                <div>
                  <input
                    type="checkbox"
                    name="Repeats"
                    checked={course.Repeats}
                    onChange={(e) =>
                      setCourse({ ...course, Repeats: e.target.checked })
                    }
                  />
                </div>
              </label>

              <label>
                Post to State CLEE:
                <div>
                  <input
                    type="checkbox"
                    name="PostToStateCLEE"
                    checked={course.PostToStateCLEE}
                    onChange={(e) =>
                      setCourse({
                        ...course,
                        PostToStateCLEE: e.target.checked,
                      })
                    }
                  />
                </div>
              </label>

              {/* Dates */}
              <Label>Date From: </Label>
              <Input
                name="DateFrom"
                type="date"
                value={
                  course.DateFrom
                    ? format(new Date(course.DateFrom), "yyyy-MM-dd")
                    : ""
                }
                onChange={handleChange}
              />
              <Label>Date To: </Label>
              <Input
                name="DateTo"
                type="date"
                value={
                  course.DateTo
                    ? format(new Date(course.DateTo), "yyyy-MM-dd")
                    : ""
                }
                onChange={handleChange}
              />
              <Label>Until: </Label>
              <Input
                name="Until"
                type="date"
                value={
                  course.Until
                    ? format(new Date(course.Until), "yyyy-MM-dd")
                    : ""
                }
                onChange={handleChange}
              />
            </div>

            <Button className="mt-4 w-full">Update Course</Button>
          </form>
          {message && (
            <p className="mt-2 text-center text-green-600">{message}</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
