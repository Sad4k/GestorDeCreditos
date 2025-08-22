const fs = require('fs');
const path = require('path');

const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken'); // Para manejar tokens de sesión
const { 
    Customer,
    Credit,
    CreditAdjustment,
    Payment,
    Supplier,
    SupplierPayment,
    DailySale,
    Setting
} = require('../models/data-model'); // Asegúrate de que el path sea correcto
const authenticateToken = require('../middlewares/authenticateToken'); 


const { getModel, getSequelize } = require('database-manager');

const sequelize = getSequelize();

// UTILIDAD
const findOr404 = async (model, id, res) => {
  const item = await model.findByPk(id);
  if (!item) return res.status(404).json({ error: 'No encontrado' });
  return item;
};

const router = express.Router();

// -------- CUSTOMERS --------
router.get('/customers', async (req, res) => {
  const customers = await Customer.findAll();
  res.json(customers.map(c => c.toJSON()));
});
router.get('/customers/:id', async (req, res) => {
  const item = await findOr404(Customer, req.params.id, res);
  if (item) res.json(item);
});

router.get('/customers/:id/credits', async (req, res) => {
  try {
    const { id } = req.params;
    const credits = await Credit.findAll({
      where: { customerId: id },
      include: { model: Customer, attributes: ['id', 'name'] } // opcional
    });
    res.json(credits);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al obtener los créditos del cliente' });
  }
});


router.post('/customers', async (req, res) => {
  res.json(await Customer.create(req.body));
});

router.put('/customers/:id', async (req, res) => {
  const item = await findOr404(Customer, req.params.id, res);
  if (item) {
    await item.update(req.body);
    res.json(item);
  }
});

router.delete('/customers/:id', async (req, res) => {
  const item = await findOr404(Customer, req.params.id, res);
  if (item) {
    await item.destroy();
    res.json({ success: true });
  }
});

router.delete('/customers/:id/with-data', async (req, res) => {
  const customerId = req.params.id;
  const transaction = await sequelize.transaction();

  try {
    const customer = await Customer.findByPk(customerId, { transaction });
    if (!customer) {
      await transaction.rollback();
      return res.status(404).json({ error: 'Cliente no encontrado' });
    }

    const credits = await Credit.findAll({ where: { customerId }, transaction });
    const creditIds = credits.map(c => c.id);
    const payments = await Payment.findAll({ where: { creditId: creditIds }, transaction });

    const backup = {
      deletedAt: new Date().toISOString(),
      customer: customer.toJSON(),
      credits: credits.map(c => c.toJSON()),
      payments: payments.map(p => p.toJSON())
    };

    const fs = require('fs');
    const path = require('path');
    const backupDir = path.join(__dirname, '../backups');
    if (!fs.existsSync(backupDir)) fs.mkdirSync(backupDir);
    const backupPath = path.join(backupDir, `customer-${customerId}-backup-${Date.now()}.json`);
    fs.writeFileSync(backupPath, JSON.stringify(backup, null, 2));

    await Payment.destroy({ where: { creditId: creditIds }, transaction });
    await Credit.destroy({ where: { customerId }, transaction });
    await customer.destroy({ transaction });

    await transaction.commit();

    res.json({ success: true, message: 'Cliente y datos asociados eliminados.', backupPath });
  } catch (error) {
    await transaction.rollback();
    console.error('Error al eliminar cliente:', error);
    res.status(500).json({ error: 'Error al eliminar cliente' });
  }
});


// -------- CREDITS --------
router.get('/credits', async (req, res) => {
  res.json(await Credit.findAll({ include: Customer }));
});

router.get('/credits/:id', async (req, res) => {
  const item = await findOr404(Credit, req.params.id, res);
  if (item) res.json(item);
});

router.get('/credits/:id/payments', async (req, res) => {
  try {
    const { id } = req.params;
    const payments = await Payment.findAll({
      where: { creditId: id },
      include: { model: Credit, attributes: ['id', 'amount' , 'status'] } // opcional
    });
    res.json(payments);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al obtener los créditos del cliente' });
  }
});

