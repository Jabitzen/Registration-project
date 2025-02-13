import { configureStore } from "@reduxjs/toolkit";
import sitesReducer from "./sitesSlice";
import coursesReducer from "./coursesSlice";

const store = configureStore({
  reducer: {
    sites: sitesReducer,
    courses: coursesReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>; // Define RootState type
export type AppDispatch = typeof store.dispatch;
export default store;
