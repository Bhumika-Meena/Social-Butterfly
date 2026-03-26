import { useContext, useMemo, useState } from "react";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Typography,
} from "@mui/material";
import PhotoCameraIcon from "@mui/icons-material/PhotoCamera";
import { AuthContext } from "../context/AuthContext.jsx";
import { createPostApi } from "../api/postsApi.js";

export default function CreatePostDialog({ open, onClose, onCreated }) {
  const auth = useContext(AuthContext);

  const [text, setText] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const canPost = useMemo(() => {
    const hasText = typeof text === "string" && text.trim().length > 0;
    return hasText || Boolean(imageFile);
  }, [text, imageFile]);

  async function onSubmit() {
    setError("");
    if (!auth?.token) {
      setError("Please login to create a post.");
      return;
    }
    if (!canPost) {
      setError("Provide text or an image.");
      return;
    }

    setSubmitting(true);
    try {
      const created = await createPostApi({
        text,
        imageFile,
        token: auth.token,
      });

      onCreated?.(created);
      setText("");
      setImageFile(null);
      onClose?.();
    } catch (err) {
      setError(err?.response?.data?.error || err.message || "Failed to create post");
    } finally {
      setSubmitting(false);
    }
  }

  function handleClose() {
    if (!submitting) onClose?.();
  }

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
      <DialogTitle sx={{ fontWeight: 800 }}>Create Post</DialogTitle>
      <DialogContent>
        <Box sx={{ display: "grid", gap: 2, mt: 1 }}>
          <TextField
            label="What's on your mind?"
            multiline
            minRows={3}
            value={text}
            onChange={(e) => setText(e.target.value)}
          />

          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <input
              accept="image/*"
              style={{ display: "none" }}
              id="post-image-input"
              type="file"
              onChange={(e) => {
                const file = e.target.files?.[0] || null;
                setImageFile(file);
              }}
            />
            <label htmlFor="post-image-input">
              <Button
                component="span"
                variant="outlined"
                startIcon={<PhotoCameraIcon />}
              >
                Choose Image
              </Button>
            </label>
            <Typography sx={{ color: "text.secondary" }}>
              {imageFile ? imageFile.name : "No image selected"}
            </Typography>
          </Box>

          {error ? (
            <Typography sx={{ color: "error.main" }}>{error}</Typography>
          ) : null}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} disabled={submitting}>
          Cancel
        </Button>
        <Button
          onClick={onSubmit}
          variant="contained"
          disabled={submitting || !canPost}
          sx={{ borderRadius: 2 }}
        >
          {submitting ? "Posting..." : "Post"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

