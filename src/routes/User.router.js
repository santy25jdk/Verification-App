const {
  getAll,
  create,
  getOne,
  remove,
  update,
  verifyCode,
  login,
  getLoggedUser,
} = require("../controllers/User.controller");
const express = require("express");
const verifyJWT = require("../utils/verifyJWT");

const UserRouter = express.Router();

UserRouter.route("/").get(verifyJWT, getAll).post(create);

UserRouter.route("/verify/:code").get(verifyCode);

UserRouter.route("/login").post(login);

UserRouter.route("/me").get(verifyJWT, getLoggedUser);

UserRouter.route("/:id")
  .get(verifyJWT, getOne)
  .delete(verifyJWT, remove)
  .put(verifyJWT, update);

module.exports = UserRouter;
