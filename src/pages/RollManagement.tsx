import React, { useState } from "react";
import {
  FormControlLabel,
  Radio,
  RadioGroup,
  Stack,
  FormControl,
  Typography,
  TextField,
  Button,
  Grid,
  Box,
  IconButton,
} from "@mui/material";

function RollManagement() {
  const [selectedValue, setSelectedValue] = useState("agent");
  const [getValue, setGetValue] = useState("agent");

  const handleChange = (event: any) => {
    setSelectedValue(event.target.value);
  };

  const handleChange1 = (event: any) => {
    setGetValue(event.target.value);
  };

  return (
    <>
      <Grid sx={{ marginLeft: "30px" }}>
        <Typography variant="h5">New Deployment</Typography>
        <Typography variant="h6">Upload User</Typography>
        <FormControl>
          <RadioGroup
            value={selectedValue}
            onChange={handleChange}
            row
            aria-labelledby="demo-row-radio-buttons-group-label"
            name="row-radio-buttons-group"
          >
            {/* Item 3d: roles are only Admin and API_User now. */}
            <FormControlLabel
              value="API_User"
              control={<Radio />}
              label="API User"
            />
          </RadioGroup>
        </FormControl>
        <Grid
          sx={{
            position: "relative",
            display: "flex",
            flexDirection: "row",
            gap: "20px",
          }}
        >
          <TextField
            sx={{ width: "28%" }}
            size="small"
            label="Name"
            variant="outlined"
          />
          <TextField
            sx={{ width: "28%" }}
            size="small"
            label="Aadhar Number"
            variant="outlined"
          />
        </Grid>
        <Grid
          sx={{
            position: "relative",
            display: "flex",
            flexDirection: "row",
            gap: "20px",
            marginTop: "8px",
          }}
        >
          <TextField
            sx={{ width: "28%" }}
            size="small"
            label="PAN Number"
            variant="outlined"
          />
          <TextField
            sx={{ width: "28%" }}
            size="small"
            label="Email"
            variant="outlined"
          />
        </Grid>
        <Grid
          sx={{
            position: "relative",
            display: "flex",
            flexDirection: "row",
            gap: "20px",
            marginTop: "8px",
          }}
        >
          <TextField
            sx={{ width: "28%" }}
            size="small"
            label="Phone"
            variant="outlined"
          />
          <TextField
            sx={{ width: "28%" }}
            size="small"
            label="Business Name"
            variant="outlined"
          />
        </Grid>
        <Grid
          sx={{
            position: "relative",
            display: "flex",
            flexDirection: "row",
            gap: "20px",
            marginTop: "8px",
          }}
        >
          <TextField
            sx={{ width: "28%" }}
            size="small"
            label="Address"
            variant="outlined"
          />
          <TextField
            sx={{ width: "28%" }}
            size="small"
            label="Referral Code"
            variant="outlined"
          />
        </Grid>
        <Button
          sx={{
            position: "relative",
            marginTop: "10px",
          }}
          variant="contained"
        >
          Submit
        </Button>
        <Typography variant="h6" sx={{ marginTop: "5px" }}>
          Bulk User Upload
        </Typography>
        <FormControl>
          <RadioGroup
            value={getValue}
            onChange={handleChange1}
            row
            aria-labelledby="demo-row-radio-buttons-group-label"
            name="row-radio-buttons-group"
          >
            {/* Item 3d: roles are only Admin and API_User now. */}
            <FormControlLabel
              value="API_User"
              control={<Radio />}
              label="API User"
            />
          </RadioGroup>
        </FormControl>
        <Box className="box">
          <Grid container>
            <Grid item>
              <Box
                sx={{
                  backgroundColor: " #F6FAFC",
                  border: "1px dashed",
                  borderColor: " #919eab7a",
                  borderRadius: "12px",
                  width: "18vw",
                  heigth: "50px",
                  marginTop: "5px",
                }}
              >
                <Typography sx={{ marginLeft: "2px" }}>
                  Van 2 rrr.csv
                </Typography>
                <Typography sx={{ marginLeft: "2px" }}>121.00 KB</Typography>
              </Box>
            </Grid>
          </Grid>
        </Box>
        <Grid sx={{ display: "flex", marginTop: "10px", gap: 2 }}>
          <Button variant="contained" size="medium" disabled={false}>
            Next
          </Button>
          <Button disabled={false} size="medium" variant="contained">
            Download CSV Sample
          </Button>
        </Grid>
      </Grid>
    </>
  );
}

export default RollManagement;
