const express = require('express');
const router = express.Router();
const { analyzeCode } = require('../services/aiService');


router.post('/review' , async (req , res) => {
    try{
        const result = await analyzeCode(req.body.code);
        res.json({review : result});
    }
    catch(error){
        res.status(500).json({error : "AI review failed"});
    }
})

module.exports = router;
