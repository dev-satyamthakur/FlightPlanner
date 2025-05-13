import React, { useRef, useState, useEffect, Suspense } from "react";
import {
  Canvas,
  useFrame,
  useLoader,
  useThree,
  extend,
} from "@react-three/fiber";
import { OrbitControls, Text, Stars, Html } from "@react-three/drei";
import * as THREE from "three";
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader";
import { MTLLoader } from "three/examples/jsm/loaders/MTLLoader";
import { Spin } from "antd";
import {
  LoadingOutlined,
  PauseOutlined,
  CaretRightOutlined,
} from "@ant-design/icons";

// Extend the THREE namespace to include custom loaders
extend({ OBJLoader, MTLLoader });

// Create a custom error boundary component
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return <div>Something went wrong. Please try refreshing the page.</div>;
    }
    return this.props.children;
  }
}

// Loading component
function LoadingScreen() {
  return (
    <Html center>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          background: "rgba(20, 20, 20, 0.95)",
          padding: "32px 48px",
          borderRadius: "18px",
          boxShadow: "0 4px 32px 0 rgba(0,0,0,0.4)",
        }}
      >
        <Spin
          indicator={
            <LoadingOutlined style={{ fontSize: 48, color: "#1890ff" }} spin />
          }
          style={{ marginBottom: 18 }}
        />
        <div
          style={{
            color: "#fff",
            fontWeight: 500,
            fontSize: 18,
            letterSpacing: 1,
          }}
        >
          Loading...
        </div>
      </div>
    </Html>
  );
}

function latLonToVector3(lat, lon, radius) {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lon + 180) * (Math.PI / 180);
  const x = -radius * Math.sin(phi) * Math.cos(theta);
  const y = radius * Math.cos(phi);
  const z = radius * Math.sin(phi) * Math.sin(theta);
  return new THREE.Vector3(x, y, z);
}

class GreatCircleCurve extends THREE.Curve {
  constructor(start, end, radius) {
    super();
    this.start = start.clone().normalize();
    this.end = end.clone().normalize();
    this.radius = radius;
  }

  getPoint(t) {
    if (this.start.equals(this.end)) {
      return this.start.clone().multiplyScalar(this.radius);
    }
    const axis = new THREE.Vector3()
      .crossVectors(this.start, this.end)
      .normalize();
    const angle = Math.acos(this.start.dot(this.end));
    const rotation = new THREE.Quaternion().setFromAxisAngle(axis, angle * t);
    const point = this.start.clone().applyQuaternion(rotation);
    return point.multiplyScalar(this.radius);
  }
}

function Atmosphere() {
  return (
    <>
      <mesh>
        <sphereGeometry args={[1.02, 64, 64]} />
        <meshLambertMaterial
          color="#0066CC"
          opacity={0.3}
          transparent
          side={THREE.BackSide}
        />
      </mesh>
      <mesh>
        <sphereGeometry args={[1.05, 64, 64]} />
        <meshLambertMaterial
          color="#00AAFF"
          opacity={0.15}
          transparent
          side={THREE.BackSide}
        />
      </mesh>
      <mesh>
        <sphereGeometry args={[1.1, 32, 32]} />
        <meshLambertMaterial
          color="#80C4FF"
          opacity={0.05}
          transparent
          side={THREE.BackSide}
        />
      </mesh>
    </>
  );
}

function CityLabel({ position, name, camera }) {
  const labelRef = useRef();

  useFrame(() => {
    if (labelRef.current) {
      labelRef.current.lookAt(camera.position);
      const forward = new THREE.Vector3()
        .subVectors(camera.position, labelRef.current.position)
        .normalize();
      const worldUp = new THREE.Vector3(0, 1, 0);
      const right = new THREE.Vector3()
        .crossVectors(worldUp, forward)
        .normalize();
      const up = new THREE.Vector3().crossVectors(forward, right).normalize();
      labelRef.current.up.copy(up);
    }
  });

  return (
    <group ref={labelRef} position={position.clone().multiplyScalar(1.02)}>
      <Text
        fontSize={0.03}
        color="white"
        anchorX="center"
        anchorY="middle"
        outlineColor="black"
        outlineWidth={0.002}
        renderOrder={2}
      >
        {name}
      </Text>
    </group>
  );
}

