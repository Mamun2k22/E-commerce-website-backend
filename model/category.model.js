import mongoose from 'mongoose';

const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  image: {
    type: String, // URL or path to the image
    required: true, // Set as required
  },
}, 
{ collection: 'categoriesname' }); // Explicitly set the collection name

const Category = mongoose.model("Category", categorySchema);
export default Category;
