import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
export type ThemeMode = "light" | "dark";
const Context = createContext({
  themeMode: "light" as ThemeMode,
  setThemeMode: (_: ThemeMode) => {},
  toggleTheme: () => {},
});
export function AppConfigProvider({ children }: { children: ReactNode }) {
  const [themeMode, setThemeMode] = useState<ThemeMode>(() => {
    try {
      return localStorage.getItem("scw.theme") === "dark" ? "dark" : "light";
    } catch {
      return "light";
    }
  });
  useEffect(() => {
    document.documentElement.dataset.theme = themeMode;
  }, [themeMode]);
  const change = (mode: ThemeMode) => {
    setThemeMode(mode);
    try {
      localStorage.setItem("scw.theme", mode);
    } catch {}
  };
  return (
    <Context.Provider
      value={{
        themeMode,
        setThemeMode: change,
        toggleTheme: () => change(themeMode === "light" ? "dark" : "light"),
      }}
    >
      {children}
    </Context.Provider>
  );
}
export const useAppConfig = () => useContext(Context);
