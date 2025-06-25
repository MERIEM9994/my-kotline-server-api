const express = require('express');
const cors = require('cors');
const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());

// Serve les fichiers statiques dans public/images via l'URL /images
app.use('/images', express.static('public/images'));

const books = require('./books.json');

app.get('/books', (req, res) => {
  res.json(books);
});

app.listen(port, () => {
  console.log(`📚 API running on http://localhost:${port}/books`);
});

