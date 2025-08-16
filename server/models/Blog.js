import mongoose from "mongoose";
import Comment from "./Comment.js";

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
blogSchema.pre("findOneAndDelete", async function (next) {
  const blogId = this.getQuery()["_id"]; // blog being deleted
  await Comment.deleteMany({ blog: blogId }); // delete all its comments
  next();
});
const Blog = mongoose.model("blog", blogSchema);
export default Blog;
