"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { cn } from "@/lib/utils";

interface TacticalPitchCanvasProps {
  className?: string;
}

interface NodeTrack {
  baseX: number;
  baseZ: number;
  radiusX: number;
  radiusZ: number;
  speed: number;
  phase: number;
  isPrimary: boolean;
}

const NODE_TRACKS: NodeTrack[] = [
  // Home 4-3-3 tactical nodes (neon lime)
  {
    baseX: -6.2,
    baseZ: 0.0,
    radiusX: 0.25,
    radiusZ: 0.45,
    speed: 0.55,
    phase: 0.2,
    isPrimary: true,
  },
  {
    baseX: -3.9,
    baseZ: -2.6,
    radiusX: 0.55,
    radiusZ: 0.4,
    speed: 0.62,
    phase: 1.1,
    isPrimary: true,
  },
  {
    baseX: -4.1,
    baseZ: -0.9,
    radiusX: 0.45,
    radiusZ: 0.35,
    speed: 0.58,
    phase: 2.3,
    isPrimary: true,
  },
  {
    baseX: -4.1,
    baseZ: 0.9,
    radiusX: 0.45,
    radiusZ: 0.35,
    speed: 0.6,
    phase: 3.1,
    isPrimary: true,
  },
  {
    baseX: -3.9,
    baseZ: 2.6,
    radiusX: 0.55,
    radiusZ: 0.4,
    speed: 0.64,
    phase: 0.7,
    isPrimary: true,
  },
  {
    baseX: -1.4,
    baseZ: -1.8,
    radiusX: 0.75,
    radiusZ: 0.55,
    speed: 0.72,
    phase: 1.9,
    isPrimary: true,
  },
  {
    baseX: -1.8,
    baseZ: 0.0,
    radiusX: 0.65,
    radiusZ: 0.5,
    speed: 0.68,
    phase: 4.1,
    isPrimary: true,
  },
  {
    baseX: -1.4,
    baseZ: 1.8,
    radiusX: 0.75,
    radiusZ: 0.55,
    speed: 0.74,
    phase: 2.8,
    isPrimary: true,
  },
  {
    baseX: 1.6,
    baseZ: -2.4,
    radiusX: 0.9,
    radiusZ: 0.45,
    speed: 0.82,
    phase: 0.5,
    isPrimary: true,
  },
  {
    baseX: 2.2,
    baseZ: 0.0,
    radiusX: 0.85,
    radiusZ: 0.55,
    speed: 0.78,
    phase: 3.6,
    isPrimary: true,
  },
  {
    baseX: 1.6,
    baseZ: 2.4,
    radiusX: 0.9,
    radiusZ: 0.45,
    speed: 0.8,
    phase: 5.0,
    isPrimary: true,
  },
  // Tactical telemetry / opponent reference markers (info cyan)
  {
    baseX: 4.6,
    baseZ: -1.6,
    radiusX: 0.45,
    radiusZ: 0.4,
    speed: 0.5,
    phase: 1.4,
    isPrimary: false,
  },
  {
    baseX: 4.9,
    baseZ: 0.4,
    radiusX: 0.4,
    radiusZ: 0.5,
    speed: 0.54,
    phase: 2.7,
    isPrimary: false,
  },
  {
    baseX: 3.3,
    baseZ: 1.4,
    radiusX: 0.55,
    radiusZ: 0.4,
    speed: 0.61,
    phase: 4.4,
    isPrimary: false,
  },
  {
    baseX: 0.2,
    baseZ: -0.6,
    radiusX: 0.7,
    radiusZ: 0.6,
    speed: 0.7,
    phase: 0.9,
    isPrimary: false,
  },
];

const PASSING_LINKS: readonly [number, number][] = [
  [0, 2],
  [0, 3],
  [1, 5],
  [2, 6],
  [3, 6],
  [4, 7],
  [5, 6],
  [6, 7],
  [5, 8],
  [6, 9],
  [7, 10],
  [8, 9],
  [9, 10],
  [5, 9],
  [7, 9],
];

