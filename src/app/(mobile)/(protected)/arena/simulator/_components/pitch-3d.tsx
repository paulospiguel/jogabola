"use client";

import { type RefObject, useEffect, useRef } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import {
  type Frame,
  type MatchFormatSettings,
  matchFormats,
} from "../_simulation/match";

import { footballerFactory } from "./footballer";

interface PitchProps {
  frame: Frame;
  settings: MatchFormatSettings;
  overhead: boolean;
  onUnavailable: () => void;
  buttons: RefObject<(HTMLButtonElement | null)[]>;
}

function makePitch(scene: THREE.Scene, settings: MatchFormatSettings) {
  const { length, width, goalHeight, goalWidth } = settings;
  const halfLength = length / 2;
  const halfWidth = width / 2;
  const depthScale = length / matchFormats[11].length;
  const widthScale = width / matchFormats[11].width;
  const paint = new THREE.LineBasicMaterial({ color: 0xd0e3b9 });
  const line = (points: [number, number][]) => {
    const vertices = points.map(([x, z]) => new THREE.Vector3(x, 0.025, z));
    scene.add(
      new THREE.Line(new THREE.BufferGeometry().setFromPoints(vertices), paint),
    );
  };
  const rect = (x: number, z: number, w: number, h: number) =>
    line([
      [x, z],
      [x + w, z],
      [x + w, z + h],
      [x, z + h],
      [x, z],
    ]);
  const stripWidth = length / 10;
  const strip = new THREE.PlaneGeometry(stripWidth, width);
  for (let index = 0; index < 10; index += 1) {
    const grass = new THREE.Mesh(
      strip,
      new THREE.MeshStandardMaterial({
        color: index % 2 === 0 ? 0x326737 : 0x3d7741,
      }),
    );
    grass.rotation.x = -Math.PI / 2;
    grass.position.x = -halfLength + (index + 0.5) * stripWidth;
    scene.add(grass);
  }
  rect(-halfLength, -halfWidth, length, width);
  line([
    [0, -halfWidth],
    [0, halfWidth],
  ]);
  line(
    Array.from({ length: 65 }, (_, i) => {
      const angle = (i * Math.PI) / 32;
      const radius = 9.15 * depthScale;
      return [Math.cos(angle) * radius, Math.sin(angle) * radius];
    }),
  );
  for (const direction of [-1, 1]) {
    rect(
      direction * halfLength,
      -20.16 * widthScale,
      -direction * 16.5 * depthScale,
      40.32 * widthScale,
    );
    rect(
      direction * halfLength,
      -9.16 * widthScale,
      -direction * 5.5 * depthScale,
      18.32 * widthScale,
    );
    const goal = new THREE.LineSegments(
      new THREE.EdgesGeometry(new THREE.BoxGeometry(2, goalHeight, goalWidth)),
      paint,
    );
    goal.position.set(direction * (halfLength + 1), goalHeight / 2, 0);
    scene.add(goal);
  }
}

