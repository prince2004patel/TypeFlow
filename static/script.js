let referenceText = '';
let typedText = '';
let startTime = null;
let isCompleted = false;
let soundEnabled = true;

// Audio context for keyboard sounds
const audioContext = new (window.AudioContext || window.webkitAudioContext)();

const textDisplay = document.getElementById('textDisplay');
const hiddenInput = document.getElementById('hiddenInput');
const statsContainer = document.getElementById('statsContainer');
const instruction = document.getElementById('instruction');
const generateBtn = document.getElementById('generateBtn');
const loadingMsg = document.getElementById('loadingMsg');
const typingContainer = document.getElementById('typingContainer');
const soundToggle = document.getElementById('soundToggle');

// More realistic mechanical keyboard sound
// More realistic mechanical keyboard sound
function playKeySound() {
    if (!soundEnabled) return;

    const now = audioContext.currentTime;

    // Click sound (sharp)
    const clickOsc = audioContext.createOscillator();
    const clickGain = audioContext.createGain();

    clickOsc.type = "square";
    clickOsc.frequency.setValueAtTime(2000 + Math.random() * 400, now); // sharp high pitch
    clickGain.gain.setValueAtTime(0.2, now);
    clickGain.gain.exponentialRampToValueAtTime(0.001, now + 0.03);

    clickOsc.connect(clickGain);
    clickGain.connect(audioContext.destination);

    clickOsc.start(now);
    clickOsc.stop(now + 0.05);

    // Body / "thock" sound (lower pitch resonance)
    const bodyOsc = audioContext.createOscillator();
    const bodyGain = audioContext.createGain();
    const bodyFilter = audioContext.createBiquadFilter();

    bodyOsc.type = "triangle";
    bodyOsc.frequency.setValueAtTime(150 + Math.random() * 50, now); // lower resonance
    bodyFilter.type = "lowpass";
    bodyFilter.frequency.setValueAtTime(800, now);

    bodyGain.gain.setValueAtTime(0.1, now);
    bodyGain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);

    bodyOsc.connect(bodyFilter);
    bodyFilter.connect(bodyGain);
    bodyGain.connect(audioContext.destination);

    bodyOsc.start(now);
    bodyOsc.stop(now + 0.12);

    // Optional subtle noise (to simulate plastic sound)
    const bufferSize = audioContext.sampleRate * 0.05;
    const buffer = audioContext.createBuffer(1, bufferSize, audioContext.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * 0.15; // very soft noise
    }

    const noise = audioContext.createBufferSource();
    noise.buffer = buffer;

    const noiseGain = audioContext.createGain();
    noiseGain.gain.setValueAtTime(0.05, now);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

    noise.connect(noiseGain);
    noiseGain.connect(audioContext.destination);

    noise.start(now);
    noise.stop(now + 0.05);
}


// Toggle sound on/off
function toggleSound() {
    soundEnabled = !soundEnabled;
    soundToggle.classList.toggle('active', soundEnabled);
    soundToggle.textContent = soundEnabled ? '🔊 sound on' : '🔇 sound off';
}

function focusInput() {
    if (referenceText && !isCompleted) {
        hiddenInput.focus();
    }
}

async function generateSentence() {
    const wordCount = document.getElementById('wordCount').value;
    const difficulty = document.getElementById('difficulty').value;

    generateBtn.disabled = true;
    loadingMsg.classList.remove('hidden');
    instruction.classList.add('hidden');
    textDisplay.innerHTML = '';
    hiddenInput.value = '';
    typedText = '';
    statsContainer.classList.add('hidden');
    isCompleted = false;
    startTime = null;

    try {
        const response = await fetch('/generate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ wordCount, difficulty })
        });

        const data = await response.json();
        
        if (data.sentence) {
            referenceText = data.sentence;
            displayText();
            focusInput();
        } else {
            instruction.textContent = 'error generating sentence, please try again';
            instruction.classList.remove('hidden');
        }
    } catch (error) {
        instruction.textContent = 'connection error, please try again';
        instruction.classList.remove('hidden');
    }

    loadingMsg.classList.add('hidden');
    generateBtn.disabled = false;
}

