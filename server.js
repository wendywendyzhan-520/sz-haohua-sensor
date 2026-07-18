const express = require('express');
const fs = require('fs');
const path = require('path');
const { body, validationResult } = require('express-validator');

const app = express();
const PORT = process.env.PORT || 3099;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Load product data
const productsData = JSON.parse(fs.readFileSync(path.join(__dirname, 'data', 'products.json'), 'utf8'));

// ====== API Routes ======

// Get all product categories
app.get('/api/categories', (req, res) => {
  const categories = productsData.categories.map(cat => ({
    id: cat.id,
    name: cat.name,
    description: cat.description,
    image: cat.image,
    productCount: cat.products.length
  }));
  res.json(categories);
});

// Get products by category
app.get('/api/categories/:categoryId/products', (req, res) => {
  const category = productsData.categories.find(c => c.id === req.params.categoryId);
  if (!category) return res.status(404).json({ error: 'Category not found' });
  res.json(category.products);
});

// Get single product
app.get('/api/products/:productId', (req, res) => {
  for (const cat of productsData.categories) {
    const product = cat.products.find(p => p.id === req.params.productId);
    if (product) return res.json({ ...product, categoryName: cat.name, categoryId: cat.id });
  }
  res.status(404).json({ error: 'Product not found' });
});

// Get all products (for search)
app.get('/api/products', (req, res) => {
  const allProducts = [];
  for (const cat of productsData.categories) {
    cat.products.forEach(p => allProducts.push({ ...p, category: cat.name, categoryId: cat.id }));
  }
  // Optional search query
  const { q } = req.query;
  if (q) {
    const qLower = q.toLowerCase();
    return res.json(allProducts.filter(p =>
      p.name.toLowerCase().includes(qLower) ||
      p.model.toLowerCase().includes(qLower) ||
      p.description.toLowerCase().includes(qLower)
    ));
  }
  res.json(allProducts);
});

// Get company info
app.get('/api/company', (req, res) => res.json(productsData.company));

// Get certifications
app.get('/api/certifications', (req, res) => res.json(productsData.certifications));

// Get hero slides
app.get('/api/hero', (req, res) => res.json(productsData.heroSlides));

// Submit inquiry / contact form
app.post('/api/inquiry', [
  body('name').trim().isLength({ min: 2 }).withMessage('Name must be at least 2 characters'),
  body('email').isEmail().withMessage('Please provide a valid email address'),
  body('message').trim().isLength({ min: 10 }).withMessage('Message must be at least 10 characters'),
  body('company').optional().trim(),
  body('phone').optional().trim(),
  body('product').optional().trim(),
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  const inquiry = {
    id: `INQ-${Date.now()}`,
    ...req.body,
    submittedAt: new Date().toISOString(),
    status: 'new'
  };

  // Save to local file (replace with email/db in production)
  const inquiriesDir = path.join(__dirname, 'data', 'inquiries');
  if (!fs.existsSync(inquiriesDir)) fs.mkdirSync(inquiriesDir, { recursive: true });
  fs.writeFileSync(
    path.join(inquiriesDir, `${inquiry.id}.json`),
    JSON.stringify(inquiry, null, 2),
    'utf8'
  );

  console.log(`[Inquiry] New inquiry received: ${inquiry.id} from ${inquiry.name} <${inquiry.email}>`);

  res.json({
    success: true,
    message: 'Thank you for your inquiry! Our sales team will contact you within 24 hours.',
    inquiryId: inquiry.id
  });
});

// ====== Page Routes ======
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/products', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'products.html'));
});

app.get('/about', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'about.html'));
});

app.get('/contact', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'contact.html'));
});

app.listen(PORT, () => {
  console.log(`\n  SenSense Instruments Website`);
  console.log(`  ===========================`);
  console.log(`  Local:   http://localhost:${PORT}`);
  console.log(`  Network: http://0.0.0.0:${PORT}\n`);
});
