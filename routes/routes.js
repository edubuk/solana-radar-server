import express from 'express';
import {getRecordByURI, getUser, removeAccess, shareAccess} from '../controller/shareAccess.js'

const router = express.Router();

router.post('/shareAccess',shareAccess);
router.get('/getResponse/:userId',getUser);
router.put('/removeAccess',removeAccess);
router.get('/recordByUri',getRecordByURI);

export default router;