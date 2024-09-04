import {Router} from 'express';
import {verifyJWT} from '../middlewares/auth.middleware.js';
import {toggleSubscription, getChannelSubscribers, getUserSubscribedChannels} from '../controllers/subscription.controller.js';


const router = Router();

router.use(verifyJWT);

router.route('/u/:channelId')
.get(getChannelSubscribers)
.post(toggleSubscription);

router.route('/u/:subscriberId').get(getUserSubscribedChannels);


export default router;