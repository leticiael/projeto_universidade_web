const { faker } = require('@faker-js/faker');
const sql = require('mssql');

// Configuração da conexão
const config = {
  user: 'sa',
  password: 'MinhaSenh@123',
  server: 'localhost',
  database: 'ProjetoUniversidadeWeb',
  options: {
    encrypt: true,
    trustServerCertificate: true,
    connectionTimeout: 30000,
    requestTimeout: 30000
  }
};

// Estados brasileiros
const estados = ['SP', 'RJ', 'MG', 'PR', 'SC', 'RS', 'BA', 'GO'];

// Cidades por estado
const cidades = {
  'SP': ['São Paulo', 'Campinas', 'Santos', 'Ribeirão Preto'],
  'RJ': ['Rio de Janeiro', 'Niterói', 'Petrópolis', 'Nova Iguaçu'],
  'MG': ['Belo Horizonte', 'Uberlândia', 'Contagem', 'Juiz de Fora'],
  'PR': ['Curitiba', 'Londrina', 'Maringá', 'Ponta Grossa'],
  'SC': ['Florianópolis', 'Joinville', 'Blumenau', 'São José'],
  'RS': ['Porto Alegre', 'Caxias do Sul', 'Pelotas', 'Canoas'],
  'BA': ['Salvador', 'Feira de Santana', 'Vitória da Conquista', 'Camaçari'],
  'GO': ['Goiânia', 'Aparecida de Goiânia', 'Anápolis', 'Rio Verde']
};

function getCidadeByEstado(estado) {
  const cidadesEstado = cidades[estado];
  if (cidadesEstado) {
    return faker.helpers.arrayElement(cidadesEstado);
  }
  return faker.location.city();
}

