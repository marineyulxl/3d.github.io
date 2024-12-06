import * as THREE from 'three';
import gsap from 'gsap';

class InteractionManager {
    constructor(scene, camera, controls) {
        this.scene = scene;
        this.camera = camera;
        this.controls = controls;
        this.raycaster = new THREE.Raycaster();
        this.mouse = new THREE.Vector2();
        
        this.isZoomedIn = false;
        this.isTransitioning = false;
        this.currentFocusedObject = null;
        
        this.INITIAL_FOV = 45;
        this.ZOOM_FOV = 30;
        
        this.setupEventListeners();
    }

    setupEventListeners() {
        window.addEventListener('mousemove', this.onMouseMove.bind(this));
        window.addEventListener('click', this.onClick.bind(this));
        document.getElementById('closeButton').addEventListener('click', () => {
            document.getElementById('infoPanel').classList.remove('active');
            this.resetCamera();
        });
    }

    onMouseMove(event) {
        this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

        this.raycaster.setFromCamera(this.mouse, this.camera);
        const intersects = this.raycaster.intersectObjects(this.scene.children, true);

        // 重置所有部件到原始颜色
        this.scene.traverse((child) => {
            if (child.isMesh && child.userData.originalColor !== undefined && !child.userData.isFixedBlue) {
                child.material.color.setHex(child.userData.originalColor);
            }
        });

        const nameDisplay = document.getElementById('nameDisplay');
        nameDisplay.style.display = 'none';

        // 处理相交对象
        if (intersects.length > 0) {
            const intersectedObject = intersects[0].object;
            if (intersectedObject.userData.type && !intersectedObject.userData.isFixedBlue) {
                nameDisplay.textContent = intersectedObject.name;
                nameDisplay.style.display = 'block';

                switch (intersectedObject.userData.type) {
                    case 'box':
                        intersectedObject.material.color.setHex(0x00ff00);
                        break;
                    case 'cylinder':
                        intersectedObject.material.color.setHex(0x0000ff);
                        break;
                    case 'line':
                        intersectedObject.material.color.setHex(0xff0000);
                        break;
                }
            }
        }
    }

    onClick(event) {
        if (this.isTransitioning) return;

        // 是否点击了信息面板
        // const infoPanel = document.getElementById('infoPanel');
        if (event.target.closest('#infoPanel')) {
            return;
        }

        this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

        this.raycaster.setFromCamera(this.mouse, this.camera);
        const intersects = this.raycaster.intersectObjects(this.scene.children, true);

        if (intersects.length > 0) {
            const intersectedObject = intersects[0].object;
            if (this.isZoomedIn) {
                this.resetCamera();
                return;
            }
            if (intersectedObject.userData.type) {
                this.zoomToObject(intersectedObject);
            }
        } else if (this.isZoomedIn) {
            this.resetCamera();
        }
    }

    getObjectInfo(object) {
        const info = {
            title: '默认标题',
            description: '这是默认描述',
            image: 'https://picsum.photos/800/400'
        };

        if (object.name.includes('Box')) {
            info.title = 'Box 详情';
            info.description = '这是一个 Box 对象。作为工业设备的重要组成部分，它具有稳定性高、承重能力强的特点。在现代工业生产中发挥着关键作用。';
            info.image = 'https://images.unsplash.com/photo-1567361808960-dec9cb578182?w=800';
        } else if (object.name.includes('Cylinder')) {
            info.title = 'Cylinder 详情';
            info.description = '这是一个 Cylinder 对象。圆柱体结构在工业应用中广泛存在，常用于储存、传输等功能，是工业设备中不可或缺的基础部件。';
            info.image = 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=800';
        } else if (object.name.includes('Line')) {
            info.title = 'Line 详情';
            info.description = '这是一个 Line 对象。在工业设计中，线条元素常用于表示连接、传输或边界，是构建复杂工业系统的重要组成部分。';
            info.image = 'https://images.unsplash.com/photo-1581092335397-9583eb92d232?w=800';
        }

        return info;
    }

    zoomToObject(object) {
        this.isTransitioning = true;
        this.controls.enabled = false;

        const position = new THREE.Vector3();
        object.getWorldPosition(position);

        // 显示信息面板
        const info = this.getObjectInfo(object);
        document.getElementById('infoPanelTitle').textContent = info.title;
        document.getElementById('infoPanelDescription').textContent = info.description;
        document.getElementById('infoPanelImage').src = info.image;
        document.getElementById('infoPanel').classList.add('active');

        gsap.timeline({
            onComplete: () => {
                this.controls.enabled = true;
                this.controls.target.copy(position);
                this.isTransitioning = false;
                this.isZoomedIn = true;
                this.currentFocusedObject = object;
            }
        })
        .to(this.camera.position, {
            duration: 1,
            x: position.x,
            y: position.y + 3,
            z: position.z + 5,
            ease: "power2.inOut"
        })
        .to(this.controls.target, {
            duration: 1,
            x: position.x,
            y: position.y,
            z: position.z,
            ease: "power2.inOut",
            onUpdate: () => this.camera.lookAt(this.controls.target)
        }, "<")
        .to(this.camera, {
            duration: 1,
            fov: this.ZOOM_FOV,
            onUpdate: () => this.camera.updateProjectionMatrix(),
            ease: "power2.inOut"
        }, "<");
    }

    resetCamera() {
        this.isTransitioning = true;
        this.controls.enabled = false;

        // 隐藏信息面板
        const infoPanel = document.getElementById('infoPanel');
        infoPanel.classList.remove('active');

        gsap.timeline({
            onComplete: () => {
                this.controls.enabled = true;
                this.controls.target.set(0, 1, 0);
                this.isTransitioning = false;
                this.isZoomedIn = false;
                this.currentFocusedObject = null;
            }
        })
        .to(this.camera, {
            duration: 1,
            fov: this.INITIAL_FOV,
            onUpdate: () => this.camera.updateProjectionMatrix(),
            ease: "power2.inOut"
        })
        .to(this.camera.position, {
            duration: 1,
            x: 0,
            y: 8,
            z: 10,
            ease: "power3.inOut"
        }, "<")
        .to(this.controls.target, {
            duration: 1,
            x: 0,
            y: 1,
            z: 0,
            ease: "power3.inOut",
            onUpdate: () => this.camera.lookAt(this.controls.target)
        }, "<");
    }
}

export default InteractionManager;