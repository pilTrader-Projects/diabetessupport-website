import mongoose, { Schema, Model } from 'mongoose';
import { ICategory } from '../types/blog';

/**
 * Mongoose Schema definition for Article Categories.
 *
 * @usecase Defines name, unique slug, and description for grouping blog articles.
 * @dependencies mongoose, ICategory domain interface.
 */
const CategorySchema = new Schema<ICategory>(
  {
    name: {
      type: String,
      required: [true, 'Category name is required'],
      trim: true,
    },
    slug: {
      type: String,
      required: [true, 'Category slug is required'],
      unique: true,
      trim: true,
      lowercase: true,
    },
    description: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

/**
 * Exported Mongoose Category Model instance.
 *
 * @usecase Provides CRUD operations for article category management in MongoDB.
 * @dependencies mongoose.models, CategorySchema.
 * @returns {Model<ICategory>} Compiled or cached Mongoose Model for Category documents.
 */
export const CategoryModel: Model<ICategory> =
  mongoose.models.Category || mongoose.model<ICategory>('Category', CategorySchema);
