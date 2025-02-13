import SiteEntry from "./components/SiteEntry";
import LandingPage from "./components/AllSites";
import UpdateSite from "./components/UpdateSite";
import { createBrowserRouter } from "react-router-dom";
import CourseEntry from "./components/Courses/CourseEntry";
import CourseList from "./components/Courses/CourseList";
import UpdateCourse from "./components/Courses/UpdateCourse";
import Navbar from "./components/Navigation/Navbar";

export const router = createBrowserRouter([
  {
    element: <Navbar />,
    children: [
      {
        path: "/",
        element: <LandingPage />,
      },
      {
        path: "/CreateSite",
        element: <SiteEntry />,
      },
      {
        path: "/Update/:siteId",
        element: <UpdateSite />,
      },
      {
        path: "/Courses/Create",
        element: <CourseEntry />,
      },
      {
        path: "/Courses",
        element: <CourseList />,
      },
      {
        path: "/Courses/Update/:courseId",
        element: <UpdateCourse />,
      },
    ],
  },
]);
