import { useEffect, useState, useCallback } from "react";
// @mui
import {
  Stack,
  Grid,
  Tabs,
  Button,
  Tab,
  Accordion,
  AccordionDetails,
  TextField,
  MenuItem,
  Modal,
  AccordionSummary,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { Helmet } from "react-helmet-async";
import { useSnackbar } from "src/components/snackbar";
import * as Yup from "yup";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";

import { Box, Typography } from "@mui/material";
import FormProvider, {
  RHFTextField,
  RHFSelect,
} from "src/components/hook-form";
import React from "react";
import { useAuthContext } from "src/auth/useAuthContext";
import { isOk, notifyFailure } from "src/utils/apiResult";

// import { Label } from '@mui/icons-material';

// ----------------------------------------------------------------------
type FormValuesProps = {
  category: string;
  question: string;
  answer: string;
};
export default function Faqmanagement() {
  const { Api } = useAuthContext();
  const { enqueueSnackbar } = useSnackbar();
  const [currentTab, setCurrentTab] = useState("active");
  const [faqCategory, setFaqCategory] = useState("");
  const [cateId, setCateId] = useState("");
  const [question, setQuestion] = useState([]);

  const [open, setOpen] = React.useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const [open1, setOpen1] = React.useState(false);
  const handleOpen1 = (val: any) => {
    setCateId(val);
    setOpen1(true);
  };
  const handleClose1 = () => setOpen1(false);

  const [open2, setOpen2] = React.useState(false);
  const handleOpen2 = () => setOpen2(true);
  const handleClose2 = () => setOpen2(false);

  const [open3, setOpen3] = React.useState(false);
  const handleOpen3 = () => setOpen3(true);
  const handleClose3 = () => setOpen3(false);

  const [open4, setOpen4] = React.useState(false);
  const handleOpen4 = () => setOpen4(true);
  const handleClose4 = () => setOpen4(false);

  const [questionDetail, setquestionDetail] = useState({
    _id: "",
    question: "",
    answer: "",
  });
  const [category, setCategory] = useState([]);
  const [selectCategory, setSelectCategory] = useState("");
  const [que, updateQue] = useState("");
  const [ans, updateAns] = useState("");

  const FilterSchema = Yup.object().shape({
    category: Yup.string().required(),
    question: Yup.string().required(),
    answer: Yup.string().required(),
  });

  const defaultValues = {
    category: "",
    question: "",
    answer: "",
  };
  const methods = useForm<FormValuesProps>({
    resolver: yupResolver(FilterSchema),
    defaultValues,
  });
  const {
    reset,
    setError,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = methods;

  const Heads = [
    { _id: 1, status: "active", name: "FAQ Categories" },
    { _id: 2, status: "disable", name: "Add/Update FAQs" },
  ];

  useEffect(() => {
    getFaqCategory();
  }, []);

  const changeQuestions = (val: any) => {
    setSelectCategory(val._id);
    let arr: any = [];
    category.map((item: any) => {
      if (val.faqcategory_name == item.faqcategory_name) {
        arr.push(item);
      }
    });
    arr.map((row: any) => {
      setQuestion(row.qna);
    });
  };

  function updatequestion(val: any) {
    handleOpen3();
    setquestionDetail(val);
    updateQue(val.question);
    updateAns(val.answer);
  }

  function deletequestion(val: any) {
    handleOpen4();
    setquestionDetail(val);
  }

  const deleteQuestion = () => {
    let body = {
      faqcategoryId: selectCategory,
      questionId: questionDetail._id,
    };
    Api(`category/delete_Questions`, "POST", body, "").then((Response: any) => {
      if (isOk(Response)) {
        handleClose4();
      } else {
        notifyFailure(enqueueSnackbar, Response);
      }
    });
  };

  const editQuestion = () => {
    let body = {
      faqcategoryId: selectCategory,
      qna: [
        {
          question: que,
          answer: ans,
          questionId: questionDetail._id,
        },
      ],
    };
    Api(`category/edit_Questions`, "POST", body, "").then((Response: any) => {
      if (isOk(Response)) {
        handleClose3();
      } else {
        notifyFailure(enqueueSnackbar, Response);
      }
    });
  };

  const getFaqCategory = () => {
    Api(`category/get_FaqCategoryList`, "GET", "", "").then((Response: any) => {
      if (isOk(Response)) {
        setCategory(Response.data.data);
        setSelectCategory(Response.data.data[0]?._id);
        setQuestion(Response.data.data[0]?.qna);
      } else {
        notifyFailure(enqueueSnackbar, Response);
      }
    });
  };

  const addFaqCategory = () => {
    let body = {
      faqcategory_name: faqCategory,
    };
    Api(`category/add_FaqCategory`, "POST", body, "").then((Response: any) => {
      if (isOk(Response)) {
        handleClose();
        setFaqCategory("");
      } else {
        notifyFailure(enqueueSnackbar, Response);
      }
    });
  };

  const editFaqCategory = () => {
    let body = {
      faqcategoryId: cateId,
      faqcategory_name: faqCategory,
    };
    Api(`category/edit_FaqCategory`, "POST", body, "").then((Response: any) => {
      if (isOk(Response)) {
        handleClose();
        setFaqCategory("");
      } else {
        notifyFailure(enqueueSnackbar, Response);
      }
    });
  };

  const addfaq = (data: FormValuesProps) => {
    let body = {
      faqcategoryId: data.category,
      qna: [
        {
          question: data.question,
          answer: data.answer,
        },
      ],
    };
    Api(`category/add_Questions`, "POST", body, "").then((Response: any) => {
      if (isOk(Response)) {
        handleClose2();
        enqueueSnackbar(Response.data.message);
      } else {
        notifyFailure(enqueueSnackbar, Response);
      }
    });
  };

  return (
    <>
      <Helmet>
        <title>View Update Bank Detail | Shampay Admin</title>
      </Helmet>
      <Box style={{ padding: "0" }}>
        <Stack justifyContent={"right"} flexDirection={"row"}>
          {currentTab == "active" ? (
            <Button variant="contained" sx={{ m: 1 }} onClick={handleOpen}>
              Add New Category
            </Button>
          ) : (
            <Button variant="contained" sx={{ m: 1 }} onClick={handleOpen2}>
              New FAQ
            </Button>
          )}
        </Stack>
        <Tabs
          value={currentTab}
          aria-label="basic tabs example"
          sx={{ background: "#F4F6F8" }}
          onChange={(event, newValue) => setCurrentTab(newValue)}
        >
          {Heads.map((tab: any) => (
            <Tab
              key={tab._id}
              sx={{ mx: 3 }}
              label={tab.name}
              value={tab.status}
            />
          ))}
        </Tabs>
      </Box>
      {currentTab == "active" ? (
        <Box
          rowGap={3}
          columnGap={10}
          display="grid"
          m={3}
          gridTemplateColumns={{
            xs: "repeat(1, 1fr)",
            sm: "repeat(2, 0.5fr)",
          }}
        >
          <Grid
            rowGap={3}
            columnGap={2}
            display="grid"
            height={"fit-content"}
            gridTemplateColumns={{
              xs: "repeat(1, 1fr)",
              // sm: 'repeat(2, 1fr)'
            }}
          >
            {category.map((item: any) => {
              return (
                <Stack
                  key={item._id}
                  flexDirection={"row"}
                  justifyContent={"space-between"}
                >
                  <Typography variant="subtitle1">
                    {item.faqcategory_name}
                  </Typography>
                  <Button
                    variant="outlined"
                    onClick={() => handleOpen1(item._id)}
                  >
                    Edit
                  </Button>
                </Stack>
              );
            })}
          </Grid>
        </Box>
      ) : (
        <Grid m={2}>
          {category.map((item: any) => {
            return (
              <Button
                variant={selectCategory == item._id ? "contained" : "outlined"}
                sx={{ m: 1 }}
                key={item._id}
                onClick={() => changeQuestions(item)}
              >
                {item.faqcategory_name}
              </Button>
            );
          })}

          <Box
            rowGap={3}
            columnGap={10}
            display="grid"
            m={2}
            gridTemplateColumns={{
              xs: "repeat(1, 1fr)",
              // sm: 'repeat(2, 0.5fr)'
            }}
          >
            <Stack>
              {question?.length &&
                question.map((item: any, index: any) => {
                  return (
                    <Accordion key={item._id}>
                      <AccordionSummary
                        expandIcon={<ExpandMoreIcon />}
                        aria-controls="panel1a-content"
                        id="panel1a-header"
                        sx={{ p: 1, background: "" }}
                      >
                        <Typography variant="subtitle1">
                          Que.{index + 1} - {item.question}
                        </Typography>
                      </AccordionSummary>
                      <AccordionDetails>
                        <Typography variant="body1">
                          Ans.{index + 1} - {item.answer}
                        </Typography>
                        <Stack
                          flexDirection={"row"}
                          sx={{ justifyContent: "flex-end", gap: "10px" }}
                        >
                          <Button
                            variant="contained"
                            onClick={() => updatequestion(item)}
                          >
                            edit
                          </Button>
                          <Button
                            variant="contained"
                            onClick={() => deletequestion(item)}
                          >
                            Delete
                          </Button>
                        </Stack>
                      </AccordionDetails>
                    </Accordion>
                  );
                })}
            </Stack>
          </Box>
        </Grid>
      )}
      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box
          sx={{
            position: "absolute" as "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            bgcolor: "#ffffff",
            boxShadow: 24,
            borderRadius: "20px",
            p: 4,
            width: {
              xs: "100%",
              sm: "50%",
            },
          }}
        >
          <Grid
            rowGap={3}
            columnGap={2}
            display="grid"
            gridTemplateColumns={{
              xs: "repeat(1, 1fr)",
              // sm: 'repeat(2, 1fr)'
            }}
          >
            <TextField
              name="categoryname"
              label="Category Name"
              placeholder="Category Name"
              value={faqCategory}
              onChange={(e) => setFaqCategory(e.target.value)}
            />
            <Button
              sx={{ margin: "auto" }}
              size="large"
              type="submit"
              variant="contained"
              onClick={addFaqCategory}
            >
              Add Category
            </Button>
          </Grid>
        </Box>
      </Modal>
      <Modal
        open={open1}
        onClose={handleClose1}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box
          sx={{
            position: "absolute" as "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            bgcolor: "#ffffff",
            boxShadow: 24,
            borderRadius: "20px",
            p: 4,
            width: {
              xs: "100%",
              sm: "50%",
            },
          }}
        >
          <Grid
            rowGap={3}
            columnGap={2}
            display="grid"
            gridTemplateColumns={{
              xs: "repeat(1, 1fr)",
              // sm: 'repeat(2, 1fr)'
            }}
          >
            <TextField
              name="categoryname"
              label="Category Name"
              placeholder="Category Name"
              value={faqCategory}
              onChange={(e) => setFaqCategory(e.target.value)}
            />
            <Button
              sx={{ margin: "auto" }}
              size="large"
              type="submit"
              variant="contained"
              onClick={editFaqCategory}
            >
              Save Category
            </Button>
          </Grid>
        </Box>
      </Modal>
      <Modal
        open={open2}
        onClose={handleClose2}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <FormProvider methods={methods} onSubmit={handleSubmit(addfaq)}>
          <Box
            sx={{
              position: "absolute" as "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              bgcolor: "#ffffff",
              boxShadow: 24,
              borderRadius: "20px",
              p: 4,
              width: {
                xs: "100%",
                sm: "50%",
              },
            }}
          >
            <Grid
              rowGap={3}
              columnGap={2}
              display="grid"
              gridTemplateColumns={{
                xs: "repeat(1, 1fr)",
                // sm: 'repeat(2, 1fr)'
              }}
            >
              <RHFSelect
                name="category"
                label="Select Category"
                placeholder="Select Category"
                InputLabelProps={{ shrink: true }}
                SelectProps={{
                  native: false,
                  sx: { textTransform: "capitalize" },
                }}
              >
                {category.map((item: any) => {
                  return (
                    <MenuItem key={item._id} value={item._id}>
                      {item.faqcategory_name}
                    </MenuItem>
                  );
                })}
              </RHFSelect>
              <RHFTextField
                name="question"
                label="Question"
                placeholder="Question"
              />
              <RHFTextField
                name="answer"
                label="Answer"
                placeholder="Answer"
                multiline
                rows={5}
              />
              <Button
                sx={{ margin: "auto" }}
                size="large"
                type="submit"
                variant="contained"
              >
                Add FAQ
              </Button>
            </Grid>
          </Box>
        </FormProvider>
      </Modal>
      <Modal
        open={open3}
        onClose={handleClose3}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box
          sx={{
            position: "absolute" as "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            bgcolor: "#ffffff",
            boxShadow: 24,
            borderRadius: "20px",
            p: 4,
            width: {
              xs: "100%",
              sm: "50%",
            },
          }}
        >
          <FormProvider methods={methods}>
            <Grid
              rowGap={3}
              columnGap={2}
              display="grid"
              gridTemplateColumns={{
                xs: "repeat(1, 1fr)",
                // sm: 'repeat(2, 1fr)'
              }}
            >
              <RHFSelect
                name="category"
                label="Select Category"
                placeholder="Select Category"
                InputLabelProps={{ shrink: true }}
                SelectProps={{
                  native: false,
                  sx: { textTransform: "capitalize" },
                }}
                value={selectCategory}
                disabled
              >
                {category.map((item: any) => {
                  return (
                    <MenuItem key={item._id} value={item._id}>
                      {item.faqcategory_name}
                    </MenuItem>
                  );
                })}
              </RHFSelect>
              <RHFTextField
                name="question"
                label="Question"
                placeholder="Question"
                value={que}
                onChange={(e) => updateQue(e.target.value)}
              />
              <RHFTextField
                name="answer"
                label="Answer"
                placeholder="Answer"
                multiline
                rows={5}
                value={ans}
                onChange={(e) => updateAns(e.target.value)}
              />
              <Button
                sx={{ margin: "auto" }}
                size="large"
                variant="contained"
                onClick={editQuestion}
              >
                Save
              </Button>
            </Grid>
          </FormProvider>
        </Box>
      </Modal>
      <Modal
        open={open4}
        onClose={handleClose4}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box
          sx={{
            position: "absolute" as "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            bgcolor: "#ffffff",
            boxShadow: 24,
            borderRadius: "20px",
            p: 4,
            width: {
              xs: "100%",
              sm: "50%",
            },
          }}
        >
          <Stack>
            <Typography
              variant="h3"
              sx={{ textAlign: "center", marginBottom: "40px" }}
            >
              Are you Sure ?
            </Typography>
          </Stack>
          <Stack justifyContent={"space-around"} flexDirection={"row"} gap={1}>
            <Button
              sx={{ margin: "auto" }}
              size="large"
              type="submit"
              variant="contained"
              onClick={deleteQuestion}
            >
              Confirm
            </Button>
            <Button
              sx={{ margin: "auto" }}
              size="large"
              variant="contained"
              onClick={handleClose4}
            >
              Cancle
            </Button>
          </Stack>
        </Box>
      </Modal>
    </>
  );
}
