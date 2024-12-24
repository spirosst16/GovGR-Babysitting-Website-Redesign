import React, { useState, useEffect } from "react";
import {
  Container,
  Typography,
  Box,
  Avatar,
  Button,
  TextField,
  Grid,
  FormControl,
  FormLabel,
  FormGroup,
  FormControlLabel,
  Checkbox,
} from "@mui/material";
import { styled } from "@mui/system";
import { useParams } from "react-router-dom";
import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  updateDoc,
  doc,
} from "firebase/firestore";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { deleteDoc } from "firebase/firestore";
import { FIREBASE_DB } from "../../config/firebase";
import DefaultUserImage from "../../assets/Babysitter-image.webp";

const PageContainer = styled(Box)({
  backgroundColor: "#f4f4f4",
  minHeight: "100vh",
  padding: "120px 0px 50px",
});

const ContentWrapper = styled(Container)({
  maxWidth: "900px",
  margin: "0 auto",
  display: "flex",
  flexDirection: "column",
  gap: "30px",
});

const UserSection = styled(Box)({
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  backgroundColor: "#fff",
  padding: "20px",
  borderRadius: "8px",
  boxShadow: "0px 2px 10px rgba(0, 0, 0, 0.1)",
});

const AvatarSection = styled(Box)({
  display: "flex",
  alignItems: "center",
  gap: "20px",
});

const DetailsSection = styled(Box)({
  display: "flex",
  flexDirection: "column",
  gap: "15px",
  backgroundColor: "#fff",
  padding: "20px",
  borderRadius: "8px",
  boxShadow: "0px 2px 10px rgba(0, 0, 0, 0.1)",
});

const StyledButton = styled(Button)({
  backgroundColor: "#5e62d1",
  color: "#fff",
  fontFamily: "'Poppins', sans-serif",
  padding: "10px 20px",
  borderRadius: "25px",
  textTransform: "none",
  "&:hover": {
    backgroundColor: "#4a54c1",
  },
});

