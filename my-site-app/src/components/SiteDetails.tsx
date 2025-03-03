import { useState, ChangeEvent, FormEvent, useEffect } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
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
import {
  Calendar,
  dateFnsLocalizer,
  Navigate,
  Views,
  View,
} from "react-big-calendar";
import DateTime from "react-datetime";
import "react-datetime/css/react-datetime.css";
import "react-big-calendar/lib/css/react-big-calendar.css";
import {
  format,
  parse,
  startOfWeek,
  getDay,
  setMinutes,
  roundToNearestMinutes,
} from "date-fns";
import { enUS } from "date-fns/locale";

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
  locations: Location[];
}

interface Location {
  _id?: string;
  name: string;
  locationType: string;
  capacity: string;
  description: string;
  specialInstructions: string;
  availability: Availability[];
}

interface Availability {
  _id?: string;
  startDateTime: string;
  endDateTime: string;
  status: "booked";
  bookedBy: string;
}

type NavigateAction = "PREV" | "NEXT" | "TODAY" | "DATE";

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: () => startOfWeek(new Date(), { weekStartsOn: 1 }), // Monday start
  getDay,
  locales: { "en-US": enUS },
});

const getToken = () => localStorage.getItem("token");

// Utility function to round to nearest 15-minute increment
const roundTo15Minutes = (date: Date) => {
  return roundToNearestMinutes(date, { nearestTo: 15 });
};

// Format date to ISO string without seconds
const formatToInputValue = (date: Date) => {
  return format(date, "yyyy-MM-dd'T'HH:mm");
};

