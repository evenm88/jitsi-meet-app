import React, { useState, useEffect } from "react";
import { Container, Box, Typography, TextField, Button } from "@mui/material";

function App() {
  const getRoomFromURL = () => {
    const hash = window.location.hash;
    return hash ? hash.substring(1) : "";
  };

  const [roomName, setRoomName] = useState(getRoomFromURL() || "");
  const [startCall, setStartCall] = useState(!!getRoomFromURL());

  useEffect(() => {
    const hash = getRoomFromURL();
    if (hash && !startCall) {
      setRoomName(hash);
      setStartCall(true);
    }
  }, []);

  const handleStart = () => {
    if (roomName.trim()) {
      window.location.hash = roomName;
      setStartCall(true);
    }
  };

  return (
    <Container>
      <Box mt={10} textAlign="center">
        <Typography variant="h4" gutterBottom>
          MedIntel Telemedicine
        </Typography>

        {!startCall ? (
          <>
            <TextField
              fullWidth
              label="Room Name"
              variant="outlined"
              value={roomName}
              onChange={(e) => setRoomName(e.target.value)}
              style={{ marginBottom: 20 }}
            />
            <Button variant="contained" onClick={handleStart}>
              Start Call
            </Button>
          </>
        ) : (
          <VideoCall room={roomName} />
        )}
      </Box>
    </Container>
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
  const patientid = searchParams.get("patientid") || "";

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
      if (api) api.dispose();
      container.innerHTML = "";
    };
  }, [room]);

  useEffect(() => {
    const fetchPastPrescriptions = async () => {
      try {
        const response = await fetch(
          `http://localhost:8000/get-prescriptions/${patientid}`
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
    doctorid: 'doc123',
    patientid: patientid,
    prescriptions,
  };

  console.log(payload, 'Payload to be sent to server...........');

  try {
    const response = await fetch(
      'http://localhost:8000/add-prescription',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      }
    );

    if (!response.ok) {
      throw new Error('Failed to save prescription');
    }

    const result = await response.json();
    console.log('Saved Prescription:', result);
    alert('Prescription saved successfully!');

    // Create new entry to match structure
    const newEntry = {
      ...payload,
      created_at: new Date().toISOString(),
      status: 'active',
    };

    // Add to the beginning of pastPrescriptions
    setPastPrescriptions((prev) => [newEntry, ...prev]);

    // Clear current form
    setPrescriptions([{ name: '', count: '', dosage: '' }]);

  } catch (error) {
    console.error('Error saving prescription:', error);
    alert('Failed to save prescription.');
  }
};


  return (
    <Box display="flex" height="100vh" width="100%" overflow="hidden">
      {/* Jitsi Video Panel */}
      <Box
        id="jitsi-container"
        flex="1"
        sx={{
          minHeight: "100%",
          borderRight: "1px solid #ccc",
          overflow: "hidden",
        }}
      />

      {/* Prescription Panel */}
      <Box
        flex="0 0 400px"
        maxWidth="100%"
        p={2}
        display="flex"
        flexDirection="column"
        sx={{ backgroundColor: "#fafafa", overflowY: "auto" }}
      >
        {/* Current Prescription */}
        <Box mb={4}>
          <Typography variant="h6" gutterBottom>
            Current Prescription
          </Typography>

          {/* Prescription Table */}
          <Box
            component="table"
            sx={{ width: "100%", borderCollapse: "collapse", mb: 2 }}
          >
            <Box component="thead">
              <Box component="tr">
                <Box
                  component="th"
                  sx={{
                    borderBottom: "1px solid #ccc",
                    textAlign: "left",
                    p: 1,
                  }}
                >
                  Medicine Name
                </Box>
                <Box
                  component="th"
                  sx={{
                    borderBottom: "1px solid #ccc",
                    textAlign: "left",
                    p: 1,
                  }}
                >
                  Count
                </Box>
                <Box
                  component="th"
                  sx={{
                    borderBottom: "1px solid #ccc",
                    textAlign: "left",
                    p: 1,
                  }}
                >
                  Dosage
                </Box>
              </Box>
            </Box>
            <Box component="tbody">
              {prescriptions.map((item, index) => (
                <Box component="tr" key={index}>
                  <Box component="td" sx={{ p: 1 }}>
                    <TextField
                      value={item.name}
                      onChange={(e) =>
                        handleChange(index, "name", e.target.value)
                      }
                      size="small"
                      fullWidth
                    />
                  </Box>
                  <Box component="td" sx={{ p: 1 }}>
                    <TextField
                      value={item.count}
                      onChange={(e) =>
                        handleChange(index, "count", e.target.value)
                      }
                      size="small"
                      fullWidth
                    />
                  </Box>
                  <Box component="td" sx={{ p: 1 }}>
                    <TextField
                      value={item.dosage}
                      onChange={(e) =>
                        handleChange(index, "dosage", e.target.value)
                      }
                      size="small"
                      placeholder="e.g. 1-0-1"
                      fullWidth
                    />
                  </Box>
                </Box>
              ))}
            </Box>
          </Box>

          <Box display="flex" gap={2} mb={2}>
            <Button variant="outlined" onClick={handleAddRow}>
              Add Medicine
            </Button>
            <Button variant="contained" onClick={handleSave}>
              Save Prescription
            </Button>
          </Box>
        </Box>

        {/* Past Prescriptions */}
        <Box>
          <Typography variant="h6" gutterBottom>
            Past Prescriptions
          </Typography>

          {pastPrescriptions.length === 0 ? (
            <Typography>No past prescriptions found.</Typography>
          ) : (
            pastPrescriptions.map((entry, idx) => (
  <Box
    key={idx}
    mb={3}
    p={2}
    border="1px solid #ccc"
    borderRadius={2}
    bgcolor="white"
  >
    <Typography variant="subtitle2" gutterBottom>
      Prescription #{idx + 1}
    </Typography>

    <Typography variant="caption" color="text.secondary" gutterBottom>
      {new Date(entry.created_at).toLocaleString()}
    </Typography>

    <Box component="table" sx={{ width: '100%', borderCollapse: 'collapse', mt: 1 }}>
      <Box component="thead">
        <Box component="tr">
          <Box component="th" sx={{ borderBottom: '1px solid #ccc', textAlign: 'left', p: 1 }}>
            Medicine Name
          </Box>
          <Box component="th" sx={{ borderBottom: '1px solid #ccc', textAlign: 'left', p: 1 }}>
            Count
          </Box>
          <Box component="th" sx={{ borderBottom: '1px solid #ccc', textAlign: 'left', p: 1 }}>
            Dosage
          </Box>
        </Box>
      </Box>
      <Box component="tbody">
        {entry.prescriptions.map((med, i) => (
          <Box component="tr" key={i}>
            <Box component="td" sx={{ p: 1 }}>{med.name}</Box>
            <Box component="td" sx={{ p: 1 }}>{med.count}</Box>
            <Box component="td" sx={{ p: 1 }}>{med.dosage}</Box>
          </Box>
        ))}
      </Box>
    </Box>
  </Box>
))
          )}
        </Box>
      </Box>
    </Box>
  );
}

export default App;
