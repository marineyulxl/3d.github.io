import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import * as THREE from 'three';

class ControlsManager {
    constructor(camera, renderer, onChangeCallback) {
        this.controls = new OrbitControls(camera, renderer.domElement);
        this.setupControls();
        if (onChangeCallback) {
            this.controls.addEventListener('change', onChangeCallback);
        }
    }

    setupControls() {
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.05;
        this.controls.mouseButtons = {
            LEFT: THREE.MOUSE.PAN,
            MIDDLE: THREE.MOUSE.DOLLY,
            RIGHT: THREE.MOUSE.ROTATE
        };

        this.controls.touches = {
            ONE: THREE.TOUCH.PAN,
            TWO: THREE.TOUCH.DOLLY_PAN
        };

        this.controls.screenSpacePanning = false;
        this.controls.minPolarAngle = Math.PI / 6;
        this.controls.maxPolarAngle = Math.PI / 3;
        this.controls.minAzimuthAngle = -Math.PI / 4;
        this.controls.maxAzimuthAngle = Math.PI / 4;
        this.controls.minDistance = 10;
        this.controls.maxDistance = 20;
    }

    update() {
        this.controls.update();
    }
}

export default ControlsManager;