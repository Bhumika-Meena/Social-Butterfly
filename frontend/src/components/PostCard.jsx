import { useState } from "react";
import {
  Avatar,
  Box,
  Card,
  CardContent,
  CardMedia,
  Divider,
  IconButton,
  Stack,
  Typography,
} from "@mui/material";
import FavoriteIcon from "@mui/icons-material/Favorite";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import ChatBubbleOutlineIcon from "@mui/icons-material/ChatBubbleOutline";
import LockIcon from "@mui/icons-material/Lock";
import CommentDialog from "./CommentDialog.jsx";

function getInitial(name) {
  const n = (name || "").trim();
  if (!n) return "?";
  return n[0].toUpperCase();
}

export default function PostCard({
  post,
  token,
  isAuthed,
  onToggleLikeOptimistic,
  onAddCommentOptimistic,
}) {
  const [commentOpen, setCommentOpen] = useState(false);
  const [likeBusy, setLikeBusy] = useState(false);

  async function onLike() {
    if (!isAuthed) return;
    if (likeBusy) return;
    setLikeBusy(true);
    try {
      await onToggleLikeOptimistic?.(post.id);
    } catch (err) {
      // Optimistic UI already reverts on failure; swallow to avoid unhandled promises.
      // eslint-disable-next-line no-console
      console.error("Toggle like failed:", err);
    } finally {
      setLikeBusy(false);
    }
  }

  return (
    <Card
      sx={{
        borderRadius: 4,
        boxShadow: 2,
      }}
    >
      <CardContent>
        <Stack direction="row" alignItems="center" spacing={2}>
          <Avatar sx={{ bgcolor: "primary.main", width: 44, height: 44 }}>
            {getInitial(post.authorUsername)}
          </Avatar>
          <Box sx={{ flex: 1 }}>
            <Typography sx={{ fontWeight: 800 }}>{post.authorUsername}</Typography>
            <Typography sx={{ color: "text.secondary", fontSize: 12 }}>
              {post.text ? "Posted recently" : "Shared an image"}
            </Typography>
          </Box>
          <Typography sx={{ color: "text.secondary", fontSize: 12 }}>
            {/* UI inspiration only */}
          </Typography>
        </Stack>

        {post.text ? (
          <Typography sx={{ mt: 2, whiteSpace: "pre-wrap", lineHeight: 1.4 }}>
            {post.text}
          </Typography>
        ) : null}

        {post.imageUrl ? (
          <CardMedia
            component="img"
            image={post.imageUrl}
            alt="Post"
            sx={{ mt: post.text ? 2 : 1, borderRadius: 3, maxHeight: 360 }}
          />
        ) : null}

        <Divider sx={{ my: 2 }} />

        <Stack direction="row" spacing={2} alignItems="center">
          <Stack direction="row" alignItems="center" spacing={0.5}>
            <IconButton
              onClick={onLike}
              disabled={!isAuthed || likeBusy}
              aria-label="like"
              sx={{ color: post.likedByMe ? "error.main" : "text.secondary" }}
            >
              {post.likedByMe ? <FavoriteIcon /> : <FavoriteBorderIcon />}
            </IconButton>
            <Typography sx={{ fontWeight: 700, minWidth: 18 }}>
              {post.likeCount}
            </Typography>
          </Stack>

          <Stack direction="row" alignItems="center" spacing={0.5}>
            <IconButton
              onClick={() => {
                if (!isAuthed) return;
                setCommentOpen(true);
              }}
              disabled={!isAuthed}
              aria-label="comment"
              sx={{ color: "text.secondary" }}
            >
              <ChatBubbleOutlineIcon />
            </IconButton>
            <Typography sx={{ fontWeight: 700, minWidth: 18 }}>
              {post.commentCount}
            </Typography>
          </Stack>

          {!isAuthed ? (
            <Stack direction="row" alignItems="center" spacing={0.5} sx={{ ml: "auto" }}>
              <LockIcon fontSize="small" />
              <Typography sx={{ color: "text.secondary", fontSize: 12 }}>
                Login to like/comment
              </Typography>
            </Stack>
          ) : null}
        </Stack>

        <CommentDialog
          open={commentOpen}
          onClose={() => setCommentOpen(false)}
          postId={post.id}
          token={token}
          onAddCommentOptimistic={onAddCommentOptimistic}
        />
      </CardContent>
    </Card>
  );
}

