"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { Float, Line } from "@react-three/drei";
import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import * as THREE from "three";
import {
  claimAccentSlot,
  releaseAccentSlot,
  useDocumentVisible,
  useInView,
  usePerfProfile,
} from "@/lib/perf";

export type SceneVariant =
  | "arena"
  | "fighters"
  | "loop"
  | "engine"
  | "boards"
  | "team"
  | "cta";

type AccentProps = {
  variant: SceneVariant;
  className?: string;
};

const BLUE = "#2f8fff";
const BLUE_SOFT = "#6eb6ff";
const WHITE = "#ffffff";
const GOLD = "#d9a441";

function Spin({
  children,
  axis = "y",
  speed = 0.4,
}: {
  children: ReactNode;
  axis?: "x" | "y" | "z";
  speed?: number;
}) {
  const ref = useRef<THREE.Group>(null);
  useFrame((_, dt) => {
    if (!ref.current) return;
    ref.current.rotation[axis] += dt * speed;
  });
  return <group ref={ref}>{children}</group>;
}

function WireShape({
  geometry,
  color,
  opacity = 0.55,
  scale = 1,
  position = [0, 0, 0] as [number, number, number],
}: {
  geometry: THREE.BufferGeometry;
  color: string;
  opacity?: number;
  scale?: number;
  position?: [number, number, number];
}) {
  const edges = useMemo(() => new THREE.EdgesGeometry(geometry), [geometry]);
  useEffect(() => () => edges.dispose(), [edges]);
  return (
    <group position={position} scale={scale}>
      <mesh geometry={geometry}>
        <meshBasicMaterial
          color={color}
          transparent
          opacity={opacity * 0.12}
          depthWrite={false}
          side={THREE.DoubleSide}
        />
      </mesh>
      <lineSegments geometry={edges}>
        <lineBasicMaterial color={color} transparent opacity={opacity} />
      </lineSegments>
    </group>
  );
}

/** Floating hit-sparks + combat rings around the live client. */
function ArenaDecor() {
  const ring = useMemo(() => new THREE.TorusGeometry(1.1, 0.03, 8, 48), []);
  const oct = useMemo(() => new THREE.OctahedronGeometry(0.22, 0), []);
  const box = useMemo(() => new THREE.BoxGeometry(0.28, 0.28, 0.28), []);
  const sparks = useMemo(
    () =>
      Array.from({ length: 10 }, (_, i) => ({
        pos: [
          Math.sin(i * 1.7) * 1.6,
          Math.cos(i * 0.9) * 0.9,
          Math.sin(i * 2.1) * 1.1,
        ] as [number, number, number],
        color: i % 3 === 0 ? WHITE : i % 3 === 1 ? BLUE : BLUE_SOFT,
        speed: 0.5 + (i % 4) * 0.2,
        kind: i % 2 === 0 ? "oct" : "box",
      })),
    [],
  );

  useEffect(
    () => () => {
      ring.dispose();
      oct.dispose();
      box.dispose();
    },
    [ring, oct, box],
  );

  return (
    <group>
      <Spin speed={0.35}>
        <WireShape geometry={ring} color={BLUE} opacity={0.7} />
      </Spin>
      <Spin axis="x" speed={-0.25}>
        <WireShape
          geometry={ring}
          color={WHITE}
          opacity={0.35}
          scale={0.72}
          position={[0, 0.1, 0]}
        />
      </Spin>
      {sparks.map((s, i) => (
        <Float key={i} speed={s.speed} floatIntensity={0.6} rotationIntensity={0.8}>
          <WireShape
            geometry={s.kind === "oct" ? oct : box}
            color={s.color}
            position={s.pos}
            opacity={0.65}
            scale={0.7 + (i % 3) * 0.15}
          />
        </Float>
      ))}
    </group>
  );
}

