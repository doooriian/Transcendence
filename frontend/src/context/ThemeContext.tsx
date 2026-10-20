import {
	createContext,
	useContext,
	useEffect,
	useState,
	type ReactNode,
} from "react";
import { getRandomInt } from "../utils/random";

type Theme = "brown" | "blue" | "pink";

const ThemeContext = createContext<{ theme: Theme }>({ theme: "pink" });

export function ThemeProvider({ children }: { children: ReactNode }) {

  const [theme] = useState<Theme>(() => {
    const rand = getRandomInt(1, 3);
    if (rand === 1) return "brown";
    if (rand === 2) return "blue";
    return "pink";
  });

  useEffect(() => {
    document.body.classList.remove(
      "bg-theme-brown",
      "bg-theme-blue",
      "bg-theme-pink"
    );

    document.body.classList.add(`bg-theme-${theme}`);
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
