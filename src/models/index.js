const EmailCode = require("./EmailCode.model");
const User = require("./User.model");

User.hasOne(EmailCode);
EmailCode.belongsTo(User);
