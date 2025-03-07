import { ChangeEvent } from "react";
import { Button } from "../../components/ui/button";
import { Label } from "../../components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import { Switch } from "../../components/ui/switch";

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

interface LocationSelectionScreenProps {
  sites: Site[];
  locations: Location[];
  selectedSite: string;
  selectedLocations: string[];
  selectedLocationsOrder: string[];
  isSequential: boolean;
  setIsSequential: (value: boolean) => void;
  onSiteChange: (siteId: string) => void;
  onLocationSelect: (locationId: string, checked: boolean) => void;
  onContinue: () => void;
}

export function LocationSelectionScreen({
  sites,
  locations,
  selectedSite,
  selectedLocations,
  selectedLocationsOrder,
  isSequential,
  setIsSequential,
  onSiteChange,
  onLocationSelect,
  onContinue,
}: LocationSelectionScreenProps) {
  const site = sites.find((s) => s._id === selectedSite);
  const filteredLocations = locations.filter(
    (loc) => loc.site === selectedSite
  );

  console.log("SITE", site);
  console.log("LOCATIONS", locations);
  console.log("Filtered Locations for Selected Site:", filteredLocations);
  console.log("Selected Locations:", selectedLocations);
  console.log("Selected Locations Order:", selectedLocationsOrder);

  const handleCheckboxChange = (locationId: string, checked: boolean) => {
    console.log(`Checkbox changed for location ${locationId}: ${checked}`);
    onLocationSelect(locationId, checked);
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Relativity Inc.</h1>
      <p className="text-gray-600">
        Welcome to C.A.S.T.L.E. scheduling page. Please select a facility and
        the locations that will be reserved.
      </p>
      <div className="mb-6">
        <Label htmlFor="site-selection" className="text-sm">
          Select Facility/Site
        </Label>
        <Select onValueChange={onSiteChange} value={selectedSite}>
          <SelectTrigger id="site-selection" className="w-full">
            <SelectValue placeholder="Select a facility/site" />
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
      <div className="flex items-center space-x-2 mb-4">
        <Label htmlFor="sequential-toggle" className="text-sm">
          Reserve Locations Sequentially (one after another)
        </Label>
        <Switch
          id="sequential-toggle"
          checked={isSequential}
          onCheckedChange={setIsSequential}
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        {filteredLocations.map((location) => {
          const isSelected = selectedLocations.includes(location._id || "");
          const selectionIndex = selectedLocationsOrder.indexOf(
            location._id || ""
          );
          const selectionOrder =
            selectionIndex !== -1 ? selectionIndex + 1 : null;

          return (
            <div
              key={location._id}
              className="p-4 bg-white border rounded-lg shadow-md hover:shadow-lg transition-shadow cursor-pointer flex flex-col items-start"
            >
              <div className="flex items-center space-x-2 w-full mb-2">
                <input
                  type="checkbox"
                  id={location._id}
                  checked={isSelected}
                  onChange={(e) =>
                    handleCheckboxChange(location._id || "", e.target.checked)
                  }
                  className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                  aria-label={`Select ${location.name} at ${
                    site?.BuildingSiteName || "No site"
                  }`}
                />
                <label
                  htmlFor={location._id}
                  className="text-lg font-bold flex-1"
                >
                  {location.name}
                  {selectionOrder && (
                    <span className="ml-2 text-sm text-gray-500">
                      (Selection #{selectionOrder})
                    </span>
                  )}
                </label>
              </div>
              <p className="text-gray-600 text-sm">
                {site?.BuildingSiteName || "No site selected"} -{" "}
                {location.description} ({location.capacity} capacity,{" "}
                {location.locationType})
              </p>
            </div>
          );
        })}
      </div>
      <Button
        onClick={onContinue}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-md"
        disabled={selectedLocations.length === 0}
      >
        Continue
      </Button>
    </div>
  );
}
