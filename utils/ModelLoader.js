import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import * as THREE from 'three';

class ModelLoader {
    constructor(loadingManager) {
        this.loader = new GLTFLoader(loadingManager);
    }

    loadModel(path, onLoad) {
        this.loader.load(path, (gltf) => {
            const model = gltf.scene;
            model.scale.set(18, 18, 18);
            model.position.set(0, 0, 0);
            
            this.setupModelMaterials(model);
            
            if (onLoad) onLoad(gltf);
        });
    }

    setupModelMaterials(model) {
        model.traverse((child) => {
            if (child.isMesh) {
                child.material = child.material.clone();
                child.userData.originalColor = child.material.color.getHex();
                
                if (child.name.match(/Cylinder00[5-9]|Cylinder010/)) {
                    child.userData.isFixedBlue = true;
                    child.userData.originalScale = {
                        x: child.scale.x,
                        y: child.scale.y,
                        z: child.scale.z
                    };
                }

                if (child.name.includes('Box')) {
                    child.userData.type = 'box';
                } else if (child.name.includes('Cylinder')) {
                    child.userData.type = 'cylinder';
                } else if (child.name.includes('Line')) {
                    child.userData.type = 'line';
                }
            }
        });
    }
}

export default ModelLoader;