/** Low-poly fighter silhouettes — stacked crystals facing off. */
function FightersDecor() {
  const tetra = useMemo(() => new THREE.TetrahedronGeometry(0.45, 0), []);
  const ico = useMemo(() => new THREE.IcosahedronGeometry(0.32, 0), []);
  const cyl = useMemo(() => new THREE.CylinderGeometry(0.08, 0.18, 0.7, 5), []);

  useEffect(
    () => () => {
      tetra.dispose();
      ico.dispose();
      cyl.dispose();
    },
    [tetra, ico, cyl],
  );

  return (
    <group>
      <Float speed={1.2} floatIntensity={0.4}>
        <group position={[-1.1, 0.1, 0]}>
          <WireShape geometry={tetra} color={WHITE} opacity={0.75} />
          <WireShape
            geometry={cyl}
            color={BLUE_SOFT}
            opacity={0.45}
            position={[0, -0.55, 0]}
          />
        </group>
      </Float>
      <Float speed={1.4} floatIntensity={0.45}>
        <group position={[1.15, -0.05, 0.2]}>
          <WireShape geometry={ico} color={BLUE} opacity={0.8} />
          <WireShape
            geometry={cyl}
            color={WHITE}
            opacity={0.4}
            position={[0, -0.55, 0]}
            scale={0.9}
          />
        </group>
      </Float>
      <Spin speed={0.15}>
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <ringGeometry args={[1.6, 1.68, 48]} />
          <meshBasicMaterial
            color={BLUE}
            transparent
            opacity={0.25}
            side={THREE.DoubleSide}
            depthWrite={false}
          />
        </mesh>
      </Spin>
    </group>
  );
}

/** Additive glow blob — bloom without a postprocessing pass. */
function GlowOrb({
  color,
  scale = 1,
  opacity = 0.35,
  position = [0, 0, 0] as [number, number, number],
}: {
  color: string;
  scale?: number;
  opacity?: number;
  position?: [number, number, number];
}) {
  return (
    <mesh position={position} scale={scale}>
      <sphereGeometry args={[1, 16, 16]} />
      <meshBasicMaterial
        color={color}
        transparent
        opacity={opacity}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </mesh>
  );
}

/** Hard-edge hex rim for that on-chain token silhouette. */
function HexRing({
  radius,
  color,
  opacity = 0.85,
  rotation = [Math.PI / 2, 0, 0] as [number, number, number],
}: {
  radius: number;
  color: string;
  opacity?: number;
  rotation?: [number, number, number];
}) {
  const geo = useMemo(() => new THREE.RingGeometry(radius * 0.92, radius, 6), [radius]);
  useEffect(() => () => geo.dispose(), [geo]);
  return (
    <mesh rotation={rotation} geometry={geo}>
      <meshBasicMaterial
        color={color}
        transparent
        opacity={opacity}
        side={THREE.DoubleSide}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </mesh>
  );
}

/**
 * Aggressive geometric $TOKEN for the play loop — thick coin, hex cages,
 * orbiting shards, additive neon bloom. Crypto IYKYK energy.
 */
