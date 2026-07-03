import { useEffect, useState } from "react";
import Navbar from "../../components/layout/Navbar";
import API from "../api/axios";
import "../css/chat.css";
import { useLocation } from "react-router-dom";

function Chat() {
  const user = JSON.parse(sessionStorage.getItem("user"));
  const [conversations, setConversations] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const location = useLocation();

    useEffect(() => {
    fetchConversations();
    }, []);

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

        const openConversation = async (conversation) => {
        try {
            setActiveConversation(conversation);

            const res = await API.get(`/messages/${conversation._id}`);
            setMessages(res.data);

            await API.put(`/messages/${conversation._id}/read`);
        } catch (err) {
            console.log(err.response?.data || err.message);
        }
        };

  const getOtherUser = (conversation) => {
    return conversation.members.find(
      (member) => member._id !== user?._id && member._id !== user?.id
    );
  };

  const sendMessage = async (e) => {
    e.preventDefault();

    if (!text.trim() || !activeConversation) return;

    try {
      const res = await API.post("/messages", {
        conversationId: activeConversation._id,
        text,
      });

      setMessages([...messages, res.data]);
      setText("");
      fetchConversations();
    } catch (err) {
      alert(err.response?.data?.message || "Error sending message");
    }
  };

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
                    activeConversation?._id === conversation._id
                      ? "active"
                      : ""
                  }`}
                  key={conversation._id}
                  onClick={() => openConversation(conversation)}
                >
                  <div className="chat-avatar">
                    {otherUser?.profileImage ? (
                      <img
                        src={otherUser.profileImage}
                        alt={otherUser.name}
                      />
                    ) : (
                      otherUser?.name?.charAt(0)
                    )}
                  </div>

                  <div>
                    <strong>{otherUser?.name}</strong>
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
                  <span>Active now</span>
                </div>
              </div>

              <div className="messages-list">
                {messages.map((message) => {
                  const mine =
                    message.sender?._id === user?._id ||
                    message.sender?._id === user?.id;

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
              </div>

              <form className="message-form" onSubmit={sendMessage}>
                <input
                  type="text"
                  placeholder="Write a message..."
                  value={text}
                  onChange={(e) => setText(e.target.value)}
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