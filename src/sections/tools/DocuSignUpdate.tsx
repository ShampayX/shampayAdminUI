import { ReactNode, useState } from "react";
import { Box, Stack, Typography, Divider } from "@mui/material";
import * as Yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { useForm } from "react-hook-form";
import FormProvider, { RHFTextField } from "src/components/hook-form";

import { useSnackbar } from "notistack";
import ApiDataLoading from "src/components/CustomFunction/ApiDataLoading";
import { useAuthContext } from "src/auth/useAuthContext";
import {
  PageHeader,
  PageActionButton,
  PageGhostButton,
  FormCard,
  CopyText,
} from "src/components/page-kit";
import SearchIcon from "@mui/icons-material/Search";
import DrawIcon from "@mui/icons-material/Draw";

type FormValuesProps = {
  email: any;
};

/** One label/value line inside the user card. */
function DetailRow({ label, children }: { label: string; children: ReactNode }) {
  return (
    <Stack
      direction={{ xs: "column", sm: "row" }}
      spacing={{ xs: 0.5, sm: 2 }}
      justifyContent="space-between"
      alignItems={{ xs: "flex-start", sm: "center" }}
      sx={{ py: 1.25 }}
    >
      <Typography sx={{ fontSize: 12.5, fontWeight: 700, color: "text.secondary" }}>
        {label}
      </Typography>
      <Box sx={{ fontSize: 14, textAlign: { sm: "right" } }}>{children}</Box>
    </Stack>
  );
}

function DocuSignUpdate() {
  const { Api } = useAuthContext();
  const [userData, setUserData] = useState({
    userfName: "",
    userlName: "",
    userEmail: "",
    userMobile: "",
    useID: "",
  });
  const [userrecord, setUserRecord] = useState(false);
  const [verifyLoding, setVerifyLoading] = useState(false);
  const { enqueueSnackbar } = useSnackbar();

  const FilterSchema = Yup.object().shape({});

  const defaultValues = {
    email: "",
  };
  const methods = useForm<FormValuesProps>({
    resolver: yupResolver(FilterSchema),
    defaultValues,
  });
  const { reset, handleSubmit } = methods;

  const searchTxnFilterData = (data: FormValuesProps) => {
    let token = localStorage.getItem("token");
    let body = {
      searchBy: "email",
      searchInput: data.email,
    };
    Api(`admin/search_user`, "POST", body, token).then((Response: any) => {
      if (Response?.status == 200) {
        if (Response.data.code == 200) {
          setUserData({
            userfName: Response?.data?.data[0]?.firstName,
            userlName: Response?.data?.data[0]?.lastName,
            userEmail: Response?.data?.data[0]?.email,
            userMobile: Response?.data?.data[0]?.contact_no,
            useID: Response?.data?.data[0]?._id,
          });
          setUserRecord(true);
          reset(defaultValues);
          enqueueSnackbar("User Detail found successfully", {
            variant: "success",
          });
        } else {
          enqueueSnackbar("No Data Found", { variant: "error" });

          setUserRecord(false);
        }
      } else {
        enqueueSnackbar("No Data Found", { variant: "error" });
        setUserRecord(false);
      }
    });
  };

  const UpdateDocu = () => {
    setVerifyLoading(true);
    let token = localStorage.getItem("token");
    Api(`admin/update_docusign_url/${userData.useID}`, "GET", "", token).then(
      (Response: any) => {
        if (Response?.status == 200) {
          if (Response.data.code == 200) {
            enqueueSnackbar(Response.data.message, { variant: "success" });
            setUserRecord(false);
            setVerifyLoading(false);
          } else {
            enqueueSnackbar(Response.data.message, { variant: "error" });

            setVerifyLoading(false);
          }
        } else {
          enqueueSnackbar("Failed", { variant: "error" });
          setVerifyLoading(false);
        }
      }
    );
  };

  return (
    <>
      <PageHeader
        title="Update DocuSign"
        subtitle="Find a user by email address and re-issue their DocuSign agreement link."
      />

      <Box
        sx={{
          display: "grid",
          gap: 2.5,
          alignItems: "start",
          gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
        }}
      >
        <FormCard
          title="Find user"
          subtitle="Search the registered email address to load the account."
        >
          <FormProvider
            methods={methods}
            onSubmit={handleSubmit(searchTxnFilterData)}
          >
            <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
              <RHFTextField
                name="email"
                label="Email address"
                placeholder="name@example.com"
                size="small"
                sx={{ flexGrow: 1 }}
              />
              <PageActionButton type="submit" startIcon={<SearchIcon />}>
                Search
              </PageActionButton>
            </Stack>
          </FormProvider>
        </FormCard>

        {userrecord && (
          <FormCard
            title="Account found"
            subtitle="Confirm this is the right user before re-issuing the link."
            actions={
              <PageGhostButton onClick={() => setUserRecord(false)}>
                Clear
              </PageGhostButton>
            }
          >
            <DetailRow label="USER NAME">
              {userData.userfName} {userData.userlName}
            </DetailRow>
            <Divider />
            <DetailRow label="EMAIL">
              <CopyText value={userData.userEmail} />
            </DetailRow>
            <Divider />
            <DetailRow label="MOBILE">
              <CopyText value={userData.userMobile} />
            </DetailRow>
            <Divider />
            <DetailRow label="USER ID">
              <CopyText value={userData.useID} />
            </DetailRow>

            <Stack
              direction="row"
              justifyContent="flex-end"
              sx={{
                mt: 3,
                pt: 2.5,
                borderTop: (t) => `1px solid ${t.palette.divider}`,
              }}
            >
              {/* Deliberately still the spinner: this is the submit button's
                  busy state, not a data load, so there is no content shape for
                  a skeleton to stand in for. */}
              {verifyLoding ? (
                <ApiDataLoading />
              ) : (
                <PageActionButton onClick={UpdateDocu} startIcon={<DrawIcon />}>
                  Update DocuSign
                </PageActionButton>
              )}
            </Stack>
          </FormCard>
        )}
      </Box>
    </>
  );
}

export default DocuSignUpdate;
