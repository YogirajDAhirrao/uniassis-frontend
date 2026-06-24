import api from './axios';

/** GET /api/posts — returns feed filtered to user's course */
export const getFeed = async () => {
  const { data } = await api.get('/api/posts');
  return data;
};

/** GET /api/posts/:postId — returns post with comments */
export const getPostById = async (postId) => {
  const { data } = await api.get(`/api/posts/${postId}`);
  return data;
};

/** POST /api/posts — admin only */
export const createPost = async ({ title, content, courseId, imageUrl, documentUrl }) => {
  const { data } = await api.post('/api/posts', {
    title,
    content,
    courseId: Number(courseId),
    imageUrl: imageUrl || undefined,
    documentUrl: documentUrl || undefined,
  });
  return data;
};

/** PATCH /api/posts/:postId — admin only */
export const updatePost = async (postId, payload) => {
  const { data } = await api.patch(`/api/posts/${postId}`, payload);
  return data;
};

/** DELETE /api/posts/:postId — admin only */
export const deletePost = async (postId) => {
  const { data } = await api.delete(`/api/posts/${postId}`);
  return data;
};

/** POST /api/posts/:postId/comments */
export const addComment = async (postId, content) => {
  const { data } = await api.post(`/api/posts/${postId}/comments`, { content });
  return data;
};

/** GET /api/posts/:postId/comments */
export const getComments = async (postId) => {
  const { data } = await api.get(`/api/posts/${postId}/comments`);
  return data;
};

/** DELETE /api/posts/comments/:commentId */
export const deleteComment = async (commentId) => {
  const { data } = await api.delete(`/api/posts/comments/${commentId}`);
  return data;
};
