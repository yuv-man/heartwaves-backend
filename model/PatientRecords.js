const { ObjectId } = require('mongodb');
const { patientRecordsCollection } = require('../utlis/DB');

class PatientRecords {

    constructor(record) {
        this.userId = record.userId;
        this.date = new Date();
        this.heartData = record.data
    }

    static async save(record) {
        const result = await patientRecordsCollection().insertOne(record);
        return createFrontEndUser(result.ops[0]);
    }

    static async findByUserId(id) {
        const userId = ObjectId(id);
        const records = await patientRecordsCollection().find({ _id: userId }).toArray();
        return records;
    }

}

module.exports = PatientRecords;