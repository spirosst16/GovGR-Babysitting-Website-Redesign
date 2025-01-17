import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import {
  getDocs,
  query,
  where,
  collection,
  getDoc,
  doc,
  updateDoc,
  arrayUnion,
} from "firebase/firestore";
import { FIREBASE_DB } from "../../config/firebase";
import { jsPDF } from "jspdf";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import {
  Container,
  Typography,
  Box,
  Button,
  Stepper,
  Step,
  StepLabel,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Card,
  CardContent,
  Divider,
  Grid,
  Stack,
  Breadcrumbs,
  Link,
  Snackbar,
  Alert,
  TextField,
} from "@mui/material";
import { CheckCircle, Payment, CalendarToday } from "@mui/icons-material";
import CelebrationIcon from "@mui/icons-material/Celebration";
import { styled } from "@mui/system";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import DescriptionIcon from "@mui/icons-material/Description";
import VerifiedIcon from "@mui/icons-material/Verified";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import PlaceIcon from "@mui/icons-material/Place";
import DownloadIcon from "@mui/icons-material/Download";
import Navbar from "../Navbar/Navbar";

const StyledButton = styled(Button)({
  fontFamily: "'Poppins', sans-serif",
  fontSize: "1rem",
  textTransform: "none",
  borderRadius: "30px",
  "&:hover": {
    backgroundColor: "#4a4fbf",
  },
});

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

const PageContainer = styled(Container)({
  backgroundColor: "#f9f9f9",
  borderRadius: "10px",
  padding: "20px",
  boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.1)",
  fontFamily: "'Poppins', sans-serif",
  textAlign: "center",
  minHeight: "calc(100vh - 120px)",
});

const steps = [
  "Payment Details",
  "Generate Digital Voucher",
  "Review Babysitter",
];