function LoopDecor() {
  const coin = useMemo(() => new THREE.CylinderGeometry(0.72, 0.72, 0.14, 48), []);
  const coinRim = useMemo(() => new THREE.TorusGeometry(0.74, 0.045, 10, 48), []);
  const hex = useMemo(() => new THREE.CylinderGeometry(0.95, 0.95, 0.04, 6), []);
  const shard = useMemo(() => new THREE.OctahedronGeometry(0.16, 0), []);
  const diamond = useMemo(() => new THREE.OctahedronGeometry(0.28, 0), []);
  // Face stamps lie on the cylinder top (Y+) — thin in Y, drawn in XZ.
  const markBar = useMemo(() => new THREE.BoxGeometry(0.1, 0.05, 0.42), []);
  const markCross = useMemo(() => new THREE.BoxGeometry(0.34, 0.05, 0.09), []);
  const ringA = useMemo(() => new THREE.TorusGeometry(1.05, 0.025, 8, 64), []);
  const ringB = useMemo(() => new THREE.TorusGeometry(1.2, 0.018, 8, 64), []);
  const pulse = useRef<THREE.Group>(null);
  const orbit = useRef<THREE.Group>(null);

  const shards = useMemo(
    () =>
      Array.from({ length: 8 }, (_, i) => {
        const a = (i / 8) * Math.PI * 2;
        const r = 1.28 + (i % 3) * 0.1;
        return {
          pos: [Math.cos(a) * r, Math.sin(a * 1.5) * 0.35, Math.sin(a) * r] as [
            number,
            number,
            number,
          ],
          color: i % 3 === 0 ? GOLD : i % 3 === 1 ? WHITE : BLUE_SOFT,
          scale: 0.65 + (i % 3) * 0.2,
        };
      }),
    [],
  );

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (pulse.current) {
      const s = 1 + Math.sin(t * 2.4) * 0.12;
      pulse.current.scale.setScalar(s);
    }
    if (orbit.current) {
      orbit.current.rotation.y = t * 0.55;
      orbit.current.rotation.x = Math.sin(t * 0.4) * 0.15;
    }
  });

  useEffect(
    () => () => {
      coin.dispose();
      coinRim.dispose();
      hex.dispose();
      shard.dispose();
      diamond.dispose();
      markBar.dispose();
      markCross.dispose();
      ringA.dispose();
      ringB.dispose();
    },
    [coin, coinRim, hex, shard, diamond, markBar, markCross, ringA, ringB],
  );

  return (
    <group scale={0.92}>
      {/* Atmospheric bloom stack */}
      <group ref={pulse}>
        <GlowOrb color={BLUE} scale={1.85} opacity={0.28} />
        <GlowOrb color={GOLD} scale={1.15} opacity={0.22} />
        <GlowOrb color={WHITE} scale={0.55} opacity={0.32} />
      </group>

      {/* Outer hex cages */}
      <Spin speed={0.35}>
        <HexRing radius={1.35} color={BLUE} opacity={0.7} />
        <HexRing radius={1.55} color={WHITE} opacity={0.25} />
      </Spin>
      <Spin speed={-0.55} axis="z">
        <group rotation={[Math.PI / 2.4, 0.2, 0]}>
          <HexRing radius={1.15} color={GOLD} opacity={0.55} />
        </group>
      </Spin>

      {/* Main token — thick disc + rim + face mark */}
      <Float speed={1.4} floatIntensity={0.35} rotationIntensity={0.25}>
        <Spin axis="y" speed={0.85}>
          <group rotation={[Math.PI / 2.15, 0, 0.15]}>
            <WireShape geometry={coin} color={GOLD} opacity={0.9} />
            <mesh geometry={coin}>
              <meshBasicMaterial
                color="#1a1204"
                transparent
                opacity={0.55}
                depthWrite={false}
              />
            </mesh>
            <mesh geometry={coinRim} rotation={[Math.PI / 2, 0, 0]}>
              <meshBasicMaterial
                color={GOLD}
                transparent
                opacity={0.95}
                blending={THREE.AdditiveBlending}
                depthWrite={false}
              />
            </mesh>
            {/* Face stamp — stylized "$" on the coin face */}
            <group position={[0, 0.1, 0]}>
              <mesh geometry={markBar}>
                <meshBasicMaterial
                  color={WHITE}
                  transparent
                  opacity={0.95}
                  blending={THREE.AdditiveBlending}
                  depthWrite={false}
                />
              </mesh>
              <mesh geometry={markCross} position={[0, 0, 0.12]}>
                <meshBasicMaterial color={GOLD} />
              </mesh>
              <mesh geometry={markCross} position={[0, 0, -0.12]}>
                <meshBasicMaterial color={GOLD} />
              </mesh>
            </group>
            <WireShape
              geometry={hex}
              color={BLUE_SOFT}
              opacity={0.65}
              scale={0.78}
              position={[0, -0.02, 0]}
            />
          </group>
        </Spin>

        {/* Core crystal punch-through */}
        <Float speed={2.2} floatIntensity={0.2} rotationIntensity={1.2}>
          <WireShape
            geometry={diamond}
            color={WHITE}
            opacity={0.95}
            position={[0, 0, 0.55]}
            scale={0.7}
          />
        </Float>
      </Float>

      {/* Energy toroids */}
      <Spin speed={0.7}>
        <mesh geometry={ringA} rotation={[Math.PI / 2, 0, 0]}>
          <meshBasicMaterial
            color={BLUE}
            transparent
            opacity={0.85}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
          />
        </mesh>
      </Spin>
      <Spin axis="x" speed={-0.9}>
        <mesh geometry={ringB}>
          <meshBasicMaterial
            color={GOLD}
            transparent
            opacity={0.55}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
          />
        </mesh>
      </Spin>

      {/* Orbiting shards */}
      <group ref={orbit}>
        {shards.map((s, i) => (
          <Float key={i} speed={1.2 + i * 0.1} floatIntensity={0.4} rotationIntensity={0.9}>
            <WireShape
              geometry={shard}
              color={s.color}
              position={s.pos}
              opacity={0.85}
              scale={s.scale}
            />
          </Float>
        ))}
      </group>
    </group>
  );
}

