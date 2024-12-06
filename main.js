import * as THREE from 'three';
import SceneManager from './utils/SceneManager';
import CameraRenderer from './utils/CameraRenderer';
import ControlsManager from './utils/ControlsManager';
import ModelLoader from './utils/ModelLoader';
import InteractionManager from './utils/InteractionManager';

class App {
    constructor() {
        // 初始化基础组件
        this.sceneManager = new SceneManager();
        this.cameraRenderer = new CameraRenderer();
        this.setupLoadingManager();
        
        // 初始化控制器
        this.controlsManager = new ControlsManager(
            this.cameraRenderer.camera,
            this.cameraRenderer.renderer,
            this.handleControlsChange.bind(this)
        );

        // 模型加载器
        this.modelLoader = new ModelLoader(this.loadingManager);
        
        // 动画相关变量
        this.mixer = null;
        this.clock = new THREE.Clock();

        // 交互管理器
        this.interactionManager = new InteractionManager(
            this.sceneManager.scene,
            this.cameraRenderer.camera,
            this.controlsManager.controls
        );

        // 设置事件监听和开始加载
        this.setupEventListeners();
        this.initModel();
        this.animate();
    }

    setupLoadingManager() {
        this.loadingManager = new THREE.LoadingManager();
        const loadingElement = document.getElementById('loadingDisplay');
        this.loadingManager.onProgress = (url, loaded, total) => {
            loadingElement.textContent = `Loading: ${Math.round(loaded / total * 100)}%`;
        };
        this.loadingManager.onLoad = () => {
            loadingElement.style.display = 'none';
        };
    }
    setupEventListeners() {
        window.addEventListener('resize', this.onWindowResize.bind(this));
    }
    handleControlsChange() {
        if (this.interactionManager.isTransitioning || this.interactionManager.isZoomedIn) return;

        const targetPosition = this.controlsManager.controls.target;
        const cameraPosition = this.cameraRenderer.camera.position;

        // 平移限制
        const panLimitX = 5;
        const panLimitZ = 1;

        const deltaX = Math.max(Math.min(targetPosition.x, panLimitX), -panLimitX) - targetPosition.x;
        const deltaZ = Math.max(Math.min(targetPosition.z, panLimitZ), -panLimitZ) - targetPosition.z;

        if (deltaX !== 0 || deltaZ !== 0) {
            targetPosition.x += deltaX;
            targetPosition.z += deltaZ;
            cameraPosition.x += deltaX;
            cameraPosition.z += deltaZ;
        }

        targetPosition.y = 0;
    }
    initModel() {
        // ModelLoader 只负责加载模型
        this.modelLoader.loadModel(
            'models/1.glb',
            (gltf) => {
                // 处理场景添加和动画设置
                this.sceneManager.scene.add(gltf.scene);  
                if (gltf.animations && gltf.animations.length) {
                    this.mixer = new THREE.AnimationMixer(gltf.scene);
                    gltf.animations.forEach((clip) => {
                        this.mixer.clipAction(clip).play();
                    });
                }
            }
        );
    }
    onWindowResize() {
        this.cameraRenderer.onWindowResize();
    }
    animate() {
        requestAnimationFrame(this.animate.bind(this));

        // 更新动画混合器
        if (this.mixer) {
            this.mixer.update(this.clock.getDelta());
        }

        // 更新控制器
        this.controlsManager.update();

        // 渲染场景
        this.cameraRenderer.renderer.render(
            this.sceneManager.scene,
            this.cameraRenderer.camera
        );
    }
}
// 创建应用实例
document.addEventListener('DOMContentLoaded', () => {
    new App();
});