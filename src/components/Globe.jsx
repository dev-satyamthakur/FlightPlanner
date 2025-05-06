import React, { useRef, useState, useEffect } from "react";
import { Canvas, useFrame, useLoader, useThree } from "@react-three/fiber";
import { OrbitControls, Text, Stars } from "@react-three/drei";
import * as THREE from "three";

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
    <group ref={labelRef} position={position}>
      <Text
        fontSize={0.05}
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

function Globe({ pointA, pointB }) {
  const globeRef = useRef();
  const planeRef = useRef();
  const pathGroupRef = useRef();
  const [curve, setCurve] = useState(null);
  const [startTime, setStartTime] = useState(null);
  const [flightPath, setFlightPath] = useState(null);
  const texture = useLoader(THREE.TextureLoader, "/earth.jpg");
  const { camera } = useThree();

  useEffect(() => {
    const radius = 1;
    const startVec = latLonToVector3(pointA.lat, pointA.lon, radius);
    const endVec = latLonToVector3(pointB.lat, pointB.lon, radius);
    const greatCircle = new GreatCircleCurve(startVec, endVec, radius);
    setCurve(greatCircle);
    setStartTime(performance.now());

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
  }, [pointA, pointB]);

  useFrame(({ clock }) => {
    if (globeRef.current) {
      globeRef.current.rotation.x = 23.4 * (Math.PI / 180);
      const rotationY = clock.getElapsedTime() * 0.1;
      globeRef.current.rotation.y = rotationY;

      if (pathGroupRef.current) {
        pathGroupRef.current.rotation.x = 23.4 * (Math.PI / 180);
        pathGroupRef.current.rotation.y = rotationY;
      }
    }

    if (curve && planeRef.current && startTime) {
      const duration = 30000; // 30 seconds journey
      const elapsed = (performance.now() - startTime) % duration;
      const t = elapsed / duration;
      const position = curve.getPoint(t);
      const nextT = Math.min(t + 0.01, 1);
      const nextPosition = curve.getPoint(nextT);

      planeRef.current.position.copy(position).multiplyScalar(1.04);
      planeRef.current.up.copy(position.clone().normalize());
      planeRef.current.lookAt(nextPosition);
    }
  });

  const cities = [
    { 
      name: pointA.name, 
      lat: pointA.lat, 
      lon: pointA.lon 
    },
    { 
      name: pointB.name, 
      lat: pointB.lat, 
      lon: pointB.lon 
    }
  ];

  return (
    <>
      <group>
        <mesh ref={globeRef}>
          <sphereGeometry args={[1, 64, 64]} />
          <meshStandardMaterial map={texture} metalness={0.1} roughness={0.8} />
        </mesh>
        <Atmosphere />
      </group>

      <group ref={pathGroupRef}>
        {flightPath && <primitive object={flightPath} />}

        <mesh ref={planeRef}>
          <coneGeometry args={[0.015, 0.06, 3]} />
          <meshStandardMaterial
            color="#3399FF"
            emissive="#0066CC"
            emissiveIntensity={0.5}
          />
        </mesh>

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

export default function GlobeApp({ pointA, pointB }) {
  return (
    <div style={{ width: "100%", height: "100%", background: "black" }}>
      <Canvas
        camera={{ position: [0, 0, 2.5], fov: 45 }}
        gl={{ antialias: true, alpha: true }}
        shadows
      >
        <SceneSetup />
        <Globe pointA={pointA} pointB={pointB} />
        <OrbitControls
          enablePan={false}
          enableDamping
          dampingFactor={0.05}
          rotateSpeed={0.5}
          zoomSpeed={0.8}
          minDistance={1.5}
          maxDistance={10}
        />
      </Canvas>
    </div>
  );
}