/** Engine core — torus knot + orbiting data cubes. */
function EngineDecor() {
  const knot = useMemo(() => new THREE.TorusKnotGeometry(0.55, 0.12, 96, 12), []);
  const cube = useMemo(() => new THREE.BoxGeometry(0.18, 0.18, 0.18), []);
  const satellites = useMemo(
    () =>
      Array.from({ length: 8 }, (_, i) => {
        const a = (i / 8) * Math.PI * 2;
        return {
          pos: [Math.cos(a) * 1.35, Math.sin(a * 2) * 0.35, Math.sin(a) * 1.35] as [
            number,
            number,
            number,
          ],
          color: i % 2 === 0 ? BLUE : WHITE,
        };
      }),
    [],
  );

  useEffect(
    () => () => {
      knot.dispose();
      cube.dispose();
    },
    [knot, cube],
  );

  return (
    <group>
      <Spin speed={0.55}>
        <WireShape geometry={knot} color={BLUE_SOFT} opacity={0.75} />
      </Spin>
      <Spin speed={-0.3}>
        {satellites.map((s, i) => (
          <WireShape
            key={i}
            geometry={cube}
            color={s.color}
            position={s.pos}
            opacity={0.6}
            scale={0.8 + (i % 3) * 0.1}
          />
        ))}
      </Spin>
    </group>
  );
}

/** Ascending podium bars + trophy diamond for boards. */
function BoardsDecor() {
  const barGeo = useMemo(() => new THREE.BoxGeometry(0.35, 1, 0.35), []);
  const diamond = useMemo(() => new THREE.OctahedronGeometry(0.4, 0), []);
  const heights = [0.7, 1.15, 0.9];

  useEffect(
    () => () => {
      barGeo.dispose();
      diamond.dispose();
    },
    [barGeo, diamond],
  );

  return (
    <group>
      {heights.map((h, i) => (
        <Float key={i} speed={0.8 + i * 0.15} floatIntensity={0.2}>
          <group position={[(i - 1) * 0.7, (h - 1) * 0.5, 0]} scale={[1, h, 1]}>
            <WireShape
              geometry={barGeo}
              color={i === 1 ? GOLD : BLUE}
              opacity={0.65}
            />
          </group>
        </Float>
      ))}
      <Float speed={1.5} floatIntensity={0.5} rotationIntensity={0.6}>
        <WireShape
          geometry={diamond}
          color={WHITE}
          position={[0, 1.35, 0]}
          opacity={0.85}
        />
      </Float>
    </group>
  );
}

/** Constellation of linked team nodes. */
function TeamDecor() {
  const sphere = useMemo(() => new THREE.SphereGeometry(0.12, 12, 12), []);
  const nodes = useMemo(
    () => [
      new THREE.Vector3(-1.2, 0.4, 0.2),
      new THREE.Vector3(0.1, 0.9, -0.4),
      new THREE.Vector3(1.1, 0.2, 0.5),
      new THREE.Vector3(-0.3, -0.6, 0.6),
      new THREE.Vector3(0.7, -0.5, -0.5),
      new THREE.Vector3(-0.9, -0.2, -0.7),
    ],
    [],
  );
  const links = useMemo(() => {
    const pairs: [THREE.Vector3, THREE.Vector3][] = [];
    for (let i = 0; i < nodes.length; i++) {
      pairs.push([nodes[i], nodes[(i + 1) % nodes.length]]);
      if (i % 2 === 0) pairs.push([nodes[i], nodes[(i + 2) % nodes.length]]);
    }
    return pairs;
  }, [nodes]);

  useEffect(() => () => sphere.dispose(), [sphere]);

  return (
    <group>
      {nodes.map((p, i) => (
        <Float key={i} speed={1 + i * 0.1} floatIntensity={0.25}>
          <mesh position={p} geometry={sphere}>
            <meshBasicMaterial
              color={i % 2 === 0 ? BLUE : WHITE}
              transparent
              opacity={0.8}
            />
          </mesh>
        </Float>
      ))}
      {links.map((pair, i) => (
        <Line
          key={i}
          points={pair}
          color={BLUE}
          transparent
          opacity={0.28}
          lineWidth={1}
        />
      ))}
    </group>
  );
}

