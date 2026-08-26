import React from "react";
import { Stack, Typography } from "@mui/material";
import Logo from "../logo/Logo";
import Image from "../image/Image";
import LocationErrorIlustrate from "src/assets/icons/LocationErrorIlustrate";

function LocationInstruction() {
  return (
    <React.Fragment>
      <Stack p={2} flexDirection={"row"} justifyContent={"center"}>
        <Logo />
      </Stack>
      <Stack
        justifyContent={"center"}
        alignItems={"center"}
        width={{ xs: "95%", md: "60%" }}
        margin={"5vh auto"}
      >
        <Typography variant="h4" color={"#707070"}>
          Location sharing is mandatory to use{" "}
          {process.env.REACT_APP_COMPANY_NAME} Platform for enhanced security
          reasons, Kindly Enable location sharing to continue using{" "}
          {process.env.REACT_APP_COMPANY_NAME} services.
        </Typography>
      </Stack>
      <Stack
        flexDirection={{ xs: "column-reverse", md: "row" }}
        alignItems={"center"}
        justifyContent={"center"}
        margin={"2vh 10px"}
      >
        <Stack>
          <Typography variant="body1">
            Here are the general steps to unblock location sharing in some
            commonly used browsers:
          </Typography>
          <br />
          <Typography variant="subtitle1">Google Chrome:</Typography>
          <Typography variant="body1">
            1. Click on the lock icon (or information icon) located to the left
            of the website URL in the address bar. <br />
            2. In the dropdown menu, find the "Location" option and change it to
            "Allow".
            <br />
            3. Refresh the webpage for the changes to take effect.
          </Typography>
          <br />
          <Typography variant="subtitle1">Safari:</Typography>
          <Typography variant="body1">
            1. Click on Safari in the top menu bar and select "Preferences".
            <br />
            2. Go to the "Websites" tab and select "Location" from the left
            sidebar.
            <br />
            3. Find the website in the right pane and set its permission to
            "Allow".
            <br />
            4. Close the preferences window and refresh the webpage.
          </Typography>
          <br />
          <Typography variant="subtitle1">Microsoft Edge:</Typography>
          <Typography variant="body1">
            1. Click on the padlock icon located to the left of the website URL
            in the address bar.
            <br />
            2. In the dropdown menu, find the "Permissions" section and click on
            "Manage permissions".
            <br />
            3. Set the location permission to "Allow" or "Ask" and then refresh
            the webpage.
          </Typography>
        </Stack>
        <LocationErrorIlustrate />
      </Stack>
    </React.Fragment>
  );
}

export default LocationInstruction;
