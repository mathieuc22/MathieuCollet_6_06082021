const Sauce = require('../models/sauce');
const fs = require('fs');
const sauce = require('../models/sauce');

exports.createSauce = (req, res, next) => {
    const sauceObject = JSON.parse(req.body.sauce);
    delete sauceObject._id;
    const sauce = new Sauce({
      ...sauceObject,
      imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
    });
    sauce.save()
      .then(() => res.status(201).json({ message: 'Objet enregistré !'}))
      .catch(error => res.status(400).json({ error }));
  };

exports.getOneSauce = (req, res, next) => {
  Sauce.findOne({ _id: req.params.id })
    .then(sauce => res.status(200).json( sauce ))
    .catch(error => res.status(404).json({ error }));
};

exports.modifySauce = (req, res, next) => {
  const sauceObject = req.file ?
    {
      ...JSON.parse(req.body.sauce),
      imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
    } : { ...req.body };
  Sauce.updateOne({ _id: req.params.id }, { ...sauceObject, _id: req.params.id })
    .then(() => res.status(200).json({ message: 'Objet modifié !'}))
    .catch(error => res.status(400).json({ error }));
};

exports.likeSauce = async (req, res, next) => {
  const sauceObject = { ...req.body }
  let sauce = await Sauce.findOne({ _id: req.params.id });
  switch (sauceObject.like) {
    case 1:
      sauce.usersLiked.push(sauceObject.userId);
      sauce.likes ++
      sauce.save();
      res.status(200).json({ message: 'Objet supprimé !'});
      break;
    case -1:
      sauce.usersDisliked.push(sauceObject.userId);
      sauce.dislikes ++
      sauce.save()
      res.status(200).json({ message: 'Objet supprimé !'});
      break;
    case 0:
      if (sauce.usersLiked.includes(sauceObject.userId)) {
        sauce.usersLiked.splice(sauce.usersLiked.indexOf(sauceObject.userId), 1)
        sauce.likes = sauce.usersLiked.length
      } else {
        sauce.usersDisliked.splice(sauce.usersDisliked.indexOf(sauceObject.userId), 1)
        sauce.dislikes = sauce.usersDisliked.length
      }
      sauce.save()
      res.status(200).json({ message: 'Objet supprimé !'});
      break;
  }
  
  
};

exports.deleteSauce = (req, res, next) => {
  Sauce.findOne({ _id: req.params.id })
    .then(sauce => {
      const filename = sauce.imageUrl.split('/images/')[1];
      fs.unlink(`images/${filename}`, () => {
        Sauce.deleteOne({ _id: req.params.id })
          .then(() => res.status(200).json({ message: 'Objet supprimé !'}))
          .catch(error => res.status(400).json({ error }));
      });
    })
    .catch(error => res.status(500).json({ error }));
};

exports.getAllSauces = (req, res, next) => {
  Sauce.find().then(
    (sauces) => {
      res.status(200).json(sauces);
    }
  ).catch(
    (error) => {
      res.status(400).json({
        error: error
      });
    }
  );
};