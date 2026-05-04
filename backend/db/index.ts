import Database from "better-sqlite3";
import path from "path";
import fs from "fs";
import { seedDatabase } from "./seed.js";

const DB_DIR = path.join(process.cwd(), "database");
const DB_PATH = path.join(DB_DIR, "unishare.db");
const SCHEMA_PATH = path.join(process.cwd(), "backend", "db", "schema.sql");

fs.mkdirSync(DB_DIR, { recursive: true });

const db = new Database(DB_PATH);

db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = ON");

const schema = fs.readFileSync(SCHEMA_PATH, "utf-8");
db.exec(schema);

seedDatabase(db);

console.log(`[db] Connected → ${DB_PATH}`);

export default db;
