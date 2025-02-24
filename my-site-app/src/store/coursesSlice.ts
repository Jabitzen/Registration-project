import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface Course {
  _id?: string;
  CourseID: string; // Changed to lowercase 'string' for TypeScript convention
  Title: string;
  Description: string;
  Prerequisites: string[]; // Array syntax corrected
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
  DateFrom: Date | string; // Allow string since API might return it
  DateTo: Date | string;
  Repeats: boolean; // Changed to lowercase 'boolean'
  Until: Date | string;
  NumberOfTimes: string;
  TimeFrom: string;
  TimeTo: string;
  TotalRegistered: string;
  RegisteredUsers: string[]; // Added to match MongoDB schema
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

interface CoursesState {
  courses: Course[];
}

const initialState: CoursesState = {
  courses: [],
};

const coursesSlice = createSlice({
  name: "courses",
  initialState,
  reducers: {
    setCourses: (state, action: PayloadAction<Course[]>) => {
      state.courses = action.payload;
    },
    addCourse: (state, action: PayloadAction<Course>) => {
      state.courses.push(action.payload);
    },
    removeCourse: (state, action: PayloadAction<string>) => {
      state.courses = state.courses.filter(
        (course) => course._id !== action.payload
      );
    },
    updateCourse: (state, action: PayloadAction<Course>) => {
      const index = state.courses.findIndex(
        (course) => course._id === action.payload._id
      );
      if (index !== -1) {
        state.courses[index] = action.payload;
      }
    },
  },
});

export const { setCourses, addCourse, removeCourse, updateCourse } =
  coursesSlice.actions;
export default coursesSlice.reducer;
