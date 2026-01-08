module.exports = (sequelize, DataTypes) => {
  const Users = sequelize.define("Users", {
    username: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    scannedLabels: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: [],
    },
  });

  Users.associate = (models) => {
  Users.belongsToMany(models.Allergens, {
    through: models.UserAllergens,
    foreignKey: 'userId',
    otherKey: 'allergenId'
  });
};
  return Users;
};
