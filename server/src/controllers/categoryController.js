import prisma from '../config/prisma.js';

export const categoryController = {
  async getAllCategories(req, res, next) {
    try {
      const categories = await prisma.category.findMany({
        include: {
          _count: {
            select: { products: true },
          },
        },
        orderBy: { name: 'asc' },
      });

      const formatted = categories.map((c) => ({
        id: c.id,
        name: c.name,
        slug: c.slug,
        description: c.description,
        imageUrl: c.imageUrl,
        productCount: c._count.products,
      }));

      return res.json({
        success: true,
        categories: formatted,
      });
    } catch (err) {
      next(err);
    }
  },

  async getCategoryBySlug(req, res, next) {
    try {
      const { slug } = req.params;
      const category = await prisma.category.findUnique({
        where: { slug },
        include: {
          _count: {
            select: { products: true },
          },
        },
      });

      if (!category) {
        return res.status(404).json({
          success: false,
          message: 'Category not found',
        });
      }

      return res.json({
        success: true,
        category: {
          ...category,
          productCount: category._count.products,
        },
      });
    } catch (err) {
      next(err);
    }
  },
};
