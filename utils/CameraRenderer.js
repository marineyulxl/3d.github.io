import * as THREE from 'three';
//处理相机和渲染器
class CameraRenderer {
    constructor() {
        this.camera = this.setupCamera();
        this.renderer = this.setupRenderer();
    }

    setupCamera() {
        const camera = new THREE.PerspectiveCamera(
            45, 
            window.innerWidth / window.innerHeight, 
            0.1, 
            1000
        );
        camera.position.set(0, 8, 10);
        camera.lookAt(0, 0, 0);
        return camera;
    }

    setupRenderer() {
        const renderer = new THREE.WebGLRenderer({ antialias: true });
        renderer.setSize(window.innerWidth, window.innerHeight);
        document.body.appendChild(renderer.domElement);
        return renderer;
    }

    onWindowResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }
}

export default CameraRenderer;