const { firestore } = require('../config/firestore');

const categoriesCollection = firestore.collection('categories');

const toObject = (doc) => ({ id: doc.id, ...doc.data() });

const getCategories = async () => {
  const snapshot = await categoriesCollection.orderBy('name').get();
  return snapshot.docs.map(toObject);
};

module.exports = {
  getCategories
};
