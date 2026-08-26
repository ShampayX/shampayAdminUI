import { forwardRef } from "react";
import { useTheme } from "@mui/material/styles";
import { Badge, Avatar } from "@mui/material";
//
import { CustomAvatarProps } from "./types";
import AWS from "aws-sdk";
import React from "react";

AWS.config.update({
  accessKeyId: process.env.REACT_APP_AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.REACT_APP_AWS_SECRET_ACCESS_KEY,
  region: "ap-south-1",
});

// ----------------------------------------------------------------------

const CustomAvatar = forwardRef<HTMLDivElement, CustomAvatarProps>(
  ({ color, name = "", BadgeProps, children, sx, src, ...other }, ref) => {
    const theme = useTheme();
    const [secureLink, setSecureLink] = React.useState("");
    const s3 = new AWS.S3();

    const params = {
      Bucket: process.env.REACT_APP_AWS_BUCKET_NAME,
      Key: src !== "" && src?.split("/").splice(4, 4).join("/"),
      Expires: 600, // Expiration time in seconds
    };

    s3.getSignedUrl("getObject", params, (err, url) => {
      setSecureLink(url);
    });

    const { color: colorByName, name: charAtName } = getColorByName(name);

    const colr = color || colorByName;

    const renderContent =
      colr == "default" ? (
        <Avatar ref={ref} sx={sx} {...other}>
          {name && charAtName}
          {children}
        </Avatar>
      ) : (
        <Avatar
          ref={ref}
          sx={{
            color: theme.palette[colr]?.contrastText,
            backgroundColor: theme.palette[colr]?.main,
            fontWeight: theme.typography.fontWeightMedium,
            ...sx,
          }}
          src={secureLink}
          {...other}
        >
          {name && charAtName}
          {children}
        </Avatar>
      );

    return BadgeProps ? (
      <Badge
        overlap="circular"
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        {...BadgeProps}
      >
        {renderContent}
      </Badge>
    ) : (
      renderContent
    );
  }
);

export default CustomAvatar;

// ----------------------------------------------------------------------

function getColorByName(name: string) {
  const character = (name: string) => name && name.charAt(0).toUpperCase();

  const colorByName = (name: string) => {
    if (["A", "N", "H", "L", "Q"].includes(character(name))) return "primary";
    if (["F", "G", "T", "I", "J"].includes(character(name))) return "info";
    if (["K", "D", "Y", "B", "O"].includes(character(name))) return "success";
    if (["P", "E", "R", "S", "U"].includes(character(name))) return "warning";
    if (["V", "W", "X", "M", "Z"].includes(character(name))) return "error";
    return "default";
  };

  return {
    name: character(name),
    color: colorByName(name),
  } as const;
}
