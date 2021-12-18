const express = require("express")
const bp = require("body-parser")
const { check, validationResult } = require('express-validator')
const daosql = require("./dao-sql")

const app = express()
const port = 3000

app.use(bp.urlencoded({ extended: false }))
app.set('view engine', 'ejs')

app.listen(port, () => {
	console.log("Listening on port " + port)
})

app.get('/listModules', (req, res) => {
	daosql.getModules()
	.then((result) => {
		res.send(result);
	})
	.catch((error) => {
		res.send(error);
	})
})

app.get('/modules/:mid', (req, res) => {
	daosql.getModule(req.params.mid)
	.then((result) => {
		if (result.length > 0){
			res.send(result[0])
		} else {
			res.send([])
		}
	})
	.catch((error) => {
		res.send(error)
	})
})

app.post('/modules/:mid', (req, res) => {
	daosql.setModule(req.params.mid, req.params.name, req.params.credits)
	.then((result) => {
		if (result.length > 0){
			res.send(result[0])
			console.log("add module " + result);
		} else {
			res.send({ error: `No module with ID = ${req.params.mid}`});
		}
	})
	.catch((error) => {
		res.send(error)
	})
})