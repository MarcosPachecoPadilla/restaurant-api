const express = require('express');
const { body, validationResult } = require('express-validator');

const app = express();
const PORT = 3000;

app.use(express.json());

// Request logging middleware
function requestLogger(req, res, next) {
  console.log(`${req.method} ${req.url}`);
  console.log('Timestamp:', new Date().toISOString());

  if (req.method === 'POST' || req.method === 'PUT') {
    console.log('Request body:', req.body);
  }

  next();
}

app.use(requestLogger);

// Data for the server
const menuItems = [
  {
    id: 1,
    name: "Classic Burger",
    description: "Beef patty with lettuce, tomato, and cheese on a sesame seed bun",
    price: 12.99,
    category: "entree",
    ingredients: ["beef", "lettuce", "tomato", "cheese", "bun"],
    available: true
  },
  {
    id: 2,
    name: "Chicken Caesar Salad",
    description: "Grilled chicken breast over romaine lettuce with parmesan and croutons",
    price: 11.50,
    category: "entree",
    ingredients: ["chicken", "romaine lettuce", "parmesan cheese", "croutons", "caesar dressing"],
    available: true
  },
  {
    id: 3,
    name: "Mozzarella Sticks",
    description: "Crispy breaded mozzarella served with marinara sauce",
    price: 8.99,
    category: "appetizer",
    ingredients: ["mozzarella cheese", "breadcrumbs", "marinara sauce"],
    available: true
  },
  {
    id: 4,
    name: "Chocolate Lava Cake",
    description: "Warm chocolate cake with molten center, served with vanilla ice cream",
    price: 7.99,
    category: "dessert",
    ingredients: ["chocolate", "flour", "eggs", "butter", "vanilla ice cream"],
    available: true
  },
  {
    id: 5,
    name: "Fresh Lemonade",
    description: "House-made lemonade with fresh lemons and mint",
    price: 3.99,
    category: "beverage",
    ingredients: ["lemons", "sugar", "water", "mint"],
    available: true
  },
  {
    id: 6,
    name: "Fish and Chips",
    description: "Beer-battered cod with seasoned fries and coleslaw",
    price: 14.99,
    category: "entree",
    ingredients: ["cod", "beer batter", "potatoes", "coleslaw", "tartar sauce"],
    available: false
  }
];

// Validation rules
const menuValidationRules = [
  body('name')
    .isString()
    .notEmpty()
    .isLength({ min: 3 }),

  body('description')
    .isString()
    .notEmpty()
    .isLength({ min: 10 }),

  body('price')
    .isFloat({ gt: 0 }),

  body('category')
    .isString()
    .isIn(['appetizer', 'entree', 'dessert', 'beverage']),

  body('ingredients')
    .isArray({ min: 1 }),

  body('available')
    .optional()
    .isBoolean()
];

// Validation middleware
function validateMenuItem(req, res, next) {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({
      errors: errors.array()
    });
  }

  next();
}

// GET all menu items
app.get('/api/menu', (req, res) => {
  res.status(200).json(menuItems);
});

// GET one menu item
app.get('/api/menu/:id', (req, res) => {
  const id = parseInt(req.params.id);

  const menuItem = menuItems.find(item => item.id === id);

  if (!menuItem) {
    return res.status(404).json({
      message: 'Menu item not found'
    });
  }

  res.status(200).json(menuItem);
});

// POST a new menu item
app.post('/api/menu', menuValidationRules, validateMenuItem, (req, res) => {
  const newMenuItem = {
    id: menuItems.length + 1,
    name: req.body.name,
    description: req.body.description,
    price: req.body.price,
    category: req.body.category,
    ingredients: req.body.ingredients,
    available: req.body.available !== undefined ? req.body.available : true
  };

  menuItems.push(newMenuItem);

  res.status(201).json(newMenuItem);
});

// PUT update a menu item
app.put('/api/menu/:id', menuValidationRules, validateMenuItem, (req, res) => {
  const id = parseInt(req.params.id);

  const menuItem = menuItems.find(item => item.id === id);

  if (!menuItem) {
    return res.status(404).json({
      message: 'Menu item not found'
    });
  }

  menuItem.name = req.body.name;
  menuItem.description = req.body.description;
  menuItem.price = req.body.price;
  menuItem.category = req.body.category;
  menuItem.ingredients = req.body.ingredients;
  menuItem.available = req.body.available !== undefined ? req.body.available : true;

  res.status(200).json(menuItem);
});

// DELETE a menu item
app.delete('/api/menu/:id', (req, res) => {
  const id = parseInt(req.params.id);

  const menuItemIndex = menuItems.findIndex(item => item.id === id);

  if (menuItemIndex === -1) {
    return res.status(404).json({
      message: 'Menu item not found'
    });
  }

  const deletedMenuItem = menuItems.splice(menuItemIndex, 1);

  res.status(200).json(deletedMenuItem[0]);
});

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

module.exports = app;