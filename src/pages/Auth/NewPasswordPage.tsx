import { Helmet } from 'react-helmet-async';
import { Link as RouterLink } from 'react-router-dom';
// @mui
import { Link, Typography } from '@mui/material';
// routes
import { PATH_AUTH } from '../../routes/paths';
// components
import Iconify from '../../components/iconify';
// sections
import NewPasswordForm from '../../sections/auth/NewPasswordForm';
// assets
import { SentIcon } from '../../assets/icons';

// ----------------------------------------------------------------------

export default function NewPasswordPage() {
  return (
    <>
      <Helmet>
        <title> New Password | Shampay Admin</title>
      </Helmet>

      <SentIcon sx={{ mb: 5, height: 96 }} />

      {/* <Typography variant="h3" paragraph>
        Request sent successfully!
      </Typography> */}

      <Typography sx={{ color: 'text.secondary', mb: 5 }}>
        We've sent a 6-digit confirmation email to your email.
        <br />
        Please enter the code in below box to verify your email.
      </Typography>

      <NewPasswordForm />

      {/* <Typography variant="body2" sx={{ my: 3 }}>
        Don’t have a code? &nbsp;
        <Link variant="subtitle2">Resend code</Link>
      </Typography> */}

      <Link
        to={PATH_AUTH.login}
        component={RouterLink}
        color="inherit"
        variant="subtitle2"
        sx={{
          mx: 'auto',
          alignItems: 'center',
          display: 'inline-flex',
        }}
      >
        <Iconify icon="eva:chevron-left-fill" width={16} />
        Return to sign in
      </Link>
    </>
  );
}
