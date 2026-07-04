"use client";

import { useEffect, useRef } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, OrthographicCamera } from "@react-three/drei";
import type * as THREE from "three";
import { CafeModel } from "./CafeModel";
import { CAMERA } from "@/lib/diorama";

function CameraRig() {
  const camRef = useRef<THREE.OrthographicCamera>(null);

  useEffect(() => {
    camRef.current?.lookAt(...CAMERA.lookAt);
  }, []);

  return <OrthographicCamera ref={camRef} makeDefault position={CAMERA.position} zoom={CAMERA.zoom} near={0.1} far={100} />;
}

// DioramaContents holds everything that lives inside the Canvas: lights,
// camera rig, controls, and the model itself. It is pure R3F scene-graph
// content with no <Canvas> of its own, which is what lets it be exercised by
// @react-three/test-renderer (the same way Task 10's CafeModel is) — a real
// <Canvas> cannot be instantiated inside that renderer's own reconciler root.
export function DioramaContents() {
  return (
    <>
      <ambientLight color="#3A2418" intensity={0.4} />
      <CameraRig />
      <OrbitControls
        enablePan={false}
        enableZoom={false}
        minPolarAngle={Math.PI / 2 - 0.35}
        maxPolarAngle={Math.PI / 2 + 0.1}
        minAzimuthAngle={-0.26}
        maxAzimuthAngle={0.26}
      />
      <CafeModel />
    </>
  );
}

// DioramaScene is the public export Task 12 consumes. It is a thin <Canvas>
// wrapper and is intentionally not exercised by @react-three/test-renderer;
// its correctness as a real Canvas mount is verified in a real browser
// (Task 14's manual QA walkthrough).
export function DioramaScene() {
  return (
    <Canvas dpr={[1, 2]}>
      <DioramaContents />
    </Canvas>
  );
}
