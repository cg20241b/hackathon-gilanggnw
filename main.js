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
        const letterMaterial = new THREE.MeshBasicMaterial({ color: letterColor });
        const letterMesh = new THREE.Mesh(letterGeometry, letterMaterial);
        letterMesh.position.x = -2;
        scene.add(letterMesh);

        // Right character '2'
        const numberGeometry = new TextGeometry('2', {
            font: font,
            size: 1,
            height: 0.2
        });
        const numberMaterial = new THREE.MeshBasicMaterial({ color: numberColor });
        const numberMesh = new THREE.Mesh(numberGeometry, numberMaterial);
        numberMesh.position.x = 2;
        scene.add(numberMesh);

        // Central glowing cube
        const cubeGeometry = new THREE.BoxGeometry(0.5, 0.5, 0.5);
        const cubeMaterial = new THREE.ShaderMaterial({
            uniforms: {
                glowColor: { type: 'c', value: new THREE.Color(0xffffff) },
                viewVector: { type: 'v3', value: camera.position }
            },
            vertexShader: `
                varying vec3 vNormal;
                varying vec3 vPositionNormal;
                void main() {
                    vNormal = normalize(normalMatrix * normal);
                    vPositionNormal = normalize((modelViewMatrix * vec4(position, 1.0)).xyz);
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                }
            `,
            fragmentShader: `
                uniform vec3 glowColor;
                uniform vec3 viewVector;
                varying vec3 vNormal;
                varying vec3 vPositionNormal;
                void main() {
                    float intensity = pow(0.5 - dot(vNormal, vPositionNormal), 2.0);
                    gl_FragColor = vec4(glowColor * intensity, 1.0);
                }
            `,
            side: THREE.FrontSide,
            blending: THREE.AdditiveBlending,
            transparent: true
        });
        const cube = new THREE.Mesh(cubeGeometry, cubeMaterial);
        scene.add(cube);

        // Point light
        const pointLight = new THREE.PointLight(0xffffff, 5, 100);
        pointLight.position.set(0, 0, 0);
        scene.add(pointLight);
    }
);

camera.position.z = 5;

function animate() {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
}
animate();