"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { cn } from "@/lib/utils";

interface EvolutionOrbitCanvasProps {
  activeStage: number;
  className?: string;
}

const STAGE_HEX_COLORS = [0x7cff4f, 0x38bdf8, 0x7cff4f, 0xfacc15] as const;

export function EvolutionOrbitCanvas({
  activeStage,
  className,
}: EvolutionOrbitCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef(activeStage);
  const [fallbackActive, setFallbackActive] = useState(false);

  stageRef.current = activeStage;

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true,
        powerPreference: "low-power",
      });
    } catch {
      setFallbackActive(true);
      return;
    }

    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setClearColor(0x000000, 0);
    container.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      45,
      Math.max(container.clientWidth, 1) / Math.max(container.clientHeight, 1),
      0.1,
      50,
    );
    camera.position.set(0, 1.4, 8.2);

    const coreGroup = new THREE.Group();
    scene.add(coreGroup);

    // Wireframe geodesic stadium sphere
    const icosaGeo = new THREE.IcosahedronGeometry(2.1, 2);
    const wireGeo = new THREE.WireframeGeometry(icosaGeo);
    const wireMat = new THREE.LineBasicMaterial({
      color: 0x7cff4f,
      transparent: true,
      opacity: 0.22,
    });
    const geodesic = new THREE.LineSegments(wireGeo, wireMat);
    coreGroup.add(geodesic);

    // 4 concentric tactical orbital rings (progressively brighter per stage)
    const ringGeometries: THREE.TorusGeometry[] = [];
    const ringMaterials: THREE.MeshBasicMaterial[] = [];
    const rings: THREE.Mesh[] = [];

    for (let i = 0; i < 4; i++) {
      const torusGeo = new THREE.TorusGeometry(2.55 + i * 0.42, 0.012, 8, 72);
      const torusMat = new THREE.MeshBasicMaterial({
        color: STAGE_HEX_COLORS[i],
        transparent: true,
        opacity: 0.14,
      });
      const ring = new THREE.Mesh(torusGeo, torusMat);
      ring.rotation.x = Math.PI / 2.3 + i * 0.28;
      ring.rotation.y = i * 0.45;
      coreGroup.add(ring);
      ringGeometries.push(torusGeo);
      ringMaterials.push(torusMat);
      rings.push(ring);
    }

    // Club constellation nodes orbiting the dome
    const totalNodes = 36;
    const nodePositions = new Float32Array(totalNodes * 3);
    for (let i = 0; i < totalNodes; i++) {
      const phi = Math.acos(1 - (2 * (i + 0.5)) / totalNodes);
      const theta = Math.PI * (1 + Math.sqrt(5)) * i;
      const radius = 2.25 + (i % 4) * 0.45;
      nodePositions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      nodePositions[i * 3 + 1] = radius * Math.cos(phi);
      nodePositions[i * 3 + 2] = radius * Math.sin(phi) * Math.sin(theta);
    }

    const pointsGeo = new THREE.BufferGeometry();
    pointsGeo.setAttribute(
      "position",
      new THREE.BufferAttribute(nodePositions, 3),
    );
    const pointsMat = new THREE.PointsMaterial({
      color: 0x7cff4f,
      size: 0.13,
      transparent: true,
      opacity: 0.72,
    });
    const points = new THREE.Points(pointsGeo, pointsMat);
    coreGroup.add(points);

    const resizeObserver = new ResizeObserver(() => {
      const width = Math.max(container.clientWidth, 1);
      const height = Math.max(container.clientHeight, 1);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    });
    resizeObserver.observe(container);

    let isVisible = true;
    const intersectionObserver = new IntersectionObserver(
      entries => {
        isVisible = entries[0]?.isIntersecting ?? true;
      },
      { threshold: 0.05 },
    );
    intersectionObserver.observe(container);

    const targetColor = new THREE.Color(STAGE_HEX_COLORS[0]);
    const clock = new THREE.Clock();
    let frameId = 0;

    const renderScene = (elapsed: number) => {
      const stage = Math.min(Math.max(stageRef.current, 0), 3);
      targetColor.setHex(STAGE_HEX_COLORS[stage]);
      wireMat.color.lerp(targetColor, 0.06);
      pointsMat.color.lerp(targetColor, 0.06);

      const targetScale = 0.86 + stage * 0.085;
      coreGroup.scale.lerp(
        new THREE.Vector3(targetScale, targetScale, targetScale),
        0.05,
      );

      geodesic.rotation.y = elapsed * (0.12 + stage * 0.04);
      geodesic.rotation.x = Math.sin(elapsed * 0.25) * 0.18;
      points.rotation.y = -elapsed * 0.16;

      for (let i = 0; i < rings.length; i++) {
        rings[i].rotation.z =
          elapsed * (0.14 + i * 0.06) * (i % 2 === 0 ? 1 : -1);
        const isUnlocked = i <= stage;
        const targetOpacity = i === stage ? 0.52 : isUnlocked ? 0.22 : 0.06;
        ringMaterials[i].opacity +=
          (targetOpacity - ringMaterials[i].opacity) * 0.07;
      }

      renderer.render(scene, camera);
    };

    if (prefersReducedMotion) {
      renderScene(0.5);
    } else {
      const animate = () => {
        frameId = window.requestAnimationFrame(animate);
        if (!isVisible) return;
        renderScene(clock.getElapsedTime());
      };
      frameId = window.requestAnimationFrame(animate);
    }

    return () => {
      window.cancelAnimationFrame(frameId);
      resizeObserver.disconnect();
      intersectionObserver.disconnect();

      icosaGeo.dispose();
      wireGeo.dispose();
      wireMat.dispose();
      for (const geo of ringGeometries) geo.dispose();
      for (const mat of ringMaterials) mat.dispose();
      pointsGeo.dispose();
      pointsMat.dispose();
      renderer.dispose();

      if (renderer.domElement.parentNode === container) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  if (fallbackActive) {
    return (
      <div
        aria-hidden="true"
        className={cn(
          "pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(124,255,79,0.12),transparent_62%)]",
          className,
        )}
      />
    );
  }

  return (
    <div
      ref={containerRef}
      aria-hidden="true"
      className={cn("pointer-events-none absolute inset-0", className)}
    />
  );
}
