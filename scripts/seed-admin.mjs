import crypto from "node:crypto";

const password = process.env.MUSE_ADMIN_PASSWORD;
if (!password) throw new Error("Set MUSE_ADMIN_PASSWORD in the shell; it is never read from a committed file.");
const salt = crypto.randomBytes(16);
const derived = crypto.pbkdf2Sync(password, salt, 100000, 32, "sha256");
console.log(`INSERT INTO users (id, email, password_hash, role, full_name) VALUES ('admin', 'admin@muse.com', 'pbkdf2_sha256$100000$${salt.toString("base64")}$${derived.toString("base64")}', 'admin', 'MUSE Administrator') ON CONFLICT(email) DO NOTHING;`);
