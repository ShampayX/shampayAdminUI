// @mui
import { Box, Link, Stack, Typography } from "@mui/material";
//
import AuthLoginForm from "./AuthLoginForm";
import FintechSlider from "./FintechSlider";

// ----------------------------------------------------------------------

const COMPANY_NAME = process.env.REACT_APP_COMPANY_NAME || "Admin";

const FOOTER_LINKS = ["Terms & Conditions", "Privacy Policy", "FAQ"];

export default function Login() {
  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        p: { xs: 2, md: 4 },
        background:
          "radial-gradient(1000px 600px at 15% 10%, #5B21B6 0%, transparent 60%), radial-gradient(900px 600px at 85% 90%, #4C1D95 0%, transparent 55%), #3B0F72",
      }}
    >
      <Box
        sx={{
          width: "100%",
          maxWidth: 1060,
          borderRadius: 4,
          overflow: "hidden",
          backgroundColor: "#2A0E5A",
          boxShadow: "0 30px 80px rgba(15, 5, 40, 0.55)",
        }}
      >
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", md: "1.05fr 0.95fr" },
          }}
        >
          {/* ---------------- LEFT: brand + slider ---------------- */}
          <Stack
            sx={{
              p: { xs: 3, md: 4.5 },
              background:
                "linear-gradient(160deg, #3B1178 0%, #2E0B5E 55%, #250A4E 100%)",
            }}
          >
            <Stack direction="row" alignItems="center" spacing={1.5}>
              <Box
                sx={{
                  width: 34,
                  height: 34,
                  borderRadius: 1.5,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  backgroundColor: "rgba(255,255,255,0.12)",
                }}
              >
                <Box
                  component="img"
                  src="/logo/shampay-mark.svg"
                  alt={COMPANY_NAME}
                  sx={{ width: 20, height: 20 }}
                />
              </Box>
              <Typography
                sx={{ fontSize: 19, fontWeight: 700, color: "#fff", letterSpacing: "-0.3px" }}
              >
                {COMPANY_NAME}
              </Typography>
            </Stack>

            <Typography
              sx={{
                mt: { xs: 3, md: 4 },
                fontSize: { xs: 28, md: 34 },
                fontWeight: 700,
                lineHeight: 1.2,
                color: "#fff",
              }}
            >
              Your wealth,
              <br />
              Your Identity.
            </Typography>

            <Box sx={{ mt: { xs: 3, md: 4 }, flexGrow: 1, display: "flex", alignItems: "center" }}>
              <FintechSlider />
            </Box>
          </Stack>

          {/* ---------------- RIGHT: login form ---------------- */}
          <Stack
            justifyContent="center"
            sx={{
              p: { xs: 3, md: 5 },
              backgroundColor: "#FBF6E9",
              /* the shared form keeps its logic - only its skin changes here */
              "& .MuiOutlinedInput-root": {
                borderRadius: 2,
                backgroundColor: "#fff",
                "& fieldset": { borderColor: "#E7DFC9" },
                "&:hover fieldset": { borderColor: "#CBBF9E" },
                "&.Mui-focused fieldset": { borderColor: "#7C3AED" },
              },
              "& .MuiInputBase-input": { fontSize: 14.5 },
              "& .MuiSelect-select": { borderRadius: 2, backgroundColor: "#fff" },
              "& .MuiLoadingButton-root": {
                height: 48,
                borderRadius: 2,
                fontSize: 15,
                fontWeight: 700,
                textTransform: "none",
                backgroundColor: "#6D28D9",
                backgroundImage: "linear-gradient(135deg, #7C3AED, #6D28D9)",
                color: "#fff !important",
                boxShadow: "0 10px 24px rgba(109, 40, 217, 0.35)",
                "&:hover": {
                  backgroundImage: "linear-gradient(135deg, #6D28D9, #5B21B6)",
                },
              },
            }}
          >
            <Typography sx={{ fontSize: 24, fontWeight: 700, color: "#241C3B" }}>
              Login
            </Typography>
            <Typography sx={{ mt: 0.5, mb: 3, fontSize: 14, color: "#6B6480" }}>
              Enter your credentials to reach the console.
            </Typography>

            <AuthLoginForm />
          </Stack>
        </Box>

        {/* ---------------- FOOTER ---------------- */}
        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={1.5}
          alignItems="center"
          justifyContent="space-between"
          sx={{
            px: { xs: 3, md: 4.5 },
            py: 2,
            backgroundColor: "#250A4E",
            borderTop: "1px solid rgba(255,255,255,0.08)",
          }}
        >
          <Typography sx={{ fontSize: 12.5, color: "rgba(255,255,255,0.55)" }}>
            © {new Date().getFullYear()} {COMPANY_NAME}. All rights reserved.
          </Typography>

          <Stack direction="row" spacing={2.5}>
            {FOOTER_LINKS.map((label) => (
              <Link
                key={label}
                underline="hover"
                sx={{
                  fontSize: 12.5,
                  cursor: "pointer",
                  color: "rgba(255,255,255,0.55)",
                  "&:hover": { color: "#fff" },
                }}
              >
                {label}
              </Link>
            ))}
          </Stack>
        </Stack>
      </Box>
    </Box>
  );
}
