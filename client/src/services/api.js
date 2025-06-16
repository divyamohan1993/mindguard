// client/src/services/api.js
import axios from "axios";

const API_BASE = "http://localhost:4000/api";

let token = null;

function setToken(t) {
  token = t;
  if (t) axios.defaults.headers.common["Authorization"] = `Bearer ${t}`;
  else delete axios.defaults.headers.common["Authorization"];
}

async function signup(username, password) {
  return axios.post(`${API_BASE}/signup`, { username, password });
}

async function login(username, password) {
  return axios.post(`${API_BASE}/login`, { username, password });
}

async function getProfile() {
  return axios.get(`${API_BASE}/profile`);
}

async function submitJournalEntry(encryptedText, encryptedVector) {
  return axios.post(`${API_BASE}/journal`, { encryptedText, encryptedVector });
}

async function getHistory() {
  return axios.get(`${API_BASE}/history`);
}

export default {
  setToken,
  signup,
  login,
  getProfile,
  submitJournalEntry,
  getHistory,
};
