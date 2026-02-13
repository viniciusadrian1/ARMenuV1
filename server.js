const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 8000;

// Configurar headers CORS e MIME types
app.use((req, res, next) => {
    // Permitir CORS
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    
    // Configurar MIME types para arquivos .glb
    if (req.path.endsWith('.glb')) {
        res.type('model/gltf-binary');
    }
    
    next();
});

// Servir arquivos estáticos
app.use(express.static(path.join(__dirname), {
    setHeaders: (res, filepath) => {
        if (filepath.endsWith('.glb')) {
            res.setHeader('Content-Type', 'model/gltf-binary');
        }
    }
}));

// Rota para index.html
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Rota catch-all para SPA (caso necessário)
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Iniciar servidor
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Servidor rodando na porta ${PORT}`);
    console.log(`Acesse: http://localhost:${PORT}`);
});
