# 🌍 Global Language Exchange

A real-time platform that connects people worldwide to practice languages through text, voice, or video — matched by **language pair**, **time zone**, and **interests**.

---

## ✨ Goal

Help users improve language skills by matching them with real people for live conversations, encouraging cultural exchange and consistent practice.

---

## 🧱 Tech Stack

| Layer       | Tech                                           |
| ----------- | ---------------------------------------------- |
| Frontend    | React + Tailwind CSS / Material UI             |
| Backend     | Node.js + Express                              |
| Database    | MongoDB (Mongoose)                             |
| Auth        | JWT + bcrypt                                   |
| Real-time   | Socket.io (chat + status updates)              |
| Video Calls | WebRTC (or daily.co integration)               |

---

## 🗂️ Project Structure

/client (React)
/components
/pages
/context
/services
/utils

/server (Node.js + Express)
/models
/routes
/controllers
/middlewares
/sockets


---

## 🚀 Key Features

### 🔐 Authentication
- JWT-based login/signup
- Optional OAuth (Google/Facebook)
- Onboarding: Choose known & learning languages

### 👤 User Profile
- Bio, country, time zone
- Languages + levels
- Availability window
- Profile picture

### 💡 Smart Matching System
- Match by:
  - Language pair
  - Timezone overlap
  - Interest tags
- Swiping interface or match feed

### 💬 Real-time Chat (Socket.io)
- Instant text chat
- Typing indicators
- Chat history in MongoDB
- Online/offline presence

### 🎥 Voice & Video Calling (WebRTC)
- One-on-one calls
- Mic/Camera toggle
- Call timer
- Post-call rating

### 💬 Conversation Prompts
- Random or AI-generated topics
- Timer-based topic switcher

### 🏅 XP & Gamification
- Earn XP for practicing
- Daily language streak tracker
- Optional leaderboards

### 🛠️ Admin Panel (Optional)
- User moderation
- Reported users
- Feature flags

---

## 🔒 Database Models (MongoDB)

### 🧑 User

```js
{
  name,
  email,
  passwordHash,
  languagesKnown: [{ language: "Spanish", level: "native" }],
  languagesLearning: [{ language: "English", level: "beginner" }],
  timeZone,
  availability: { start: "18:00", end: "22:00" },
  interests: ["travel", "music"],
  socketId,
  isOnline,
  profilePic,
  createdAt
}

💬 Message
{
  senderId,
  receiverId,
  content,
  timestamp,
  chatId
}

🤝 Chat
{
  user1Id,
  user2Id,
  messages: [messageId],
  startedAt,
  endedAt,
}

🧪 MVP Development Phases
✅ Phase 1: Core

Signup/Login

Create profile

Match users

Real-time text chat

Chat history

🔜 Phase 2: Voice/Video

WebRTC integration

Call UI

🚀 Phase 3: Extras

XP system

Admin dashboard


📦 Suggested Libraries

react-router-dom

axios

socket.io-client

react-hook-form

tailwindcss or @mui/material

jsonwebtoken, bcrypt

mongoose

cors, dotenv

🙌 Contribution

This is a solo project for now, but feel free to fork and suggest features or improvements!

📄 License

MIT License. Free to use and modify.
