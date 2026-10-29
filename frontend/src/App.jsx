import { useState, useEffect, lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { GoogleOAuthProvider } from "@react-oauth/google";

import Header from "./Header";
import Footer from "./Footer";
import BottomNav from "./mobile/BottomNav";

import "./App.css";

const Home = lazy(() => import("./Home"));
const Auth = lazy(() => import("./Auth"));
const CreateGroup = lazy(() => import("./CreateGroup"));
const JoinMatch = lazy(() => import("./JoinMatch"));
const Account = lazy(() => import("./Account"));
const MatchDetailsPage = lazy(
  () => import("./components/MatchDetailsPage")
);
const Legal = lazy(() => import("./Legal&Support/Legal"));
const Support = lazy(() => import("./Legal&Support/Support"));
const PlayerProfiles = lazy(() => import("./PlayerProfiles"));

function PageLoader() {
  return (
    <div
      className="page-loader"
      role="status"
      aria-live="polite"
      aria-label="Loading page"
    >
      <div className="page-loader-spinner" aria-hidden="true" />
      <span className="page-loader-text">Loading...</span>
    </div>
  );
}

export default function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");

    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  return (
    <BrowserRouter>
      <Header user={user} setUser={setUser} />

      <main>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path="/" element={<Home />} />

            <Route
              path="/login"
              element={
                <GoogleOAuthProvider
                  clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}
                >
                  <Auth setUser={setUser} />
                </GoogleOAuthProvider>
              }
            />

            <Route
              path="/register"
              element={
                <GoogleOAuthProvider
                  clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}
                >
                  <Auth setUser={setUser} />
                </GoogleOAuthProvider>
              }
            />

            <Route path="/create-group" element={<CreateGroup />} />

            <Route path="/join-group" element={<JoinMatch />} />

            <Route
              path="/account"
              element={<Account user={user} setUser={setUser} />}
            />

            <Route
              path="/account/:id"
              element={<Account user={user} setUser={setUser} />}
            />

            <Route
              path="/match/:type/:id"
              element={<MatchDetailsPage />}
            />

            <Route path="/legal" element={<Legal />} />
            <Route path="/support" element={<Support />} />
            <Route
              path="/player-profiles"
              element={<PlayerProfiles />}
            />
          </Routes>
        </Suspense>
      </main>

      <Footer />
      <BottomNav user={user} />
    </BrowserRouter>
  );
}

