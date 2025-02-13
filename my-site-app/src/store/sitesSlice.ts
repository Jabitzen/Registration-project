import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface Site {
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
  },
});
export const { setSitesRedux } = sitesSlice.actions;
export default sitesSlice.reducer;
