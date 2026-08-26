import React, { useState } from "react";
import {
  Box,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Stack,
  styled,
  SwitchProps,
  Switch,
  TextField,
  TableCell,
  RadioGroup,
  FormControlLabel,
  Radio,
  Select,
  MenuItem,
} from "@mui/material";
import { useFieldArray, useForm } from "react-hook-form";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import AddIcon from "@mui/icons-material/Add";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import FormProvider from "src/components/hook-form/FormProvider";
import {
  DataTable,
  KitRow,
  PageActionButton,
  PageGhostButton,
} from "src/components/page-kit";

// ----------------------------------------------------------------------
// Shared body for the four wallet-to-wallet role cards. Agent, Distributor
// and Master Distributor were three identical copies of this markup; they now
// render this component so the chrome stays in one place.
//
// ⚠ These controls are not wired to the API: the toggles hold no state, Save
// has no handler and onSubmit is empty. Restyled as-is - nothing invented.
// ----------------------------------------------------------------------

export const IOSSwitch = styled((props: SwitchProps) => (
  <Switch focusVisibleClassName=".Mui-focusVisible" disableRipple {...props} />
))(({ theme }) => ({
  width: 42,
  height: 26,
  padding: 0,
  "& .MuiSwitch-switchBase": {
    padding: 0,
    margin: 2,
    transitionDuration: "300ms",
    "&.Mui-checked": {
      transform: "translateX(16px)",
      color: "#fff",
      "& + .MuiSwitch-track": {
        backgroundColor: "#0e9f6e",
        opacity: 1,
        border: 0,
      },
      "&.Mui-disabled + .MuiSwitch-track": {
        opacity: 0.5,
      },
    },
    "&.Mui-focusVisible .MuiSwitch-thumb": {
      color: "#33cf4d",
      border: "6px solid #fff",
    },
    "&.Mui-disabled .MuiSwitch-thumb": {
      color:
        theme.palette.mode === "light"
          ? theme.palette.grey[100]
          : theme.palette.grey[600],
    },
    "&.Mui-disabled + .MuiSwitch-track": {
      opacity: theme.palette.mode === "light" ? 0.7 : 0.3,
    },
  },
  "& .MuiSwitch-thumb": {
    boxSizing: "border-box",
    width: 22,
    height: 22,
    backgroundColor: "#fff",
  },
  "& .MuiSwitch-track": {
    borderRadius: 26 / 2,
    backgroundColor: theme.palette.mode === "light" ? "#CBD5E1" : "#475569",
    opacity: 1,
    transition: theme.transitions.create(["background-color"], {
      duration: 500,
    }),
  },
}));

type FormValuesProps = {
  slabnumber: {
    minSlab: number;
    maxSlab: number;
  }[];
};

/** One "can this role send to X" toggle. */
function ToggleTile({ label }: { label: string }) {
  return (
    <Stack
      direction="row"
      alignItems="center"
      justifyContent="space-between"
      spacing={2}
      sx={{
        px: 2,
        height: 56,
        borderRadius: 1.5,
        border: (t) => `1px solid ${t.palette.divider}`,
      }}
    >
      <Typography sx={{ fontSize: 13.5, fontWeight: 600 }}>{label}</Typography>
      <IOSSwitch />
    </Stack>
  );
}

