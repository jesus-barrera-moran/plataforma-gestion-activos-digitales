# Usa una imagen base de Node.js con la versión específica
FROM node:18.20.4

# Establece el directorio de trabajo
WORKDIR /app

# Copia los archivos necesarios
COPY package.json package-lock.json ./
RUN npm install
COPY . .

# Exponer el puerto (cambia el puerto si es necesario)
EXPOSE 3000

# Comando para iniciar la aplicación en modo desarrollo
CMD ["npm", "run", "dev"]
