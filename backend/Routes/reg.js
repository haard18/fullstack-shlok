const express = require('express');
const router = express.Router();
const User = require("../Models_Database/User");
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const { Resend } = require('resend');
const resend = new Resend('re_Yd1nwdMV_DhJ1ozeG78DsT6KCy5jFyjyW');

const { body, validationResult } = require('express-validator');
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname);
    }
});
const upload = multer({ storage: storage });

router.post('/signupDribble',
    [
        body('name').trim().isLength({ min: 2 }).withMessage("Enter Valid Inputs"),
        body('username').trim().isLength({ min: 3 }).withMessage("Enter Valid Username"),
        body('email').trim().isEmail().withMessage("Please enter Email"),
        body('password').isLength({ min: 7 }).withMessage("Please Enter Password longer than 7 characters")
    ], async (req, res) => {
        try {
            console.log(req.body);
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }
            let existinguser = await User.findOne({ email: req.body.email });
            if (existinguser) {
                return res.status(400).json({ msg: "The user already exists" });
            }
            const salt = await bcrypt.genSalt(10);
            const secPass = await bcrypt.hash(req.body.password, salt);
            const newuser = await User.create({
                name: req.body.name,
                username:req.body.username,
                email: req.body.email,
                password: secPass,
                location:req.body.location,
                image:req.body.image
            })
            await newuser.save();
            res.status(200).json({ msg: "User Created Successfully", user: newuser });

            
        }

        catch (error) {
            console.log(error);
            res.status(500).json({ msg: "Internal Server error" })
        }
    })
router.post("/sendEmail",async(req,res)=>{
    const emailResponse = await resend.emails.send({
        from: 'Acme <onboarding@resend.dev>',
        to: [req.body.email],
        subject: 'Welcome to Dribble',
        html: `<p>Hi ${req.body.name},</p><p>Welcome to Dribble!</p><p>Your account has been successfully created.</p>`,
        // You can add more options here
    });
    console.log("Email sent:", emailResponse);
})
module.exports=router;