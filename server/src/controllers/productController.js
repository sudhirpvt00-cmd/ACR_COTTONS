import prisma from '../config/prisma.js';

function parseProduct(p) {
  if (!p) return null;
  let images = [];
  try {
    images = typeof p.images === 'string' ? JSON.parse(p.images) : p.images;
  } catch {
    images = [p.images];
  }

  let sizes = [];
  try {
    sizes = typeof p.sizes === 'string' ? JSON.parse(p.sizes) : p.sizes;
  } catch {
    sizes = p.sizes ? [p.sizes] : [];
  }

  return {
    ...p,
    images: Array.isArray(images) ? images : [],
    sizes: Array.isArray(sizes) ? sizes : [],
  };
}

export const productController = {
  async getProducts(req, res, next) {
    try {
      const {
        category,
        search,
        minPrice,
        maxPrice,
        fabric,
        color,
        isFeatured,
        isNewArrival,
        sort = 'newest',
        page = 1,
        limit = 12,
      } = req.query;

      const pageNum = Math.max(1, parseInt(page, 10) || 1);
      const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10) || 12));
      const skip = (pageNum - 1) * limitNum;

      const where = {};

      // Category filter
      if (category && category !== 'all') {
        where.category = {
          slug: category,
        };
      }

      // Full text search
      if (search && search.trim()) {
        const searchTerm = search.trim();
        where.OR = [
          { title: { contains: searchTerm } },
          { description: { contains: searchTerm } },
          { fabric: { contains: searchTerm } },
          { color: { contains: searchTerm } },
        ];
      }

      // Price range
      if (minPrice || maxPrice) {
        where.price = {};
        if (minPrice) where.price.gte = parseFloat(minPrice);
        if (maxPrice) where.price.lte = parseFloat(maxPrice);
      }

      // Fabric filter
      if (fabric && fabric !== 'all') {
        where.fabric = { contains: fabric };
      }

      // Color filter
      if (color && color !== 'all') {
        where.color = { contains: color };
      }

      // Boolean filters
      if (isFeatured === 'true') where.isFeatured = true;
      if (isNewArrival === 'true') where.isNewArrival = true;

      // Sorting
      let orderBy = { createdAt: 'desc' };
      if (sort === 'price_asc') orderBy = { price: 'asc' };
      else if (sort === 'price_desc') orderBy = { price: 'desc' };
      else if (sort === 'newest') orderBy = { createdAt: 'desc' };

      const [products, totalCount, allProducts] = await Promise.all([
        prisma.product.findMany({
          where,
          include: { category: true },
          orderBy,
          skip,
          take: limitNum,
        }),
        prisma.product.count({ where }),
        // Quick query to extract unique fabrics and colors for filter facets
        prisma.product.findMany({
          select: { fabric: true, color: true, price: true },
        }),
      ]);

      // Extract unique facet values
      const fabrics = Array.from(
        new Set(allProducts.map((p) => p.fabric).filter(Boolean))
      );
      const colors = Array.from(
        new Set(allProducts.map((p) => p.color).filter(Boolean))
      );
      const minAvailablePrice = Math.min(...allProducts.map((p) => p.price), 0);
      const maxAvailablePrice = Math.max(...allProducts.map((p) => p.price), 25000);

      return res.json({
        success: true,
        products: products.map(parseProduct),
        pagination: {
          total: totalCount,
          page: pageNum,
          limit: limitNum,
          totalPages: Math.ceil(totalCount / limitNum) || 1,
        },
        facets: {
          fabrics,
          colors,
          priceRange: { min: minAvailablePrice, max: maxAvailablePrice },
        },
      });
    } catch (err) {
      next(err);
    }
  },

  async getSuggestions(req, res, next) {
    try {
      const { q } = req.query;
      if (!q || !q.trim()) {
        return res.json({ success: true, suggestions: [], categories: [] });
      }

      const query = q.trim();

      const [products, categories] = await Promise.all([
        prisma.product.findMany({
          where: {
            OR: [
              { title: { contains: query } },
              { fabric: { contains: query } },
            ],
          },
          select: {
            id: true,
            title: true,
            slug: true,
            price: true,
            images: true,
            category: { select: { name: true, slug: true } },
          },
          take: 6,
        }),
        prisma.category.findMany({
          where: {
            name: { contains: query },
          },
          select: { id: true, name: true, slug: true },
          take: 3,
        }),
      ]);

      return res.json({
        success: true,
        suggestions: products.map(parseProduct),
        categories,
      });
    } catch (err) {
      next(err);
    }
  },

  async getProductBySlug(req, res, next) {
    try {
      const { slug } = req.params;

      const product = await prisma.product.findUnique({
        where: { slug },
        include: {
          category: true,
        },
      });

      if (!product) {
        return res.status(404).json({
          success: false,
          message: 'Product not found',
        });
      }

      // Fetch 4 related products from the same category
      const related = await prisma.product.findMany({
        where: {
          categoryId: product.categoryId,
          NOT: { id: product.id },
        },
        include: { category: true },
        take: 4,
      });

      return res.json({
        success: true,
        product: parseProduct(product),
        related: related.map(parseProduct),
      });
    } catch (err) {
      next(err);
    }
  },
};
