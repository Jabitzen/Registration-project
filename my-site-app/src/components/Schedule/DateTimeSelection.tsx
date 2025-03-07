import { ChangeEvent, Dispatch, SetStateAction } from "react";
import {
  Calendar,
  dateFnsLocalizer,
  Views,
  View,
  SlotInfo,
} from "react-big-calendar";
import "react-big-calendar/lib/css/react-big-calendar.css";
import {
  format,
  parseISO,
  startOfWeek,
  startOfDay,
  getDay,
  parse,
  addMinutes,
  setHours,
  setMinutes,
  eachDayOfInterval,
  startOfMonth,
  endOfMonth,
  isSameDay,
} from "date-fns";
import { enUS } from "date-fns/locale";
import { Input } from "../../components/ui/input";
import { Button } from "../../components/ui/button";
import { Label } from "../../components/ui/label";
import { Dialog, DialogContent } from "../../components/ui/dialog";

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
  availability: Availability[];
}

interface Availability {
  _id?: string;
  startDateTime: string;
  endDateTime: string;
  status: "booked";
  bookedBy: string;
}

interface DateTimeSelectionScreenProps {
  selectedLocations: string[];
  locations: Location[];
  sessionDurations: { [key: string]: number };
  setSessionDurations: Dispatch<SetStateAction<{ [key: string]: number }>>;
  selectedDate: string;
  availability: any[];
  onSessionDurationChange: (locationId: string, value: number) => void;
  onDateChange: (e: ChangeEvent<HTMLInputElement>) => void;
  onEventClick: (event: any) => void;
  onView: (newView: View) => void;
  onNavigate: (newDateOrAction: Date | string) => void;
  view: View;
  isReservationDialogOpen: boolean;
  setIsReservationDialogOpen: (open: boolean) => void;
  selectedSlot: any;
  setSelectedSlot: (slot: any) => void;
  handleCreateReservation: (slot: any) => void;
  localizer: ReturnType<typeof dateFnsLocalizer>;
  setHasContinued: (value: boolean) => void;
  isSequential: boolean;
}

