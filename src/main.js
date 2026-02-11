import * as THREE from 'three';
import { MindARThree } from 'mind-ar/dist/mindar-image-three.prod.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

const dataOrgan = [
    { nama: "Anus", file: "/models/anus.glb", sound: "/sounds/anus.mp3", scale: 1.5 },
    { nama: "Lambung", file: "/models/lambung.glb", sound: "/sounds/lambung.mp3", scale: 1.5 },
    { nama: "Mulut", file: "/models/mulut.glb", sound: "/sounds/mulut.mp3", scale: 1.5 },
    { nama: "Usus", file: "/models/usus.glb", sound: "/sounds/usus.mp3", scale: 1.5 }
];

(async () => {
    const scanGuide = document.getElementById('scan-guide');
    const welcomeScreen = document.getElementById('welcome-screen');
    const instructionScreen = document.getElementById('instruction-screen');
    
    const btnEnter = document.getElementById('btn-enter');
    const btnAgree = document.getElementById('btn-agree');

    const listener = new THREE.AudioListener();
    const audioLoader = new THREE.AudioLoader();
    let currentSound = null;

    // 1. Dari Welcome Page -> Ke Instruksi
    btnEnter.onclick = () => {
        welcomeScreen.classList.add('hidden');
        instructionScreen.classList.remove('hidden');
    };

    // 2. Dari Instruksi -> Ke Setup AR (Tombol Merah)
    btnAgree.onclick = () => {
        instructionScreen.classList.add('hidden');
        setupAR();
    };

    const setupAR = async () => {
        const startButton = document.createElement('button');
        startButton.innerText = "MULAI KAMERA AR";
        startButton.className = "btn-start";
        document.body.appendChild(startButton);

        try {
            const mindarThree = new MindARThree({
                container: document.body,
                imageTargetSrc: '/targets.mind',
            });

            const { renderer, scene, camera } = mindarThree;
            camera.add(listener);

            const ambientLight = new THREE.AmbientLight(0xffffff, 1);
            scene.add(ambientLight);
            const dirLight = new THREE.DirectionalLight(0xffffff, 1.5);
            dirLight.position.set(0, 10, 10);
            scene.add(dirLight);

            const loader = new GLTFLoader();

            dataOrgan.forEach((item, index) => {
                const anchor = mindarThree.addAnchor(index);
                const sound = new THREE.Audio(listener);
                
                audioLoader.load(item.sound, (buffer) => {
                    sound.setBuffer(buffer);
                    sound.setVolume(1.0);
                });

                loader.load(item.file, (gltf) => {
                    const model = gltf.scene;

                    const box = new THREE.Box3().setFromObject(model);
                    const size = box.getSize(new THREE.Vector3());
                    const maxDim = Math.max(size.x, size.y, size.z);
                    const scaleFactor = item.scale / maxDim;
                    
                    model.scale.set(scaleFactor, scaleFactor, scaleFactor);
                    model.position.set(0, 0, 0);

                    anchor.group.add(model);
                    
                    const animate = () => {
                        model.rotation.y += 0.01;
                        requestAnimationFrame(animate);
                    };
                    animate();
                }, undefined, (err) => console.error(err));

                anchor.onTargetFound = () => {
                    if(scanGuide) {
                        scanGuide.innerText = `Terdeteksi: ${item.nama}`;
                        scanGuide.style.color = "#00ff00";
                        scanGuide.style.borderColor = "#00ff00";
                    }
                    
                    if (currentSound && currentSound.isPlaying) {
                        currentSound.stop();
                    }
                    if (sound.buffer) {
                        sound.play();
                        currentSound = sound;
                    }
                };
                
                anchor.onTargetLost = () => {
                    if(scanGuide) {
                        scanGuide.innerText = "Cari Gambar Target...";
                        scanGuide.style.color = "yellow";
                        scanGuide.style.borderColor = "yellow";
                    }
                    if (sound.isPlaying) {
                        sound.stop();
                    }
                };
            });

            startButton.onclick = async () => {
                startButton.remove();
                if(scanGuide) scanGuide.classList.remove('hidden');
                
                if (THREE.AudioContext.getContext().state === 'suspended') {
                    THREE.AudioContext.getContext().resume();
                }

                await mindarThree.start();

                renderer.setSize(window.innerWidth, window.innerHeight);
                renderer.setPixelRatio(window.devicePixelRatio);
                
                renderer.setAnimationLoop(() => {
                    renderer.render(scene, camera);
                });
            }

        } catch (error) {
            console.error(error);
            alert("Gagal memulai AR");
        }
    };

    window.addEventListener('resize', () => {
    });

})();