import bcrypt from "bcryptjs";
const SALT_ROUNDS = 12;
export function hashPassword(password) {
    return bcrypt.hash(password, SALT_ROUNDS);
}
export function verifyPassword(password, hash) {
    return bcrypt.compare(password, hash);
}
export function isPasswordValid(password) {
    return typeof password === "string" && password.length >= 8;
}
