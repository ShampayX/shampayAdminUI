import { Button, IconButton, MenuItem, Stack } from "@mui/material";
import React from "react";
import { useFieldArray } from "react-hook-form";
import { RHFSelect, RHFSwitch, RHFTextField } from "src/components/hook-form";
import Iconify from "src/components/iconify/Iconify";

function Partner({ nestIndex, control, currentTab, methods, changeTab }: any) {
  const {
    formState: { errors },
    resetField,
    watch,
    setValue,
  } = methods;
  const { fields, remove, append } = useFieldArray({
    control,
    name: `services.${nestIndex}.schemeConfigs.${currentTab}`,
  });

  return (
    <>
      <Stack
        mt={1}
        flexDirection={"row"}
        justifyContent={"space-between"}
        alignItems={"start"}
      >
        <Stack>
          {fields.map((item, index) => {
            return (
              <Stack
                key={item.id}
                flexDirection={"row"}
                gap={1}
                my={1}
                alignItems={"start"}
              >
                <RHFTextField
                  name={`services.${nestIndex}.schemeConfigs.${currentTab}.${index}.minSlab`}
                  label="minSlab"
                  type="number"
                  disabled={index > 0 || !(fields.length - 1 == index)}
                  sx={{ width: 170 }}
                />
                <RHFTextField
                  name={`services.${nestIndex}.schemeConfigs.${currentTab}.${index}.maxSlab`}
                  label="maxSlab"
                  type="number"
                  disabled={!(fields.length - 1 == index)}
                  sx={{ width: 170 }}
                />
                <RHFSelect
                  name={`services.${nestIndex}.schemeConfigs.${currentTab}.${index}.applicableMode`}
                  label="applicableMode"
                  sx={{ width: 170 }}
                  disabled={!(fields.length - 1 == index)}
                  SelectProps={{
                    native: false,
                    sx: { textTransform: "capitalize" },
                  }}
                >
                  <MenuItem value="charge">Charge</MenuItem>
                  <MenuItem value="commission">Commission</MenuItem>
                </RHFSelect>
                <RHFSelect
                  name={`services.${nestIndex}.schemeConfigs.${currentTab}.${index}.applicableModeType`}
                  label="applicableModeType"
                  sx={{ width: 170 }}
                  disabled={!(fields.length - 1 == index)}
                  SelectProps={{
                    native: false,
                    sx: { textTransform: "capitalize" },
                  }}
                >
                  <MenuItem
                    value="percentage"
                    onClick={() => {
                      setValue(
                        `services.${nestIndex}.schemeConfigs.${currentTab}.${index}.applicableModeValue`,
                        ""
                      );
                    }}
                  >
                    %
                  </MenuItem>
                  <MenuItem
                    value="flat"
                    onClick={() => {
                      setValue(
                        `services.${nestIndex}.schemeConfigs.${currentTab}.${index}.applicableModeValue`,
                        ""
                      );
                    }}
                  >
                    Rs
                  </MenuItem>
                </RHFSelect>
                <RHFTextField
                  name={`services.${nestIndex}.schemeConfigs.${currentTab}.${index}.applicableModeValue`}
                  label="applicableModeValue"
                  disabled={!(fields.length - 1 == index)}
                  sx={{ width: 170 }}
                />
                {fields.length - 1 === index && (
                  <Stack flexDirection={"row"}>
                    <IconButton
                      disabled={
                        !watch(
                          `services.${nestIndex}.schemeConfigs.${currentTab}.${index}.minSlab`
                        ) ||
                        !watch(
                          `services.${nestIndex}.schemeConfigs.${currentTab}.${index}.maxSlab`
                        ) ||
                        !watch(
                          `services.${nestIndex}.schemeConfigs.${currentTab}.${index}.applicableMode`
                        ) ||
                        !watch(
                          `services.${nestIndex}.schemeConfigs.${currentTab}.${index}.applicableModeType`
                        ) ||
                        !watch(
                          `services.${nestIndex}.schemeConfigs.${currentTab}.${index}.applicableModeValue`
                        ) ||
                        !!errors?.services?.[nestIndex]?.schemeConfigs?.[
                          currentTab
                        ]
                      }
                      onClick={() =>
                        append({
                          minSlab:
                            +watch(
                              `services.${nestIndex}.schemeConfigs.${currentTab}.${index}.maxSlab`
                            ) + 1,
                          maxSlab: 0,
                          applicableMode: "",
                          applicableModeType: "",
                          applicableModeValue: 0,
                        })
                      }
                    >
                      <Iconify icon="ph:plus-bold" />
                    </IconButton>
                    {index >= 1 && (
                      <IconButton onClick={() => remove(index)}>
                        <Iconify icon="ph:minus-bold" />
                      </IconButton>
                    )}
                  </Stack>
                )}
              </Stack>
            );
          })}
        </Stack>
        <RHFSwitch
          name={`services.${nestIndex}.isEnabledForPartner`}
          label=""
        />
      </Stack>
      <Stack mt={2} flexDirection={"row"} justifyContent={"start"}>
        <Button
          variant="contained"
          onClick={() => changeTab("masterDistributor")}
        >
          Previous
        </Button>
      </Stack>
    </>
  );
}

export default Partner;
