import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "../../components/layout/Navbar";
import API from "../api/axios";
import "../css/notifications.css";

function Notifications() {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const res = await API.get("/notifications");
      setNotifications(res.data);
    } catch (err) {
      console.log(err.response?.data || err.message);
    }
  };

  const getNotificationLink = (notification) => {
    if (notification.post) {
      return `/post/${notification.post._id}`;
    }

    return `/profile/${notification.sender._id}`;
  };

  const markNotificationRead = async (id) => {
  try {
    await API.put(`/notifications/${id}/read`);

    setNotifications((prev) =>
      prev.map((n) =>
        n._id === id ? { ...n, isRead: true } : n
      )
    );
  } catch (err) {
    console.log(err.response?.data || err.message);
  }
};

  return (
    <div className="notifications-page">
      <Navbar />

      <div className="notifications-container">
        <h1>Notifications</h1>

        {notifications.length === 0 ? (
          <p className="no-notifications">No notifications yet</p>
        ) : (
          notifications.map((notification) => (
            <Link
                key={notification._id}
                to={getNotificationLink(notification)}
                onClick={() => markNotificationRead(notification._id)}
                className={`notification-card ${
                  !notification.isRead ? "unread" : ""
                }`}
              >
              <div className="notification-avatar">
                {notification.sender?.profileImage ? (
                  <img
                    src={notification.sender.profileImage}
                    alt={notification.sender.name}
                  />
                ) : (
                  notification.sender?.name?.charAt(0)
                )}
              </div>

              <div className="notification-info">
                <p>{notification.text}</p>
                <span>{new Date(notification.createdAt).toLocaleString()}</span>
              </div>

              {!notification.isRead && <span className="unread-dot"></span>}
            </Link>
          ))
        )}
      </div>
    </div>
  );
}

export default Notifications;