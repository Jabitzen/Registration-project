import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { RootState, AppDispatch } from "../store/store";
import { setSitesRedux, removeSite } from "../store/sitesSlice"; // Updated import
import axios from "axios";
import { Button } from "../components/ui/button";
import { Label } from "../components/ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

interface Site {
  _id?: string;
  SiteID: string;
  ParentName: string;
  BuildingSiteName: string;
  SiteType: string;
  Capacity: string;
  FullStreetAddress: string;
  SubAddress: string;
  City: string;
  State: string;
  PostCode: string;
  Directions: string;
  Description: string;
  SpecialInstructions: string;
  RentalRequirements: string;
  SignatureURL: string;
  ImageURL: string;
}

interface DecodedToken {
  id: string;
  role: string;
  exp: number;
}

export default function AllSites() {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const reduxSites = useSelector((state: RootState) => state.sites.sites);
  const [sites, setSites] = useState<Site[]>([]);
  const [message, setMessage] = useState<string>("");
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

  const decodedToken = token ? jwtDecode<DecodedToken>(token) : null;
  const userRole = decodedToken?.role || "";

  useEffect(() => {
    axios
      .get("http://localhost:5000/sites")
      .then((response) => {
        setSites(response.data);
        dispatch(setSitesRedux(response.data));
      })
      .catch((error) => {
        console.error("Error fetching sites:", error);
        setMessage("Failed to fetch sites.");
      });
  }, [dispatch]);

  const handleDelete = async (siteId: string) => {
    try {
      await axios.delete(`http://localhost:5000/sites/${siteId}`);
      setSites(sites.filter((site) => site._id !== siteId));
      dispatch(removeSite(siteId)); // Update Redux store
      setMessage("Site deleted successfully!");
    } catch (error) {
      console.error("Error deleting site:", error);
      setMessage("Failed to delete site.");
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      {message && <p className="text-center text-red-600">{message}</p>}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sites.map((site) => (
          <Card
            key={site._id}
            className="bg-white shadow-md hover:shadow-lg transition"
          >
            <CardHeader>
              <CardTitle>{site.BuildingSiteName}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col justify-between h-full">
                <div className="space-y-4">
                  <div>
                    <Label>Site ID</Label>
                    <p>{site.SiteID}</p>
                  </div>
                  <div>
                    <Label>Parent Name</Label>
                    <p>{site.ParentName}</p>
                  </div>
                  <div>
                    <Label>Site Type</Label>
                    <p>{site.SiteType}</p>
                  </div>
                  <div>
                    <Label>Capacity</Label>
                    <p>{site.Capacity}</p>
                  </div>
                  <div>
                    <Label>Address</Label>
                    <p>{site.FullStreetAddress}</p>
                    {site.SubAddress && <p>{site.SubAddress}</p>}
                    <p>{`${site.City}, ${site.State} ${site.PostCode}`}</p>
                  </div>
                  <div>
                    <Label>Directions</Label>
                    <p>{site.Directions}</p>
                  </div>
                  <div>
                    <Label>Description</Label>
                    <p>{site.Description}</p>
                  </div>
                  <div>
                    <Label>Special Instructions</Label>
                    <p>{site.SpecialInstructions}</p>
                  </div>
                  <div>
                    <Label>Rental Requirements</Label>
                    <p>{site.RentalRequirements}</p>
                  </div>
                  <div>
                    <Label>Signature URL</Label>
                    <p>{site.SignatureURL}</p>
                  </div>
                  <div>
                    <Label>Image URL</Label>
                    <p>{site.ImageURL}</p>
                  </div>
                </div>

                <div className="flex justify-between mt-4 gap-2">
                  {userRole === "admin" && (
                    <>
                      <Button
                        className="flex-1 bg-blue-500 border-transparent border-2 hover:bg-white hover:border-blue-500 hover:text-blue-500"
                        onClick={() => navigate(`/sites/${site._id}`)}
                      >
                        Details
                      </Button>
                      <Button
                        className="flex-1 bg-blue-500 border-transparent border-2 hover:bg-white hover:border-blue-500 hover:text-blue-500"
                        onClick={() => navigate(`Update/${site._id}`)}
                      >
                        Update Site
                      </Button>
                      <Button
                        className="flex-1 bg-red-500 border-transparent border-2 hover:bg-white hover:border-red-500 hover:text-red-500"
                        onClick={() => handleDelete(site._id!)}
                      >
                        Delete Site
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