export function DateTimeSelectionScreen({
  selectedLocations,
  locations,
  sessionDurations,
  setSessionDurations,
  selectedDate,
  availability,
  onSessionDurationChange,
  onDateChange,
  onEventClick,
  onView,
  onNavigate,
  view,
  isReservationDialogOpen,
  setIsReservationDialogOpen,
  selectedSlot,
  setSelectedSlot,
  handleCreateReservation,
  localizer,
  setHasContinued,
  isSequential,
}: DateTimeSelectionScreenProps) {
  const availableSlots = availability.filter((slot) => !slot.booked);

  // Calculate available days in the current month
  const currentMonth = parseISO(selectedDate);
  const daysInMonth = eachDayOfInterval({
    start: startOfMonth(currentMonth),
    end: endOfMonth(currentMonth),
  });

  const availableDays = daysInMonth.filter((day) =>
    availability.some((slot) => isSameDay(new Date(slot.start), day))
  );

  const handleDateSelect = (slotInfo: SlotInfo) => {
    const date = slotInfo.start;
    const formattedDate = format(date, "yyyy-MM-dd");
    const event: ChangeEvent<HTMLInputElement> = {
      target: { value: formattedDate },
      currentTarget: { value: formattedDate },
      type: "change",
      bubbles: true,
      cancelable: true,
    } as ChangeEvent<HTMLInputElement>;
    onDateChange(event);
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-red-500">re=lativity, inc.</h1>
        <Button
          onClick={() => setHasContinued(false)}
          className="bg-gray-500 text-white hover:bg-gray-600 px-4 py-2 rounded"
        >
          Back to Location Selection
        </Button>
      </div>
      <div className="flex flex-col md:flex-row gap-4">
        <div className="w-full md:w-1/2 space-y-4">
          {selectedLocations.map((locId) => {
            const location = locations.find((loc) => loc._id === locId);
            if (!location) return null;
            return (
              <div key={locId} className="flex items-center gap-2">
                <Label
                  htmlFor={`session-duration-${locId}`}
                  className="text-sm"
                >
                  Duration for {location.name} (minutes)
                </Label>
                <Input
                  type="number"
                  id={`session-duration-${locId}`}
                  name={`session-duration-${locId}`}
                  value={sessionDurations[locId]?.toString() || "60"}
                  onChange={(e) =>
                    onSessionDurationChange(
                      locId,
                      parseInt(e.target.value) || 60
                    )
                  }
                  min="15"
                  step="15"
                  className="mt-1 w-24 border rounded-md p-2"
                />
              </div>
            );
          })}
        </div>
      </div>
      <div className="flex flex-col md:flex-row gap-4">
        <div className="w-full md:w-1/2">
          <h3 className="text-lg font-semibold mb-2">
            Availability on {format(parseISO(selectedDate), "MMMM d, yyyy")}
          </h3>
          <Calendar
            localizer={localizer}
            events={[]}
            startAccessor="start"
            endAccessor="end"
            date={parseISO(selectedDate)}
            view={Views.MONTH}
            onView={(newView) => onView(newView)}
            onNavigate={onNavigate}
            onSelectSlot={handleDateSelect}
            selectable
            style={{ height: 400 }}
            components={{
              toolbar: (toolbarProps) => (
                <div className="rbc-toolbar flex justify-between items-center mb-2">
                  <div className="rbc-btn-group space-x-2">
                    <Button
                      onClick={() => onNavigate("TODAY")}
                      className="rbc-button rbc-button-today bg-gray-200 hover:bg-gray-300 text-gray-800 px-2 py-1 rounded"
                    >
                      Today
                    </Button>
                    <Button
                      onClick={() => onNavigate("PREV")}
                      className="rbc-button rbc-button-prev bg-gray-200 hover:bg-gray-300 text-gray-800 px-2 py-1 rounded"
                    >
                      Back
                    </Button>
                    <Button
                      onClick={() => onNavigate("NEXT")}
                      className="rbc-button rbc-button-next bg-gray-200 hover:bg-gray-300 text-gray-800 px-2 py-1 rounded"
                    >
                      Next
                    </Button>
                  </div>
                  <span className="rbc-toolbar-label text-lg font-medium">
                    {format(currentMonth, "MMMM yyyy")}
                  </span>
                  <div className="rbc-btn-group space-x-2">
                    <Button
                      onClick={() => onView(Views.MONTH)}
                      className={`rbc-button ${
                        view === Views.MONTH
                          ? "bg-blue-500 text-white"
                          : "bg-gray-200 hover:bg-gray-300 text-gray-800"
                      } px-2 py-1 rounded`}
                    >
                      Month
                    </Button>
                    <Button
                      onClick={() => onView(Views.WEEK)}
                      className={`rbc-button ${
                        view === Views.WEEK
                          ? "bg-blue-500 text-white"
                          : "bg-gray-200 hover:bg-gray-300 text-gray-800"
                      } px-2 py-1 rounded`}
                    >
                      Week
                    </Button>
                    <Button
                      onClick={() => onView(Views.DAY)}
                      className={`rbc-button ${
                        view === Views.DAY
                          ? "bg-blue-500 text-white"
                          : "bg-gray-200 hover:bg-gray-300 text-gray-800"
                      } px-2 py-1 rounded`}
                    >
                      Day
                    </Button>
                  </div>
                </div>
              ),
              dateCellWrapper: (props) => {
                const isSelected =
                  format(props.value, "yyyy-MM-dd") === selectedDate;
                const isAvailable = availableDays.some((day) =>
                  isSameDay(day, props.value)
                );
                return (
                  <div
                    {...props}
                    className={`rbc-date-cell ${
                      isSelected
                        ? "bg-blue-500 text-white"
                        : isAvailable
                        ? "bg-blue-200 hover:bg-blue-300 text-gray-800"
                        : "bg-white hover:bg-gray-100 text-gray-800"
                    } border rounded-md cursor-pointer`}
                    onClick={() =>
                      handleDateSelect({
                        start: props.value,
                        end: props.value,
                        slots: [props.value],
                        action: "select",
                      } as SlotInfo)
                    }
                  />
                );
              },
            }}
            className="border rounded-md shadow-sm"
          />
        </div>
        <div className="w-full md:w-1/2">
          {availableSlots.length === 0 ? (
            <p className="text-red-600">
              No time slots available on this date.
            </p>
          ) : (
            <div className="space-y-2">
              <h3 className="text-lg font-semibold mb-2">Available Times</h3>
              {availableSlots.map((slot) => (
                <Button
                  key={slot.id}
                  onClick={() => {
                    setSelectedSlot(slot);
                    setIsReservationDialogOpen(true);
                  }}
                  className="w-full bg-green-500 text-white hover:bg-green-600 py-2 rounded-md"
                >
                  {format(slot.start, "h:mm a")} - {format(slot.end, "h:mm a")}
                </Button>
              ))}
            </div>
          )}
        </div>
      </div>

      <Dialog
        open={isReservationDialogOpen}
        onOpenChange={(open: any) => setIsReservationDialogOpen(open)}
      >
        <DialogContent className="bg-gray-800 text-white p-6 rounded-lg shadow-lg max-w-md w-full fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
          <div className="mb-4">
            <h2 className="text-lg font-semibold">Confirm Reservation</h2>
            <button
              onClick={() => setIsReservationDialogOpen(false)}
              className="absolute top-2 right-2 text-white hover:text-gray-300"
            >
              ✕
            </button>
          </div>
          {selectedSlot && (
            <div className="mb-4">
              {isSequential && selectedSlot.sequentialSlots ? (
                <div>
                  <p>Reserve the following sequential slots:</p>
                  <ul className="list-disc pl-5">
                    {selectedSlot.sequentialSlots.map(
                      (slot: any, index: number) => (
                        <li key={index}>
                          {slot.location}: {format(slot.start, "h:mm a")} -{" "}
                          {format(slot.end, "h:mm a")}
                        </li>
                      )
                    )}
                  </ul>
                </div>
              ) : (
                <p>
                  Reserve {selectedSlot.title} for all selected locations at{" "}
                  {format(selectedSlot.start, "h:mm a")} -{" "}
                  {format(selectedSlot.end, "h:mm a")}?
                </p>
              )}
            </div>
          )}
          <div className="flex justify-end gap-2">
            <Button
              onClick={() => {
                console.log("Cancel clicked, closing dialog");
                setIsReservationDialogOpen(false);
              }}
              className="bg-blue-500 text-white hover:bg-blue-600 px-4 py-2 rounded"
            >
              Cancel
            </Button>
            <Button
              onClick={() => {
                console.log(
                  "Confirm clicked, attempting reservation with:",
                  selectedSlot
                );
                handleCreateReservation(selectedSlot);
                setIsReservationDialogOpen(false);
              }}
              className="bg-green-500 text-white hover:bg-green-600 px-4 py-2 rounded"
            >
              Confirm
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
