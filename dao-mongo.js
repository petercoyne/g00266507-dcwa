const MongoClient = require('mongodb').MongoClient

const url = 'mongodb://127.0.0.1:27017'
const dbName = 'lecturersDB'
const colName = 'lecturers'

var db
var lecturers

MongoClient.connect(url, {useNewUrlParser: true, useUnifiedTopology: true})
	.then((client) => {
		db = client.db(dbName)
		lecturers = db.collection(colName)
	})
	.catch((error) => {
		console.log(error)
	})

var getLecturers = function() {
	return new Promise((resolve, reject) => {
		let cursor = lecturers.find()
		cursor.toArray()
			.then((documents) => {
				resolve(documents)
			})
			.catch((error) => {
				reject(error)
			})
	})
}

var addLecturer = function(_id, name, dept) {
	return new Promise((resolve, reject) => {
		lecturers.insertOne({"_id":_id, "name":name, "dept":dept})
			.then((result) => {
				resolve(result)
			})
			.catch((error) => {
				reject(error)
			})
	})
}

module.exports = { getLecturers, addLecturer }