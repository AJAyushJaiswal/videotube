import {Router} from 'express';
import {verifyJWT} from '../middlewares/auth.middleware.js';
import {createComment, updateComment, deleteComment, getVideoComments} from '../controllers/comment.controller';


const router = Router();

router.use(verifyJWT);

router.route('/:videoId')
.get(getVideoComments)
.post(createComment);

router.route('/c/:commentId')
.patch(updateComment)
.delete(deleteComment);


export default router;