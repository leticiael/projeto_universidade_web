# 🏫 Sistema de Gestão Acadêmica

Sistema completo de gestão universitária com backend Node.js/Express, frontend HTML/CSS/JS e banco de dados SQL Server via Docker.

## 📋 Pré-requisitos

- **Docker Desktop** instalado e funcionando
- **Node.js** (versão 16 ou superior)
- **npm** (geralmente vem com o Node.js)

## 🚀 Como rodar o projeto

### 1. Clone o repositório
```bash
git clone <url-do-repositorio>
cd projeto_universidade_web
```

### 2. Instale as dependências
```bash
npm install
```

### 3. Suba o banco de dados SQL Server
```bash
docker-compose up -d
```

### 4. Execute os scripts SQL
Aguarde cerca de 20 segundos para o SQL Server inicializar completamente, depois execute:

```bash
# Criar o banco de dados
docker exec -i sqlserver_universidade /opt/mssql-tools18/bin/sqlcmd -S localhost -U sa -P MinhaSenh@123 -C -Q "CREATE DATABASE ProjetoUniversidadeWeb;"

# Executar script completo
docker exec -i sqlserver_universidade /opt/mssql-tools18/bin/sqlcmd -S localhost -U sa -P MinhaSenh@123 -C -i /docker-entrypoint-initdb.d/projeto_universidade_web.sql
```

### 5. Inicie o servidor Node.js
```bash
npm start
```

### 6. Acesse o sistema
Abra seu navegador e acesse: **http://localhost:3000**

## 🗃️ Estrutura do Banco

O sistema possui as seguintes entidades:
- **Departamentos** (Exatas, Humanas, Biológicas)
- **Cursos** (vinculados aos departamentos)
- **Turmas** (períodos e horários dos cursos)
- **Alunos** (estudantes matriculados)
- **Matrículas** (vínculo aluno-turma)
- **Pagamentos** (mensalidades e taxas)

## 🔧 Funcionalidades

### ✅ CRUD Completo
- ✅ **Criar** novos registros
- ✅ **Listar** todos os registros
- ✅ **Editar** registros existentes
- ✅ **Excluir** registros (com validação de dependências)

### ✅ Funcionalidades Especiais
- **Busca/Filtro** em tempo real nas tabelas
- **Validação de dependências** antes de excluir
- **Interface responsiva** e moderna
- **Navegação por abas** para cada entidade

## 🗂️ Estrutura de Arquivos

```
projeto_universidade_web/
│
├── public/                  # Frontend
│   ├── index.html          # Página principal
│   ├── css/style.css       # Estilos
│   └── js/app.js           # JavaScript do frontend
│
├── src/                    # Backend
│   └── app.js              # Servidor Express/API REST
│
├── projeto_universidade_web.sql  # Script de criação do banco
├── cria_usuario_bd.sql           # Script para usuário SA
├── docker-compose.yml            # Configuração Docker
├── package.json                  # Dependências Node.js
└── README.md                     # Este arquivo
```

## 🔗 API Endpoints

### Departamentos
- `GET /api/departamentos` - Listar todos
- `POST /api/departamentos` - Criar novo
- `PUT /api/departamentos/:id` - Atualizar
- `DELETE /api/departamentos/:id` - Excluir

### Cursos
- `GET /api/cursos` - Listar todos
- `POST /api/cursos` - Criar novo
- `PUT /api/cursos/:id` - Atualizar
- `DELETE /api/cursos/:id` - Excluir

### Turmas
- `GET /api/turmas` - Listar todas
- `POST /api/turmas` - Criar nova
- `PUT /api/turmas/:id` - Atualizar
- `DELETE /api/turmas/:id` - Excluir

### Alunos
- `GET /api/alunos` - Listar todos
- `POST /api/alunos` - Criar novo
- `PUT /api/alunos/:id` - Atualizar
- `DELETE /api/alunos/:id` - Excluir (remove dependências)

### Matrículas
- `GET /api/matriculas` - Listar todas
- `POST /api/matriculas` - Criar nova
- `PUT /api/matriculas/:id` - Atualizar
- `DELETE /api/matriculas/:id` - Excluir

### Pagamentos
- `GET /api/pagamentos` - Listar todos
- `POST /api/pagamentos` - Criar novo
- `PUT /api/pagamentos/:id` - Atualizar
- `DELETE /api/pagamentos/:id` - Excluir

## 🛠️ Troubleshooting

### Container do SQL Server não inicia
```bash
# Verificar logs
docker logs sqlserver_universidade

# Reiniciar container
docker-compose down
docker-compose up -d
```

### Erro de conexão com o banco
Verifique se:
1. O container está rodando: `docker ps`
2. A senha está correta: `MinhaSenh@123`
3. O servidor Node.js foi reiniciado após mudanças

### Frontend não carrega
1. Verifique se o servidor está rodando na porta 3000
2. Acesse diretamente: http://localhost:3000
3. Verifique o console do navegador para erros JavaScript

## 🎯 Projeto Acadêmico

Este é um projeto desenvolvido para fins acadêmicos, demonstrando:
- **Backend Development** com Node.js/Express
- **Integração com Banco de Dados** SQL Server
- **Containerização** com Docker
- **Frontend Dinâmico** com JavaScript vanilla
- **API RESTful** completa
- **CRUD** com validações de integridade referencial

---

💡 **Dica**: Para parar o sistema, use `Ctrl+C` no terminal do Node.js e `docker-compose down` para parar o SQL Server.
