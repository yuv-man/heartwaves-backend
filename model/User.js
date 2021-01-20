const { usersCollection } = require('../utlis/DB');
const { ObjectId } = require('mongodb');
const bcrypt = require('bcrypt');
const saltRounds = 10;

const UserType = Object.freeze({ ADMIN: "ADMIN", PATIENT: "PATIENT", DOCTOR: "DOCTOR" });

class User {

    constructor(user) {
        this.fullName = user.fullName;
        this.phone = user.phone;
        this.email = user.email;
        this.password = user.password;
        this.createdAt = new Date();
        this.type = UserType.PATIENT;
    }

    static async findUserById(uid) {
        const id = new ObjectId(uid);
        const user = await usersCollection().findOne({ _id: id }, { projection: { password: 0 } });
        return user;
    }

    static async findUserByEmail(email) {
        const user = await usersCollection().findOne({ email: email });
        return user;
    }

    static async getAllUsers(limit = 10, pageNum = 1) {
        const data = {}
        let users = await usersCollection().find({}, { projection: { password: 0 } });
        data.usersTotal = await users.count();
        const offSet = limit * (pageNum - 1);
        users = users.skip(offSet).limit(limit);
        data.usersList = await users.toArray();
        return data;
    }

    static async login(email, password) {
        const user = await usersCollection().findOne({ email: email });
        if (user && bcrypt.compareSync(password, user.password)) {
            return createFrontEndUser(user);
        }
        return null;
    }

    static async addNewUser(user) {
        const newUser = new User(user);
        const hash = bcrypt.hashSync(newUser.password, saltRounds);
        newUser.password = hash;
        const result = await usersCollection().insertOne(newUser, { projection: { password: 0 } });
        return createFrontEndUser(result.ops[0]);

    }

    static async update(uid, data) {
        const id = new ObjectId(uid);
        delete data._id;
        if (data.password) {
            const hash = bcrypt.hashSync(data.password, saltRounds);
            data.password = hash;
        }
        await usersCollection().updateOne({ _id: id }, { $set: data });
        return createFrontEndUser(await this.findUserById(uid));
    }

    static passwordMatch(password, user) {
        if (bcrypt.compareSync(password, user.password)) {
            return true;
        }
        return false;
    }

    static getUserType() {
        return UserType;
    }

}

function createFrontEndUser(user) {
    delete user.password;
    return user;
}

module.exports = User;