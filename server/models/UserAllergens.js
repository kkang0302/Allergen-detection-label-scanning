module.exports = (sequelize, DataTypes) => {
  const UserAllergens = sequelize.define("UserAllergens", {
    // id sẽ tự động được tạo
  });

  UserAllergens.associate = (models) => {
    UserAllergens.belongsTo(models.Users, {
      foreignKey: {
        allowNull: false,
        name: 'userId',
      },
      onDelete: 'CASCADE',
    });
    UserAllergens.belongsTo(models.Allergens, {
      foreignKey: {
        allowNull: false,
        name: 'allergenId',
      },
      onDelete: 'CASCADE',
    });
  };

  return UserAllergens;
};
