import express from "express";
import cors from "cors";
import { createConnection } from "mysql";
import md5 from "md5";
import jwt from "jsonwebtoken"; // Importe a biblioteca JWT
import { LocalStorage } from "node-localstorage";
import jwt_decode from 'jwt-decode';

const secret = 'forenserSecurity';


const dateFormatter = new Intl.DateTimeFormat("fr-CA", {
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});


function verifyJwt(req:any, res:any, next:any){
  const token = req.headers['x-access-token'];
  jwt.verify(token, secret, (err:any, decoded:any) =>{
    if(err){
      return res.status(401).end();
    } else{
      req.userEmail = decoded.email;
      next();
    }
  })
}

const connection = createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "forencer_data",
});

connection.connect((err) => {
  if (err) {
    console.error(err);
  } else {
    console.log("database connected");
  }
});

const app = express();

app.use(cors());
app.use(express.json());

// Função para criar um token JWT
function createJWTToken(email:any) {
  return jwt.sign({ email }, secret, { expiresIn: "1h" });
}

app.post("/registerP", (req, res) => {
  const nome = req.body.nome;
  const email = req.body.email;
  const senha = md5(req.body.senha);
  const telefone = req.body.telefone;
  const sexo = req.body.sexo;
  const cpf = req.body.cpf;
  const data_n = req.body.data_n;

  try {
    connection.query("SELECT * FROM usuario WHERE email_usu = ?", [email], (err, result) => {
      if (err) {
        console.error("Ocorreu um erro inesperado");
      } else {
        if (result.length > 0) {
          console.log(result);
        } else {
          connection.query(
            "INSERT INTO usuario SET ?",
            {
              nome_usu: nome,
              cpf_usu: cpf,
              data_nasc: dateFormatter.format(new Date(data_n)),
              email_usu: email,
              senha,
              telefone,
              sexo,
            },
            function (error, results, fields) {
              console.log(error, results, fields);

              if (error) throw error;
              console.log(results.insertId);
            }
          );

          // Crie um token JWT e envie-o como resposta
          const token = createJWTToken(email);
          res.status(200).json({ token });
        }
      }
    });
  } catch (error) {
    console.error("error", error);
    res.status(400).json({
      message: "Usuario cadastrado com sucesso",
    });
  }
});

// Realizar login e criar um token JWT
app.post("/loginP", (req, res) => {
  const email = req.body.email;
  const senha = md5(req.body.senha);

  try {
    connection.query("SELECT * FROM usuario WHERE email_usu = ? AND senha = ?", [email, senha], (err, result) => {
      if (err) {
        console.error("Ocorreu um erro inesperado");
      } else {
        if (result.length > 0) {

            // Obtenha o nome do usuário a partir do resultado do banco de dados
            const nomeUsuario = result[0].nome_usu;
            const idUsu = result[0].id_usu;

            // Crie o payload do token com o nome do usuário
            const payload = {
              id: idUsu,
              email: email,
              nome: nomeUsuario,
            };

          console.log("conectado");
          const token  = jwt.sign(payload, secret, { expiresIn: 3600 });
          res.status(200).json({ token });
        } else {
          console.log("usuario ou senha invalidos");
          res.status(401).json({ message: "Usuário ou senha inválidos" });
        }
      }
    });
  } catch (error) {
    console.log(error);
  }
});


// boletins de ocorrencia

app.post("/registrarAcidente", (req,res) =>{
  const data_fato = dateFormatter.format(new Date(req.body.data_fato));
  const horario = req.body.horario;
  const tipo_local = req.body.tipo_local;
  const endereco = req.body.endereco;
  const comunicante = req.body.comunicante;
  const motorista = req.body.motorista;
  const veiculos = req.body.veiculos;
  const relato_fato = req.body.relato_fato;
  const cod_usu = null;
  try{
    connection.query(
      "INSERT INTO boletim_acidente SET ?",
      {
        data_fato,
        horario,
        tipo_local,
        endereco,
        comunicante,
        motorista,
        veiculos,
        relato_fato,
        cod_usu
      },
      
      function (error, results, fields) {
        console.log(error, results, fields);

        if (error) throw error;
        console.log(results.insertId);
      }
      )
  }catch(error){
    console.log(error)
  }
})



app.post("/registrarRoubo", (req,res) =>{
  const violencia = req.body.violencia;
  const subtracao = req.body.subtracao;
  const data_fato = dateFormatter.format(new Date(req.body.data_fato));
  const horario = req.body.horario;
  const tipo_local = req.body.tipo_local;
  const endereco = req.body.endereco;
  const comunicante = req.body.comunicante;
  const vitima = req.body.vitima;
  const objetos = req.body.objetos;
  const relato_fato = req.body.relato_fato;
  try{
    connection.query(
      "INSERT INTO boletim_roubo SET ?",
      {
        violencia,
        subtracao,
        data_fato,
        horario,
        tipo_local,
        endereco,
        comunicante,
        vitima,
        objetos,
        relato_fato
      },
      
      function (error, results, fields) {
        console.log(error, results, fields);

        if (error) throw error;
        console.log(results.insertId);
      }
      )
  }catch(error){
    console.log(error)
  }
})

app.post("/registrarViolenciaD", (req,res) =>{
  const violencia = req.body.violencia;
  const obito = req.body.obito;
  const data_fato = dateFormatter.format(new Date(req.body.data_fato));
  const horario = req.body.horario;
  const tipo_local = req.body.tipo_local;
  const endereco = req.body.endereco;
  const comunicante = req.body.comunicante;
  const vitima = req.body.vitima;
  const objetos = req.body.objetos;
  const relato_fato = req.body.relato_fato;
  try{
    connection.query(
      "INSERT INTO boletim_violenciaDomestica SET ?",
      {
        violencia,
        obito,
        data_fato,
        horario,
        tipo_local,
        endereco,
        comunicante,
        vitima,
        relato_fato
      },
      
      function (error, results, fields) {
        console.log(error, results, fields);

        if (error) throw error;
        console.log(results.insertId);
      }
      )
  }catch(error){
    console.log(error)
  }
})



app.get('/inicio', verifyJwt, (req, res) =>{
  console.log(req.body.userEmail + ' fez esta chamada');
  res.status(200).json({ funciona:true });
})

app.listen(3001, () => {
  console.log("Listen on port 3001");
});
