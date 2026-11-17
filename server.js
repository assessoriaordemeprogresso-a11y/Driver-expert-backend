require("dotenv").config();
const express = require("express");
const cors = require("cors");
const axios = require("axios");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// ===== ROTAS =====
// 1. CRIAR PIX COBRANÇA SEDEPAY
app.post("/api/criar-pix", async (req, res) => {
  try {
    const SEDEPAY_API_KEY = process.env.SEDEPAY_API_KEY;
    const SEDEPAY_BASE_URL = process.env.SEDEPAY_BASE_URL;

    if (!SEDEPAY_API_KEY || !SEDEPAY_BASE_URL) {
      return res.status(500).json({ erro: "Variáveis .env da SedePay faltando" });
    }

    const dados = req.body;

    const payload = {
      amount: dados.amount,
      reference: dados.reference,
      product: { title: dados.product_title },
      customer: {
        name: dados.customer_name,
        email: dados.customer_email,
        phone: dados.customer_phone,
        document: {
          type: dados.doc_type,
          number: dados.doc_number
        }
      }
    };

    const resposta = await axios.post(
      `${SEDEPAY_BASE_URL}/v1/pix/charges`,
      payload,
      {
        headers: {
          Authorization: `Bearer ${SEDEPAY_API_KEY}`,
          "Content-Type": "application/json"
        },
        timeout: 20000
      }
    );

    return res.status(201).json(resposta.data);
  } catch (erro) {
    return res.status(erro.response?.status || 502).json({
      erro: "Falha na comunicação com SedePay",
      detalhe: erro.response?.data || erro.message
    });
  }
});

// 2. CONSULTAR STATUS DO PIX
app.get("/api/consulta-pix/:reference", async (req, res) => {
  try {
    const SEDEPAY_API_KEY = process.env.SEDEPAY_API_KEY;
    const SEDEPAY_BASE_URL = process.env.SEDEPAY_BASE_URL;
    const { reference } = req.params;

    const resposta = await axios.get(`${SEDEPAY_BASE_URL}/v1/pix/charges/${reference}`, {
      headers: { Authorization: `Bearer ${SEDEPAY_API_KEY}` },
      timeout: 20000
    });

    return res.status(200).json(resposta.data);
  } catch (erro) {
    return res.status(erro.response?.status || 502).json({
      erro: "Falha ao consultar PIX",
      detalhe: erro.response?.data || erro.message
    });
  }
});

// 3. WEBHOOK (DEPOIS CONFIGURAR NA SEDEPAY)
app.post("/webhooks/sedepay", (req, res) => {
  console.log("WEBHOOK SEDEPAY:", req.body);
  return res.status(200).json({ status: "ok" });
});

// TESTE SERVIDOR RODANDO
app.get("/", (req, res) => {
  res.send("✅ Servidor Driver Expert rodando!");
});

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
