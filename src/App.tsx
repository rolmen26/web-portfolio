import * as React from "react";
import { BrowserRouter, Route, Routes, useLocation, useNavigate } from "react-router-dom";
import MainPortfolio from "@/components/Portfolio";
import { IdeWorkspace } from "@/components/ide/IdeWorkspace";
import { NotFound } from "@/components/NotFound";
import { projects, universityEasterProject } from "@/components/portfolio/data";
import { useKonamiCode } from "@/components/portfolio/hooks/useKonamiCode";
import {
  readStoredViewMode,
  usePortfolioPreferences,
} from "@/components/portfolio/hooks/usePortfolioPreferences";
import "./index.css";
import "./design-system/ide-workspace.css";

function PortfolioRoutes() {
  const location = useLocation();
  const navigate = useNavigate();
  const { darkMode, toggleDarkMode, viewMode, setViewMode } = usePortfolioPreferences();
  const { activated: konamiActivated, unlocked: universityProjectUnlocked } = useKonamiCode();

  const visibleProjects = React.useMemo(
    () => (universityProjectUnlocked ? [...projects, universityEasterProject] : projects),
    [universityProjectUnlocked]
  );

  React.useEffect(() => {
    const nextViewMode = location.pathname === "/workspace" ? "workspace" : "main";

    if (viewMode !== nextViewMode) {
      setViewMode(nextViewMode);
    }
  }, [location.pathname, setViewMode, viewMode]);

  const navigateToWorkspace = React.useCallback(() => {
    setViewMode("workspace");
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
    navigate("/workspace");
  }, [navigate, setViewMode]);

  const navigateToMainPortfolio = React.useCallback(() => {
    setViewMode("main");
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
    navigate("/");
  }, [navigate, setViewMode]);

  return (
    <Routes>
      <Route
        path="/"
        element={
          <MainPortfolio
            darkMode={darkMode}
            toggleDarkMode={toggleDarkMode}
            konamiActivated={konamiActivated}
            visibleProjects={visibleProjects}
            onEnterWorkspace={navigateToWorkspace}
          />
        }
      />
      <Route
        path="/workspace"
        element={
          <IdeWorkspace
            darkMode={darkMode}
            toggleDarkMode={toggleDarkMode}
            visibleProjects={visibleProjects}
            konamiActivated={konamiActivated}
            onReturnToMain={navigateToMainPortfolio}
          />
        }
      />
      <Route path="*" element={<NotFound onReturnToMain={navigateToMainPortfolio} />} />
    </Routes>
  );
}

function App() {
  const hasRestoredViewRef = React.useRef(false);

  if (!hasRestoredViewRef.current && typeof window !== "undefined") {
    hasRestoredViewRef.current = true;
    const shouldRestoreWorkspace =
      window.location.pathname === "/" && readStoredViewMode() === "workspace";

    if (shouldRestoreWorkspace) {
      window.history.replaceState(null, "", "/workspace");
    }
  }

  return (
    <BrowserRouter>
      <PortfolioRoutes />
    </BrowserRouter>
  );
}

export default App;
