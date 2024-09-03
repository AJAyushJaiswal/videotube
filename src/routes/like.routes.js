import {Router} from 'express';
import {verifyJWT} from '../middlewares/auth.middleware.js';
import {toggleVideoLike, toggleCommentLike, togglePostLike, getLikedVideos} from '../controllers/like.controller.js';


const router = Router();

router.use(verifyJWT);

router.route('/toggle/v/:videoId').patch(toggleVideoLike);
router.route('/toggle/c/:commentId').patch(toggleCommentLike);
router.route('/toggle/p/:videoId').patch(togglePostLike);

router.route('/videos').get(getLikedVideos);


export default router;