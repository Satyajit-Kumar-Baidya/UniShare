import Database from "better-sqlite3";
import path from "path";
import fs from "fs";

const DB_PATH = path.join(process.cwd(), "unishare.db");
const SCHEMA_PATH = path.join(process.cwd(), "backend", "db", "schema.sql");

const db = new Database(DB_PATH);

db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = ON");

const schema = fs.readFileSync(SCHEMA_PATH, "utf-8");
db.exec(schema);

console.log(`[db] Connected → ${DB_PATH}`);

export default db;
