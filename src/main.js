// Menggunakan Import Map dari index.html
import * as THREE from 'three';
import { MindARThree } from 'mind-ar/dist/mindar-image-three.prod.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

// --- CONFIG DATA (Pastikan pakai titik slash ./) ---
const dataOrgan = [
    { nama: "Anus", file: "public/models/anus.glb", sound: "public/sounds/anus.mp3", scale: 1.5 },
    { nama: "Lambung", file: "public/models/lambung.glb", sound: "public/sounds/lambung.mp3", scale: 1.5 },
    { nama: "Mulut", file: "public/models/mulut.glb", sound: "public/sounds/mulut.mp3", scale: 1.5 },
    { nama: "Usus", file: "public/models/usus.glb", sound: "public/sounds/usus.mp3", scale: 1.5 }
];

let mindarThree = null;

(async () => {
    // Referensi UI
    const ui = {
        welcome: document.getElementById('welcome-screen'),
        instruction: document.getElementById('instruction-screen'),
        scanGuide: document.getElementById('scan-guide'),
        scanText: document.getElementById('scan-text'),
        debugConsole: document.getElementById('debug-console'),
        debugText: document.getElementById('debug-text'),
        btnEnter: document.getElementById('btn-enter'),
        btnAgree: document.getElementById('btn-agree')
    };

    // Helper Status
    const updateStatus = (text, color = "#fff") => {
        if(ui.debugText) {
            ui.debugText.innerText = text;
            ui.debugText.style.color = color;
            ui.debugConsole.style.borderLeftColor = color;
        }
    };

    // Audio Setup
    const listener = new THREE.AudioListener();
    const audioLoader = new THREE.AudioLoader();
    let currentSound = null;

    // --- EVENT LISTENER TOMBOL (Ini yang bikin stuck kalau error) ---
    if (ui.btnEnter) {
        ui.btnEnter.onclick = () => {
            console.log("Tombol Masuk diklik");
            ui.welcome.classList.add('hidden');
            ui.instruction.classList.remove('hidden');
        };
    } else {
        console.error("Tombol btn-enter tidak ditemukan!");
    }

    if (ui.btnAgree) {
        ui.btnAgree.onclick = () => {
            console.log("Tombol Setuju diklik");
            ui.instruction.classList.add('hidden');
            initAR();
        };
    }

    // --- LOGIKA AR ---
    const initAR = async () => {
        const startBtn = document.createElement('button');
        startBtn.innerText = "MULAI KAMERA AR";
        startBtn.className = "btn-start";
        document.body.appendChild(startBtn);

        startBtn.onclick = async () => {
            startBtn.remove();
            ui.scanGuide.classList.remove('hidden');
            ui.debugConsole.classList.remove('hidden');
            
            updateStatus("Memuat Sistem...", "cyan");
            await startMindAR();
        };
    };

    const startMindAR = async () => {
        try {
            mindarThree = new MindARThree({
                container: document.body,
                imageTargetSrc: 'public/targets.mind', // Pastikan pakai ./
                uiLoading: "no", 
                uiScanning: "no",
            });

            const { renderer, scene, camera } = mindarThree;
            camera.add(listener);

            const ambientLight = new THREE.AmbientLight(0xffffff, 1);
            scene.add(ambientLight);
            const dirLight = new THREE.DirectionalLight(0xffffff, 1.5);
            dirLight.position.set(0, 10, 10);
            scene.add(dirLight);

            const gltfLoader = new GLTFLoader();

            dataOrgan.forEach((item, index) => {
                const anchor = mindarThree.addAnchor(index);
                const sound = new THREE.Audio(listener);
                
                audioLoader.load(item.sound, (buffer) => {
                    sound.setBuffer(buffer);
                    sound.setVolume(1.0);
                });

                gltfLoader.load(item.file, (gltf) => {
                    const model = gltf.scene;
                    const box = new THREE.Box3().setFromObject(model);
                    const size = box.getSize(new THREE.Vector3());
                    const maxDim = Math.max(size.x, size.y, size.z);
                    const scaleFactor = item.scale / maxDim;
                    
                    model.scale.set(scaleFactor, scaleFactor, scaleFactor);
                    model.position.set(0, 0, 0); 
                    anchor.group.add(model);
                    
                    const tick = () => {
                        model.rotation.y += 0.01;
                        requestAnimationFrame(tick);
                    };
                    tick();
                }, undefined, (error) => {
                    console.error("Gagal load model:", item.file, error);
                });

                anchor.onTargetFound = () => {
                    ui.scanText.innerText = `Terdeteksi: ${item.nama}`;
                    ui.scanText.style.color = "#00ff00";
                    ui.scanText.style.borderColor = "#00ff00";
                    updateStatus(`Model: ${item.nama}`, "#00ff00");

                    if (currentSound && currentSound.isPlaying) currentSound.stop();
                    if (sound.buffer) {
                        sound.play();
                        currentSound = sound;
                    }
                };

                anchor.onTargetLost = () => {
                    ui.scanText.innerText = "Cari Gambar Target...";
                    ui.scanText.style.color = "yellow";
                    ui.scanText.style.borderColor = "yellow";
                    updateStatus("Mencari Marker...", "orange");
                    if (sound.isPlaying) sound.stop();
                };
            });

            if (THREE.AudioContext.getContext().state === 'suspended') {
                await THREE.AudioContext.getContext().resume();
            }

            await mindarThree.start();
            updateStatus("Sistem Siap. Scan Sekarang.", "white");

            renderer.setAnimationLoop(() => {
                renderer.render(scene, camera);
            });

        } catch (error) {
            console.error("Error AR:", error);
            updateStatus("ERROR: Cek Console (F12)", "red");
            alert("Gagal memulai AR. Pastikan koneksi internet lancar untuk load library.");
        }
    };
})();

window.addEventListener('resize', () => {
    if (mindarThree) {
        const { renderer, camera } = mindarThree;
        renderer.setSize(window.innerWidth, window.innerHeight);
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
    }
});
