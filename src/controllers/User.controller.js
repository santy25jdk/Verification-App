const catchError = require("../utils/catchError");
const User = require("../models/User.model");
const bcrypt = require("bcrypt");
const sendEmail = require("../utils/sendEmail");
const EmailCode = require("../models/EmailCode.model");
const jwt = require("jsonwebtoken");

const getAll = catchError(async (req, res) => {
  const users = await User.findAll();
  return res.json(users);
});

const create = catchError(async (req, res) => {
  const { firstName, lastName, country, image, email, password, frontBaseUrl } =
    req.body;
  const hashedPassword = await bcrypt.hash(password, 10);
  const user = await User.create({
    firstName,
    lastName,
    country,
    image,
    email,
    password: hashedPassword,
  });
  const code = require("crypto").randomBytes(32).toString("hex");
  const link = `${frontBaseUrl}/verify_email/${code}`;
  await sendEmail({
    to: email,
    subject: "Verificate email for user app",
    html: `
    <h1>Hello ${firstName} ${lastName}</h1>
    <p>Verify your account clicking this link</p>
    <a href="${link}" target= "_blank">${link}</a>
    <h3>Thank you</h3>
    `,
  });
  await EmailCode.create({ code, userId: user.id });

  return res.status(201).json(user);
});

const getOne = catchError(async (req, res) => {
  const { id } = req.params;
  const user = await User.findByPk(id);
  if (!user) return res.sendStatus(404);
  return res.json(user);
});

const remove = catchError(async (req, res) => {
  const { id } = req.params;
  await User.destroy({ where: { id } });
  return res.sendStatus(204);
});

const update = catchError(async (req, res) => {
  const { id } = req.params;
  const user = await User.update(req.body, {
    where: { id },
    returning: true,
  });
  if (user[0] === 0) return res.sendStatus(404);
  return res.json(user[1][0]);
});

const verifyCode = catchError(async (req, res) => {
  const { code } = req.params;
  const codeFound = await EmailCode.findOne({ where: { code } });
  if (!codeFound) return res.status(401).json({ message: "Invalid code" });
  const user = await User.update(
    { isVerified: true },
    { where: { id: codeFound.userId }, returning: true }
  );
  await codeFound.destroy();
  return res.json(user);
});

const login = catchError(async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ where: { email } });
  if (!user) return res.status(401).json({ message: "Invalid credentials" });
  const isValid = await bcrypt.compare(password, user.password);
  if (!isValid) return res.status(401).json({ message: "Invalid credentials" });
  if (!user.isVerified)
    return res.status(401).json({ message: "Invalid credentials" });

  const token = jwt.sign({ user }, process.env.TOKEN_SECRET, {
    expiresIn: "1d",
  });

  return res.json({ user, token });
});

const getLoggedUser = catchError(async (req, res) => {
  const user = req.user;
  return res.json(user);
});

module.exports = {
  getAll,
  create,
  getOne,
  remove,
  update,
  verifyCode,
  login,
  getLoggedUser,
};
