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

// Create references for the cubes
let innerCube, outerCube;

// Load font and create text
const fontLoader = new FontLoader();
fontLoader.load(
    'https://cdn.jsdelivr.net/npm/three@0.171.0/examples/fonts/helvetiker_regular.typeface.json',
    function (font) {
        // Left character 'g'
        const letterGeometry = new TextGeometry('g', {
            font: font,
            size: 1,
            height: 0.2
        });
        const letterMaterial = new THREE.MeshPhongMaterial({ color: letterColor });
        const letterMesh = new THREE.Mesh(letterGeometry, letterMaterial);
        letterMesh.position.x = -2;
        scene.add(letterMesh);

        // Right character '2'
        const numberGeometry = new TextGeometry('2', {
            font: font,
            size: 1,
            height: 0.2
        });
        const numberMaterial = new THREE.MeshPhongMaterial({ color: numberColor });
        const numberMesh = new THREE.Mesh(numberGeometry, numberMaterial);
        numberMesh.position.x = 2;
        scene.add(numberMesh);

        // Create glowing cube
        const cubeGeometry = new THREE.BoxGeometry(0.3, 0.3, 0.3);
        
        // Inner cube (bright)
        const innerCubeMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });
        innerCube = new THREE.Mesh(cubeGeometry, innerCubeMaterial);
        scene.add(innerCube);

        // Outer cube (glow effect)
        const outerGeometry = new THREE.BoxGeometry(0.4, 0.4, 0.4);
        const outerMaterial = new THREE.MeshBasicMaterial({ 
            color: 0xffffff,
            transparent: true,
            opacity: 0.5,
            blending: THREE.AdditiveBlending
        });
        outerCube = new THREE.Mesh(outerGeometry, outerMaterial);
        scene.add(outerCube);

        // Add point light at cube position
        const light = new THREE.PointLight(0xffffff, 20, 10);
        light.position.set(0, 0, 0);
        scene.add(light);
    }
);

// Position camera
camera.position.z = 5;

// Animation loop
function animate() {
    requestAnimationFrame(animate);
    
    // Rotate both cubes if they exist
    if (innerCube && outerCube) {
        innerCube.rotation.x += 0.01;
        innerCube.rotation.y += 0.01;
        outerCube.rotation.x += 0.01;
        outerCube.rotation.y += 0.01;
    }
    
    renderer.render(scene, camera);
}
animate();

// Handle window resize
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});