import { fileURLToPath } from "url";
import { dirname } from "path";
import * as fs from "fs";
import { format } from "date-fns";

// import statements
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const packagePath = `${__dirname}/../package.json`;

// Function to update lastUpdated field in package.json
const updateLastUpdated = () => {
  var currentTime = new Date();
  var currentOffset = currentTime.getTimezoneOffset();
  var ISTOffset = 330; // IST offset UTC +5:30
  var ISTTime = new Date(
    currentTime.getTime() + (ISTOffset + currentOffset) * 60000
  );

  // ISTTime now represents the time in IST coordinates

  var dateIST = ISTTime.getDate();
  var monthIST = ISTTime.getMonth() + 1;
  var yearIST = ISTTime.getFullYear();

  var hoursIST = ISTTime.getHours();
  var minutesIST = ISTTime.getMinutes();
  var secondsIST = ISTTime.getSeconds();

  const currentDate =
    `${dateIST}/${monthIST}/${yearIST}` +
    " " +
    hoursIST +
    ":" +
    minutesIST +
    ":" +
    secondsIST; // Get current date and time in IST
  const packageJson = JSON.parse(fs.readFileSync(packagePath, "utf8")); // Read package.json
  packageJson.lastUpdated = currentDate; // Update lastUpdated field
  fs.writeFileSync(packagePath, JSON.stringify(packageJson, null, 2)); // Write updated package.json
  // Log updated time
};

updateLastUpdated(); // Call the function to update lastUpdated field
