// DOM Elements
const antGrid = document.getElementById('ant-grid');
const addAntButton = document.getElementById('add-ant');
const modal = document.getElementById('ant-modal');
const closeModal = document.querySelector('.close');
const antForm = document.getElementById('ant-form');
const randomizeRulesBtn = document.getElementById('randomize-rules');
const randomizeColorsBtn = document.getElementById('randomize-colors');

// Store all active ant simulations
const activeAnts = new Map();

// API URL from config
const API_URL = config.apiUrl;

// Modal handling
addAntButton.addEventListener('click', () => {
    modal.style.display = 'block';
});

closeModal.addEventListener('click', () => {
    modal.style.display = 'none';
});

window.addEventListener('click', (e) => {
    if (e.target === modal) {
        modal.style.display = 'none';
    }
});

// Randomization functions
function generateRandomRules() {
    const length = Math.floor(Math.random() * 3) + 2; // 2-4 rules
    const rules = [];
    for (let i = 0; i < length; i++) {
        rules.push(Math.random() < 0.5 ? 'L' : 'R');
    }
    return rules.join(',');
}

function generateRandomColors() {
    const length = Math.floor(Math.random() * 3) + 2; // 2-4 colors
    const colors = [];
    for (let i = 0; i < length; i++) {
        const r = Math.floor(Math.random() * 256);
        const g = Math.floor(Math.random() * 256);
        const b = Math.floor(Math.random() * 256);
        colors.push(`#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`);
    }
    return colors.join(',');
}

// Randomize button handlers
randomizeRulesBtn.addEventListener('click', () => {
    document.getElementById('rules').value = generateRandomRules();
});

randomizeColorsBtn.addEventListener('click', () => {
    document.getElementById('colors').value = generateRandomColors();
});

// Form submission
antForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const antData = {
        name: document.getElementById('ant-name').value,
        creator: document.getElementById('creator-name').value,
        gridSize: parseInt(document.getElementById('grid-size').value),
        rules: document.getElementById('rules').value.split(',').map(r => r.trim().toUpperCase()),
        colors: document.getElementById('colors').value.split(',').map(c => c.trim())
    };
    
    // Validate inputs
    if (antData.rules.some(r => r !== 'L' && r !== 'R')) {
        alert('Rules must be either L or R');
        return;
    }
    
    if (antData.rules.length !== antData.colors.length) {
        alert('Number of rules must match number of colors');
        return;
    }
    
    try {
        // Save to database
        const response = await fetch(`${API_URL}/ants`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(antData)
        });
        
        if (!response.ok) {
            throw new Error('Failed to save ant');
        }
        
        // Create new ant simulation
        createAntSimulation(antData);
        
        // Reset form and close modal
        antForm.reset();
        modal.style.display = 'none';
    } catch (error) {
        alert('Error saving ant: ' + error.message);
    }
});

function createAntSimulation(antData) {
    // Create container
    const container = document.createElement('div');
    container.className = 'ant-container';
    
    // Create canvas
    const canvas = document.createElement('canvas');
    canvas.className = 'ant-canvas';
    canvas.width = 300;
    canvas.height = 300;
    
    // Create info section
    const info = document.createElement('div');
    info.className = 'ant-info';
    info.innerHTML = `
        <h3>${antData.name}</h3>
        <p>Created by ${antData.creator}</p>
    `;
    
    // Add elements to container
    container.appendChild(canvas);
    container.appendChild(info);
    antGrid.appendChild(container);
    
    // Create ant simulation
    const ant = new LangstonsAnt(canvas, antData.gridSize, antData.rules, antData.colors);
    activeAnts.set(container, ant);
    
    // Start the simulation automatically
    ant.start();
}

// Load ants from the server
async function loadAnts() {
    try {
        const response = await fetch(`${API_URL}/ants`);
        if (!response.ok) {
            throw new Error('Failed to load ants');
        }
        
        const ants = await response.json();
        
        // Clear existing ants
        antGrid.innerHTML = '';
        activeAnts.clear();
        
        // Create simulations for each ant
        ants.forEach(ant => createAntSimulation(ant));
    } catch (error) {
        console.error('Error loading ants:', error);
        // Load example ants if server is not available
        loadExampleAnts();
    }
}

// Load example ants (fallback)
function loadExampleAnts() {
    // Classic Langston's Ant
    createAntSimulation({
        name: 'Classic Langston\'s Ant',
        creator: 'System',
        gridSize: 50,
        rules: ['L', 'R'],
        colors: ['#FFFFFF', '#000000']
    });
    
    // Three-state ant
    createAntSimulation({
        name: 'Three-State Ant',
        creator: 'System',
        gridSize: 50,
        rules: ['L', 'R', 'L'],
        colors: ['#FFFFFF', '#000000', '#FF0000']
    });
}

// Load ants when the page loads
window.addEventListener('load', loadAnts); 