function createPitchLineGeometry(): THREE.BufferGeometry {
  const halfW = 7.4;
  const halfH = 4.6;
  const y = 0.02;
  const vertices: number[] = [];

  const pushSegment = (x1: number, z1: number, x2: number, z2: number) => {
    vertices.push(x1, y, z1, x2, y, z2);
  };

  const pushRect = (x1: number, z1: number, x2: number, z2: number) => {
    pushSegment(x1, z1, x2, z1);
    pushSegment(x2, z1, x2, z2);
    pushSegment(x2, z2, x1, z2);
    pushSegment(x1, z2, x1, z1);
  };

  const pushArc = (
    cx: number,
    cz: number,
    radius: number,
    startAngle: number,
    endAngle: number,
    segments: number,
  ) => {
    for (let i = 0; i < segments; i++) {
      const a1 = startAngle + ((endAngle - startAngle) * i) / segments;
      const a2 = startAngle + ((endAngle - startAngle) * (i + 1)) / segments;
      pushSegment(
        cx + Math.cos(a1) * radius,
        cz + Math.sin(a1) * radius,
        cx + Math.cos(a2) * radius,
        cz + Math.sin(a2) * radius,
      );
    }
  };

  // Outer pitch boundary & halfway line
  pushRect(-halfW, -halfH, halfW, halfH);
  pushSegment(0, -halfH, 0, halfH);

  // Center circle
  pushArc(0, 0, 1.45, 0, Math.PI * 2, 48);

  // Left and right penalty areas + 6-yard boxes
  pushRect(-halfW, -2.25, -halfW + 2.2, 2.25);
  pushRect(-halfW, -1.05, -halfW + 0.85, 1.05);
  pushRect(halfW - 2.2, -2.25, halfW, 2.25);
  pushRect(halfW - 0.85, -1.05, halfW, 1.05);

  // Penalty arcs
  pushArc(-halfW + 1.55, 0, 1.15, -0.92, 0.92, 20);
  pushArc(halfW - 1.55, 0, 1.15, Math.PI - 0.92, Math.PI + 0.92, 20);

  // Subtle tactical grid subdivisions
  for (let i = -3; i <= 3; i++) {
    if (i === 0) continue;
    pushSegment((halfW / 4) * i, -halfH, (halfW / 4) * i, halfH);
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute(
    "position",
    new THREE.Float32BufferAttribute(vertices, 3),
  );
  return geometry;
}

export function TacticalPitchCanvas({ className }: TacticalPitchCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [fallbackActive, setFallbackActive] = useState(false);

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
        powerPreference: "high-performance",
      });
    } catch {
      setFallbackActive(true);
      return;
    }

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    renderer.setPixelRatio(dpr);
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setClearColor(0x000000, 0);
    container.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x06090d, 0.055);

    const camera = new THREE.PerspectiveCamera(
      42,
      Math.max(container.clientWidth, 1) / Math.max(container.clientHeight, 1),
      0.1,
      80,
    );
    camera.position.set(0, 7.6, 11.4);
    camera.lookAt(0, -0.4, 0);

    const pitchGroup = new THREE.Group();
    pitchGroup.rotation.y = -0.18;
    pitchGroup.position.set(0.6, -0.9, 0);
    scene.add(pitchGroup);

    // Subtle glowing turf plane
    const planeGeo = new THREE.PlaneGeometry(16, 10.2, 24, 16);
    const planeMat = new THREE.MeshBasicMaterial({
      color: 0x0f1a24,
      transparent: true,
      opacity: 0.42,
      wireframe: true,
    });
    const turfWire = new THREE.Mesh(planeGeo, planeMat);
    turfWire.rotation.x = -Math.PI / 2;
    turfWire.position.y = -0.02;
    pitchGroup.add(turfWire);

    // Crisp tactical pitch lines
    const pitchLineGeo = createPitchLineGeometry();
    const pitchLineMat = new THREE.LineBasicMaterial({
      color: 0x7cff4f,
      transparent: true,
      opacity: 0.34,
    });
    const pitchLines = new THREE.LineSegments(pitchLineGeo, pitchLineMat);
    pitchGroup.add(pitchLines);

    // Animated player/telemetry nodes
    const nodeGeo = new THREE.SphereGeometry(0.11, 14, 14);
    const primaryNodeMat = new THREE.MeshBasicMaterial({ color: 0x7cff4f });
    const secondaryNodeMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });

    const ringGeo = new THREE.RingGeometry(0.18, 0.25, 24);
    const primaryRingMat = new THREE.MeshBasicMaterial({
      color: 0x7cff4f,
      transparent: true,
      opacity: 0.45,
      side: THREE.DoubleSide,
    });
    const secondaryRingMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.35,
      side: THREE.DoubleSide,
    });

    const nodeMeshes: THREE.Mesh[] = [];
    const ringMeshes: THREE.Mesh[] = [];

    for (const track of NODE_TRACKS) {
      const node = new THREE.Mesh(
        nodeGeo,
        track.isPrimary ? primaryNodeMat : secondaryNodeMat,
      );
      node.position.set(track.baseX, 0.16, track.baseZ);
      pitchGroup.add(node);
      nodeMeshes.push(node);

      const ring = new THREE.Mesh(
        ringGeo,
        track.isPrimary ? primaryRingMat : secondaryRingMat,
      );
      ring.rotation.x = -Math.PI / 2;
      ring.position.set(track.baseX, 0.04, track.baseZ);
      pitchGroup.add(ring);
      ringMeshes.push(ring);
    }

    // Dynamic passing lane connections
    const linkPositions = new Float32Array(PASSING_LINKS.length * 6);
    const linkGeo = new THREE.BufferGeometry();
    linkGeo.setAttribute(
      "position",
      new THREE.BufferAttribute(linkPositions, 3),
    );
    const linkMat = new THREE.LineBasicMaterial({
      color: 0x7cff4f,
      transparent: true,
      opacity: 0.24,
    });
    const passingLines = new THREE.LineSegments(linkGeo, linkMat);
    pitchGroup.add(passingLines);

    // Floating stadium atmosphere particles
    const particleCount = 130;
    const particlePositions = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount; i++) {
      particlePositions[i * 3] = (Math.random() - 0.5) * 20;
      particlePositions[i * 3 + 1] = Math.random() * 6 + 0.3;
      particlePositions[i * 3 + 2] = (Math.random() - 0.5) * 14;
    }
    const particleGeo = new THREE.BufferGeometry();
    particleGeo.setAttribute(
      "position",
      new THREE.BufferAttribute(particlePositions, 3),
    );
    const particleMat = new THREE.PointsMaterial({
      color: 0x7cff4f,
      size: 0.075,
      transparent: true,
      opacity: 0.42,
    });
    const particles = new THREE.Points(particleGeo, particleMat);
    scene.add(particles);

    // Expanding radar pulse at center circle
    const pulseGeo = new THREE.RingGeometry(0.4, 0.46, 48);
    const pulseMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.35,
      side: THREE.DoubleSide,
    });
    const pulseRing = new THREE.Mesh(pulseGeo, pulseMat);
    pulseRing.rotation.x = -Math.PI / 2;
    pulseRing.position.y = 0.03;
    pitchGroup.add(pulseRing);

    let pointerX = 0;
    let pointerY = 0;
    const handlePointerMove = (event: PointerEvent) => {
      const rect = container.getBoundingClientRect();
      if (!rect.width || !rect.height) return;
      pointerX = ((event.clientX - rect.left) / rect.width - 0.5) * 2;
      pointerY = ((event.clientY - rect.top) / rect.height - 0.5) * 2;
    };

    if (!prefersReducedMotion) {
      window.addEventListener("pointermove", handlePointerMove, {
        passive: true,
      });
    }

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

    let frameId = 0;
    const clock = new THREE.Clock();

    const updateFrame = (elapsed: number) => {
      for (let i = 0; i < NODE_TRACKS.length; i++) {
        const track = NODE_TRACKS[i];
        const x =
          track.baseX +
          Math.sin(elapsed * track.speed + track.phase) * track.radiusX;
        const z =
          track.baseZ +
          Math.cos(elapsed * track.speed * 0.85 + track.phase) * track.radiusZ;
        const y = 0.16 + Math.sin(elapsed * 2 + track.phase) * 0.04;

        nodeMeshes[i].position.set(x, y, z);
        ringMeshes[i].position.set(x, 0.04, z);
        const ringScale = 1 + Math.sin(elapsed * 2.2 + track.phase) * 0.22;
        ringMeshes[i].scale.set(ringScale, ringScale, 1);
      }

      const positionsAttr = linkGeo.attributes
        .position as THREE.BufferAttribute;
      for (let i = 0; i < PASSING_LINKS.length; i++) {
        const [fromIdx, toIdx] = PASSING_LINKS[i];
        const from = nodeMeshes[fromIdx].position;
        const to = nodeMeshes[toIdx].position;
        positionsAttr.setXYZ(i * 2, from.x, from.y, from.z);
        positionsAttr.setXYZ(i * 2 + 1, to.x, to.y, to.z);
      }
      positionsAttr.needsUpdate = true;

      // Center tactical radar pulse
      const pulseProgress = (elapsed * 0.26) % 1;
      const pulseScale = 1 + pulseProgress * 7.5;
      pulseRing.scale.set(pulseScale, pulseScale, 1);
      pulseMat.opacity = (1 - pulseProgress) * 0.28;

      particles.rotation.y = elapsed * 0.025;

      // Smooth parallax rotation
      const targetRotY = -0.18 + pointerX * 0.14;
      const targetRotX = pointerY * 0.06;
      pitchGroup.rotation.y += (targetRotY - pitchGroup.rotation.y) * 0.04;
      pitchGroup.rotation.x += (targetRotX - pitchGroup.rotation.x) * 0.04;

      renderer.render(scene, camera);
    };

    if (prefersReducedMotion) {
      updateFrame(0.6);
    } else {
      const animate = () => {
        frameId = window.requestAnimationFrame(animate);
        if (!isVisible) return;
        updateFrame(clock.getElapsedTime());
      };
      frameId = window.requestAnimationFrame(animate);
    }

    return () => {
      window.cancelAnimationFrame(frameId);
      window.removeEventListener("pointermove", handlePointerMove);
      resizeObserver.disconnect();
      intersectionObserver.disconnect();

      planeGeo.dispose();
      planeMat.dispose();
      pitchLineGeo.dispose();
      pitchLineMat.dispose();
      nodeGeo.dispose();
      primaryNodeMat.dispose();
      secondaryNodeMat.dispose();
      ringGeo.dispose();
      primaryRingMat.dispose();
      secondaryRingMat.dispose();
      linkGeo.dispose();
      linkMat.dispose();
      particleGeo.dispose();
      particleMat.dispose();
      pulseGeo.dispose();
      pulseMat.dispose();
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
          "pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_65%_45%,rgba(124,255,79,0.14),transparent_55%),radial-gradient(ellipse_at_25%_70%,rgba(56,189,248,0.12),transparent_55%)]",
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
