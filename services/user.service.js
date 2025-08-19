import bcrypt from "bcryptjs";
import User from "../models/user.model.js";

export const createUser = async ({
  fullname,
  email,
  password,
  phoneNumber,
  role,
}) => {
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  const user = new User({
    fullname,
    email,
    password: hashedPassword,
    phoneNumber,
    role,
  });
  await user.save();

  return user;
};

export const findUserByEmail = async (email) => {
  return User.findOne({ email });
};

export const validatePassword = async (inputPassword, hashedPassword) => {
  return bcrypt.compare(inputPassword, hashedPassword);
};
