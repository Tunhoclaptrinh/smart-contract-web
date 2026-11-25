import { configureStore } from "@reduxjs/toolkit";
import { initialSessionState, sessionSlice } from "./sessionSlice";

/**
 * Global client state (Redux Toolkit). One store per app; tests create their own with
 * `createAppStore()`. Add a slice here when state is shared by several screens and is not server
 * data (server data belongs to TanStack Query).
 */
export function createAppStore(options: { restoring?: boolean } = {}) {
  return configureStore({
    reducer: { session: sessionSlice.reducer },
    preloadedState: {
      session: initialSessionState(options.restoring ?? false),
    },
  });
}

export type AppStore = ReturnType<typeof createAppStore>;
export type RootState = ReturnType<AppStore["getState"]>;
export type AppDispatch = AppStore["dispatch"];