function Airplane() {
  // Load all textures first
  const bodyTexture = useLoader(
    THREE.TextureLoader,
    "/11803_Airplane_body_diff.jpg"
  );
  const tailTexture = useLoader(
    THREE.TextureLoader,
    "/11803_Airplane_tail_diff.jpg"
  );
  const wingLeftTexture = useLoader(
    THREE.TextureLoader,
    "/11803_Airplane_wing_big_L_diff.jpg"
  );
  const wingRightTexture = useLoader(
    THREE.TextureLoader,
    "/11803_Airplane_wing_big_R_diff.jpg"
  );
  const wingDetailLeftTexture = useLoader(
    THREE.TextureLoader,
    "/11803_Airplane_wing_details_L_diff.jpg"
  );
  const wingDetailRightTexture = useLoader(
    THREE.TextureLoader,
    "/11803_Airplane_wing_details_R_diff.jpg"
  );

  // Load materials and object
  const materials = useLoader(MTLLoader, "/11803_Airplane_v1_l1.mtl");
  const obj = useLoader(OBJLoader, "/11803_Airplane_v1_l1.obj", (loader) => {
    materials.preload();
    loader.setMaterials(materials);
  });

  useEffect(() => {
    if (obj) {
      obj.traverse((child) => {
        if (child.isMesh) {
          // Apply the correct texture based on the mesh name
          if (child.name.includes("body")) {
            child.material.map = bodyTexture;
          } else if (child.name.includes("tail")) {
            child.material.map = tailTexture;
          } else if (child.name.includes("wing_big_L")) {
            child.material.map = wingLeftTexture;
          } else if (child.name.includes("wing_big_R")) {
            child.material.map = wingRightTexture;
          } else if (child.name.includes("wing_details_L")) {
            child.material.map = wingDetailLeftTexture;
          } else if (child.name.includes("wing_details_R")) {
            child.material.map = wingDetailRightTexture;
          }

          // Enhance material properties
          child.material.metalness = 0.5;
          child.material.roughness = 0.3;
          child.material.emissive.set("#404040");
          child.material.emissiveIntensity = 0.3;
          child.material.color.set("#FFFFFF");
          child.material.needsUpdate = true;
        }
      });
    }
  }, [
    obj,
    bodyTexture,
    tailTexture,
    wingLeftTexture,
    wingRightTexture,
    wingDetailLeftTexture,
    wingDetailRightTexture,
  ]);

  return (
    <primitive
      object={obj}
      scale={[0.0000625, 0.0000625, 0.0000625]}
      rotation={[0, 0, 0]}
      position={[0, 0, 0]}
    />
  );
}

