import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface Site {
  _id?: string; // Added _id to match MongoDB and frontend usage
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
  SignatureURL: string;
  ImageURL: string;
}

interface SitesState {
  sites: Site[];
}

const initialState: SitesState = {
  sites: [],
};

const sitesSlice = createSlice({
  name: "sites",
  initialState,
  reducers: {
    setSitesRedux: (state, action: PayloadAction<Site[]>) => {
      state.sites = action.payload;
    },
    removeSite: (state, action: PayloadAction<string>) => {
      state.sites = state.sites.filter((site) => site._id !== action.payload);
    },
  },
});

export const { setSitesRedux, removeSite } = sitesSlice.actions;
export default sitesSlice.reducer;