export default function SiteDetails() {
  const { siteId } = useParams<{ siteId: string }>();
  const navigate = useNavigate();
  const [site, setSite] = useState<Site | null>(null);
  const [newLocation, setNewLocation] = useState<Location>({
    name: "",
    locationType: "",
    capacity: "",
    description: "",
    specialInstructions: "",
    availability: [],
  });
  const [newReservation, setNewReservation] = useState({
    startDateTime: "",
    endDateTime: "",
  });
  const [message, setMessage] = useState<string>("");
  const [locationError, setLocationError] = useState<string>("");
  const [reservationError, setReservationError] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<View>(Views.WEEK);
  const [date, setDate] = useState(new Date());

  const onNavigate = (newDateOrAction: Date | NavigateAction) => {
    if (typeof newDateOrAction === "string") {
      switch (newDateOrAction) {
        case Navigate.PREVIOUS:
          setDate((prev) => {
            const newDate = new Date(prev);
            newDate.setDate(newDate.getDate() - 7);
            return newDate;
          });
          break;
        case Navigate.NEXT:
          setDate((prev) => {
            const newDate = new Date(prev);
            newDate.setDate(newDate.getDate() + 7);
            return newDate;
          });
          break;
        case Navigate.TODAY:
          setDate(new Date());
          break;
        default:
          break;
      }
    } else {
      setDate(newDateOrAction);
    }
  };

  const onView = (newView: View) => setView(newView);

  useEffect(() => {
    const token = getToken();
    if (!token) {
      console.warn("No token found in localStorage");
      setMessage("Please log in to access this page.");
      setLoading(false);
      return;
    }

    const fetchSite = async () => {
      try {
        setLoading(true);
        const response = await axios.get(
          `http://localhost:5000/sites/${siteId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setSite(response.data);
      } catch (error: any) {
        console.error("Error fetching site:", error);
        setMessage(
          error.response?.data?.message || "Failed to load site details."
        );
      } finally {
        setLoading(false);
      }
    };
    fetchSite();
  }, [siteId]);

  const handleLocationChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setNewLocation({ ...newLocation, [e.target.name]: e.target.value });
  };

  const handleReservationChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (value) {
      const date = new Date(value);
      const roundedDate = roundTo15Minutes(date);
      setNewReservation({
        ...newReservation,
        [name]: formatToInputValue(roundedDate),
      });
    } else {
      setNewReservation({ ...newReservation, [name]: value });
    }
  };

  const handleAddLocation = async (e: FormEvent) => {
    e.preventDefault();
    const token = getToken();
    if (!token) {
      setLocationError("Please log in to add a location.");
      return;
    }

    try {
      const response = await axios.post(
        `http://localhost:5000/sites/${siteId}/locations`,
        newLocation,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const updatedResponse = await axios.get(
        `http://localhost:5000/sites/${siteId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setSite(updatedResponse.data);
      setNewLocation({
        name: "",
        locationType: "",
        capacity: "",
        description: "",
        specialInstructions: "",
        availability: [],
      });
      setLocationError("");
      setMessage("Location added successfully!");
    } catch (error: any) {
      console.error("Error adding location:", error);
      setLocationError(
        error.response?.data?.message || "Failed to add location."
      );
    }
  };

  const handleCreateReservation = async (locationId: string) => {
    const token = getToken();
    if (!token) {
      setReservationError("Please log in to create a reservation.");
      return;
    }

    const start = new Date(newReservation.startDateTime);
    const end = new Date(newReservation.endDateTime);
    const startOfDay = new Date(start);
    startOfDay.setHours(6, 0, 0, 0);
    const endOfDay = new Date(start);
    endOfDay.setHours(19, 0, 0, 0);

    if (start < startOfDay || end > endOfDay) {
      setReservationError("Reservation must be within 6:00 AM - 7:00 PM");
      return;
    }

    try {
      const response = await axios.post(
        `http://localhost:5000/sites/${siteId}/locations/${locationId}/availability`,
        newReservation,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const updatedResponse = await axios.get(
        `http://localhost:5000/sites/${siteId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setSite(updatedResponse.data);
      setNewReservation({ startDateTime: "", endDateTime: "" });
      setReservationError("");
      setMessage("Reservation created successfully!");
    } catch (error: any) {
      console.error("Error creating reservation:", error);
      setReservationError(
        error.response?.data?.message || "Failed to create reservation."
      );
    }
  };

  const handleDeleteReservation = async (
    locationId: string,
    availabilityId: string
  ) => {
    const token = getToken();
    if (!token) {
      setReservationError("Please log in to delete a reservation.");
      return;
    }

    try {
      await axios.delete(
        `http://localhost:5000/sites/${siteId}/locations/${locationId}/availability/${availabilityId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const updatedResponse = await axios.get(
        `http://localhost:5000/sites/${siteId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setSite(updatedResponse.data);
      setMessage("Reservation deleted successfully!");
    } catch (error: any) {
      console.error("Error deleting reservation:", error);
      setReservationError(
        error.response?.data?.message || "Failed to delete reservation."
      );
    }
  };

  if (loading) {
    return <div className="p-6 text-center">Loading...</div>;
  }

  if (!site) {
    return (
      <div className="p-6 text-center">{message || "Site not found."}</div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle>
            Site Details: {site.BuildingSiteName || "Unnamed Site"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {message && (
            <p className="mt-2 text-center text-green-600">{message}</p>
          )}
          <div className="mb-6">
            <p>
              <strong>Site ID:</strong> {site.SiteID || "N/A"}
            </p>
            <p>
              <strong>Parent Name:</strong> {site.ParentName || "N/A"}
            </p>
            <p>
              <strong>Site Type:</strong> {site.SiteType || "N/A"}
            </p>
            <p>
              <strong>Total Capacity:</strong> {site.Capacity || "N/A"}
            </p>
            <p>
              <strong>Address:</strong>{" "}
              {site.FullStreetAddress
                ? `${site.FullStreetAddress}${
                    site.SubAddress ? ", " + site.SubAddress : ""
                  }, ${site.City || ""}, ${site.State || ""} ${
                    site.PostCode || ""
                  }`
                : "N/A"}
            </p>
            <p>
              <strong>Directions:</strong> {site.Directions || "N/A"}
            </p>
            <p>
              <strong>Description:</strong> {site.Description || "N/A"}
            </p>
            <p>
              <strong>Special Instructions:</strong>{" "}
              {site.SpecialInstructions || "N/A"}
            </p>
            <p>
              <strong>Rental Requirements:</strong>{" "}
              {site.RentalRequirements || "N/A"}
            </p>
            <p>
              <strong>Signature URL:</strong> {site.SignatureURL || "N/A"}
            </p>
            <p>
              <strong>Image URL:</strong> {site.ImageURL || "N/A"}
            </p>
            <Button
              onClick={() => navigate(`/calendar/${site._id}`)}
              className="mt-4 w-full"
            >
              View Reservation Calendar
            </Button>
          </div>

          <h2 className="mt-6 text-xl font-bold">Add Location</h2>
          <form onSubmit={handleAddLocation} className="mt-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Location Name</Label>
                <Input
                  name="name"
                  value={newLocation.name}
                  onChange={handleLocationChange}
                />
              </div>
              <div>
                <Label>Location Type</Label>
                <Input
                  name="locationType"
                  value={newLocation.locationType}
                  onChange={handleLocationChange}
                />
              </div>
              <div>
                <Label>Capacity</Label>
                <Input
                  name="capacity"
                  type="number"
                  value={newLocation.capacity}
                  onChange={handleLocationChange}
                />
              </div>
              <div className="col-span-2">
                <Label>Description</Label>
                <Textarea
                  name="description"
                  value={newLocation.description}
                  onChange={handleLocationChange}
                />
              </div>
              <div className="col-span-2">
                <Label>Special Instructions</Label>
                <Textarea
                  name="specialInstructions"
                  value={newLocation.specialInstructions}
                  onChange={handleLocationChange}
                />
              </div>
            </div>
            <Button className="mt-4 w-full">Add Location</Button>
          </form>

          {locationError && (
            <p className="mt-2 text-center text-red-600">{locationError}</p>
          )}

          {site.locations?.length > 0 && (
            <div className="mt-6">
              <h3 className="text-lg font-semibold">Locations</h3>
              {site.locations.map((loc) => (
                <div key={loc._id} className="mt-4 border p-4 rounded-md">
                  <p>
                    <strong>Name:</strong> {loc.name || "N/A"}
                  </p>
                  <p>
                    <strong>Type:</strong> {loc.locationType || "N/A"}
                  </p>
                  <p>
                    <strong>Capacity:</strong> {loc.capacity || "N/A"}
                  </p>
                  <p>
                    <strong>Description:</strong> {loc.description || "N/A"}
                  </p>
                  <p>
                    <strong>Special Instructions:</strong>{" "}
                    {loc.specialInstructions || "N/A"}
                  </p>

                  <h4 className="mt-2 font-semibold">Create Reservation</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Start Date/Time</Label>
                      <Input
                        type="datetime-local"
                        name="startDateTime"
                        value={newReservation.startDateTime}
                        onChange={handleReservationChange}
                        min={formatToInputValue(new Date())}
                        step="900" // 15-minute increments (900 seconds)
                      />
                    </div>
                    <div>
                      <Label>End Date/Time</Label>
                      <Input
                        type="datetime-local"
                        name="endDateTime"
                        value={newReservation.endDateTime}
                        onChange={handleReservationChange}
                        min={
                          newReservation.startDateTime ||
                          formatToInputValue(new Date())
                        }
                        step="900" // 15-minute increments (900 seconds)
                      />
                    </div>
                  </div>
                  <Button
                    className="mt-2 w-full"
                    onClick={() => handleCreateReservation(loc._id!)}
                  >
                    Create Reservation
                  </Button>

                  {reservationError && (
                    <p className="mt-2 text-center text-red-600">
                      {reservationError}
                    </p>
                  )}

                  <div className="mt-4">
                    <h5 className="font-medium">Reservations Calendar</h5>
                    <Calendar
                      localizer={localizer}
                      events={loc.availability.map((avail) => {
                        const start = roundTo15Minutes(
                          new Date(avail.startDateTime)
                        );
                        const end = roundTo15Minutes(
                          new Date(avail.endDateTime)
                        );
                        return {
                          id: avail._id,
                          title: `Booked by ${avail.bookedBy}`,
                          start,
                          end,
                        };
                      })}
                      startAccessor="start"
                      endAccessor="end"
                      date={date}
                      view={view}
                      onNavigate={onNavigate}
                      onView={onView}
                      min={new Date(0, 0, 0, 6, 0)} // 6:00 AM
                      max={new Date(0, 0, 0, 19, 0)} // 7:00 PM
                      step={15} // 15-minute time slots
                      timeslots={4} // 4 slots per hour (15 minutes each)
                      style={{ height: 500 }}
                      eventPropGetter={(event) => ({
                        style: {
                          backgroundColor: "#ef4444",
                          color: "white",
                          borderRadius: "4px",
                          padding: "2px",
                          fontSize: "12px",
                          width: "100%",
                        },
                      })}
                      components={{
                        event: (props) => (
                          <div className="p-1 flex flex-col justify-between h-full w-full">
                            <span>{props.event.title}</span>
                            <button
                              onClick={() =>
                                handleDeleteReservation(
                                  loc._id!,
                                  props.event.id as string
                                )
                              }
                              className="bg-red-500 text-white px-2 py-1 rounded-md text-xs hover:bg-red-600 mt-auto w-full"
                            >
                              Delete
                            </button>
                          </div>
                        ),
                        toolbar: (toolbarProps) => (
                          <div className="rbc-toolbar">
                            <div className="rbc-btn-group">
                              <button
                                onClick={() => onNavigate(Navigate.TODAY)}
                                className="rbc-button rbc-button-today"
                              >
                                Today
                              </button>
                              <button
                                onClick={() => onNavigate(Navigate.PREVIOUS)}
                                className="rbc-button rbc-button-prev"
                              >
                                Back
                              </button>
                              <button
                                onClick={() => onNavigate(Navigate.NEXT)}
                                className="rbc-button rbc-button-next"
                              >
                                Next
                              </button>
                            </div>
                            <span className="rbc-toolbar-label">
                              {toolbarProps.label}
                            </span>
                            <div className="rbc-btn-group">
                              <button
                                onClick={() => onView(Views.MONTH)}
                                className={`rbc-button ${
                                  view === Views.MONTH ? "rbc-active" : ""
                                }`}
                              >
                                Month
                              </button>
                              <button
                                onClick={() => onView(Views.WEEK)}
                                className={`rbc-button ${
                                  view === Views.WEEK ? "rbc-active" : ""
                                }`}
                              >
                                Week
                              </button>
                              <button
                                onClick={() => onView(Views.DAY)}
                                className={`rbc-button ${
                                  view === Views.DAY ? "rbc-active" : ""
                                }`}
                              >
                                Day
                              </button>
                            </div>
                          </div>
                        ),
                      }}
                      className="mt-4 border rounded-md shadow-sm"
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
