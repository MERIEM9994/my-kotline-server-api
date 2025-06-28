const express = require('express');
const fs = require('fs');
const path = require('path');
const router = express.Router();

const usersPath = path.resolve(__dirname, '../models/users.json');

// Charger les utilisateurs
function loadUsers() {
  return JSON.parse(fs.readFileSync(usersPath, 'utf8'));
}

// Sauvegarder les utilisateurs
function saveUsers(data) {
  fs.writeFileSync(usersPath, JSON.stringify(data, null, 2), 'utf8');
}

// ✅ Authentification
router.post('/login', (req, res) => {
  const { username, password } = req.body;
  const users = loadUsers();
  const user = users.find(u => u.username === username && u.password === password);
  
  if (!user) {
    return res.status(401).json({ message: "Identifiants invalides" });
  }

  res.json({
    message: "Connexion réussie",
    userId: user.id,
    role: user.role,
    username: user.username,
    address: user.address
  });
});

// ✅ Inscription
router.post('/register', (req, res) => {
  const { username, password, email, address, role } = req.body;
  const users = loadUsers();

  if (users.find(u => u.username === username)) {
    return res.status(400).json({ message: "Nom d'utilisateur déjà utilisé" });
  }

  const newUser = {
    id: Date.now(),
    username,
    password,
    email,
    address,
    role: role || "client",
    preferences: [],
    token: ""
  };

  users.push(newUser);
  saveUsers(users);

  res.status(201).json({ message: "Utilisateur inscrit avec succès", userId: newUser.id });
});

// (plus tard) ✅ Mise à jour profil, adresse, préférences...

module.exports = router;
