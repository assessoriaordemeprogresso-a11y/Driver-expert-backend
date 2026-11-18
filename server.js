const express = require('express');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 3000;

const CHAVE_SEDEPAY = process.env.SEDEPAY_TOKEN;

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.send("Servidor online!");
});

app.post('/api/gerar-pix', async (req, res) => {
  console.log("✅ RECEBI A SOLICITAÇÃO DO SITE");
  try{
    const {amount, titulo, nome, email, telefone, cpf} = req.body;

    // LIMPEZA DOS DADOS PARA SEDEPAY
    const cpfLimpo = String(cpf || "").replace(/\D/g, "")
    const telefoneLimpo = String(telefone || "").replace(/\D/g, "")
    const valorLimpo = Number(String(amount || "0").replace(",", "."))

    const referencia = "driverexpert-" + Math.floor(Math.random()*999999);
    const tokenAutorizacao = "Bearer " + CHAVE_SEDEPAY;

    const URL_SEDEPAY = "https://api.sedepay.com/v1/pix/charges";

    const respostaSedepay = await fetch(URL_SEDEPAY, {
      method:"POST",
      headers:{
        "Content-Type":"application/json",
        "Authorization": tokenAutorizacao
      },
      body: JSON.stringify({
        amount: valorLimpo,
        reference: referencia,
        product: {
          title: titulo
        },
        customer: {
          name: nome,
          email: email,
          phone: telefoneLimpo,
          document: {
            type: "cpf",
            number: cpfLimpo
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
