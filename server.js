const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs/promises'); // version async
const app = express();
const port = 3000;

// ✅ Middleware généraux
app.use(cors());
app.use(express.json());

// ❌ Empêche le cache côté client
app.use((req, res, next) => {
  res.set('Cache-Control', 'no-store');
  next();
});

// ✅ Servir les images locales : http://IP:3000/images/nom_image.png
app.use('/images', express.static(path.join(__dirname, 'public/images')));

// ✅ Importer la route utilisateur
const usersRoute = require('./routes/users');
app.use('/api/users', usersRoute); // ex: /api/users/login

// ✅ Fonctions de lecture/écriture pour les livres
async function loadBooks() {
  const filePath = path.join(__dirname, 'books.json');
  console.log("📂 Lecture depuis :", filePath);
  const data = await fs.readFile(filePath, 'utf8');
  return JSON.parse(data);
}

async function saveBooks(data) {
  const filePath = path.join(__dirname, 'books.json');
  await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf8');
}

// ✅ GET /books : retourne tous les livres
app.get('/books', async (req, res) => {
  try {
    const books = await loadBooks();
    res.json(books);
  } catch (err) {
    console.error("❌ Erreur lors du chargement des livres :", err);
    res.status(500).json({ message: 'Erreur serveur lors du chargement des livres' });
  }
});

// ✅ POST /order : traiter une commande et mettre à jour les stocks
app.post('/order', async (req, res) => {
  const { items } = req.body;
  console.log("📥 Reçu une commande :", items);

  if (!Array.isArray(items)) {
    return res.status(400).json({ message: "'items' doit être un tableau" });
  }

  try {
    const currentBooks = await loadBooks();
    const updatedBooks = [...currentBooks];

    for (const item of items) {
      const book = updatedBooks.find(b => b.id === item.id);
      if (!book) {
        return res.status(404).json({ message: `Livre ID ${item.id} introuvable` });
      }
      if (book.quantity < item.quantity) {
        return res.status(400).json({ message: `Stock insuffisant pour : ${book.title}` });
      }
      book.quantity -= item.quantity;
    }

    await saveBooks(updatedBooks);
    console.log("✅ Stock mis à jour avec succès.");
    res.status(200).json({ message: "Commande validée. Stock mis à jour ✅" });
  } catch (err) {
    console.error("❌ Erreur lors de la mise à jour du stock :", err);
    res.status(500).json({ message: "Erreur serveur lors de la mise à jour du stock" });
  }
});

// ✅ Lancer le serveur
app.listen(port, '0.0.0.0', () => {
  console.log(`📚 API running on http://0.0.0.0:${port}/books`);
});




