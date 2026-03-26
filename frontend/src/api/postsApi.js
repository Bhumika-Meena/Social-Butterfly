import apiClient from "./apiClient";

export async function getFeedApi({ limit, skip }) {
  const res = await apiClient.get("/api/posts", {
    params: { limit, skip },
  });
  return res.data.posts;
}

export async function getFeedAuthedApi({ limit, skip, token }) {
  const res = await apiClient.get("/api/posts", {
    params: { limit, skip },
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data.posts;
}

export async function createPostApi({ text, imageFile, token }) {
  const form = new FormData();
  if (typeof text === "string" && text.trim().length > 0) form.append("text", text.trim());
  if (imageFile) form.append("image", imageFile);

  const res = await apiClient.post("/api/posts", form, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "multipart/form-data",
    },
  });
  return res.data;
}

export async function toggleLikeApi({ postId, token }) {
  const res = await apiClient.post(`/api/posts/${postId}/like`, null, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data; // { likeCount, likedByMe }
}

export async function addCommentApi({ postId, token, text }) {
  const res = await apiClient.post(
    `/api/posts/${postId}/comments`,
    { text },
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return res.data; // { commentCount, comment }
}

export async function getCommentsApi({ postId, limit = 20 }) {
  const res = await apiClient.get(`/api/posts/${postId}/comments`, {
    params: { limit },
  });
  return res.data; // { commentCount, comments }
}

