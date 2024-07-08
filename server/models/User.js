const {Schema, model} = require("mongoose");

const UserSchema = Schema (
    {
        name: { 
            type: String,
            required: true,
            min: 2,
            max: 50,
        },
        username: {
            type: String,
            required: true,
            min: 2,
            max: 50,
        },
        bio: String,
        email: {
            type: String,
            required: true,
            max: 50,
            unique: true,
        },
        password: {
            type: String,
            required: true,
            min: 5,
        },
        rol: {
            type: String,
            default: "rol_user"
        },
        image: {
            type: String,
            required: true,
            default: "default.png"
        },
        created_at: {
            type: Date,
            default: Date.now
        },
        //friends: {
        //    type: Array,
        //    default: []
        //},
        location: String,
        occupation: String,
    },
);

module.exports = model("User", UserSchema, "users");
                     