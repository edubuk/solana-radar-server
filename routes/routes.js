import express from 'express';
import {deleteUser, getRecordByURI, getUser, removeAccess, shareAccess} from '../controller/shareAccess.js'

const router = express.Router();

router.post('/shareAccess',shareAccess);
router.get('/getResponse/:userId',getUser);
router.put('/removeAccess',removeAccess);
router.get('/recordByUri/:pinataHash',getRecordByURI);
router.delete('/deleteUser',deleteUser);

export default router;