## 1 How to Run the MVP Locally

### 1.1 Prerequisites

* **Node.js** (v16+ recommended) and **npm** on your machine
* **Git** (to clone or copy code)
* (Optional) any code editor (VS Code, WebStorm, etc.)

### 1.2 Clone & Install

```bash
# 1. Clone the repo (or copy all files into a folder)
git clone https://github.com/your-username/mindguard-mvp.git
cd mindguard-mvp

# 2. Backend setup
cd server
npm install

# 3. Frontend setup (in a NEW terminal window/tab)
cd ../client
npm install
```

### 1.3 Configure Environment Variables (Backend)

In `mindguard-mvp/server/.env`, create:

```
JWT_SECRET=this_should_be_a_very_long_random_string
AES_KEY_SECRET=this_should_be_another_random_string
```

(You can copy the ones from above; but in production, generate truly random secrets.)

### 1.4 Start Backend

```bash
cd mindguard-mvp/server
npm run dev
```

* This starts Express on **port 4000** ([http://localhost:4000](http://localhost:4000)).
* On first run, it will create `database.sqlite` and sync the schema.

### 1.5 Start Frontend

In a separate terminal:

```bash
cd mindguard-mvp/client
npm start
```

* This starts React on **port 3000** ([http://localhost:3000](http://localhost:3000)).
* By default, the React app’s `package.json` has a proxy setting to “[http://localhost:4000”](http://localhost:4000”), so any `/api/…` calls go to the Node server.

### 1.6 Test the Flow

1. Open `http://localhost:3000` in your browser.
2. Click **Signup** → choose a username (e.g. “alice”) and password (≥ 6 chars).

   * On success, the app **auto‐logs in**.
3. You now have a valid JWT in `localStorage["token"]` and an AES key in `localStorage["aesKey"]`.
4. Navigate to **Journal** → type something (“I feel sad today”), check any tags (e.g. “-anxious-” or “-hopeless-”), click **Submit Entry**.

   * The client AES‐encrypts both the free text and the JSON vector, then `POST /api/journal`.
   * The server stores only ciphertexts in `database.sqlite`.
5. Go to **History** → you should see your plaintext entry and selected tags. How?

   * The client fetched all entries (`GET /api/history`), AES‐decrypted them locally, and displayed them.
6. Go to **Analysis** → the client fetches all encrypted vectors, decrypts them, sums weights, and shows a risk score.

   * If the combined score ≥ 10, you’ll see a “Crisis Alert” banner. Otherwise, “All good for now.”
