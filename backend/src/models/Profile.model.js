import mongoose from "mongoose";

const profileSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },

    role: {
      type: String,
      required: true,
    },

    college: {
      type: String,
      required: true,
    },

    cgpa: {
      type: Number,
    },

    skills: [String],

    resumeUrl: {
      type: String,
      default: "",
    },

    resumeFileName: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

const Profile = mongoose.model("Profile", profileSchema);

export default Profile;