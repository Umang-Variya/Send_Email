const express = require('express')
const app = express();
// const User = require('../model/user')
const {
    User,
    validate
} = require("../model/user");
const crypto = require('crypto');
const Token = require("../model/token");
const sendEmail = require("../utils/email");
const Joi = require("joi");
const jwt = require('jsonwebtoken');
const {
    sharpCompresion
} = require('../utils/resize')


const getAllUsers = (req, res) => {
    User.find({
        verified: true
    }, (err, result) => {
        if (err) {
            console.log(err);
        }
        res.send(result);
    })
}

const registerUser = async (req, res) => {
    try {
        const {
            firstName,
            lastName,
            gender,
            ph_no,
            email,
            password
        } = req.body
        const {
            error
        } = validate(req.body);
        if (error) return res.status(400).send(error.details[0].message);

        let alreadyUser = await User.findOne({
            email: req.body.email
        });
        if (alreadyUser)
            return res.status(400).send("User with given email already exist!");

        const signUp = await new User({
            firstName,
            lastName,
            gender,
            ph_no,
            email,
            password
        }).save();

        let user = await User.findOne({
            email: req.body.email
        });

        let token = await new Token({
            userId: user._id,
            token: crypto.randomBytes(32).toString("hex"),
        }).save();

        const message = `http://localhost:3001/api/users/verify/${user.id}/${token.token}`;
        await sendEmail(user.email, "Verify Email", message);
        console.log(message);
        res.send({
            msg: 'signUp Successfull & An Email sent to your account please verify',
            data: signUp,
            status: 200
        })

    } catch (err) {
        console.log(err);
    }
}

const verifyMail = function (req, res, next) {
    Token.findOne({
        token: req.params.token
    }, function (err, token) {
        if (!token) {
            return res.status(400).send({
                msg: 'Your verification link may have expired. Please click on resend for verify your Email.'
            });
        } else {
            User.findOne({
                _id: req.params.id,

            }, function (err, user) {
                if (!user) {
                    return res.status(401).send({
                        msg: 'We were unable to find a user for this verification. Please SignUp!'
                    });
                } else if (user.verified) {
                    return res.status(400).send('User has been already verified. Please Login');
                } else {
                    user.verified = true;
                    user.save(function (err) {
                        if (err) {
                            return res.status(500).send({
                                msg: err.message
                            });
                        } else {
                            return res.status(200).send('Your account has been successfully verified');
                        }
                    });
                }
            });
        }

    });
};

const forgotPassword = async function (req, res, next) {
    const schema = Joi.object({
        password: Joi.string().min(8)
            .pattern(new RegExp('^[a-zA-Z0-9!@#$%&*]{3,25}$')),
        email: Joi.string().email().required()
    });
    const {
        error
    } = schema.validate(req.body);
    if (error) return res.status(400).send(error.details[0].message);
    User.findOne({
        email: req.body.email
    }, function (err, user) {
        if (!user) {
            return res.status(401).send({
                msg: 'We were unable to find a user for this verification. Please SignUp!'
            });
        } else {
            user.password = req.body.password
            user.save(function (err) {
                if (err) {
                    return res.status(500).send({
                        msg: err.message
                    });
                } else {
                    return res.status(200).send('Your password successfully changed!!');
                }
            });
        }
    })
};

const aggregation = (req, res) => {
    User.aggregate([
            // {
            //             $project: {
            //                 year: {
            //                     $year: "$date"
            //                 },
            //                 month: {
            //                     $month: "$date"
            //                 },
            //                 day: {
            //                     $dayOfMonth: "$date"
            //                 },
            //                 hour: {
            //                     $hour: "$date"
            //                 },
            //                 minutes: {
            //                     $minute: "$date"
            //                 },
            //                 seconds: {
            //                     $second: "$date"
            //                 },
            //                 milliseconds: {
            //                     $millisecond: "$date"
            //                 },
            //                 dayOfYear: {
            //                     $dayOfYear: "$date"
            //                 },
            //                 dayOfWeek: {
            //                     $dayOfWeek: "$date"
            //                 },
            //                 week: {
            //                     $week: "$date"
            //                 }
            //             }
            //         }


            {
                $match: {
                    verified: false
                }
            },
            // {
            //     $limit: 3
            // }
        ])

        .then(response => {
            res.json({
                response
            })
            // console.log(response);
        })
        .catch(error => {
            res.json({
                message: 'An error occured!'
            })
        })
}

const lookUp = (req, res) => {
    console.log('===in lookup===');
    User.aggregate([{
            $lookup: {
                from: "tokens",
                localField: "_id",
                foreignField: "userId",
                as: "data"
            }
        }]).then(response => {
            res.send({
                response
            })
        })
        .catch(error => {
            res.json({
                message: 'An error occured!'
            })
        })
}

const sign_in = function (req, res) {

    User.findOne({
        email: req.body.email
    }, function (err, user) {
        if (err) throw err;
        if (!user) {
            return res.status(401).json({
                message: 'Authentication failed. Invalid user or password.'
            });
        }
        if (user.password === req.body.password) {
            var token = jwt.sign({
                user_id: user._id,
                user: user
            }, 'tokeeeeeennn', {
                expiresIn: '365d'
            });
            user.token = token;

            return res.send({
                data: user,
                token: token
            });
        } else {
            return res.status(401).send({
                accessToken: null,
                message: "Invalid Password!"
            });
        }

    });
};

const verifyToken = function (req, res) {
    const id = req.user_id
    User.findById(id, function (err, user) {
        res.send(user)
    })
}

const postUpload = async function (req, res) {
    console.log("======in image upload======");
    const id = req.user_id
    const result = await sharpCompresion(req)
    User.findById(id, function (err, user) {
        if (!user) {
            return res.status(401).send({
                msg: 'We were unable to find a you!!'
            });
        } else {
            user.image = result
            user.save(function (err) {
                if (err) {
                    return res.status(500).send({
                        msg: err.message
                    });
                } else {
                    return res.status(200).send('Your photo successfully changed!!');
                }
            });
        }
    })

}
module.exports = {
    getAllUsers,
    registerUser,
    verifyMail,
    aggregation,
    lookUp,
    forgotPassword,
    sign_in,
    verifyToken,
    postUpload
}