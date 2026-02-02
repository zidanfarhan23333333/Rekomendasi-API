require("dotenv").config();
const app = require("./src/app");

const PORT = process.env.PORT || 500;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
