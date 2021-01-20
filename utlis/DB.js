const { MongoClient } = require("mongodb");

const url = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.bydno.mongodb.net/<dbname>?retryWrites=true&w=majority`;
const dbName = "heartwaves";

let dbInstance = null;

module.exports.initDatabase = async() => {
    if (dbInstance) return dbInstance;
    const client = new MongoClient(url, { useUnifiedTopology: true });
    const connection = await client.connect();
    if (connection.topology.s.state) {
        console.log("DB Connection Status: " + connection.topology.s.state);
        dbInstance = client.db(dbName);
        return dbInstance;
    } else {
        console.log("Problem connecting to MongoDB");
    }
};

module.exports.getDatabase = () => {
    return dbInstance;
};

module.exports.usersCollection = () => {
    return this.getDatabase().collection("users");
};