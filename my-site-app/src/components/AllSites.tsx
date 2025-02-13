import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "../store/store"; // Import RootState to type the selector
import { setSitesRedux } from "../store/sitesSlice"; // Import fetchSites action
import axios from "axios";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Label } from "../components/ui/label";
import { useNavigate } from "react-router-dom";

// Site interface (for type-checking)
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

export default function LandingPage() {
  const navigate = useNavigate();
  const dispatch = useDispatch(); // UseDispatch to dispatch actions to the Redux store
  const reduxState = useSelector((state: RootState) => state.sites.sites);
  const [sites, setSites] = useState<Site[]>([]); // State to store all sites
  const [message, setMessage] = useState<string>("");
  console.log(reduxState);

  // Fetch all sites when the component mounts
  useEffect(() => {
    axios
      .get("http://localhost:5000/sites") // Modify API URL to fetch all sites
      .then((response) => {
        setSites(response.data);
        dispatch(setSitesRedux(response.data));
      })
      .catch((error) => {
        console.error("Error fetching sites:", error);
        setMessage("Failed to fetch sites.");
      });
  }, []);

  // Delete site function
  const handleDelete = async (siteId: string) => {
    try {
      // Sending DELETE request to the backend
      const response = await axios.delete(
        `http://localhost:5000/sites/${siteId}`
      );
      // If the delete is successful, remove the site from the state
      setSites(sites.filter((site) => site._id !== siteId));
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
        {/* Map over the sites and display them */}
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
                    <p>
                      {site.City}, {site.State} {site.PostCode}
                    </p>
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
                    <Label>Signature URL</Label>
                    <p>{site.SignatureURL}</p>
                  </div>
                  <div>
                    <Label>Image URL</Label>
                    <p>{site.ImageURL}</p>
                  </div>
                </div>

                {/* Update and Delete buttons */}
                <div className="flex justify-between mt-4">
                  <Button
                    className="w-1/2 mr-2 bg-blue-500 border:transparent border-2 hover:bg-white hover:border-blue-500 hover:text-blue-500"
                    onClick={() => navigate(`Update/${site.SiteID}`)} // Navigate to the update page
                  >
                    Update Site
                  </Button>
                  <Button
                    className="w-1/2 bg-red-500 border:transparent border-2 hover:bg-white hover:border-red-500 hover:text-red-500"
                    onClick={() => handleDelete(site._id!)} // Trigger the delete for this site
                  >
                    Delete Site
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
