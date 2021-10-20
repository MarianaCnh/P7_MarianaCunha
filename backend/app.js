const express = require('express');

//pour gérer les images
const path = require('path');

//contre les injections
var helmet = require('helmet');

const rateLimit = require("express-rate-limit"); //rateLimit À utiliser pour limiter les demandes répétées à l'API pour la réinitialisation de mot de passe.

const saucesRoutes = require('./routes/sauces');
const userRoutes = require('./routes/user');

const app = express();

const limiteur = rateLimit({
  windowMs: 15 * 60 * 1000,                       // 15 minutes
  max: 100,                                       // limite chaque IP à 3 requêtes par fenêtre
  message: "Vous avez été bloqué parce que vous vous êtes trompé 3 fois. Réessayer dans 15 minutes !"
});

app.use(limiteur);

mongoose.connect(process.env.DB_CONNEXION,
  { useNewUrlParser: true,
    useUnifiedTopology: true })
  .then(() => console.log('Connexion à MongoDB réussie !'))
  .catch(() => console.log('Connexion à MongoDB échouée !'));

// const bodyParser = require('body-parser');



// CORS pour éviter les attaques CSRF
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    next();
  });

app.use(express.json()); //Transforme le corp de la requête en object Javascript utilisable 
app.use(helmet());



app.use('/images', express.static(path.join(__dirname, 'images')));

app.use('/api/sauces', saucesRoutes);
app.use('/api/auth', userRoutes);


module.exports = app;