export default function Pitch3d({
  frame,
  settings,
  overhead,
  onUnavailable,
  buttons,
}: PitchProps) {
  const container = useRef<HTMLDivElement>(null);
  const renderFrame = useRef<(frame: Frame) => void>(() => {});
  const setCamera = useRef<(overhead: boolean) => void>(() => {});

  useEffect(() => {
    const host = container.current;
    if (!host) return;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true });
    } catch {
      onUnavailable();
      return;
    }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
    renderer.domElement.className = "block size-full";
    renderer.domElement.addEventListener("webglcontextlost", onUnavailable);
    host.append(renderer.domElement);

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x111e1b);
    const camera = new THREE.PerspectiveCamera(46, 1, 0.5, 330);
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enablePan = false;
    renderer.domElement.style.touchAction = "pan-y";
    controls.minDistance = 28;
    controls.maxDistance = 220;
    controls.maxPolarAngle = Math.PI * 0.48;
    camera.aspect =
      Math.max(1, host.clientWidth) / Math.max(1, host.clientHeight);

    scene.add(new THREE.HemisphereLight(0xf0faff, 0x717251, 2.2));
    const sun = new THREE.DirectionalLight(0xfff2d8, 2);
    sun.position.set(-30, 65, 28);
    scene.add(sun);
    makePitch(scene, settings);

    const createFootballer = footballerFactory();
    const shadowGeometry = new THREE.CircleGeometry(0.65, 16);
    const shadowMaterial = new THREE.MeshBasicMaterial({
      color: 0x122a1b,
      transparent: true,
      opacity: 0.34,
      depthWrite: false,
    });
    const figures = Array.from({ length: settings.players * 2 }, (_, index) => {
      const figure = new THREE.Group();
      const { model, pose } = createFootballer(
        index >= settings.players,
        index % settings.players,
      );
      const shadow = new THREE.Mesh(shadowGeometry, shadowMaterial);
      shadow.rotation.x = -Math.PI / 2;
      shadow.position.y = 0.035;
      figure.add(model, shadow);
      scene.add(figure);
      return { figure, model, pose };
    });
    const projected = new THREE.Vector3();
    const draw = () => {
      renderer.render(scene, camera);
      figures.forEach(({ figure }, index) => {
        const button = buttons.current[index];
        if (!button) return;
        projected
          .set(figure.position.x, 1.9, figure.position.z)
          .project(camera);
        const onscreen =
          Math.abs(projected.x) <= 1 &&
          Math.abs(projected.y) <= 1 &&
          Math.abs(projected.z) <= 1;
        button.style.visibility = onscreen ? "visible" : "hidden";
        if (!onscreen) return;
        button.style.left = `${50 + projected.x * 50}%`;
        button.style.top = `${50 - projected.y * 50}%`;
        button.style.zIndex = String(Math.round((1 - projected.z) * 10000));
      });
    };
    controls.addEventListener("change", draw);
    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2();
    const models: THREE.Object3D[] = figures.map(({ model }) => model);
    let press: { x: number; y: number; id: number } | undefined;
    const startPick = (event: PointerEvent) => {
      press =
        event.isPrimary && event.button === 0
          ? { x: event.clientX, y: event.clientY, id: event.pointerId }
          : undefined;
    };
    const cancelPick = () => {
      press = undefined;
    };
    const pick = (event: PointerEvent) => {
      const start = press;
      cancelPick();
      if (
        !start ||
        start.id !== event.pointerId ||
        Math.hypot(event.clientX - start.x, event.clientY - start.y) > 5
      )
        return;
      const rect = renderer.domElement.getBoundingClientRect();
      pointer.set(
        ((event.clientX - rect.left) / rect.width) * 2 - 1,
        1 - ((event.clientY - rect.top) / rect.height) * 2,
      );
      raycaster.setFromCamera(pointer, camera);
      let hit: THREE.Object3D | undefined = raycaster
        .intersectObjects(models, true)
        .at(0)?.object;
      while (hit && !models.includes(hit)) hit = hit.parent ?? undefined;
      if (hit) buttons.current[models.indexOf(hit)]?.click();
    };
    renderer.domElement.addEventListener("pointerdown", startPick);
    renderer.domElement.addEventListener("pointerup", pick);
    renderer.domElement.addEventListener("pointercancel", cancelPick);

    const ball = new THREE.Mesh(
      new THREE.SphereGeometry(0.36, 12, 8),
      new THREE.MeshStandardMaterial({ color: 0xfaf6d5 }),
    );
    scene.add(ball);

    setCamera.current = top => {
      const distance =
        ((camera.aspect < 1 ? 162 : 96) * settings.length) /
        matchFormats[11].length;
      camera.position.set(
        0,
        top ? distance : distance * 0.76,
        top ? 0.01 : distance * 0.78,
      );
      camera.lookAt(0, 0, 0);
      controls.update();
      draw();
    };
    let lastTime = 0;
    let lastSecond = -Infinity;
    renderFrame.current = value => {
      const now = performance.now();
      const step = value.second - lastSecond;
      const dt =
        step > 0 && step < 10 ? Math.min(0.1, (now - lastTime) / 1000) : 0;
      lastTime = now;
      lastSecond = value.second;
      value.players.forEach((player, index) => {
        const { figure, pose } = figures[index];
        pose(player.x - figure.position.x, player.z - figure.position.z, dt);
        figure.position.set(player.x, 0, player.z);
      });
      ball.position.set(value.ball.x, 0.37, value.ball.z);
      draw();
    };
    const resize = new ResizeObserver(() => {
      const width = Math.max(1, host.clientWidth);
      const height = Math.max(1, host.clientHeight);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height, false);
      draw();
    });
    resize.observe(host);

    return () => {
      resize.disconnect();
      controls.dispose();
      setCamera.current = () => {};
      renderFrame.current = () => {};
      const geometries = new Set<THREE.BufferGeometry>();
      const materials = new Set<THREE.Material>();
      scene.traverse(object => {
        if (object instanceof THREE.Mesh || object instanceof THREE.Line) {
          geometries.add(object.geometry);
          for (const material of [object.material].flat())
            materials.add(material);
        }
      });
      for (const geometry of geometries) geometry.dispose();
      for (const material of materials) material.dispose();
      renderer.domElement.removeEventListener("pointerdown", startPick);
      renderer.domElement.removeEventListener("pointerup", pick);
      renderer.domElement.removeEventListener("pointercancel", cancelPick);
      renderer.dispose();
      renderer.domElement.removeEventListener(
        "webglcontextlost",
        onUnavailable,
      );
      renderer.domElement.remove();
    };
  }, [buttons, onUnavailable, settings]);

  useEffect(() => setCamera.current(overhead), [overhead]);
  useEffect(() => renderFrame.current(frame), [frame]);

  return (
    <div ref={container} className="absolute inset-0" aria-hidden="true" />
  );
}
