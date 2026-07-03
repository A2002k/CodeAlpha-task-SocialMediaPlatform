import { Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Home from "./pages/Home";
import Profile from "./pages/Profile";
import Search from "./pages/Search";
import Notifications from "./pages/Notifications";
import Chat from "./pages/Chat";
import PostDetails from "./pages/PostDetails";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/home" element={<Home />} />
      <Route path="/profile/:id" element={<Profile />} />
      <Route path="/search" element={<Search />} />
      <Route path="/notifications" element={<Notifications />} />
      <Route path="/chat" element={<Chat />} />
      <Route path="/post/:id" element={<PostDetails />} />
      
    </Routes>
  );
}

export default App;