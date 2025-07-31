import mongoose from "mongoose";

const blogSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    subTitle: { type: String },
    description: { type: String, required: true },
    category: { type: String, required: true },
    image: { type: String, required: true },
    isPublished: { type: Boolean, required: true },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // Reference to User model
      required: true,
    },
  },
  { timestamps: true }
);
const Blog = mongoose.model("blog", blogSchema);
export default Blog;
