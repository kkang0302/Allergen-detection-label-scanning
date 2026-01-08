module.exports = (sequelize, DataTypes) => {
  const Allergens = sequelize.define("Allergens", {
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  });
  
  Allergens.associate = (models) => {
    // Sẽ liên kết với UserAllergens sau
  };

  return Allergens;
};
