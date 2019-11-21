const MongoClient = require('mongodb').MongoClient,
      Config = require('./config');

class Db {
  static getInstance() {
    if (!Db.instance) Db.instance = new Db();
    return Db.instance;
  }

  constructor() {
    this.dbClient = null;
    this.connect();
  }

  connect() {
    return new Promise((resolve, reject) => {
      if (this.dbClient) {
        resolve(this.dbClient);
      } else {
        MongoClient.connect(Config.dbUrl, (err, client) => {
          if (err) {
            reject(err);
          } else {
            const db = client.db(Config.dbName);
            this.dbClient = db;
            resolve(db);
          }
        })
      }
    })
  }

  find(collectionName, json) {
    return new Promise((resolve, reject) => {
      this.connect().then(db => {
        db.collection(collectionName).find(json).toArray((err, docs) => {
          if (err) {
            reject(err);
          } else {
            resolve(docs);
          }
        })
      })
    })
  }

  insert(collectionName, json) {
    return new Promise((resolve, reject) => {
      this.connect().then(db => {
        db.collection(collectionName).insertOne(json, (err, result) => {
          if (err) {
            reject(err);
          } else {
            resolve(result);
          }
        });
      })
    });
  }

  remove(collectionName, json) {
    return new Promise((resolve, reject) => {
      this.connect().then(db => {
        db.collection(collectionName).deleteOne(json, (err, result) => {
          if (err) {
            reject(err);
          } else {
            resolve(result);
          }
        });
      })
    })
  }

  update(collectionName, target, json) {
    return new Promise((resolve, reject) => {
      this.connect().then(db => {
        db.collection(collectionName).updateOne(target, {$set: json}, (err, result) => {
          if (err) {
            reject(err);
          } else {
            resolve(result);
          }
        })
      })
    })
  }
}

module.exports = Db.getInstance();