const express = require('express');
const cors = require('cors');
const app = express();
const PORT = 3000;

// COLOQUE A SUA CHAVE DA SEDEPAY AQUI
const CHAVE_SEDEPAY = "sk_live_edc3026a5236a799fd5eab913580a965870fa6f8f8e14a32";

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.send("Servidor online!");
});

app.post('/api/gerar-pix', async (req, res) => {
  console.log("✅ RECEBI A SOLICITAÇÃO DO SITE");
  try{
    const {amount, titulo, nome, email, telefone, cpf} = req.body;
    const referencia = "driverexpert-" + Math.floor(Math.random()*999999);
    const tokenAutorizacao = "Bearer " + CHAVE_SEDEPAY;

    // ✅ URL CORRETA DA SEDEPAY (COM S NO FINAL charges)
    const URL_SEDEPAY = "https://api.sedepay.com/v1/pix/charges";

    const respostaSedepay = await fetch(URL_SEDEPAY, {
      method:"POST",
      headers:{
        "Content-Type":"application/json",
        "Authorization": tokenAutorizacao
      },
      // ✅ ESTRUTURA EXATA DA DOCUMENTAÇÃO DA SEDEPAY
      body: JSON.stringify({
        amount: amount,
        reference: referencia,
        product: {
          title: titulo
        },
        customer: {
          name: nome,
          email: email,
          phone: telefone,
          document: {
            type: "cpf",
            number: cpf
          }
        }
      })
    })

    const dadosSedepay = await respostaSedepay.json();
    console.log("📥 Retorno Sedepay: ", dadosSedepay);
    res.json(dadosSedepay);

  }catch(err){
    console.log("❌ ERRO NO SERVIDOR: ", err.message);
    res.status(500).json({erro: err.message});
  }
})

app.listen(PORT, ()=>{
  console.log("✅ Servidor rodando na porta " + PORT);
})