// Função de teste com menor quantidade
async function testPopulate() {
  console.log('🧪 Iniciando teste de população...\n');
  
  try {
    const pool = await sql.connect(config);
    console.log('✅ Conectado ao SQL Server!\n');
    
    // Criar apenas 100 alunos para teste
    console.log('👨‍🎓 Criando 100 alunos de teste...');
    const alunos = [];
    
    for (let i = 0; i < 100; i++) {
      const nome = faker.person.fullName();
      const estado = faker.helpers.arrayElement(estados);
      const cidade = getCidadeByEstado(estado);
      const data_nascimento = faker.date.between({ from: '1980-01-01', to: '2005-12-31' });
      const status = faker.helpers.weightedArrayElement([
        { weight: 0.8, value: 'ativo' },
        { weight: 0.15, value: 'inativo' },
        { weight: 0.05, value: 'trancado' }
      ]);
      
      try {
        const result = await pool.request()
          .input('nome', sql.VarChar, nome)
          .input('cidade', sql.VarChar, cidade)
          .input('estado', sql.VarChar, estado)
          .input('data_nascimento', sql.Date, data_nascimento)
          .input('status', sql.VarChar, status)
          .query(`INSERT INTO aluno (nome, cidade, estado, data_nascimento, status) 
                  OUTPUT INSERTED.id_aluno 
                  VALUES (@nome, @cidade, @estado, @data_nascimento, @status)`);
        
        alunos.push(result.recordset[0].id_aluno);
        
        if ((i + 1) % 20 === 0) {
          console.log(`  ✅ ${i + 1} alunos criados...`);
        }
      } catch (error) {
        console.error(`Erro ao criar aluno ${i + 1}:`, error.message);
      }
    }
    
    console.log(`✅ Total de ${alunos.length} alunos criados!\n`);
    
    // Obter turmas existentes
    const turmasResult = await pool.request().query('SELECT id_turma FROM turma');
    const turmasExistentes = turmasResult.recordset.map(t => t.id_turma);
    
    if (turmasExistentes.length === 0) {
      console.log('❌ Nenhuma turma encontrada. Criando turmas primeiro...');
      
      // Obter cursos existentes
      const cursosResult = await pool.request().query('SELECT id_curso FROM curso');
      const cursosExistentes = cursosResult.recordset.map(c => c.id_curso);
      
      if (cursosExistentes.length === 0) {
        console.log('❌ Nenhum curso encontrado. Execute o script completo primeiro.');
        return;
      }
      
      // Criar algumas turmas
      console.log('🏫 Criando 10 turmas...');
      const turmas = [];
      const turnos = ['matutino', 'vespertino', 'noturno'];
      const periodos = ['2024.1', '2024.2', '2025.1'];
      
      for (let i = 0; i < 10; i++) {
        const id_curso = faker.helpers.arrayElement(cursosExistentes);
        const semestre = faker.number.int({ min: 1, max: 8 });
        const periodo = faker.helpers.arrayElement(periodos);
        const turno = faker.helpers.arrayElement(turnos);
        const limite_alunos = faker.number.int({ min: 30, max: 50 });
        const sala = `Sala ${faker.number.int({ min: 100, max: 999 })}`;
        const data_inicio = faker.date.between({ from: '2024-01-01', to: '2025-12-31' });
        const data_termino = new Date(data_inicio);
        data_termino.setMonth(data_termino.getMonth() + 6);
        
        try {
          const result = await pool.request()
            .input('id_curso', sql.Int, id_curso)
            .input('semestre', sql.Int, semestre)
            .input('periodo', sql.VarChar, periodo)
            .input('turno', sql.VarChar, turno)
            .input('limite_alunos', sql.Int, limite_alunos)
            .input('sala', sql.VarChar, sala)
            .input('data_inicio', sql.Date, data_inicio)
            .input('data_termino', sql.Date, data_termino)
            .query(`INSERT INTO turma (id_curso, semestre, periodo, turno, limite_alunos, sala, data_inicio, data_termino) 
                    OUTPUT INSERTED.id_turma 
                    VALUES (@id_curso, @semestre, @periodo, @turno, @limite_alunos, @sala, @data_inicio, @data_termino)`);
          
          turmas.push(result.recordset[0].id_turma);
        } catch (error) {
          console.error('Erro ao criar turma:', error.message);
        }
      }
      
      turmasExistentes.push(...turmas);
      console.log(`✅ ${turmas.length} turmas criadas!\n`);
    }
    
    // Criar matrículas para os alunos
    console.log('📋 Criando matrículas...');
    const matriculas = [];
    
    for (let i = 0; i < alunos.length; i++) {
      const id_aluno = alunos[i];
      const id_turma = faker.helpers.arrayElement(turmasExistentes);
      const data_matricula = faker.date.between({ from: '2024-01-01', to: '2025-09-01' });
      const status_matricula = faker.helpers.weightedArrayElement([
        { weight: 0.8, value: 'ativa' },
        { weight: 0.15, value: 'trancada' },
        { weight: 0.05, value: 'cancelada' }
      ]);
      
      try {
        const result = await pool.request()
          .input('id_aluno', sql.Int, id_aluno)
          .input('id_turma', sql.Int, id_turma)
          .input('data_matricula', sql.Date, data_matricula)
          .input('status_matricula', sql.VarChar, status_matricula)
          .query(`INSERT INTO matricula (id_aluno, id_turma, data_matricula, status_matricula) 
                  OUTPUT INSERTED.id_matricula 
                  VALUES (@id_aluno, @id_turma, @data_matricula, @status_matricula)`);
        
        matriculas.push(result.recordset[0].id_matricula);
      } catch (error) {
        console.error(`Erro ao criar matrícula para aluno ${id_aluno}:`, error.message);
      }
    }
    
    console.log(`✅ ${matriculas.length} matrículas criadas!\n`);
    
    // Criar pagamentos
    console.log('💰 Criando pagamentos...');
    let totalPagamentos = 0;
    
    for (const id_matricula of matriculas) {
      // 1-2 pagamentos por matrícula
      const numPagamentos = faker.number.int({ min: 1, max: 2 });
      
      for (let j = 0; j < numPagamentos; j++) {
        const valor = faker.number.float({ min: 300, max: 1500, fractionDigits: 2 });
        const tipo_pagamento = faker.helpers.arrayElement(['mensalidade', 'taxa', 'multa']);
        const periodo_referencia = faker.helpers.arrayElement(['2024.1', '2024.2', '2025.1']);
        const status = faker.helpers.weightedArrayElement([
          { weight: 0.6, value: 'pago' },
          { weight: 0.25, value: 'pendente' },
          { weight: 0.15, value: 'atrasado' }
        ]);
        
        try {
          await pool.request()
            .input('id_matricula', sql.Int, id_matricula)
            .input('valor', sql.Decimal, valor)
            .input('tipo_pagamento', sql.VarChar, tipo_pagamento)
            .input('periodo_referencia', sql.VarChar, periodo_referencia)
            .input('status', sql.VarChar, status)
            .query(`INSERT INTO pagamento (id_matricula, valor, tipo_pagamento, periodo_referencia, status) 
                    VALUES (@id_matricula, @valor, @tipo_pagamento, @periodo_referencia, @status)`);
          
          totalPagamentos++;
        } catch (error) {
          console.error(`Erro ao criar pagamento para matrícula ${id_matricula}:`, error.message);
        }
      }
    }
    
    console.log(`✅ ${totalPagamentos} pagamentos criados!\n`);
    
    console.log('🎉 TESTE CONCLUÍDO! 🎉');
    console.log('========================');
    console.log(`👨‍🎓 Alunos: ${alunos.length}`);
    console.log(`📋 Matrículas: ${matriculas.length}`);
    console.log(`💰 Pagamentos: ${totalPagamentos}`);
    console.log('========================\n');
    
    await pool.close();
    
  } catch (error) {
    console.error('❌ Erro durante o teste:', error);
  }
}

testPopulate();
