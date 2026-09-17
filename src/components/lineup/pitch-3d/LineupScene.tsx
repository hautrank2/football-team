"use client";

import { OrbitControls } from "@react-three/drei";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import * as THREE from "three";
import {
  createPitchTexture,
  createShadowTexture,
  createTokenTexture,
  PITCH_L,
  PITCH_W,
  slotToWorld,
  TOKEN_H,
  TOKEN_W,
} from "./textures";
import type { LineupSlotModel, PlayerModel } from "@/types";

const TOKEN_HEIGHT = 1.5; // world height of a player token
const TOKEN_ASPECT = TOKEN_W / TOKEN_H;

// How high the default camera sits, as an angle above the pitch.
const ELEVATION = THREE.MathUtils.degToRad(40);
const TARGET: [number, number, number] = [0, 0.5, 0];

// Pulls the camera back far enough that the whole pitch fits the canvas — at
// whatever shape the container happens to be. Without this the view is framed
// for one aspect ratio and the wide players get cut off on a phone.
const FitCamera = () => {
  const camera = useThree((s) => s.camera) as THREE.PerspectiveCamera;
  const size = useThree((s) => s.size);
  const controls = useThree((s) => s.controls);
  const invalidate = useThree((s) => s.invalidate);

  useEffect(() => {
    const aspect = Math.max(0.25, size.width / size.height);
    const vFov = THREE.MathUtils.degToRad(camera.fov);
    const hFov = 2 * Math.atan(Math.tan(vFov / 2) * aspect);

    // What has to fit: the pitch width plus a token's worth of margin, and the
    // pitch length foreshortened by the camera's tilt plus the token height.
    const needH = PITCH_W + 1.6;
    const needV = PITCH_L * Math.cos(ELEVATION) + TOKEN_HEIGHT + 0.6;
    const distance =
      Math.max(
        needV / 2 / Math.tan(vFov / 2),
        needH / 2 / Math.tan(hFov / 2),
      ) * 1.04;

    camera.position.set(
      0,
      TARGET[1] + distance * Math.sin(ELEVATION),
      distance * Math.cos(ELEVATION),
    );
    camera.lookAt(...TARGET);
    camera.updateProjectionMatrix();
    (controls as { update?: () => void } | null)?.update?.();
    invalidate();
  }, [camera, size.width, size.height, controls, invalidate]);

  return null;
};

// ---------------------------------------------------------------------------

const Pitch = () => {
  const texture = useMemo(() => createPitchTexture(), []);
  useEffect(() => () => texture.dispose(), [texture]);

  return (
    <group>
      {/* Turf */}
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[PITCH_W, PITCH_L]} />
        <meshStandardMaterial map={texture} roughness={0.95} />
      </mesh>

      {/* A darker apron so the pitch doesn't float in the void */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.02, 0]}>
        <planeGeometry args={[PITCH_W * 1.7, PITCH_L * 1.35]} />
        <meshStandardMaterial color="#0a2f1c" roughness={1} />
      </mesh>

      <Goal z={-PITCH_L / 2} />
      <Goal z={PITCH_L / 2} />
    </group>
  );
};

// Posts, crossbar and a faint net panel. Simple boxes on purpose — a real net
// mesh would cost more than it adds at this camera distance.
const Goal = ({ z }: { z: number }) => {
  const width = PITCH_W * 0.16;
  const height = 0.55;
  const post = 0.045;
  const outward = z < 0 ? -1 : 1;

  return (
    <group position={[0, 0, z]}>
      {[-1, 1].map((side) => (
        <mesh key={side} position={[(side * width) / 2, height / 2, 0]}>
          <boxGeometry args={[post, height, post]} />
          <meshStandardMaterial color="#ffffff" roughness={0.6} />
        </mesh>
      ))}
      <mesh position={[0, height, 0]}>
        <boxGeometry args={[width + post, post, post]} />
        <meshStandardMaterial color="#ffffff" roughness={0.6} />
      </mesh>
      <mesh position={[0, height / 2, outward * 0.35]}>
        <planeGeometry args={[width, height]} />
        <meshStandardMaterial
          color="#ffffff"
          transparent
          opacity={0.16}
          side={THREE.DoubleSide}
        />
      </mesh>
    </group>
  );
};

