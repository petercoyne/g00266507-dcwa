const express = require("express")
const bp = require("body-parser")
const { check, validationResult } = require('express-validator')
const daosql = require("./dao-sql")
const daomongo = require("./dao-mongo")

const app = express()
const port = 3000

app.use(bp.urlencoded({ extended: false }))
app.set('view engine', 'ejs')

app.listen(port, () => {
	console.log("Listening on port " + port)
})

app.get('/', (req, res) => {
	res.render("index")
})

app.get('/listModules', (req, res) => {
	daosql.getModules()
		.then((result) => {
			res.render("modules", { modules: result })
		})
		.catch((error) => {
			res.send(error)
		})
})

app.get('/listStudents', (req, res) => {
	daosql.getStudents()
		.then((result) => {
			res.render("students", { students: result })
		})
		.catch((error) => {
			res.send(error)
		})
})

app.get('/addStudent', (req, res) => {
	res.render("addStudent", { errors: undefined, sqlError: undefined, sid: "", name: "", gpa: "" })
})

app.post('/addStudent',
	[
		check('sid').isLength({ min: 4, max: 4 }).withMessage("Student ID must be 4 characters."),
		check('name').isLength({ min: 5 }).withMessage("Name must be at least 5 characters."),
		check('gpa').isFloat({ min: 0, max: 4 }).withMessage("GPA must be between 0.0 and 4.0")
	],
	(req, res) => {
		let error = validationResult(req);
		if (error.isEmpty()) {
			daosql.addStudent(req.body.sid, req.body.name, req.body.gpa)
				.then((result) => {
					res.redirect("/listStudents")
				})
				.catch((err) => {
					res.render("addStudent", { sid: req.body.sid, name: req.body.name, gpa: req.body.gpa, errors: error.errors, sqlError: err.sqlMessage })
				})
		} else {
			res.render("addStudent", { sid: req.params.sid, name: req.body.name, gpa: req.body.gpa, errors: error.errors, sqlError: undefined })
		}
	}
)

app.get('/students/delete/:sid', (req, res) => {
	daosql.deleteStudent(req.params.sid)
		.then((result) => {
			res.redirect('/listStudents')
		})
		.catch((error) => {
			if (error.errno == 1451) {
				res.render("error", { student: req.params.sid, message: "has associated modules and cannot be deleted." })
			} else {
				res.send(`Unknown error occurred while attempting to delete student ${req.params.sid}.`)
			}
		})
})

app.get('/module/students/:mid', (req, res) => {
	daosql.getStudentsFromModule(req.params.mid)
		.then((result) => {
			res.render("studentsModule", { students: result, mid: req.params.mid })
		})
		.catch((error) => {
			res.send(error)
		})
})

app.get('/modules/:mid', (req, res) => {
	daosql.getModule(req.params.mid)
		.then((result) => {
			if (result.length > 0) {
				res.render("editmodule", { mid: result[0].mid, name: result[0].name, credits: result[0].credits, errors: undefined })
				console.log(result);
			} else {
				res.send(`<h3>No module with ID of ${req.params.mid}</h3>`)
			}
		})
		.catch((error) => {
			res.send(error)
		})
})

app.post('/modules/:mid',
	[
		check('name').isLength({ min: 5 }).withMessage("Module name should be a minimum of 5 characters."),
		check('credits').isIn([5, 10, 15]).withMessage("Credits must be 5, 10 or 15.")
	],
	(req, res) => {
		var error = validationResult(req);
		if (error.isEmpty()) {
			daosql.setModule(req.params.mid, req.body.name, req.body.credits)
				.then((result) => {
					console.log(result)
					res.render("editmodule", { mid: req.params.mid, name: req.body.name, credits: req.body.credits, errors: undefined, success: `OK. $` })
				})
				.catch((error) => {
					res.send(error)
				})
		} else {
			res.render("editmodule", { mid: req.params.mid, name: req.body.name, credits: req.body.credits, errors: error.errors })
		}}
)

app.get('/listLecturers', (req,res) => {
	daomongo.getLecturers()
	.then((result) => {
		res.render("lecturers", { lecturers: result })
	})
	.catch((error) => {
		res.send(error)
	})
})

app.get('/addLecturer', (req, res) => {
	res.render("addLecturer", { errors: undefined, mongoError: undefined, _id: "", name: "", dept: "" })
})

app.post('/addLecturer',
	[
		check('_id').isLength({ min: 4, max: 4 }).withMessage("Lecturer ID must be 4 characters."),
		check('name').isLength({ min: 5 }).withMessage("Name must be at least 5 characters."),
		check('dept').isLength({ min: 3, max: 3 }).withMessage("Dept must be 3 characters")
	],
	(req, res) => {
		let error = validationResult(req);
		var mongoError = "";

		daosql.getDept(req.body.dept)
		.then((result) => {
			if (result.length < 1) {
				mongoError = "Dept does not exist";
			} else {
				console.log(result)
			}
		})
		.catch((err) => {
			console.log("Failure accessing department info");
			console.log(err);
		})

		if (error.isEmpty() && mongoError == "") {
			console.log(`mongoError: ${mongoError}`);
			daomongo.addLecturer(req.body._id, req.body.name, req.body.dept)
				.then((result) => {
					res.redirect("/listLecturers")
				})
				.catch((err) => {
					
					console.log(err)
					if (err.code == 11000) {
						mongoError = "_id already exists"
					}
					res.render("addLecturer", { _id: req.body._id, name: req.body.name, dept: req.body.dept, errors: error.errors, mongoError: mongoError })
				})
		} else {
			res.render("addLecturer", { _id: req.params._id, name: req.body.name, dept: req.body.dept, errors: error.errors, mongoError: mongoError})
		}
	}
)