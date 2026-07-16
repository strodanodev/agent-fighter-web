"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { Float, Line } from "@react-three/drei";
import {
  useEffect,
  useMemo,
  useRef,
  type ReactNode,
} from "react";
import * as THREE from "three";
import { useDocumentVisible, useInView, usePerfProfile } from "@/lib/perf";

const ARENA: [number, number, number] = [3.2, 2.1, 3.2];

/** Left / right fighter home positions — clear 1v1 lanes. */
const P1: [number, number, number] = [-0.95, 0.05, 0.15];
const P2: [number, number, number] = [0.95, 0.05, -0.15];

function GlassArena({ children }: { children?: ReactNode }) {
  const group = useRef<THREE.Group>(null);
  const boxGeo = useMemo(() => new THREE.BoxGeometry(...ARENA), []);
  const edgesGeo = useMemo(() => new THREE.EdgesGeometry(boxGeo), [boxGeo]);

  const floorRing = useMemo(() => {
    const [w, , d] = ARENA;
    const hw = w / 2 - 0.05;
    const hd = d / 2 - 0.05;
    return [
      new THREE.Vector3(-hw, -ARENA[1] / 2, -hd),
      new THREE.Vector3(hw, -ARENA[1] / 2, -hd),
      new THREE.Vector3(hw, -ARENA[1] / 2, hd),
      new THREE.Vector3(-hw, -ARENA[1] / 2, hd),
      new THREE.Vector3(-hw, -ARENA[1] / 2, -hd),
    ];
  }, []);

  useFrame((state) => {
    if (!group.current) return;
    group.current.rotation.y = state.clock.elapsedTime * 0.1;
    group.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.18) * 0.06;
  });

  return (
    <group ref={group}>
      <mesh geometry={boxGeo}>
        <meshBasicMaterial
          color="#2f8fff"
          transparent
          opacity={0.04}
          depthWrite={false}
          side={THREE.DoubleSide}
        />
      </mesh>

      <lineSegments geometry={edgesGeo}>
        <lineBasicMaterial color="#ffffff" transparent opacity={0.75} />
      </lineSegments>
      <lineSegments geometry={edgesGeo} scale={[1.02, 1.02, 1.02]}>
        <lineBasicMaterial color="#2f8fff" transparent opacity={0.45} />
      </lineSegments>

      <Line
        points={floorRing}
        color="#6eb6ff"
        transparent
        opacity={0.35}
        lineWidth={1}
      />

      {children}
    </group>
  );
}

/** Low-poly fighter — stays in its lane with a tight idle bob. */
function Fighter({
  color,
  position,
  side,
  speed,
}: {
  color: string;
  position: [number, number, number];
  side: "left" | "right";
  speed: number;
}) {
  const ref = useRef<THREE.Group>(null);
  const body = useMemo(() => new THREE.IcosahedronGeometry(0.32, 0), []);
  const edges = useMemo(() => new THREE.EdgesGeometry(body), [body]);
  const stance = useMemo(() => new THREE.TetrahedronGeometry(0.14, 0), []);
  const stanceEdges = useMemo(() => new THREE.EdgesGeometry(stance), [stance]);
  const face = side === "left" ? 1 : -1;

  useEffect(
    () => () => {
      body.dispose();
      edges.dispose();
      stance.dispose();
      stanceEdges.dispose();
    },
    [body, edges, stance, stanceEdges],
  );

  useFrame((state) => {
    if (!ref.current) return;
    const t = state.clock.elapsedTime * speed;
    // Tight lane bob — fighters face each other, not orbit the box
    ref.current.position.x = position[0] + Math.sin(t) * 0.08 * face;
    ref.current.position.y = position[1] + Math.sin(t * 1.6) * 0.12;
    ref.current.position.z = position[2] + Math.cos(t * 0.9) * 0.06;
    ref.current.rotation.y = face * 0.35 + Math.sin(t * 0.7) * 0.12;
    ref.current.rotation.x = t * 0.55;
  });

  return (
    <Float speed={1.6} rotationIntensity={0.15} floatIntensity={0.2}>
      <group ref={ref} position={position}>
        <mesh geometry={body}>
          <meshStandardMaterial
            color={color}
            emissive={color}
            emissiveIntensity={0.7}
            metalness={0.55}
            roughness={0.35}
            transparent
            opacity={0.88}
            depthWrite={false}
          />
        </mesh>
        <lineSegments geometry={edges}>
          <lineBasicMaterial color="#ffffff" transparent opacity={0.45} />
        </lineSegments>
        <group position={[0.18 * face, -0.05, 0.12]} rotation={[0.4, 0, 0.5 * face]}>
          <mesh geometry={stance}>
            <meshBasicMaterial
              color={color}
              transparent
              opacity={0.35}
              depthWrite={false}
            />
          </mesh>
          <lineSegments geometry={stanceEdges}>
            <lineBasicMaterial color="#ffffff" transparent opacity={0.5} />
          </lineSegments>
        </group>
      </group>
    </Float>
  );
}

