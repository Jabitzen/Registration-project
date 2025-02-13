import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface Course {
  _id?: string;
  CourseID: String;
  Title: String;
  Description: String;
  Prerequisites: [String];
  InstructorAssignments: [String];
  FacilityUsage: String;
  ConsumablesUsage: String;
  ClassName: String;
  Location: String;
  Capacity: String;
  BringList: String;
  Credits: String;
  Certificates: [String];
  Status: String;
  Duration: String;
  DateFrom: Date;
  DateTo: Date;
  Repeats: Boolean;
  Until: Date;
  NumberOfTimes: String;
  TimeFrom: String;
  TimeTo: String;
  TotalRegistered: String;
  TotalAttended: String;
  InventoryItemUsed: String;
  Amount: String;
  InstructorPayment: String;
  InstructorTravel: String;
  FacilityCostAssignment: String;
  TotalClassRevenue: String;
  TotalClassCost: String;
  TotalClassGrossProfit: String;
  PostToStateCLEE: Boolean;
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
  },
});

export const { setCourses, addCourse, removeCourse } = coursesSlice.actions;
export default coursesSlice.reducer;