function Globe({
  pointA,
  pointB,
  departureTime,
  totalFlightTime,
  progress,
  onProgressChange,
}) {
  const globeRef = useRef();
  const cloudMeshRef = useRef();
  const planeRef = useRef();
  const pathGroupRef = useRef();
  const [curve, setCurve] = useState(null);
  const [flightPath, setFlightPath] = useState(null);
  const texture = useLoader(THREE.TextureLoader, "/earth.jpg");
  const cloudTexture = useLoader(THREE.TextureLoader, "/fair_clouds.jpg");
  const { camera } = useThree();
  const [airplaneLoaded, setAirplaneLoaded] = useState(false);

  useEffect(() => {
    if (pointA && pointB) {
      const radius = 1;
      const startVec = latLonToVector3(pointA.lat, pointA.lon, radius);
      const endVec = latLonToVector3(pointB.lat, pointB.lon, radius);
      const greatCircle = new GreatCircleCurve(startVec, endVec, radius);
      setCurve(greatCircle);

      const points = greatCircle.getPoints(150);
      const geometry = new THREE.BufferGeometry().setFromPoints(points);
      const tubeGeometry = new THREE.TubeGeometry(
        greatCircle,
        150,
        0.008,
        8,
        false
      );
      const material = new THREE.MeshStandardMaterial({
        color: "#FFD700",
        emissive: "#FF8C00",
        emissiveIntensity: 0.5,
        metalness: 0.7,
        roughness: 0.3,
      });
      const tube = new THREE.Mesh(tubeGeometry, material);
      setFlightPath(tube);
    } else {
      setCurve(null);
      setFlightPath(null);
    }
  }, [pointA, pointB]);

  // Preload airplane model and textures as soon as possible
  useEffect(() => {
    // Preload textures and models
    useLoader.preload(THREE.TextureLoader, "/11803_Airplane_body_diff.jpg");
    useLoader.preload(THREE.TextureLoader, "/11803_Airplane_tail_diff.jpg");
    useLoader.preload(
      THREE.TextureLoader,
      "/11803_Airplane_wing_big_L_diff.jpg"
    );
    useLoader.preload(
      THREE.TextureLoader,
      "/11803_Airplane_wing_big_R_diff.jpg"
    );
    useLoader.preload(
      THREE.TextureLoader,
      "/11803_Airplane_wing_details_L_diff.jpg"
    );
    useLoader.preload(
      THREE.TextureLoader,
      "/11803_Airplane_wing_details_R_diff.jpg"
    );
    // Preload MTL and OBJ
    useLoader.preload(MTLLoader, "/11803_Airplane_v1_l1.mtl");
    useLoader.preload(OBJLoader, "/11803_Airplane_v1_l1.obj");
  }, []);

  useFrame(({ clock }) => {
    if (globeRef.current) {
      globeRef.current.rotation.x = 23.4 * (Math.PI / 180);
      const rotationY = clock.getElapsedTime() * 0.1;
      globeRef.current.rotation.y = rotationY;

      if (cloudMeshRef.current) {
        cloudMeshRef.current.rotation.y += 0.0002;
        cloudMeshRef.current.rotation.x += 0.00005;
      }

      if (pathGroupRef.current) {
        pathGroupRef.current.rotation.x = 23.4 * (Math.PI / 180);
        pathGroupRef.current.rotation.y = rotationY;
      }
    }

    // Update plane position based on progress prop
    if (curve && planeRef.current && progress !== undefined) {
      // Get current position and look-ahead position using the progress value
      const t = Math.max(0, Math.min(1, progress)); // Clamp between 0 and 1
      const position = curve.getPoint(t);
      const nextT = Math.min(t + 0.01, 1);
      const nextPosition = curve.getPoint(nextT);

      // Position the plane slightly above the path
      planeRef.current.position.copy(position).multiplyScalar(1.02);

      // Calculate the tangent (direction of movement)
      const tangent = nextPosition.clone().sub(position).normalize();

      // Calculate the normal (pointing outward from globe)
      const normal = position.clone().normalize();

      // Calculate the binormal (perpendicular to both tangent and normal)
      const binormal = new THREE.Vector3()
        .crossVectors(normal, tangent)
        .normalize();

      // Create rotation matrix
      const rotationMatrix = new THREE.Matrix4().makeBasis(
        tangent, // Forward direction (nose)
        binormal, // Right direction (right wing)
        normal // Up direction (top of plane)
      );

      // Apply the rotation
      planeRef.current.quaternion.setFromRotationMatrix(rotationMatrix);

      // Add banking effect during turns
      const bankAngle = Math.PI / 24;
      const turnRate = tangent.clone().cross(normal).length();
      planeRef.current.rotateOnAxis(
        tangent,
        -bankAngle * turnRate * Math.sin(t * Math.PI * 2) * 0.3
      );
    }
  });

  const cities = [];
  if (pointA)
    cities.push({ name: pointA.name, lat: pointA.lat, lon: pointA.lon });
  if (pointB)
    cities.push({ name: pointB.name, lat: pointB.lat, lon: pointB.lon });

  return (
    <>
      <group ref={globeRef}>
        <mesh>
          <sphereGeometry args={[1, 64, 64]} />
          <meshStandardMaterial map={texture} metalness={0.1} roughness={0.8} />
        </mesh>
        <mesh ref={cloudMeshRef}>
          <sphereGeometry args={[1.015, 64, 64]} />
          <meshStandardMaterial
            map={cloudTexture}
            alphaMap={cloudTexture}
            transparent={true}
            opacity={0.6}
            depthWrite={false}
          />
        </mesh>
        <Atmosphere />
      </group>

      <group ref={pathGroupRef}>
        {flightPath && <primitive object={flightPath} />}

        <group ref={planeRef} visible={!!curve}>
          <Suspense fallback={null}>
            <Airplane />
          </Suspense>
        </group>

        {cities.map((city) => {
          const position = latLonToVector3(city.lat, city.lon, 1.02);
          const labelPosition = position.clone().multiplyScalar(1.08);

          return (
            <group key={city.name}>
              <mesh position={position}>
                <sphereGeometry args={[0.015, 16, 16]} />
                <meshBasicMaterial color="#00FFFF" />
              </mesh>
              <CityLabel
                position={labelPosition}
                name={city.name}
                camera={camera}
              />
            </group>
          );
        })}
      </group>
    </>
  );
}

