const { User } = require('../models/index.js');
const fs = require('fs');


const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

//plugin pour validé les emails
var validator = require("email-validator");


//inscription
exports.singup = (req, res, next) => {
    
    //fonction pour crypté un mdp
    bcrypt.hash(req.body.password, 10)//"saler" le mdp 10 fois, plus ont augmente le chiffre plus cela prendra du temps(pour le hachage du mdp)
    .then(hash => {
        //création d'un nouveau user avec un mdp crypté avec l'adresse mail 
        const user = new User({
            email: req.body.email,
            password: hash
        });
        //Ensuite l'utilisateur sera enregistré
        user.save()
            .then(() => res.status(201).json({ message: 'Utilisateur créé !'}))
            .catch(error => res.status(400).json({ error }));
    })
    .catch(error => res.status(500).json({ error }));
};

//connexion
exports.login = (req, res, next) => {
    User.findOne({where: { email: req.body.email}})
        .then(user => {
            //Si ont ne trouve pas l'utilisateur ont retourne une erreur car l'utilisateur n'a pas été trouvé
            if (!user) {
                return res.status(401).json({ error: 'Utilisateur non trouvé !'});
            }
            //ont utilise la méthode compare pour comparer les mdp haché par bcrypt
            bcrypt.compare(req.body.password, user.password)
                .then(valid => {
                    //Si la comparaison n'est pas bonne alors ont retourne une erreur
                    if (!valid) {
                        return res.status(401).json({ error: 'Mot de passe incorrect !'});
                    }
                    //Mais si la comparaison est bonne c'est que l'utilisateur a rentré des identifiants valables
                    res.status(200).json({
                        //Vu que tout est bon ont lui envoie sont userId et un token(qui deviendra le token d'authentification)
                        userId: user._id,
                        //ont utilise la méthode sign de jsonwebtoken pour encoder un nouveau token
                        token: jwt.sign(
                            //ce token contient l'ID de l'utilisateur en tant que payload (les données encodées dans le token)
                            { userId: user._id },
                            //ont utilise une chaîne secrète de développement temporaire RANDOM_SECRET_KEY pour encoder notre token (à remplacer par une chaîne aléatoire beaucoup plus longue pour la production)
                            'RANDOM_TOKEN_SECRET',
                            //ont défini la durée de validité du token à 24 heures. L'utilisateur devra donc se reconnecter au bout de 24 heures
                            {expiresIn: '24h'}
                        )
                    });
                })
                .catch(error => res.status(500).json({ error}));
        })
        .catch(error => res.status(500).json({ error}));
};


//modifier l'user
exports.updateUser = (req, res) => {
    //vérification que la personne a bien une photo
    req.file ? req.body.profile = req.file.filename : console.log("garde la même photo");
    //si on supprime l'ancienne photo
    if (req.file) {
        User.findOne({where: {id:req.params.id}})
            .then(user => {
                if(user.profile !== "defaultUserProfile.png") { // <- si sa photo de profile n'est pas celle par défaut on peut la supprimer
                    fs.unlink(`images/${user.profile}`, (error) => {
                        if (error) throw err
                    })    
                } else {
                    console.log("ce fichier ne peut être effacé car c'est l'image par défaut")
                }
            })
            .catch(error => res.status(400).json(error));
    }
    //si on modifie le mdp alors on sauvegarde le hashage
    if (req.body.password) { 
        bcrypt.hash(req.body.password, 10)
            .then(hash => {
                req.body.password = hash;
                User.update(req.body, {where: {id: req.params.id}})
                    .then(user => {
                        res.status(201).json({message: "Le profil a bien été modifié"});
                    })
                    .catch(error => res.status(400).json(error));
            })
            .catch(error => res.status(500).json(error));
    } else { 
        User.update(req.body, {where: {id: req.params.id}})
            .then(() => res.status(201).json({message: "Le profil a bien été modifié"}))
            .catch(error => res.status(400).json(error));
    };

}

//Supprimer le compte
exports.deleteUser = (req, res) =>  {
    User.findOne({
        attributes: ["id", "email", "username"],
        where: {
          id: req.params.id,
        },
      })
      .then(function (User) {
        User.destroy({
            id: req.params.id,
          })
          .then(() =>
            res.status(200).json({
              message: "Compte supprimé!",
            })
          )
          .catch((error) => {
            console.log(error);
            res.status(400).json({
              message: "La suppression n'a pas pu être effectuée",
            });
          });
      })
      .catch((error) =>
        res.status(500).json({
          message: "Erreur serveur",
        })
      );
  };
  