const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const clearButton = document.getElementById('clear-button');
const submitButton = document.getElementById('submit-button');
const eraserButton = document.getElementById('eraser-button');
const resultElement = document.getElementById('result');
const toggleIcon = document.getElementById('toggle-icon');
const toggleText = document.getElementById('toggle-text');
const penSizeInput = document.getElementById('pen-size');
const eraserSizeInput = document.getElementById('eraser-size');
const colorButtons = document.querySelectorAll('.color-button');

const submitText = document.getElementById('submit-text');
const loadingSpinner = document.getElementById('loading-spinner');

let drawing = false;
let lastX, lastY;
let erasing = false; 
let penColor = 'white'; 
let penSize = 3; 
let eraserSize = 6;

ctx.fillStyle = 'black';
ctx.fillRect(0, 0, canvas.width, canvas.height);
ctx.strokeStyle = penColor;
ctx.lineWidth = penSize;
ctx.lineCap = 'round'; 

function getCanvasCoordinates(event) {
    const rect = canvas.getBoundingClientRect(); 
    const scaleX = canvas.width / rect.width;    
    const scaleY = canvas.height / rect.height;  

    let clientX, clientY;
    if (event.touches) { 
        clientX = event.touches[0].clientX;
        clientY = event.touches[0].clientY;
    } else { 
        clientX = event.clientX;
        clientY = event.clientY;
    }

    
    return {
        x: (clientX - rect.left) * scaleX,
        y: (clientY - rect.top) * scaleY
    };
}


canvas.addEventListener('mousedown', (e) => {
    drawing = true;
    const { x, y } = getCanvasCoordinates(e);
    [lastX, lastY] = [x, y];
});

canvas.addEventListener('mousemove', (e) => {
    if (drawing) {
        const { x, y } = getCanvasCoordinates(e);
        draw(x, y);
    }
});

canvas.addEventListener('mouseup', () => {
    drawing = false;
});

canvas.addEventListener('touchstart', (e) => {
    e.preventDefault(); 
    drawing = true;
    const { x, y } = getCanvasCoordinates(e);
    [lastX, lastY] = [x, y];
});

canvas.addEventListener('touchmove', (e) => {
    e.preventDefault(); 
    if (drawing) {
        const { x, y } = getCanvasCoordinates(e);
        draw(x, y);
    }
});

canvas.addEventListener('touchend', () => {
    drawing = false;
});

function draw(x, y) {
    ctx.beginPath();
    ctx.moveTo(lastX, lastY);
    ctx.lineTo(x, y);
    ctx.strokeStyle = erasing ? 'black' : penColor;
    ctx.lineWidth = erasing ? eraserSize : penSize;
    ctx.stroke();
    [lastX, lastY] = [x, y];
}


function resetCanvas() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    resultElement.innerHTML = ''; 
}


clearButton.addEventListener('click', resetCanvas);


eraserButton.addEventListener('click', () => {
    erasing = !erasing; 
    if (erasing) {
        ctx.lineWidth = eraserSize + 4; 
        toggleIcon.classList.remove('fa-eraser');
        toggleIcon.classList.add('fa-pen');
        eraserButton.classList.remove('bg-green-500');
        eraserButton.classList.add('bg-green-700'); 
    } else {
        ctx.lineWidth = penSize; 
        toggleIcon.classList.remove('fa-pen');
        toggleIcon.classList.add('fa-eraser');
        eraserButton.classList.remove('bg-green-700');
        eraserButton.classList.add('bg-green-500'); 
    }
});


penSizeInput.addEventListener('input', (e) => {
    penSize = e.target.value;
    ctx.lineWidth = penSize; 
});


eraserSizeInput.addEventListener('input', (e) => {
    eraserSize = e.target.value;
    ctx.lineWidth = eraserSize; 
});


colorButtons.forEach(button => {
    button.addEventListener('click', () => {
       
        colorButtons.forEach(btn => btn.style.outline = 'none');
        
 
        penColor = button.getAttribute('data-color');
        button.style.outline = `2px solid black`; 
        if (!erasing) {
            ctx.strokeStyle = penColor; 
        }
    });
});


submitButton.addEventListener('click', () => {

    submitText.textContent = 'Calculating...'; 
    loadingSpinner.classList.remove('hidden'); 
    submitButton.disabled = true; 

    const imageData = canvas.toDataURL();
    const data = {
        image: imageData,
        dict_of_vars: {},
    };

    fetch('/calculate', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    })
    .then((response) => response.json())
    .then((data) => {
        const results = data.data;
        resultElement.innerHTML = '';
        results.forEach((result) => {
            const resultDiv = document.createElement('div'); 
            resultDiv.className = 'bg-white p-2 mb-2 bg-rounded-md shadow-md outline rounded-lg outline-offset-2 outline-blue-500';
            resultDiv.textContent = `${result.expr} = ${result.result}`; 
            resultElement.appendChild(resultDiv);
        });
    })
    .catch((error) => {
        console.error('Error:', error);
    })
    .finally(() => {
       
        submitText.textContent = 'Calculate'; 
        loadingSpinner.classList.add('hidden');
        submitButton.disabled = false; 
    });
});