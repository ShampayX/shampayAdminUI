import { Helmet } from "react-helmet-async";
// sections
import Login from "../../sections/auth/Login";

// ----------------------------------------------------------------------

export default function LoginPage() {
  return (
    <>
      <Helmet>
        <title> Sign in to Shampay Admin </title>
      </Helmet>

      <Login />
    </>
  );
}
