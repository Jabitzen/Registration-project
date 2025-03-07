import { useState, useEffect, ChangeEvent } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import {
  Calendar,
  dateFnsLocalizer,
  Navigate,
  Views,
  View,
} from "react-big-calendar";
import "react-big-calendar/lib/css/react-big-calendar.css";
import {
  format,
  parse,
  startOfWeek,
  getDay,
  addMinutes,
  isWithinInterval,
  setHours,
  setMinutes as setMinutesFn,
  isSameDay,
  startOfDay,
  parseISO,
  addDays,
} from "date-fns";
import { enUS } from "date-fns/locale";
import { Input } from "../../components/ui/input";
import { Button } from "../../components/ui/button";
import { Label } from "../../components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import { Dialog, DialogContent } from "../../components/ui/dialog"; // Using only Dialog and DialogContent
import { jwtDecode } from "jwt-decode"; // For decoding JWT tokens

interface Site {
  _id: string;
  SiteID: string;
  BuildingSiteName: string;
  locations: Location[];
}

interface Location {
  _id: string;
  name: string;
  availability: Availability[];
}

interface Availability {
  _id?: string;
  startDateTime: string;
  endDateTime: string;
  status: "booked";
  bookedBy: string;
}

interface DecodedToken {
  id: string; // Adjust this based on your JWT payload structure
  name: string;
  // Add other fields as needed (e.g., role, exp)
}

type NavigateAction = "PREV" | "NEXT" | "TODAY" | "DATE";

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: () => startOfWeek(new Date(), { weekStartsOn: 1 }),
  getDay,
  locales: { "en-US": enUS },
});

const getToken = () => localStorage.getItem("token");

// Utility function to round to nearest 15-minute increment in local time
const roundTo15Minutes = (date: Date) => {
  const minutes = Math.round(date.getMinutes() / 15) * 15;
  return setMinutesFn(setHours(date, date.getHours()), minutes);
};

