import accessRecord from '../modals/accessRecord.js';
import axios from 'axios';
import * as cheerio from 'cheerio';
export const shareAccess = async(req,res)=>{
    try {
        const {email,name,userId,pinataHash} = req.body;
        const createAccess = new accessRecord({email,name,userId,pinataHash});
        const saveAccess = await createAccess.save();
        res.status(201).send({
            success:true,
            message:"Access Record created successfully",
            saveAccess
        })
    } catch (error) {
        res.status(500).send({
            success:false,
            message:"error while creatig access",
            error
        })
    }
}

export const getUser = async(req,res)=>{
    try {
        const {userId} = req.params;
        const data = await accessRecord.findOne({userId:userId})
        if(data.success)
        {
            return res.status(400).send({
                success:false,
                message:"User Not Found"
            })
        }

       const {pinataHash} = data;
       const response = await axios.get(`https://red-traditional-hookworm-447.mypinata.cloud/ipfs/${pinataHash}`,{ responseType: 'arraybuffer' });
      
       // Get the content type from the response headers
       const contentType = response.headers['content-type'];

       // Check if the content type is HTML or PDF
       if (contentType.includes('text/html')) {
        const html  = response.data;
        // Load the HTML into cheerio
        const $ = cheerio.load(html);
        let pdfLinkText = null; 
        // Loop through all <a> tags
        $('a').each((index, element) => {
            const link = $(element).attr('href');
            if (link && link.endsWith('.pdf')) {
                pdfLinkText = $(element).text();
                return false;  // Break the loop once the first .pdf link is found
            }
        });
        const pdfData = await axios.get(`https://red-traditional-hookworm-447.mypinata.cloud/ipfs/${pinataHash}/${pdfLinkText}`,{ responseType: 'arraybuffer' });
            res.set('Content-Type', 'application/pdf');
            res.send(pdfData?.data);
           
       } else if (contentType.includes('application/pdf')) {
           res.set('Content-Type', 'application/pdf');
           res.send(response.data)
       } else {
           console.log('The response is of type:', contentType);
       }

    } catch (error) {
        res.status(500).send({
            success:false,
            message:"error while getting user data",
            error
        })
    }
}


export const removeAccess = async(req,res)=>{
    try {
        const {email,newUserId} = req.body;
        const updatedUser = await accessRecord.findOneAndUpdate(
            {email:email},
            {userId:newUserId},
            { new: true, runValidators: true }
        )
        res.status(201).send({
            success:true,
            message:"updated user successfully",
            updatedUser
        })
    } catch (error) {
        res.status(500).send({
            success:false,
            message:"error while updating userId",
            error
        })
    }
}

export const getRecordByURI = async(req,res)=>{
    try {
        const {pinataHash} = req.body;
        const record = await accessRecord.find({pinataHash});
        if(record)
        {
            res.status(201).send({
                success:true,
                message:"records retrieved",
                record
            })
        }
    } catch (error) {
        res.status(500).send({
            success:false,
            message:"error while accessing record by uri",
            error
        })
    }
}