# ARMenu - Visualização de Pratos em Realidade Aumentada

Aplicação web otimizada para dispositivos móveis que permite aos clientes visualizar pratos de restaurante em realidade aumentada (AR) usando a câmera do celular.

## 🚀 Funcionalidades

- **Visualização AR**: Visualize pratos em tamanho real sobre superfícies reais usando WebXR
- **Modelos 3D**: Suporte para arquivos .glb (formato GLTF binário)
- **Interatividade**: 
  - Rotação manual (toque e arraste)
  - Zoom com gesto de pinça
  - Rotação automática suave
- **Informações do Prato**: Exibição de medidas (diâmetro, altura), descrição e preço
- **Painel Administrativo**: Adicione e gerencie pratos facilmente
- **Design Responsivo**: Interface otimizada para dispositivos móveis

## 📋 Requisitos

- Navegador moderno com suporte a WebXR (Chrome/Edge no Android, Safari no iOS 15+)
- Dispositivo móvel com câmera
- Conexão HTTPS (necessário para WebXR)

## 🛠️ Tecnologias Utilizadas

- **Three.js**: Renderização 3D e suporte a WebXR
- **WebXR API**: Realidade aumentada no navegador
- **HTML5/CSS3/JavaScript**: Interface e lógica da aplicação
- **LocalStorage**: Armazenamento local de dados dos pratos

## 📦 Instalação

1. Clone ou baixe o repositório
2. Certifique-se de que todos os arquivos estão na mesma pasta:
   - `index.html`
   - `styles.css`
   - `app.js`
   - `pizza.glb` (ou seus próprios modelos .glb)

3. Para desenvolvimento local, use um servidor HTTP (WebXR requer HTTPS em produção):
   ```bash
   # Python 3
   python -m http.server 8000
   
   # Node.js (com http-server)
   npx http-server -p 8000
   ```

4. Acesse `http://localhost:8000` no navegador do seu dispositivo móvel

## 📱 Como Usar

### Para Clientes:

1. Acesse o site no seu celular
2. Escolha um prato no menu
3. O modelo 3D será carregado na tela
4. Toque e arraste para rotacionar o prato
5. Use gesto de pinça para dar zoom
6. Clique em "Iniciar AR" para visualizar em realidade aumentada (requer permissão da câmera)
7. Use "Resetar Posição" para voltar à posição inicial

### Para Administradores:

1. Clique no botão "⚙️ Admin" no canto inferior direito
2. Preencha o formulário com as informações do prato:
   - Nome do prato
   - Descrição
   - Diâmetro (cm)
   - Altura (cm)
   - Preço
   - Arquivo 3D (.glb)
   - Imagem do prato (opcional)
3. Clique em "Adicionar Prato"
4. Gerencie pratos existentes na lista abaixo

## 🎨 Estrutura de Arquivos

```
ARMenu/
├── index.html          # Estrutura HTML principal
├── styles.css          # Estilos CSS responsivos
├── app.js              # Lógica JavaScript e AR
├── pizza.glb           # Modelo 3D de exemplo
└── README.md           # Este arquivo
```

## 🔧 Configuração de Modelos 3D

Os modelos devem estar no formato `.glb` (GLTF binário). Para criar seus próprios modelos:

1. Use ferramentas como Blender, Maya ou 3ds Max
2. Exporte no formato GLTF 2.0 (binário)
3. Certifique-se de que o modelo está dimensionado corretamente (as medidas serão ajustadas automaticamente com base nas dimensões informadas)

## 🌐 Compatibilidade

### Navegadores Suportados:
- **Android**: Chrome 81+, Edge 81+
- **iOS**: Safari 15+ (com limitações de WebXR)
- **Desktop**: Chrome/Edge (para testes, mas otimizado para mobile)

### Recursos Necessários:
- WebGL 2.0
- WebXR API (para modo AR)
- Câmera do dispositivo (para AR)

## 📝 Notas Importantes

- **HTTPS**: Em produção, o site deve estar em HTTPS para que o WebXR funcione
- **Permissões**: O navegador solicitará permissão para acessar a câmera ao iniciar o AR
- **Performance**: Modelos muito complexos podem afetar a performance em dispositivos mais antigos
- **Armazenamento**: Os dados são salvos localmente no navegador (LocalStorage)

## 🐛 Solução de Problemas

### AR não inicia:
- Verifique se o navegador suporta WebXR
- Certifique-se de que o site está em HTTPS (ou localhost)
- Verifique as permissões da câmera no navegador

### Modelo não carrega:
- Verifique se o arquivo .glb existe no caminho especificado
- Confirme que o arquivo não está corrompido
- Verifique o console do navegador para erros

### Performance lenta:
- Reduza a complexidade do modelo 3D
- Feche outras abas do navegador
- Use um dispositivo mais recente

## 📄 Licença

Este projeto é de código aberto e está disponível para uso livre.

## 🤝 Contribuições

Contribuições são bem-vindas! Sinta-se à vontade para abrir issues ou pull requests.

---

Desenvolvido com ❤️ para revolucionar a experiência de visualização de pratos em restaurantes.
