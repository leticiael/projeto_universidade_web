# Script PowerShell para criar a estrutura de pastas do projeto Universidade Web
# Execute este arquivo dentro da pasta raiz do projeto (projeto_universidade_web)

# Criação das pastas do backend
New-Item -ItemType Directory -Path "src" -Force
New-Item -ItemType Directory -Path "src\controllers" -Force
New-Item -ItemType Directory -Path "src\routes" -Force
New-Item -ItemType Directory -Path "src\database" -Force
New-Item -ItemType Directory -Path "src\scripts" -Force

# Criação do arquivo principal do backend
New-Item -ItemType File -Path "src\app.js" -Force

# Criação das pastas do frontend
New-Item -ItemType Directory -Path "public" -Force
New-Item -ItemType Directory -Path "public\css" -Force
New-Item -ItemType Directory -Path "public\js" -Force

# Criação do arquivo README.md na raiz do projeto
New-Item -ItemType File -Path "README.md" -Force

# Comentários sobre as responsabilidades de cada pasta
Write-Host "\nEstrutura criada com sucesso!"
Write-Host "\nResponsabilidades das pastas:"
Write-Host "src/           -> Código-fonte do backend (Node.js/Express)"
Write-Host "src/controllers/ -> Lógica de negócio de cada entidade (ex: departamentoController.js)"
Write-Host "src/routes/      -> Definição das rotas/endpoints da API (ex: departamentoRoutes.js)"
Write-Host "src/database/    -> Configuração e utilitários para conexão com o banco de dados (ex: db.js)"
Write-Host "src/scripts/     -> Scripts auxiliares, como geração de dados fake com Faker.js"
Write-Host "src/app.js       -> Arquivo principal do backend (servidor Express)"
Write-Host "public/          -> Arquivos estáticos do frontend (HTML, CSS, JS)"
Write-Host "public/css/      -> Arquivos de estilos (CSS puro)"
Write-Host "public/js/       -> Scripts JavaScript do frontend (consumo da API)" 