function displayText() {
    const words = referenceText.split(' ');
    let charIndex = 0;
    let html = '';
    
    words.forEach((word, wordIdx) => {
        html += '<span class="word">';
        
        for (let i = 0; i < word.length; i++) {
            const char = word[i];
            let cssClass = 'char';
            
            if (charIndex < typedText.length) {
                if (typedText[charIndex] === char) {
                    cssClass = 'char correct';
                } else {
                    cssClass = 'char incorrect';
                }
            } else if (charIndex === typedText.length) {
                cssClass = 'char cursor';
            }
            
            html += `<span class="${cssClass}">${char}</span>`;
            charIndex++;
        }
        
        html += '</span>';
        
        if (wordIdx < words.length - 1) {
            let spaceClass = 'char';
            if (charIndex < typedText.length) {
                if (typedText[charIndex] === ' ') {
                    spaceClass = 'char correct';
                } else {
                    spaceClass = 'char incorrect';
                }
            } else if (charIndex === typedText.length) {
                spaceClass = 'char cursor';
            }
            html += `<span class="${spaceClass}">&nbsp;</span>`;
            charIndex++;
        }
    });
    
    textDisplay.innerHTML = html;
}

hiddenInput.addEventListener('input', function(e) {
    if (isCompleted) return;

    // Play keyboard sound
    playKeySound();

    if (!startTime && this.value.length > 0) {
        startTime = Date.now();
    }

    typedText = this.value;
    displayText();

    if (typedText.length >= referenceText.length) {
        isCompleted = true;
        finishTyping();
    }
});

function finishTyping() {
    const endTime = Date.now();
    const timeElapsed = (endTime - startTime) / 1000;
    
    const words = referenceText.trim().split(/\s+/).length;
    const wpm = Math.round((words / timeElapsed) * 60);
    const accuracy = calculateAccuracy();
    
    let correctChars = 0;
    for (let i = 0; i < Math.min(referenceText.length, typedText.length); i++) {
        if (referenceText[i] === typedText[i]) correctChars++;
    }

    hiddenInput.blur();

    textDisplay.innerHTML = `
        <div style="display: flex; gap: 3rem; flex-wrap: wrap; justify-content: center; align-items: center; margin-top: 2rem;">
            <div style="text-align: center; min-width: 100px;">
                <div style="color: #646669; font-size: 0.85rem; margin-bottom: 0.4rem;">wpm</div>
                <div style="color: #4a9eff; font-size: 2.5rem; font-weight: 600;">${wpm}</div>
            </div>
            <div style="text-align: center; min-width: 100px;">
                <div style="color: #646669; font-size: 0.85rem; margin-bottom: 0.4rem;">accuracy</div>
                <div style="color: #4a9eff; font-size: 2.5rem; font-weight: 600;">${accuracy}%</div>
            </div>
            <div style="text-align: center; min-width: 100px;">
                <div style="color: #646669; font-size: 0.85rem; margin-bottom: 0.4rem;">time</div>
                <div style="color: #4a9eff; font-size: 2.5rem; font-weight: 600;">${timeElapsed.toFixed(1)}s</div>
            </div>
            <div style="text-align: center; min-width: 100px;">
                <div style="color: #646669; font-size: 0.85rem; margin-bottom: 0.4rem;">characters</div>
                <div style="color: #4a9eff; font-size: 2.5rem; font-weight: 600;">${correctChars}/${referenceText.length}</div>
            </div>
        </div>
        <div style="text-align: center; margin-top: 2rem;">
            <button onclick="restartTest()" style="background-color: transparent; border: none; color: #646669; font-size: 0.9rem; cursor: pointer; padding: 0.5rem 1rem; transition: color 0.2s; font-family: inherit;">next test (tab + enter)</button>
        </div>
    `;
    
    instruction.classList.add('hidden');
    statsContainer.classList.add('hidden');
}

function calculateAccuracy() {
    let correct = 0;
    const minLen = Math.min(referenceText.length, typedText.length);
    
    for (let i = 0; i < minLen; i++) {
        if (referenceText[i] === typedText[i]) {
            correct++;
        }
    }
    
    return Math.round((correct / referenceText.length) * 100);
}

function restartTest() {
    hiddenInput.value = '';
    typedText = '';
    startTime = null;
    isCompleted = false;
    generateSentence();
}

document.addEventListener('click', focusInput);

// Keyboard shortcuts
document.addEventListener('keydown', (e) => {
    // Tab + Enter to restart
    if ((e.key === 'Enter' && e.shiftKey) || (e.code === 'Enter' && isCompleted)) {
        e.preventDefault();
        restartTest();
    }
    
    // Escape to restart current test
    if (e.key === 'Escape' && referenceText && !isCompleted) {
        e.preventDefault();
        hiddenInput.value = '';
        typedText = '';
        startTime = null;
        displayText();
        focusInput();
    }
});