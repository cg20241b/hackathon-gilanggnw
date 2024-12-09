import * as THREE from 'three';
import { TextGeometry } from 'three/addons/geometries/TextGeometry.js';
import { FontLoader } from 'three/addons/loaders/FontLoader.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';

// Constants and Configurations
const COLORS = {
    background: 0x1a1a2e,
    letter: 0xFFDE21,    // Yellow
    //number: 0x0021DE,    // Complementary blue
    number : 0x04BADE,   // Alternative blue for better visibility
    light: 0xffffff      // White
};

const SETTINGS = {
    moveSpeed: 0.1,
    lightIntensity: 10,
    lightRange: 200
};

// Scene Setup
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();

// Shader Definitions
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

const fragmentShaderPlastic = `
    uniform vec3 lightPos;
    uniform vec3 baseColor;
    uniform float lightIntensity;
    
    varying vec3 vNormal;
    varying vec3 vViewPosition;
    
    void main() {
        float ambientStrength = 0.232;
        vec3 ambient = ambientStrength * baseColor;
        
        vec3 lightDir = normalize(lightPos - vViewPosition);
        float distance = length(lightPos - vViewPosition);
        float attenuation = 1.0 / (1.0 + 0.09 * distance + 0.032 * distance * distance);
        float diff = max(dot(vNormal, lightDir), 0.0);
        vec3 diffuse = diff * baseColor * lightIntensity * attenuation;
        
        vec3 viewDir = normalize(vViewPosition);
        vec3 halfDir = normalize(lightDir + viewDir);
        float spec = pow(max(dot(vNormal, halfDir), 0.0), 32.0);
        vec3 specular = vec3(0.5) * spec * lightIntensity * attenuation;
        
        vec3 result = ambient + diffuse + specular;
        gl_FragColor = vec4(result, 1.0);
    }
`;

const fragmentShaderMetal = `
    uniform vec3 lightPos;
    uniform vec3 baseColor;
    uniform float lightIntensity;
    
    varying vec3 vNormal;
    varying vec3 vViewPosition;
    
    void main() {
        float ambientStrength = 0.232;
        vec3 ambient = ambientStrength * baseColor;
        
        vec3 lightDir = normalize(lightPos - vViewPosition);
        float distance = length(lightPos - vViewPosition);
        float attenuation = 1.0 / (1.0 + 0.09 * distance + 0.032 * distance * distance);
        float diff = max(dot(vNormal, lightDir), 0.0);
        vec3 diffuse = diff * baseColor * lightIntensity * attenuation;
        
        vec3 viewDir = normalize(vViewPosition);
        vec3 reflectDir = reflect(-lightDir, vNormal);
        float spec = pow(max(dot(viewDir, reflectDir), 0.0), 128.0);
        vec3 specular = baseColor * spec * lightIntensity * attenuation * 2.0;
        
        vec3 result = ambient + diffuse + specular;
        gl_FragColor = vec4(result, 1.0);
    }
`;

// Composer
let composer;

// Scene Objects
let innerCube, outerCube;
let stars;

// Initialize Scene
function initScene() {
    scene.background = new THREE.Color(COLORS.background);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);
    camera.position.z = 5;
}

function initPostProcessing() {
    composer = new EffectComposer(renderer);
    
    // Regular scene render
    const renderPass = new RenderPass(scene, camera);
    composer.addPass(renderPass);
    
    // Bloom effect
    const bloomPass = new UnrealBloomPass(
        new THREE.Vector2(window.innerWidth, window.innerHeight),
        0.7,    // bloom strength
        0.2,    // radius
        0.8    // threshold
    );
    composer.addPass(bloomPass);
    
    // Output pass with tone mapping
    const outputPass = new OutputPass();
    composer.addPass(outputPass);
}

// Create Stars
function addStars() {
    const starsGeometry = new THREE.BufferGeometry();
    const starsMaterial = new THREE.PointsMaterial({
        color: COLORS.light,
        size: 0.05,
        transparent: true
    });

    const starsVertices = [];
    for(let i = 0; i < 1000; i++) {
        const x = (Math.random() - 0.5) * 100;
        const y = (Math.random() - 0.5) * 100;
        const z = -Math.random() * 50;
        starsVertices.push(x, y, z);
    }

    starsGeometry.setAttribute('position', 
        new THREE.Float32BufferAttribute(starsVertices, 3));
    
    stars = new THREE.Points(starsGeometry, starsMaterial);
    scene.add(stars);
}

