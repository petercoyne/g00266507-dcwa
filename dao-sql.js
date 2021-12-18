const mysql = require("promise-mysql")
var pool;

mysql.createPool({
	connectionLimit: 3,
	host: '127.0.0.1',
	user: 'root',
	password: '',
	database: 'collegeDB',
	insecureAuth : true
})
.then((result) => {
	pool = result;
})
.catch((error) => {
	console.log(error)
})

const getModules = () => {
	return new Promise((resolve, reject) => {
		pool.query("select * from module")
		.then((result) => {
			resolve(result)
		})
		.catch((error) => {
			reject(error)
		})
	})
}

const getModule = (mid) => {
	return new Promise((resolve, reject) => {
		let query = {
			sql: "select * from module where mid = ?",
			values: [mid]
		} 
		pool.query(query)
		.then((result) => {
			resolve(result)
		})
		.catch((error) => {
			reject(error)
		})
	})
}

const setModule = (mid, name, credits) => {
	return new Promise((resolve, reject) => {
		let query = {
			sql: "update module set name = ?, credits = ? where mid = ?",
			values: [name, credits, mid]
		} 
		pool.query(query)
		.then((result) => {
			resolve(result)
		})
		.catch((error) => {
			reject(error)
		})
	})
}

const getStudents = () => {
	return new Promise((resolve, reject) => {
		pool.query("select * from student")
		.then((result) => {
			resolve(result)
		})
		.catch((error) => {
			reject(error)
		})
	})
}

const deleteStudent = (sid) => {
	return new Promise((resolve, reject) => {
		let query = {
			sql: "delete from student where sid = ?",
			values: [sid]
		} 
		pool.query(query)
		.then((result) => {
			resolve(result)
		})
		.catch((error) => {
			console.log(error)
			reject(error)
		})
	})
}

const getStudentsFromModule = (mid) => {
	return new Promise((resolve, reject) => {
		let query = {
			sql: "select * from student s left join student_module m on s.sid = m.sid where m.mid = ?",
			values: [mid]
		} 
		pool.query(query)
		.then((result) => {
			resolve(result)
		})
		.catch((error) => {
			reject(error)
		})
	})
}

module.exports = { getModules, getModule, setModule, getStudents, getStudentsFromModule, deleteStudent }