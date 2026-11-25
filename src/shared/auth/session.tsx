import { platform } from "../api/platform";
import { WORKFLOW_KEYS } from "../api/domain";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  type ReactNode,
} from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  signIn as signInRequest,
  signInDemo as signInDemoRequest,
} from "../api/auth.api";
import type { User } from "../api/types";
import { useAppDispatch, useAppSelector } from "../state/hooks";
import { restoreSession, signedIn, signedOut } from "../state/sessionSlice";

const STORAGE_KEY = "scw.session.userId";

interface SessionValue {
  user: User | null;
  /** True while a stored session is being restored on first load. */
  restoring: boolean;
  signIn: (email: string, password: string) => Promise<User>;
  /** One-click sign-in with a sample account (only when the API allows demo sign-in). */
  signInDemo: (email: string) => Promise<User>;
  signOut: () => void;
}

/** The actions; the state itself (user, restoring) lives in the Redux store. */
type SessionActions = Pick<SessionValue, "signIn" | "signInDemo" | "signOut">;
const SessionContext = createContext<SessionActions | null>(null);

export function readStoredUserId(): string | null {
  try {
    return localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

function writeStoredUserId(userId: string | null): void {
  try {
    if (userId) localStorage.setItem(STORAGE_KEY, userId);
    else localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* storage can be unavailable (private mode); the session then lasts for the page lifetime */
  }
}

export function SessionProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const dispatch = useAppDispatch();

  useEffect(() => {
    const storedUserId = readStoredUserId();
    if (!storedUserId) return;
    void dispatch(restoreSession(storedUserId))
      .unwrap()
      .then((restored) => {
        if (!restored) writeStoredUserId(null);
      });
  }, [dispatch]);

  useEffect(() => {
    const clear = () => {
      writeStoredUserId(null);
      queryClient.clear();
      dispatch(signedOut());
    };
    window.addEventListener("codecash:unauthorized", clear);
    const refresh = () =>
      void queryClient.invalidateQueries({
        predicate: (query) =>
          WORKFLOW_KEYS.includes(String(query.queryKey[0])) ||
          (query.queryKey[0] === "resource" &&
            [
              "audit",
              "documents",
              "contract-drafts",
              "milestone-templates",
            ].includes(String(query.queryKey[1]))),
      });
    window.addEventListener("codecash:workflow-changed", refresh);
    return () => {
      window.removeEventListener("codecash:unauthorized", clear);
      window.removeEventListener("codecash:workflow-changed", refresh);
    };
  }, [queryClient, dispatch]);
  const start = useCallback(
    (user: User) => {
      writeStoredUserId(user.id);
      queryClient.clear();
      dispatch(signedIn(user));
      return user;
    },
    [queryClient, dispatch],
  );
  const signIn = useCallback(
    async (email: string, password: string) =>
      start(await signInRequest(email, password)),
    [start],
  );
  const signInDemo = useCallback(
    async (email: string) => start(await signInDemoRequest(email)),
    [start],
  );

  const signOut = useCallback(() => {
    void platform.post("/auth/logout", {}).catch(() => {});
    localStorage.removeItem("codecash.accessToken");
    writeStoredUserId(null);
    queryClient.clear();
    dispatch(signedOut());
  }, [queryClient, dispatch]);

  const value = useMemo(
    () => ({ signIn, signInDemo, signOut }),
    [signIn, signInDemo, signOut],
  );

  return (
    <SessionContext.Provider value={value}>{children}</SessionContext.Provider>
  );
}

/** Same shape as before the Redux store: screens keep calling useSession() unchanged. */
export function useSession(): SessionValue {
  const actions = useContext(SessionContext);
  const { user, restoring } = useAppSelector((state) => state.session);
  if (!actions)
    throw new Error("useSession must be used inside <SessionProvider>");
  return { user, restoring, ...actions };
}

/** For screens that only render for a signed-in user. */
export function useCurrentUser(): User {
  const { user } = useSession();
  if (!user) throw new Error("useCurrentUser called without a signed-in user");
  return user;
}