function SceneSetup() {
  const lightRef = useRef();

  useEffect(() => {
    if (lightRef.current) {
      lightRef.current.position.set(10, 6, 10);
      lightRef.current.lookAt(0, 0, 0);
    }
  }, []);

  return (
    <>
      <Stars
        radius={100}
        depth={50}
        count={7000}
        factor={5}
        saturation={0.2}
        fade
        speed={0.5}
      />
      <mesh position={[10, 6, 10]}>
        <sphereGeometry args={[0.5, 16, 16]} />
        <meshBasicMaterial color="#FFFFA0" />
      </mesh>
      <directionalLight
        ref={lightRef}
        color="#FFF9E0"
        intensity={2}
        castShadow
      />
      <ambientLight intensity={0.25} />
      <pointLight position={[-8, -5, -8]} color="#0066FF" intensity={0.2} />
    </>
  );
}

export default function GlobeApp({
  pointA,
  pointB,
  departureTime,
  totalFlightTime,
}) {
  const [progress, setProgress] = useState(0);
  const [isUserScrubbing, setIsUserScrubbing] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const animationRef = useRef();
  const lastTimestampRef = useRef();

  // Animation effect
  useEffect(() => {
    if (!pointA || !pointB || !totalFlightTime || totalFlightTime <= 0) return;
    if (isUserScrubbing || !isPlaying) return;

    // Calculate animation duration based on flight duration
    // Scale it so shorter flights take ~15 seconds, longer flights take ~20 seconds
    const MIN_ANIMATION_DURATION = 15; // seconds
    const MAX_ANIMATION_DURATION = 20; // seconds

    // Use a logarithmic scale to determine animation duration
    // Short flights (under 2 hours) -> closer to 15 seconds
    // Long flights (8+ hours) -> closer to 20 seconds
    const SHORT_FLIGHT = 120; // 2 hours in minutes
    const LONG_FLIGHT = 480; // 8 hours in minutes

    // Calculate animation duration within our desired range
    let animationDuration = MIN_ANIMATION_DURATION;
    if (totalFlightTime > SHORT_FLIGHT) {
      // Scale logarithmically between MIN and MAX duration
      const scale = Math.log(totalFlightTime) / Math.log(LONG_FLIGHT);
      const scaledDuration =
        MIN_ANIMATION_DURATION +
        (MAX_ANIMATION_DURATION - MIN_ANIMATION_DURATION) * Math.min(1, scale);
      animationDuration = scaledDuration;
    }

    function animate(timestamp) {
      if (!lastTimestampRef.current) lastTimestampRef.current = timestamp;
      const elapsed = (timestamp - lastTimestampRef.current) / 1000; // seconds
      lastTimestampRef.current = timestamp;
      setProgress((prev) => {
        let next = prev + elapsed / animationDuration;
        if (next >= 1) {
          // Stop at the end instead of looping
          cancelAnimationFrame(animationRef.current);
          setIsPlaying(false);
          return 1;
        }
        return next;
      });
      animationRef.current = requestAnimationFrame(animate);
    }
    animationRef.current = requestAnimationFrame(animate);
    return () => {
      cancelAnimationFrame(animationRef.current);
      lastTimestampRef.current = null;
    };
  }, [isUserScrubbing, isPlaying, totalFlightTime, pointA, pointB]);

  // Handlers for slider interaction
  const handleSliderChange = (e) => {
    setProgress(parseFloat(e.target.value));
  };

  const handleSliderStart = () => setIsUserScrubbing(true);

  const handleSliderEnd = () => {
    setIsUserScrubbing(false);
    // If we were at the end and now user moved back, enable play again
    if (progress < 0.99 && !isPlaying) {
      setIsPlaying(true);
    }
  };

  // Play/Pause toggle with enhanced behavior
  const handlePlayPause = () => {
    const newPlayingState = !isPlaying;
    setIsPlaying(newPlayingState);

    // If resuming from end, start from beginning
    if (newPlayingState && progress >= 0.99) {
      setProgress(0);
    }
  };

  // Reset progress to 0 when starting from beginning
  useEffect(() => {
    if (isPlaying && progress === 1) {
      setProgress(0);
    }
  }, [isPlaying, progress]);

  // Auto-play when route is set
  useEffect(() => {
    if (pointA && pointB) {
      setProgress(0); // Reset progress to start
      setIsPlaying(true); // Auto-start playback
    }
  }, [pointA, pointB]);

  return (
    <ErrorBoundary>
      <div style={{ width: "100%", height: "100%", position: "relative" }}>
        {/* Progress bar with play/pause button outside the Canvas */}
        <div
          style={{
            position: "absolute",
            top: "20px",
            left: "50%",
            transform: "translateX(-50%)",
            width: "38%",
            zIndex: 1000,
            display: "flex",
            alignItems: "center",
            gap: "10px",
            background: "rgba(0, 0, 0, 0.65)",
            backdropFilter: "blur(10px)",
            borderRadius: "24px",
            padding: "8px 14px",
            border: "0.5px solid rgba(0, 170, 255, 0.25)",
            boxShadow:
              "0 4px 16px rgba(0, 0, 0, 0.3), 0 0 4px rgba(0, 120, 255, 0.1)",
          }}
        >
          <div
            onClick={handlePlayPause}
            style={{
              background: isPlaying
                ? "rgba(255, 77, 79, 0.75)"
                : "rgba(0, 170, 255, 0.75)",
              border: "none",
              borderRadius: "50%",
              width: "28px",
              height: "28px",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              cursor: "pointer",
              boxShadow: "0 2px 6px rgba(0, 0, 0, 0.3)",
              transition: "all 0.2s ease",
              outline: "none",
              flexShrink: 0,
            }}
            aria-label={isPlaying ? "Pause animation" : "Play animation"}
          >
            {isPlaying ? (
              <PauseOutlined style={{ color: "white", fontSize: "12px" }} />
            ) : (
              <CaretRightOutlined
                style={{ color: "white", fontSize: "12px" }}
              />
            )}
          </div>
          <div
            style={{
              position: "relative",
              width: "100%",
              height: "22px",
              display: "flex",
              alignItems: "center",
            }}
          >
            <div
              style={{
                position: "absolute",
                left: "0",
                height: "2px",
                width: `${progress * 100}%`,
                background: "linear-gradient(90deg, #1890ff, #00AAFF)",
                borderRadius: "2px",
                zIndex: 1,
                boxShadow: "0 0 4px rgba(0, 170, 255, 0.7)",
              }}
            />
            <input
              type="range"
              min="0"
              max="1"
              step="0.001"
              value={progress}
              onChange={handleSliderChange}
              onMouseDown={handleSliderStart}
              onMouseUp={handleSliderEnd}
              onTouchStart={handleSliderStart}
              onTouchEnd={handleSliderEnd}
              style={{
                width: "100%",
                opacity: "0",
                position: "absolute",
                zIndex: 2,
                cursor: "pointer",
                height: "100%",
                margin: "0",
                padding: "0",
              }}
            />
            <div
              style={{
                position: "absolute",
                left: "0",
                height: "2px",
                width: "100%",
                background: "rgba(255, 255, 255, 0.1)",
                borderRadius: "2px",
                zIndex: 0,
              }}
            />
            <div
              style={{
                position: "absolute",
                left: `${progress * 100}%`,
                transform: "translateX(-50%)",
                width: "8px",
                height: "8px",
                borderRadius: "50%",
                background: "#1890ff",
                boxShadow: "0 0 5px rgba(24, 144, 255, 0.9)",
                zIndex: 3,
                pointerEvents: "none",
              }}
            />
          </div>
        </div>

        <div style={{ width: "100%", height: "100%", background: "black" }}>
          <Canvas
            camera={{ position: [0, 0, 2.5], fov: 45 }}
            gl={{ antialias: true, alpha: true }}
            shadows
          >
            <Suspense fallback={<LoadingScreen />}>
              <SceneSetup />
              <Globe
                pointA={pointA}
                pointB={pointB}
                departureTime={departureTime}
                totalFlightTime={totalFlightTime || 120}
                progress={progress}
                onProgressChange={setProgress}
              />
              <OrbitControls
                enablePan={false}
                enableDamping
                dampingFactor={0.05}
                rotateSpeed={0.5}
                zoomSpeed={0.8}
                minDistance={1.5}
                maxDistance={10}
              />
            </Suspense>
          </Canvas>
        </div>
      </div>
    </ErrorBoundary>
  );
}
