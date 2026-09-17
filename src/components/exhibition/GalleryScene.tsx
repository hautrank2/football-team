"use client";

import { OrbitControls } from "@react-three/drei";
import { Canvas, useThree } from "@react-three/fiber";
import { useEffect, useState } from "react";
import * as THREE from "three";
import { createPortraitTexture, FRAME_H, FRAME_W } from "./textures";
import type { PlayerModel } from "@/types";

const WALL_H = 4.8;
const HANG_Y = 2.35; // centre height of a hung frame
const SPACING = 3.1; // arc length between frames along the wall

// A rotunda sized to its collection: enough circumference that the frames never
// crowd each other, with a floor big enough to stand on.
const radiusFor = (count: number) =>
  Math.max(8, (count * SPACING) / (2 * Math.PI));

const TARGET: [number, number, number] = [0, 2.1, 0];

// The far wall is always at least a room-radius away, so how big a portrait
// looks is decided almost entirely by the lens. A phone held upright has a very
// narrow horizontal field: keep the wide-angle look there and you get three
// stamp-sized frames floating in a sea of ceiling. So portrait gets a longer
// lens and a camera nearer the middle, landscape keeps the roomy view.
const FitCamera = ({ radius }: { radius: number }) => {
  const camera = useThree((s) => s.camera) as THREE.PerspectiveCamera;
  const size = useThree((s) => s.size);
  const controls = useThree((s) => s.controls);
  const invalidate = useThree((s) => s.invalidate);

  useEffect(() => {
    const portrait = size.width < size.height;
    // A narrower lens does double duty: the portraits read bigger AND less of
    // the empty floor and ceiling ends up in shot.
    camera.fov = portrait ? 30 : 40;
    const distance = Math.min(portrait ? 3.2 : 5.0, radius - 2.2);

    camera.position.set(0, TARGET[1] + 0.15, distance);
    camera.lookAt(...TARGET);
    camera.updateProjectionMatrix();
    (controls as { update?: () => void } | null)?.update?.();
    invalidate();
  }, [camera, size.width, size.height, radius, controls, invalidate]);

  return null;
};

// ---------------------------------------------------------------------------

const Room = ({ radius }: { radius: number }) => (
  <group>
    {/* Floor — dark and faintly polished, so the frames throw a little light. */}
    <mesh rotation={[-Math.PI / 2, 0, 0]}>
      <circleGeometry args={[radius, 64]} />
      <meshStandardMaterial color="#0b0f17" roughness={0.35} metalness={0.35} />
    </mesh>

    {/* Wall — a cylinder seen from the inside. */}
    <mesh position={[0, WALL_H / 2, 0]}>
      <cylinderGeometry args={[radius, radius, WALL_H, 64, 1, true]} />
      <meshStandardMaterial
        color="#151b26"
        roughness={0.9}
        side={THREE.BackSide}
      />
    </mesh>

    {/* Ceiling */}
    <mesh position={[0, WALL_H, 0]} rotation={[Math.PI / 2, 0, 0]}>
      <circleGeometry args={[radius, 64]} />
      <meshStandardMaterial color="#080b12" roughness={1} />
    </mesh>

    {/* A skirting line where wall meets floor, to read the edge clearly. */}
    <mesh position={[0, 0.06, 0]}>
      <cylinderGeometry args={[radius - 0.02, radius - 0.02, 0.12, 64, 1, true]} />
      <meshBasicMaterial color="#2b3448" side={THREE.BackSide} />
    </mesh>
  </group>
);

// ---------------------------------------------------------------------------

type HangingProps = {
  player: PlayerModel;
  angle: number;
  radius: number;
  onOpen: (player: PlayerModel) => void;
  onHover: (player: PlayerModel | null) => void;
};

