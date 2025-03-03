import { Menu, User, LogOut } from "lucide-react";
import { Dialog, DialogContent, DialogTrigger } from "../ui/dialog";
import { Link, useNavigate } from "react-router-dom";
import { Outlet } from "react-router-dom";
import { useState, useEffect } from "react";
import Login from "../Login";
import SignUp from "../SignUp";
import { jwtDecode } from "jwt-decode";

interface DecodedToken {
  id: string;
  role: string;
  exp: number;
}

export default function Navbar() {
  const navigate = useNavigate();
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [activeForm, setActiveForm] = useState<"login" | "signup">("login");
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  useEffect(() => {
    const handleStorageChange = () => {
      const newToken = localStorage.getItem("token");
      setToken(newToken);
    };
    window.addEventListener("storage", handleStorageChange);
    handleStorageChange();
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  const isLoggedIn = !!token;
  const decodedToken = token ? jwtDecode<DecodedToken>(token) : null;
  const userRole = decodedToken?.role || "";

  const handleLogout = () => {
    localStorage.clear();
    setToken(null);
    navigate("/");
    setIsProfileModalOpen(false);
  };

  const handleAuthSuccess = () => {
    setToken(localStorage.getItem("token"));
    setIsProfileModalOpen(false);
  };

  return (
    <div>
      <nav className="flex items-center justify-between p-4 bg-gray-900 text-white">
        {/* Hamburger Menu - Slide-in Sidebar */}
        <Dialog>
          <DialogTrigger>
            <Menu size={24} />
          </DialogTrigger>
          <DialogContent className="fixed left-0 top-0 h-full w-64 transform translate-x-0 transition-transform duration-300 ease-in-out data-[state=closed]:-translate-x-full">
            <ul className="mt-12 space-y-4">
              <li>
                <Link
                  to="/"
                  className="block p-2 text-lg font-semibold hover:bg-gray-700 rounded"
                >
                  List Sites
                </Link>
              </li>
              <li>
                <Link
                  to="/courses"
                  className="block p-2 text-lg font-semibold hover:bg-gray-700 rounded"
                >
                  List Courses
                </Link>
              </li>
              {isLoggedIn &&
                (userRole === "admin" || userRole === "instructor") && (
                  <>
                    <li>
                      <Link
                        to="/courses/create"
                        className="block p-2 text-lg font-semibold hover:bg-gray-700 rounded"
                      >
                        Create Course
                      </Link>
                    </li>
                    {userRole === "admin" && (
                      <>
                        <li>
                          <Link
                            to="/createSite"
                            className="block p-2 text-lg font-semibold hover:bg-gray-700 rounded"
                          >
                            Create Site
                          </Link>
                        </li>
                        <li>
                          <Link
                            to="/users"
                            className="block p-2 text-lg font-semibold hover:bg-gray-700 rounded"
                          >
                            Users
                          </Link>
                        </li>
                      </>
                    )}
                  </>
                )}
            </ul>
          </DialogContent>
        </Dialog>

        {/* Title */}
        <h1 className="text-xl font-bold">Relativity</h1>

        {/* Profile Icon with Login/Logout/SignUp Modal - Centered */}
        <Dialog open={isProfileModalOpen} onOpenChange={setIsProfileModalOpen}>
          <DialogTrigger>
            <button className="p-2">
              {isLoggedIn ? <LogOut size={24} /> : <User size={24} />}
            </button>
          </DialogTrigger>
          <DialogContent className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 max-w-md w-full">
            {isLoggedIn ? (
              <div className="text-center">
                <p className="text-lg font-medium text-gray-300 mb-4">
                  Are you sure you want to log out?
                </p>
                <button
                  onClick={handleLogout}
                  className="w-full p-3 bg-red-600 text-white font-semibold rounded-md hover:bg-red-700 transition-colors duration-200"
                >
                  Log Out
                </button>
              </div>
            ) : (
              <div>
                {/* Toggle between Login and Sign Up */}
                <div className="flex justify-center mb-6">
                  <button
                    onClick={() => setActiveForm("login")}
                    className={`px-4 py-2 font-semibold rounded-l-md ${
                      activeForm === "login"
                        ? "bg-blue-600 text-white"
                        : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                    }`}
                  >
                    Log In
                  </button>
                  <button
                    onClick={() => setActiveForm("signup")}
                    className={`px-4 py-2 font-semibold rounded-r-md ${
                      activeForm === "signup"
                        ? "bg-blue-600 text-white"
                        : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                    }`}
                  >
                    Sign Up
                  </button>
                </div>

                {/* Render Login or Sign Up Form */}
                {activeForm === "login" ? (
                  <Login onSuccess={handleAuthSuccess} />
                ) : (
                  <SignUp onSuccess={handleAuthSuccess} />
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>
      </nav>

      <div className="p-4">
        <Outlet />
      </div>
    </div>
  );
}
