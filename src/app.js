const express = require("express");
const path = require("path");
const sql = require("mssql");

const app = express();
const PORT = process.env.PORT || 3000;

// Configuração do middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, "../public")));

// Configuração do banco de dados
const dbConfig = {
  server: "localhost",
  database: "ProjetoUniversidadeWeb",
  user: "sa",
  password: "123456", // coloque aqui a senha que você definiu
  options: {
    encrypt: false, // ou true, se necessário
    trustServerCertificate: true,
  },
};

// Pool de conexões
let pool;

async function connectDB() {
  try {
    pool = await sql.connect(dbConfig);
    console.log("✅ Conectado ao SQL Server");
  } catch (err) {
    console.error("❌ Erro ao conectar ao banco:", err.message || err);
    console.error("📋 Detalhes do erro:", JSON.stringify(err, null, 2));
  }
}

// =====================================================
// ROTAS DA API
// =====================================================

// GET - Listar todos os departamentos
app.get("/api/departamentos", async (req, res) => {
  try {
    const result = await pool
      .request()
      .query("SELECT * FROM departamento ORDER BY descricao");
    res.json(result.recordset);
  } catch (err) {
    console.error("Erro ao buscar departamentos:", err);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
});

// POST - Criar novo departamento
app.post("/api/departamentos", async (req, res) => {
  try {
    const { descricao } = req.body;
    const result = await pool
      .request()
      .input("descricao", sql.VarChar, descricao)
      .query(
        "INSERT INTO departamento (descricao) OUTPUT INSERTED.* VALUES (@descricao)"
      );
    res.status(201).json(result.recordset[0]);
  } catch (err) {
    console.error("Erro ao criar departamento:", err);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
});

// PUT - Atualizar departamento
app.put("/api/departamentos/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { descricao } = req.body;
    const result = await pool
      .request()
      .input("id", sql.Int, id)
      .input("descricao", sql.VarChar, descricao)
      .query(
        "UPDATE departamento SET descricao = @descricao OUTPUT INSERTED.* WHERE id_departamento = @id"
      );

    if (result.recordset.length === 0) {
      return res.status(404).json({ error: "Departamento não encontrado" });
    }
    res.json(result.recordset[0]);
  } catch (err) {
    console.error("Erro ao atualizar departamento:", err);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
});

// DELETE - Excluir departamento
app.delete("/api/departamentos/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool
      .request()
      .input("id", sql.Int, id)
      .query("DELETE FROM departamento WHERE id_departamento = @id");

    if (result.rowsAffected[0] === 0) {
      return res.status(404).json({ error: "Departamento não encontrado" });
    }
    res.json({ message: "Departamento excluído com sucesso" });
  } catch (err) {
    console.error("Erro ao excluir departamento:", err);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
});

// GET - Listar todos os cursos
app.get("/api/cursos", async (req, res) => {
  try {
    const result = await pool.request().query(`
            SELECT c.*, d.descricao as departamento_nome 
            FROM curso c 
            JOIN departamento d ON c.id_departamento = d.id_departamento 
            ORDER BY d.descricao, c.descricao
        `);
    res.json(result.recordset);
  } catch (err) {
    console.error("Erro ao buscar cursos:", err);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
});

// POST - Criar novo curso
app.post("/api/cursos", async (req, res) => {
  try {
    const {
      id_departamento,
      descricao,
      sigla,
      valor_mensalidade,
      duracao_semestres,
    } = req.body;
    const result = await pool
      .request()
      .input("id_departamento", sql.Int, id_departamento)
      .input("descricao", sql.VarChar, descricao)
      .input("sigla", sql.VarChar, sigla)
      .input("valor_mensalidade", sql.Decimal(10, 2), valor_mensalidade)
      .input("duracao_semestres", sql.Int, duracao_semestres).query(`
                INSERT INTO curso (id_departamento, descricao, sigla, valor_mensalidade, duracao_semestres) 
                OUTPUT INSERTED.* 
                VALUES (@id_departamento, @descricao, @sigla, @valor_mensalidade, @duracao_semestres)
            `);
    res.status(201).json(result.recordset[0]);
  } catch (err) {
    console.error("Erro ao criar curso:", err);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
});

// PUT - Atualizar curso
app.put("/api/cursos/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const {
      id_departamento,
      descricao,
      sigla,
      valor_mensalidade,
      duracao_semestres,
    } = req.body;
    const result = await pool
      .request()
      .input("id", sql.Int, id)
      .input("id_departamento", sql.Int, id_departamento)
      .input("descricao", sql.VarChar, descricao)
      .input("sigla", sql.VarChar, sigla)
      .input("valor_mensalidade", sql.Decimal(10, 2), valor_mensalidade)
      .input("duracao_semestres", sql.Int, duracao_semestres).query(`
                UPDATE curso 
                SET id_departamento = @id_departamento, descricao = @descricao, sigla = @sigla, 
                    valor_mensalidade = @valor_mensalidade, duracao_semestres = @duracao_semestres 
                OUTPUT INSERTED.* 
                WHERE id_curso = @id
            `);

    if (result.recordset.length === 0) {
      return res.status(404).json({ error: "Curso não encontrado" });
    }
    res.json(result.recordset[0]);
  } catch (err) {
    console.error("Erro ao atualizar curso:", err);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
});

