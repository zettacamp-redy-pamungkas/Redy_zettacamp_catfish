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

module.exports = {
    Query: {

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
                }, 'privateKey', { expiresIn: '5m' })

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