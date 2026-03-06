import { lazy, Suspense } from "react";
import { Navigate, Route, Routes, useLocation, useNavigate } from "react-router-dom";
import { SidebarInset, SidebarProvider } from "synthex-ui/components";
import { useMobile } from "synthex-ui/hooks";
import { ThemeProvider } from "synthex-ui/theme";
import { MobileTopbar } from "./app/MobileTopbar";
import { usePreviewTheme } from "./app/usePreviewTheme";
import { AppSidebar } from "./components/AppSidebar";

const Builder = lazy(() => import("./components").then((module) => ({ default: module.Builder })));
const ComponentsPage = lazy(() => import("./pages/ComponentsPage").then((module) => ({ default: module.ComponentsPage })));
const DashboardPage = lazy(() => import("./pages/DashboardPage").then((module) => ({ default: module.DashboardPage })));
const DocsPage = lazy(() => import("./pages/DocsPage").then((module) => ({ default: module.DocsPage })));
const EnginePage = lazy(() => import("./pages/EnginePage").then((module) => ({ default: module.EnginePage })));
const InstallationPage = lazy(() => import("./pages/InstallationPage").then((module) => ({ default: module.InstallationPage })));
const ThemePage = lazy(() => import("./pages/ThemePage").then((module) => ({ default: module.ThemePage })));

function PreviewFallback() {
  return <div className="preview-loading">Loading preview…</div>;
}

export function App() {
  const location = useLocation();
  const navigate = useNavigate();
  const theme = usePreviewTheme();
  const isMobile = useMobile();

  if (location.pathname === "/playground") {
    return <ThemeProvider mode={theme.mode} theme={theme.themeOverrides}><div className="preview-site"><Suspense fallback={<PreviewFallback />}><Builder /></Suspense></div></ThemeProvider>;
  }

  return (
    <ThemeProvider mode={theme.mode} theme={theme.themeOverrides}>
      <div className="preview-site">
        <SidebarProvider defaultOpen={!isMobile}>
          <AppSidebar {...theme} />
          <SidebarInset className="preview-inset">
            <MobileTopbar
              mode={theme.mode}
              setMode={theme.setMode}
              accentPreset={theme.accentPreset}
              setAccentPreset={theme.setAccentPreset}
            />
            <main className="preview-main">
              <Suspense fallback={<PreviewFallback />}>
                <Routes>
                  <Route path="/" element={<DashboardPage onNavigate={navigate} />} />
                  <Route path="/installation" element={<InstallationPage />} />
                  <Route path="/components" element={<ComponentsPage />} />
                  <Route path="/theme" element={<ThemePage />} />
                  <Route path="/engine" element={<EnginePage />} />
                  <Route path="/docs" element={<DocsPage />} />
                  <Route path="/playground" element={<Builder />} />
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </Suspense>
            </main>
          </SidebarInset>
        </SidebarProvider>
      </div>
    </ThemeProvider>
  );
}
