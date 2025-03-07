import { useState, useEffect, ChangeEvent } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { Calendar, dateFnsLocalizer, Views, View } from "react-big-calendar";
import "react-big-calendar/lib/css/react-big-calendar.css";
import {
  format,
  parse,
  startOfWeek,
  getDay,
  addMinutes,
  setHours,
  setMinutes as setMinutesFn,
  startOfDay,
  parseISO,
  addDays,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
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
import { Dialog, DialogContent } from "../../components/ui/dialog";
import { jwtDecode } from "jwt-decode";
import { DateTimeSelectionScreen } from "./DateTimeSelection";
import { LocationSelectionScreen } from "./LocationSelect";

// Define interfaces locally
interface Site {
  _id: string;
  SiteID: string;
  BuildingSiteName: string;
  locations: Location[];
}

interface Location {
  _id: string;
  name: string;
  site: string;
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

interface DecodedToken {
  id: string;
  role: string;
  exp: number;
  name: string;
}

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: () => startOfWeek(new Date(), { weekStartsOn: 1 }),
  getDay,
  locales: { "en-US": enUS },
});

const getToken = () => localStorage.getItem("token");

export default function Scheduler() {
  const navigate = useNavigate();
  const { siteId } = useParams<{ siteId: string }>();
  const [sites, setSites] = useState<Site[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [selectedSite, setSelectedSite] = useState<string>(siteId || "");
  const [selectedLocations, setSelectedLocations] = useState<string[]>([]);
  const [selectedLocationsOrder, setSelectedLocationsOrder] = useState<
    string[]
  >([]);
  const [isSequential, setIsSequential] = useState<boolean>(false);
  const [sessionDurations, setSessionDurations] = useState<{
    [key: string]: number;
  }>({}); // Map of locationId to duration
  const [selectedDate, setSelectedDate] = useState<string>(
    format(startOfDay(new Date()), "yyyy-MM-dd")
  );
  const [availability, setAvailability] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [currentUserName, setCurrentUserName] = useState<string | null>(null);
  const [isReservationDialogOpen, setIsReservationDialogOpen] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<any>(null);
  const [view, setView] = useState<View>(Views.DAY);
  const [hasContinued, setHasContinued] = useState<boolean>(false);

  useEffect(() => {
    const token = getToken();
    if (!token) {
      console.warn("No token found in localStorage");
      setLoading(false);
      navigate("/login");
      return;
    }

    try {
      const decoded: DecodedToken = jwtDecode(token);
      console.log("Decoded token:", decoded);
      setCurrentUserId(decoded.id);
      setCurrentUserName(decoded.name);
    } catch (error) {
      console.error("Error decoding token:", error);
    }

    fetchSites();
    fetchLocations();
  }, [navigate, siteId]);

  // Initialize sessionDurations when selectedLocations change
  useEffect(() => {
    setSessionDurations((prev) => {
      const newDurations: { [key: string]: number } = {};
      selectedLocations.forEach((locId) => {
        newDurations[locId] = prev[locId] || 60; // Default to 60 minutes if not set
      });
      return newDurations;
    });
  }, [selectedLocations]);

  useEffect(() => {
    if (hasContinued && selectedLocations.length > 0) {
      console.log("hasContinued changed to true, calculating availability...");
      calculateAvailability(
        locations.filter(
          (loc) =>
            selectedLocations.includes(loc._id) && loc.site === selectedSite
        ),
        parseISO(selectedDate)
      );
    }
  }, [
    hasContinued,
    selectedLocations,
    sessionDurations,
    selectedDate,
    selectedSite,
    locations,
  ]);

  const fetchSites = async () => {
    try {
      setLoading(true);
      const token = getToken();
      const response = await axios.get("http://localhost:5000/sites", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSites(response.data);
      if (siteId && response.data.some((site: Site) => site._id === siteId)) {
        setSelectedSite(siteId);
      } else if (response.data.length > 0) {
        setSelectedSite(response.data[0]._id);
      }
    } catch (error: any) {
      console.error("Error fetching sites:", error);
      setLoading(false);
    } finally {
      setLoading(false);
    }
  };

  const fetchLocations = async () => {
    try {
      const token = getToken();
      const response = await axios.get(
        "http://localhost:5000/sites/locations",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      console.log("Fetched Locations:", response.data);
      setLocations(response.data);
    } catch (error: any) {
      console.error("Error fetching locations:", error);
      setLocations([]);
    }
  };

  const handleSiteChange = (value: string) => {
    setSelectedSite(value);
    setSelectedLocations([]);
    setSelectedLocationsOrder([]);
    setHasContinued(false);
  };

  const handleLocationSelect = (locationId: string, checked: boolean) => {
    setSelectedLocations((prev) => {
      const newSelected = checked
        ? [...prev, locationId]
        : prev.filter((id) => id !== locationId);
      console.log("Updated selectedLocations:", newSelected);
      return newSelected;
    });

    setSelectedLocationsOrder((prev) => {
      if (checked) {
        return [...prev, locationId];
      } else {
        return prev.filter((id) => id !== locationId);
      }
    });
  };

  const handleContinueToDateTime = () => {
    if (selectedLocations.length === 0) {
      alert("Please select at least one location.");
      return;
    }
    console.log(
      "Continuing to date/time selection with locations:",
      selectedLocations
    );
    setHasContinued(true);
  };

  const handleSessionDurationChange = (locationId: string, value: number) => {
    setSessionDurations((prev) => ({
      ...prev,
      [locationId]: Math.max(15, Math.round(value / 15) * 15), // Round to nearest 15, minimum 15
    }));
    calculateAvailability(
      locations.filter(
        (loc) =>
          selectedLocations.includes(loc._id) && loc.site === selectedSite
      ),
      parseISO(selectedDate)
    );
  };

  const handleDateChange = (e: ChangeEvent<HTMLInputElement>) => {
    const date = e.target.value;
    setSelectedDate(date);
    calculateAvailability(
      locations.filter(
        (loc) =>
          selectedLocations.includes(loc._id) && loc.site === selectedSite
      ),
      parseISO(date)
    );
  };

  const calculateAvailability = (
    selectedLocs: Location[],
    targetDate: Date
  ) => {
    if (!selectedLocs.length) {
      setAvailability([]);
      return;
    }

    const actualTargetDate = startOfDay(targetDate);
    const bookedEvents = selectedLocs.flatMap((loc) =>
      loc.availability.map((avail) => ({
        id: avail._id,
        title: `Booked by ${currentUserName || "Unknown User"} at ${loc.name}`,
        start: new Date(avail.startDateTime),
        end: new Date(avail.endDateTime),
        booked: true,
        location: loc.name,
        bookedBy: avail.bookedBy,
      }))
    );

    let availableSlots: any[] = [];

    if (isSequential) {
      let currentTime = setHours(setMinutesFn(actualTargetDate, 0), 6);
      let allSlotsFound = false;

      while (currentTime.getHours() < 19 && !allSlotsFound) {
        const slotsForThisWindow: any[] = [];
        let tempTime = currentTime;
        let canScheduleAll = true;

        for (const loc of selectedLocs) {
          const duration = sessionDurations[loc._id] || 60; // Use per-location duration
          const proposedEnd = addMinutes(tempTime, duration);
          const isAvailable = !bookedEvents.some(
            (event) =>
              event.location === loc.name &&
              tempTime < event.end &&
              proposedEnd > event.start
          );

          if (!isAvailable) {
            canScheduleAll = false;
            break;
          }

          slotsForThisWindow.push({
            location: loc.name,
            start: tempTime,
            end: proposedEnd,
          });
          tempTime = proposedEnd;
        }

        if (canScheduleAll) {
          const locationNames = selectedLocs.map((loc) => loc.name).join(", ");
          availableSlots.push({
            id: `avail-${currentTime.toISOString()}`,
            title: `Available at ${locationNames} (${format(
              currentTime,
              "h:mm a"
            )} - ${format(tempTime, "h:mm a")})`,
            start: currentTime,
            end: tempTime,
            booked: false,
            sequentialSlots: slotsForThisWindow,
          });
          currentTime = tempTime;
        } else {
          currentTime = addMinutes(currentTime, 15);
        }

        if (availableSlots.length > 7) allSlotsFound = true;
      }
    } else {
      let currentTime = setHours(setMinutesFn(actualTargetDate, 0), 6);
      const maxDuration = Math.max(
        ...selectedLocs.map((loc) => sessionDurations[loc._id] || 60)
      );

      while (currentTime.getHours() < 19) {
        const proposedEnd = addMinutes(currentTime, maxDuration);
        const isAvailable = selectedLocs.every((loc) => {
          return !bookedEvents.some(
            (event) =>
              event.location === loc.name &&
              currentTime < event.end &&
              proposedEnd > event.start
          );
        });

        if (isAvailable) {
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
        }
        currentTime = addMinutes(currentTime, 15);
      }
    }

    setAvailability(availableSlots);
  };

  const handleCreateReservation = async (slot: any) => {
    const token = getToken();
    if (!token) {
      setLoading(false);
      navigate("/login");
      return;
    }

    try {
      if (isSequential && slot.sequentialSlots) {
        for (const sequentialSlot of slot.sequentialSlots) {
          const location = locations.find(
            (loc) =>
              loc.name === sequentialSlot.location && loc.site === selectedSite
          );
          if (!location) continue;

          await axios.post(
            `http://localhost:5000/sites/${selectedSite}/locations/${location._id}/availability`,
            {
              startDateTime: sequentialSlot.start.toISOString(),
              endDateTime: sequentialSlot.end.toISOString(),
            },
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );
        }
      } else {
        for (const locationId of selectedLocations) {
          const location = locations.find((loc) => loc._id === locationId);
          if (!location || location.site !== selectedSite) continue;

          const duration = sessionDurations[locationId] || 60;
          const endTime = addMinutes(slot.start, duration);

          await axios.post(
            `http://localhost:5000/sites/${selectedSite}/locations/${locationId}/availability`,
            {
              startDateTime: slot.start.toISOString(),
              endDateTime: endTime.toISOString(),
            },
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );
        }
      }

      console.log(
        "Reservations created successfully for all selected locations:",
        selectedLocations
      );
      alert("Reservations created successfully for all selected locations!");
      fetchSites();
      setIsReservationDialogOpen(false);
    } catch (error: any) {
      console.error("Error creating reservations:", error);
      alert(
        error.response?.data?.message ||
          "Failed to create reservations. Please check your input or server status."
      );
    }
  };

  const handleEventClick = (event: any) => {
    if (!event.booked) {
      console.log("Selected slot for reservation:", event);
      setSelectedSlot(event);
      setIsReservationDialogOpen(true);
    } else if (
      event.booked &&
      currentUserId &&
      event.bookedBy === currentUserId
    ) {
      console.log(
        "Selected own booked slot for deletion (not implemented here)"
      );
    } else {
      console.log(
        "Cannot select or delete this booked slot: not owned by current user",
        event,
        currentUserId
      );
    }
  };

  const onView = (newView: View) => setView(newView);
  const onNavigate = (newDateOrAction: Date | string) => {
    if (typeof newDateOrAction === "string") {
      switch (newDateOrAction) {
        case "PREV":
          setSelectedDate(
            format(addDays(parseISO(selectedDate), -1), "yyyy-MM-dd")
          );
          break;
        case "NEXT":
          setSelectedDate(
            format(addDays(parseISO(selectedDate), 1), "yyyy-MM-dd")
          );
          break;
        case "TODAY":
          setSelectedDate(format(startOfDay(new Date()), "yyyy-MM-dd"));
          break;
        default:
          break;
      }
    } else {
      setSelectedDate(format(newDateOrAction, "yyyy-MM-dd"));
    }
    calculateAvailability(
      locations.filter(
        (loc) =>
          selectedLocations.includes(loc._id) && loc.site === selectedSite
      ),
      parseISO(selectedDate)
    );
  };

  if (loading) {
    return <div className="p-6 text-center">Loading...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      {!hasContinued ? (
        <LocationSelectionScreen
          sites={sites}
          locations={locations}
          selectedSite={selectedSite}
          selectedLocations={selectedLocations}
          selectedLocationsOrder={selectedLocationsOrder}
          isSequential={isSequential}
          setIsSequential={setIsSequential}
          onSiteChange={handleSiteChange}
          onLocationSelect={handleLocationSelect}
          onContinue={handleContinueToDateTime}
        />
      ) : (
        <DateTimeSelectionScreen
          selectedLocations={selectedLocations}
          locations={locations} // Pass locations to get names
          sessionDurations={sessionDurations}
          setSessionDurations={setSessionDurations}
          selectedDate={selectedDate}
          availability={availability}
          onSessionDurationChange={handleSessionDurationChange}
          onDateChange={handleDateChange}
          onEventClick={handleEventClick}
          onView={onView}
          onNavigate={onNavigate}
          view={view}
          isReservationDialogOpen={isReservationDialogOpen}
          setIsReservationDialogOpen={setIsReservationDialogOpen}
          selectedSlot={selectedSlot}
          setSelectedSlot={setSelectedSlot}
          handleCreateReservation={handleCreateReservation}
          localizer={localizer}
          setHasContinued={setHasContinued}
          isSequential={isSequential}
        />
      )}
    </div>
  );
}
