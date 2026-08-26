import { fileURLToPath } from "url";
import { dirname } from "path";
import * as fs from "fs";

const __filename = fileURLToPath(import.meta.url);

const __dirname = dirname(__filename);

const packagePath = `${__dirname}/../package.json`;

// Default version type set to patch
let versionType = "patch";

fs.readFile(packagePath, "utf8", (err, data) => {
  if (err) {
    console.error("Error reading package.json:", err);
    return;
  }

  try {
    const packageJson = JSON.parse(data);

    let versionParts = packageJson.versionprod
      .split(".")
      .map((part) => parseInt(part));
    if (versionParts[2] === 9 && versionParts[1] !== 9) {
      versionType = "minor";
    } else if (versionParts[2] === 9 && versionParts[1] === 9) {
      versionType = "major";
    }
    if (versionType === "major") {
      versionParts = [versionParts[0] + 1, 0, 0];
    } else if (versionType === "minor") {
      versionParts = [versionParts[0], versionParts[1] + 1, 0];
    } else if (versionType === "patch") {
      versionParts = [versionParts[0], versionParts[1], versionParts[2] + 1];
    }
    packageJson.versionprod = versionParts.join(".");

    fs.writeFile(
      packagePath,
      JSON.stringify(packageJson, null, 2),
      "utf8",
      (err) => {
        if (err) {
          console.error("Error writing package.json:", err);
          return;
        }
      }
    );
  } catch (err) {
    console.error("Error parsing package.json:", err);
  }
});
