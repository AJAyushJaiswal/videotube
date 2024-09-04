import {Router} from 'express';
import {verifyJWT} from '../middlewares/auth.middleware.js';
import {getPlaylistById, createPlaylist, addVideoToPlaylist, removeVideoFromPlaylist, updatePlaylist, deletePlaylist, getUserChannelPlaylists} from '../controllers/playlist.controller.js';


const router = Router();

router.route('/').post(verifyJWT, createPlaylist);

router.route('/:playlistId')
.get(getPlaylistById)
.patch(verifyJWT, updatePlaylist)
.delete(verifyJWT, deletePlaylist);

router.route('/:playlistId/v/:videoId')
.patch(verifyJWT, addVideoToPlaylist)
.patch(verifyJWT, removeVideoFromPlaylist);

router.route('/u/:userId').get(getUserChannelPlaylists);


export default router;