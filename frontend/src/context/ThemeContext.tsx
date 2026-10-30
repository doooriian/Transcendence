import {
	createContext,
	useContext,
	useEffect,
	useState,
	type ReactNode,
} from "react";

type Theme = "blue";

const ThemeContext = createContext<{ theme: Theme }>({ theme: "blue" });

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme] = useState<Theme>("blue");

  useEffect(() => {
    document.body.classList.remove("bg-theme-blue");
    document.body.classList.add(`bg-theme-${theme}`);
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme }}>
      {children}
    </ThemeContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export const useTheme = () => useContext(ThemeContext);
