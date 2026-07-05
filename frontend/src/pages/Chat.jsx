import { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
import Navbar from "../../components/layout/Navbar";
import API from "../api/axios";
import "../css/chat.css";
import { useLocation } from "react-router-dom";

const SOCKET_URL =
  import.meta.env.VITE_API_URL?.replace("/api", "") || "http://localhost:5000";

function Chat() {
  const storedUser = JSON.parse(sessionStorage.getItem("user"));
  const currentUserId = storedUser?._id || storedUser?.id;

  const socketRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  const [conversations, setConversations] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [typingUser, setTypingUser] = useState("");
  const [seenAt, setSeenAt] = useState(null);

  const location = useLocation();

  useEffect(() => {
    socketRef.current = io(SOCKET_URL, {
      withCredentials: true,
    });

    if (currentUserId) {
      socketRef.current.emit("join", currentUserId);
    }

    socketRef.current.on("receiveMessage", ({ conversationId, message }) => {
      if (activeConversation?._id === conversationId) {
        setMessages((prev) => [...prev, message]);
        API.put(`/messages/${conversationId}/read`);
      }

      fetchConversations();
    });

    socketRef.current.on("typing", ({ conversationId, senderName }) => {
      if (activeConversation?._id === conversationId) {
        setTypingUser(senderName);
      }
    });

    socketRef.current.on("stopTyping", () => {
      setTypingUser("");
    });

    socketRef.current.on("messagesSeen", ({ conversationId, seenAt }) => {
      if (activeConversation?._id === conversationId) {
        setSeenAt(seenAt);
      }
    });

    return () => {
      socketRef.current.disconnect();
    };
  }, [currentUserId, activeConversation?._id]);

  useEffect(() => {
    fetchConversations();
  }, [location.search]);

  const fetchConversations = async () => {
    try {
      const res = await API.get("/messages/conversations");
      setConversations(res.data);

      const params = new URLSearchParams(location.search);
      const conversationId = params.get("conversation");

      if (conversationId) {
        const selectedConversation = res.data.find(
          (conv) => conv._id === conversationId
        );

        if (selectedConversation) {
          openConversation(selectedConversation);
        }
      }
    } catch (err) {
      console.log(err.response?.data || err.message);
    }
  };

  const getOtherUser = (conversation) => {
    return conversation?.members?.find(
      (member) => member._id !== currentUserId
    );
  };

  const openConversation = async (conversation) => {
    try {
      setActiveConversation(conversation);
      setTypingUser("");
      setSeenAt(null);

      const res = await API.get(`/messages/${conversation._id}`);
      setMessages(res.data);

      await API.put(`/messages/${conversation._id}/read`);
    } catch (err) {
      console.log(err.response?.data || err.message);
    }
  };

  const handleTyping = (e) => {
    setText(e.target.value);

    const otherUser = getOtherUser(activeConversation);

    if (!otherUser || !socketRef.current) return;

    socketRef.current.emit("typing", {
      conversationId: activeConversation._id,
      receiverId: otherUser._id,
      senderName: storedUser?.name,
    });

    clearTimeout(typingTimeoutRef.current);

    typingTimeoutRef.current = setTimeout(() => {
      socketRef.current.emit("stopTyping", {
        receiverId: otherUser._id,
      });
    }, 1000);
  };

  const sendMessage = async (e) => {
    e.preventDefault();

    if (!text.trim() || !activeConversation) return;

    try {
      const res = await API.post("/messages", {
        conversationId: activeConversation._id,
        text,
      });

      setMessages((prev) => [...prev, res.data]);
      setText("");
      setSeenAt(null);
      fetchConversations();

      const otherUser = getOtherUser(activeConversation);

      if (otherUser && socketRef.current) {
        socketRef.current.emit("stopTyping", {
          receiverId: otherUser._id,
        });
      }
    } catch (err) {
      alert(err.response?.data?.message || "Error sending message");
    }
  };

  const lastMyMessage = [...messages]
    .reverse()
    .find((msg) => {
      const senderId = msg.sender?._id || msg.sender;
      return senderId === currentUserId;
    });

  return (
    <div className="chat-page">
      <Navbar />

      <div className="chat-container">
        <aside className="chat-sidebar">
          <h2>Messages</h2>

          {conversations.length === 0 ? (
            <p className="empty-chat">No conversations yet</p>
          ) : (
            conversations.map((conversation) => {
              const otherUser = getOtherUser(conversation);

              return (
                <button
                  className={`conversation-card ${
                    activeConversation?._id === conversation._id ? "active" : ""
                  }`}
                  key={conversation._id}
                  onClick={() => openConversation(conversation)}
                >
                  <div className="chat-avatar">
                    {otherUser?.profileImage ? (
                      <img src={otherUser.profileImage} alt={otherUser.name} />
                    ) : (
                      otherUser?.name?.charAt(0)
                    )}
                  </div>

                  <div>
                    <strong>{otherUser?.name || "Unknown User"}</strong>
                    <span>Open conversation</span>
                  </div>
                </button>
              );
            })
          )}
        </aside>

        <main className="chat-box">
          {!activeConversation ? (
            <div className="no-active-chat">
              <h2>Select a conversation</h2>
              <p>Choose someone from the left to start chatting.</p>
            </div>
          ) : (
            <>
              <div className="chat-header">
                <div className="chat-avatar small">
                  {getOtherUser(activeConversation)?.profileImage ? (
                    <img
                      src={getOtherUser(activeConversation).profileImage}
                      alt={getOtherUser(activeConversation).name}
                    />
                  ) : (
                    getOtherUser(activeConversation)?.name?.charAt(0)
                  )}
                </div>

                <div>
                  <h3>{getOtherUser(activeConversation)?.name}</h3>
                  <span>{typingUser ? "typing..." : "Active now"}</span>
                </div>
              </div>

              <div className="messages-list">
                {messages.map((message) => {
                  const senderId = message.sender?._id || message.sender;
                  const mine = senderId === currentUserId;

                  return (
                    <div
                      className={`message-row ${mine ? "mine" : "theirs"}`}
                      key={message._id}
                    >
                      <div className="message-bubble">
                        <p>{message.text}</p>
                      </div>
                    </div>
                  );
                })}

                {typingUser && (
                  <div className="typing-indicator">
                    {typingUser} is typing...
                  </div>
                )}

                {lastMyMessage && (seenAt || lastMyMessage.seenAt) && (
                  <div className="seen-text">
                    Seen at{" "}
                    {new Date(seenAt || lastMyMessage.seenAt).toLocaleTimeString(
                      [],
                      {
                        hour: "2-digit",
                        minute: "2-digit",
                      }
                    )}
                  </div>
                )}
              </div>

              <form className="message-form" onSubmit={sendMessage}>
                <input
                  type="text"
                  placeholder="Write a message..."
                  value={text}
                  onChange={handleTyping}
                />

                <button type="submit">Send</button>
              </form>
            </>
          )}
        </main>
      </div>
    </div>
  );
}

export default Chat;