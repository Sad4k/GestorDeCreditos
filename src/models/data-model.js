const { DataTypes } = require('sequelize');
const dbManager = require('database-manager'); 
const bcrypt = require('bcrypt');

const User = dbManager.defineModel('User', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.STRING, allowNull: false },
  email: { type: DataTypes.STRING, allowNull: false, unique: true },
  phone: { type: DataTypes.STRING, allowNull: false },
  icon: { type: DataTypes.STRING },
  password: { type: DataTypes.STRING, allowNull: false },
  access: { type: DataTypes.STRING, allowNull: false }, 
  establishment: { type: DataTypes.STRING }
}, {
  hooks: {
    beforeCreate: async (user) => {
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(user.password, salt);
    }
  }
});

// Modelo para Aplicaciones
// MODELOS SEQUELIZE COMPLETOS

const Customer = dbManager.defineModel('Customer', {
  id: { type: DataTypes.STRING, primaryKey: true },
  name: { type: DataTypes.STRING },
  phone: { type: DataTypes.STRING },
  address: { type: DataTypes.STRING }
});

const Credit = dbManager.defineModel('Credit', {
  id: { type: DataTypes.STRING, primaryKey: true },
  customerId: {
    type: DataTypes.STRING,
    references: {
      model: 'Customers',
      key: 'id'
    }
  },
  amount: { type: DataTypes.REAL },
  date: { type: DataTypes.STRING },
  status: { type: DataTypes.STRING }
});

const CreditAdjustment = dbManager.defineModel('CreditAdjustment', {
  id: { type: DataTypes.STRING, primaryKey: true },
  creditId: { 
    type: DataTypes.STRING,
    references: {
      model: 'Credits', 
      key: 'id'
    }
  },
  amount: { type: DataTypes.REAL }, 
  date: { type: DataTypes.STRING },
  type: { type: DataTypes.STRING }, 
  notes: { type: DataTypes.STRING, allowNull: true } 
});

const Payment = dbManager.defineModel('Payment', {
  id: { type: DataTypes.STRING, primaryKey: true },
  creditId: {
    type: DataTypes.STRING,
    references: {
      model: 'Credits',
      key: 'id'
    }
  },
  amount: { type: DataTypes.REAL },
  date: { type: DataTypes.STRING }
});

const Supplier = dbManager.defineModel('Supplier', {
  id: { type: DataTypes.STRING, primaryKey: true },
  name: { type: DataTypes.STRING },
  phone: { type: DataTypes.STRING },
  email: { type: DataTypes.STRING },
  address: { type: DataTypes.STRING },
  notes: { type: DataTypes.TEXT }
});

const SupplierPayment = dbManager.defineModel('SupplierPayment', {
  id: { type: DataTypes.STRING, primaryKey: true },
  supplierId: {
    type: DataTypes.STRING,
    references: {
      model: 'Suppliers',
      key: 'id'
    }
  },
  amount: { type: DataTypes.REAL },
  date: { type: DataTypes.STRING },
  notes: { type: DataTypes.TEXT }
});

const DailySale = dbManager.defineModel('DailySale', {
  id: { type: DataTypes.STRING, primaryKey: true },
  date: { type: DataTypes.STRING },
  amount: { type: DataTypes.REAL },
  notes: { type: DataTypes.TEXT }
});

const Setting = dbManager.defineModel('Setting', {
  key: { type: DataTypes.STRING, primaryKey: true },
  value: { type: DataTypes.TEXT }
});

// RELACIONES
Customer.hasMany(Credit, { foreignKey: 'customerId' });
Credit.belongsTo(Customer, { foreignKey: 'customerId' });

Credit.hasMany(Payment, { foreignKey: 'creditId' });
Payment.belongsTo(Credit, { foreignKey: 'creditId' });

Supplier.hasMany(SupplierPayment, { foreignKey: 'supplierId' });
SupplierPayment.belongsTo(Supplier, { foreignKey: 'supplierId' });

Credit.hasMany(CreditAdjustment, { foreignKey: 'creditId', as: 'adjustments' });
CreditAdjustment.belongsTo(Credit, { foreignKey: 'creditId', as: 'credit' }); // Optional: if you need to access the credit from an adjustment



async function createRootUser() {
  try {
    // Verifica si el usuario root ya existe
    const existingUser = await User.findOne({ where: { email: 'admin@example.com' } });
    
    if (!existingUser) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('admin123', salt);

      // Crear el usuario root
      const newUser = await User.create({
        name: 'Admin',
        email: 'admin@example.com',
        phone: '809809809',
        password: hashedPassword,
        access: 'admin',
        establishment: 'Oficina Central'
      });

    } else {
      console.log('El usuario root ya existe.');
    }
  } catch (error) {
    console.error('Error al crear usuario root:', error);
  }
}

// Sincronizamos la base de datos y agregamos datos iniciales
(async () => {
  await dbManager.getDB().sync({ force: false });  // Resetea la base de datos antes de agregar datos
  
  // Crear el usuario root si no existe
  await createRootUser();

  

  
})();

// EXPORTAR MODELOS
module.exports = {
  User,
  Customer,
  Credit,
  CreditAdjustment, 
  Payment,
  Supplier,
  SupplierPayment,
  DailySale,
  Setting
};