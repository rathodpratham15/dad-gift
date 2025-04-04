// import mongoose from 'mongoose';

// const userSchema = new mongoose.Schema(
//     {
//         name: { type: String, required: true },
//         email: { type: String, required: true, unique: true },
//         password: { type: String, required: true },
//         role: { type: String, enum: ['user', 'admin'], default: 'user' },
//     },
//     { timestamps: true }
// );

// const User = mongoose.model('User', userSchema);
// export default User;

import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
    {
        name: { type: String, required: true },
        email: { type: String, required: true, unique: true },
        password: { type: String },
        role: { type: String, enum: ['user', 'admin'], default: 'user' },
        provider: { type: String, default: 'local' }, // 'local' or 'google'
    },
    { timestamps: true }
);

const User = mongoose.model('User', userSchema);
export default User;
