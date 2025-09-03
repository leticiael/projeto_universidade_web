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
    connectionTimeout: 60000,
    requestTimeout: 60000
  }
};

// Estados brasileiros - apenas os válidos no banco
const estados = ['SP', 'RJ', 'MG', 'ES', 'PR', 'MS', 'BA', 'RS', 'SC', 'GO', 'MT'];

// Cidades por estado (apenas estados válidos)
const cidades = {
  'SP': ['São Paulo', 'Campinas', 'Santos', 'Ribeirão Preto', 'Sorocaba'],
  'RJ': ['Rio de Janeiro', 'Niterói', 'Petrópolis', 'Nova Iguaçu', 'Campos'],
  'MG': ['Belo Horizonte', 'Uberlândia', 'Contagem', 'Juiz de Fora', 'Betim'],
  'PR': ['Curitiba', 'Londrina', 'Maringá', 'Ponta Grossa', 'Cascavel'],
  'SC': ['Florianópolis', 'Joinville', 'Blumenau', 'São José', 'Criciúma'],
  'RS': ['Porto Alegre', 'Caxias do Sul', 'Pelotas', 'Canoas', 'Santa Maria'],
  'BA': ['Salvador', 'Feira de Santana', 'Vitória da Conquista', 'Camaçari', 'Juazeiro'],
  'GO': ['Goiânia', 'Aparecida de Goiânia', 'Anápolis', 'Rio Verde', 'Luziânia'],
  'ES': ['Vitória', 'Vila Velha', 'Cariacica', 'Serra', 'Cachoeiro de Itapemirim'],
  'MT': ['Cuiabá', 'Várzea Grande', 'Rondonópolis', 'Sinop', 'Tangará da Serra'],
  'MS': ['Campo Grande', 'Dourados', 'Três Lagoas', 'Corumbá', 'Ponta Porã']
};

function getCidadeByEstado(estado) {
  const cidadesEstado = cidades[estado];
  if (cidadesEstado) {
    return faker.helpers.arrayElement(cidadesEstado);
  }
  return faker.location.city();
}

// Função para criar departamentos
async function createDepartamentos(pool, count = 25) {
  console.log(`📚 Criando ${count} departamentos...`);
  
  const areasConhecimento = [
    'Ciências Exatas', 'Ciências Humanas', 'Ciências Biológicas', 
    'Engenharias', 'Ciências Sociais Aplicadas', 'Linguística, Letras e Artes',
    'Ciências da Saúde', 'Ciências Agrárias', 'Multidisciplinar', 'Tecnologia da Informação',
    'Administração e Negócios', 'Comunicação e Marketing', 'Design e Artes Visuais',
    'Educação e Pedagogia', 'Meio Ambiente e Sustentabilidade'
  ];
  
  const departamentos = [];
  
  for (let i = 0; i < count; i++) {
    const area = faker.helpers.arrayElement(areasConhecimento);
    const descricao = `Departamento de ${area} ${faker.number.int({ min: 1, max: 99 })}`;
    
    try {
      const result = await pool.request()
        .input('descricao', sql.VarChar, descricao)
        .query('INSERT INTO departamento (descricao) OUTPUT INSERTED.id_departamento VALUES (@descricao)');
      
      departamentos.push(result.recordset[0].id_departamento);
    } catch (error) {
      console.error('Erro ao criar departamento:', error.message);
    }
  }
  
  console.log(`✅ ${departamentos.length} departamentos criados!`);
  return departamentos;
}

