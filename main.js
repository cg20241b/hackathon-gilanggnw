import * as THREE from 'three';
import { TextGeometry } from 'three/addons/geometries/TextGeometry.js';
import { FontLoader } from 'three/addons/loaders/FontLoader.js';

// Scene setup
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Colors
const letterColor = 0xFFDE21;  // Yellow
const numberColor = 0x0021DE;  // Complementary blue

// Load font and text
const fontLoader = new FontLoader();
fontLoader.load(
    'https://cdn.jsdelivr.net/npm/three@0.171.0/examples/fonts/helvetiker_regular.typeface.json',
    function (font) {
        // Left character : 'g'
        const letterGeometry = new TextGeometry('g', {
            font: font,
            size: 1,
            height: 0.2
        });
        const letterMaterial = new THREE.MeshBasicMaterial({ color: letterColor });
        const letterMesh = new THREE.Mesh(letterGeometry, letterMaterial);
        letterMesh.position.x = -2;
        scene.add(letterMesh);

        // Right character : '2'
        const numberGeometry = new TextGeometry('2', {
            font: font,
            size: 1,
            height: 0.2
        });
        
        const numberMaterial = new THREE.MeshBasicMaterial({ color: numberColor });
        const numberMesh = new THREE.Mesh(numberGeometry, numberMaterial);
        numberMesh.position.x = 2;
        scene.add(numberMesh);
    }
);

// Camera position
camera.position.z = 5;

// Animation loop
function animate() {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
}
animate();