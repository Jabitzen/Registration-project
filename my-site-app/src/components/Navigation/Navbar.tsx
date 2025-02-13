import { Menu, User } from "lucide-react";
import { Dialog, DialogContent, DialogTrigger } from "../ui/dialogue";
import { Link } from "react-router-dom";
import { Outlet } from "react-router-dom"; // Import the Outlet component

export default function Navbar() {
  return (
    <div>
      <nav className="flex items-center justify-between p-4 bg-gray-900 text-white">
        {/* Hamburger Menu (Opens Sidebar) */}
        <Dialog>
          <DialogTrigger>
            <Menu size={24} />
          </DialogTrigger>
          <DialogContent>
            <ul className="mt-10 space-y-4">
              <li>
                <Link
                  to="/courses"
                  className="block p-2 text-lg font-semibold hover:bg-gray-200 rounded"
                >
                  List Courses
                </Link>
              </li>
              <li>
                <Link
                  to="/courses/create"
                  className="block p-2 text-lg font-semibold hover:bg-gray-200 rounded"
                >
                  Create Course
                </Link>
              </li>
              <li>
                <Link
                  to="/"
                  className="block p-2 text-lg font-semibold hover:bg-gray-200 rounded"
                >
                  List Sites
                </Link>
              </li>
              <li>
                <Link
                  to="/createSite"
                  className="block p-2 text-lg font-semibold hover:bg-gray-200 rounded"
                >
                  Create Site
                </Link>
              </li>
            </ul>
          </DialogContent>
        </Dialog>

        {/* Title */}
        <h1 className="text-xl font-bold">Relativity</h1>

        {/* Profile Icon */}
        <button className="p-2">
          <User size={24} />
        </button>
      </nav>

      {/* The Outlet is where child routes will be rendered */}
      <div className="p-4">
        <Outlet />
      </div>
    </div>
  );
}