/** VS ring on the arena floor — marks the duel circle. */
function VsRing() {
  const ring = useMemo(() => new THREE.RingGeometry(0.72, 0.82, 48), []);
  const inner = useMemo(() => new THREE.RingGeometry(0.28, 0.32, 32), []);
  const spin = useRef<THREE.Group>(null);

  useEffect(
    () => () => {
      ring.dispose();
      inner.dispose();
    },
    [ring, inner],
  );

  useFrame((state) => {
    if (!spin.current) return;
    spin.current.rotation.z = state.clock.elapsedTime * 0.35;
  });

  return (
    <group position={[0, -ARENA[1] / 2 + 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
      <mesh geometry={ring}>
        <meshBasicMaterial
          color="#2f8fff"
          transparent
          opacity={0.35}
          side={THREE.DoubleSide}
          depthWrite={false}
        />
      </mesh>
      <group ref={spin}>
        <mesh geometry={inner}>
          <meshBasicMaterial
            color="#ffffff"
            transparent
            opacity={0.4}
            side={THREE.DoubleSide}
            depthWrite={false}
          />
        </mesh>
      </group>
    </group>
  );
}

/** Pulsing combat beam between the two fighters. */
function DuelBeam() {
  const scratch = useMemo(
    () => ({
      a: new THREE.Vector3(),
      b: new THREE.Vector3(),
      mid: new THREE.Vector3(),
      bump: new THREE.Vector3(),
    }),
    [],
  );

  const { core, glow, spark } = useMemo(() => {
    const make = (color: string, opacity: number) => {
      const geo = new THREE.BufferGeometry();
      geo.setAttribute(
        "position",
        new THREE.BufferAttribute(new Float32Array(9), 3),
      );
      const mat = new THREE.LineBasicMaterial({
        color,
        transparent: true,
        opacity,
        depthWrite: false,
      });
      return new THREE.Line(geo, mat);
    };
    return {
      core: make("#6eb6ff", 0.65),
      glow: make("#ffffff", 0.22),
      spark: make("#2f8fff", 0.4),
    };
  }, []);

  const impact = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    const { a, b, mid, bump } = scratch;

    // Match Fighter idle motion so the beam stays locked on
    a.set(
      P1[0] + Math.sin(t * 1.1) * 0.08,
      P1[1] + Math.sin(t * 1.1 * 1.6) * 0.12,
      P1[2] + Math.cos(t * 1.1 * 0.9) * 0.06,
    );
    b.set(
      P2[0] - Math.sin(t * 0.95) * 0.08,
      P2[1] + Math.sin(t * 0.95 * 1.6) * 0.12,
      P2[2] + Math.cos(t * 0.95 * 0.9) * 0.06,
    );

    const clash = 0.5 + Math.sin(t * 2.2) * 0.08;
    bump.set(
      Math.sin(t * 4.5) * 0.1,
      0.28 + Math.sin(t * 3.1) * 0.1,
      Math.cos(t * 3.8) * 0.1,
    );
    mid.copy(a).lerp(b, clash).add(bump);

    for (const line of [core, glow, spark]) {
      const attr = line.geometry.attributes.position as THREE.BufferAttribute;
      const arr = attr.array as Float32Array;
      arr[0] = a.x;
      arr[1] = a.y;
      arr[2] = a.z;
      arr[3] = mid.x;
      arr[4] = mid.y;
      arr[5] = mid.z;
      arr[6] = b.x;
      arr[7] = b.y;
      arr[8] = b.z;
      attr.needsUpdate = true;
    }

    const pulse = 0.45 + Math.sin(t * 7) * 0.25;
    (core.material as THREE.LineBasicMaterial).opacity = pulse;
    (glow.material as THREE.LineBasicMaterial).opacity = pulse * 0.35;
    (spark.material as THREE.LineBasicMaterial).opacity =
      0.25 + Math.abs(Math.sin(t * 11)) * 0.35;

    if (impact.current) {
      impact.current.position.copy(mid);
      const s = 0.08 + Math.abs(Math.sin(t * 9)) * 0.12;
      impact.current.scale.setScalar(s);
      const mat = impact.current.material as THREE.MeshBasicMaterial;
      mat.opacity = 0.35 + Math.abs(Math.sin(t * 9)) * 0.45;
    }
  });

  return (
    <group>
      <primitive object={glow} />
      <primitive object={spark} />
      <primitive object={core} />
      <mesh ref={impact}>
        <sphereGeometry args={[1, 12, 12]} />
        <meshBasicMaterial
          color="#ffffff"
          transparent
          opacity={0.5}
          depthWrite={false}
        />
      </mesh>
    </group>
  );
}

