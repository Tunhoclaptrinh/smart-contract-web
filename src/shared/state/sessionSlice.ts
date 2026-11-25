import {
  createAsyncThunk,
  createSlice,
  type PayloadAction,
} from "@reduxjs/toolkit";
import { getUser } from "../api/auth.api";
import type { User } from "../api/types";

/** Who is signed in. Server data stays in TanStack Query; this is client state shared app-wide. */
export interface SessionState {
  user: User | null;
  /** True while a stored session is being restored on first load. */
  restoring: boolean;
}

export const initialSessionState = (restoring: boolean): SessionState => ({
  user: null,
  restoring,
});

/** Asks the API who the stored token belongs to; null when it is no longer valid. */
export const restoreSession = createAsyncThunk(
  "session/restore",
  (userId: string) => getUser(userId),
);

export const sessionSlice = createSlice({
  name: "session",
  initialState: initialSessionState(false),
  reducers: {
    signedIn(state, action: PayloadAction<User>) {
      state.user = action.payload;
      state.restoring = false;
    },
    signedOut(state) {
      state.user = null;
      state.restoring = false;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(restoreSession.pending, (state) => {
        state.restoring = true;
      })
      .addCase(restoreSession.fulfilled, (state, action) => {
        state.user = action.payload;
        state.restoring = false;
      })
      .addCase(restoreSession.rejected, (state) => {
        state.user = null;
        state.restoring = false;
      });
  },
});

export const { signedIn, signedOut } = sessionSlice.actions;
