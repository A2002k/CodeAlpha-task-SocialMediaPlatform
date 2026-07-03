import "./Navbar.css";
import {
  House,
  Search,
  Bell,
  MessageCircle,
  PlusSquare,
  LogOut,
} from "lucide-react";
import { useEffect, useState } from "react";
import API from "../../src/api/axios";
import { useUser } from "../../src/context/UserContext";
import { Link } from "react-router-dom";

function Navbar() {
  const { user, setUser } = useUser();

  const [unreadCount, setUnreadCount] = useState(0);
  const [unreadMessages, setUnreadMessages] = useState(0);

  const logout = () => {
    sessionStorage.removeItem("token");
    setUser(null);
    window.location.href = "/";
  };

  useEffect(() => {
    const fetchUnreadNotifications = async () => {
      try {
        const res = await API.get("/notifications");
        const unread = res.data.filter((n) => !n.isRead).length;
        setUnreadCount(unread);
      } catch (err) {
        console.log(err.response?.data || err.message);
      }
    };

    const fetchUnreadMessages = async () => {
      try {
        const res = await API.get("/messages/unread/count");
        setUnreadMessages(res.data.count);
      } catch (err) {
        console.log(err.response?.data || err.message);
      }
    };

    fetchUnreadNotifications();
    fetchUnreadMessages();

    const interval = setInterval(() => {
      fetchUnreadNotifications();
      fetchUnreadMessages();
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <nav className="navbar">
      <div className="nav-logo">◎ SocialSphere</div>

      <Link to="/search" className="nav-search">
        <Search size={18} />
        <input type="text" placeholder="Search users..." readOnly />
      </Link>

      <div className="nav-actions">
        <Link to="/home" className="nav-icon-btn" title="Home">
          <House size={21} />
        </Link>

       <button className="nav-icon-btn" title="Create Post"
        onClick={() => window.dispatchEvent(new Event("openCreatePostModal"))}>
        <PlusSquare size={21} />
        </button>

        <Link to="/chat" className="nav-icon-btn notification-bell" title="Messages">
          <MessageCircle size={21} />

          {unreadMessages > 0 && (
            <span className="notification-badge">{unreadMessages}</span>
          )}
        </Link>

        <Link
          to="/notifications"
          className="nav-icon-btn notification-bell"
          title="Notifications"
        >
          <Bell size={21} />

          {unreadCount > 0 && (
            <span className="notification-badge">{unreadCount}</span>
          )}
        </Link>

        <Link to={`/profile/${user?._id || user?.id}`} className="nav-user">
          <div className="nav-avatar">
            {user?.profileImage ? (
              <img src={user.profileImage} alt={user.name} />
            ) : (
              user?.name?.charAt(0)
            )}
          </div>

          <span>{user?.name}</span>
        </Link>

        <button className="logout-btn" onClick={logout}>
          <LogOut size={18} />
          Logout
        </button>
      </div>
    </nav>
  );
}

export default Navbar;