import jwt from 'jsonwebtoken'
import Blog from '../models/Blog.js';
import Comment from '../models/Comment.js';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';
// export const adminLogin=async(req,res)=>{
//     try{
//       const{email,password}=req.body;
//       if(email!==process.env.ADMIN_EMAIL||password!==process.env.ADMIN_PASSWORD){
//         return res.json({success:false,message:"Invalid Credentials"})
//       }
//       const token =jwt.sign({email},process.env.JWT_SECRET)
//       res.json({success:true,token})
//     }catch(error){
//          res.json({success:false,message:error.message})
//     }
// }
// export const adminLogin = async (req, res) => {
//   try {
//     const { email, password } = req.body;

//     // 1. Find user in DB
//     const existingUser = await User.findOne({ email });
//     if (!existingUser) {
//       return res.json({ success: false, message: "User not found" });
//     }

//     // 2. Compare hashed password
//     const isMatch = await bcrypt.compare(password, existingUser.password);
//     if (!isMatch) {
//       return res.json({ success: false, message: "Invalid credentials" });
//     }

//     // 3. Generate JWT
//     const token = jwt.sign({ id: existingUser._id }, process.env.JWT_SECRET, {
//       expiresIn: "7d",
//     });

//     res.json({ success: true, token,
//         user: {
//         name: existingUser.name,
//         email: existingUser.email,
//         id: existingUser._id
//       }
//      });
//   } catch (error) {
//     res.json({ success: false, message: error.message });
//   }
// }

export const adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if it's admin
    if (
      email === process.env.ADMIN_EMAIL &&
      password === process.env.ADMIN_PASSWORD
    ) {
      const token = jwt.sign({ email, isAdmin: true }, process.env.JWT_SECRET, {
        expiresIn: "7d",
      });

      return res.json({
        success: true,
        token,
        user: {
          name: "Admin",
          email,
          isAdmin: true,
        },
      });
    }

    // Regular user
    const existingUser = await User.findOne({ email });
    if (!existingUser) {
      return res.json({ success: false, message: "User not found" });
    }

    const isMatch = await bcrypt.compare(password, existingUser.password);
    if (!isMatch) {
      return res.json({ success: false, message: "Invalid credentials" });
    }

    const token = jwt.sign({ id: existingUser._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    res.json({
      success: true,
      token,
      user: {
        name: existingUser.name,
        email: existingUser.email,
        id: existingUser._id,
        isAdmin: false,
      },
    });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};


// export const getAllBlogsAdmin = async (req, res) =>{
// try {
// const blogs = await Blog. find( { } ) . sort( {createdAt: - 1});
// res. json({success: true, blogs} )
// } catch (error) {
// res. json({success: false, message: error . message} )
// }
// }
export const getAllBlogsAdmin = async (req, res) => {
  try {
    const isAdmin = req.user?.isAdmin;
    const userId = req.user?.id;

    let blogs;

    if (isAdmin) {
      blogs = await Blog.find({}).sort({ createdAt: -1 });
    } else {
      blogs = await Blog.find({ author: userId }).sort({ createdAt: -1 });
    }

    res.json({ success: true, blogs });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
}

export const getAllComments = async (req, res) =>{
try {
const comments = await Comment . find( { } ) . populate("blog") . sort ( {createdAt:
-1})
res. json({success: true, comments} )
} catch (error) {
res. json({success: false, message: error . message} )
}
}

// export const getDashboard = async (req, res) =>{
// try {
// const recentBlogs = await Blog. find( { } ) . sort({ createdAt: - 1 }) . limit (5);
// const blogs = await Blog. countDocuments ();
// const comments = await Comment.countDocuments ()
// const drafts = await Blog. countDocuments( {isPublished: false})
// const dashboardData = {
// blogs, comments, drafts, recentBlogs
// }
// res. json({success: true, dashboardData} )
// } catch (error) {
// res. json({success: false, message: error . message} )
// }
// }
export const getDashboard = async (req, res) => {
  try {
    const userId = req.user.id;
    const userEmail = req.user.email;

    // Admin check
    const isAdmin = userEmail === process.env.ADMIN_EMAIL;

    // If admin, skip DB lookup
    if (isAdmin) {
      const recentBlogs = await Blog.find().sort({ createdAt: -1 }).limit(5);
      const blogsCount = await Blog.countDocuments();
      const draftsCount = await Blog.countDocuments({ isPublished: false });
      const commentsCount = await Comment.countDocuments();

      return res.json({
        success: true,
        dashboardData: {
          blogs: blogsCount,
          drafts: draftsCount,
          comments: commentsCount,
          recentBlogs,
        },
      });
    }

    // Normal user: lookup in DB
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const filter = { author: userId };

    const recentBlogs = await Blog.find(filter).sort({ createdAt: -1 }).limit(5);
    const blogsCount = await Blog.countDocuments(filter);
    const draftsCount = await Blog.countDocuments({ ...filter, isPublished: false });
    const commentsCount = await Comment.countDocuments({ user: userId });

    res.json({
      success: true,
      dashboardData: {
        blogs: blogsCount,
        drafts: draftsCount,
        comments: commentsCount,
        recentBlogs,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


export const deleteCommentById = async (req, res) =>{
try {
const {id} = req. body;
await Comment. findByIdAndDelete(id);
res. json({success: true, message: "Comment deleted successfully" })
} catch (error) {
res. json({success: false, message: error . message} )
}
}

export const approveCommentById = async (req, res) =>{
try {
const {id} = req.body;
await Comment. findByIdAndUpdate(id, {isApproved: true} );
res. json({success: true, message: "Comment approved successfully" })
} catch (error) {
res. json({success: false, message: error . message})
}
}