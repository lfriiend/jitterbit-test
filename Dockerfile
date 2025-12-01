FROM node:20-alpine

# Padrão de mercado para evitar conflito com pastas do sistema
WORKDIR /usr/src/app

# Copia package.json e package-lock.json (se existir)
COPY package*.json yarn.lock ./

# Instala as dependências
RUN yarn install --frozen-lockfile

# Copia o restante dos arquivos
COPY . .

# Informa que o container vai expor a porta 3000
EXPOSE 3000

# Inicia a aplicação
CMD ["yarn", "start"]