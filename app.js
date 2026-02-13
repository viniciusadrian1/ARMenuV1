import * as THREE from 'three';
import { GLTFLoader } from 'https://cdn.jsdelivr.net/npm/three@0.160.0/examples/jsm/loaders/GLTFLoader.js';

// Estado da aplicação
const state = {
    currentDish: null,
    dishes: [],
    scene: null,
    camera: null,
    renderer: null,
    arSession: null,
    model: null,
    controls: {
        isDragging: false,
        previousTouch: null,
        previousTouch2: null,
        rotation: { x: 0, y: 0 },
        position: { x: 0, y: 0, z: 0 },
        scale: 1,
        baseScale: 1
    }
};

// Inicialização
document.addEventListener('DOMContentLoaded', () => {
    initializeApp();
    loadDishes();
    setupEventListeners();
});

// Inicializar aplicação
function initializeApp() {
    // Carregar pratos do localStorage
    const savedDishes = localStorage.getItem('armenu_dishes');
    if (savedDishes) {
        state.dishes = JSON.parse(savedDishes);
    } else {
        // Prato padrão (pizza.glb)
        state.dishes = [{
            id: '1',
            name: 'Pizza Margherita',
            description: 'Pizza tradicional italiana',
            diameter: 30,
            height: 2,
            price: 45.00,
            modelPath: 'pizza.glb',
            image: null
        }];
        saveDishes();
    }
    
    renderDishes();
}

// Carregar pratos
function loadDishes() {
    renderDishes();
}

// Renderizar pratos no menu
function renderDishes() {
    const container = document.getElementById('dishes-container');
    container.innerHTML = '';
    
    state.dishes.forEach(dish => {
        const card = document.createElement('div');
        card.className = 'dish-card';
        card.onclick = () => openARView(dish);
        
        const image = document.createElement('div');
        image.className = 'dish-image';
        if (dish.image) {
            const img = document.createElement('img');
            img.src = dish.image;
            img.className = 'dish-image';
            image.appendChild(img);
        } else {
            image.style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
            image.style.display = 'flex';
            image.style.alignItems = 'center';
            image.style.justifyContent = 'center';
            image.textContent = '🍽️';
            image.style.fontSize = '3rem';
        }
        
        const name = document.createElement('div');
        name.className = 'dish-name';
        name.textContent = dish.name;
        
        const price = document.createElement('div');
        price.className = 'dish-price';
        price.textContent = `R$ ${dish.price.toFixed(2)}`;
        
        card.appendChild(image);
        card.appendChild(name);
        card.appendChild(price);
        container.appendChild(card);
    });
}

// Abrir visualização AR
function openARView(dish) {
    state.currentDish = dish;
    document.getElementById('menu-screen').classList.remove('active');
    document.getElementById('ar-screen').classList.add('active');
    
    document.getElementById('dish-name').textContent = dish.name;
    document.getElementById('dish-measures').innerHTML = `
        <p><strong>Diâmetro:</strong> ${dish.diameter} cm</p>
        <p><strong>Altura:</strong> ${dish.height} cm</p>
        ${dish.description ? `<p><strong>Descrição:</strong> ${dish.description}</p>` : ''}
        <p><strong>Preço:</strong> R$ ${dish.price.toFixed(2)}</p>
    `;
    
    initializeAR();
}

// Inicializar AR
function initializeAR() {
    const container = document.getElementById('ar-container');
    
    // Limpar container
    container.innerHTML = '';
    
    // Criar cena
    state.scene = new THREE.Scene();
    
    // Criar câmera
    state.camera = new THREE.PerspectiveCamera(
        75,
        window.innerWidth / window.innerHeight,
        0.1,
        1000
    );
    state.camera.position.set(0, 1.6, 0);
    
    // Criar renderer
    state.renderer = new THREE.WebGLRenderer({ 
        antialias: true,
        alpha: true 
    });
    state.renderer.setSize(window.innerWidth, window.innerHeight);
    state.renderer.setPixelRatio(window.devicePixelRatio);
    state.renderer.xr.enabled = true;
    container.appendChild(state.renderer.domElement);
    
    // Adicionar luzes
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    state.scene.add(ambientLight);
    
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(5, 10, 5);
    state.scene.add(directionalLight);
    
    // Carregar modelo 3D
    loadModel(state.currentDish.modelPath);
    
    // Configurar controles de toque
    setupTouchControls();
    
    // Ajustar tamanho da janela
    window.addEventListener('resize', onWindowResize);
    
    // Iniciar loop de renderização
    state.renderer.setAnimationLoop(animate);
}

