import * as THREE from 'three';
import { MindARThree } from 'mind-ar/dist/mindar-image-three.prod.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

// --- DATABASE ORGAN ---
const dataOrgan = [
    { nama: "Anus", file: "./models/anus.glb", sound: "./sounds/anus.mp3", scale: 1.5 },
    { nama: "Lambung", file: "./models/lambung.glb", sound: "./sounds/lambung.mp3", scale: 1.5 },
    { nama: "Mulut", file: "./models/mulut.glb", sound: "./sounds/mulut.mp3", scale: 1.5 },
    { nama: "Usus", file: "./models/usus.glb", sound: "./sounds/usus.mp3", scale: 1.5 }
];

let mindarThree = null;

(async () => {
    // --- REFERENSI UI ---
    const ui = {
        welcome: document.getElementById('welcome-screen'),
        instruction: document.getElementById('instruction-screen'),
        scanGuide: document.getElementById('scan-guide'),
        scanText: document.getElementById('scan-text'),
        debugConsole: document.getElementById('debug-console'), // Kotak Info Kiri Atas
        debugText: document.getElementById('debug-text'),
        btnEnter: document.getElementById('btn-enter'),
        btnAgree: document.getElementById('btn-agree')
    };

    // --- HELPER: UPDATE STATUS KIRI ATAS ---
    const updateStatus = (text, color = "#fff") => {
        if(ui.debugText) {
            ui.debugText.innerText = text;
            ui.debugText.style.color = color;
            ui.debugConsole.style.borderLeftColor = color;
        }
    };

    // --- SETUP AUDIO ---
    const listener = new THREE.AudioListener();
    const audioLoader = new THREE.AudioLoader();
    let currentSound = null;

    // --- NAVIGASI HALAMAN ---
    ui.btnEnter.onclick = () => {
        ui.welcome.classList.add('hidden');
        ui.instruction.classList.remove('hidden');
    };

    ui.btnAgree.onclick = () => {
        ui.instruction.classList.add('hidden');
        initAR(); // Masuk ke inisialisasi AR
    };

    // --- INISIALISASI AR ---
    const initAR = async () => {
        // Buat tombol START merah (untuk izin kamera browser)
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
                imageTargetSrc: './targets.mind',
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

            // --- LOAD MODEL & AUDIO ---
            dataOrgan.forEach((item, index) => {
                const anchor = mindarThree.addAnchor(index);
                const sound = new THREE.Audio(listener);
                
                audioLoader.load(item.sound, (buffer) => {
                    sound.setBuffer(buffer);
                    sound.setVolume(1.0);
                });

                gltfLoader.load(item.file, (gltf) => {
                    const model = gltf.scene;
                    
                    // Auto Scale
                    const box = new THREE.Box3().setFromObject(model);
                    const size = box.getSize(new THREE.Vector3());
                    const maxDim = Math.max(size.x, size.y, size.z);
                    const scaleFactor = item.scale / maxDim;
                    
                    model.scale.set(scaleFactor, scaleFactor, scaleFactor);
                    model.position.set(0, 0, 0); 
                    anchor.group.add(model);
                    
                    // Animasi Putar
                    const tick = () => {
                        model.rotation.y += 0.01;
                        requestAnimationFrame(tick);
                    };
                    tick();
                });

                // --- EVENT: TARGET DITEMUKAN ---
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

                // --- EVENT: TARGET HILANG ---
                anchor.onTargetLost = () => {
                    ui.scanText.innerText = "Cari Gambar Target...";
                    ui.scanText.style.color = "yellow";
                    ui.scanText.style.borderColor = "yellow";
                    
                    updateStatus("Mencari Marker...", "orange");

                    if (sound.isPlaying) sound.stop();
                };
            });

            // Resume Audio Context (Penting untuk Chrome)
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
            updateStatus("ERROR: Cek Console", "red");
            alert("Gagal memulai AR. Pastikan izin kamera aktif.");
        }
    };
})();

// --- RESIZE HANDLER ---
window.addEventListener('resize', () => {
    if (mindarThree) {
        const { renderer, camera } = mindarThree;
        renderer.setSize(window.innerWidth, window.innerHeight);
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
    }
});