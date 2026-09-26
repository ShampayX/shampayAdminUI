import React, { useEffect, useState } from "react";
import {
  PageHeader,
  PageActionButton,
  PageGhostButton,
  FormCard,
  FormGrid,
  FormActions,
} from "src/components/page-kit";
import CampaignOutlinedIcon from "@mui/icons-material/CampaignOutlined";
import ListAltOutlinedIcon from "@mui/icons-material/ListAltOutlined";
import { Box, TextField, Button, Typography, MenuItem } from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { useSnackbar } from "src/components/snackbar";
import { useAuthContext } from "src/auth/useAuthContext";
import { useNavigate } from "react-router";
import { PATH_DASHBOARD } from "src/routes/paths";
import { useLocation } from "react-router-dom";
import { DateTimePicker } from "@mui/x-date-pickers";
import { isOk, notifyOk, notifyFailure } from "src/utils/apiResult";

type NewsItem = {
  _id: string;
  title: string;
  content: string;
  type: "alert" | "info" | "warning";
  createdBy: string;
  isActive: boolean;
  startTime: string;
  endTime: string;
  createdAt: string;
  updatedAt: string;
};

const NewsFlash = () => {
  // To update data
  const location = useLocation();
  const passedItem = location.state?.item as NewsItem;

  //  main content
  const navigate = useNavigate();
  const { Api } = useAuthContext();
  const { enqueueSnackbar } = useSnackbar();

  const [newsList, setNewsList] = useState<NewsItem[]>([]);
  const [editId, setEditId] = useState<string | null>(null);

  const [formData, setFormData] = useState<{
    title: string;
    content: string;
    type: "alert" | "info" | "warning";
    createdBy: string;
    startTime: Date | null;
    endTime: Date | null;
  }>({
    title: "",
    content: "",
    type: "alert",
    createdBy: "",
    startTime: null,
    endTime: null,
  });

  const handleChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    const { title, content, type, createdBy, startTime, endTime } = formData;

    if (!title || !content || !type || !createdBy || !startTime || !endTime) {
      enqueueSnackbar("All fields are required", { variant: "warning" });
      return;
    }
    const token = localStorage.getItem("token");
    const body = {
      title,
      content,
      type,
      createdBy,
      startTime,
      endTime,
    };

    try {
      const createPost = await Api("admin/createPost", "POST", body, token);

      // Item 1b: this fired the success toast on the transport status alone, so a
      // `{ code: 404 }` body was reported as a successful create. The failure
      // branch also used variant "success", so a failure was indistinguishable
      // from a save even when it was taken.
      if (isOk(createPost)) {
        setFormData({
          title: "",
          content: "",
          type: "alert",
          createdBy: "",
          startTime: null,
          endTime: null,
        });
        notifyOk(
          enqueueSnackbar,
          createPost,
          "News Flash created successfully!"
        );
      } else {
        notifyFailure(enqueueSnackbar, createPost);
      }
    } catch (error) {
      enqueueSnackbar("Something went wrong.", { variant: "error" });
    }
  };

  const handleUpdate = async () => {
    if (!editId) return;

    const { title, content, type, createdBy, startTime, endTime } = formData;

    if (!title || !content || !type || !createdBy || !startTime || !endTime) {
      enqueueSnackbar("All fields are required for update", {
        variant: "warning",
      });
      return;
    }
    const token = localStorage.getItem("token");
    const body = {
      title,
      content,
      type,
      createdBy,
      startTime,
      endTime,
    };

    try {
      const updatePost = await Api(
        `admin/updateNewsFlash/${editId}`,
        "POST",
        body,
        token
      );

      // Item 1b: success was toasted on the transport status alone.
      if (isOk(updatePost)) {
        setFormData({
          title: "",
          content: "",
          type: "alert",
          createdBy: "",
          startTime: null,
          endTime: null,
        });
        setEditId(null);
        notifyOk(
          enqueueSnackbar,
          updatePost,
          "News Flash updated successfully!"
        );
      } else {
        notifyFailure(enqueueSnackbar, updatePost);
      }
    } catch (error) {
      enqueueSnackbar("Something went wrong while updating.", {
        variant: "error",
      });
    }
  };

  useEffect(() => {
    if (passedItem) {
      setFormData({
        title: passedItem.title,
        content: passedItem.content,
        type: passedItem.type,
        createdBy: passedItem.createdBy,
        startTime: new Date(passedItem.startTime),
        endTime: new Date(passedItem.endTime),
      });
      setEditId(passedItem._id);
    }
  }, [passedItem]);

  const handleClick = () => {
    navigate(PATH_DASHBOARD.tools.newssummary);
  };

  const isEditing = Boolean(editId);

  const resetForm = () => {
    setEditId(null);
    setFormData({
      title: "",
      content: "",
      type: "alert",
      createdBy: "",
      startTime: null,
      endTime: null,
    });
  };

  return (
    <>
      <PageHeader
        title="News Flash"
        subtitle="Publish a banner message to every partner dashboard for a set window."
        actions={
          <PageGhostButton
            startIcon={<ListAltOutlinedIcon />}
            onClick={handleClick}
          >
            View News Summary
          </PageGhostButton>
        }
      />

      <FormCard
        title={isEditing ? "Update news flash" : "Create news flash"}
        subtitle="Shown to partners between the start and end time."
        sx={{ maxWidth: 860 }}
      >
        <FormGrid columns={2}>
          <TextField
            fullWidth
            label="Title"
            value={formData.title}
            onChange={(e) => handleChange("title", e.target.value)}
            size="small"
          />

          <TextField
            fullWidth
            select
            label="Type"
            value={formData.type}
            onChange={(e) => handleChange("type", e.target.value)}
            size="small"
          >
            <MenuItem value="alert">Alert</MenuItem>
            <MenuItem value="info">Info</MenuItem>
            <MenuItem value="warning">Warning</MenuItem>
          </TextField>

          <Box sx={{ gridColumn: { sm: "1 / -1" } }}>
            <TextField
              fullWidth
              multiline
              rows={3}
              label="Content"
              value={formData.content}
              onChange={(e) => handleChange("content", e.target.value)}
              size="small"
            />
          </Box>

          <TextField
            fullWidth
            label="Your Name"
            value={formData.createdBy}
            onChange={(e) => handleChange("createdBy", e.target.value)}
            size="small"
          />

          <Box />

          <DateTimePicker
            label="Start Time"
            value={formData.startTime}
            minDate={new Date()}
            onChange={(newValue) => handleChange("startTime", newValue)}
            renderInput={(params) => (
              <TextField {...params} fullWidth size="small" />
            )}
          />

          <DateTimePicker
            label="End Time"
            value={formData.endTime}
            minDate={formData.startTime || new Date()}
            onChange={(newValue) => handleChange("endTime", newValue)}
            renderInput={(params) => (
              <TextField {...params} fullWidth size="small" />
            )}
          />
        </FormGrid>

        <FormActions>
          {isEditing && (
            <PageGhostButton onClick={resetForm}>Cancel edit</PageGhostButton>
          )}
          <PageActionButton
            startIcon={<CampaignOutlinedIcon />}
            onClick={isEditing ? handleUpdate : handleSubmit}
            disabled={!formData.title.trim() || !formData.content.trim()}
          >
            {isEditing ? "Update News Flash" : "Publish"}
          </PageActionButton>
        </FormActions>
      </FormCard>

      {/* ====== News List Display ====== */}
      {/* <Box>
        {newsList.map((item: NewsItem) => (
          <Box
            key={item._id}
            sx={{
              width: 500,
              mx: "auto",
              mt: 3,
              p: 2,
              border: "1px solid ",
              borderRadius: 2,
              backgroundColor: "#f9f9f9",
              position: "relative",
            }}
          >
            <Button
              variant="contained"
              size="small"
              sx={{
                position: "absolute",
                top: 10,
                right: 10,
                backgroundColor: item.isActive ? "#568ce3" : "#ad212d",
                color: "#fff", 
              }}
              onClick={() => toggleStatus(item._id, item.isActive)}
            >
              {item.isActive ? "Active" : "Inactive"}
            </Button>

            <Typography variant="h6" sx={{ textTransform: "capitalize" }}>
              {item.title}
            </Typography>
            <Typography variant="body1" gutterBottom>
              {item.content}
            </Typography>
            <br />
            <Typography variant="body2">
              <strong>Type:</strong> {item.type}
            </Typography>
            <Typography variant="body2">
              <strong>Created By:</strong> {item.createdBy}
            </Typography>
            <Typography variant="body2">
              <strong>Start:</strong>
              {new Date(item.startTime).toLocaleString()}
            </Typography>
            <Typography variant="body2">
              <strong>End:</strong> 
              {new Date(item.endTime).toLocaleString()}
            </Typography>
            <Typography variant="body2">
              <strong>Status:</strong> {item.isActive ? "Active" : "Inactive"}
            </Typography>

            <Button
              sx={{ color: "primary.dark", bgcolor: "primary.lighter", mt: 1 }}
              onClick={() => {
                setEditId(item._id);
                setFormData({
                  title: item.title,
                  content: item.content,
                  type: item.type,
                  createdBy: item.createdBy,
                  startTime: new Date(item.startTime),
                  endTime: new Date(item.endTime),
                });
              }}
            >
              Update
            </Button>
          </Box>
        ))}
      </Box> */}
    </>
  );
};

export default NewsFlash;
