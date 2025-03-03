import SiteEntry from "./components/SiteEntry";
import LandingPage from "./components/AllSites";
import UpdateSite from "./components/UpdateSite";
import CourseEntry from "./components/Courses/CourseEntry";
import CourseList from "./components/Courses/CourseList";
import UpdateCourse from "./components/Courses/UpdateCourse";
import Navbar from "./components/Navigation/Navbar";
import Dashboard from "./components/Dashboard";
import { createBrowserRouter } from "react-router-dom";
import UserList from "./components/Users/UserList";
import UserDetails from "./components/Users/UserDetails";
import SiteDetails from "./components/SiteDetails";
import CalendarPage from "./components/Calendar/CalendarPage";

export const router = createBrowserRouter([
  {
    element: <Navbar />,
    children: [
      { path: "/", element: <LandingPage /> },
      { path: "/dashboard", element: <Dashboard /> },
      { path: "/CreateSite", element: <SiteEntry /> },
      { path: "/sites/:siteId", element: <SiteDetails /> },
      { path: "/Update/:siteId", element: <UpdateSite /> },
      { path: "/Courses/Create", element: <CourseEntry /> },
      { path: "/Courses", element: <CourseList /> },
      { path: "/Courses/Update/:courseId", element: <UpdateCourse /> },
      { path: "/users", element: <UserList /> },
      { path: "/users/:userId", element: <UserDetails /> },
      { path: "/calendar/:siteId", element: <CalendarPage /> },
    ],
  },
]);