// DELETE - Excluir curso
app.delete("/api/cursos/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool
      .request()
      .input("id", sql.Int, id)
      .query("DELETE FROM curso WHERE id_curso = @id");

    if (result.rowsAffected[0] === 0) {
      return res.status(404).json({ error: "Curso não encontrado" });
    }
    res.json({ message: "Curso excluído com sucesso" });
  } catch (err) {
    console.error("Erro ao excluir curso:", err);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
});

// GET - Listar todas as turmas
app.get("/api/turmas", async (req, res) => {
  try {
    const result = await pool.request().query(`
            SELECT t.*, c.descricao as curso_nome 
            FROM turma t 
            JOIN curso c ON t.id_curso = c.id_curso 
            ORDER BY c.descricao, t.periodo
        `);
    res.json(result.recordset);
  } catch (err) {
    console.error("Erro ao buscar turmas:", err);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
});

// POST - Criar nova turma
app.post("/api/turmas", async (req, res) => {
  try {
    const {
      id_curso,
      semestre,
      limite_alunos,
      periodo,
      turno,
      sala,
      data_inicio,
      data_termino,
    } = req.body;
    const result = await pool
      .request()
      .input("id_curso", sql.Int, id_curso)
      .input("semestre", sql.Int, semestre)
      .input("limite_alunos", sql.Int, limite_alunos)
      .input("periodo", sql.VarChar, periodo)
      .input("turno", sql.VarChar, turno)
      .input("sala", sql.VarChar, sala)
      .input("data_inicio", sql.Date, data_inicio)
      .input("data_termino", sql.Date, data_termino).query(`
                INSERT INTO turma (id_curso, semestre, limite_alunos, periodo, turno, sala, data_inicio, data_termino) 
                OUTPUT INSERTED.* 
                VALUES (@id_curso, @semestre, @limite_alunos, @periodo, @turno, @sala, @data_inicio, @data_termino)
            `);
    res.status(201).json(result.recordset[0]);
  } catch (err) {
    console.error("Erro ao criar turma:", err);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
});

// PUT - Atualizar turma
app.put("/api/turmas/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const {
      id_curso,
      semestre,
      limite_alunos,
      periodo,
      turno,
      sala,
      data_inicio,
      data_termino,
    } = req.body;
    const result = await pool
      .request()
      .input("id", sql.Int, id)
      .input("id_curso", sql.Int, id_curso)
      .input("semestre", sql.Int, semestre)
      .input("limite_alunos", sql.Int, limite_alunos)
      .input("periodo", sql.VarChar, periodo)
      .input("turno", sql.VarChar, turno)
      .input("sala", sql.VarChar, sala)
      .input("data_inicio", sql.Date, data_inicio)
      .input("data_termino", sql.Date, data_termino).query(`
                UPDATE turma 
                SET id_curso = @id_curso, semestre = @semestre, limite_alunos = @limite_alunos, 
                    periodo = @periodo, turno = @turno, sala = @sala, data_inicio = @data_inicio, data_termino = @data_termino 
                OUTPUT INSERTED.* 
                WHERE id_turma = @id
            `);

    if (result.recordset.length === 0) {
      return res.status(404).json({ error: "Turma não encontrada" });
    }
    res.json(result.recordset[0]);
  } catch (err) {
    console.error("Erro ao atualizar turma:", err);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
});

// DELETE - Excluir turma
app.delete("/api/turmas/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool
      .request()
      .input("id", sql.Int, id)
      .query("DELETE FROM turma WHERE id_turma = @id");

    if (result.rowsAffected[0] === 0) {
      return res.status(404).json({ error: "Turma não encontrada" });
    }
    res.json({ message: "Turma excluída com sucesso" });
  } catch (err) {
    console.error("Erro ao excluir turma:", err);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
});

