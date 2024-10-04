import accessRecord from '../modals/accessRecord.js';
import axios from 'axios';
import * as cheerio from 'cheerio';


export const shareAccess = async (req, res) => {
    try {
        const { email, name, userId, pinataHash } = req.body;

        // Ensure userId and pinataHash are provided
        if (!userId || !pinataHash) {
            return res.status(400).send({
                success: false,
                message: "userId and pinataHash are required"
            });
        }

        // Find the user by email
        let userRecord = await accessRecord.findOne({ email });

        if (userRecord) {
            // Check if the userId and pinataHash combination already exists
            const existingAccess = userRecord.accessData.find(
                (access) => access.userId === userId && access.pinataHash === pinataHash
            );

            if (existingAccess) {
                return res.status(400).send({
                    success: false,
                    message: "Access for this userId and pinataHash already exists"
                });
            }

            // If no duplicate, add new accessData entry
            userRecord.accessData.push({ userId, pinataHash });
            const updatedRecord = await userRecord.save();

            res.status(201).send({
                success: true,
                message: "Access record updated successfully",
                updatedRecord
            });
        } else {    
            // Create new access record if the email doesn't exist
            const newAccessRecord = new accessRecord({
                email,
                name,
                accessData: [{ userId, pinataHash }]
            });

            const savedRecord = await newAccessRecord.save();

            res.status(201).send({
                success: true,
                message: "Access record created successfully",
                savedRecord
            });
        }
    } catch (error) {
        res.status(500).send({
            success: false,
            message: "Error while creating access record",
            error: error.message // Send error message for more detail
        });
    }
};



// Get User by userId
export const getUser = async (req, res) => {
    try {
        const { userId } = req.params;

        // Find the record by userId inside accessData array
        const userRecord = await accessRecord.findOne({ "accessData.userId": userId });

        if (!userRecord) {
            return res.status(404).send({
                success: false,
                message: "User not found"
            });
        }

        // Find the specific entry in accessData with the matching userId
        const accessEntry = userRecord.accessData.find(entry => entry.userId === userId);
        const { pinataHash } = accessEntry;

        const response = await axios.get(`https://red-traditional-hookworm-447.mypinata.cloud/ipfs/${pinataHash}`, { responseType: 'arraybuffer' });

        const contentType = response.headers['content-type'];

        // Check content type and handle accordingly (PDF or HTML)
        if (contentType.includes('application/pdf')) {
            res.set('Content-Type', 'application/pdf');
            res.send(response.data);
        } else if (contentType.includes('text/html')) {
            const html = response.data;
            const $ = cheerio.load(html);
            let pdfLinkText = null;

            $('a').each((index, element) => {
                const link = $(element).attr('href');
                if (link && link.endsWith('.pdf')) {
                    pdfLinkText = $(element).text();
                    return false;
                }
            });

            const pdfData = await axios.get(`https://red-traditional-hookworm-447.mypinata.cloud/ipfs/${pinataHash}/${pdfLinkText}`, { responseType: 'arraybuffer' });
            res.set('Content-Type', 'application/pdf');
            res.send(pdfData?.data);
        } else {
            res.status(415).send({ message: "Unsupported content type" });
        }

    } catch (error) {
        res.status(500).send({
            success: false,
            message: "Error while getting user data",
            error
        });
    }
};


// Remove Access Record by updating userIds array
export const updateUserIdForAccess = async (req, res) => {
    try {
        const { email, pinataHash, updatedUserId } = req.body;

        // Step 1: Find user by email
        const user = await accessRecord.findOne({ email });

        if (!user) {
            return res.status(404).send({
                success: false,
                message: "User not found"
            });
        }

        // Step 2: Find the correct accessData entry with the pinataHash
        const accessDataEntry = user.accessData.find(
            (entry) => entry.pinataHash === pinataHash
        );

        if (!accessDataEntry) {
            return res.status(404).send({
                success: false,
                message: "Pinata hash not found in access data"
            });
        }

        // Step 3: Update the userId for the matched pinataHash
        accessDataEntry.userId = updatedUserId;

        // Step 4: Save the updated user record
        await user.save();

        res.status(200).send({
            success: true,
            message: "UserId updated successfully",
            updatedUser: user
        });
    } catch (error) {
        res.status(500).send({
            success: false,
            message: "Error while updating UserId",
            error
        });
    }
};


// Delete User (if the user has multiple entries, delete the entire document)
export const deleteUser = async (req, res) => {
    try {
        const { email } = req.body;

        const deletedUser = await accessRecord.findOneAndDelete({ email });

        if (!deletedUser) {
            return res.status(404).send({
                success: false,
                message: "User not found"
            });
        }

        res.status(201).send({
            success: true,
            message: "User deleted successfully"
        });
    } catch (error) {
        res.status(500).send({
            success: false,
            message: "Error while deleting user",
            error
        });
    }
};


// Get Record by Pinata Hash (URI)
export const getRecordByURI = async (req, res) => {
    try {
        const { pinataHash } = req.body;

        // Find records where accessData contains the pinataHash
        const record = await accessRecord.find({
            "accessData.pinataHash": pinataHash
        });

        if (!record || record.length === 0) {
            return res.status(404).send({
                success: false,
                message: "Record not found"
            });
        }

        res.status(200).send({
            success: true,
            message: "Records retrieved",
            record
        });
    } catch (error) {
        res.status(500).send({
            success: false,
            message: "Error while accessing record by URI",
            error
        });
    }
};



// Get User by Email
export const getUserByEmail = async (req, res) => {
    try {
        const { email } = req.body;
        const user = await accessRecord.findOne({ email });

        if (!user) {
            return res.status(404).send({
                success: false,
                message: "User not found"
            });
        }

        res.status(200).send({
            success: true,
            message: "User found",
            user
        });
    } catch (error) {
        res.status(500).send({
            success: false,
            message: "Error while getting user by email",
            error
        });
    }
};

