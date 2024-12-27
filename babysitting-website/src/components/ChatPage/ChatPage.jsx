import React, { useState, useEffect, useRef } from "react";
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
import SendIcon from "@mui/icons-material/Send";
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
  orderBy,
  limit,
} from "firebase/firestore";
import { format } from "date-fns";
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
  const messagesEndRef = useRef(null);

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
        let users = [...babysitters, ...guardians];
        const usersWithMessages = await Promise.all(
          users.map(async (user) => {
            const chatId = [currentUser.uid, user.userId].sort().join("-");
            const messagesRef = collection(
              FIREBASE_DB,
              `chats/${chatId}/messages`
            );
            const messagesSnapshot = await getDocs(messagesRef);
            if (!messagesSnapshot.empty) {
              const lastMessageQuery = query(
                messagesRef,
                orderBy("timestamp", "desc"),
                limit(1)
              );
              const lastMessageSnapshot = await getDocs(lastMessageQuery);
              const lastMessage = lastMessageSnapshot.docs[0]?.data() || {
                timestamp: 0,
              };
              return { ...user, lastMessageTimestamp: lastMessage.timestamp };
            }
            return null;
          })
        );
        const filteredUsers = usersWithMessages.filter((user) => user !== null);
        filteredUsers.sort(
          (a, b) => b.lastMessageTimestamp - a.lastMessageTimestamp
        );
        setUserList(filteredUsers);
        if (filteredUsers.length > 0) {
          setSelectedUser(filteredUsers[0]);
        }
      };

      fetchUsers();
    }
  }, [currentUser]);

  useEffect(() => {
    if (selectedUser && currentUser) {
      const chatId = [currentUser.uid, selectedUser.userId].sort().join("-");

      const messagesRef = collection(FIREBASE_DB, `chats/${chatId}/messages`);
      const orderedMessagesQuery = query(
        messagesRef,
        orderBy("timestamp", "asc")
      );

      const unsubscribe = onSnapshot(orderedMessagesQuery, (snapshot) => {
        const newMessages = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setMessages(newMessages);
      });

      return () => unsubscribe();
    }
  }, [selectedUser, currentUser]);

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSearch = async () => {
    const searchQueryLower = searchQuery.trim().toLowerCase();

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

    let usersToDisplay = [];

    if (searchQueryLower) {
      const isCurrentUserBabysitter = babysitters.some(
        (user) => user.userId === currentUser.uid
      );
      const isCurrentUserGuardian = guardians.some(
        (user) => user.userId === currentUser.uid
      );

      if (isCurrentUserBabysitter) {
        usersToDisplay = guardians.filter(
          (user) =>
            user.userId !== currentUser.uid &&
            (user.firstName.toLowerCase().includes(searchQueryLower) ||
              user.lastName.toLowerCase().includes(searchQueryLower))
        );
      } else if (isCurrentUserGuardian) {
        usersToDisplay = babysitters.filter(
          (user) =>
            user.userId !== currentUser.uid &&
            (user.firstName.toLowerCase().includes(searchQueryLower) ||
              user.lastName.toLowerCase().includes(searchQueryLower))
        );
      }
    }

    if (selectedUser) {
      const selectedUserIndex = usersToDisplay.findIndex(
        (user) => user.userId === selectedUser.userId
      );
      if (selectedUserIndex !== -1) {
        usersToDisplay.splice(selectedUserIndex, 1);
      }
      usersToDisplay.unshift(selectedUser);
    }

    setUserList(usersToDisplay);
  };

  const sendMessage = async () => {
    if (newMessage.trim() && currentUser && selectedUser) {
      const chatId = [currentUser.uid, selectedUser.userId].sort().join("-");
      const messagesRef = collection(FIREBASE_DB, `chats/${chatId}/messages`);

      try {
        console.log("Sending message:", newMessage);

        const chatDocRef = doc(FIREBASE_DB, "chats", chatId);
        const chatDoc = await getDoc(chatDocRef);

        if (!chatDoc.exists()) {
          if (!currentUser || !selectedUser) {
            console.error("Current user or selected user is not defined.");
            return;
          }

          await setDoc(chatDocRef, {
            createdAt: new Date().getTime(),
            participants: [currentUser.uid, selectedUser.userId],
          });
        }

        // Now send the message
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
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleSearch();
                }
              }}
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
                button="true"
                key={user.id}
                selected={selectedUser?.userId === user.userId}
                onClick={() => setSelectedUser(user)}
                sx={{
                  backgroundColor:
                    selectedUser?.userId === user.userId
                      ? "#d1d4f6"
                      : "inherit",
                }}
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
            {messages.length === 0 && selectedUser ? (
              <Box
                display="flex"
                flexDirection="column"
                alignItems="center"
                justifyContent="center"
                height="100%"
                textAlign="center"
              >
                <Avatar
                  src={selectedUser.photo}
                  sx={{ width: 120, height: 120, mb: 2 }}
                />
                <Typography variant="h6">
                  {selectedUser.firstName} {selectedUser.lastName}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  No messages yet. Start the conversation!
                </Typography>
              </Box>
            ) : (
              messages.map((message) => (
                <Box
                  key={message.id}
                  display="flex"
                  justifyContent={
                    message.senderId === currentUser.uid
                      ? "flex-end"
                      : "flex-start"
                  }
                  marginBottom="10px"
                >
                  {" "}
                  <Box
                    sx={{
                      backgroundColor:
                        message.senderId === currentUser.uid
                          ? "#5e62d1"
                          : "#ddd",
                      color:
                        message.senderId === currentUser.uid ? "#fff" : "#000",
                      padding: "10px",
                      borderRadius: "10px",
                      maxWidth: "70%",
                      wordWrap: "break-word",
                    }}
                  >
                    {" "}
                    <Typography>{message.text}</Typography>{" "}
                    <Typography
                      variant="caption"
                      sx={{
                        marginTop: "2px",
                        color:
                          message.senderId === currentUser.uid
                            ? "#d3d3d3"
                            : "555",
                      }}
                    >
                      {" "}
                      {format(
                        new Date(message.timestamp),
                        "dd/MM/yyyy hh:mm a"
                      )}{" "}
                    </Typography>{" "}
                  </Box>{" "}
                </Box>
              ))
            )}
            <div ref={messagesEndRef} />
          </Messages>
          <InputContainer>
            <TextField
              fullWidth
              variant="outlined"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  sendMessage();
                }
              }}
              placeholder="Type your message"
              sx={{ borderRadius: "10px" }}
            />
            <IconButton
              onClick={sendMessage}
              sx={{
                color: "#5e62d1",
                padding: "10px",
                transition: "all 0.3s ease-in-out",
                "&:hover": {
                  color: "#4a54c1",
                  transform: "scale(1.1)",
                },
              }}
            >
              <SendIcon />
            </IconButton>
          </InputContainer>
        </MessageListContainer>
      </Box>
    </ChatContainer>
  );
};

export default ChatPage;
