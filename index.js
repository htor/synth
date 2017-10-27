/* audio */

const synth = {
    keyboard: {
        q: { freq: 261.63, osc: null, key: 'c', keyHuman: 'C', pressed: false, dom: null },
        a: { freq: 277.18, osc: null, key: 'db', keyHuman: 'D♭', pressed: false, dom: null },
        w: { freq: 293.66, osc: null, key: 'd', keyHuman: 'D', pressed: false, dom: null },
        s: { freq: 311.13, osc: null, key: 'eb', keyHuman: 'E♭', pressed: false, dom: null },
        e: { freq: 329.63, osc: null, key: 'e', keyHuman: 'E', pressed: false, dom: null },
        d: { freq: 349.23, osc: null, key: 'f', keyHuman: 'F', pressed: false, dom: null },
        r: { freq: 369.99, osc: null, key: 'gb', keyHuman: 'G♭', pressed: false, dom: null },
        f: { freq: 392.00, osc: null, key: 'g', keyHuman: 'G', pressed: false, dom: null },
        t: { freq: 415.30, osc: null, key: 'ab', keyHuman: 'A♭', pressed: false, dom: null },
        g: { freq: 440, osc: null, key: 'a', keyHuman: 'A', pressed: false, dom: null },
        y: { freq: 466.16, osc: null, key: 'bb', keyHuman: 'B♭', pressed: false, dom: null },
        h: { freq: 493.88, osc: null, key: 'b', keyHuman: 'B', pressed: false, dom: null },
    },
    octaveRange: 1,
    currentFreq: null
};

const onMouseDown = event => {
    let key = synth.keyboard[event.target.dataset.char];
    if (!key || key.pressed) return;
    key.osc.frequency.value = key.freq * synth.octaveRange;
    key.osc.connect(synth.gain);
    key.pressed = true;
    synth.currentFreq = key.osc.frequency.value;
    key.dom.classList.toggle('down');
    updateDisplay();
};

const onMouseUp = event => {
    let key = synth.keyboard[event.target.dataset.char];
    if (!key || !key.pressed) return;
    key.dom.classList.toggle('down');
    key.osc.disconnect(synth.gain);
    key.pressed = false;
};

const onKeyDown = event => {
    let key = synth.keyboard[event.key];
    if (!key || key.pressed) return;
    key.osc.frequency.value = key.freq * synth.octaveRange;
    key.osc.connect(synth.gain);
    key.pressed = true;
    synth.currentFreq = key.osc.frequency.value;
    key.dom.classList.toggle('down');
    updateDisplay();
};

const onKeyUp = event => {
    if (event.key === 'z') {
        octaveDown();
    } else if (event.key === 'x') {
        octaveUp();
    } else {
        let key = synth.keyboard[event.key];
        if (!key || !key.pressed) return;
        key.osc.disconnect(synth.gain);
        key.pressed = false;
        key.dom.classList.toggle('down');
    }
};

const octaveUp = () => {
    synth.octaveRange *= 2;
    updateDisplay();
};

const octaveDown = () => {
    synth.octaveRange /= 2;
    updateDisplay();
};

const display = document.querySelector('.display');
const waveControl = document.querySelector('.wave-control');
const volumeControl = document.querySelector('.volume-control');
const detuneControl = document.querySelector('.detune-control');
const panningControl = document.querySelector('.panning-control');
const lfoGainControl = document.querySelector('.lfo-gain-control');
const lfoFreqControl = document.querySelector('.lfo-freq-control');
const lfoModulationControl = document.querySelector('.lfo-modulation-control');
const keyboard = document.querySelector('.keyboard');

const updateDisplay = () => {
    display.innerHTML = `volume: ${Math.round(100 * synth.gain.gain.value)}%<br>` +
        `octave range: ${synth.octaveRange}<br>` +
        `freq: ${synth.currentFreq ? synth.currentFreq.toFixed(2) : '-'}<br>` +
        `wave: ${synth.wave}<br>` +
        `detune: ${synth.detune}<br>` +
        `lfo freq: ${synth.lfo.frequency.value.toFixed(2)}<br>` +
        `lfo gain: ${synth.lfoGain.gain.value.toFixed(2)}<br>` +
        `lfo mod type: ${synth.lfoModType}<br>`
}
const setup = () => {
    synth.context = new AudioContext();
    synth.lfo = synth.context.createOscillator();
    synth.lfo.frequency.value = 0;
    synth.lfo.type = 'sine';
    synth.lfoGain = synth.context.createGain();
    synth.lfoGain.gain.value = 0.5;
    synth.gain = synth.context.createGain();
    synth.gain.gain.value = 1;
    synth.panning = synth.context.createStereoPanner();

    synth.lfoModType = '-';
    synth.wave = 'sine';
    synth.detune = 0;

    synth.lfo.connect(synth.lfoGain);
    synth.panning.connect(synth.context.destination);
    synth.gain.connect(synth.panning);

    for (let k in synth.keyboard) {
        let key = synth.keyboard[k];
        key.osc = synth.context.createOscillator();
        key.osc.type = 'sine';
        key.osc.frequency.value = 0;
        key.osc.start();

        key.dom = document.createElement('div');
        key.dom.classList.add('key');
        key.dom.dataset.char = k;
        key.dom.id = key.key;
        key.dom.innerHTML = `${key.keyHuman}`;
        key.dom.addEventListener('mousedown', onMouseDown);
        key.dom.addEventListener('mouseup', onMouseUp);
        keyboard.appendChild(key.dom);
    }
    synth.lfo.start(0);


    waveControl.addEventListener('input', event => {
        synth.wave = event.target.value ;
        for (let k in synth.keyboard) {
            let key = synth.keyboard[k];
            key.osc.type = event.target.value;
        };
        event.target.blur();
        updateDisplay();
    });

    detuneControl.addEventListener('input', event => {
        synth.detune = event.target.value;
        for (let k in synth.keyboard) {
            let key = synth.keyboard[k];
            key.osc.detune.value = event.target.value;
        };
        updateDisplay();
    });

    volumeControl.addEventListener('input', event => {
        synth.gain.gain.value = event.target.value;
        updateDisplay();
    });

    panningControl.addEventListener('input', event => {
        synth.panning.pan.value = event.target.value;
        updateDisplay();
    });

    lfoGainControl.addEventListener('input', event => {
        synth.lfoGain.gain.value = event.target.value;
        updateDisplay();
    });

    lfoFreqControl.addEventListener('input', event => {
        synth.lfo.frequency.value = event.target.value;
        updateDisplay();
    });

    lfoModulationControl.addEventListener('input', event => {
        let modulationType = event.target.value;
        synth.lfoModType = modulationType;
        if (modulationType === '-') {
            try {
                synth.lfoGain.disconnect(synth.gain.gain);
                for (k in synth.keyboard) {
                    let key = synth.keyboard[k];
                    synth.lfoGain.disconnect(key.osc.detune);
                }
            } catch (_) {};
        } else if (modulationType === 'am') {
            lfoGainControl.max = 1;
            lfoGainControl.step = 0.01;
            lfoGainControl.value = 0.5;
            synth.lfoGain.connect(synth.gain.gain);
        } else if (modulationType === 'fm') {
            lfoGainControl.max = 1000;
            lfoGainControl.step = 1;
            lfoGainControl.value = 50;
            try { synth.lfoGain.disconnect(synth.gain.gain); } catch (_) {};
            for (k in synth.keyboard) {
                let key = synth.keyboard[k];
                synth.lfoGain.connect(key.osc.detune);
            }
        }
        event.target.blur();
        updateDisplay();
    });

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
}

setup();
updateDisplay();
