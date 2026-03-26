import { useContext, useEffect, useMemo, useRef, useState } from "react";
import {
  Avatar,
  Box,
  Button,
  CircularProgress,
  Container,
  InputBase,
  Paper,
  Stack,
  Tab,
  Tabs,
  Typography,
  useMediaQuery,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import HomeOutlinedIcon from "@mui/icons-material/HomeOutlined";
import TravelExploreOutlinedIcon from "@mui/icons-material/TravelExploreOutlined";
import BookmarkBorderOutlinedIcon from "@mui/icons-material/BookmarkBorderOutlined";
import SendOutlinedIcon from "@mui/icons-material/SendOutlined";
import NotificationsNoneOutlinedIcon from "@mui/icons-material/NotificationsNoneOutlined";
import SearchIcon from "@mui/icons-material/Search";
import { Link as RouterLink } from "react-router-dom";
import { AuthContext } from "../context/AuthContext.jsx";
import BottomNav from "../components/BottomNav.jsx";
import CreatePostDialog from "../components/CreatePostDialog.jsx";
import PostCard from "../components/PostCard.jsx";
import { addCommentApi, getFeedApi, getFeedAuthedApi, toggleLikeApi } from "../api/postsApi.js";

const PAGE_SIZE = 10;

export default function SocialPage() {
  const auth = useContext(AuthContext);
  const isDesktop = useMediaQuery("(min-width:1100px)");

  const [tabValue, setTabValue] = useState(0);
  const [createOpen, setCreateOpen] = useState(false);
  const [navValue, setNavValue] = useState(0);

  const [posts, setPosts] = useState([]);
  const [hasMore, setHasMore] = useState(true);
  const [initialLoading, setInitialLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [skip, setSkip] = useState(0);

  const postsRef = useRef(posts);
  useEffect(() => {
    postsRef.current = posts;
  }, [posts]);

  const isAuthed = Boolean(auth?.token);

  const apiMode = useMemo(() => {
    if (!auth?.token) return "public";
    return "authed";
  }, [auth?.token]);

  useEffect(() => {
    let cancelled = false;

    async function loadInitial() {
      setInitialLoading(true);
      setHasMore(true);
      setSkip(0);
      try {
        const data =
          apiMode === "authed"
            ? await getFeedAuthedApi({ limit: PAGE_SIZE, skip: 0, token: auth.token })
            : await getFeedApi({ limit: PAGE_SIZE, skip: 0 });

        if (!cancelled) {
          setPosts(data || []);
          setSkip((data || []).length);
          setHasMore((data || []).length === PAGE_SIZE);
        }
      } finally {
        if (!cancelled) setInitialLoading(false);
      }
    }

    loadInitial();
    return () => {
      cancelled = true;
    };
  }, [apiMode]);

  const sentinelRef = useRef(null);
  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    if (!hasMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const first = entries[0];
        if (!first?.isIntersecting) return;
        if (loadingMore) return;
        if (!hasMore) return;

        void loadMore();
      },
      { root: null, threshold: 0.1 }
    );

    observer.observe(el);
    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasMore, loadingMore, sentinelRef.current, posts.length, apiMode]);

  async function loadMore() {
    if (!hasMore || loadingMore) return;
    setLoadingMore(true);
    try {
      const currentSkip = skip;
      const data =
        apiMode === "authed"
          ? await getFeedAuthedApi({
              limit: PAGE_SIZE,
              skip: currentSkip,
              token: auth.token,
            })
          : await getFeedApi({ limit: PAGE_SIZE, skip: currentSkip });

      setPosts((prev) => [...prev, ...(data || [])]);
      setSkip(currentSkip + (data || []).length);
      setHasMore((data || []).length === PAGE_SIZE);
    } finally {
      setLoadingMore(false);
    }
  }

  function addTopPost(created) {
    const mapped = {
      id: created.id,
      authorUsername: created.authorUsername,
      text: created.text || "",
      imageUrl: created.imageUrl || "",
      likeCount: 0,
      commentCount: 0,
      likedByMe: false,
    };
    setPosts((prev) => [mapped, ...prev]);
  }

  async function toggleLikeOptimistic(postId) {
    if (!auth?.token) return;
    const previous = postsRef.current.find((p) => p.id === postId);
    if (!previous) return;

    const nextLiked = !previous.likedByMe;
    const delta = nextLiked ? 1 : -1;

    setPosts((prev) =>
      prev.map((p) =>
        p.id === postId
          ? { ...p, likedByMe: nextLiked, likeCount: Math.max(0, p.likeCount + delta) }
          : p
      )
    );

    try {
      const data = await toggleLikeApi({ postId, token: auth.token });
      setPosts((prev) =>
        prev.map((p) =>
          p.id === postId
            ? { ...p, likeCount: data.likeCount, likedByMe: data.likedByMe }
            : p
        )
      );
    } catch (err) {
      setPosts((prev) => prev.map((p) => (p.id === postId ? previous : p)));
      throw err;
    }
  }

  async function addCommentOptimistic(postId, text) {
    if (!auth?.token) throw new Error("Not authenticated");
    const previous = postsRef.current.find((p) => p.id === postId);
    if (!previous) throw new Error("Post not found");

    setPosts((prev) =>
      prev.map((p) => (p.id === postId ? { ...p, commentCount: p.commentCount + 1 } : p))
    );

    try {
      const data = await addCommentApi({ postId, token: auth.token, text });
      setPosts((prev) =>
        prev.map((p) =>
          p.id === postId ? { ...p, commentCount: data.commentCount } : p
        )
      );
      return data.comment;
    } catch (err) {
      setPosts((prev) => prev.map((p) => (p.id === postId ? previous : p)));
      throw err;
    }
  }

  return (
    <Box
      id="social"
      sx={{
        minHeight: "100svh",
        pb: { xs: 8, md: 3 },
        background:
          "radial-gradient(circle at top right, rgba(21,101,192,0.08), transparent 40%), #f4f7fc",
      }}
    >
      <Container maxWidth={false} sx={{ py: 3 }}>
        <Box
          sx={{
            maxWidth: 1320,
            mx: "auto",
            display: "grid",
            gridTemplateColumns: { xs: "1fr", lg: "260px minmax(620px, 1fr) 300px" },
            gap: 2.5,
          }}
        >
          {isDesktop ? (
            <Paper sx={{ p: 2.5, borderRadius: 4, height: "fit-content", position: "sticky", top: 16 }}>
              <Typography sx={{ fontWeight: 900, mb: 2, fontSize: 22 }}>Social</Typography>
              <Stack spacing={1}>
                <Button startIcon={<HomeOutlinedIcon />} variant="contained" sx={{ justifyContent: "flex-start" }}>
                  Feed
                </Button>
                <Button startIcon={<TravelExploreOutlinedIcon />} sx={{ justifyContent: "flex-start" }}>
                  Explore
                </Button>
                <Button startIcon={<BookmarkBorderOutlinedIcon />} sx={{ justifyContent: "flex-start" }}>
                  Saved
                </Button>
                <Button startIcon={<SendOutlinedIcon />} sx={{ justifyContent: "flex-start" }}>
                  Direct
                </Button>
              </Stack>
            </Paper>
          ) : null}

          <Box>
            <Paper
              sx={{
                p: 2,
                borderRadius: 4,
                mb: 2,
                display: "flex",
                alignItems: "center",
                gap: 1.5,
              }}
            >
              <SearchIcon color="action" />
              <InputBase placeholder="Search users, posts..." sx={{ flex: 1 }} />
              <NotificationsNoneOutlinedIcon color="action" />
              {isAuthed ? (
                <>
                  <Button size="small" variant="outlined" sx={{ borderRadius: 2 }}>
                    {auth?.user?.username || "Profile"}
                  </Button>
                  <Button
                    size="small"
                    color="inherit"
                    onClick={() => auth.logout()}
                    sx={{ borderRadius: 2 }}
                  >
                    Logout
                  </Button>
                </>
              ) : (
                <Button
                  size="small"
                  variant="contained"
                  component={RouterLink}
                  to="/login"
                  sx={{ borderRadius: 2 }}
                >
                  Login
                </Button>
              )}
            </Paper>

            <Paper
              elevation={2}
              sx={{ p: 2.5, borderRadius: 4, cursor: "pointer", mb: 2 }}
              onClick={() => setCreateOpen(true)}
            >
              <Stack direction="row" alignItems="center" spacing={1.5}>
                <Avatar sx={{ bgcolor: "primary.main" }}>
                  {(auth?.user?.username?.[0] || "U").toUpperCase()}
                </Avatar>
                <Box sx={{ flex: 1 }}>
                  <Typography sx={{ fontWeight: 900, mb: 0.5 }}>Create Post</Typography>
                  <Typography color="text.secondary">What&apos;s on your mind?</Typography>
                </Box>
                <Button startIcon={<AddIcon />} variant="contained" sx={{ borderRadius: 3 }}>
                  New
                </Button>
              </Stack>
            </Paper>

            <Tabs
              value={tabValue}
              onChange={(e, v) => setTabValue(v)}
              variant="scrollable"
              allowScrollButtonsMobile
              sx={{ mb: 2 }}
            >
              <Tab label="All Posts" />
              <Tab label="For You" />
              <Tab label="Most Liked" />
              <Tab label="Most Commented" />
            </Tabs>

            {initialLoading ? (
              <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
                <CircularProgress />
              </Box>
            ) : null}

            <Box sx={{ display: "grid", gap: 2 }}>
              {posts.map((post) => (
                <PostCard
                  key={post.id}
                  post={post}
                  token={auth?.token}
                  isAuthed={isAuthed}
                  onToggleLikeOptimistic={toggleLikeOptimistic}
                  onAddCommentOptimistic={addCommentOptimistic}
                />
              ))}
            </Box>

            {loadingMore ? (
              <Box sx={{ display: "flex", justifyContent: "center", py: 3 }}>
                <CircularProgress size={24} />
              </Box>
            ) : null}

            <Box ref={sentinelRef} sx={{ height: 1 }} />
          </Box>

          {isDesktop ? (
            <Paper sx={{ p: 2.5, borderRadius: 4, height: "fit-content", position: "sticky", top: 16 }}>
              <Typography sx={{ fontWeight: 900, mb: 2 }}>Quick Stats</Typography>
              <Stack spacing={1.2} sx={{ mb: 2 }}>
                <Typography sx={{ color: "text.secondary" }}>
                  {isAuthed ? `Logged in as ${auth?.user?.username}` : "Guest mode"}
                </Typography>
                <Typography sx={{ color: "text.secondary" }}>
                  Infinite scroll: 10 posts per load
                </Typography>
                <Typography sx={{ color: "text.secondary" }}>
                  Likes/comments update optimistically
                </Typography>
              </Stack>
              <Stack spacing={1}>
                <Button variant="outlined" fullWidth onClick={() => setCreateOpen(true)}>
                  Create a Post
                </Button>
                {!isAuthed ? (
                  <Button variant="contained" fullWidth component={RouterLink} to="/login">
                    Login
                  </Button>
                ) : (
                  <Button variant="text" fullWidth onClick={() => auth.logout()}>
                    Logout
                  </Button>
                )}
              </Stack>
            </Paper>
          ) : null}
        </Box>
      </Container>

      {!isDesktop ? (
        <BottomNav
          value={navValue}
          onChange={(v) => setNavValue(v)}
          onCreate={() => setCreateOpen(true)}
        />
      ) : null}

      <CreatePostDialog
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onCreated={(created) => addTopPost(created)}
      />
    </Box>
  );
}