// Carregar modelo 3D
function loadModel(modelPath) {
    showLoading(true);
    
    const loader = new GLTFLoader();
    loader.load(
        modelPath,
        (gltf) => {
            // Remover modelo anterior se existir
            if (state.model) {
                state.scene.remove(state.model);
            }
            
            state.model = gltf.scene;
            
            // Calcular bounding box para dimensionar corretamente
            const box = new THREE.Box3().setFromObject(state.model);
            const size = box.getSize(new THREE.Vector3());
            const maxDim = Math.max(size.x, size.y, size.z);
            
            // Escalar baseado nas dimensões reais do prato
            const realSize = Math.max(state.currentDish.diameter / 100, state.currentDish.height / 100);
            const scale = realSize / maxDim;
            state.controls.baseScale = scale;
            state.model.scale.set(scale, scale, scale);
            
            // Centralizar modelo
            const center = box.getCenter(new THREE.Vector3());
            state.model.position.sub(center);
            state.model.position.y = state.currentDish.height / 200; // Metade da altura
            
            // Adicionar à cena
            state.scene.add(state.model);
            
            // Posicionar câmera para visualizar o modelo
            state.camera.position.set(0, 1.6, 1.5);
            state.camera.lookAt(0, 0.5, 0);
            
            showLoading(false);
        },
        (progress) => {
            // Progresso do carregamento
            console.log('Carregando:', (progress.loaded / progress.total * 100) + '%');
        },
        (error) => {
            console.error('Erro ao carregar modelo:', error);
            showLoading(false);
            alert('Erro ao carregar o modelo 3D. Verifique se o arquivo existe.');
        }
    );
}

// Configurar controles de toque
function setupTouchControls() {
    const canvas = state.renderer.domElement;
    
    // Toque único - rotação
    canvas.addEventListener('touchstart', onTouchStart, { passive: false });
    canvas.addEventListener('touchmove', onTouchMove, { passive: false });
    canvas.addEventListener('touchend', onTouchEnd, { passive: false });
    
    // Mouse (para desktop)
    canvas.addEventListener('mousedown', onMouseDown);
    canvas.addEventListener('mousemove', onMouseMove);
    canvas.addEventListener('mouseup', onMouseUp);
    canvas.addEventListener('wheel', onWheel, { passive: false });
}

// Eventos de toque
function onTouchStart(event) {
    event.preventDefault();
    
    if (event.touches.length === 1) {
        state.controls.isDragging = true;
        state.controls.previousTouch = {
            x: event.touches[0].clientX,
            y: event.touches[0].clientY
        };
    } else if (event.touches.length === 2) {
        state.controls.isDragging = false;
        const touch1 = event.touches[0];
        const touch2 = event.touches[1];
        state.controls.previousTouch = {
            x: (touch1.clientX + touch2.clientX) / 2,
            y: (touch1.clientY + touch2.clientY) / 2
        };
        state.controls.previousTouch2 = {
            distance: Math.hypot(
                touch2.clientX - touch1.clientX,
                touch2.clientY - touch1.clientY
            )
        };
    }
}

function onTouchMove(event) {
    event.preventDefault();
    
    if (!state.model) return;
    
    if (event.touches.length === 1 && state.controls.isDragging) {
        const touch = event.touches[0];
        const deltaX = touch.clientX - state.controls.previousTouch.x;
        const deltaY = touch.clientY - state.controls.previousTouch.y;
        
        // Rotação
        state.controls.rotation.y += deltaX * 0.01;
        state.controls.rotation.x += deltaY * 0.01;
        
        state.model.rotation.y = state.controls.rotation.y;
        state.model.rotation.x = state.controls.rotation.x;
        
        state.controls.previousTouch = {
            x: touch.clientX,
            y: touch.clientY
        };
    } else if (event.touches.length === 2) {
        const touch1 = event.touches[0];
        const touch2 = event.touches[1];
        const currentDistance = Math.hypot(
            touch2.clientX - touch1.clientX,
            touch2.clientY - touch1.clientY
        );
        
        if (state.controls.previousTouch2) {
            const scaleChange = currentDistance / state.controls.previousTouch2.distance;
            state.controls.scale *= scaleChange;
            state.controls.scale = Math.max(0.5, Math.min(3, state.controls.scale));
            
            const finalScale = state.controls.baseScale * state.controls.scale;
            state.model.scale.set(finalScale, finalScale, finalScale);
        }
        
        state.controls.previousTouch2 = {
            distance: currentDistance
        };
    }
}

function onTouchEnd(event) {
    state.controls.isDragging = false;
    state.controls.previousTouch = null;
    state.controls.previousTouch2 = null;
}

