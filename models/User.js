// User Model - Sample model for testing MongoDB connection
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Name is required'],
        trim: true,
        maxlength: [50, 'Name cannot be more than 50 characters']
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        lowercase: true,
        trim: true,
        match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
    },
    preferences: {
        dietaryRestrictions: [{
            type: String,
            enum: ['vegetarian', 'vegan', 'gluten-free', 'dairy-free', 'nut-free', 'keto', 'paleo']
        }],
        budget: {
            type: String,
            enum: ['budget', 'moderate', 'premium'],
            default: 'moderate'
        },
        allergies: [String],
        goals: [{
            type: String,
            enum: ['weight-loss', 'weight-gain', 'muscle-building', 'general-health', 'disease-management']
        }]
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true // Adds createdAt and updatedAt fields
});

// Index for better query performance
userSchema.index({ email: 1 });
userSchema.index({ createdAt: -1 });

// Instance methods
userSchema.methods.getPublicProfile = function() {
    return {
        id: this._id,
        name: this.name,
        preferences: this.preferences,
        createdAt: this.createdAt
    };
};

// Static methods
userSchema.statics.findByEmail = function(email) {
    return this.findOne({ email: email.toLowerCase() });
};

// Pre-save middleware
userSchema.pre('save', function(next) {
    // Convert email to lowercase before saving
    if (this.email) {
        this.email = this.email.toLowerCase();
    }
    next();
});

module.exports = mongoose.model('User', userSchema);