// Tone Mapping
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 0.9 ;

// Create Text and Cubes
function createObjects(font) {
    // Materials
    const letterMaterial = new THREE.ShaderMaterial({
        uniforms: {
            lightPos: { value: new THREE.Vector3(0, 0, 0) },
            baseColor: { value: new THREE.Color(COLORS.letter) },
            lightIntensity: { value: SETTINGS.lightIntensity }
        },
        vertexShader,
        fragmentShader: fragmentShaderPlastic,
        side: THREE.DoubleSide
    });

    const numberMaterial = new THREE.ShaderMaterial({
        uniforms: {
            lightPos: { value: new THREE.Vector3(0, 0, 0) },
            baseColor: { value: new THREE.Color(COLORS.number) },
            lightIntensity: { value: SETTINGS.lightIntensity }
        },
        vertexShader,
        fragmentShader: fragmentShaderMetal,
        side: THREE.DoubleSide
    });

    // Create Text
    const letterGeometry = new TextGeometry('g', {
        font,
        size: 1,
        height: 0.2
    });
    const letterMesh = new THREE.Mesh(letterGeometry, letterMaterial);
    letterMesh.position.x = -2;
    scene.add(letterMesh);

    const numberGeometry = new TextGeometry('2', {
        font,
        size: 1,
        height: 0.2
    });
    const numberMesh = new THREE.Mesh(numberGeometry, numberMaterial);
    numberMesh.position.x = 2;
    scene.add(numberMesh);

    // Create Cubes
    const cubeGeometry = new THREE.BoxGeometry(0.3, 0.3, 0.3);
    innerCube = new THREE.Mesh(
        cubeGeometry,
        new THREE.MeshBasicMaterial({ color: COLORS.light })
    );
    innerCube.position.z = -1;
    scene.add(innerCube);

    const outerGeometry = new THREE.BoxGeometry(0.4, 0.4, 0.4);
    outerCube = new THREE.Mesh(
        outerGeometry,
        new THREE.MeshBasicMaterial({ 
            color: COLORS.light,
            transparent: true,
            opacity: 0.5,
            blending: THREE.AdditiveBlending
        })
    );
    outerCube.position.z = -1;
    scene.add(outerCube);

    // Add Light
    const light = new THREE.PointLight(
        COLORS.light,
        SETTINGS.lightIntensity,
        SETTINGS.lightRange
    );
    light.position.set(0, 0, 0);
    scene.add(light);
}

// Animation Loop
function animate() {
    requestAnimationFrame(animate);
    
    if (stars?.material instanceof THREE.PointsMaterial) {
        stars.material.opacity = 0.5 + 0.5 * Math.sin(Date.now() * 0.001);
    }

    if (innerCube && outerCube) {
        innerCube.rotation.x += 0.01;
        innerCube.rotation.y += 0.01;
        outerCube.rotation.x += 0.01;
        outerCube.rotation.y += 0.01;
        
        scene.traverse((object) => {
            if (object.material?.uniforms?.lightPos) {
                object.material.uniforms.lightPos.value.copy(innerCube.position);
            }
        });
    }
    
    if (composer) {
        composer.render();
    } else {
        renderer.render(scene, camera);
    }
}

// Event Listeners
function initEventListeners() {
    window.addEventListener('resize', () => {
        const width = window.innerWidth;
        const height = window.innerHeight;
        
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
        
        renderer.setSize(width, height);
        composer.setSize(width, height);
    });

    window.addEventListener('keydown', (event) => {
        switch(event.key.toLowerCase()) {
            case 'w':
                if (innerCube && outerCube) {
                    innerCube.position.y += SETTINGS.moveSpeed;
                    outerCube.position.y += SETTINGS.moveSpeed;
                }
                break;
            case 's':
                if (innerCube && outerCube) {
                    innerCube.position.y -= SETTINGS.moveSpeed;
                    outerCube.position.y -= SETTINGS.moveSpeed;
                }
                break;
            case 'a':
                camera.position.x -= SETTINGS.moveSpeed;
                break;
            case 'd':
                camera.position.x += SETTINGS.moveSpeed;
                break;
        }
    });
}

// Initialize
initScene();
initPostProcessing();
addStars();

// Load Font and Start
const fontLoader = new FontLoader();
fontLoader.load(
    'https://cdn.jsdelivr.net/npm/three@0.171.0/examples/fonts/helvetiker_regular.typeface.json',
    (font) => {
        createObjects(font);
        initEventListeners();
        animate();
    }
);