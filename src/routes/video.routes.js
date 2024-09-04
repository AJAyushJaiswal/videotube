import {Router} from 'express';
import {verifyJWT} from '../middlewares/auth.middleware.js';
import {getVideoById, publishVideo, updateVideoDetails, updateVideoThumbnail, deleteVideo, togglePublishStatus, getAllVideos} from '../controllers/video.controller.js';
import {upload} from '../middlewares/multer.middleware.js';


const router = Router();

router.use(verifyJWT);

router.route('/')
.get(getAllVideos)
.post(upload.fields([{name: 'video', maxCount: 1}, {name: 'thumbnail', maxCount: 1}]), publishVideo);

router.route('/:videoId')
.get(getVideoById)
.patch(updateVideoDetails)
.patch(upload.single('thumbnail'), updateVideoThumbnail)
.delete(deleteVideo);

router.route('/toggle/publish/:videoId').patch(togglePublishStatus);


export default router;