// Eventos de mouse
let isMouseDown = false;
let previousMouse = null;

function onMouseDown(event) {
    isMouseDown = true;
    previousMouse = {
        x: event.clientX,
        y: event.clientY
    };
}

function onMouseMove(event) {
    if (!isMouseDown || !state.model) return;
    
    const deltaX = event.clientX - previousMouse.x;
    const deltaY = event.clientY - previousMouse.y;
    
    state.controls.rotation.y += deltaX * 0.01;
    state.controls.rotation.x += deltaY * 0.01;
    
    state.model.rotation.y = state.controls.rotation.y;
    state.model.rotation.x = state.controls.rotation.x;
    
    previousMouse = {
        x: event.clientX,
        y: event.clientY
    };
}

function onMouseUp() {
    isMouseDown = false;
    previousMouse = null;
}

function onWheel(event) {
    event.preventDefault();
    if (!state.model) return;
    
    const scaleChange = event.deltaY > 0 ? 0.9 : 1.1;
    state.controls.scale *= scaleChange;
    state.controls.scale = Math.max(0.5, Math.min(3, state.controls.scale));
    
    const finalScale = state.controls.baseScale * state.controls.scale;
    state.model.scale.set(finalScale, finalScale, finalScale);
}

// Verificar suporte WebXR
function checkWebXRSupport() {
    if (!navigator.xr) {
        return false;
    }
    
    return navigator.xr.isSessionSupported('immersive-ar').catch(() => false);
}

// Iniciar sessão AR
async function startARSession() {
    // Verificar suporte
    const isSupported = await checkWebXRSupport();
    
    if (!isSupported) {
        alert('AR não é suportado neste dispositivo/navegador.\n\nRequisitos:\n- Chrome/Edge no Android\n- Safari no iOS 15+\n- Site em HTTPS\n- Permissão da câmera');
        return;
    }
    
    const sessionInit = {
        requiredFeatures: ['local-floor'],
        optionalFeatures: ['bounded-floor', 'hand-tracking']
    };
    
    state.renderer.xr.enabled = true;
    
    try {
        const session = await navigator.xr.requestSession('immersive-ar', sessionInit);
        state.arSession = session;
        state.renderer.xr.setSession(session);
        
        // Posicionar modelo no espaço AR
        if (state.model) {
            state.model.position.set(0, 0, -1);
        }
        
        document.getElementById('start-ar-btn').style.display = 'none';
        document.getElementById('reset-position-btn').style.display = 'none';
        
        session.addEventListener('end', () => {
            document.getElementById('start-ar-btn').style.display = 'block';
            document.getElementById('reset-position-btn').style.display = 'block';
            state.arSession = null;
        });
    } catch (error) {
        console.error('Erro ao iniciar sessão AR:', error);
        let errorMsg = 'Não foi possível iniciar a sessão AR.';
        
        if (error.name === 'NotAllowedError') {
            errorMsg += '\n\nPor favor, permita o acesso à câmera nas configurações do navegador.';
        } else if (error.name === 'NotSupportedError') {
            errorMsg += '\n\nSeu dispositivo/navegador não suporta AR.';
        }
        
        alert(errorMsg);
    }
}

// Resetar posição do modelo
function resetModelPosition() {
    if (!state.model) return;
    
    state.controls.rotation = { x: 0, y: 0 };
    state.controls.scale = 1;
    state.model.rotation.set(0, 0, 0);
    
    const finalScale = state.controls.baseScale;
    state.model.scale.set(finalScale, finalScale, finalScale);
    
    state.model.position.set(0, state.currentDish.height / 200, 0);
}

// Animação
function animate() {
    if (!state.renderer || !state.scene || !state.camera) return;
    
    // Rotação automática suave (opcional)
    if (state.model && !state.controls.isDragging && !isMouseDown) {
        state.model.rotation.y += 0.005;
    }
    
    state.renderer.render(state.scene, state.camera);
}

// Ajustar tamanho da janela
function onWindowResize() {
    if (!state.camera || !state.renderer) return;
    
    state.camera.aspect = window.innerWidth / window.innerHeight;
    state.camera.updateProjectionMatrix();
    state.renderer.setSize(window.innerWidth, window.innerHeight);
}

// Mostrar/ocultar loading
function showLoading(show) {
    const overlay = document.getElementById('loading-overlay');
    if (show) {
        overlay.classList.add('active');
    } else {
        overlay.classList.remove('active');
    }
}

