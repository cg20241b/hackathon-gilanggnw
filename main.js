import * as THREE from 'three';
import { TextGeometry } from 'three/addons/geometries/TextGeometry.js';
import { FontLoader } from 'three/addons/loaders/FontLoader.js';

// Scene setup
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// After scene setup, add:
scene.background = new THREE.Color(0x1a1a2e); // Dark blue-gray

// Create stars
function addStars() {
    const starsGeometry = new THREE.BufferGeometry();
    const starsMaterial = new THREE.PointsMaterial({
        color: 0xFFFFFF,
        size: 0.05,
        transparent: true
    });

    // Create 1000 random stars
    const starsVertices = [];
    for(let i = 0; i < 1000; i++) {
        const x = (Math.random() - 0.5) * 100;
        const y = (Math.random() - 0.5) * 100;
        const z = -Math.random() * 50; // Put stars behind everything
        starsVertices.push(x, y, z);
    }

    starsGeometry.setAttribute('position', 
        new THREE.Float32BufferAttribute(starsVertices, 3));
    
    const stars = new THREE.Points(starsGeometry, starsMaterial);
    scene.add(stars);
    return stars;
}

// Add stars to scene
const stars = addStars();

// Colors
const letterColor = new THREE.Color(0xFFDE21);  // Yellow
const numberColor = new THREE.Color(0x0021DE);  // Complementary blue

// Shared vertex shader
const vertexShader = `
    varying vec3 vNormal;
    varying vec3 vViewPosition;
    
    void main() {
        vNormal = normalize(normalMatrix * normal);
        vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
        vViewPosition = -mvPosition.xyz;
        gl_Position = projectionMatrix * mvPosition;
    }
`;

// Fragment shader for plastic material (letter)
const fragmentShaderPlastic = `
    uniform vec3 lightPos;
    uniform vec3 baseColor;
    uniform float lightIntensity;
    
    varying vec3 vNormal;
    varying vec3 vViewPosition;
    
    void main() {
        // Ambient with specified intensity
        float ambientStrength = 0.232;
        vec3 ambient = ambientStrength * baseColor;
        
        // Diffuse with light intensity
        vec3 lightDir = normalize(lightPos - vViewPosition);
        float distance = length(lightPos - vViewPosition);
        float attenuation = 1.0 / (1.0 + 0.09 * distance + 0.032 * distance * distance);
        float diff = max(dot(vNormal, lightDir), 0.0);
        vec3 diffuse = diff * baseColor * lightIntensity * attenuation;
        
        // Specular (Plastic) - Blinn-Phong
        vec3 viewDir = normalize(vViewPosition);
        vec3 halfDir = normalize(lightDir + viewDir);
        float spec = pow(max(dot(vNormal, halfDir), 0.0), 32.0);
        vec3 specular = vec3(0.5) * spec * lightIntensity * attenuation;
        
        vec3 result = ambient + diffuse + specular;
        gl_FragColor = vec4(result, 1.0);
    }
`;

// Fragment shader for metallic material (number)
const fragmentShaderMetal = `
    uniform vec3 lightPos;
    uniform vec3 baseColor;
    uniform float lightIntensity;
    
    varying vec3 vNormal;
    varying vec3 vViewPosition;
    
    void main() {
        // Ambient with specified intensity
        float ambientStrength = 0.232;
        vec3 ambient = ambientStrength * baseColor;
        
        // Diffuse with light intensity
        vec3 lightDir = normalize(lightPos - vViewPosition);
        float distance = length(lightPos - vViewPosition);
        float attenuation = 1.0 / (1.0 + 0.09 * distance + 0.032 * distance * distance);
        float diff = max(dot(vNormal, lightDir), 0.0);
        vec3 diffuse = diff * baseColor * lightIntensity * attenuation;
        
        // Specular (Metallic) - Phong with colored specular
        vec3 viewDir = normalize(vViewPosition);
        vec3 reflectDir = reflect(-lightDir, vNormal);
        float spec = pow(max(dot(viewDir, reflectDir), 0.0), 64.0);
        vec3 specular = baseColor * spec * lightIntensity * attenuation;
        
        vec3 result = ambient + diffuse + specular;
        gl_FragColor = vec4(result, 1.0);
    }
`;

