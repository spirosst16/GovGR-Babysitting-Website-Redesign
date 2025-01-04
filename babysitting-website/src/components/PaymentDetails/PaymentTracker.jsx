import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import {
  getDocs,
  query,
  where,
  collection,
  getDoc,
  doc,
  updateDoc,
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
} from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CelebrationIcon from "@mui/icons-material/Celebration";
import { styled } from "@mui/system";
import Navbar from "../Navbar/Navbar";

const StyledButton = styled(Button)({
  fontFamily: "'Poppins', sans-serif",
  fontSize: "1rem",
  textTransform: "none",
  borderRadius: "30px",
  backgroundColor: "#5e62d1",
  color: "white",
  "&:hover": {
    backgroundColor: "#4a4fbf",
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
  "Confirm Monthly Work Completion",
  "Generate Digital Voucher",
  "Finalize Payment Process",
];

const PaymentTracker = () => {
  const { senderId, recipientId } = useParams();
  const [currentUser, setCurrentUser] = useState(null);
  const [currentUserRole, setCurrentUserRole] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [sender, setSender] = useState(null);
  const [recipient, setRecipient] = useState(null);
  const [agreement, setAgreement] = useState(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [workConfirmed, setWorkConfirmed] = useState(false);

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
      if (!senderId || !recipientId) {
        console.error("Error: senderId or recipientId is undefined");
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

      const [senderData, recipientData] = await Promise.all([
        fetchUserData(senderId),
        fetchUserData(recipientId),
      ]);

      setSender(senderData);
      setRecipient(recipientData);

      const agreementRef = query(
        collection(FIREBASE_DB, "agreements"),
        where("senderId", "==", senderId),
        where("recipientId", "==", recipientId)
      );

      const agreementSnapshot = await getDocs(agreementRef);
      if (!agreementSnapshot.empty) {
        const agreementData = agreementSnapshot.docs[0].data();
        setAgreement(agreementData);

        console.log("Agreement data:", agreementData);

        if (
          new Date() > new Date(agreementData.endingDate) &&
          agreementData.paymentStatus === "not available yet"
        ) {
          try {
            const agreementDocRef = doc(
              FIREBASE_DB,
              "agreements",
              agreementSnapshot.docs[0].id
            );
            await updateDoc(agreementDocRef, {
              paymentStatus: "pending guardian",
            });
            setAgreement((prev) => ({
              ...prev,
              paymentStatus: "pending guardian",
            }));
            console.log("Payment status updated to pending guardian.");
          } catch (error) {
            console.error("Error updating payment status:", error.message);
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
  }, [currentUser, senderId, recipientId]);

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
      if (!senderId || !recipientId) {
        console.error("Error: senderId or recipientId is undefined");
        return;
      }

      const agreementRef = query(
        collection(FIREBASE_DB, "agreements"),
        where("senderId", "==", senderId),
        where("recipientId", "==", recipientId)
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
          await updateDoc(agreementDocRef, {
            paymentStatus: "pending babysitter",
          });

          setAgreement((prev) => ({
            ...prev,
            paymentStatus: "pending babysitter",
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
    } catch (error) {
      console.error("Error resetting and updating status:", error.message);
    }
  };

  const generatePDF = () => {
    const doc = new jsPDF();
    doc.setFont("Poppins", "normal");
    doc.setFontSize(14);
    doc.text("Digital Payment Voucher", 10, 10);
    if (agreement) {
      doc.text(`Amount: $${agreement.amount || "N/A"}`, 10, 30);
      doc.text(`Description: ${agreement.description || "N/A"}`, 10, 40);
      doc.text(`Date: ${new Date().toLocaleDateString()}`, 10, 50);
    }
    doc.save("PaymentVoucher.pdf");
  };

  const renderStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <>
            <Typography variant="body1" textAlign="center">
              Confirm the completion of the monthly work.
            </Typography>
            <List sx={{ mt: 2, pl: 2 }}>
              {[
                "Tasks completed as per agreement",
                "Deadlines met",
                "Quality standards maintained",
              ].map((task, index) => (
                <ListItem key={index}>
                  <ListItemIcon>
                    <CheckCircleIcon sx={{ color: "#5e62d1" }} />
                  </ListItemIcon>
                  <ListItemText primary={task} />
                </ListItem>
              ))}
            </List>
            <Box sx={{ mt: 2, textAlign: "center" }}>
              <StyledButton
                onClick={() => setWorkConfirmed(true)}
                disabled={workConfirmed}
              >
                Confirm Work Completion
              </StyledButton>
            </Box>
          </>
        );
      case 1:
        return (
          <>
            <Typography variant="body1" textAlign="center">
              A digital voucher has been generated for the payment. Download it
              below.
            </Typography>
            <Card
              sx={{
                mt: 3,
                p: 2,
                borderRadius: "10px",
                boxShadow: 3,
                backgroundColor: "#f9f9f9",
              }}
            >
              <CardContent>
                <Typography variant="h6" sx={{ mb: 2 }}>
                  Digital Voucher
                </Typography>
                <Divider sx={{ mb: 2 }} />
                {agreement && (
                  <>
                    <Typography variant="body2" sx={{ mb: 1 }}>
                      <strong>Amount:</strong> ${agreement.amount || "N/A"}
                    </Typography>
                    <Typography variant="body2" sx={{ mb: 1 }}>
                      <strong>Description:</strong>{" "}
                      {agreement.description || "N/A"}
                    </Typography>
                  </>
                )}
              </CardContent>
            </Card>
            <Box sx={{ mt: 3, textAlign: "center" }}>
              <StyledButton onClick={generatePDF}>
                Download Voucher
              </StyledButton>
            </Box>
          </>
        );
      case 2:
        return (
          <>
            <Box textAlign="center" sx={{ mt: 4 }}>
              <CelebrationIcon
                sx={{
                  fontSize: "5rem",
                  color: "#5e62d1",
                }}
              />
            </Box>
            <Typography
              variant="h5"
              textAlign="center"
              sx={{ mt: 2, fontWeight: "bold" }}
            >
              Payment Process Completed!
            </Typography>
            <Typography
              variant="body1"
              textAlign="center"
              sx={{ mt: 1, color: "gray" }}
            >
              Thank you for ensuring a smooth payment experience. The
              professional has been notified, and the payment details have been
              securely logged.
            </Typography>
            <Box sx={{ textAlign: "center", mt: 4 }}>
              <StyledButton onClick={handleReset}>Start Over</StyledButton>
            </Box>
          </>
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
          agreement.paymentStatus === "not available yet" ? (
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
                Payment Not Available Yet
              </Typography>
              <Typography
                variant="body1"
                sx={{
                  textAlign: "center",
                  fontFamily: "'Poppins', sans-serif",
                }}
              >
                The payment for this agreement is not available yet. Please wait{" "}
                <strong>
                  {Math.ceil(
                    (new Date(agreement.endingDate) - new Date()) /
                      (1000 * 60 * 60 * 24)
                  ) || 0}
                </strong>{" "}
                days until the agreement's end date.
              </Typography>
            </PageContainer>
          ) : agreement.paymentStatus === "pending guardian" ? (
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
                      onClick={handleBack}
                      disabled={currentStep === 0}
                    >
                      Back
                    </StyledButton>
                    <StyledButton
                      onClick={handleNext}
                      disabled={currentStep === 0 && !workConfirmed}
                    >
                      Next
                    </StyledButton>
                  </Box>
                )}
              </Box>
            </>
          ) : agreement.paymentStatus === "pending babysitter" ? (
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
                variant="body1"
                sx={{
                  textAlign: "center",
                  fontFamily: "'Poppins', sans-serif",
                  marginBottom: "20px",
                }}
              >
                The payment is now pending babysitter confirmation. Please
                review the details below and proceed with the verification.
              </Typography>
              <Card
                sx={{
                  mt: 3,
                  p: 3,
                  borderRadius: "10px",
                  boxShadow: 3,
                  backgroundColor: "#ffffff",
                }}
              >
                <CardContent>
                  <Typography
                    variant="h6"
                    sx={{ marginBottom: "10px", textAlign: "center" }}
                  >
                    Verification Details
                  </Typography>
                  <Divider sx={{ marginBottom: "10px" }} />
                  <Typography variant="body2" sx={{ marginBottom: "10px" }}>
                    <strong>Amount:</strong> ${agreement.amount || "N/A"}
                  </Typography>
                  <Typography variant="body2" sx={{ marginBottom: "10px" }}>
                    <strong>Description:</strong>{" "}
                    {agreement.description || "N/A"}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Verification Code:</strong>{" "}
                    {agreement.verificationCode || "Pending Generation"}
                  </Typography>
                </CardContent>
              </Card>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  flexDirection: "column",
                  marginTop: "30px",
                }}
              >
                <StyledButton
                  onClick={async () => {
                    if (!senderId || !recipientId) {
                      console.error(
                        "Error: senderId or recipientId is undefined"
                      );
                      alert(
                        "Sender or Recipient information is missing. Cannot proceed."
                      );
                      return;
                    }

                    try {
                      const agreementRef = query(
                        collection(FIREBASE_DB, "agreements"),
                        where("senderId", "==", senderId),
                        where("recipientId", "==", recipientId)
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

                        const agreementDocRef = doc(
                          FIREBASE_DB,
                          "agreements",
                          agreementDoc.id
                        );
                        await updateDoc(agreementDocRef, {
                          paymentStatus: "not available yet",
                        });

                        setAgreement((prev) => ({
                          ...prev,
                          paymentStatus: "not available yet",
                        }));

                        alert(
                          "Verification Completed! Payment status updated to 'not available yet.'"
                        );
                      } else {
                        console.error(
                          "No agreement found for the provided sender and recipient."
                        );
                        alert(
                          "No agreement found for the provided sender and recipient."
                        );
                      }
                    } catch (error) {
                      console.error(
                        "Error fetching or updating agreement:",
                        error.message
                      );
                      alert(
                        "An error occurred while processing. Please try again."
                      );
                    }
                  }}
                  sx={{ marginBottom: "20px" }}
                >
                  Confirm & Verify
                </StyledButton>
                <StyledButton onClick={generatePDF}>
                  Download Virtual Receipt
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
    </div>
  );
};

export default PaymentTracker;
