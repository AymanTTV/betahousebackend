const { usersModel } = require('../models/users-model');
const { usersValidation } = require('../validations/usersValidation');
const bcrypt = require('bcrypt');

// Get all users
const getUsers = async (req, res) => {
    try {
        const userData = await usersModel.find();
        res.status(200).send(userData);
    } catch (error) {
        res.status(400).send(error.message);
    }
};

// Get user by ID
const getUserById = async (req, res) => {
    try {
        const { id } = req.params;
        const personalData = await usersModel.findById(id);
        res.status(200).send(personalData);
    } catch (error) {
        res.status(400).send(error.message);
    }
};

// Create a new user
const createUser = async (req, res) => {
    try {
        // Validation
        const { error } = usersValidation(req.body);
        if (error) return res.status(405).send(error.message);

        // Hash password and save user data
        const postData = new usersModel(req.body);
        postData.password = await bcrypt.hash(postData.password, 10);

        // Check if user already exists
        const existingUser = await usersModel.findOne({ email: req.body.email });
        if (existingUser) {
            return res.status(409).send({
                status: false,
                message: 'This user already exists'
            });
        }

        // Save user data
        await postData.save();
        res.status(201).send({
            status: true,
            message: 'User created successfully',
            data: postData
        });
    } catch (error) {
        res.status(400).send(error.message);
    }
};

// Update user by ID
const updateUser = async (req, res) => {
    try {
        const { id } = req.params;

        // Validation
        const { error } = usersValidation(req.body);
        if (error) return res.send(error.message);

        // Check if user exists
        const existingUser = await usersModel.findOne({ email: req.body.email });
        if (!existingUser) {
            return res.status(409).send({
                status: false,
                message: 'User not found'
            });
        }

        // Update user data
        req.body.password = await bcrypt.hash(req.body.password, 10);
        const updatedData = await usersModel.findByIdAndUpdate(id, req.body, { new: true });
        res.status(200).send({
            status: true,
            message: 'User updated successfully',
            data: updatedData
        });

    } catch (error) {
        res.status(400).send(error.message);
    }
};

// Delete user by ID
const deleteUser = async (req, res) => {
    try {
        const { id } = req.params;
        const deletedData = await usersModel.findByIdAndDelete(id);
        res.status(200).send({
            status: true,
            message: 'User deleted successfully',
            data: deletedData
        });
    } catch (error) {
        res.status(400).send(error.message);
    }
};

module.exports = { getUsers, createUser, updateUser, getUserById, deleteUser };