const AgreementPage = () => {
  const { userId1, userId2 } = useParams();
  const [sender, setSender] = useState(null);
  const [recipient, setRecipient] = useState(null);
  const [agreementId, setAgreementId] = useState(null);
  const [status, setStatus] = useState("");
  const [formValues, setFormValues] = useState({
    area: "",
    weeklySchedule: [],
    babysittingPlace: [],
    startingDate: "",
    endingDate: "",
    additionalNotes: "",
  });
  const [errors, setErrors] = useState({
    area: false,
    weeklySchedule: false,
    babysittingPlace: false,
    startingDate: false,
    endingDate: false,
  });
  const isEditable = () => {
    const auth = getAuth();
    const currentUser = auth.currentUser;
    return currentUser?.uid === userId1 && status === "";
  };

  useEffect(() => {
    const fetchUserData = async (userId, setUser) => {
      try {
        let userData = null;

        const babysittersRef = query(
          collection(FIREBASE_DB, "babysitters"),
          where("userId", "==", userId)
        );
        const babysittersSnapshot = await getDocs(babysittersRef);
        if (!babysittersSnapshot.empty) {
          userData = babysittersSnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }))[0];
        } else {
          const guardiansRef = query(
            collection(FIREBASE_DB, "guardians"),
            where("userId", "==", userId)
          );
          const guardiansSnapshot = await getDocs(guardiansRef);
          if (!guardiansSnapshot.empty) {
            userData = guardiansSnapshot.docs.map((doc) => ({
              id: doc.id,
              ...doc.data(),
            }))[0];
          }
        }

        if (!userData) throw new Error(`User with ID ${userId} not found`);
        setUser(userData);
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    const fetchAgreementData = async () => {
      try {
        const agreementsRef = collection(FIREBASE_DB, "agreements");
        const q = query(
          agreementsRef,
          where("senderId", "==", userId1),
          where("recipientId", "==", userId2)
        );
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
          querySnapshot.forEach((doc) => {
            const agreementData = doc.data();
            setAgreementId(doc.id);
            setFormValues({
              area: agreementData.area,
              weeklySchedule: agreementData.weeklySchedule,
              babysittingPlace: agreementData.babysittingPlace,
              startingDate: agreementData.startingDate,
              endingDate: agreementData.endingDate,
              additionalNotes: agreementData.additionalNotes,
            });
            setStatus(agreementData.status);
          });
        }
      } catch (error) {
        console.error("Error fetching agreement data:", error);
      }
    };

    fetchAgreementData();

    fetchUserData(userId1, setSender);
    fetchUserData(userId2, setRecipient);
  }, [userId1, userId2]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormValues((prevValues) => ({
      ...prevValues,
      [name]: value,
    }));
  };

  const validateForm = () => {
    let formErrors = {
      area: !formValues.area,
      weeklySchedule: formValues.weeklySchedule.length === 0,
      babysittingPlace: formValues.babysittingPlace.length === 0,
      startingDate: !formValues.startingDate,
      endingDate: !formValues.endingDate,
    };

    setErrors(formErrors);
    return Object.values(formErrors).every((error) => !error);
  };

  const handleSend = async () => {
    if (!validateForm()) {
      alert("Please fill in all required fields.");
      return;
    }

    try {
      const auth = getAuth();
      const currentUser = auth.currentUser;

      if (!currentUser) {
        alert("You must be logged in to send an agreement.");
        return;
      }

      const agreementsRef = collection(FIREBASE_DB, "agreements");
      const docRef = await addDoc(agreementsRef, {
        senderId: userId1,
        recipientId: userId2,
        status: "pending",
        ...formValues,
      });

      setAgreementId(docRef.id);
      setStatus("pending");
      console.log("Agreement sent with ID:", docRef.id);
    } catch (error) {
      console.error("Error sending agreement:", error);
      alert("Failed to send agreement. Please try again.");
    }
  };

  const handleUnsend = async () => {
    try {
      if (!agreementId) {
        alert("No agreement to unsend.");
        return;
      }

      const agreementDocRef = doc(FIREBASE_DB, "agreements", agreementId);
      await deleteDoc(agreementDocRef);

      setAgreementId(null);
      setStatus("");
      console.log("Agreement unsent and deleted.");
    } catch (error) {
      console.error("Error unsending agreement:", error);
      alert("Failed to unsend agreement. Please try again.");
    }
  };

  const handleAccept = async () => {
    try {
      if (!agreementId) {
        alert("No agreement to accept.");
        return;
      }

      const agreementDocRef = doc(FIREBASE_DB, "agreements", agreementId);
      await updateDoc(agreementDocRef, { status: "accepted" });

      setStatus("accepted");
      console.log("Agreement accepted.");
    } catch (error) {
      console.error("Error accepting agreement:", error);
      alert("Failed to accept agreement. Please try again.");
    }
  };

  const renderButton = () => {
    const auth = getAuth();
    const currentUser = auth.currentUser;

    if (!currentUser) return null;

    if (currentUser.uid === userId1) {
      if (status === "pending") {
        return (
          <Box>
            <StyledButton onClick={handleUnsend}>Unsend</StyledButton>
          </Box>
        );
      }
      if (status === "") {
        return (
          <Box>
            <StyledButton onClick={handleSend}>Send</StyledButton>
          </Box>
        );
      }
    } else if (currentUser.uid === userId2) {
      if (status === "pending") {
        return (
          <Box>
            <StyledButton onClick={handleAccept}>Accept</StyledButton>
          </Box>
        );
      }
    }
    return null;
  };

  return (
    <PageContainer>
      <ContentWrapper>
        <Typography
          variant="h4"
          sx={{
            textAlign: "center",
            fontWeight: "bold",
            fontFamily: "'Poppins', sans-serif",
            paddingBottom: "5px",
          }}
        >
          Babysitting Agreement
        </Typography>

        <UserSection>
          <AvatarSection>
            <Avatar
              src={sender?.photo || DefaultUserImage}
              sx={{ width: 80, height: 80 }}
            />
            <Typography
              variant="h6"
              sx={{ fontFamily: "'Poppins', sans-serif", fontWeight: "bold" }}
            >
              {sender?.firstName} {sender?.lastName}
            </Typography>
          </AvatarSection>
          <AvatarSection>
            <Avatar
              src={recipient?.photo || DefaultUserImage}
              sx={{ width: 80, height: 80 }}
            />
            <Typography
              variant="h6"
              sx={{ fontFamily: "'Poppins', sans-serif", fontWeight: "bold" }}
            >
              {recipient?.firstName} {recipient?.lastName}
            </Typography>
          </AvatarSection>
        </UserSection>

        {isEditable() ? (
          <DetailsSection>
            <Typography
              variant="h5"
              sx={{
                fontFamily: "'Poppins', sans-serif",
                fontWeight: "bold",
                textAlign: "center",
                marginBottom: "10px",
              }}
            >
              Agreement Details
            </Typography>
            <TextField
              fullWidth
              label="Area"
              name="area"
              value={formValues.area}
              onChange={handleInputChange}
              variant="outlined"
              required
              sx={{ fontFamily: "'Poppins', sans-serif" }}
            />

            <FormLabel
              component="legend"
              sx={{ fontFamily: "'Poppins', sans-serif", fontSize: "20px" }}
            >
              Weekly Schedule *
            </FormLabel>
            <Grid container spacing={3}>
              {[
                "Monday",
                "Tuesday",
                "Wednesday",
                "Thursday",
                "Friday",
                "Saturday",
                "Sunday",
              ].map((day) => (
                <Grid item xs={12} sm={6} md={3} key={day}>
                  <Typography variant="h6">{day}</Typography>
                  <FormGroup>
                    {["Morning", "Afternoon", "Evening", "Night"].map(
                      (time) => (
                        <FormControlLabel
                          key={time}
                          control={
                            <Checkbox
                              checked={formValues.weeklySchedule.includes(
                                `${day} ${time}`
                              )}
                              onChange={(e) => {
                                const updatedSchedule = e.target.checked
                                  ? [
                                      ...formValues.weeklySchedule,
                                      `${day} ${time}`,
                                    ]
                                  : formValues.weeklySchedule.filter(
                                      (slot) => slot !== `${day} ${time}`
                                    );
                                setFormValues({
                                  ...formValues,
                                  weeklySchedule: updatedSchedule,
                                });
                              }}
                            />
                          }
                          label={time}
                        />
                      )
                    )}
                  </FormGroup>
                </Grid>
              ))}
            </Grid>

            <FormControl component="fieldset" sx={{ mb: 2 }}>
              <FormLabel
                component="legend"
                sx={{ fontFamily: "'Poppins', sans-serif", fontSize: "20px" }}
              >
                Babysitting Place *
              </FormLabel>
              <Box sx={{ display: "flex", flexDirection: "row", gap: 2 }}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={formValues.babysittingPlace.includes(
                        "Family's House"
                      )}
                      onChange={(e) => {
                        const newBabysittingPlace = e.target.checked
                          ? [...formValues.babysittingPlace, "Family's House"]
                          : formValues.babysittingPlace.filter(
                              (place) => place !== "Family's House"
                            );
                        setFormValues({
                          ...formValues,
                          babysittingPlace: newBabysittingPlace,
                        });
                      }}
                    />
                  }
                  label="Family's House"
                  sx={{ fontFamily: "'Poppins', sans-serif" }}
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={formValues.babysittingPlace.includes(
                        "Babysitter's House"
                      )}
                      onChange={(e) => {
                        const newBabysittingPlace = e.target.checked
                          ? [
                              ...formValues.babysittingPlace,
                              "Babysitter's House",
                            ]
                          : formValues.babysittingPlace.filter(
                              (place) => place !== "Babysitter's House"
                            );
                        setFormValues({
                          ...formValues,
                          babysittingPlace: newBabysittingPlace,
                        });
                      }}
                    />
                  }
                  label="Babysitter's House"
                  sx={{ fontFamily: "'Poppins', sans-serif" }}
                />
              </Box>
            </FormControl>

            <TextField
              fullWidth
              label="Starting Date"
              name="startingDate"
              value={formValues.startingDate}
              onChange={handleInputChange}
              type="date"
              InputLabelProps={{ shrink: true }}
              required
              sx={{ fontFamily: "'Poppins', sans-serif" }}
            />

            <TextField
              fullWidth
              label="Ending Date"
              name="endingDate"
              value={formValues.endingDate}
              onChange={handleInputChange}
              type="date"
              InputLabelProps={{ shrink: true }}
              required
              sx={{ fontFamily: "'Poppins', sans-serif" }}
            />

            <TextField
              fullWidth
              label="Additional Notes"
              name="additionalNotes"
              value={formValues.additionalNotes}
              onChange={handleInputChange}
              multiline
              rows={4}
              variant="outlined"
              sx={{ fontFamily: "'Poppins', sans-serif" }}
            />
          </DetailsSection>
        ) : (
          <DetailsSection>
            <Typography
              variant="h5"
              sx={{
                fontFamily: "'Poppins', sans-serif",
                fontWeight: "bold",
                textAlign: "center",
                marginBottom: "10px",
              }}
            >
              Agreement Details
            </Typography>

            <Typography
              variant="h6"
              sx={{ fontFamily: "'Poppins', sans-serif" }}
            >
              <Box component="span" sx={{ fontWeight: "bold" }}>
                Area:
              </Box>{" "}
              <Box component="span" sx={{ fontWeight: "normal" }}>
                {formValues.area}
              </Box>
            </Typography>

            <Typography
              variant="h6"
              sx={{ fontFamily: "'Poppins', sans-serif" }}
            >
              <Box component="span" sx={{ fontWeight: "bold" }}>
                Weekly Schedule:
              </Box>{" "}
              <Box component="span" sx={{ fontWeight: "normal" }}>
                {formValues.weeklySchedule.join(", ")}
              </Box>
            </Typography>

            <Typography
              variant="h6"
              sx={{ fontFamily: "'Poppins', sans-serif" }}
            >
              <Box component="span" sx={{ fontWeight: "bold" }}>
                Babysitting Place:
              </Box>{" "}
              <Box component="span" sx={{ fontWeight: "normal" }}>
                {formValues.babysittingPlace.join(", ")}
              </Box>
            </Typography>

            <Typography
              variant="h6"
              sx={{ fontFamily: "'Poppins', sans-serif" }}
            >
              <Box component="span" sx={{ fontWeight: "bold" }}>
                Starting Date:
              </Box>{" "}
              <Box component="span" sx={{ fontWeight: "normal" }}>
                {formValues.startingDate}
              </Box>
            </Typography>

            <Typography
              variant="h6"
              sx={{ fontFamily: "'Poppins', sans-serif" }}
            >
              <Box component="span" sx={{ fontWeight: "bold" }}>
                Ending Date:
              </Box>{" "}
              <Box component="span" sx={{ fontWeight: "normal" }}>
                {formValues.endingDate}
              </Box>
            </Typography>

            <Typography
              variant="h6"
              sx={{ fontFamily: "'Poppins', sans-serif" }}
            >
              <Box component="span" sx={{ fontWeight: "bold" }}>
                Additional Notes:
              </Box>{" "}
              <Box component="span" sx={{ fontWeight: "normal" }}>
                {formValues.additionalNotes}
              </Box>
            </Typography>
          </DetailsSection>
        )}

        <Box sx={{ textAlign: "center", marginTop: "20px" }}>
          {renderButton()}
        </Box>
      </ContentWrapper>
    </PageContainer>
  );
};

export default AgreementPage;
