import { useState, ChangeEvent, FormEvent, useEffect } from "react";
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
  _id?: string; // MongoDB assigns an _id field
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

export default function SiteEntry() {
  const [site, setSite] = useState<Site>({
    SiteID: "",
    ParentName: "",
    BuildingSiteName: "",
    SiteType: "",
    Capacity: "",
    FullStreetAddress: "",
    SubAddress: "",
    City: "",
    State: "",
    PostCode: "",
    Directions: "",
    Description: "",
    SpecialInstructions: "",
    RentalRequirements: "",
    SignatureURL: "",
    ImageURL: "",
  });

  const [message, setMessage] = useState<string>("");

  // Fetch an existing site (Modify the API URL as needed)
  useEffect(() => {
    axios
      .get("http://localhost:5000/sites/1") // Replace "1" with a dynamic ID if needed
      .then((response) => setSite(response.data))
      .catch((error) => console.error("Error fetching site:", error));
  }, []);

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setSite({ ...site, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      const response = await axios.post("http://localhost:5000/sites", site);
      setMessage("Site saved successfully!");
      console.log("Site saved:", response.data);
    } catch (error) {
      console.error("Error saving site:", error);
      setMessage("Failed to save site.");
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle>Site Entry Form</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Site ID</Label>
                <Input
                  name="SiteID"
                  value={site.SiteID}
                  onChange={handleChange}
                />
              </div>
              <div>
                <Label>Parent Name</Label>
                <Input
                  name="ParentName"
                  value={site.ParentName}
                  onChange={handleChange}
                />
              </div>
              <div>
                <Label>Building/Site Name</Label>
                <Input
                  name="BuildingSiteName"
                  value={site.BuildingSiteName}
                  onChange={handleChange}
                />
              </div>
              <div>
                <Label>Site Type</Label>
                <Input
                  name="SiteType"
                  value={site.SiteType}
                  onChange={handleChange}
                />
              </div>
              <div>
                <Label>Capacity</Label>
                <Input
                  name="Capacity"
                  type="number"
                  value={site.Capacity}
                  onChange={handleChange}
                />
              </div>
              <div>
                <Label>Full Street Address</Label>
                <Input
                  name="FullStreetAddress"
                  value={site.FullStreetAddress}
                  onChange={handleChange}
                />
              </div>
              <div>
                <Label>City</Label>
                <Input name="City" value={site.City} onChange={handleChange} />
              </div>
              <div>
                <Label>State</Label>
                <Input
                  name="State"
                  value={site.State}
                  onChange={handleChange}
                />
              </div>
              <div>
                <Label>Post Code</Label>
                <Input
                  name="PostCode"
                  value={site.PostCode}
                  onChange={handleChange}
                />
              </div>
              <div className="col-span-2">
                <Label>Directions</Label>
                <Textarea
                  name="Directions"
                  value={site.Directions}
                  onChange={handleChange}
                />
              </div>
              <div className="col-span-2">
                <Label>Description</Label>
                <Textarea
                  name="Description"
                  value={site.Description}
                  onChange={handleChange}
                />
              </div>
              <div className="col-span-2">
                <Label>Special Instructions</Label>
                <Textarea
                  name="SpecialInstructions"
                  value={site.SpecialInstructions}
                  onChange={handleChange}
                />
              </div>
              <div>
                <Label>Signature URL</Label>
                <Input
                  name="SignatureURL"
                  value={site.SignatureURL}
                  onChange={handleChange}
                />
              </div>
              <div>
                <Label>Image URL</Label>
                <Input
                  name="ImageURL"
                  value={site.ImageURL}
                  onChange={handleChange}
                />
              </div>
            </div>
            <Button className="mt-4 w-full">Save Site</Button>
          </form>
          {message && (
            <p className="mt-2 text-center text-green-600">{message}</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
