import React, { useState, useEffect } from "react";
import {
  Box,
  List,
  ListItem,
  ListItemAvatar,
  Avatar,
  ListItemText,
  Typography,
  TextField,
  Button,
  IconButton,
  Tooltip,
} from "@mui/material";
import { styled } from "@mui/system";
import {
  collection,
  query,
  where,
  onSnapshot,
  getDocs,
  getDoc,
  doc,
  setDoc,
  addDoc,
} from "firebase/firestore";
import { getAuth } from "firebase/auth";
import SearchIcon from "@mui/icons-material/Search";
import { FIREBASE_DB } from "../../config/firebase";
import DefaultUserImage from "../../assets/Babysitter-image.webp";

const ChatContainer = styled(Box)({
  display: "flex",
  flexDirection: "column",
  height: "100vh",
  backgroundColor: "#f4f4f4",
  paddingTop: "80px",
});

const UserListContainer = styled(Box)({
  flex: 1,
  overflowY: "auto",
  maxWidth: "300px",
  borderRight: "1px solid #ddd",
});

const MessageListContainer = styled(Box)({
  flex: 2,
  display: "flex",
  flexDirection: "column",
  justifyContent: "space-between",
  padding: "20px",
});

const Messages = styled(Box)({
  flex: 1,
  overflowY: "auto",
  marginBottom: "20px",
});

const InputContainer = styled(Box)({
  display: "flex",
  gap: "10px",
});

const ChatPage = () => {
  const auth = getAuth();
  const [currentUser, setCurrentUser] = useState(null);
  const [userList, setUserList] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) setCurrentUser(user);
    });
    return () => unsubscribe();
  }, [auth]);

  useEffect(() => {
    if (currentUser) {
      const fetchUsers = async () => {
        const babysittersRef = collection(FIREBASE_DB, "babysitters");
        const guardiansRef = collection(FIREBASE_DB, "guardians");

        const [babysittersSnapshot, guardiansSnapshot] = await Promise.all([
          getDocs(query(babysittersRef)),
          getDocs(query(guardiansRef)),
        ]);

        const babysitters = babysittersSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        const guardians = guardiansSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        setUserList([...babysitters, ...guardians]);
      };

      fetchUsers();
    }
  }, [currentUser]);

  useEffect(() => {
    if (selectedUser && currentUser) {
      const chatId = [currentUser.uid, selectedUser.id].sort().join("_");

      const messagesRef = collection(FIREBASE_DB, `chats/${chatId}/messages`);

      const unsubscribe = onSnapshot(messagesRef, (snapshot) => {
        const newMessages = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setMessages(newMessages);
      });

      return () => unsubscribe();
    }
  }, [selectedUser, currentUser]);

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      // Reset the user list if the search query is empty
      const babysittersRef = collection(FIREBASE_DB, "babysitters");
      const guardiansRef = collection(FIREBASE_DB, "guardians");

      const [babysittersSnapshot, guardiansSnapshot] = await Promise.all([
        getDocs(query(babysittersRef)),
        getDocs(query(guardiansRef)),
      ]);

      const babysitters = babysittersSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      const guardians = guardiansSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setUserList([...babysitters, ...guardians]);
      return;
    }

    const babysittersRef = collection(FIREBASE_DB, "babysitters");
    const guardiansRef = collection(FIREBASE_DB, "guardians");

    const [babysittersSnapshot, guardiansSnapshot] = await Promise.all([
      getDocs(
        query(
          babysittersRef,
          where("firstName", ">=", searchQuery),
          where("firstName", "<=", searchQuery + "\uf8ff")
        )
      ),
      getDocs(
        query(
          guardiansRef,
          where("firstName", ">=", searchQuery),
          where("firstName", "<=", searchQuery + "\uf8ff")
        )
      ),
    ]);

    const babysitters = babysittersSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    const guardians = guardiansSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    setUserList([...babysitters, ...guardians]);
  };

  const sendMessage = async () => {
    if (newMessage.trim() && currentUser && selectedUser) {
      const chatId = [currentUser.uid, selectedUser.id].sort().join("_");
      const messagesRef = collection(FIREBASE_DB, `chats/${chatId}/messages`);

      try {
        console.log("Sending message:", newMessage);

        const chatDocRef = doc(FIREBASE_DB, "chats", chatId);
        const chatDoc = await getDoc(chatDocRef);

        if (!chatDoc.exists()) {
          await setDoc(chatDocRef, {
            createdAt: new Date().getTime(),
            participants: [currentUser.uid, selectedUser.id],
          });
        }

        await addDoc(messagesRef, {
          text: newMessage,
          senderId: currentUser.uid,
          timestamp: new Date().getTime(),
        });

        setNewMessage("");
      } catch (error) {
        console.error("Error sending message:", error);
      }
    } else {
      console.log("No message or user selected.");
    }
  };

  return (
    <ChatContainer>
      <Box display="flex" height="100%">
        <UserListContainer>
          <Box padding="10px">
            <TextField
              fullWidth
              variant="outlined"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name"
              InputProps={{
                endAdornment: (
                  <Tooltip title="Search" arrow>
                    <IconButton
                      onClick={handleSearch}
                      style={{
                        backgroundColor: "#5e62d1",
                        color: "#fff",
                        padding: "10px",
                        borderRadius: "50%",
                        transition: "transform 0.2s, background-color 0.2s",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = "#4248a6";
                        e.currentTarget.style.transform = "scale(1.1)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = "#5e62d1";
                        e.currentTarget.style.transform = "scale(1)";
                      }}
                    >
                      <SearchIcon />
                    </IconButton>
                  </Tooltip>
                ),
              }}
            />
          </Box>
          <List>
            {userList.map((user) => (
              <ListItem
                button
                key={user.id}
                selected={selectedUser?.id === user.id}
                onClick={() => setSelectedUser(user)}
              >
                <ListItemAvatar>
                  <Avatar src={user.photo || DefaultUserImage} />
                </ListItemAvatar>
                <ListItemText
                  primary={`${user.firstName} ${user.lastName}`}
                  secondary={user.lastMessage}
                />
              </ListItem>
            ))}
          </List>
        </UserListContainer>
        <MessageListContainer>
          <Messages>
            {messages.map((message, index) => (
              <Box
                key={index}
                display="flex"
                justifyContent={
                  message.senderId === currentUser.uid
                    ? "flex-end"
                    : "flex-start"
                }
                marginBottom="10px"
              >
                <Typography
                  sx={{
                    backgroundColor:
                      message.senderId === currentUser.uid ? "#5e62d1" : "#ddd",
                    color:
                      message.senderId === currentUser.uid ? "#fff" : "#000",
                    padding: "10px",
                    borderRadius: "10px",
                    maxWidth: "70%",
                    wordWrap: "break-word",
                  }}
                >
                  {message.text}
                </Typography>
              </Box>
            ))}
          </Messages>
          <InputContainer>
            <TextField
              fullWidth
              variant="outlined"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type your message"
            />
            <Button
              variant="contained"
              onClick={sendMessage}
              sx={{
                backgroundColor: "#5e62d1",
                "&:hover": { backgroundColor: "#4a54c1" },
              }}
            >
              Send
            </Button>
          </InputContainer>
        </MessageListContainer>
      </Box>
    </ChatContainer>
  );
};

export default ChatPage;