router.post('/credits', async (req, res) => {
  res.json(await Credit.create(req.body));
});

router.put('/credits/:id', async (req, res) => {
  const item = await findOr404(Credit, req.params.id, res);
  if (item) {
    await item.update(req.body);
    res.json(item);
  }
});

router.delete('/credits/:id', async (req, res) => {
  const creditId = req.params.id;
  const transaction = await sequelize.transaction();

  try {
    const credit = await Credit.findByPk(creditId, { transaction });

    if (!credit) {
      await transaction.rollback();
      return res.status(404).json({ error: 'Crédito no encontrado' });
    }

    // Eliminar pagos asociados si existen
    await Payment.destroy({ where: { creditId }, transaction });

    // Eliminar el crédito
    await credit.destroy({ transaction });

    await transaction.commit();

    res.json({ success: true, message: 'Crédito y pagos eliminados' });
  } catch (error) {
    await transaction.rollback();
    console.error('Error al eliminar crédito:', error);
    res.status(500).json({ error: 'Error al eliminar crédito y pagos' });
  }
});

// -------- PAYMENTS --------
router.get('/payments', async (req, res) => {
  res.json(await Payment.findAll({ include: Credit }));
});

router.get('/payments/:id', async (req, res) => {
  const item = await findOr404(Payment, req.params.id, res);
  if (item) res.json(item);
});

router.post('/payments', async (req, res) => {
  res.json(await Payment.create(req.body));
});

router.put('/payments/:id', async (req, res) => {
  const item = await findOr404(Payment, req.params.id, res);
  if (item) {
    await item.update(req.body);
    res.json(item);
  }
});

router.delete('/payments/:id', async (req, res) => {
  const item = await findOr404(Payment, req.params.id, res);
  if (item) {
    await item.destroy();
    res.json({ success: true });
  }
});

// -------- SUPPLIERS --------
router.get('/suppliers', async (req, res) => {
  res.json(await Supplier.findAll());
});

router.get('/suppliers/:id', async (req, res) => {
  const item = await findOr404(Supplier, req.params.id, res);
  if (item) res.json(item);
});


router.get('/suppliers/:id/payments', async (req, res) => {
  try {
    const { id } = req.params;
    const payments = await SupplierPayment.findAll({
      where: { supplierId: id },
      include: { model: Supplier, attributes: ['id', 'name'] } 
    });
    res.json(payments);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al obtener los pagos al supplidor' });
  }
});

router.post('/suppliers', async (req, res) => {
  res.json(await Supplier.create(req.body));
});

router.put('/suppliers/:id', async (req, res) => {
  const item = await findOr404(Supplier, req.params.id, res);
  if (item) {
    await item.update(req.body);
    res.json(item);
  }
});

router.delete('/suppliers/:id', async (req, res) => {
  const item = await findOr404(Supplier, req.params.id, res);
  if (item) {
    await item.destroy();
    res.json({ success: true });
  }
});

router.delete('/suppliers/:id/with-data', async (req, res) => {
  const supplierId = req.params.id;
  const transaction = await sequelize.transaction();

  try {
    const supplier = await Supplier.findByPk(supplierId, { transaction });
    if (!supplier) {
      await transaction.rollback();
      return res.status(404).json({ error: 'Suplidor no encontrado' });
    }

    const payments = await SupplierPayment.findAll({ where: { supplierId }, transaction });

    const backup = {
      deletedAt: new Date().toISOString(),
      supplier: supplier.toJSON(),
      payments: payments.map(p => p.toJSON())
    };

    const fs = require('fs');
    const path = require('path');
    const backupDir = path.join(__dirname, '../backups');
    if (!fs.existsSync(backupDir)) fs.mkdirSync(backupDir);
    const backupPath = path.join(backupDir, `supplier-${supplierId}-backup-${Date.now()}.json`);
    fs.writeFileSync(backupPath, JSON.stringify(backup, null, 2));

    await SupplierPayment.destroy({ where: { supplierId }, transaction });
    await supplier.destroy({ transaction });

    await transaction.commit();

    res.json({ success: true, message: 'Suplidor y pagos asociados eliminados.', backupPath });
  } catch (error) {
    await transaction.rollback();
    console.error('Error al eliminar suplidor:', error);
    res.status(500).json({ error: 'Error al eliminar suplidor' });
  }
});



