import React, { useState, useEffect } from "react";
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from "@mui/material";

// ✅ Add logo import (adjust path if needed)
import logo from "./assets/medintel-logo.png"; // Rename uploaded file and place in /src/assets

function App() {
  const getRoomFromURL = () => {
    const hash = window.location.hash;
    return hash ? hash.substring(1).split("?")[0] : "defaultRoom"; // fallback room name
  };

  return (
    <Box
      height="100vh"
      width="100vw"
      display="flex"
      justifyContent="center"
      alignItems="center"
      bgcolor="#fce4ec"
    >
      <VideoCall room={getRoomFromURL()} />
    </Box>
  );
}

function VideoCall({ room }) {
  const [prescriptions, setPrescriptions] = useState([
    { name: "", count: "", dosage: "" },
  ]);
  const [pastPrescriptions, setPastPrescriptions] = useState([]);

  const hash = window.location.hash;
  const queryIndex = hash.indexOf("?");
  const searchParams = new URLSearchParams(
    queryIndex >= 0 ? hash.substring(queryIndex) : ""
  );
  const patientid = searchParams.get("patient") || "";
  const doctorid = searchParams.get("doctor") || "";

  useEffect(() => {
    if (!window.JitsiMeetExternalAPI) {
      console.error("Jitsi API not loaded");
      return;
    }

    const domain = "meet.jit.si";
    const container = document.getElementById("jitsi-container");
    container.innerHTML = "";

    const api = new window.JitsiMeetExternalAPI(domain, {
      roomName: room,
      parentNode: container,
      width: "100%",
      height: "100%",
      interfaceConfigOverwrite: {
        SHOW_JITSI_WATERMARK: false,
        SHOW_BRAND_WATERMARK: false,
      },
      configOverwrite: {
        startWithAudioMuted: true,
      },
    });

    return () => {
      api?.dispose();
      container.innerHTML = "";
    };
  }, [room]);

  useEffect(() => {
    const fetchPastPrescriptions = async () => {
      try {
        const response = await fetch(
          `https://quail-enhanced-shortly.ngrok-free.app/get-prescriptions/${patientid}`
        );
        if (!response.ok) throw new Error("Failed to fetch past prescriptions");

        const data = await response.json();
        setPastPrescriptions(data.prescriptions || []);
      } catch (err) {
        console.error("Error fetching past prescriptions:", err);
      }
    };

    if (patientid) {
      fetchPastPrescriptions();
    }
  }, [patientid]);

  const handleChange = (index, field, value) => {
    const updated = [...prescriptions];
    updated[index][field] = value;
    setPrescriptions(updated);
  };

  const handleAddRow = () => {
    setPrescriptions([...prescriptions, { name: "", count: "", dosage: "" }]);
  };

  const handleSave = async () => {
    const payload = {
      doctorid,
      patientid,
      prescriptions,
    };

    try {
      const response = await fetch("https://quail-enhanced-shortly.ngrok-free.app/add-prescription", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) throw new Error("Save failed");

      const result = await response.json();
      alert("Prescription saved successfully!");

      setPastPrescriptions((prev) => [
        {
          ...payload,
          created_at: new Date().toISOString(),
          status: "active",
        },
        ...prev,
      ]);
      setPrescriptions([{ name: "", count: "", dosage: "" }]);
    } catch (error) {
      console.error("Error saving prescription:", error);
      alert("Failed to save prescription.");
    }
  };

  return (
    <Box
      position="relative"
      display="flex"
      height="100vh"
      width="100vw"
      overflow="hidden"
    >
      {/* Logo and header in top-left */}
      <Box
        position="absolute"
        top={10}
        left={10}
        zIndex={10}
        display="flex"
        alignItems="center"
        gap={1}
        bgcolor="rgba(255,255,255,0.9)"
        p={1}
        borderRadius={2}
        boxShadow={2}
      >
        <img
          src={require("./assets/medintel-logo.png")}
          alt="MedIntel Logo"
          width={40}
        />
        <Typography variant="h6" color="primary">
          MedIntel Telemedicine
        </Typography>
      </Box>

      {/* Jitsi Video Panel */}
      <Box
        id="jitsi-container"
        flex="1"
        sx={{
          minHeight: "100%",
          borderRight: "2px solid #ec407a",
          overflow: "hidden",
        }}
      />

      {/* Right Panel */}
      <Box
        flex="0 0 400px"
        maxWidth="100%"
        p={2}
        display="flex"
        flexDirection="column"
        sx={{ backgroundColor: "#fce4ec", overflowY: "auto" }}
      >
        {/* Current Prescription */}
        {doctorid && (
          <Paper
            elevation={3}
            sx={{ p: 2, mb: 3, borderLeft: "4px solid #1976d2" }}
          >
            <Typography variant="h6" gutterBottom sx={{ color: "#1976d2" }}>
              Current Prescription
            </Typography>
            <Table size="small">
              <TableHead>
                <TableRow sx={{ backgroundColor: "#f8bbd0" }}>
                  <TableCell>Medicine</TableCell>
                  <TableCell>Count</TableCell>
                  <TableCell>Dosage</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {prescriptions.map((item, index) => (
                  <TableRow key={index}>
                    <TableCell>
                      <TextField
                        value={item.name}
                        onChange={(e) =>
                          handleChange(index, "name", e.target.value)
                        }
                        size="small"
                        fullWidth
                      />
                    </TableCell>
                    <TableCell>
                      <TextField
                        value={item.count}
                        onChange={(e) =>
                          handleChange(index, "count", e.target.value)
                        }
                        size="small"
                        fullWidth
                      />
                    </TableCell>
                    <TableCell>
                      <TextField
                        value={item.dosage}
                        onChange={(e) =>
                          handleChange(index, "dosage", e.target.value)
                        }
                        size="small"
                        fullWidth
                        placeholder="e.g. 1-0-1"
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <Box display="flex" gap={1} mt={2}>
              <Button
                variant="outlined"
                onClick={handleAddRow}
                sx={{ borderColor: "#ec407a", color: "#ec407a" }}
              >
                Add Medicine
              </Button>
              <Button
                variant="contained"
                onClick={handleSave}
                sx={{ backgroundColor: "#1976d2", color: "#fff" }}
              >
                Save
              </Button>
            </Box>
          </Paper>
        )}

        {/* Past Prescriptions */}
        <Typography variant="h6" gutterBottom sx={{ color: "#1976d2" }}>
          Past Prescriptions
        </Typography>

        {pastPrescriptions.length === 0 ? (
          <Typography>No past prescriptions found.</Typography>
        ) : (
          pastPrescriptions.toReversed().map((entry, idx) => (
            <Paper
              key={idx}
              elevation={1}
              sx={{
                p: 2,
                mb: 2,
                borderLeft: "4px solid #ec407a",
                backgroundColor: "#ffffff",
              }}
            >
              <Typography variant="subtitle2">
                Prescription #{idx + 1}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {new Date(entry.created_at).toLocaleString()}
              </Typography>
              <Table size="small" sx={{ mt: 1 }}>
                <TableHead>
                  <TableRow sx={{ backgroundColor: "#f8bbd0" }}>
                    <TableCell>Medicine</TableCell>
                    <TableCell>Count</TableCell>
                    <TableCell>Dosage</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {entry.prescriptions.map((med, i) => (
                    <TableRow key={i}>
                      <TableCell>{med.name}</TableCell>
                      <TableCell>{med.count}</TableCell>
                      <TableCell>{med.dosage}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Paper>
          ))
        )}
      </Box>
    </Box>
  );
}

export default App;