// GET - Listar todos os alunos
app.get("/api/alunos", async (req, res) => {
  try {
    const result = await pool
      .request()
      .query("SELECT * FROM aluno ORDER BY nome");
    res.json(result.recordset);
  } catch (err) {
    console.error("Erro ao buscar alunos:", err);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
});

// POST - Criar novo aluno
app.post("/api/alunos", async (req, res) => {
  try {
    const { nome, cidade, estado, data_nascimento, status } = req.body;
    const result = await pool
      .request()
      .input("nome", sql.VarChar, nome)
      .input("cidade", sql.VarChar, cidade)
      .input("estado", sql.VarChar, estado)
      .input("data_nascimento", sql.Date, data_nascimento)
      .input("status", sql.VarChar, status).query(`
                INSERT INTO aluno (nome, cidade, estado, data_nascimento, status) 
                OUTPUT INSERTED.* 
                VALUES (@nome, @cidade, @estado, @data_nascimento, @status)
            `);
    res.status(201).json(result.recordset[0]);
  } catch (err) {
    console.error("Erro ao criar aluno:", err);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
});

// PUT - Atualizar aluno
app.put("/api/alunos/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { nome, cidade, estado, data_nascimento, status } = req.body;
    const result = await pool
      .request()
      .input("id", sql.Int, id)
      .input("nome", sql.VarChar, nome)
      .input("cidade", sql.VarChar, cidade)
      .input("estado", sql.VarChar, estado)
      .input("data_nascimento", sql.Date, data_nascimento)
      .input("status", sql.VarChar, status).query(`
                UPDATE aluno 
                SET nome = @nome, cidade = @cidade, estado = @estado, data_nascimento = @data_nascimento, status = @status 
                OUTPUT INSERTED.* 
                WHERE id_aluno = @id
            `);

    if (result.recordset.length === 0) {
      return res.status(404).json({ error: "Aluno não encontrado" });
    }
    res.json(result.recordset[0]);
  } catch (err) {
    console.error("Erro ao atualizar aluno:", err);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
});

// DELETE - Excluir aluno
app.delete("/api/alunos/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool
      .request()
      .input("id", sql.Int, id)
      .query("DELETE FROM aluno WHERE id_aluno = @id");

    if (result.rowsAffected[0] === 0) {
      return res.status(404).json({ error: "Aluno não encontrado" });
    }
    res.json({ message: "Aluno excluído com sucesso" });
  } catch (err) {
    console.error("Erro ao excluir aluno:", err);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
});

// GET - Listar todas as matrículas
app.get("/api/matriculas", async (req, res) => {
  try {
    const result = await pool.request().query(`
            SELECT m.*, a.nome as aluno_nome, t.periodo as turma_periodo, c.descricao as curso_nome
            FROM matricula m 
            JOIN aluno a ON m.id_aluno = a.id_aluno 
            JOIN turma t ON m.id_turma = t.id_turma
            JOIN curso c ON t.id_curso = c.id_curso
            ORDER BY m.data_matricula DESC
        `);
    res.json(result.recordset);
  } catch (err) {
    console.error("Erro ao buscar matrículas:", err);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
});

// POST - Criar nova matrícula
app.post("/api/matriculas", async (req, res) => {
  try {
    const { id_aluno, id_turma, status_matricula, observacoes } = req.body;
    const result = await pool
      .request()
      .input("id_aluno", sql.Int, id_aluno)
      .input("id_turma", sql.Int, id_turma)
      .input("status_matricula", sql.VarChar, status_matricula)
      .input("observacoes", sql.Text, observacoes).query(`
                INSERT INTO matricula (id_aluno, id_turma, status_matricula, observacoes) 
                OUTPUT INSERTED.* 
                VALUES (@id_aluno, @id_turma, @status_matricula, @observacoes)
            `);
    res.status(201).json(result.recordset[0]);
  } catch (err) {
    console.error("Erro ao criar matrícula:", err);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
});

// PUT - Atualizar matrícula
app.put("/api/matriculas/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { id_aluno, id_turma, status_matricula, observacoes } = req.body;
    const result = await pool
      .request()
      .input("id", sql.Int, id)
      .input("id_aluno", sql.Int, id_aluno)
      .input("id_turma", sql.Int, id_turma)
      .input("status_matricula", sql.VarChar, status_matricula)
      .input("observacoes", sql.Text, observacoes).query(`
                UPDATE matricula 
                SET id_aluno = @id_aluno, id_turma = @id_turma, status_matricula = @status_matricula, observacoes = @observacoes 
                OUTPUT INSERTED.* 
                WHERE id_matricula = @id
            `);

    if (result.recordset.length === 0) {
      return res.status(404).json({ error: "Matrícula não encontrada" });
    }
    res.json(result.recordset[0]);
  } catch (err) {
    console.error("Erro ao atualizar matrícula:", err);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
});

// DELETE - Excluir matrícula
app.delete("/api/matriculas/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool
      .request()
      .input("id", sql.Int, id)
      .query("DELETE FROM matricula WHERE id_matricula = @id");

    if (result.rowsAffected[0] === 0) {
      return res.status(404).json({ error: "Matrícula não encontrada" });
    }
    res.json({ message: "Matrícula excluída com sucesso" });
  } catch (err) {
    console.error("Erro ao excluir matrícula:", err);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
});

