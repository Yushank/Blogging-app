import { Hono } from "hono";
import { createPost, deletePost, getPost, getPosts, updatePost } from "../controller/postController";
import { authMiddleware } from "../middleware/user";



export const postRouter = new Hono();

postRouter.get('/all-posts', getPosts);
postRouter.post('/create-post', authMiddleware, createPost);
postRouter.get('/posts/:id', authMiddleware, getPost);
postRouter.put('/posts/:id', authMiddleware, updatePost);
postRouter.delete('/posts/:id', authMiddleware, deletePost);