const PaymentTracker = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { agreementId } = useParams();
  const [userId1, setUserId1] = useState(null);
  const [userId2, setUserId2] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [currentUserRole, setCurrentUserRole] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [sender, setSender] = useState(null);
  const [recipient, setRecipient] = useState(null);
  const [agreement, setAgreement] = useState(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [workConfirmed, setWorkConfirmed] = useState(false);
  const [reviewText, setReviewText] = useState("");
  const [rating, setRating] = useState("");
  const [hoveredRating, setHoveredRating] = useState(0);
  const [isReviewSubmitted, setIsReviewSubmitted] = useState(false);
  const [alert, setAlert] = useState({
    open: false,
    message: "",
    severity: "",
  });

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setCurrentUser(user);

        const email = user.email;
        try {
          const babysitterQuery = query(
            collection(FIREBASE_DB, "babysitters"),
            where("email", "==", email)
          );
          const babysitterSnapshot = await getDocs(babysitterQuery);

          if (!babysitterSnapshot.empty) {
            setUserRole("babysitter");
            return;
          }

          const guardianQuery = query(
            collection(FIREBASE_DB, "guardians"),
            where("email", "==", email)
          );
          const guardianSnapshot = await getDocs(guardianQuery);

          if (!guardianSnapshot.empty) {
            setUserRole("guardian");
            return;
          }

          setUserRole("unauthorized");
        } catch (error) {
          console.error("Error determining user role:", error.message);
        }
      } else {
        setCurrentUser(null);
        setUserRole(null);
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const fetchUserRole = async () => {
      const auth = getAuth();
      const currentUser = auth.currentUser;
      if (!currentUser) return;

      try {
        const userDoc = await getDoc(
          doc(FIREBASE_DB, "users", currentUser.uid)
        );
        if (userDoc.exists()) {
          setCurrentUserRole(userDoc.data().role);
        }
      } catch (error) {
        console.error("Error fetching user role:", error);
      }
    };

    fetchUserRole();
  }, []);

  // Updated fetchData with integrated payment status update
  const fetchData = async () => {
    if (!currentUser) {
      console.error("Error: User not authenticated");
      return;
    }

    try {
      if (!agreementId) {
        console.error("Error: agreementId is undefined");
        return;
      }

      const fetchUserData = async (userId) => {
        console.log("Fetching data for userId:", userId);
        let userData = null;

        const babysittersRef = query(
          collection(FIREBASE_DB, "babysitters"),
          where("userId", "==", userId)
        );
        const babysittersSnapshot = await getDocs(babysittersRef);

        if (!babysittersSnapshot.empty) {
          console.log("User found in babysitters collection.");
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
            console.log("User found in guardians collection.");
            userData = guardiansSnapshot.docs.map((doc) => ({
              id: doc.id,
              ...doc.data(),
            }))[0];
          }
        }

        if (!userData) {
          console.error(`User with ID ${userId} not found`);
          throw new Error(`User with ID ${userId} not found`);
        }
        return userData;
      };

      const agreementRef = query(
        collection(FIREBASE_DB, "agreements"),
        where("__name__", "==", agreementId)
      );

      const agreementSnapshot = await getDocs(agreementRef);

      if (!agreementSnapshot.empty) {
        const agreementData = agreementSnapshot.docs[0].data();
        const agreementDocRef = doc(
          FIREBASE_DB,
          "agreements",
          agreementSnapshot.docs[0].id
        );

        setAgreement(agreementData);

        console.log("Agreement data:", agreementData);

        const [senderData, recipientData] = await Promise.all([
          fetchUserData(agreementData.senderId),
          fetchUserData(agreementData.recipientId),
        ]);

        setSender(senderData);
        setRecipient(recipientData);

        setUserId1(agreementData.senderId);
        setUserId2(agreementData.recipientId);

        const currentDate = new Date();
        const lastPaymentDate = new Date(agreementData.lastPaymentDate);
        const dayDifference = Math.floor(
          (currentDate - lastPaymentDate) / (1000 * 60 * 60 * 24)
        );
        const K = Math.floor(dayDifference / 30);

        if (K >= 1) {
          let newLastPaymentDate = new Date(lastPaymentDate);

          if (agreementData.paymentStatus === "not available yet") {
            newLastPaymentDate.setMonth(newLastPaymentDate.getMonth() + K);

            await updateDoc(agreementDocRef, {
              paymentStatus: "pending guardian",
              lastPaymentDate: newLastPaymentDate.toISOString(),
            });

            setAgreement((prev) => ({
              ...prev,
              paymentStatus: "pending guardian",
              lastPaymentDate: newLastPaymentDate.toISOString(),
            }));
          }
        }
      } else {
        console.log(
          "No agreement found for the provided sender and recipient."
        );
      }
    } catch (error) {
      console.error("Error fetching data:", error.message);
    }
  };

  useEffect(() => {
    if (currentUser) {
      fetchData();
    }
  }, [currentUser, agreementId]);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep((prevStep) => prevStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep((prevStep) => prevStep - 1);
    }
  };

  const updatePaymentStatusToPendingBabysitter = async () => {
    if (!currentUser) {
      console.error("Error: User not authenticated");
      return;
    }

    try {
      const agreementRef = query(
        collection(FIREBASE_DB, "agreements"),
        where("__name__", "==", agreementId)
      );

      const agreementSnapshot = await getDocs(agreementRef);

      if (!agreementSnapshot.empty) {
        const agreementDocRef = doc(
          FIREBASE_DB,
          "agreements",
          agreementSnapshot.docs[0].id
        );
        const agreementData = agreementSnapshot.docs[0].data();

        if (agreementData.paymentStatus !== "pending babysitter") {
          const lastPaymentDate = new Date(agreementData.lastPaymentDate);
          let newLastPaymentDate = new Date(lastPaymentDate);
          newLastPaymentDate.setMonth(newLastPaymentDate.getMonth() + 1);

          const formattedDate = newLastPaymentDate.toISOString().split("T")[0];

          await updateDoc(agreementDocRef, {
            paymentStatus: "pending babysitter",
            lastPaymentDate: formattedDate,
          });

          setAgreement((prev) => ({
            ...prev,
            paymentStatus: "pending babysitter",
            lastPaymentDate: formattedDate,
          }));
          console.log("Payment status updated to pending babysitter.");
        } else {
          console.log("Payment status is already pending babysitter.");
        }
      } else {
        console.log(
          "No agreement found for the provided sender and recipient."
        );
      }
    } catch (error) {
      console.error("Error updating payment status:", error.message);
    }
  };

  const handleReset = async () => {
    try {
      await updatePaymentStatusToPendingBabysitter();
      setCurrentStep(0);
      setWorkConfirmed(false);
      navigate("/my-dashboard");
    } catch (error) {
      console.error("Error resetting and updating status:", error.message);
    }
  };

  const generatePDF = () => {
    const doc = new jsPDF();

    doc.setFont("Poppins", "bold");
    doc.setFontSize(20);
    doc.text("Digital Payment Voucher", 70, 20);

    doc.setLineWidth(0.5);
    doc.line(10, 40, 200, 40);

    doc.setFont("Poppins", "normal");
    doc.setFontSize(14);
    if (agreement) {
      doc.text(`Amount: $${agreement.amount || "N/A"}`, 10, 50);
      doc.text(`Date: ${new Date().toLocaleDateString()}`, 10, 70);
    }

    doc.setFontSize(12);
    doc.text("Thank you for using our service!", 10, 90);
    doc.text("For inquiries, contact us at info@babysitters.com", 10, 100);

    doc.save("PaymentVoucher.pdf");
  };

  const handleAlertClose = () => {
    setAlert({ ...alert, open: false });
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();

    if (!reviewText || !rating) {
      setAlert({
        open: true,
        message: "Please provide both a review and a rating.",
        severity: "error",
      });
      return;
    }

    try {
      const babysitterQuery1 = query(
        collection(FIREBASE_DB, "babysitters"),
        where("userId", "==", userId1)
      );

      const babysitterQuery2 = query(
        collection(FIREBASE_DB, "babysitters"),
        where("userId", "==", userId2)
      );

      let babysitterRef = null;

      const babysitterSnapshot1 = await getDocs(babysitterQuery1);

      if (!babysitterSnapshot1.empty) {
        const babysitterDoc1 = babysitterSnapshot1.docs[0];
        babysitterRef = babysitterDoc1.ref;
      } else {
        const babysitterSnapshot2 = await getDocs(babysitterQuery2);

        if (!babysitterSnapshot2.empty) {
          const babysitterDoc2 = babysitterSnapshot2.docs[0];
          babysitterRef = babysitterDoc2.ref;
        }
      }

      if (!babysitterRef) {
        setAlert({
          open: true,
          message: "Babysitter could not be determined.",
          severity: "error",
        });

        return;
      }

      const babysitterDoc = await getDoc(babysitterRef);
      if (!babysitterDoc.exists()) {
        console.error("Babysitter document does not exist.");
        return;
      }

      const babysitterData = babysitterDoc.data();
      const existingReviews = babysitterData.reviews || [];
      const newReview = {
        userId: currentUser.uid,
        reviewText,
        rating: parseInt(rating, 10),
        timestamp: new Date().toISOString(),
      };

      const updatedReviews = [...existingReviews, newReview];
      const totalRatings = updatedReviews.reduce(
        (sum, review) => sum + review.rating,
        0
      );
      const averageRating = totalRatings / updatedReviews.length;

      await updateDoc(babysitterRef, {
        reviews: arrayUnion(newReview),
        rating: averageRating,
      });

      setAlert({
        open: true,
        message: "Thank you for your review!",
        severity: "success",
      });
      setReviewText("");
      setRating("");
      setIsReviewSubmitted(true);
    } catch (error) {
      console.error("Error submitting review:", error.message);
      setAlert({
        open: true,
        message: "An error occurred. Please try again.",
        severity: "error",
      });
    }
  };

  const renderStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <>
            <Typography
              variant="h6"
              fontFamily={"'Poppins', sans-serif"}
              textAlign="center"
            >
              Confirm Voucher Details to Proceed
            </Typography>

            <Box
              sx={{
                mt: 3,
                textAlign: "left",
                maxWidth: "500px",
                margin: "auto",
              }}
            >
              <Box sx={{ mt: 3, mb: 2, display: "flex", alignItems: "center" }}>
                <CheckCircle sx={{ color: "#5e62d1", marginRight: 2 }} />
                <Typography
                  variant="body1"
                  sx={{
                    fontSize: "1rem",
                    color: "#555555",
                    fontFamily: "'Poppins', sans-serif",
                  }}
                >
                  <strong>Voucher Price:</strong> {agreement.amount || "N/A"}€
                </Typography>
              </Box>

              <Box sx={{ mb: 2, display: "flex", alignItems: "center" }}>
                <Payment sx={{ color: "#5e62d1", marginRight: 2 }} />
                <Typography
                  variant="body1"
                  sx={{
                    fontSize: "1rem",
                    color: "#555555",
                    fontFamily: "'Poppins', sans-serif",
                  }}
                >
                  <strong>Value:</strong> Covers one month's babysitting
                  services.
                </Typography>
              </Box>

              <Box sx={{ mb: 2, display: "flex", alignItems: "center" }}>
                <CalendarToday sx={{ color: "#5e62d1", marginRight: 2 }} />
                <Typography
                  variant="body1"
                  sx={{
                    fontSize: "1rem",
                    color: "#555555",
                    fontFamily: "'Poppins', sans-serif",
                  }}
                >
                  <strong>Payment:</strong> The payment will be completed within
                  one month, regardless.
                </Typography>
              </Box>

              <Box sx={{ mb: 2, display: "flex", alignItems: "center" }}>
                <CheckCircle sx={{ color: "#5e62d1", marginRight: 2 }} />
                <Typography
                  variant="body1"
                  sx={{
                    fontSize: "1rem",
                    color: "#555555",
                    fontFamily: "'Poppins', sans-serif",
                  }}
                >
                  <strong>Note:</strong> Voucher is non-refundable and
                  non-transferable.
                </Typography>
              </Box>
            </Box>

            <Box sx={{ mt: 2, textAlign: "center" }}>
              <label>
                <input
                  type="checkbox"
                  checked={workConfirmed}
                  onChange={() => setWorkConfirmed(!workConfirmed)}
                  style={{
                    marginRight: "10px",
                    accentColor: workConfirmed ? "#5e62d1" : "#000000",
                  }}
                />
                <Typography
                  variant="body1"
                  component="span"
                  sx={{
                    fontSize: "1rem",
                    color: "#555555",
                    fontFamily: "'Poppins', sans-serif",
                  }}
                >
                  I confirm the voucher details and agree to proceed.
                </Typography>
              </label>
            </Box>
          </>
        );
      case 1:
        return (
          <>
            <Typography
              variant="h6"
              fontFamily={"'Poppins', sans-serif"}
              textAlign="center"
            >
              A digital voucher has been generated for the payment. Download it
              below.
            </Typography>
            <Card
              sx={{
                mt: 4,
                p: 4,
                borderRadius: "15px",
                boxShadow: 10,
                backgroundColor: "#ffffff",
                border: "none",
                width: 800,
                margin: "auto",
                transition: "transform 0.3s ease, box-shadow 0.3s ease",
                overflow: "hidden",
                position: "relative",
              }}
            >
              <Box
                sx={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: "100%",
                  height: "100%",
                  backgroundImage: "linear-gradient(135deg, #5e62d1, #3f51b5)",
                  borderRadius: "15px",
                  zIndex: -1,
                }}
              />
              <CardContent sx={{ paddingBottom: "16px" }}>
                <Box
                  sx={{
                    backgroundImage:
                      "linear-gradient(135deg, #5e62d1, #3f51b5)",
                    borderRadius: "10px",
                    padding: "12px",
                    marginBottom: "20px",
                  }}
                >
                  <Typography
                    variant="h5"
                    sx={{
                      fontWeight: "bold",
                      fontSize: "1.5rem",
                      color: "white",
                      fontFamily: "'Poppins', sans-serif",
                      textAlign: "center",
                      letterSpacing: "0.5px",
                    }}
                  >
                    Digital Voucher
                  </Typography>
                </Box>
                <Divider sx={{ mt: 3, mb: 3, borderColor: "#e0e0e0" }} />
                {agreement && (
                  <Grid container spacing={3}>
                    <Grid item xs={12} sm={6}>
                      <Typography
                        variant="h6"
                        sx={{
                          mb: 2,
                          fontWeight: 600,
                          fontSize: "1rem",
                          color: "#333333",
                          fontFamily: "'Poppins', sans-serif",
                          display: "flex",
                          alignItems: "center",
                          gap: 1,
                        }}
                      >
                        <AttachMoneyIcon sx={{ color: "#5e62d1" }} />
                        <strong>Amount:</strong> {agreement.amount || "N/A"}€
                      </Typography>
                      <Typography
                        variant="h6"
                        sx={{
                          mb: 2,
                          fontWeight: 600,
                          fontSize: "1rem",
                          color: "#333333",
                          fontFamily: "'Poppins', sans-serif",
                          display: "flex",
                          alignItems: "center",
                          gap: 1,
                        }}
                      >
                        <LocationOnIcon sx={{ color: "#5e62d1" }} />
                        <strong>Area:</strong> {agreement.area || "N/A"}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography
                        variant="h6"
                        sx={{
                          mb: 2,
                          fontWeight: 600,
                          fontSize: "1rem",
                          color: "#333333",
                          fontFamily: "'Poppins', sans-serif",
                          display: "flex",
                          alignItems: "center",
                          gap: 1,
                        }}
                      >
                        <AccessTimeIcon sx={{ color: "#5e62d1" }} />
                        <strong>Service Period:</strong> 1 Month
                      </Typography>
                      <Typography
                        variant="h6"
                        sx={{
                          mb: 2,
                          fontWeight: 600,
                          fontSize: "1rem",
                          color: "#333333",
                          fontFamily: "'Poppins', sans-serif",
                          display: "flex",
                          alignItems: "center",
                          gap: 1,
                        }}
                      >
                        <PlaceIcon sx={{ color: "#5e62d1" }} />
                        <strong>Service Location:</strong>{" "}
                        {agreement.babysittingPlace || "N/A"}
                      </Typography>
                    </Grid>
                  </Grid>
                )}
              </CardContent>
            </Card>

            <Box sx={{ mt: 3, textAlign: "center" }}>
              <StyledButton
                onClick={generatePDF}
                sx={{
                  backgroundColor: "white",
                  color: "#5e62d1",
                  outline: "1px solid #5e62d1",
                  borderRadius: "30px",
                  padding: "8px 16px",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  "&:hover": {
                    backgroundColor: "#f0f4ff",
                  },
                }}
              >
                <DownloadIcon sx={{ mr: 1, fontSize: "20px" }} />{" "}
                <span>Download Voucher</span>
              </StyledButton>
            </Box>
          </>
        );
      case 2:
        return (
          <Box
            sx={{
              mt: 6,
              borderRadius: "15px",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              maxWidth: "600px",
              margin: "auto",
            }}
          >
            <Typography
              variant="h5"
              textAlign="center"
              sx={{ fontWeight: "bold", fontFamily: "'Poppins', sans-serif" }}
            >
              Leave a Review
            </Typography>
            <Typography
              variant="h6"
              textAlign="center"
              sx={{ mt: 2, mb: 4, fontFamily: "'Poppins', sans-serif" }}
            >
              Thank you for completing the payment process! Please take a moment
              to leave a review for the babysitter.
            </Typography>

            {/* Review Form */}
            <Box
              component="form"
              onSubmit={handleReviewSubmit}
              sx={{
                display: "flex",
                flexDirection: "column",
                gap: 3,
                width: "100%",
              }}
            >
              {/* TextField */}
              <StyledTextField
                label="Write your review here..."
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
                multiline
                rows={4}
                variant="outlined"
                disabled={isReviewSubmitted} // Disable when review is submitted
              />

              {/* Star Rating */}
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  gap: 1,
                  mb: 2,
                }}
              >
                {[1, 2, 3, 4, 5].map((star) => (
                  <span
                    key={star}
                    onClick={() => !isReviewSubmitted && setRating(star)} // Disable click when review is submitted
                    onMouseOver={() =>
                      !isReviewSubmitted && setHoveredRating(star)
                    }
                    onMouseOut={() => !isReviewSubmitted && setHoveredRating(0)}
                    style={{
                      fontSize: "3rem",
                      cursor: isReviewSubmitted ? "not-allowed" : "pointer", // Disable pointer events
                      color:
                        hoveredRating >= star || rating >= star
                          ? "#FFD700"
                          : "#ccc",
                      transition: "color 0.2s ease",
                    }}
                  >
                    ★
                  </span>
                ))}
              </Box>

              {/* Submit Review Button */}
              <StyledButton
                type="submit"
                variant="contained"
                disabled={isReviewSubmitted}
                sx={{
                  backgroundColor: isReviewSubmitted ? "#cccccc" : "#5e62d1",
                  color: "white",
                  "&:hover": {
                    backgroundColor: isReviewSubmitted ? "#cccccc" : "#4a4fbf",
                  },
                  alignSelf: "center",
                }}
              >
                {isReviewSubmitted ? "Review Submitted" : "Submit Review"}
              </StyledButton>
            </Box>

            {/* Back and Finish Buttons */}
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                width: "100%",
                mt: 4,
              }}
            >
              <StyledButton
                variant="contained"
                onClick={handleBack}
                sx={{
                  backgroundColor: "#5e62d1",
                  color: "white",
                  "&:hover": {
                    backgroundColor: "#4a4fbf",
                  },
                  ml: -13,
                }}
              >
                Back
              </StyledButton>
              <StyledButton
                variant="contained"
                onClick={handleReset}
                sx={{
                  backgroundColor: "#5e62d1",
                  color: "white",
                  "&:hover": {
                    backgroundColor: "#4a4fbf",
                  },
                  mr: -13,
                }}
              >
                Finish
              </StyledButton>
            </Box>
          </Box>
        );
      default:
        return null;
    }
  };

  return (
    <div
      style={{
        paddingTop: "120px",
        backgroundColor: "#f4f4f4",
        minHeight: "100vh",
        paddingBottom: "70px",
        fontFamily: "Poppins, sans-serif",
      }}
    >
      <Navbar />
      <Container component="main" maxWidth="md">
        {agreement ? (
          agreement.paymentStatus === "not available yet" ||
          (agreement.paymentStatus === "pending guardian" &&
            currentUserRole === "Babysitter") ||
          (agreement.paymentStatus === "pending babysitter" &&
            currentUserRole === "Guardian") ? (
            <PageContainer>
              <Typography
                variant="h5"
                sx={{
                  textAlign: "center",
                  fontWeight: "bold",
                  fontFamily: "'Poppins', sans-serif",
                  paddingBottom: "20px",
                }}
              >
                Payment Not Available Yet
              </Typography>
              <Typography
                variant="h6"
                sx={{
                  textAlign: "center",
                  fontFamily: "'Poppins', sans-serif",
                }}
              >
                The payment for this agreement is not available yet. Please wait{" "}
                <strong>
                  {(() => {
                    const currentDate = new Date();
                    const endingDate = new Date(agreement.endingDate);

                    const daysInMonth = (date) => {
                      const year = date.getFullYear();
                      const month = date.getMonth() + 1;
                      return new Date(year, month, 0).getDate();
                    };

                    const remainingDays = Math.ceil(
                      (endingDate - currentDate) / (1000 * 60 * 60 * 24)
                    );

                    if (remainingDays > 0) {
                      const daysInEndingMonth = daysInMonth(endingDate);
                      return (
                        remainingDays % daysInEndingMonth || daysInEndingMonth
                      );
                    } else {
                      return 0;
                    }
                  })()}
                </strong>{" "}
                days until the agreement's end date.
              </Typography>
            </PageContainer>
          ) : agreement.paymentStatus === "pending guardian" &&
            currentUserRole === "Guardian" ? (
            <>
              <Typography
                variant="h4"
                component="h1"
                textAlign="center"
                sx={{
                  mb: 3,
                  fontFamily: "Poppins, sans-serif",
                }}
              >
                Professional Payment Tracker
              </Typography>
              <Stepper
                activeStep={currentStep}
                alternativeLabel
                sx={{
                  ".MuiStepIcon-root": {
                    color: "#5e62d1",
                  },
                  ".MuiStepIcon-root.Mui-active": {
                    color: "#5e62d1",
                  },
                  ".MuiStepIcon-root.Mui-completed": {
                    color: "#5e62d1",
                  },
                }}
              >
                {steps.map((label, index) => (
                  <Step key={index}>
                    <StepLabel>{label}</StepLabel>
                  </Step>
                ))}
              </Stepper>
              <Box
                sx={{
                  mt: 4,
                  p: 3,
                  backgroundColor: "white",
                  borderRadius: "10px",
                  boxShadow: 4,
                  display: "flex",
                  flexDirection: "column",
                  gap: 3,
                }}
              >
                {renderStepContent(currentStep)}
                {currentStep < steps.length - 1 && (
                  <Box
                    sx={{ display: "flex", justifyContent: "space-between" }}
                  >
                    <StyledButton
                      variant="contained"
                      onClick={handleBack}
                      disabled={currentStep === 0}
                      sx={{
                        backgroundColor: "#5e62d1",
                        "&:hover": {
                          backgroundColor: "#4a4fbf",
                        },
                      }}
                    >
                      Back
                    </StyledButton>
                    <StyledButton
                      variant="contained"
                      onClick={handleNext}
                      disabled={currentStep === 0 && !workConfirmed}
                      sx={{
                        backgroundColor: "#5e62d1",
                        "&:hover": {
                          backgroundColor: "#4a4fbf",
                        },
                      }}
                    >
                      Next
                    </StyledButton>
                  </Box>
                )}
              </Box>
            </>
          ) : agreement.paymentStatus === "pending babysitter" &&
            currentUserRole === "Babysitter" ? (
            <PageContainer>
              <Typography
                variant="h4"
                sx={{
                  textAlign: "center",
                  fontWeight: "bold",
                  fontFamily: "'Poppins', sans-serif",
                  paddingBottom: "20px",
                }}
              >
                Babysitter Action Required
              </Typography>
              <Typography
                variant="h6"
                sx={{
                  mt: 2,
                  mb: 4,
                  textAlign: "center",
                  fontFamily: "'Poppins', sans-serif",
                  fontSize: "1.1rem",
                }}
              >
                The payment is now pending babysitter confirmation. Please
                review the details below and proceed with the verification.
              </Typography>
              <Card
                sx={{
                  mt: 4,
                  p: 4,
                  borderRadius: "15px",
                  boxShadow: 10,
                  backgroundColor: "#ffffff",
                  border: "none",
                  width: 800,
                  margin: "auto",
                  transition: "transform 0.3s ease, box-shadow 0.3s ease",
                  overflow: "hidden",
                  position: "relative",
                }}
              >
                <Box
                  sx={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: "100%",
                    height: "100%",
                    backgroundImage:
                      "linear-gradient(135deg, #5e62d1, #3f51b5)",
                    borderRadius: "15px",
                    zIndex: -1,
                  }}
                />
                <CardContent sx={{ paddingBottom: "16px" }}>
                  <Box
                    sx={{
                      backgroundImage:
                        "linear-gradient(135deg, #5e62d1, #3f51b5)",
                      borderRadius: "10px",
                      padding: "12px",
                      marginBottom: "20px",
                    }}
                  >
                    <Typography
                      variant="h5"
                      sx={{
                        fontWeight: "bold",
                        fontSize: "1.5rem",
                        color: "white",
                        fontFamily: "'Poppins', sans-serif",
                        textAlign: "center",
                        letterSpacing: "0.5px",
                      }}
                    >
                      Digital Voucher
                    </Typography>
                  </Box>
                  <Divider sx={{ mt: 3, mb: 3, borderColor: "#e0e0e0" }} />
                  {agreement && (
                    <Grid container spacing={3}>
                      <Grid item xs={12} sm={6}>
                        <Typography
                          variant="h6"
                          sx={{
                            mb: 2,
                            fontWeight: 600,
                            fontSize: "1rem",
                            color: "#333333",
                            fontFamily: "'Poppins', sans-serif",
                            display: "flex",
                            alignItems: "center",
                            gap: 1,
                          }}
                        >
                          <AttachMoneyIcon sx={{ color: "#5e62d1" }} />
                          <strong>Amount:</strong> {agreement.amount || "N/A"}€
                        </Typography>
                        <Typography
                          variant="h6"
                          sx={{
                            mb: 2,
                            fontWeight: 600,
                            fontSize: "1rem",
                            color: "#333333",
                            fontFamily: "'Poppins', sans-serif",
                            display: "flex",
                            alignItems: "center",
                            gap: 1,
                          }}
                        >
                          <LocationOnIcon sx={{ color: "#5e62d1" }} />
                          <strong>Area:</strong> {agreement.area || "N/A"}
                        </Typography>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Typography
                          variant="h6"
                          sx={{
                            mb: 2,
                            fontWeight: 600,
                            fontSize: "1rem",
                            color: "#333333",
                            fontFamily: "'Poppins', sans-serif",
                            display: "flex",
                            alignItems: "center",
                            gap: 1,
                          }}
                        >
                          <AccessTimeIcon sx={{ color: "#5e62d1" }} />
                          <strong>Service Period:</strong> 1 Month
                        </Typography>
                        <Typography
                          variant="h6"
                          sx={{
                            mb: 2,
                            fontWeight: 600,
                            fontSize: "1rem",
                            color: "#333333",
                            fontFamily: "'Poppins', sans-serif",
                            display: "flex",
                            alignItems: "center",
                            gap: 1,
                          }}
                        >
                          <PlaceIcon sx={{ color: "#5e62d1" }} />
                          <strong>Service Location:</strong>{" "}
                          {agreement.babysittingPlace || "N/A"}
                        </Typography>
                      </Grid>
                    </Grid>
                  )}
                </CardContent>
              </Card>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  flexDirection: "column",
                  mt: 8,
                }}
              >
                <StyledButton
                  onClick={generatePDF}
                  sx={{
                    backgroundColor: "white",
                    color: "#5e62d1",
                    outline: "1px solid #5e62d1",
                    borderRadius: "30px",
                    padding: "8px 16px",
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    "&:hover": {
                      backgroundColor: "#f0f4ff",
                    },
                  }}
                >
                  <DownloadIcon sx={{ mr: 1, fontSize: "20px" }} />{" "}
                  <span>Download Voucher</span>
                </StyledButton>
                <StyledButton
                  variant="contained"
                  sx={{
                    mt: 8,
                    backgroundColor: "#5e62d1",
                    "&:hover": {
                      backgroundColor: "#4a4fbf",
                    },
                  }}
                  onClick={async () => {
                    if (!userId1 || !userId2) {
                      console.error(
                        "Error: senderId or recipientId is undefined"
                      );
                      setAlert({
                        open: true,
                        message:
                          "Sender or Recipient information is missing. Cannot proceed.",
                        severity: "error",
                      });

                      return;
                    }

                    try {
                      const agreementRef = query(
                        collection(FIREBASE_DB, "agreements"),
                        where("senderId", "==", userId1),
                        where("recipientId", "==", userId2)
                      );

                      const agreementSnapshot = await getDocs(agreementRef);

                      if (!agreementSnapshot.empty) {
                        const agreementDoc = agreementSnapshot.docs[0];
                        const agreementData = agreementDoc.data();
                        setAgreement({
                          id: agreementDoc.id,
                          ...agreementData,
                        });

                        console.log("Agreement data fetched:", agreementData);

                        const currentDate = new Date();
                        const endingDate = new Date(agreementData.endingDate);
                        const paymentStatus =
                          currentDate >= endingDate
                            ? "completed"
                            : "not available yet";

                        const agreementDocRef = doc(
                          FIREBASE_DB,
                          "agreements",
                          agreementDoc.id
                        );

                        await updateDoc(agreementDocRef, {
                          paymentStatus: paymentStatus,
                        });

                        setAgreement((prev) => ({
                          ...prev,
                          paymentStatus: paymentStatus,
                        }));

                        setAlert({
                          open: true,
                          message: "Verification Completed!",
                          severity: "success",
                        });
                        navigate("/my-dashboard");
                      } else {
                        console.error(
                          "No agreement found for the provided sender and recipient."
                        );
                        setAlert({
                          open: true,
                          message:
                            "No agreement found for the provided sender and recipient.",
                          severity: "error",
                        });
                      }
                    } catch (error) {
                      console.error(
                        "Error fetching or updating agreement:",
                        error.message
                      );
                      setAlert({
                        open: true,
                        message:
                          "An error occurred while processing. Please try again.",
                        severity: "error",
                      });
                    }
                  }}
                >
                  Confirm & Verify
                </StyledButton>
              </Box>
            </PageContainer>
          ) : (
            <PageContainer>
              <Typography variant="body1">Unknown payment status</Typography>
            </PageContainer>
          )
        ) : (
          <Typography variant="body1">Loading...</Typography>
        )}
      </Container>
      <Snackbar
        open={alert.open}
        autoHideDuration={6000}
        onClose={handleAlertClose}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          onClose={handleAlertClose}
          severity={alert.severity}
          sx={{ width: "100%" }}
        >
          {alert.message}
        </Alert>
      </Snackbar>
    </div>
  );
};

export default PaymentTracker;
