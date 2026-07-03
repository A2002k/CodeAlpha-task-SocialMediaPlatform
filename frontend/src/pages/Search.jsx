import { useState } from "react";
import { Link } from "react-router-dom";
import API from "../api/axios";
import Navbar from "../../components/layout/Navbar";
import "../css/search.css";

function Search() {
  const [keyword, setKeyword] = useState("");
  const [users, setUsers] = useState([]);

  const searchUsers = async (value) => {
    setKeyword(value);

    if (!value.trim()) {
      setUsers([]);
      return;
    }

    try {
      const res = await API.get(`/users?search=${value}`);
      setUsers(res.data);
    } catch (err) {
      console.log(err.response?.data || err.message);
    }
  };

  return (
    <div className="search-page">
      <Navbar />

      <div className="search-container">
        <h1>Search Users</h1>

        <input
          type="text"
          placeholder="Search by name..."
          value={keyword}
          onChange={(e) => searchUsers(e.target.value)}
        />

        <div className="search-results">
          {users.map((user) => (
            <Link
              to={`/profile/${user._id}`}
              className="search-user-card"
              key={user._id}
            >
              <div className="search-avatar">
                {user.profileImage ? (
                  <img src={user.profileImage} alt={user.name} />
                ) : (
                  user.name?.charAt(0)
                )}
              </div>

              <div>
                <h3>{user.name}</h3>
                <p>{user.bio || "No bio yet"}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Search;