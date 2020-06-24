const express = require("express")
const server = express()

//Pegar o banco de dados
const db = require("./database/db")

//Configurar pasta pública
server.use(express.static("public"))

//Habilitar o uso do req.body na nossa aplicação
server.use(express.urlencoded({ extended: true }))

//Utilizando template engine
const nunjucks = require("nunjucks")
nunjucks.configure("src/views", {
  express: server,
  noCache: true
})

//Configurar caminhos da minha aplicação
//Página inicial
server.get("/", (req, res) => {
  return res.render("index.html")
})
server.get("/create-point", (req, res) => {
  return res.render("create-point.html")
})

server.post("/savepoint", (req, res) => {

  // req.body: o corpo do nosso formulário
  //console.log(req.body)
  //Inserir dados no banco
  const query = `
  INSERT INTO places (
    name,
    image,
    address,
    address2,
    state,
    city,
    items
  ) VALUES (?, ?, ?, ?, ?, ?, ?);
  `
  const values = [
    req.body.name,
    req.body.image,
    req.body.address,
    req.body.address2,
    req.body.state,
    req.body.city,
    req.body.items
  ]

  function afterInsertData(err) {
    if (err) {
      console.log(err)
      return res.send("Erro no cadastro.")
    }
    console.log("Cadastrado com sucesso!")
    console.log(this)
    return res.render("create-point.html", { saved: true })
  }

  db.run(query, values, afterInsertData)

})

server.get("/search", (req, res) => {

  const search = req.query.search

  if(search == "") {
    //Pesquisa vazia
    return res.render("search-results.html", { total: 0 })
  }

  //Pegar os dados do banco
  db.all(`SELECT * FROM places WHERE city LIKE '%${search}%'`, function (err, rows) {
    if (err) {
      return console.log(err)
    }
    //Calcular o total de registros
    const total = rows.length

    //Mostrar a página com os dados buscados
    return res.render("search-results.html", { places: rows, total })
  })
})

//Ligar o servidor
server.listen(3000)