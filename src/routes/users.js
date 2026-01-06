const express = require('express');
const router = express.Router();
const { User } = require('../../models');
const { authenticate, isAdmin } = require('../middleware/auth');
const { body, validationResult } = require('express-validator');

router.get('/', authenticate, isAdmin, async (req, res, next) => {
  try {
    const users = await User.findAll({
      attributes: ['id', 'name', 'email', 'role', 'createdAt', 'updatedAt'],
      order: [['createdAt', 'DESC']]
    });

    res.json({
      users,
      total: users.length
    });
  } catch (error) {
    next(error);
  }
});

router.put(
  '/:id/role',
  authenticate,
  isAdmin,
  [
    body('role')
      .isIn(['admin', 'user'])
      .withMessage('Role must be either admin or user')
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { id } = req.params;
      const { role } = req.body;

      const user = await User.findByPk(id);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      if (user.id === req.user.id) {
        return res.status(400).json({ error: 'You cannot change your own role' });
      }

      user.role = role;
      await user.save();

      res.json({
        message: 'User role updated successfully',
        user: user.toJSON()
      });
    } catch (error) {
      next(error);
    }
  }
);

router.get('/:id', authenticate, isAdmin, async (req, res, next) => {
  try {
    const { id } = req.params;

    const user = await User.findByPk(id, {
      attributes: ['id', 'name', 'email', 'role', 'createdAt', 'updatedAt']
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ user });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
