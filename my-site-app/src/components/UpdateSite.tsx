import { useState, ChangeEvent, FormEvent, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { Input } from "../components/ui/input";
import { Textarea } from "../components/ui/textarea";
import { Button } from "../components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Label } from "../components/ui/label";

interface Site {
  _id: string;
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

export default function UpdateSite() {
  const { siteId } = useParams();
  const [site, setSite] = useState<Site | null>(null); // Start as null to avoid empty states
  const [loading, setLoading] = useState<boolean>(true);
  const [message, setMessage] = useState<string>("");

  // Fetch site data
  useEffect(() => {
    if (!siteId) return;

    setLoading(true);
    axios
      .get(`http://localhost:5000/sites/${siteId}`)
      .then((response) => {
        // Check if response is an array and has at least one element
        if (Array.isArray(response.data) && response.data.length > 0) {
          setSite(response.data[0]); // Set the first object from the array
        } else {
          console.error("API returned an empty array!");
        }
      })
      .catch((error) => {
        console.error("Error fetching site:", error);
        setMessage("Failed to load site details.");
      })
      .finally(() => setLoading(false));
  }, [siteId]);

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    if (site) {
      setSite({ ...site, [e.target.name]: e.target.value });
    }
  };

  const handleUpdate = async (e: FormEvent) => {
    e.preventDefault();
    if (!site) return;

    try {
      await axios.put(`http://localhost:5000/sites/${siteId}`, site);
      setMessage("Site updated successfully!");
    } catch (error) {
      console.error("Error updating site:", error);
      setMessage("Failed to update site.");
    }
  };

  if (loading) return <p>Loading site details...</p>;
  if (!site) return <p>No site found.</p>;

  return (
    <div className="max-w-4xl mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle>Update Site</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleUpdate}>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Site ID</Label>
                <Input
                  name="SiteID"
                  value={site.SiteID || ""}
                  onChange={handleChange}
                />
              </div>
              <div>
                <Label>Parent Name</Label>
                <Input
                  name="ParentName"
                  value={site.ParentName || ""}
                  onChange={handleChange}
                />
              </div>
              <div>
                <Label>Building/Site Name</Label>
                <Input
                  name="BuildingSiteName"
                  value={site.BuildingSiteName || ""}
                  onChange={handleChange}
                />
              </div>
              <div>
                <Label>Site Type</Label>
                <Input
                  name="SiteType"
                  value={site.SiteType || ""}
                  onChange={handleChange}
                />
              </div>
              <div>
                <Label>Capacity</Label>
                <Input
                  name="Capacity"
                  type="number"
                  value={site.Capacity || ""}
                  onChange={handleChange}
                />
              </div>
              <div>
                <Label>Full Street Address</Label>
                <Input
                  name="FullStreetAddress"
                  value={site.FullStreetAddress || ""}
                  onChange={handleChange}
                />
              </div>
              <div>
                <Label>City</Label>
                <Input
                  name="City"
                  value={site.City || ""}
                  onChange={handleChange}
                />
              </div>
              <div>
                <Label>State</Label>
                <Input
                  name="State"
                  value={site.State || ""}
                  onChange={handleChange}
                />
              </div>
              <div>
                <Label>Post Code</Label>
                <Input
                  name="PostCode"
                  value={site.PostCode || ""}
                  onChange={handleChange}
                />
              </div>
              <div className="col-span-2">
                <Label>Directions</Label>
                <Textarea
                  name="Directions"
                  value={site.Directions || ""}
                  onChange={handleChange}
                />
              </div>
              <div className="col-span-2">
                <Label>Description</Label>
                <Textarea
                  name="Description"
                  value={site.Description || ""}
                  onChange={handleChange}
                />
              </div>
              <div className="col-span-2">
                <Label>Special Instructions</Label>
                <Textarea
                  name="SpecialInstructions"
                  value={site.SpecialInstructions || ""}
                  onChange={handleChange}
                />
              </div>
              <div>
                <Label>Signature URL</Label>
                <Input
                  name="SignatureURL"
                  value={site.SignatureURL || ""}
                  onChange={handleChange}
                />
              </div>
              <div>
                <Label>Image URL</Label>
                <Input
                  name="ImageURL"
                  value={site.ImageURL || ""}
                  onChange={handleChange}
                />
              </div>
            </div>

            <Button className="mt-4 w-full">Update Site</Button>
          </form>
          {message && (
            <p className="mt-2 text-center text-green-600">{message}</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
