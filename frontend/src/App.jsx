import { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./Home";
import Header from "./Header";
import Footer from "./Footer";
import Auth from "./Auth";
import CreateGroup from "./CreateGroup";
import JoinMatch from "./JoinMatch";
import Account from "./Account";
import MatchDetailsPage from "./components/MatchDetailsPage";
import Legal from "./Legal&Support/Legal";
import Support from "./Legal&Support/Support";


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
      <Header user={user} setUser={setUser}/>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Auth setUser={setUser} />} />
        <Route path="/register" element={<Auth setUser={setUser} />} />
        <Route path="/create-group" element={<CreateGroup />} />
        <Route path="/join-group" element={<JoinMatch />} />
        <Route path="/account" element={<Account user={user} setUser={setUser} />} />
        <Route path="/match/:type/:id" element={<MatchDetailsPage />}/>
        <Route path="/legal" element={<Legal />}/>
        <Route path="/support" element={<Support/>}/>
      </Routes>
      <Footer />
    </BrowserRouter>
  );
}
