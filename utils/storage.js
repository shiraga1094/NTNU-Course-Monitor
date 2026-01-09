import fs from "fs";
import { config } from "../config.js";

const DATA_DIR = config.paths.dataDir;
const SUB_FILE = config.paths.subscriptions;
const TMP_FILE = config.paths.tmp;

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

function nowString() {
  const d = new Date();
  const pad = n => String(n).padStart(2, "0");
  return (
    `${d.getFullYear()}-` +
    `${pad(d.getMonth() + 1)}-` +
    `${pad(d.getDate())} ` +
    `${pad(d.getHours())}:` +
    `${pad(d.getMinutes())}:` +
    `${pad(d.getSeconds())}`
  );
}

export function loadSubs() {
  if (!fs.existsSync(SUB_FILE)) return {};
  return JSON.parse(fs.readFileSync(SUB_FILE, "utf8"));
}

export function saveSubs(data) {
  fs.writeFileSync(SUB_FILE, JSON.stringify(data, null, 2));
}

export function loadTmp() {
  if (!fs.existsSync(TMP_FILE)) return {};
  return JSON.parse(fs.readFileSync(TMP_FILE, "utf8"));
}

export function saveTmp(data) {
  fs.writeFileSync(TMP_FILE, JSON.stringify(data, null, 2));
}

export function updateTmp(key, raw) {
  const tmp = loadTmp();
  tmp[key] = {
    lastFetchAt: nowString(),
    raw
  };
  saveTmp(tmp);
}
