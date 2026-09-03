import { dbConnect } from '@/lib/dbConnect';
import { CategoryModel } from '@/models/Category';

/**
 * Builds a lookup map of Category ID -> Category Name and Category Name -> Category Name from MongoDB.
 *
 * @usecase Resolves Category ObjectIds to human-readable category names across API routes, blog feed, and admin CMS.
 * @dependencies dbConnect, CategoryModel.
 * @returns {Promise<Map<string, string>>} Lookup map matching Category ObjectIds and names to readable string names.
 */
export async function getCategoryLookupMap(): Promise<Map<string, string>> {
  const map = new Map<string, string>();
  try {
    await dbConnect();
    const categories = await CategoryModel.find().lean();

    categories.forEach((cat: any) => {
      const idStr = cat._id ? cat._id.toString() : '';
      if (idStr) {
        map.set(idStr, cat.name);
      }
      if (cat.name) {
        map.set(cat.name, cat.name);
      }
    });
  } catch (err) {
    console.error('Error fetching categories in getCategoryLookupMap:', err);
  }

  return map;
}

/**
 * Formats raw category input (ObjectId or string) into a clean, human-readable Category name.
 *
 * @usecase Prevents raw Mongo ObjectId hex strings (e.g. 6a982af85ccfcd99b26c3bb0) from displaying in the UI.
 * @param {any} rawCategory Category string, ObjectId, or null/undefined.
 * @param {Map<string, string>} categoryMap Category lookup map.
 * @returns {string} Human-readable category name.
 */
export function resolveCategoryName(rawCategory: any, categoryMap: Map<string, string>): string {
  if (!rawCategory) return 'General';
  const str = rawCategory.toString().trim();
  if (categoryMap.has(str)) {
    return categoryMap.get(str)!;
  }
  // If it's a 24-character hexadecimal Mongo ObjectId that wasn't found in map, fallback to General
  if (/^[0-9a-fA-F]{24}$/.test(str)) {
    return 'General';
  }
  return str;
}