// ---------------------------------------------------------------------------

// Keeps its mesh facing the camera around the Y axis only, so tokens stand
// upright on the grass instead of tipping over as the camera rises. Runs inside
// useFrame, so with frameloop="demand" it only recomputes on frames that are
// actually being drawn.
const Billboard = ({ y, children }: { y: number; children: ReactNode }) => {
  const ref = useRef<THREE.Mesh>(null);
  const world = useMemo(() => new THREE.Vector3(), []);

  useFrame(({ camera }) => {
    const mesh = ref.current;
    if (!mesh) return;
    mesh.getWorldPosition(world);
    mesh.rotation.y = Math.atan2(
      camera.position.x - world.x,
      camera.position.z - world.z,
    );
  });

  return (
    <mesh ref={ref} position={[0, y, 0]}>
      {children}
    </mesh>
  );
};

// A player: a billboarded plane carrying the pre-rendered token texture, with a
// soft shadow blob on the grass beneath it.
const Token = ({
  slot,
  player,
  shadow,
}: {
  slot: LineupSlotModel;
  player?: PlayerModel;
  shadow: THREE.Texture;
}) => {
  const [texture, setTexture] = useState<THREE.CanvasTexture | null>(null);
  const invalidate = useThree((s) => s.invalidate);
  const [x, z] = slotToWorld(slot.x, slot.y);

  useEffect(() => {
    let alive = true;
    let made: THREE.CanvasTexture | null = null;
    createTokenTexture(player, !!slot.isCaptain).then((t) => {
      if (!alive) {
        t.dispose();
        return;
      }
      made = t;
      setTexture(t);
      // frameloop is "demand": nothing repaints unless we ask it to.
      invalidate();
    });
    return () => {
      alive = false;
      made?.dispose();
    };
  }, [player, slot.isCaptain, invalidate]);

  if (!texture) return null;

  return (
    <group position={[x, 0, z]}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.012, 0.06]}>
        <planeGeometry args={[0.62, 0.42]} />
        <meshBasicMaterial map={shadow} transparent depthWrite={false} />
      </mesh>
      <Billboard y={TOKEN_HEIGHT / 2}>
        <planeGeometry args={[TOKEN_HEIGHT * TOKEN_ASPECT, TOKEN_HEIGHT]} />
        {/* alphaTest rather than pure transparency: it keeps depth writes on, so
            tokens sort correctly against each other without manual ordering. */}
        <meshBasicMaterial map={texture} transparent alphaTest={0.4} />
      </Billboard>
    </group>
  );
};

// ---------------------------------------------------------------------------

export type LineupSceneProps = {
  slots: LineupSlotModel[];
  playersById: Map<string, PlayerModel>;
};

const Scene = ({ slots, playersById }: LineupSceneProps) => {
  const shadow = useMemo(() => createShadowTexture(), []);
  useEffect(() => () => shadow.dispose(), [shadow]);

  return (
    <>
      <color attach="background" args={["#07130d"]} />
      <fog attach="fog" args={["#07130d", 15, 32]} />

      <ambientLight intensity={1.15} />
      <directionalLight position={[4, 10, 6]} intensity={1.1} />

      <Pitch />
      {slots.map((slot, i) => (
        <Token
          key={`${slot.playerId}-${i}`}
          slot={slot}
          player={playersById.get(slot.playerId)}
          shadow={shadow}
        />
      ))}

      <FitCamera />
      <OrbitControls
        makeDefault
        enablePan={false}
        minDistance={5}
        maxDistance={26}
        // Never let the camera drop under the pitch.
        maxPolarAngle={Math.PI / 2 - 0.08}
        minPolarAngle={0.15}
        target={TARGET}
      />
    </>
  );
};

// The scene, mounted into a WebGL canvas. `frameloop="demand"` means it renders
// only when something asks it to (a drag, a texture arriving) instead of 60
// times a second forever — which matters a lot on a phone battery.
export const LineupScene = ({ slots, playersById }: LineupSceneProps) => (
  <Canvas
    frameloop="demand"
    dpr={[1, 2]}
    camera={{ position: [0, 6.4, 9.2], fov: 46 }}
  >
    <Scene slots={slots} playersById={playersById} />
  </Canvas>
);

export default LineupScene;
