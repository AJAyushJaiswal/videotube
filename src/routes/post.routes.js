import {Router} from 'express';
import {verifyJWT} from '../middlewares/auth.middleware.js';
import {createPost, updatePost, deletePost, getUserPosts} from '../controllers/post.controller.js';


const router = Router();

router.use(verifyJWT);

router.route('/')
.get(getUserPosts)
.post(createPost);

router.route('/:postId')
.patch(updatePost)
.delete(deletePost);


export default router;