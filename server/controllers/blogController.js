import fs from 'fs'
import imagekit from '../configs/imagekit.js';
import Blog from '../models/Blog.js';
import Comment from '../models/Comment.js';
import main from '../configs/gemini.js';
export const addBlog = async (req, res)=>{
try {
const {title, subTitle, description, category, isPublished} = JSON.parse
(req.body.blog) ;
const imageFile = req.file;
// Check if all fields are present
if(!title || !description || !category || !imageFile) {
return res. json({success: false, message: "Missing required fields" })
}
const fileBuffer=fs.readFileSync(imageFile.path)
const response=await imagekit.upload({
    file:fileBuffer,
    fileName:imageFile.originalname,
    folder:"/blogs"
})

const optimizedImageUrl = imagekit. url({
path: response. filePath,
transformation: [
{quality: 'auto'}, // Auto compression
{format: 'webp' }, // Convert to modern format
{width: '1280'}// Width resizing
]
});
const image=optimizedImageUrl;
await Blog.create({title,subTitle,description,category,image,isPublished, author : req.user.id})

// console.log("req.user in addBlog:", req.user);
console.log("Blog created with author:", req.user.id);
res.json({success:true, message: "Blog added successfully"})

} catch (error) {
   res. json({success:false, message:error.message})
}
}

export const getAllBlogs = async (req, res)=>{
try {
const blogs = await Blog.find({ isPublished: true }).populate("author", "name email");
res. json({success: true, blogs} )
} catch (error) {
res. json({success: false, message: error . message})
}
}
export const getBlogById = async (req, res) =>{
try {
const {blogId} = req.params;
const blog = await Blog.findById(blogId).populate("author", "name email");
// console.log(blog);
if(!blog){
return res.json({ success: false, message: "Blog not found" });
} 
res.json({success:true,blog})
}
catch (error) {
res. json({success: false, message: error.message})
}
}
 export const deleteBlogById = async (req, res) =>{
try {
const { id } = req. body;
await Blog. findByIdAndDelete(id);

await Comment.deleteMany({blog:id});
res. json({success: true, message: 'Blog deleted successfully' })
} catch (error) {
res. json({success: false, message: error.message})
}
 }

 export const togglePublish = async (req, res) =>{
try {
const { id } = req. body;
const blog = await Blog. findById(id);
blog. isPublished = ! blog. isPublished;
await blog. save();
res. json({success: true, message: 'Blog status updated' })
} catch (error) {
res. json({success: false, message: error . message} )
}
}


export const addComment = async (req, res) =>{
try {
const {blog, name, content } = req. body;
await Comment. create({blog, name, content} ) ;
res. json({success: true, message: 'Comment added for review' })
} catch (error) {
res. json({success: false, message: error . message} )
}
}

export const getBlogComments = async (req, res) =>{
try {
const {blogId } = req. body;
const comments = await Comment. find( {blog: blogId, isApproved: true} ) . sort
({createdAt: - 1});
res. json({success: true, comments})
} catch (error) {
res. json({success: false, message: error . message} )
}
}

export const generateContent=async(req,res)=>{
    try {
        const {prompt}=req.body;
        const content =await main(prompt+'Generate a blog content for this topic in simple text format')
        res.json({success:true,content})
    } catch (error) {
        res. json({success: false, message: error.message})
    }
}



export const getDashboardBlogs = async (req, res) => {
  try {
    const userId = req.user.id;
    const userEmail = req.user.email;

    // Check if the logged-in user is admin (by email stored in .env)
    if (userEmail === process.env.ADMIN_EMAIL) {
      const blogs = await Blog.find().sort({ createdAt: -1 });
      return res.json({ success: true, blogs });
    }

    // For regular user: show only their blogs
    const blogs = await Blog.find({ author: userId }).sort({ createdAt: -1 });
    res.json({ success: true, blogs });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to fetch blogs" });
  }
};