/** Portal ring + insert-coin cylinder for CTA. */
function CtaDecor() {
  const ring = useMemo(() => new THREE.TorusGeometry(1.2, 0.05, 10, 64), []);
  const coin = useMemo(() => new THREE.CylinderGeometry(0.4, 0.4, 0.06, 28), []);
  const pulse = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (!pulse.current) return;
    const s = 1 + Math.sin(state.clock.elapsedTime * 2.2) * 0.08;
    pulse.current.scale.setScalar(s);
  });

  useEffect(
    () => () => {
      ring.dispose();
      coin.dispose();
    },
    [ring, coin],
  );

  return (
    <group>
      <group ref={pulse}>
        <Spin speed={0.4}>
          <WireShape geometry={ring} color={BLUE} opacity={0.8} />
        </Spin>
        <Spin axis="x" speed={0.55}>
          <WireShape
            geometry={ring}
            color={WHITE}
            opacity={0.35}
            scale={0.78}
          />
        </Spin>
      </group>
      <Float speed={2} floatIntensity={0.5} rotationIntensity={1}>
        <Spin axis="z" speed={1.2}>
          <WireShape geometry={coin} color={GOLD} opacity={0.85} />
        </Spin>
      </Float>
    </group>
  );
}

function VariantRig({ variant }: { variant: SceneVariant }) {
  switch (variant) {
    case "arena":
      return <ArenaDecor />;
    case "fighters":
      return <FightersDecor />;
    case "loop":
      return <LoopDecor />;
    case "engine":
      return <EngineDecor />;
    case "boards":
      return <BoardsDecor />;
    case "team":
      return <TeamDecor />;
    case "cta":
      return <CtaDecor />;
  }
}

const CAMERA: Record<SceneVariant, [number, number, number]> = {
  arena: [0, 0.4, 4.2],
  fighters: [0, 0.2, 4.0],
  loop: [0, 0.15, 3.4],
  engine: [0, 0.2, 4.0],
  boards: [0, 0.6, 4.2],
  team: [0, 0.2, 4.0],
  cta: [0, 0.1, 3.6],
};

export default function SceneAccent({ variant, className = "" }: AccentProps) {
  const host = useRef<HTMLDivElement>(null);
  const slotId = useMemo(() => Symbol(variant), [variant]);
  const inView = useInView(host, { rootMargin: "60px", threshold: 0.12 });
  const docVisible = useDocumentVisible();
  const { skipAccents, mobile, dpr } = usePerfProfile();
  const [active, setActive] = useState(false);
  const cam = CAMERA[variant];
  const visible = inView && docVisible;

  useEffect(() => {
    if (!visible || skipAccents || mobile) {
      releaseAccentSlot(slotId);
      setActive(false);
      return;
    }

    const tryClaim = () => {
      if (claimAccentSlot(slotId)) {
        setActive(true);
        return true;
      }
      setActive(false);
      return false;
    };

    if (tryClaim()) {
      return () => {
        releaseAccentSlot(slotId);
        setActive(false);
      };
    }

    const timer = window.setInterval(() => {
      if (tryClaim()) window.clearInterval(timer);
    }, 350);

    return () => {
      window.clearInterval(timer);
      releaseAccentSlot(slotId);
      setActive(false);
    };
  }, [visible, skipAccents, mobile, slotId]);

  return (
    <div
      ref={host}
      className={`contain-paint pointer-events-none absolute inset-0 overflow-hidden ${className}`}
      aria-hidden
    >
      {active && (
        <Canvas
          camera={{ position: cam, fov: 42 }}
          dpr={dpr}
          frameloop="always"
          gl={{
            antialias: false,
            alpha: true,
            premultipliedAlpha: false,
            powerPreference: "low-power",
            stencil: false,
            depth: true,
          }}
          onCreated={({ gl, scene }) => {
            gl.setClearColor(0x000000, 0);
            scene.background = null;
          }}
          style={{ background: "transparent" }}
        >
          <ambientLight intensity={variant === "loop" ? 0.7 : 0.55} />
          <pointLight position={[3, 4, 2]} intensity={0.8} color="#ffffff" />
          {variant === "loop" && (
            <>
              <pointLight position={[-2, 1.5, 2]} intensity={1.4} color="#2f8fff" />
              <pointLight position={[1.5, -0.5, 1.5]} intensity={1.1} color="#d9a441" />
            </>
          )}
          <VariantRig variant={variant} />
        </Canvas>
      )}
    </div>
  );
}
