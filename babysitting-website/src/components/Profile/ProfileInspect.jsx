import React, { useEffect, useState } from "react";
import {
    Box,
    Typography,
    Avatar,
    TextField,
    Button,
    Checkbox,
    Divider,
    Chip,
    Grid,
    Rating,
    MenuItem,
    IconButton,
    CircularProgress,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import MessageIcon from "@mui/icons-material/Message";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { useParams, useNavigate } from "react-router-dom";
import {
    collection,
    query,
    where,
    doc,
    docs,
    getDocs,
    updateDoc,
} from "firebase/firestore";
import { FIREBASE_DB } from "../../config/firebase";
import "../../style.css";
import { styled } from "@mui/system";

const StyledTextField = styled(TextField)({
    fontFamily: "'Poppins', sans-serif",
    color: "#5e62d1",
    "& .MuiInputBase-input": {
        fontFamily: "'Poppins', sans-serif",
    },
    "& .MuiOutlinedInput-root": {
        "& fieldset": {
            borderColor: "#ccc",
        },
        "&.Mui-focused fieldset": {
            borderColor: "#5e62d1",
        },
    },
    "& .MuiInputLabel-root.Mui-focused": {
        color: "#5e62d1",
    },
});

const ButtonStyle = styled(Button)({
    fontSize: "0.9rem",
    color: "#000",
    backgroundColor: "#ffffff",
    outline: "2px solid #5e62d1",
    padding: "8px 16px",
    marginRight: "8px",
    marginBottom: "8px",
    textTransform: "none",
    borderRadius: "25px",
    cursor: "default",
});

const childcareActivities = [
    "Arts and Crafts",
    "Storytelling",
    "Outdoor Play",
    "Meal Preparation",
    "Tutoring",
    "Nap Time Assistance",
];

const ageGroups = [
    "Infant (0-2 years)",
    "Toddler (3-5 years)",
    "Child (6-12 years)",
    "Teen (13+ years)",
];

const languages = [
    "Greek",
    "English",
    "Spanish",
    "French",
    "German",
    "Chinese",
    "Japanese",
    "Hindi",
    "Arabic",
    "Russian",
    "Portuguese",
    "Italian",
    "Korean",
];

const ProfileInspect = () => {
    const [roleRef, setRoleRef] = useState([]);
    const [roleSnapshot, setRoleSnapshot] = useState([]);
    const [usersSnapshot, setUsersSnapshot] = useState([]);
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [role, setRole] = useState(true);
    const [userId, setUserId] = useState(null);
    const navigate = useNavigate();
    const { profileUserID } = useParams();
    const [profileData, setProfileData] = useState({
        city: "",
        bio: "",
        experience: "",
        education: "",
        knownLanguages: [],
        childcareActivities: [],
        firstAidCertificateUploaded: [],
        numberOfChildren: "",
        firstname: "",
        lastname: "",
        childrenDescription: "",
        childrenAgeGroups: [],
    });

    useEffect(() => {
        const auth = getAuth();
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user) {
                setUserId(user.uid);
            } else {
                setUserId(null);
            }
        });
        return () => unsubscribe();
    }, []);

    useEffect(() => {
        const fetchProfileData = async (profileUserID) => {
            try {
                let userData = null;
                console.log("This is the id in url: ", profileUserID);
                const babysittersRef = query(
                    collection(FIREBASE_DB, "babysitters"),
                    where("userId", "==", profileUserID)
                );
                const babysittersSnapshot = await getDocs(babysittersRef);
                if (!babysittersSnapshot.empty) {
                    userData = babysittersSnapshot.docs.map((doc) => ({
                        id: doc.id,
                        ...doc.data(),
                    }))[0];
                    setProfileData(userData);
                } else {
                    const guardiansRef = query(
                        collection(FIREBASE_DB, "guardians"),
                        where("userId", "==", profileUserID)
                    );
                    const guardiansSnapshot = await getDocs(guardiansRef);
                    if (!guardiansSnapshot.empty) {
                        userData = guardiansSnapshot.docs.map((doc) => ({
                            id: doc.id,
                            ...doc.data(),
                        }))[0];
                        setProfileData(userData);
                        setRole(false);
                    }
                }

                if (!profileData)
                    throw new Error(`User with ID ${profileUserID} not found`);
                setLoading(false);
                return userId;
            } catch (error) {
                console.error("Error fetching user data:", error);
            } finally {
                setLoading(false);
                return null;
            }
        };

        const fetchReviews = async () => {
            try {
                // Mock data for reviews
                setReviews([
                    {
                        reviewer: "Guardian Name 1",
                        text: "Review 1",
                        rating: 4,
                    },
                    {
                        reviewer: "Guardian Name 2",
                        text: "Review 2",
                        rating: 5,
                    },
                ]);
            } catch (error) {
                console.error("Error fetching reviews:", error);
            }
        };
        fetchProfileData(profileUserID);
        fetchReviews();
    }, [profileUserID]);

    if (loading) {
        return (
            <Box
                sx={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    height: "100vh",
                    backgroundColor: "#f4f4f4",
                }}
            >
                <CircularProgress />
            </Box>
        );
    }

    const handleSendMessage = async () => {
        if (!profileData.id) {
            alert("No valid profile data to save.");
            return;
        }

        navigate(`/chats`, {
            state: { selectedUser: profileData }, // Passing selectedUser as state
        });
    };

    if (!profileData) {
        return (
            <Box sx={{ textAlign: "center", marginTop: "50px" }}>
                <Typography variant="h5">Profile not found</Typography>
                <Typography variant="body1">
                    Please log in to view your profile.
                </Typography>
            </Box>
        );
    }

    if (role) {
        // Babysitter case
        return (
            <Box>
                {/* Profile Heading */}
                <Box
                    sx={{
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        padding: "50px",
                        backgroundColor: "#f4f4f4",
                    }}
                >
                    <Typography
                        variant="h4"
                        sx={{
                            fontFamily: "Poppins, sans-serif",
                            fontWeight: "600",
                            marginTop: "50px",
                        }}
                    >
                        Profile
                    </Typography>
                </Box>

                {/* Profile Content */}
                <Box
                    sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        backgroundColor: "#f4f4f4",
                        pb: 4,
                    }}
                >
                    {/* Left Section - Profile Form */}
                    <Box
                        sx={{
                            flex: 2,
                            padding: "20px",
                            backgroundColor: "#fff",
                            borderRadius: "10px",
                            boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.1)",
                            marginLeft: "250px",
                        }}
                    >
                        {/* Profile Picture */}
                        <Box sx={{ textAlign: "center", marginBottom: "20px" }}>
                            <Avatar
                                src={profileData.photo}
                                alt={profileData.name}
                                sx={{
                                    width: 140,
                                    height: 140,
                                    margin: "0 auto",
                                    marginBottom: "10px",
                                }}
                            />
                            <Typography
                                sx={{
                                    fontFamily: "Poppins, sans-serif",
                                    fontWeight: "bold",
                                }}
                                variant="h6"
                            >{`${profileData.firstName} ${profileData.lastName}`}</Typography>
                            <Rating
                                value={profileData.rating}
                                readOnly
                                sx={{ margin: "10px 0" }}
                            />
                        </Box>
                        <Box
                            sx={{
                                display: "flex",
                                justifyContent: "center",
                                marginTop: "30px",
                            }}
                        >
                            <Button
                                variant="contained"
                                sx={{
                                    color: "#ffffff",
                                    backgroundColor: "#5e62d1",
                                    borderRadius: "30px",
                                    textTransform: "none",
                                    fontSize: "1rem",
                                    fontFamily: "Poppins, sans-serif",
                                    "&:hover": {
                                        backgroundColor: "#3c3fad",
                                    },
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "0.5rem", // Add space between the icon and text
                                }}
                                onClick={handleSendMessage}
                            >
                                Message
                                <MessageIcon
                                    sx={{ fontSize: "1.25rem" }}
                                />{" "}
                            </Button>
                        </Box>

                        {/* Editable Form */}
                        <Box>
                            <Typography
                                variant="body1"
                                sx={{
                                    marginLeft: "100px",
                                    fontFamily: "Poppins, sans-serif",
                                    fontWeight: "bold",
                                    marginTop: "20px",
                                }}
                            >
                                Area:{" "}
                                <Box
                                    component="span"
                                    sx={{ fontWeight: "normal" }}
                                >
                                    {profileData.city}
                                </Box>
                            </Typography>

                            <Typography
                                sx={{
                                    marginLeft: "100px",
                                    marginTop: "20px",
                                    fontFamily: "Poppins, sans-serif",
                                    fontWeight: "bold",
                                }}
                                variant="body1"
                            >
                                Bio:{" "}
                                <Box
                                    component="span"
                                    sx={{
                                        fontWeight: "normal",
                                        display: "block",
                                        width: "500px",
                                        wordWrap: "break-word",
                                        whiteSpace: "pre-line",
                                    }}
                                >
                                    {profileData.bio}
                                </Box>
                            </Typography>

                            <Typography
                                sx={{
                                    marginLeft: "100px",
                                    marginTop: "20px",
                                    fontFamily: "Poppins, sans-serif",
                                    fontWeight: "bold",
                                }}
                                variant="body1"
                            >
                                Experience:
                                <Box
                                    component="span"
                                    sx={{
                                        fontWeight: "normal",
                                        display: "block",
                                        width: "500px",
                                        wordWrap: "break-word",
                                        whiteSpace: "pre-line",
                                    }}
                                >
                                    {profileData.experience}
                                </Box>
                            </Typography>

                            <Typography
                                sx={{
                                    marginLeft: "100px",
                                    marginTop: "20px",
                                    fontFamily: "Poppins, sans-serif",
                                    fontWeight: "bold",
                                }}
                                variant="body1"
                            >
                                Level of Education:
                                <Box
                                    component="span"
                                    sx={{
                                        fontWeight: "normal",
                                        display: "block",
                                        width: "500px",
                                        wordWrap: "break-word",
                                        whiteSpace: "pre-line",
                                    }}
                                >
                                    {profileData.education}
                                </Box>
                            </Typography>

                            <Box
                                sx={{
                                    display: "flex",
                                    alignItems: "center",
                                    marginBottom: "15px",
                                }}
                            >
                                <Typography
                                    sx={{
                                        marginLeft: "100px",
                                        marginTop: "20px",
                                        fontFamily: "Poppins, sans-serif",
                                        fontWeight: "bold",
                                    }}
                                    variant="body1"
                                >
                                    First Aid Certification:
                                </Typography>
                                <Checkbox
                                    checked={
                                        profileData.firstAidCertificateUploaded ||
                                        false
                                    }
                                    sx={{
                                        marginTop: "20px",
                                        color: "#5e62d1", // Default color (unchecked)
                                        "&.Mui-checked": {
                                            color: "#5e62d1", // Checked color
                                        },
                                        "&:hover": {
                                            backgroundColor: "transparent",
                                        },
                                        transition: "none",
                                        pointerEvents: "none",
                                        cursor: "default",
                                    }}
                                />
                            </Box>

                            <Typography
                                sx={{
                                    marginLeft: "100px",
                                    marginTop: "20px",
                                    fontFamily: "Poppins, sans-serif",
                                    fontWeight: "bold",
                                }}
                                variant="body1"
                            >
                                Known Languages:
                            </Typography>
                            <Box
                                sx={{
                                    display: "flex",
                                    gap: "8px",
                                    justifyContent: "flex-start",
                                    flexWrap: "wrap",
                                    flex: 1,
                                    marginTop: "10px",
                                    marginLeft: "100px",
                                }}
                            >
                                {profileData.knownLanguages
                                    .slice()
                                    .sort((a, b) => a - b)
                                    .map((age, index) => (
                                        <ButtonStyle key={index}>
                                            {age}
                                        </ButtonStyle>
                                    ))}
                            </Box>

                            <Typography
                                sx={{
                                    marginLeft: "100px",
                                    marginTop: "20px",
                                    fontFamily: "Poppins, sans-serif",
                                    fontWeight: "bold",
                                }}
                                variant="body1"
                            >
                                Childcare Activities:
                            </Typography>
                            <Box
                                sx={{
                                    display: "flex",
                                    gap: "8px",
                                    justifyContent: "flex-start",
                                    flexWrap: "wrap",
                                    flex: 1,
                                    marginTop: "10px",
                                    marginLeft: "100px",
                                }}
                            >
                                {profileData.childcareActivities
                                    .slice()
                                    .sort((a, b) => a - b)
                                    .map((age, index) => (
                                        <ButtonStyle key={index}>
                                            {age}
                                        </ButtonStyle>
                                    ))}
                            </Box>
                        </Box>
                    </Box>

                    {/* Right Section - Reviews */}
                    <Box
                        sx={{
                            flex: 1,
                            padding: "20px",
                            backgroundColor: "#fff",
                            borderRadius: "10px",
                            boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.1)",
                            marginLeft: "20px",
                            marginRight: "250px",
                            height: "fit-content",
                        }}
                    >
                        <Typography variant="h6" sx={{ marginBottom: "20px" }}>
                            My Reviews
                        </Typography>
                        {reviews.map((review, index) => (
                            <Box
                                key={index}
                                sx={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "10px",
                                    marginBottom: "15px",
                                    padding: "10px",
                                    borderRadius: "8px",
                                    backgroundColor: "#f5f5f5",
                                }}
                            >
                                <Avatar sx={{ width: 40, height: 40 }}>
                                    {review.reviewer.charAt(0)}
                                </Avatar>
                                <Box>
                                    <Typography
                                        variant="body1"
                                        sx={{ fontWeight: "bold" }}
                                    >
                                        {review.reviewer}
                                    </Typography>
                                    <Typography variant="body2">
                                        {review.text}
                                    </Typography>
                                </Box>
                                <Rating
                                    value={review.rating}
                                    readOnly
                                    size="small"
                                />
                            </Box>
                        ))}
                    </Box>
                </Box>
            </Box>
        );
    } else {
        // Guardian case
        return (
            <Box>
                {/* Profile Heading */}
                <Box
                    sx={{
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        padding: "50px",
                        backgroundColor: "#f4f4f4",
                    }}
                >
                    <Typography
                        variant="h4"
                        sx={{
                            fontFamily: "Poppins, sans-serif",
                            fontWeight: "600",
                            marginTop: "50px",
                        }}
                    >
                        Profile
                    </Typography>
                </Box>

                {/* Profile Content */}
                <Box
                    sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        backgroundColor: "#f4f4f4",
                        pb: 4,
                    }}
                >
                    {/* Left Section - Profile Form */}
                    <Box
                        sx={{
                            flex: 2,
                            padding: "20px",
                            backgroundColor: "#fff",
                            justifyContent: "center",
                            borderRadius: "10px",
                            boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.1)",
                            marginLeft: "250px",
                        }}
                    >
                        {/* Profile Picture */}
                        <Box sx={{ textAlign: "center", marginBottom: "20px" }}>
                            <Avatar
                                src={profileData.photo}
                                alt={profileData.name}
                                sx={{
                                    width: 140,
                                    height: 140,
                                    margin: "0 auto",
                                    marginBottom: "10px",
                                }}
                            />
                            <Typography
                                sx={{
                                    fontFamily: "Poppins, sans-serif",
                                    fontWeight: "bold",
                                }}
                                variant="h6"
                            >{`${profileData.firstName} ${profileData.lastName}`}</Typography>
                            <Rating
                                value={profileData.rating}
                                readOnly
                                sx={{ margin: "10px 0" }}
                            />
                            <Box
                                sx={{
                                    display: "flex",
                                    justifyContent: "center",
                                    marginTop: "30px",
                                }}
                            >
                                <Button
                                    variant="contained"
                                    sx={{
                                        color: "#ffffff",
                                        backgroundColor: "#5e62d1",
                                        borderRadius: "30px",
                                        textTransform: "none",
                                        fontSize: "1rem",
                                        fontFamily: "Poppins, sans-serif",
                                        "&:hover": {
                                            backgroundColor: "#3c3fad",
                                        },
                                        display: "flex",
                                        alignItems: "center",
                                        gap: "0.5rem",
                                    }}
                                    onClick={handleSendMessage}
                                >
                                    Message
                                    <MessageIcon
                                        sx={{ fontSize: "1.25rem" }}
                                    />{" "}
                                </Button>
                            </Box>
                        </Box>

                        {/* Editable Form */}
                        <Box>
                            <Typography
                                variant="body1"
                                sx={{
                                    marginLeft: "100px",
                                    fontFamily: "Poppins, sans-serif",
                                    fontWeight: "bold",
                                }}
                            >
                                Area:{" "}
                                <Box
                                    component="span"
                                    sx={{ fontWeight: "normal" }}
                                >
                                    {profileData.city}
                                </Box>
                            </Typography>

                            <Typography
                                sx={{
                                    marginLeft: "100px",
                                    marginTop: "20px",
                                    alignItems: "baseline",
                                    fontFamily: "Poppins, sans-serif",
                                    fontWeight: "bold",
                                }}
                                variant="body1"
                            >
                                Number of Children:{" "}
                                <Box
                                    component="span"
                                    sx={{ fontWeight: "normal" }}
                                >
                                    {profileData.numberOfChildren}
                                </Box>
                            </Typography>

                            <Typography
                                sx={{
                                    marginLeft: "100px",
                                    marginTop: "20px",
                                    fontFamily: "Poppins, sans-serif",
                                    fontWeight: "bold",
                                }}
                                variant="body1"
                            >
                                Children Description
                                <Box
                                    component="span"
                                    sx={{
                                        fontWeight: "normal",
                                        display: "block",
                                        width: "500px",
                                        wordWrap: "break-word",
                                        whiteSpace: "pre-line",
                                    }}
                                >
                                    {profileData.childrenDescription}
                                </Box>
                            </Typography>

                            <Typography
                                sx={{
                                    display: "flex",
                                    alignItems: "baseline",
                                    marginTop: "20px",
                                    marginLeft: "100px",
                                    fontFamily: "Poppins, sans-serif",
                                    fontWeight: "bold",
                                }}
                                variant="body1"
                            >
                                Children Age Groups
                            </Typography>
                            <Box
                                sx={{
                                    display: "flex",
                                    gap: "10px",
                                    flexWrap: "wrap",
                                    marginBottom: "15px",
                                    marginLeft: "100px",
                                }}
                            >
                                <Box
                                    sx={{
                                        display: "flex",
                                        gap: "8px",
                                        justifyContent: "flex-start",
                                        flexWrap: "wrap",
                                        flex: 1,
                                        marginTop: "10px",
                                    }}
                                >
                                    {profileData.childrenAgeGroups
                                        .slice()
                                        .sort((a, b) => a - b)
                                        .map((age, index) => (
                                            <ButtonStyle key={index}>
                                                {age}
                                            </ButtonStyle>
                                        ))}
                                </Box>
                            </Box>

                            <Box
                                sx={{
                                    display: "flex",
                                    justifyContent: "center",
                                    // justifyContent: "space-between",
                                    marginTop: "50px",
                                }}
                            >
                                {/* <Button
                  variant="outlined"
                  sx={{
                    fontFamily: "Poppins, sans-serif",
                    color: "#5e62d1",
                    borderColor: "#5e62d1",
                    borderRadius: "30px",
                    fontSize: "1rem",
                    textTransform: "none",
                    "&:hover": {
                      borderColor: "#3c3fad",
                      color: "#3c3fad",
                    },
                  }}
                >
                  Cancel
                </Button> */}
                            </Box>
                        </Box>
                    </Box>

                    {/* Right Section - Reviews */}
                    <Box
                        sx={{
                            flex: 1,
                            padding: "20px",
                            backgroundColor: "#fff",
                            borderRadius: "10px",
                            boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.1)",
                            marginLeft: "20px",
                            marginRight: "250px",
                            height: "fit-content",
                        }}
                    >
                        <Typography variant="h6" sx={{ marginBottom: "20px" }}>
                            My Reviews
                        </Typography>
                        {reviews.map((review, index) => (
                            <Box
                                key={index}
                                sx={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "10px",
                                    marginBottom: "15px",
                                    padding: "10px",
                                    borderRadius: "8px",
                                    backgroundColor: "#f5f5f5",
                                }}
                            >
                                <Avatar sx={{ width: 40, height: 40 }}>
                                    {review.reviewer.charAt(0)}
                                </Avatar>
                                <Box>
                                    <Typography
                                        variant="body1"
                                        sx={{ fontWeight: "bold" }}
                                    >
                                        {review.reviewer}
                                    </Typography>
                                    <Typography variant="body2">
                                        {review.text}
                                    </Typography>
                                </Box>
                                <Rating
                                    value={review.rating || 0}
                                    readOnly
                                    size="small"
                                />
                            </Box>
                        ))}
                    </Box>
                </Box>
            </Box>
        );
    }
};

export default ProfileInspect;
