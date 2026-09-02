import { PostModel } from '../../src/models/Post';
import { CategoryModel } from '../../src/models/Category';
import { ApiKeyModel } from '../../src/models/ApiKey';

describe('MongoDB Mongoose Models & Validation (TDD Unit Tests)', () => {
  describe('PostModel Validation', () => {
    it('should validate a complete and valid Post document', async () => {
      const validPost = new PostModel({
        title: 'Understanding HbA1c Levels',
        slug: 'understanding-hba1c-levels',
        content: '<p>HbA1c measures your average blood sugar levels over the past 2-3 months.</p>',
        excerpt: 'Learn what your HbA1c numbers mean for diabetes care.',
        category: 'Education',
        tags: ['hba1c', 'monitoring', 'health'],
        status: 'published',
        seoTitle: 'Understanding HbA1c Levels | DiabetesCare PH',
        metaDescription: 'Comprehensive guide to HbA1c blood sugar tests.',
      });

      const err = await validPost.validate().catch((e) => e);
      expect(err).not.toBeInstanceOf(Error);
    });

    it('should fail validation when required fields title, content, or slug are missing', async () => {
      const invalidPost = new PostModel({
        category: 'Education',
      });

      const err = await invalidPost.validate().catch((e) => e);
      expect(err).toBeDefined();
      expect(err.errors.title).toBeDefined();
      expect(err.errors.slug).toBeDefined();
      expect(err.errors.content).toBeDefined();
    });

    it('should default status to draft if not specified', () => {
      const draftPost = new PostModel({
        title: 'Draft Post Title',
        slug: 'draft-post-title',
        content: 'Draft content placeholder.',
      });

      expect(draftPost.status).toBe('draft');
    });
  });

  describe('CategoryModel Validation', () => {
    it('should validate a valid category document', async () => {
      const category = new CategoryModel({
        name: 'Nutrition & Diet',
        slug: 'nutrition-and-diet',
        description: 'Low carb diets, glycemic index guidance, and diabetes meal planning.',
      });

      const err = await category.validate().catch((e) => e);
      expect(err).not.toBeInstanceOf(Error);
      expect(category.name).toBe('Nutrition & Diet');
    });

    it('should require category name and slug', async () => {
      const category = new CategoryModel({});
      const err = await category.validate().catch((e) => e);
      expect(err.errors.name).toBeDefined();
      expect(err.errors.slug).toBeDefined();
    });
  });

  describe('ApiKeyModel Validation', () => {
    it('should validate API Key model with default active state', async () => {
      const apiKey = new ApiKeyModel({
        key: 'sk_test_1234567890abcdef',
        name: 'AI Generator Automation Script',
      });

      const err = await apiKey.validate().catch((e) => e);
      expect(err).not.toBeInstanceOf(Error);
      expect(apiKey.active).toBe(true);
    });
  });
});
