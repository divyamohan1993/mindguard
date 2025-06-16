mindguard/
├── server/                     ← Node.js / Express backend
│   ├── package.json
│   ├── server.js
│   ├── models.js
│   ├── config.js
│   └── migrations/              ← (optional) Sequelize migrations if needed
│
└── client/                     ← React frontend
    ├── package.json
    ├── public/
    │   └── index.html
    │
    └── src/
        ├── index.js
        ├── App.js
        ├── services/
        │   ├── api.js
        │   └── crypto.js
        │
        └── components/
            ├── Signup.js
            ├── Login.js
            ├── Journal.js
            ├── History.js
            └── Analysis.js
