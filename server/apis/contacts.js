const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Contact = require('../models/Contact');
const auth = require('../middleware/auth');

// Get all contacts for authenticated user
router.get('/', auth, async (req, res) => {
  try {
    const contacts = await Contact.find({ userId: req.user.id })
      .populate('contactUserId', 'username email displayName')
      .sort({ createdAt: -1 });
    
    res.json({
      success: true,
      contacts: contacts.map(contact => ({
        id: contact.contactUserId._id,
        username: contact.contactUserId.username,
        email: contact.contactUserId.email,
        displayName: contact.contactUserId.displayName || contact.contactUserId.username,
        addedAt: contact.createdAt
      }))
    });
  } catch (error) {
    console.error('Get contacts error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching contacts'
    });
  }
});

// Add a new contact
router.post('/', auth, async (req, res) => {
  try {
    const { username, email } = req.body;
    
    if (!username && !email) {
      return res.status(400).json({
        success: false,
        message: 'Please provide either username or email'
      });
    }

    // Find user by username or email
    let query = {};
    if (username) {
      query.username = username;
    } else {
      query.email = email;
    }

    const userToAdd = await User.findOne(query);
    
    if (!userToAdd) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if user is trying to add themselves
    if (userToAdd._id.toString() === req.user.id) {
      return res.status(400).json({
        success: false,
        message: 'You cannot add yourself as a contact'
      });
    }

    // Check if contact already exists
    const existingContact = await Contact.findOne({
      userId: req.user.id,
      contactUserId: userToAdd._id
    });

    if (existingContact) {
      return res.status(400).json({
        success: false,
        message: 'User is already in your contacts'
      });
    }

    // Create new contact
    const newContact = new Contact({
      userId: req.user.id,
      contactUserId: userToAdd._id
    });

    await newContact.save();

    res.status(201).json({
      success: true,
      message: 'Contact added successfully',
      contact: {
        id: userToAdd._id,
        username: userToAdd.username,
        email: userToAdd.email,
        displayName: userToAdd.displayName || userToAdd.username
      }
    });
  } catch (error) {
    console.error('Add contact error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while adding contact'
    });
  }
});

// Remove a contact
router.delete('/:contactId', auth, async (req, res) => {
  try {
    const { contactId } = req.params;
    
    const contact = await Contact.findOneAndDelete({
      userId: req.user.id,
      contactUserId: contactId
    });

    if (!contact) {
      return res.status(404).json({
        success: false,
        message: 'Contact not found'
      });
    }

    res.json({
      success: true,
      message: 'Contact removed successfully'
    });
  } catch (error) {
    console.error('Remove contact error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while removing contact'
    });
  }
});

module.exports = router;