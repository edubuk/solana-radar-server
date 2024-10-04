import express from 'express';
import {deleteUser, getRecordByURI, getUser, getUserByEmail, updateUserIdForAccess, shareAccess} from '../controller/shareAccess.js'

const router = express.Router();

router.post('/shareAccess',shareAccess);
router.get('/getResponse/:userId',getUser);
router.put('/removeAccess',updateUserIdForAccess);
router.get('/recordByUri',getRecordByURI);
router.delete('/deleteUser',deleteUser);
router.get("/getUser",getUserByEmail);
export default router;