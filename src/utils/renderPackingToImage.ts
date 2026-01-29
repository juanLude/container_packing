import * as THREE from "three";
import { PackingResult } from "../algorithms/types";

export type CameraPreset = "iso" | "top" | "side";

export function renderPackingToImage(
  result: PackingResult,
  preset: CameraPreset = "iso",
  size: number = 800,
): string {
  // -----------------------------
  // Scene
  // -----------------------------
  const scene = new THREE.Scene();
  scene.background = new THREE.Color("#ffffff");

  const { x: cX, y: cY, z: cZ } = result.container.dimensions;

  // -----------------------------
  // Camera
  // -----------------------------
  const camera = new THREE.PerspectiveCamera(45, 1, 1, 10000);

  switch (preset) {
    case "top":
      camera.position.set(cX / 2, cY * 3, cZ / 2);
      break;
    case "side":
      camera.position.set(cX * 3, cY / 2, cZ / 2);
      break;
    case "iso":
    default:
      camera.position.set(cX * 2, cY * 2, cZ * 2);
      break;
  }

  camera.lookAt(new THREE.Vector3(cX / 2, cY / 2, cZ / 2));

  // -----------------------------
  // Lights
  // -----------------------------
  scene.add(new THREE.AmbientLight(0xffffff, 0.7));

  const directionalLight = new THREE.DirectionalLight(0xffffff, 0.6);
  directionalLight.position.set(1, 2, 3);
  scene.add(directionalLight);

  // -----------------------------
  // Container (wireframe)
  // -----------------------------
  const containerGeometry = new THREE.BoxGeometry(cX, cY, cZ);
  const containerMaterial = new THREE.MeshBasicMaterial({
    color: 0x000000,
    wireframe: true,
  });

  const containerMesh = new THREE.Mesh(containerGeometry, containerMaterial);

  containerMesh.position.set(cX / 2, cY / 2, cZ / 2);
  scene.add(containerMesh);

  // -----------------------------
  // Packed boxes
  // -----------------------------
  result.packedBoxes.forEach((placedBox) => {
    const { dimensions, position, color } = placedBox;

    const geometry = new THREE.BoxGeometry(
      dimensions.x,
      dimensions.y,
      dimensions.z,
    );

    const material = new THREE.MeshLambertMaterial({
      color: color || "#4f46e5",
    });

    const mesh = new THREE.Mesh(geometry, material);

    mesh.position.set(
      position.x + dimensions.x / 2,
      position.y + dimensions.y / 2,
      position.z + dimensions.z / 2,
    );

    scene.add(mesh);
  });

  // -----------------------------
  // Renderer (offscreen)
  // -----------------------------
  const renderer = new THREE.WebGLRenderer({
    antialias: true,
    preserveDrawingBuffer: true,
  });

  renderer.setSize(size, size);
  renderer.render(scene, camera);

  // -----------------------------
  // Export image
  // -----------------------------
  const image = renderer.domElement.toDataURL("image/png");

  renderer.dispose();

  return image;
}