export default function CalendarPage() {
  const { siteId } = useParams<{ siteId: string }>();
  const navigate = useNavigate();
  const [sites, setSites] = useState<Site[]>([]);
  const [selectedSite, setSelectedSite] = useState<string>(siteId || "");
  const [locations, setLocations] = useState<Location[]>([]);
  const [selectedLocationIds, setSelectedLocationIds] = useState<string[]>([
    "",
  ]);
  const [sessionDuration, setSessionDuration] = useState<number>(60);
  const [availability, setAvailability] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<View>(Views.DAY); // Changed to DAY for better visibility of time slots
  const [date, setDate] = useState(startOfDay(new Date())); // Start at midnight of today (local time)
  const [selectedDate, setSelectedDate] = useState<string>(
    format(startOfDay(new Date()), "yyyy-MM-dd") // Initialize with today in local time
  ); // Initialize with today
  const [isReservationDialogOpen, setIsReservationDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false); // New state for deletion dialog
  const [selectedSlot, setSelectedSlot] = useState<any>(null);
  const [selectedBookingToDelete, setSelectedBookingToDelete] =
    useState<any>(null); // New state for the booking to delete
  const [currentUserId, setCurrentUserId] = useState<string | null>(null); // Store the current user's ID
  const [currentUserName, setCurrentUserName] = useState<string | null>(null); // Store the current user's name

  // Decode JWT token to get user ID and name on mount
  useEffect(() => {
    const token = getToken();
    if (token) {
      try {
        const decoded: DecodedToken = jwtDecode(token);
        console.log("Decoded token:", decoded);
        setCurrentUserId(decoded.id); // Adjust this based on your JWT payload structure (e.g., 'sub' or 'userId')
        setCurrentUserName(decoded.name); // Adjust this based on your JWT payload structure (e.g., 'name' or 'fullName')
      } catch (error) {
        console.error("Error decoding token:", error);
      }
    }
  }, []);

  const onNavigate = (newDateOrAction: Date | NavigateAction) => {
    if (typeof newDateOrAction === "string") {
      switch (newDateOrAction) {
        case Navigate.PREVIOUS:
          setDate((prev) => {
            const newDate = addDays(prev, -1); // Move back 1 day, maintaining the current time
            setSelectedDate(format(newDate, "yyyy-MM-dd")); // Update selectedDate
            return newDate;
          });
          break;
        case Navigate.NEXT:
          setDate((prev) => {
            const newDate = addDays(prev, 1); // Move forward 1 day, maintaining the current time
            setSelectedDate(format(newDate, "yyyy-MM-dd")); // Update selectedDate
            return newDate;
          });
          break;
        case Navigate.TODAY:
          const today = new Date();
          setDate(today); // Set to today, maintaining the current time
          setSelectedDate(format(today, "yyyy-MM-dd")); // Update selectedDate
          break;
        default:
          break;
      }
    } else {
      setDate(newDateOrAction); // Set the new date directly, maintaining the current time
      setSelectedDate(format(newDateOrAction, "yyyy-MM-dd")); // Update selectedDate
    }
    // Trigger availability recalculation for the new date
    calculateAvailability(
      locations.filter((loc) => selectedLocationIds.includes(loc._id)),
      sessionDuration,
      parseISO(selectedDate) // Use local time
    );
  };

  const onView = (newView: View) => setView(newView);

  useEffect(() => {
    const token = getToken();
    if (!token) {
      console.warn("No token found in localStorage");
      setLoading(false);
      navigate("/login");
      return;
    }

    const fetchSites = async () => {
      try {
        setLoading(true);
        const response = await axios.get("http://localhost:5000/sites", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setSites(response.data);
      } catch (error: any) {
        console.error("Error fetching sites:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchSites();
  }, [navigate]);

  useEffect(() => {
    if (selectedSite) {
      const token = getToken();
      if (!token) return;

      const fetchLocations = async () => {
        try {
          const response = await axios.get(
            `http://localhost:5000/sites/${selectedSite}`,
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );
          setLocations(response.data.locations || []);
          setSelectedLocationIds([""]);
          calculateAvailability(
            response.data.locations || [],
            sessionDuration,
            parseISO(selectedDate) // Use local time
          );
        } catch (error: any) {
          console.error("Error fetching locations:", error);
        }
      };
      fetchLocations();
    }
  }, [selectedSite, selectedDate]);

  const handleSiteChange = (value: string) => {
    setSelectedSite(value);
  };

  const handleLocationChange = (index: number, value: string) => {
    const newLocationIds = [...selectedLocationIds];
    newLocationIds[index] = value;
    setSelectedLocationIds(newLocationIds);
    calculateAvailability(
      locations.filter((loc) => newLocationIds.includes(loc._id)),
      sessionDuration,
      parseISO(selectedDate) // Use local time
    );
  };

  const addLocationDropdown = () => {
    setSelectedLocationIds([...selectedLocationIds, ""]);
  };

  const removeLocationDropdown = (index: number) => {
    const newLocationIds = selectedLocationIds.filter((_, i) => i !== index);
    setSelectedLocationIds(newLocationIds.length ? newLocationIds : [""]);
    calculateAvailability(
      locations.filter((loc) => newLocationIds.includes(loc._id)),
      sessionDuration,
      parseISO(selectedDate) // Use local time
    );
  };

  const handleSessionDurationChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const newDuration = parseInt(value, 10) || 0;
    const normalizedDuration = Math.max(15, Math.round(newDuration / 15) * 15); // Round to nearest 15, minimum 15
    setSessionDuration(normalizedDuration);
    calculateAvailability(
      locations.filter((loc) => selectedLocationIds.includes(loc._id)),
      normalizedDuration,
      parseISO(selectedDate) // Use local time
    );
  };

  const handleDateChange = (e: ChangeEvent<HTMLInputElement>) => {
    const newDate = e.target.value; // e.g., "2025-03-03"
    const parsedDate = startOfDay(parseISO(newDate)); // Parse the date string correctly in local time
    const formattedDate = format(parsedDate, "yyyy-MM-dd"); // Format to yyyy-MM-dd in local time
    setSelectedDate(formattedDate); // Update selectedDate
    setDate(parsedDate); // Update the calendar date (in local time)
  };

  const calculateAvailability = (
    selectedLocs: Location[],
    duration: number,
    targetDate: Date
  ) => {
    if (!selectedLocs.length || !duration) {
      setAvailability([]);
      return;
    }

    const actualTargetDate = startOfDay(targetDate); // Use local start of day
    const bookedEvents = selectedLocs.flatMap((loc) =>
      loc.availability.map((avail) => ({
        id: avail._id,
        title: `Booked by ${currentUserName || "Unknown User"} at ${loc.name}`, // Use currentUserName for booked events
        start: roundTo15Minutes(new Date(avail.startDateTime)),
        end: roundTo15Minutes(new Date(avail.endDateTime)),
        booked: true,
        location: loc.name, // Add location name to booked events
        bookedBy: avail.bookedBy, // Add bookedBy for ownership check
      }))
    );

    let availableSlots: any[] = [];
    let slotsFound = 0;
    let currentTime = setHours(setMinutesFn(actualTargetDate, 0), 6); // Start at 6:00 AM local time

    while (slotsFound < 5 && currentTime.getHours() < 19) {
      const proposedEnd = addMinutes(currentTime, duration);
      const isAvailable = selectedLocs.every((loc) => {
        return !bookedEvents.some(
          (event) =>
            // Allow new timeslot to start at the exact end time of a booked timeslot
            currentTime < event.end && proposedEnd > event.start
        );
      });

      if (isAvailable) {
        // Include the location name in the available slot title
        const locationNames = selectedLocs.map((loc) => loc.name).join(", ");
        availableSlots.push({
          id: `avail-${currentTime.toISOString()}`,
          title: `Available at ${locationNames} (${format(
            currentTime,
            "h:mm a"
          )} - ${format(proposedEnd, "h:mm a")})`,
          start: currentTime,
          end: proposedEnd,
          booked: false,
        });
        slotsFound++;
        currentTime = proposedEnd; // Move to the end of the current slot
      } else {
        currentTime = addMinutes(currentTime, 15); // Move to next 15-minute increment
      }
    }

    setAvailability(availableSlots.length > 0 ? availableSlots : []);
  };

  const handleCreateReservation = async (slot: any) => {
    const token = getToken();
    if (!token) {
      setLoading(false);
      navigate("/login");
      return;
    }

    try {
      // Filter out empty or invalid location IDs
      const validLocationIds = selectedLocationIds.filter(
        (id) => id && id !== ""
      );

      if (validLocationIds.length === 0) {
        throw new Error("No valid locations selected for reservation.");
      }

      // Book the slot for all selected locations
      for (const locationId of validLocationIds) {
        console.log(
          `Attempting to create reservation for location ${locationId} with:`,
          {
            slot,
            selectedSite,
            startDateTime: slot.start.toISOString(),
            endDateTime: slot.end.toISOString(),
          }
        );

        await axios.post(
          `http://localhost:5000/sites/${selectedSite}/locations/${locationId}/availability`,
          {
            startDateTime: slot.start.toISOString(), // Use local time, but ISO will include local offset
            endDateTime: slot.end.toISOString(), // Use local time, but ISO will include local offset
          },
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
      }

      console.log(
        "Reservations created successfully for all selected locations:",
        validLocationIds
      );
      alert("Reservations created successfully for all selected locations!");
      const siteResponse = await axios.get(
        `http://localhost:5000/sites/${selectedSite}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setLocations(siteResponse.data.locations || []);
      calculateAvailability(
        siteResponse.data.locations.filter((loc: any) =>
          selectedLocationIds.includes(loc._id)
        ),
        sessionDuration,
        parseISO(selectedDate) // Use local time
      );
      setIsReservationDialogOpen(false); // Close dialog after reservation
    } catch (error: any) {
      console.error("Error creating reservations:", error);
      alert(
        error.response?.data?.message ||
          "Failed to create reservations. Please check your input or server status."
      );
    }
  };

  const handleEventClick = (event: any) => {
    console.log("EVENT", event.bookedBy); // Fixed typo from bookedyBy to bookedBy
    if (!event.booked) {
      console.log("Selected slot for reservation:", event);
      setSelectedSlot(event);
      setIsReservationDialogOpen(true);
    } else if (
      event.booked &&
      currentUserId &&
      event.bookedBy === currentUserId
    ) {
      console.log("Selected own booked slot for deletion:", event);
      setSelectedBookingToDelete(event); // Set the booking to delete and open the dialog
      setIsDeleteDialogOpen(true);
    } else {
      console.log(
        "Cannot select or delete this booked slot: not owned by current user",
        event,
        currentUserId
      );
    }
  };

  const handleConfirmDelete = async () => {
    if (selectedBookingToDelete && selectedBookingToDelete.id) {
      const location = locations.find((loc) =>
        loc.availability.some((a) => a._id === selectedBookingToDelete.id)
      );
      if (location) {
        await handleDeleteReservation(
          location._id,
          selectedBookingToDelete.id as string
        );
        setIsDeleteDialogOpen(false); // Close dialog after deletion
        setSelectedBookingToDelete(null); // Clear the selected booking
      }
    }
  };

  const handleDeleteReservation = async (
    locationId: string,
    availabilityId: string
  ) => {
    const token = getToken();
    if (!token) {
      setLoading(false);
      navigate("/login");
      return;
    }

    try {
      await axios.delete(
        `http://localhost:5000/sites/${selectedSite}/locations/${locationId}/availability/${availabilityId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      console.log(
        "Reservation deleted successfully for availabilityId:",
        availabilityId
      );
      alert("Your reservation has been deleted successfully!");
      const response = await axios.get(
        `http://localhost:5000/sites/${selectedSite}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setLocations(response.data.locations || []);
      calculateAvailability(
        response.data.locations.filter((loc: any) =>
          selectedLocationIds.includes(loc._id)
        ),
        sessionDuration,
        parseISO(selectedDate) // Use local time
      );
    } catch (error: any) {
      console.error("Error deleting reservation:", error);
      alert(error.response?.data?.message || "Failed to delete reservation.");
    }
  };

  if (loading) {
    return <div className="p-6 text-center">Loading...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Reservation Calendar</h1>

      <div className="mb-6">
        <Label>Facility (Site)</Label>
        <Select onValueChange={handleSiteChange} value={selectedSite}>
          <SelectTrigger>
            <SelectValue placeholder="Select a facility" />
          </SelectTrigger>
          <SelectContent>
            {sites.map((site) => (
              <SelectItem key={site._id} value={site._id}>
                {site.BuildingSiteName}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="mb-6">
        <Label>Locations</Label>
        {selectedLocationIds.map((locId, index) => (
          <div key={index} className="flex items-center gap-2 mb-2">
            <Select
              onValueChange={(value) => handleLocationChange(index, value)}
              value={locId}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a location" />
              </SelectTrigger>
              <SelectContent>
                {locations.map((loc) => (
                  <SelectItem key={loc._id} value={loc._id}>
                    {loc.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selectedLocationIds.length > 1 && (
              <Button
                className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-red-500 text-white hover:bg-red-500/90"
                onClick={() => removeLocationDropdown(index)}
              >
                Remove
              </Button>
            )}
          </div>
        ))}
        <Button
          className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
          onClick={addLocationDropdown}
        >
          Add Another Location
        </Button>
      </div>

      <div className="mb-6">
        <Label>Session Duration (minutes)</Label>
        <Input
          type="number"
          name="sessionDuration"
          value={sessionDuration.toString()}
          onChange={handleSessionDurationChange}
          min="15"
          step="15"
        />
      </div>

      <div className="mb-6">
        <Label>Select Date for Availability</Label>
        <Input
          type="date"
          name="selectedDate"
          value={selectedDate}
          onChange={handleDateChange}
          min={format(startOfDay(new Date()), "yyyy-MM-dd")}
        />
      </div>

      <div className="mb-6">
        <h3 className="text-lg font-semibold">
          Availability on {format(parseISO(selectedDate), "MMMM d, yyyy")}
        </h3>
        {availability.length > 0 ? (
          <ul className="list-disc pl-5">
            {availability.map((slot) => (
              <li key={slot.id}>{slot.title}</li>
            ))}
          </ul>
        ) : (
          <p className="text-red-600">No time slots available on this date.</p>
        )}
      </div>

      <Calendar
        localizer={localizer}
        events={[
          ...locations.flatMap((loc) =>
            loc.availability.map((avail) => ({
              id: avail._id,
              title: `Booked by ${currentUserName || "Unknown User"} at ${
                loc.name
              }`, // Use currentUserName for booked events
              start: roundTo15Minutes(new Date(avail.startDateTime)),
              end: roundTo15Minutes(new Date(avail.endDateTime)),
              booked: true,
              bookedBy: avail.bookedBy,
            }))
          ),
          ...availability.map((slot) => ({
            ...slot,
            booked: false,
          })),
        ]}
        startAccessor="start"
        endAccessor="end"
        date={parseISO(selectedDate)} // Use local time directly
        view={view}
        onNavigate={onNavigate}
        onView={onView}
        min={new Date(0, 0, 0, 6, 0)} // 6:00 AM local time
        max={new Date(0, 0, 0, 19, 0)} // 7:00 PM local time
        step={15} // 15-minute time slots
        timeslots={4} // 4 slots per hour (15 minutes each)
        style={{ height: 500 }}
        eventPropGetter={(event) => ({
          style: {
            backgroundColor: event.booked ? "#ef4444" : "#4caf50", // Red for booked, green for available
            color: "white",
            borderRadius: "4px",
            padding: "2px",
            fontSize: "12px",
            width: "100%",
            cursor: event.booked ? "pointer" : "pointer", // Cursor pointer for both booked and available slots
          },
        })}
        onSelectEvent={handleEventClick}
        components={{
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
              <span className="rbc-toolbar-label">{toolbarProps.label}</span>
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
          event: (props) => (
            <div className="p-1 flex flex-col justify-between h-full w-full">
              <span>{props.event.title}</span>
              {props.event.booked &&
                currentUserId &&
                props.event.bookedBy === currentUserId && (
                  <button
                    onClick={() => {
                      setSelectedBookingToDelete(props.event); // Set the booking to delete and open the dialog
                      setIsDeleteDialogOpen(true);
                    }}
                    className="bg-red-500 text-white px-2 py-1 rounded-md text-xs hover:bg-red-600 mt-auto w-full"
                  >
                    Delete
                  </button>
                )}
            </div>
          ),
        }}
        className="mt-4 border rounded-md shadow-sm"
      />

      {/* Reservation Confirmation Dialog */}
      <Dialog
        open={isReservationDialogOpen}
        onOpenChange={setIsReservationDialogOpen}
      >
        <DialogContent className="bg-gray-800 text-white p-6 rounded-lg shadow-lg max-w-md w-full fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
          <div className="mb-4">
            <h2 className="text-lg font-semibold">Confirm Reservation</h2>
          </div>
          {selectedSlot && (
            <p className="mb-4">
              Reserve {selectedSlot.title} for{" "}
              {locations.find((loc) => selectedLocationIds.includes(loc._id))
                ?.name || "selected location"}
              ?
            </p>
          )}
          <div className="flex justify-end gap-2">
            <Button
              onClick={() => {
                console.log("Cancel clicked, closing dialog");
                setIsReservationDialogOpen(false);
              }}
              className="bg-blue-500 text-white hover:bg-blue-600"
            >
              Cancel
            </Button>
            <Button
              onClick={() => {
                console.log("Confirm clicked, attempting reservation with:", {
                  slot: selectedSlot,
                });
                handleCreateReservation(selectedSlot);
              }}
              className="bg-green-500 text-white hover:bg-green-600"
            >
              Confirm
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Deletion Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="bg-gray-800 text-white p-6 rounded-lg shadow-lg max-w-md w-full fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
          <div className="mb-4">
            <h2 className="text-lg font-semibold">
              Confirm Delete Reservation
            </h2>
          </div>
          {selectedBookingToDelete && (
            <p className="mb-4">
              Are you sure you want to delete the reservation for{" "}
              {selectedBookingToDelete.title} at{" "}
              {format(selectedBookingToDelete.start, "h:mm a")} -{" "}
              {format(selectedBookingToDelete.end, "h:mm a")}?
            </p>
          )}
          <div className="flex justify-end gap-2">
            <Button
              onClick={() => {
                console.log("Cancel deletion, closing dialog");
                setIsDeleteDialogOpen(false);
                setSelectedBookingToDelete(null); // Clear the selected booking
              }}
              className="bg-blue-500 text-white hover:bg-blue-600"
            >
              Cancel
            </Button>
            <Button
              onClick={() => {
                console.log(
                  "Confirm deletion clicked for:",
                  selectedBookingToDelete
                );
                handleConfirmDelete();
              }}
              className="bg-red-500 text-white hover:bg-red-600"
            >
              Confirm Delete
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
