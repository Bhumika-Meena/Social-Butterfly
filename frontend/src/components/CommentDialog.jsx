import { useEffect, useMemo, useState } from "react";
import {
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  List,
  ListItem,
  ListItemText,
  TextField,
  Typography,
} from "@mui/material";
import { getCommentsApi } from "../api/postsApi.js";

function decodeJwtUsername(token) {
  try {
    if (!token) return null;
    const payload = token.split(".")[1];
    const base64 = payload.replace(/-/g, "+").replace(/_/g, "/");
    // JWT uses base64url without padding; atob expects proper padding.
    const padded =
      base64 + "===".slice((base64.length + 3) % 4);
    const decoded = atob(padded);
    const obj = JSON.parse(decoded);
    return obj?.username || null;
  } catch {
    return null;
  }
}

export default function CommentDialog({
  open,
  onClose,
  postId,
  token,
  onAddCommentOptimistic,
}) {
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [comments, setComments] = useState([]);
  const [text, setText] = useState("");

  const username = useMemo(() => decodeJwtUsername(token), [token]);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      if (!open || !postId) return;
      setLoading(true);
      setError("");
      try {
        const data = await getCommentsApi({ postId, limit: 20 });
        if (!cancelled) {
          setComments(data.comments || []);
        }
      } catch (err) {
        if (!cancelled) setError(err?.response?.data?.error || err.message || "Failed");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [open, postId]);

  async function onSubmit() {
    setError("");
    const trimmed = text.trim();
    if (!trimmed) return;
    if (!username) {
      setError("Login required.");
      return;
    }
    if (!onAddCommentOptimistic) return;

    const optimisticComment = {
      username,
      text: trimmed,
      createdAt: new Date().toISOString(),
      _optimistic: true,
    };

    const previous = comments;
    setComments((prev) => [optimisticComment, ...prev]);
    setText("");
    setSubmitting(true);

    try {
      const serverComment = await onAddCommentOptimistic(postId, trimmed);
      setComments((prev) => {
        const withoutOptimistic = prev.filter((c) => !c._optimistic);
        return [{ ...serverComment, _optimistic: false }, ...withoutOptimistic];
      });
    } catch (err) {
      setComments(previous);
      setError(err?.response?.data?.error || err.message || "Failed to comment");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle sx={{ fontWeight: 800 }}>Comments</DialogTitle>
      <DialogContent>
        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 3 }}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            {error ? (
              <Typography sx={{ color: "error.main", mb: 2 }}>{error}</Typography>
            ) : null}
            <List sx={{ maxHeight: 320, overflow: "auto" }}>
              {comments.length === 0 ? (
                <Typography sx={{ color: "text.secondary", px: 2, py: 2 }}>
                  No comments yet.
                </Typography>
              ) : (
                comments.map((c, idx) => (
                  <ListItem key={`${c.username}-${idx}`} alignItems="flex-start">
                    <ListItemText
                      primary={
                        <Typography sx={{ fontWeight: 700 }}>{c.username}</Typography>
                      }
                      secondary={<Typography sx={{ whiteSpace: "pre-wrap" }}>{c.text}</Typography>}
                    />
                  </ListItem>
                ))
              )}
            </List>

            <Box sx={{ mt: 2, display: "grid", gap: 1 }}>
              <TextField
                label="Write a comment"
                multiline
                minRows={2}
                value={text}
                onChange={(e) => setText(e.target.value)}
                disabled={submitting}
              />
            </Box>
          </>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={submitting}>
          Close
        </Button>
        <Button
          variant="contained"
          disabled={submitting || text.trim().length === 0}
          onClick={onSubmit}
        >
          {submitting ? "Sending..." : "Send"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

