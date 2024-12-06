import * as THREE from 'three';
//: 管理 Three.js 场景
class SceneManager {
    constructor() {
        this.scene = new THREE.Scene();
        this.setupScene();
        // this.setupHelpers();
    }

    setupScene() {
        this.scene.background = new THREE.Color(0x808080);
        
        // 添加灯光
        const ambientLight = new THREE.AmbientLight(0xffffff, 1);
        this.scene.add(ambientLight);

        const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
        directionalLight.position.set(5, 5, 5);
        this.scene.add(directionalLight);
    }

    setupHelpers() {
        const axesHelper = new THREE.AxesHelper(5);
        this.scene.add(axesHelper);

        const gridHelper = new THREE.GridHelper(10, 10);
        this.scene.add(gridHelper);
    }
}

export default SceneManager;