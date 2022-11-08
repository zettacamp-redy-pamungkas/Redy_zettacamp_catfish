// User Model
const UserModel = require('../models/user.model');

// Apollo Error
const { ApolloError } = require('apollo-server');

// blowfish crypt
const bcrypt = require('bcrypt');

// email validator
const emailValidator = require('email-validator');

// jsonwebtoken
const jwt = require('jsonwebtoken');
const { default: mongoose } = require('mongoose');

module.exports = {
    Query: {
        getAllUsers: async (_, { email, first_name, last_name }, context) => {
            try {
                const aggregateUsers = [];
                const matchQuery = { $and: [] };
                if (email) {
                    matchQuery.$and.push({ email });
                }

                if (first_name) {
                    matchQuery.$and.push({ "first_name": first_name });
                }

                if (last_name) {
                    matchQuery.$and.push({ "last_name": last_name });
                }

                if (matchQuery.$and.length) {
                    aggregateUsers.push({
                        $match: matchQuery
                    })
                }

                let users = await UserModel.find({});
                if (aggregateUsers.length) {
                    users = await UserModel.aggregate(aggregateUsers);
                    users.map((user) => {
                        user.id = mongoose.Types.ObjectId(user._id);
                    })
                }

                return users
            } catch (err) {
                throw new ApolloError(err);
            }
        }
    },
    Mutation: {
        createOneUser: async (_, args,) => {
            try {

                // check if email valid
                const isValidEmail = emailValidator.validate(args.email);
                if (!isValidEmail) {
                    throw new ApolloError('Email not valid');
                }

                // check if password didn't match
                if (args.password !== args.confirmPassword) {
                    throw new ApolloError('Password didn\'t match');
                }

                // hash password
                args.password = await bcrypt.hash(args.password, 10);

                const newUser = new UserModel(args);
                // save newUser
                await newUser.save();
                return newUser;
            } catch (err) {
                throw new ApolloError(err);
            }
        },
        login: async (_, { email, password }, context) => {
            try {
                const user = await UserModel.findOne({ email });

                if (!user) {
                    throw new ApolloError('User not found');
                }

                // checkpassword
                const isValidPassword = await bcrypt.compare(password, user.password);
                if (!isValidPassword) {
                    throw new ApolloError('Password didn\'t match');
                }

                const token = await jwt.sign({
                    user_id: user.id
                }, 'privateKey', { expiresIn: '1h' })

                return {
                    token
                }

                // 
            } catch (err) {
                throw new ApolloError(err)
            }
        }
    }
}