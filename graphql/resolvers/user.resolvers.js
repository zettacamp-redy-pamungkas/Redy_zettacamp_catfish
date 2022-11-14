// User Model
const UserModel = require('../../models/user.model');

// Apollo Error
const { ApolloError } = require('apollo-server');

// blowfish crypt
const bcrypt = require('bcrypt');

// email validator
const emailValidator = require('email-validator');

// jsonwebtoken
const jwt = require('jsonwebtoken');
const { default: mongoose } = require('mongoose');

// status code
const status_code = require('../../utils/status_code');


module.exports.userQuery = {
    getAllUsers: async (_, { email, first_name, last_name, page, limit}, context) => {
        try {
            console.log(context.req.user_id)
            const aggregateUsers = [];
            const matchQuery = { $and: [] };
            if (email) {
                matchQuery.$and.push({ email });
            }

            if (first_name) {
                matchQuery.$and.push({ "first_name": new RegExp(first_name, "i") });
            }

            if (last_name) {
                matchQuery.$and.push({ "last_name": new RegExp(last_name, "i") });
            }

            if (matchQuery.$and.length) {
                aggregateUsers.push({
                    $match: matchQuery
                })
            }

            // pagination
            if (page) {
                page = parseInt(page) - 1;
                if (Number.isNaN(page) || page < 0) {
                    page = 0;
                }

                limit = parseInt(limit || 5);
                if (Number.isNaN(limit) || limit < 0) {
                    limit = 5
                }

                aggregateUsers.push(
                    {
                        $skip: page * limit
                    },
                    {
                        $limit: limit
                    }
                )
            }

            let users = await UserModel.find({});
            let totalDocs = users.length
            if (aggregateUsers.length) {
                users = await UserModel.aggregate(aggregateUsers);
                if (!users.length) { throw new ApolloError('not found') }
                users.map((user) => {
                    user.id = mongoose.Types.ObjectId(user._id);
                })
            }

            return {
                users,
                page: page >= 0 ? page + 1 : 1,
                maxPage: Math.ceil(totalDocs / (limit || users.length)),
                currentDocs: users.length,
                totalDocs
            }
        } catch (err) {
            throw new ApolloError(err);
        }
    },
    getOneUser: async (_, { id, email }) => {
        try {
            if (id) {
                const user = await UserModel.findById(id)
                if (!user) {
                    throw new ApolloError(`User with ID: ${id} not found`, status_code[404]);
                }
                return user
            }

            if (email) {
                const user = await UserModel.findOne({ email });
                if (!user) {
                    throw new ApolloError(`User with email: ${email} not found.`, status_code[404]);
                }
                return user
            }
        } catch (err) {
            throw new ApolloError(err)
        }
    }
}

module.exports.userMutation = {
    createOneUser: async (_, args,) => {
        try {

            // check if email valid
            const isValidEmail = emailValidator.validate(args.email);
            if (!isValidEmail) {
                throw new ApolloError('Email not valid', status_code[400]);
            }

            // check if password didn't match
            if (args.password !== args.confirmPassword) {
                throw new ApolloError('Password didn\'t match', status_code[400]);
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
    updateUser: async (_, args) => {
        try {
            const user = await UserModel.findById(args.id);
            if (!user) {
                throw new ApolloError(`User with id: ${args.id} not found`, status_code[404]);
            }

            if (args.email) {
                const isValidEmail = emailValidator.validate(args.email);
                if (!isValidEmail) {
                    throw new ApolloError(`Email: ${args.email} not valid`, status_code[400]);
                }
            }

            // check password length
            if (args.password && args.password.length <= 5) {
                throw new ApolloError('Password length must greater than 5 digits.', status_code[400])
            } else if (args.password && args.password.length > 5) {
                // check oldPassword
                if (!args.oldPassword) throw new ApolloError('Please insert old passwrod', status_code[400]);

                // check oldPassword match
                const isOldPasswordMatch = await bcrypt.compare(args.oldPassword, user.password);
                if (!isOldPasswordMatch) throw new ApolloError('Old Password didn\'t match, please try again.', status_code[400]);

                // check if new password is equal to oldPassword
                const isNewPasswordEqualToOldPassword = await bcrypt.compare(args.password, user.password);
                if (isNewPasswordEqualToOldPassword) throw new ApolloError('New password cannot same with old password.', status_code[400]);

                args.password = await bcrypt.hash(args.password, 10);
            }


            await UserModel.findByIdAndUpdate(args.id, args, { new: true, runValidators: true });
            return await UserModel.findById(args.id);
        } catch (err) {
            throw new ApolloError(err)
        }
    },
    deleteUser: async (_, { id, status = 'deleted' }) => {
        try {
            const user = await UserModel.findByIdAndUpdate(id, { status: status }, { runValidators: true });
            if (!user) {
                throw new ApolloError(`User with: ${id} not found`);
            }
            return await UserModel.findById(id);
        } catch (err) {
            throw new ApolloError(err);
        }
    },
    login: async (_, { email, password }, context) => {
        try {
            const user = await UserModel.findOne({ email });

            if (!user || user.status === "deleted") {
                throw new ApolloError('User not found');
            }

            // checkpassword
            const isValidPassword = await bcrypt.compare(password, user.password);
            if (!isValidPassword) {
                throw new ApolloError('Password didn\'t match');
            }

            const token = await jwt.sign({
                user_id: user.id,
                user_role: user.role,
            }, 'privateKey', { expiresIn: '1d' })

            return {
                token
            }

            // 
        } catch (err) {
            throw new ApolloError(err)
        }
    }
}