const express = require('express');
const app = express();
const cors = require('cors');

app.use(express.json());
app.use(cors());

const db = require('./models')

//Routers
const allergenRouter = require('./routes/Allergens');
app.use("/allergens", allergenRouter);
const userAllergensRouter = require('./routes/UserAllergens');
app.use("/userAllergens", userAllergensRouter);
const usersRouter = require('./routes/Users');
app.use("/auth", usersRouter);

db.sequelize.sync().then(() => {
  app.listen(3001, () => {
    console.log('Server is running on http://localhost:3001');
  });
});