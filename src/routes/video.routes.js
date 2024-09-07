import {Router} from 'express';
import {verifyJWT} from '../middlewares/auth.middleware.js';
import {getVideoById, publishVideo, updateVideoDetails, updateVideoThumbnail, deleteVideo, togglePublishStatus, getAllVideos} from '../controllers/video.controller.js';
import {upload} from '../middlewares/multer.middleware.js';


const router = Router();

router.route('/')
.get(getAllVideos)
.post(verifyJWT, upload.fields([{name: 'video', maxCount: 1}, {name: 'thumbnail', maxCount: 1}]), publishVideo);

router.route('/:videoId')
.get(getVideoById)
.patch(verifyJWT, updateVideoDetails)
.delete(verifyJWT, deleteVideo);

router.route('/update/thumbnail/:videoId').patch(verifyJWT, upload.single('thumbnail'), updateVideoThumbnail);

router.route('/toggle/publish/:videoId').patch(verifyJWT, togglePublishStatus);


export default router;