// Create references for the cubes
let innerCube, outerCube;

// Load font and create text
const fontLoader = new FontLoader();
fontLoader.load(
    'https://cdn.jsdelivr.net/npm/three@0.171.0/examples/fonts/helvetiker_regular.typeface.json',
    function (font) {
        // Letter shader material
        const letterMaterial = new THREE.ShaderMaterial({
            uniforms: {
                lightPos: { value: new THREE.Vector3(0, 0, 0) },
                baseColor: { value: letterColor },
                lightIntensity: { value: 50.0 }
            },
            vertexShader: vertexShader,
            fragmentShader: fragmentShaderPlastic
        });

        // Number shader material
        const numberMaterial = new THREE.ShaderMaterial({
            uniforms: {
                lightPos: { value: new THREE.Vector3(0, 0, 0) },
                baseColor: { value: numberColor },
                lightIntensity: { value: 50.0 }
            },
            vertexShader: vertexShader,
            fragmentShader: fragmentShaderMetal
        });

        // Left character 'g'
        const letterGeometry = new TextGeometry('g', {
            font: font,
            size: 1,
            height: 0.2
        });
        const letterMesh = new THREE.Mesh(letterGeometry, letterMaterial);
        letterMesh.position.x = -2;
        scene.add(letterMesh);

        // Right character '2'
        const numberGeometry = new TextGeometry('2', {
            font: font,
            size: 1,
            height: 0.2
        });
        const numberMesh = new THREE.Mesh(numberGeometry, numberMaterial);
        numberMesh.position.x = 2;
        scene.add(numberMesh);

        // Create glowing cube
        const cubeGeometry = new THREE.BoxGeometry(0.3, 0.3, 0.3);
        
        // Inner cube (bright)
        const innerCubeMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });
        innerCube = new THREE.Mesh(cubeGeometry, innerCubeMaterial);
        innerCube.position.z = -1; // Move back by 1 unit
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
        outerCube.position.z = -1; // Move back by 1 unit
        scene.add(outerCube);

        // Add point light
        const light = new THREE.PointLight(0xffffff, 100, 200); // White light
        light.position.set(0, 0, 0);
        scene.add(light);
    }
);

camera.position.z = 5;

function animate() {
    requestAnimationFrame(animate);
    
    // Make stars twinkle
    if (stars.material instanceof THREE.PointsMaterial) {
        stars.material.opacity = 0.5 + 0.5 * Math.sin(Date.now() * 0.001);
    }

    if (innerCube && outerCube) {
        innerCube.rotation.x += 0.01;
        innerCube.rotation.y += 0.01;
        outerCube.rotation.x += 0.01;
        outerCube.rotation.y += 0.01;
        
        // Update light position and intensity in shader uniforms
        scene.traverse((object) => {
            if (object.material && object.material.uniforms) {
                if (object.material.uniforms.lightPos) {
                    object.material.uniforms.lightPos.value.copy(innerCube.position);
                }
            }
        });
    }
    
    renderer.render(scene, camera);
}
animate();

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// Keyboard controls
const moveSpeed = 0.1; // Adjust speed as needed

window.addEventListener('keydown', (event) => {
    switch(event.key.toLowerCase()) {
        // Cube vertical movement
        case 'w':
            if (innerCube && outerCube) {
                innerCube.position.y += moveSpeed;
                outerCube.position.y += moveSpeed;
            }
            break;
        case 's':
            if (innerCube && outerCube) {
                innerCube.position.y -= moveSpeed;
                outerCube.position.y -= moveSpeed;
            }
            break;
            
        // Camera horizontal movement
        case 'a':
            camera.position.x -= moveSpeed;
            break;
        case 'd':
            camera.position.x += moveSpeed;
            break;
    }
});