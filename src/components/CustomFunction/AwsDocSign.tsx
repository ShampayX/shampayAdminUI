import AWS from "aws-sdk";
import React from "react";

AWS.config.update({
  accessKeyId: process.env.REACT_APP_AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.REACT_APP_AWS_SECRET_ACCESS_KEY,
  region: "ap-south-1",
});

export default function AwsDocSign(docLink: String) {
  const [secureLink, setSecureLink] = React.useState("");
  const s3 = new AWS.S3();

  const params = {
    Bucket: process.env.REACT_APP_AWS_BUCKET_NAME,
    Key: docLink !== "" && docLink?.split("/").splice(4, 4).join("/"),
    Expires: 600, // Expiration time in seconds
  };

  s3.getSignedUrl("getObject", params, (err, url) => {
    setSecureLink(url);
  });
  return secureLink;
}