// Função para criar cursos
async function createCursos(pool, departamentos, count = 100) {
  console.log(`🎓 Criando ${count} cursos...`);
  
  const nomesCursos = [
    'Administração', 'Engenharia Civil', 'Direito', 'Medicina', 'Psicologia',
    'Ciência da Computação', 'Enfermagem', 'Arquitetura', 'Contabilidade', 'Pedagogia',
    'Engenharia Elétrica', 'Fisioterapia', 'Marketing', 'Biomedicina', 'Nutrição',
    'Engenharia Mecânica', 'Farmácia', 'Jornalismo', 'Educação Física', 'Veterinária',
    'Design Gráfico', 'Turismo', 'Gastronomia', 'Sistemas de Informação', 'Odontologia',
    'Engenharia de Produção', 'Serviço Social', 'Geografia', 'História', 'Matemática',
    'Física', 'Química', 'Biologia', 'Letras', 'Filosofia', 'Sociologia',
    'Engenharia Química', 'Engenharia de Software', 'Análise de Sistemas', 'Logística',
    'Gestão de Recursos Humanos', 'Ciências Econômicas', 'Relações Internacionais',
    'Comunicação Social', 'Publicidade e Propaganda', 'Design de Interiores',
    'Engenharia Ambiental', 'Gestão Ambiental', 'Agronomia', 'Zootecnia'
  ];
  
  const cursos = [];
  
  for (let i = 0; i < count; i++) {
    const descricao = faker.helpers.arrayElement(nomesCursos);
    // Criar sigla sem caracteres especiais e com máximo 4 caracteres
    const siglaBase = descricao.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^A-Za-z]/g, '').substring(0, 3).toUpperCase();
    const sigla = siglaBase + faker.number.int({ min: 1, max: 9 });
    const valor_mensalidade = faker.number.float({ min: 500, max: 3000, fractionDigits: 2 });
    const duracao_semestres = faker.helpers.arrayElement([6, 8, 10, 12]);
    const id_departamento = faker.helpers.arrayElement(departamentos);
    
    try {
      const result = await pool.request()
        .input('id_departamento', sql.Int, id_departamento)
        .input('descricao', sql.VarChar, descricao)
        .input('sigla', sql.VarChar, sigla)
        .input('valor_mensalidade', sql.Decimal, valor_mensalidade)
        .input('duracao_semestres', sql.Int, duracao_semestres)
        .query(`INSERT INTO curso (id_departamento, descricao, sigla, valor_mensalidade, duracao_semestres) 
                OUTPUT INSERTED.id_curso 
                VALUES (@id_departamento, @descricao, @sigla, @valor_mensalidade, @duracao_semestres)`);
      
      cursos.push(result.recordset[0].id_curso);
    } catch (error) {
      console.error('Erro ao criar curso:', error.message);
    }
  }
  
  console.log(`✅ ${cursos.length} cursos criados!`);
  return cursos;
}