export default function RoleTransferControl({
  title,
  subtitle,
  mirrorMinAmount,
}: {
  title: string;
  subtitle: string;
  /** Agent card locks Min Slab to the Min Amount above it. */
  mirrorMinAmount?: boolean;
}) {
  const [amount, setAmount] = useState({
    agentmin: "",
    agentmax: "",
  });

  const defaultValues = {
    slabnumber: [{ minSlab: 0, maxSlab: 0 }],
  };

  const methods = useForm<FormValuesProps>({
    defaultValues,
  });

  const {
    control,
    register,
    handleSubmit,
    formState: { errors },
  } = methods;

  const { fields, append, remove } = useFieldArray({
    name: "slabnumber",
    control,
  });

  const [charge, setCharge] = useState("receiver");

  const tableLabels = [
    { id: "action", label: "Action" },
    { id: "min", label: "Min" },
    { id: "max", label: "Max" },
    {
      id: "chargetype",
      label:
        charge === "receiver" ? "Receiver Charge Type" : "Sender Charge Type",
    },
    {
      id: "chargevalue",
      label:
        charge === "sender" ? "Sender Charge Value" : "Receiver Charge Value",
    },
  ];

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setCharge(event.target.value);
  };

  const handleAmount = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setAmount((prevData) => ({ ...prevData, [name]: value }));
  };

  const onSubmit = (data: FormValuesProps) => {};

  return (
    <Accordion
      disableGutters
      sx={{
        borderRadius: 2,
        border: (t) => `1px solid ${t.palette.divider}`,
        boxShadow: (t) =>
          t.palette.mode === "light" ? "0 2px 12px rgba(15,23,42,0.05)" : "none",
        "&:before": { display: "none" },
      }}
    >
      <AccordionSummary
        expandIcon={<ExpandMoreIcon />}
        id="panel1-header"
        sx={{ px: { xs: 2.5, md: 3 }, py: 1 }}
      >
        <Box>
          <Typography sx={{ fontSize: 17, fontWeight: 700 }}>{title}</Typography>
          <Typography sx={{ mt: 0.25, fontSize: 13.5, color: "text.secondary" }}>
            {subtitle}
          </Typography>
        </Box>
      </AccordionSummary>

      <AccordionDetails sx={{ px: { xs: 2.5, md: 3 }, pb: 3, pt: 0 }}>
        <Box
          sx={{
            display: "grid",
            gap: 2,
            gridTemplateColumns: { xs: "1fr", sm: "repeat(3, 1fr)" },
          }}
        >
          <ToggleTile label="Agent" />
          <ToggleTile label="Distributor" />
          <ToggleTile label="Master Distributor" />
        </Box>

        <Stack
          direction={{ xs: "column", md: "row" }}
          gap={2}
          alignItems={{ md: "center" }}
          mt={3}
        >
          <TextField
            id="outlined-basic"
            type="number"
            name="agentmin"
            label="Min. Amount"
            variant="outlined"
            value={amount.agentmin}
            onChange={handleAmount}
            size="small"
          />
          <TextField
            id="outlined-basic"
            label="Max. Amount"
            type="number"
            variant="outlined"
            name="agentmax"
            value={amount.agentmax}
            onChange={handleAmount}
            size="small"
          />
          <PageActionButton>Save</PageActionButton>

          <RadioGroup row value={charge} onChange={handleChange} sx={{ ml: 1 }}>
            <FormControlLabel
              value="receiver"
              control={<Radio />}
              label="Charge on Receiver"
            />
            <FormControlLabel
              value="sender"
              control={<Radio />}
              label="Charge on Sender"
            />
          </RadioGroup>
        </Stack>

        <Box mt={3}>
          <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
            <DataTable columns={tableLabels} minWidth={840} maxHeight={420}>
              {fields.map((field, index) => (
                <KitRow key={field.id}>
                  {/* Action first, matching the kit convention */}
                  <TableCell>
                    <Stack direction="row" gap={1}>
                      <PageGhostButton
                        startIcon={<AddIcon />}
                        onClick={() => append({ minSlab: 0, maxSlab: 0 })}
                      >
                        Add Slab
                      </PageGhostButton>
                      <PageGhostButton
                        startIcon={<DeleteOutlineIcon />}
                        onClick={() => remove(index)}
                      >
                        Delete
                      </PageGhostButton>
                    </Stack>
                  </TableCell>
                  <TableCell>
                    <TextField
                      {...register(`slabnumber.${index}.minSlab` as const)}
                      type="number"
                      variant="outlined"
                      size="small"
                      value={mirrorMinAmount ? amount.agentmin : undefined}
                      disabled={mirrorMinAmount}
                      error={!!errors.slabnumber?.[index]?.minSlab}
                      helperText={
                        errors.slabnumber?.[index]?.minSlab &&
                        "Min Slab is required"
                      }
                    />
                  </TableCell>
                  <TableCell>
                    <TextField
                      {...register(`slabnumber.${index}.maxSlab` as const)}
                      type="number"
                      variant="outlined"
                      size="small"
                      error={!!errors.slabnumber?.[index]?.maxSlab}
                      helperText={
                        errors.slabnumber?.[index]?.maxSlab &&
                        "Max Slab is required"
                      }
                    />
                  </TableCell>
                  <TableCell>
                    <Select
                      fullWidth
                      name="chargeType"
                      label="Charge Type"
                      size="small"
                      placeholder="Charge Type"
                      sx={{ minWidth: 120 }}
                      //   onChange={(mdist) => handleChange(row, mdist, "chargeType")}
                    >
                      <MenuItem value="flat">Rs.</MenuItem>
                      <MenuItem value="percentage">%</MenuItem>
                    </Select>
                  </TableCell>
                  <TableCell>
                    <TextField
                      label="Charge"
                      size="small"
                      defaultValue={0}
                      inputProps={{
                        inputMode: "numeric",
                        pattern: "[0-9]*",
                      }}
                    />
                  </TableCell>
                </KitRow>
              ))}
            </DataTable>
          </FormProvider>
        </Box>
      </AccordionDetails>
    </Accordion>
  );
}