// GET - Listar todos os pagamentos
app.get("/api/pagamentos", async (req, res) => {
  try {
    const result = await pool.request().query(`
            SELECT p.*, m.id_aluno, a.nome as aluno_nome
            FROM pagamento p 
            JOIN matricula m ON p.id_matricula = m.id_matricula
            JOIN aluno a ON m.id_aluno = a.id_aluno
            ORDER BY p.data_pagamento DESC
        `);
    res.json(result.recordset);
  } catch (err) {
    console.error("Erro ao buscar pagamentos:", err);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
});

// POST - Criar novo pagamento
app.post("/api/pagamentos", async (req, res) => {
  try {
    const { id_matricula, valor, tipo_pagamento, periodo_referencia, status } =
      req.body;
    const result = await pool
      .request()
      .input("id_matricula", sql.Int, id_matricula)
      .input("valor", sql.Decimal(10, 2), valor)
      .input("tipo_pagamento", sql.VarChar, tipo_pagamento)
      .input("periodo_referencia", sql.VarChar, periodo_referencia)
      .input("status", sql.VarChar, status).query(`
                INSERT INTO pagamento (id_matricula, valor, tipo_pagamento, periodo_referencia, status) 
                OUTPUT INSERTED.* 
                VALUES (@id_matricula, @valor, @tipo_pagamento, @periodo_referencia, @status)
            `);
    res.status(201).json(result.recordset[0]);
  } catch (err) {
    console.error("Erro ao criar pagamento:", err);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
});

// PUT - Atualizar pagamento
app.put("/api/pagamentos/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { id_matricula, valor, tipo_pagamento, periodo_referencia, status } =
      req.body;
    const result = await pool
      .request()
      .input("id", sql.Int, id)
      .input("id_matricula", sql.Int, id_matricula)
      .input("valor", sql.Decimal(10, 2), valor)
      .input("tipo_pagamento", sql.VarChar, tipo_pagamento)
      .input("periodo_referencia", sql.VarChar, periodo_referencia)
      .input("status", sql.VarChar, status).query(`
                UPDATE pagamento 
                SET id_matricula = @id_matricula, valor = @valor, tipo_pagamento = @tipo_pagamento, 
                    periodo_referencia = @periodo_referencia, status = @status 
                OUTPUT INSERTED.* 
                WHERE id_pagamento = @id
            `);

    if (result.recordset.length === 0) {
      return res.status(404).json({ error: "Pagamento não encontrado" });
    }
    res.json(result.recordset[0]);
  } catch (err) {
    console.error("Erro ao atualizar pagamento:", err);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
});

// DELETE - Excluir pagamento
app.delete("/api/pagamentos/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool
      .request()
      .input("id", sql.Int, id)
      .query("DELETE FROM pagamento WHERE id_pagamento = @id");

    if (result.rowsAffected[0] === 0) {
      return res.status(404).json({ error: "Pagamento não encontrado" });
    }
    res.json({ message: "Pagamento excluído com sucesso" });
  } catch (err) {
    console.error("Erro ao excluir pagamento:", err);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
});

// Rota para servir a aplicação
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../public/index.html"));
});

// Inicialização do servidor
async function startServer() {
  await connectDB();

  app.listen(PORT, () => {
    console.log(`🚀 Servidor rodando na porta ${PORT}`);
    console.log(`📱 Acesse: http://localhost:${PORT}`);
    console.log(`🔗 API disponível em: http://localhost:${PORT}/api`);
  });
}

startServer().catch(console.error);