// One portrait on the wall: the framed texture, a wall-wash glow behind it, and
// a pool of light on the floor beneath. Unlit material on purpose — gallery
// pieces should read as lit whatever the room is doing.
const Hanging = ({ player, angle, radius, onOpen, onHover }: HangingProps) => {
  const [texture, setTexture] = useState<THREE.CanvasTexture | null>(null);
  const [hovered, setHovered] = useState(false);
  const invalidate = useThree((s) => s.invalidate);

  useEffect(() => {
    let alive = true;
    let made: THREE.CanvasTexture | null = null;
    createPortraitTexture(player).then((t) => {
      if (!alive) {
        t.dispose();
        return;
      }
      made = t;
      setTexture(t);
      invalidate();
    });
    return () => {
      alive = false;
      made?.dispose();
    };
  }, [player, invalidate]);

  useEffect(() => {
    document.body.style.cursor = hovered ? "pointer" : "";
    return () => {
      document.body.style.cursor = "";
    };
  }, [hovered]);

  // Just inside the wall, turned to face the middle of the room.
  const x = Math.sin(angle) * (radius - 0.06);
  const z = Math.cos(angle) * (radius - 0.06);

  if (!texture) return null;

  return (
    <group position={[x, 0, z]} rotation={[0, angle + Math.PI, 0]}>
      {/* Wall wash behind the frame */}
      <mesh position={[0, HANG_Y, 0.02]}>
        <planeGeometry args={[FRAME_W * 1.8, FRAME_H * 1.35]} />
        <meshBasicMaterial
          color={hovered ? "#7aa2ff" : "#33405c"}
          transparent
          opacity={hovered ? 0.3 : 0.16}
          depthWrite={false}
        />
      </mesh>

      {/* The picture */}
      <mesh
        position={[0, HANG_Y, 0.05]}
        scale={hovered ? 1.04 : 1}
        onPointerOver={(e) => {
          e.stopPropagation();
          setHovered(true);
          onHover(player);
          invalidate();
        }}
        onPointerOut={() => {
          setHovered(false);
          onHover(null);
          invalidate();
        }}
        onClick={(e) => {
          e.stopPropagation();
          onOpen(player);
        }}
      >
        <planeGeometry args={[FRAME_W, FRAME_H]} />
        <meshBasicMaterial map={texture} toneMapped={false} />
      </mesh>

      {/* Light pooling on the floor under the piece */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0.7]}>
        <planeGeometry args={[FRAME_W * 1.3, 1.6]} />
        <meshBasicMaterial
          color="#8fb0ff"
          transparent
          opacity={0.07}
          depthWrite={false}
        />
      </mesh>
    </group>
  );
};

// ---------------------------------------------------------------------------

// A plinth in the middle, so the camera always has something to orbit around
// and the room has a centre of gravity.
const Plinth = () => (
  <group>
    <mesh position={[0, 0.35, 0]}>
      <cylinderGeometry args={[1.05, 1.25, 0.7, 48]} />
      <meshStandardMaterial color="#1b2130" roughness={0.6} metalness={0.3} />
    </mesh>
    <mesh position={[0, 0.72, 0]}>
      <cylinderGeometry args={[1.1, 1.1, 0.05, 48]} />
      <meshStandardMaterial color="#c9a227" roughness={0.3} metalness={0.8} />
    </mesh>
  </group>
);

// ---------------------------------------------------------------------------

export type GallerySceneProps = {
  players: PlayerModel[];
  onOpen: (player: PlayerModel) => void;
  onHover: (player: PlayerModel | null) => void;
};

const Scene = ({ players, onOpen, onHover }: GallerySceneProps) => {
  const radius = radiusFor(players.length);

  return (
    <>
      <color attach="background" args={["#05070c"]} />
      <fog attach="fog" args={["#05070c", 12, 34]} />

      <ambientLight intensity={0.55} />
      <pointLight position={[0, WALL_H - 0.6, 0]} intensity={26} distance={30} color="#9fc4ff" />
      <pointLight position={[0, 1.6, 0]} intensity={10} distance={13} color="#ffd9a0" />

      <Room radius={radius} />
      <Plinth />

      {players.map((player, i) => (
        <Hanging
          key={player.id}
          player={player}
          angle={(i / players.length) * Math.PI * 2}
          radius={radius}
          onOpen={onOpen}
          onHover={onHover}
        />
      ))}

      <FitCamera radius={radius} />
      <OrbitControls
        makeDefault
        enablePan={false}
        // Stay inside the room: never far enough out to clip through the wall.
        minDistance={2}
        maxDistance={radius - 2.2}
        // Eye level is roughly the middle of a hung frame; allow a little look
        // down at the floor but never far enough to end up under it.
        maxPolarAngle={Math.PI / 2 + 0.26}
        minPolarAngle={0.75}
        target={TARGET}
        rotateSpeed={-0.45}
      />
    </>
  );
};

export const GalleryScene = (props: GallerySceneProps) => (
  <Canvas
    frameloop="demand"
    dpr={[1, 2]}
    camera={{ position: [0, 2.25, 5.6], fov: 52 }}
  >
    <Scene {...props} />
  </Canvas>
);

export default GalleryScene;
