const FS = require('fs');
const fetch = require('node-fetch');
const FormData = require('form-data');
const PatientRecords = require('../model/PatientRecords');

module.exports.analyzePatientData = async(req, res) => {

    //https://heartwave-app.herokuapp.com/csv
    let filePath = '';
    if (req.files && req.files['heart-graph']) {
        try {

            const file = req.files['heart-graph'];
            filePath = await saveFileLocaly(file);
            const form = new FormData();
            form.append('heartwave_data', FS.createReadStream(filePath));
            const response = await fetch('https://heartwave-app.herokuapp.com/csv', { method: 'POST', body: form });
            const heartData = await response.json();

            // remove tmpFile 
            FS.unlink(filePath, (err) => {
                if (err) {
                    console.error(err)
                }
            });

            const newPatientRecord = new PatientRecords({ userId: req.currentUser._id, data: heartData });
            const record = await PatientRecords.save(newPatientRecord);

            return res.json(record);

        } catch (err) {
            console.log(err);
            FS.unlink(filePath, (err) => {
                if (err) {
                    console.error(err)
                }
            });
            return res.status(500).send("Server error: 009144");
        }
    }



    // send back results
    res.status(400).send('File is misisng');

}

module.exports.getPatientRecords = async(req, res) => {
    try {
        const records = await PatientRecords.findByUserId(req.currentUser._id);
        res.json(records);
    } catch (err) {
        console.error(err);
        return res.status(400).send("No records found");
    }
}

function saveFileLocaly(file) {
    return new Promise((resolve, reject) => {
        const filePath = 'tmp/' + file.name;
        file.mv(filePath, function(err) {
            if (err)
                reject(err);

            resolve(filePath);
        });
    })
}