function SceneLights() {
  return (
    <>
      <ambientLight intensity={0.45} />
      <pointLight position={[-2.5, 2.5, 2]} intensity={1.15} color="#ffffff" />
      <pointLight position={[2.5, 2.5, -2]} intensity={1.15} color="#2f8fff" />
      <pointLight position={[0, 0.5, 3]} intensity={0.4} color="#6eb6ff" />
    </>
  );
}

function ArenaRig() {
  return (
    <group position={[1.55, 0.05, 0]}>
      <SceneLights />
      <GlassArena>
        <VsRing />
      </GlassArena>
      <Fighter color="#ffffff" position={P1} side="left" speed={1.1} />
      <Fighter color="#2f8fff" position={P2} side="right" speed={0.95} />
      <DuelBeam />
    </group>
  );
}

export default function ArenaScene() {
  const host = useRef<HTMLDivElement>(null);
  const inView = useInView(host, { rootMargin: "100px", threshold: 0.05 });
  const docVisible = useDocumentVisible();
  const { dpr, mobile, reducedMotion } = usePerfProfile();
  const running = inView && docVisible;

  if (reducedMotion) {
    return (
      <div
        ref={host}
        className="absolute inset-0 bg-[radial-gradient(ellipse_at_60%_40%,rgba(47,143,255,0.18),transparent_55%)]"
        aria-hidden
      />
    );
  }

  return (
    <div ref={host} className="contain-paint absolute inset-0 bg-transparent">
      {running && (
        <Canvas
          camera={{ position: [5.6, 2.6, 6.4], fov: 38 }}
          dpr={dpr}
          frameloop="always"
          gl={{
            antialias: !mobile,
            alpha: true,
            premultipliedAlpha: false,
            powerPreference: mobile ? "low-power" : "high-performance",
            stencil: false,
          }}
          onCreated={({ gl, scene, camera }) => {
            gl.setClearColor(0x000000, 0);
            scene.background = null;
            scene.fog = null;
            camera.lookAt(1.55, 0.1, 0);
          }}
          style={{ background: "transparent" }}
        >
          <ArenaRig />
        </Canvas>
      )}
    </div>
  );
}