// Configurar event listeners
function setupEventListeners() {
    // Botão voltar
    document.getElementById('back-btn').addEventListener('click', () => {
        document.getElementById('ar-screen').classList.remove('active');
        document.getElementById('menu-screen').classList.add('active');
        
        // Limpar recursos
        if (state.renderer) {
            state.renderer.dispose();
            state.renderer = null;
        }
        state.scene = null;
        state.camera = null;
        state.model = null;
        state.controls = {
            isDragging: false,
            previousTouch: null,
            previousTouch2: null,
            rotation: { x: 0, y: 0 },
            position: { x: 0, y: 0, z: 0 },
            scale: 1,
            baseScale: 1
        };
    });
    
    // Botão iniciar AR
    const startARBtn = document.getElementById('start-ar-btn');
    startARBtn.addEventListener('click', startARSession);
    
    // Verificar suporte WebXR e ajustar botão
    checkWebXRSupport().then(supported => {
        if (!supported) {
            startARBtn.textContent = 'AR Não Disponível';
            startARBtn.style.opacity = '0.6';
            startARBtn.style.cursor = 'not-allowed';
        }
    });
    
    // Botão resetar posição
    document.getElementById('reset-position-btn').addEventListener('click', resetModelPosition);
    
    // Botão admin
    document.getElementById('admin-btn').addEventListener('click', () => {
        document.getElementById('menu-screen').classList.remove('active');
        document.getElementById('admin-screen').classList.add('active');
        renderAdminDishes();
    });
    
    // Fechar admin
    document.getElementById('close-admin-btn').addEventListener('click', () => {
        document.getElementById('admin-screen').classList.remove('active');
        document.getElementById('menu-screen').classList.add('active');
    });
    
    // Formulário de adicionar prato
    document.getElementById('dish-form').addEventListener('submit', (e) => {
        e.preventDefault();
        addNewDish();
    });
}

// Adicionar novo prato
function addNewDish() {
    const name = document.getElementById('dish-name-input').value;
    const description = document.getElementById('dish-description').value;
    const diameter = parseFloat(document.getElementById('dish-diameter').value) || 0;
    const height = parseFloat(document.getElementById('dish-height').value) || 0;
    const price = parseFloat(document.getElementById('dish-price').value) || 0;
    const modelFile = document.getElementById('dish-model').files[0];
    const imageFile = document.getElementById('dish-image').files[0];
    
    if (!modelFile) {
        alert('Por favor, selecione um arquivo .glb');
        return;
    }
    
    // Ler arquivo de modelo
    const modelReader = new FileReader();
    modelReader.onload = (e) => {
        const modelBlob = e.target.result;
        const modelUrl = URL.createObjectURL(new Blob([modelBlob], { type: 'application/octet-stream' }));
        
        let imageUrl = null;
        
        if (imageFile) {
            const imageReader = new FileReader();
            imageReader.onload = (imgE) => {
                imageUrl = imgE.target.result;
                saveDish(name, description, diameter, height, price, modelUrl, imageUrl);
            };
            imageReader.readAsDataURL(imageFile);
        } else {
            saveDish(name, description, diameter, height, price, modelUrl, null);
        }
    };
    modelReader.readAsArrayBuffer(modelFile);
}

function saveDish(name, description, diameter, height, price, modelPath, image) {
    const newDish = {
        id: Date.now().toString(),
        name,
        description,
        diameter,
        height,
        price,
        modelPath,
        image
    };
    
    state.dishes.push(newDish);
    saveDishes();
    renderDishes();
    renderAdminDishes();
    
    // Limpar formulário
    document.getElementById('dish-form').reset();
    alert('Prato adicionado com sucesso!');
}

// Renderizar pratos no admin
function renderAdminDishes() {
    const container = document.getElementById('admin-dishes-list');
    container.innerHTML = '';
    
    state.dishes.forEach(dish => {
        const item = document.createElement('div');
        item.className = 'admin-dish-item';
        
        const info = document.createElement('div');
        info.innerHTML = `
            <strong>${dish.name}</strong><br>
            <small>${dish.diameter}cm × ${dish.height}cm - R$ ${dish.price.toFixed(2)}</small>
        `;
        
        const deleteBtn = document.createElement('button');
        deleteBtn.textContent = 'Excluir';
        deleteBtn.onclick = () => deleteDish(dish.id);
        
        item.appendChild(info);
        item.appendChild(deleteBtn);
        container.appendChild(item);
    });
}

// Excluir prato
function deleteDish(id) {
    if (confirm('Tem certeza que deseja excluir este prato?')) {
        state.dishes = state.dishes.filter(dish => dish.id !== id);
        saveDishes();
        renderDishes();
        renderAdminDishes();
    }
}

// Salvar pratos no localStorage
function saveDishes() {
    localStorage.setItem('armenu_dishes', JSON.stringify(state.dishes));
}
