import * as THREE from "three";
import { playerShirt, playerSkin } from "./player-appearance";

// Shared geometry keeps both squads inexpensive when the camera is zoomed out.
export function footballerFactory() {
  const sphere = new THREE.SphereGeometry(1, 10, 8);
  const segment = new THREE.CylinderGeometry(0.85, 1, 1, 8);
  const materials = new Map<number, THREE.MeshStandardMaterial>();
  function part(
    parent: THREE.Group,
    shape: THREE.BufferGeometry,
    color: number,
    x: number,
    y: number,
    z: number,
    w: number,
    h: number,
    d: number,
  ) {
    let mat = materials.get(color);
    if (!mat) {
      mat = new THREE.MeshStandardMaterial({ color, roughness: 0.9 });
      materials.set(color, mat);
    }
    const mesh = new THREE.Mesh(shape, mat);
    mesh.position.set(x, y, z);
    mesh.scale.set(w, h, d);
    parent.add(mesh);
    return mesh;
  }
  function joint(parent: THREE.Group, x: number, y: number, z: number) {
    const pivot = new THREE.Group();
    pivot.position.set(x, y, z);
    parent.add(pivot);
    return pivot;
  }
  return (away: boolean, slot: number) => {
    const model = new THREE.Group();
    const body = joint(model, 0, 0, 0);
    const shirt = playerShirt(away, slot === 0);
    const shorts = away ? 0x42232e : 0x193631;
    const skin = playerSkin(slot + 1);
    part(body, segment, shirt, 0, 1.24, 0, 0.31, 0.57, 0.21);
    part(body, sphere, shorts, 0, 0.91, 0, 0.29, 0.18, 0.19);
    part(body, sphere, skin, 0, 1.74, 0.02, 0.18, 0.22, 0.16);
    part(body, sphere, 0x332a25, 0, 1.86, -0.02, 0.18, 0.12, 0.16);
    const limbs = [-1, 1].map(sign => {
      const hip = joint(body, sign * 0.15, 0.94, 0);
      part(hip, segment, shorts, 0, -0.17, 0, 0.14, 0.34, 0.14);
      const knee = joint(hip, 0, -0.37, 0);
      part(knee, segment, shirt, 0, -0.21, 0, 0.09, 0.41, 0.1);
      part(knee, sphere, 0x19212b, 0, -0.43, 0.07, 0.11, 0.075, 0.18);
      const arm = joint(body, sign * 0.31, 1.46, 0);
      arm.rotation.z = sign * 0.16;
      part(arm, segment, shirt, 0, -0.11, 0, 0.115, 0.23, 0.12);
      const forearm = joint(arm, 0, -0.23, 0);
      forearm.rotation.x = -0.48;
      part(forearm, segment, skin, 0, -0.14, 0, 0.075, 0.29, 0.08);
      return { hip, knee, arm, sign };
    });
    model.scale.setScalar(1.58);
    let phase = slot * 1.7;
    model.rotation.y = away ? -Math.PI / 2 : Math.PI / 2;
    function pose(dx: number, dz: number, dt: number) {
      const distance = Math.hypot(dx, dz);
      const effort = dt > 0 ? Math.min(1, distance / (4 * dt)) : 0;
      if (effort > 0.01) {
        const angle = Math.atan2(dx, dz) - model.rotation.y;
        model.rotation.y +=
          Math.atan2(Math.sin(angle), Math.cos(angle)) * Math.min(1, dt * 12);
      }
      phase += Math.min(distance * 2.5, dt * 12);
      body.position.y = Math.abs(Math.cos(phase)) * 0.065 * effort;
      body.rotation.x = effort * 0.12;
      for (const { hip, knee, arm, sign } of limbs) {
        const swing = sign * Math.sin(phase) * effort;
        hip.rotation.x = swing * 0.73;
        knee.rotation.x = Math.max(0, swing) * 0.85;
        arm.rotation.x = -swing * 0.59 - 0.1;
      }
    }
    return { model, pose };
  };
}