// -------- SUPPLIER PAYMENTS --------
router.get('/supplier-payments', async (req, res) => {
  res.json(await SupplierPayment.findAll({ include: Supplier }));
});

router.get('/supplier-payments/:id', async (req, res) => {
  const item = await findOr404(SupplierPayment, req.params.id, res);
  if (item) res.json(item);
});

router.post('/supplier-payments', async (req, res) => {
  res.json(await SupplierPayment.create(req.body));
});

router.put('/supplier-payments/:id', async (req, res) => {
  const item = await findOr404(SupplierPayment, req.params.id, res);
  if (item) {
    await item.update(req.body);
    res.json(item);
  }
});

router.delete('/supplier-payments/:id', async (req, res) => {
  const item = await findOr404(SupplierPayment, req.params.id, res);
  if (item) {
    await item.destroy();
    res.json({ success: true });
  }
});

// -------- CREDIT ADJUSTMENTS --------
router.post('/credit-adjustments', async (req, res) => {
  try {
    const newAdjustment = await CreditAdjustment.create(req.body);
    res.status(201).json(newAdjustment);
  } catch (error) {
    console.error('Error creating credit adjustment:', error);
    res.status(500).json({ error: 'Error interno del servidor al crear el ajuste de crédito' });
  }
});

router.get('/credits/:creditId/adjustments', async (req, res) => {
  try {
    const { creditId } = req.params;
    // Find adjustments for a specific creditId
    const adjustments = await CreditAdjustment.findAll({
      where: { creditId: creditId },
      order: [['date', 'ASC']] // Or DESC, depending on how you want to display
    });
    res.json(adjustments);
  } catch (error) {
    console.error('Error fetching credit adjustments:', error);
    res.status(500).json({ error: 'Error interno del servidor al obtener los ajustes de crédito' });
  }
});

router.get('/credit-adjustments/:id', async (req, res) => {
    try {
        const item = await findOr404(CreditAdjustment, req.params.id, res);
        if (item) res.json(item);
    } catch (error) {
        console.error('Error fetching single credit adjustment:', error);
        res.status(500).json({ error: 'Error interno del servidor al obtener el ajuste de crédito' });
    }
});

// -------- DAILY SALES --------
router.get('/daily-sales', async (req, res) => {
  res.json(await DailySale.findAll());
});

router.get('/daily-sales/:id', async (req, res) => {
  const item = await findOr404(DailySale, req.params.id, res);
  if (item) res.json(item);
});

router.post('/daily-sales', async (req, res) => {
  res.json(await DailySale.create(req.body));
});

router.put('/daily-sales/:id', async (req, res) => {
  const item = await findOr404(DailySale, req.params.id, res);
  if (item) {
    await item.update(req.body);
    res.json(item);
  }
});

router.delete('/daily-sales/:id', async (req, res) => {
  const item = await findOr404(DailySale, req.params.id, res);
  if (item) {
    await item.destroy();
    res.json({ success: true });
  }
});

// -------- SETTINGS (key = primary key) --------
router.get('/settings', async (req, res) => {
  res.json(await Setting.findAll());
});

router.get('/settings/:key', async (req, res) => {
  const item = await Setting.findByPk(req.params.key);
  if (!item) return res.status(404).json({ error: 'No encontrado' });
  res.json(item);
});

router.post('/settings', async (req, res) => {
  const data = await Setting.upsert(req.body); // key: value
  res.json(data);
});

router.put('/settings/:key', async (req, res) => {
  const item = await Setting.findByPk(req.params.key);
  if (!item) return res.status(404).json({ error: 'No encontrado' });
  await item.update(req.body);
  res.json(item);
});

router.delete('/settings/:key', async (req, res) => {
  const item = await Setting.findByPk(req.params.key);
  if (!item) return res.status(404).json({ error: 'No encontrado' });
  await item.destroy();
  res.json({ success: true });
});


module.exports = router;