// Função para criar turmas
async function createTurmas(pool, cursos, count = 500) {
  console.log(`🏫 Criando ${count} turmas...`);
  
  const turmas = [];
  const turnos = ['matutino', 'vespertino', 'noturno'];
  const periodos = ['2024.1', '2024.2', '2025.1', '2025.2'];
  
  for (let i = 0; i < count; i++) {
    const id_curso = faker.helpers.arrayElement(cursos);
    const semestre = faker.number.int({ min: 1, max: 8 });
    const periodo = faker.helpers.arrayElement(periodos);
    const turno = faker.helpers.arrayElement(turnos);
    const limite_alunos = faker.number.int({ min: 25, max: 60 });
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
  
  console.log(`✅ ${turmas.length} turmas criadas!`);
  return turmas;
}

// Função principal para popular 15.000 alunos
async function populate15kStudents() {
  console.log('🚀 Iniciando população do banco com 15.000 alunos...\n');
  const startTime = Date.now();
  
  try {
    const pool = await sql.connect(config);
    console.log('✅ Conectado ao SQL Server!\n');
    
    // Verificar se já existem departamentos, cursos e turmas
    let departamentos = [];
    let cursos = [];
    let turmas = [];
    
    const deptResult = await pool.request().query('SELECT id_departamento FROM departamento');
    departamentos = deptResult.recordset.map(d => d.id_departamento);
    
    const cursoResult = await pool.request().query('SELECT id_curso FROM curso');
    cursos = cursoResult.recordset.map(c => c.id_curso);
    
    const turmaResult = await pool.request().query('SELECT id_turma FROM turma');
    turmas = turmaResult.recordset.map(t => t.id_turma);
    
    // Criar estrutura se necessário
    if (departamentos.length < 20) {
      const novosDepts = await createDepartamentos(pool, 25);
      departamentos.push(...novosDepts);
    }
    
    if (cursos.length < 50) {
      const novosCursos = await createCursos(pool, departamentos, 100);
      cursos.push(...novosCursos);
    }
    
    if (turmas.length < 200) {
      const novasTurmas = await createTurmas(pool, cursos, 500);
      turmas.push(...novasTurmas);
    }
    
    console.log(`📊 Estrutura disponível: ${departamentos.length} departamentos, ${cursos.length} cursos, ${turmas.length} turmas\n`);
    
    // Criar 15.000 alunos em lotes
    console.log('👨‍🎓 Criando 15.000 alunos...');
    const alunos = [];
    const batchSize = 500;
    const totalAlunos = 15000;
    
    for (let batch = 0; batch < Math.ceil(totalAlunos / batchSize); batch++) {
      const batchStart = batch * batchSize;
      const batchEnd = Math.min(batchStart + batchSize, totalAlunos);
      const batchCount = batchEnd - batchStart;
      
      console.log(`  📝 Lote ${batch + 1}: criando alunos ${batchStart + 1} a ${batchEnd}`);
      
      for (let i = 0; i < batchCount; i++) {
        const nome = faker.person.fullName();
        const estado = faker.helpers.arrayElement(estados);
        const cidade = getCidadeByEstado(estado);
        const data_nascimento = faker.date.between({ from: '1980-01-01', to: '2005-12-31' });
        const status = faker.helpers.weightedArrayElement([
          { weight: 0.85, value: 'ativo' },
          { weight: 0.10, value: 'inativo' },
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
        } catch (error) {
          console.error(`Erro ao criar aluno ${batchStart + i + 1}:`, error.message);
        }
      }
      
      console.log(`  ✅ Lote ${batch + 1} concluído (${alunos.length} alunos criados)`);
    }
    
    console.log(`✅ Total de ${alunos.length} alunos criados!\n`);
    
    // Criar matrículas
    console.log('📋 Criando matrículas...');
    const matriculas = [];
    
    for (let batch = 0; batch < Math.ceil(alunos.length / batchSize); batch++) {
      const batchStart = batch * batchSize;
      const batchEnd = Math.min(batchStart + batchSize, alunos.length);
      
      console.log(`  📝 Lote ${batch + 1}: matrículas ${batchStart + 1} a ${batchEnd}`);
      
      for (let i = batchStart; i < batchEnd; i++) {
        const id_aluno = alunos[i];
        const id_turma = faker.helpers.arrayElement(turmas);
        const data_matricula = faker.date.between({ from: '2024-01-01', to: '2025-09-01' });
        const status_matricula = faker.helpers.weightedArrayElement([
          { weight: 0.85, value: 'ativa' },
          { weight: 0.10, value: 'trancada' },
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
      
      console.log(`  ✅ Lote ${batch + 1} de matrículas concluído (${matriculas.length} matrículas)`);
    }
    
    console.log(`✅ Total de ${matriculas.length} matrículas criadas!\n`);
    
    // Criar pagamentos
    console.log('💰 Criando pagamentos...');
    let totalPagamentos = 0;
    
    for (let batch = 0; batch < Math.ceil(matriculas.length / batchSize); batch++) {
      const batchStart = batch * batchSize;
      const batchEnd = Math.min(batchStart + batchSize, matriculas.length);
      
      console.log(`  📝 Lote ${batch + 1}: pagamentos para matrículas ${batchStart + 1} a ${batchEnd}`);
      
      for (let i = batchStart; i < batchEnd; i++) {
        const id_matricula = matriculas[i];
        
        // 1-3 pagamentos por matrícula
        const numPagamentos = faker.number.int({ min: 1, max: 3 });
        
        for (let j = 0; j < numPagamentos; j++) {
          const valor = faker.number.float({ min: 300, max: 2500, fractionDigits: 2 });
          const tipo_pagamento = faker.helpers.arrayElement(['mensalidade', 'taxa', 'multa', 'outros']);
          const periodo_referencia = faker.helpers.arrayElement(['2024.1', '2024.2', '2025.1', '2025.2']);
          const status = faker.helpers.weightedArrayElement([
            { weight: 0.65, value: 'pago' },
            { weight: 0.20, value: 'pendente' },
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
      
      console.log(`  ✅ Lote ${batch + 1} de pagamentos concluído (${totalPagamentos} pagamentos)`);
    }
    
    console.log(`✅ Total de ${totalPagamentos} pagamentos criados!\n`);
    
    // Estatísticas finais
    const endTime = Date.now();
    const duration = Math.round((endTime - startTime) / 1000);
    const minutes = Math.floor(duration / 60);
    const seconds = duration % 60;
    
    console.log('🎉 POPULAÇÃO DE 15.000 ALUNOS CONCLUÍDA! 🎉');
    console.log('==========================================');
    console.log(`📚 Departamentos: ${departamentos.length}`);
    console.log(`🎓 Cursos: ${cursos.length}`);
    console.log(`🏫 Turmas: ${turmas.length}`);
    console.log(`👨‍🎓 Alunos: ${alunos.length}`);
    console.log(`📋 Matrículas: ${matriculas.length}`);
    console.log(`💰 Pagamentos: ${totalPagamentos}`);
    console.log(`⏱️  Tempo total: ${minutes}m ${seconds}s`);
    console.log('==========================================\n');
    
    await pool.close();
    
  } catch (error) {
    console.error('❌ Erro durante a população:', error);
  }
}

// Executar
populate15kStudents();
