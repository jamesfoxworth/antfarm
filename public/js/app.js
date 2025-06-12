async function saveAnt() {
    const antData = {
        name: document.getElementById('antName').value,
        creator: document.getElementById('creatorName').value,
        gridSize: parseInt(document.getElementById('gridSize').value),
        rules: currentRules,
        colors: currentColors
    };

    try {
        console.log('Saving ant:', antData);
        const response = await fetch('/api/ants', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(antData)
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to save ant');
        }

        const savedAnt = await response.json();
        console.log('Ant saved successfully:', savedAnt);
        alert('Ant saved successfully!');
        closeModal();
    } catch (error) {
        console.error('Error saving ant:', error);
        alert('Error saving ant: ' + error.message);
    }
}

async function loadAnts() {
    try {
        console.log('Loading ants...');
        const response = await fetch('/api/ants');
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to load ants');
        }

        const ants = await response.json();
        console.log('Loaded ants:', ants.length);
        
        const antList = document.getElementById('antList');
        antList.innerHTML = '';
        
        ants.forEach(ant => {
            const antElement = document.createElement('div');
            antElement.className = 'ant-item';
            antElement.innerHTML = `
                <h3>${ant.name}</h3>
                <p>Created by: ${ant.creator}</p>
                <p>Grid Size: ${ant.gridSize}x${ant.gridSize}</p>
                <button onclick="loadAnt('${ant._id}')">Load</button>
            `;
            antList.appendChild(antElement);
        });
    } catch (error) {
        console.error('Error loading ants:', error);
        alert('Error loading ants: ' + error.message);
    }
} 