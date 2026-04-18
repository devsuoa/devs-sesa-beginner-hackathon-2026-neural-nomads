import { useRef, useState, useMemo, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Stars, Html } from '@react-three/drei';
import * as THREE from 'three';

const PLANETS = [
  { name: 'Mercury', radius: 0.28, distance: 5,   speed: 0.8,  emissive: '#222',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4a/Mercury_in_true_color.jpg/200px-Mercury_in_true_color.jpg',
    info: 'The smallest planet and closest to the Sun — a barren, crater-covered world with no atmosphere and wild temperature swings between scorching days and freezing nights.',
    facts: ['Diameter: 4,879 km', 'Day: 59 Earth days', 'Year: 88 Earth days', 'Temp: −180°C to 430°C', 'Moons: 0', 'Gravity: 3.7 m/s²'] },
  { name: 'Venus',   radius: 0.45, distance: 8,   speed: 0.6,  emissive: '#3a2a10',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e5/Venus-real_color.jpg/200px-Venus-real_color.jpg',
    info: 'The hottest planet despite not being closest to the Sun. Its thick CO₂ atmosphere traps heat in a runaway greenhouse effect, with crushing surface pressure 90× that of Earth.',
    facts: ['Diameter: 12,104 km', 'Day: 243 Earth days', 'Year: 225 Earth days', 'Temp: 465°C (avg)', 'Moons: 0', 'Gravity: 8.87 m/s²'] },
  { name: 'Earth',   radius: 0.48, distance: 11,  speed: 0.5,  emissive: '#0a1a30',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/97/The_Earth_seen_from_Apollo_17.jpg/200px-The_Earth_seen_from_Apollo_17.jpg',
    info: 'Our home — the only known world harboring life. Liquid water oceans cover 71% of the surface, and a protective magnetic field shields us from solar radiation.',
    facts: ['Diameter: 12,742 km', 'Day: 24 hours', 'Year: 365.25 days', 'Temp: −89°C to 56°C', 'Moons: 1', 'Gravity: 9.81 m/s²'] },
  { name: 'Mars',    radius: 0.35, distance: 15,  speed: 0.4,  emissive: '#2a0a00',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/02/OSIRIS_Mars_true_color.jpg/200px-OSIRIS_Mars_true_color.jpg',
    info: 'The Red Planet hosts Olympus Mons — the tallest volcano in the solar system at 22 km — and Valles Marineris, a canyon system stretching 4,000 km across.',
    facts: ['Diameter: 6,779 km', 'Day: 24.6 hours', 'Year: 687 Earth days', 'Temp: −87°C to −5°C', 'Moons: 2', 'Gravity: 3.72 m/s²'] },
  { name: 'Jupiter', radius: 1.3,  distance: 22,  speed: 0.22, emissive: '#2a1a00',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2b/Jupiter_and_its_shrunken_Great_Red_Spot.jpg/200px-Jupiter_and_its_shrunken_Great_Red_Spot.jpg',
    info: 'The largest planet — a gas giant so massive it contains more than twice the mass of all other planets combined. Its Great Red Spot is a storm that has raged for over 350 years.',
    facts: ['Diameter: 139,820 km', 'Day: 9.9 hours', 'Year: 11.9 Earth years', 'Temp: −110°C (clouds)', 'Moons: 95', 'Gravity: 24.79 m/s²'] },
  { name: 'Saturn',  radius: 1.1,  distance: 30,  speed: 0.18, emissive: '#2a2000',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c7/Saturn_during_Equinox.jpg/200px-Saturn_during_Equinox.jpg',
    info: 'The ringed jewel of the solar system. Saturn\'s rings are made of billions of ice and rock particles and span up to 282,000 km, yet are only about 10 metres thick.',
    facts: ['Diameter: 116,460 km', 'Day: 10.7 hours', 'Year: 29.5 Earth years', 'Temp: −140°C (avg)', 'Moons: 146', 'Gravity: 10.44 m/s²'] },
  { name: 'Uranus',  radius: 0.75, distance: 38,  speed: 0.12, emissive: '#0a2a2a',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3d/Uranus2.jpg/200px-Uranus2.jpg',
    info: 'An ice giant tilted 98° on its axis — it literally rolls around the Sun on its side. Its blue-green colour comes from methane gas absorbing red light in the atmosphere.',
    facts: ['Diameter: 50,724 km', 'Day: 17.2 hours', 'Year: 84 Earth years', 'Temp: −195°C (avg)', 'Moons: 27', 'Gravity: 8.69 m/s²'] },
  { name: 'Neptune', radius: 0.72, distance: 46,  speed: 0.09, emissive: '#0a0a2a',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/63/Neptune_-_Voyager_2_%2829347980845%29_flatten_crop.jpg/200px-Neptune_-_Voyager_2_%2829347980845%29_flatten_crop.jpg',
    info: 'The windiest planet in the solar system, with storms exceeding 2,100 km/h. Despite being the farthest planet, it radiates more heat than it receives from the Sun.',
    facts: ['Diameter: 49,244 km', 'Day: 16.1 hours', 'Year: 165 Earth years', 'Temp: −200°C (avg)', 'Moons: 16', 'Gravity: 11.15 m/s²'] },
];

const SUN_BODY = {
  name: 'Sun', radius: 2.5,
  image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b4/The_Sun_by_the_Atmospheric_Imaging_Assembly_of_NASA%27s_Solar_Dynamics_Observatory_-_20100819.jpg/200px-The_Sun_by_the_Atmospheric_Imaging_Assembly_of_NASA%27s_Solar_Dynamics_Observatory_-_20100819.jpg',
  info: 'Our home star — a G-type main-sequence star 4.6 billion years old. It contains 99.86% of all mass in the solar system and will continue to burn for another 5 billion years before becoming a red giant.',
  facts: ['Age: 4.6 billion years', 'Diameter: 1,392,700 km', 'Surface temp: 5,500°C', 'Core temp: 15,000,000°C', 'Distance to Earth: 150M km', 'Light travel time: 8 min 20 s'],
};

const ALL_BODIES = [SUN_BODY, ...PLANETS];

function makeCanvasTexture(fn: (ctx: CanvasRenderingContext2D, w: number, h: number) => void) {
  const c = document.createElement('canvas'); c.width = 512; c.height = 256;
  const ctx = c.getContext('2d')!; fn(ctx, 512, 256);
  return new THREE.CanvasTexture(c);
}

function useTextures() {
  return useMemo(() => ({
    Mercury: makeCanvasTexture((ctx,w,h) => { ctx.fillStyle='#888';ctx.fillRect(0,0,w,h);for(let i=0;i<120;i++){ctx.fillStyle=`rgba(${60+Math.random()*40|0},${60+Math.random()*40|0},${60+Math.random()*40|0},0.6)`;ctx.beginPath();ctx.arc(Math.random()*w,Math.random()*h,Math.random()*8+2,0,Math.PI*2);ctx.fill();} }),
    Venus:   makeCanvasTexture((ctx,w,h) => { const g=ctx.createLinearGradient(0,0,0,h);g.addColorStop(0,'#c8903a');g.addColorStop(0.5,'#d4a96a');g.addColorStop(1,'#b87830');ctx.fillStyle=g;ctx.fillRect(0,0,w,h);for(let i=0;i<20;i++){const y=Math.random()*h;ctx.strokeStyle='rgba(180,130,60,0.3)';ctx.lineWidth=Math.random()*6+2;ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(w,y+(Math.random()-.5)*20);ctx.stroke();} }),
    Earth:   makeCanvasTexture((ctx,w,h) => { ctx.fillStyle='#1a5fa8';ctx.fillRect(0,0,w,h);[[0.1,0.3,0.25,0.4],[0.4,0.25,0.15,0.35],[0.55,0.3,0.2,0.35],[0.15,0.55,0.12,0.25],[0.72,0.45,0.18,0.3]].forEach(([x,y,rw,rh])=>{ctx.fillStyle=`rgba(${50+Math.random()*30|0},${120+Math.random()*40|0},${40+Math.random()*20|0},0.9)`;ctx.beginPath();ctx.ellipse(x*w,y*h,rw*w,rh*h,Math.random(),0,Math.PI*2);ctx.fill();});ctx.fillStyle='rgba(255,255,255,0.7)';ctx.fillRect(0,0,w,12);ctx.fillRect(0,h-12,w,12); }),
    Mars:    makeCanvasTexture((ctx,w,h) => { ctx.fillStyle='#b03010';ctx.fillRect(0,0,w,h);for(let i=0;i<80;i++){ctx.fillStyle=`rgba(${150+Math.random()*60|0},${50+Math.random()*30|0},${10+Math.random()*20|0},0.5)`;ctx.beginPath();ctx.arc(Math.random()*w,Math.random()*h,Math.random()*15+3,0,Math.PI*2);ctx.fill();} }),
    Jupiter: makeCanvasTexture((ctx,w,h) => { ['#c88b3a','#d4a04a','#b87830','#e0c080','#a06820','#d8b060','#906020','#c8a050'].forEach((c,i,a)=>{ctx.fillStyle=c;ctx.fillRect(0,i*(h/a.length),w,h/a.length+1);});ctx.fillStyle='rgba(160,80,40,0.8)';ctx.beginPath();ctx.ellipse(w*.6,h*.55,60,35,0,0,Math.PI*2);ctx.fill(); }),
    Saturn:  makeCanvasTexture((ctx,w,h) => { ['#e8d5a3','#d4c070','#f0e0b0','#c8b060','#e0d090'].forEach((c,i,a)=>{ctx.fillStyle=c;ctx.fillRect(0,i*(h/a.length),w,h/a.length+1);}); }),
    Uranus:  makeCanvasTexture((ctx,w,h) => { const g=ctx.createLinearGradient(0,0,0,h);g.addColorStop(0,'#a0f0f0');g.addColorStop(.5,'#7de8e8');g.addColorStop(1,'#50c8c8');ctx.fillStyle=g;ctx.fillRect(0,0,w,h); }),
    Neptune: makeCanvasTexture((ctx,w,h) => { const g=ctx.createLinearGradient(0,0,0,h);g.addColorStop(0,'#3040a0');g.addColorStop(.5,'#3f54ba');g.addColorStop(1,'#2030a0');ctx.fillStyle=g;ctx.fillRect(0,0,w,h);ctx.fillStyle='rgba(80,100,200,0.6)';ctx.beginPath();ctx.ellipse(w*.4,h*.4,40,25,.3,0,Math.PI*2);ctx.fill(); }),
  }), []);
}

function SaturnRings({ radius }: { radius: number }) {
  return (
    <group rotation={[Math.PI/2.8,0,0.3]}>
      <mesh><ringGeometry args={[radius*1.5,radius*2,80]}/><meshBasicMaterial color="#d4c080" transparent opacity={0.55} side={THREE.DoubleSide}/></mesh>
      <mesh><ringGeometry args={[radius*2.1,radius*2.5,80]}/><meshBasicMaterial color="#c8b070" transparent opacity={0.3} side={THREE.DoubleSide}/></mesh>
    </group>
  );
}

function Sun() {
  const ref = useRef<THREE.Mesh>(null);
  const tex = useMemo(() => makeCanvasTexture((ctx,w,h)=>{ const g=ctx.createRadialGradient(w/2,h/2,0,w/2,h/2,w/2);g.addColorStop(0,'#fff8a0');g.addColorStop(.4,'#FDB813');g.addColorStop(.8,'#ff8800');g.addColorStop(1,'#cc4400');ctx.fillStyle=g;ctx.fillRect(0,0,w,h);for(let i=0;i<60;i++){ctx.fillStyle=`rgba(255,${100+Math.random()*100|0},0,0.3)`;ctx.beginPath();ctx.arc(Math.random()*w,Math.random()*h,Math.random()*20+5,0,Math.PI*2);ctx.fill();} }), []);
  useFrame((_,d)=>{ if(ref.current) ref.current.rotation.y+=d*.05; sharedPositions['Sun']=new THREE.Vector3(0,0,0); });
  return (
    <group>
      <mesh ref={ref}><sphereGeometry args={[2.5,64,64]}/><meshStandardMaterial map={tex} emissive="#FDB813" emissiveIntensity={0.8} roughness={1}/></mesh>
      <mesh><sphereGeometry args={[2.9,32,32]}/><meshBasicMaterial color="#ff8800" transparent opacity={0.08} side={THREE.BackSide}/></mesh>
    </group>
  );
}

// Shared planet positions for fly-to feature
const sharedPositions: Record<string, THREE.Vector3> = {};

function Planet({ name, radius, distance, speed, emissive, texture, selected, onSelect }: {
  name: string; radius: number; distance: number; speed: number; emissive: string;
  texture: THREE.Texture; selected: boolean; onSelect: (n: string|null) => void;
}) {
  const { camera } = useThree();
  const meshRef = useRef<THREE.Mesh>(null);
  const groupRef = useRef<THREE.Group>(null);
  const angleRef = useRef(Math.random() * Math.PI * 2);
  const [labelVisible, setLabelVisible] = useState(true);
  const labelVisibleRef = useRef(true);
  const frustum = useMemo(() => new THREE.Frustum(), []);
  const projMatrix = useMemo(() => new THREE.Matrix4(), []);

  // Orbit ring
  const orbitPoints = useMemo(() => {
    const pts = [];
    for(let i=0;i<=128;i++){const a=(i/128)*Math.PI*2;pts.push(new THREE.Vector3(Math.cos(a)*distance,0,Math.sin(a)*distance));}
    return pts;
  }, [distance]);
  const orbitGeo = useMemo(() => new THREE.BufferGeometry().setFromPoints(orbitPoints), [orbitPoints]);
  const orbitLine = useMemo(() => new THREE.Line(orbitGeo, new THREE.LineBasicMaterial({ color:'#2a3a6a', transparent:true, opacity:0.4 })), [orbitGeo]);

  useFrame((_,d) => {
    angleRef.current += d * speed * 0.06;
    const x = Math.cos(angleRef.current) * distance;
    const z = Math.sin(angleRef.current) * distance;
    if (groupRef.current) groupRef.current.position.set(x, 0, z);
    if (meshRef.current) meshRef.current.rotation.y += d * 0.3;
    sharedPositions[name] = new THREE.Vector3(x, 0, z);

    // Only show label when planet is inside the camera frustum
    projMatrix.multiplyMatrices(camera.projectionMatrix, camera.matrixWorldInverse);
    frustum.setFromProjectionMatrix(projMatrix);
    const inView = frustum.containsPoint(new THREE.Vector3(x, 0, z));
    if (inView !== labelVisibleRef.current) {
      labelVisibleRef.current = inView;
      setLabelVisible(inView);
    }
  });

  return (
    <>
      <primitive object={orbitLine} />
      <group ref={groupRef}>
        <mesh ref={meshRef}><sphereGeometry args={[radius,64,64]}/><meshStandardMaterial map={texture} emissive={emissive} emissiveIntensity={0.3} roughness={0.85}/></mesh>
        <mesh onClick={e=>{e.stopPropagation();onSelect(selected?null:name);}}>
          <sphereGeometry args={[Math.max(radius*2.5,1.8),16,16]}/>
          <meshBasicMaterial transparent opacity={0} depthWrite={false}/>
        </mesh>
        {name==='Saturn' && <SaturnRings radius={radius}/>}
        {labelVisible && (
          <Html center position={[0,radius+1,0]} distanceFactor={25} occlude={false}>
            <div onClick={()=>onSelect(selected?null:name)} style={{color:selected?'#fde68a':'rgba(200,210,255,0.9)',fontSize:'12px',fontWeight:selected?'bold':'normal',whiteSpace:'nowrap',cursor:'pointer',textShadow:'0 0 8px rgba(0,0,0,1)',userSelect:'none'}}>
              {name}
            </div>
          </Html>
        )}
      </group>
    </>
  );
}

function FirstPersonController({
  keysRef,
  flyTarget,
  flyPlanetRef,
  onArrived,
  onSpeedChange,
  onLookAt,
}: {
  keysRef: React.RefObject<{ w:boolean;a:boolean;s:boolean;d:boolean;space:boolean;shift:boolean;c:boolean }>;
  flyTarget: React.RefObject<THREE.Vector3|null>;
  flyPlanetRef: React.RefObject<string|null>;
  onArrived: () => void;
  onSpeedChange: (s: number) => void;
  onLookAt: (planet: string | null) => void;
}) {
  const { camera } = useThree();
  const euler = useRef(new THREE.Euler(0,0,0,'YXZ'));
  const isDragging = useRef(false);
  const lastMouse = useRef({x:0,y:0});
  const vel = useRef(new THREE.Vector3());
  const arrivedRef = useRef(onArrived);
  const speedRef = useRef(onSpeedChange);
  const lookAtRef = useRef(onLookAt);
  const lastLookedAt = useRef<string|null>(null);
  arrivedRef.current = onArrived;
  speedRef.current = onSpeedChange;
  lookAtRef.current = onLookAt;

  useEffect(() => {
    // Start near Earth
    camera.position.set(13, 2, 4);
    camera.lookAt(0, 0, 0);
    euler.current.setFromQuaternion(camera.quaternion, 'YXZ');
  }, [camera]);

  useEffect(() => {
    const onDown = (e: MouseEvent) => { isDragging.current=true; lastMouse.current={x:e.clientX,y:e.clientY}; };
    const onUp = () => { isDragging.current=false; };
    const onMove = (e: MouseEvent) => {
      if (!isDragging.current) return;
      const dx=e.clientX-lastMouse.current.x, dy=e.clientY-lastMouse.current.y;
      lastMouse.current={x:e.clientX,y:e.clientY};
      euler.current.y -= dx*0.003;
      euler.current.x = Math.max(-Math.PI/2, Math.min(Math.PI/2, euler.current.x-dy*0.003));
      camera.quaternion.setFromEuler(euler.current);
    };
    window.addEventListener('mousedown',onDown);
    window.addEventListener('mouseup',onUp);
    window.addEventListener('mousemove',onMove);
    return ()=>{window.removeEventListener('mousedown',onDown);window.removeEventListener('mouseup',onUp);window.removeEventListener('mousemove',onMove);};
  }, [camera]);

  const fwd = useRef(new THREE.Vector3());
  const right = useRef(new THREE.Vector3());
  const up = useRef(new THREE.Vector3(0,1,0));

  useFrame((_,delta) => {
    // Auto-fly — dynamically track planet's current position each frame
    if (flyPlanetRef.current) {
      const planetPos = sharedPositions[flyPlanetRef.current];
      const planet = PLANETS.find(p => p.name === flyPlanetRef.current);
      if (planetPos && planet) {
        const offset = new THREE.Vector3(0, 1.5, planet.radius + 4);
        const camTarget = planetPos.clone().add(offset);
        flyTarget.current = camTarget;
        camera.position.lerp(camTarget, delta * 2.5);

        // Smoothly rotate camera to face the planet
        const lookTarget = new THREE.Matrix4();
        lookTarget.lookAt(camera.position, planetPos, up.current);
        const targetQuat = new THREE.Quaternion().setFromRotationMatrix(lookTarget);
        camera.quaternion.slerp(targetQuat, delta * 4);
        euler.current.setFromQuaternion(camera.quaternion, 'YXZ');

        if (camera.position.distanceTo(camTarget) < 1.2) {
          flyPlanetRef.current = null;
          flyTarget.current = null;
          arrivedRef.current();
        }
        speedRef.current(Math.round(camera.position.distanceTo(camTarget) * 2.5 * 2778 / 10) * 10);
      }
      return;
    }

    const keys = keysRef.current!;
    const boost = keys.shift ? 2 : 1;
    const speed = 4 * boost;

    camera.getWorldDirection(fwd.current);
    right.current.crossVectors(fwd.current, up.current).normalize();

    const move = new THREE.Vector3();
    if (keys.w) move.addScaledVector(fwd.current, speed * delta);
    if (keys.s) move.addScaledVector(fwd.current, -speed * delta);
    if (keys.a) move.addScaledVector(right.current, -speed * delta);
    if (keys.d) move.addScaledVector(right.current, speed * delta);
    if (keys.space) move.y += speed * delta;
    if (keys.c) move.y -= speed * delta;

    vel.current.lerp(move, 8 * delta);
    camera.position.add(vel.current);

    // vel is per-frame displacement; divide by delta → units/s, ×2778 → m/s (normal ≈ 11,000 m/s)
    const spd = (vel.current.length() / delta) * 2778;
    speedRef.current(Math.round(spd / 10) * 10);

    // Crosshair detection — includes Sun + all planets
    camera.getWorldDirection(fwd.current);
    let lookedAt: string | null = null;
    let minAngle = Infinity;
    for (const planet of ALL_BODIES) {
      const pos = sharedPositions[planet.name];
      if (!pos) continue;
      const toPlanet = pos.clone().sub(camera.position);
      const dist = toPlanet.length();
      const angle = fwd.current.angleTo(toPlanet.normalize());
      const threshold = Math.atan2(planet.radius * 3, dist) + 0.04;
      if (angle < threshold && angle < minAngle) { minAngle = angle; lookedAt = planet.name; }
    }
    if (lookedAt !== lastLookedAt.current) {
      lastLookedAt.current = lookedAt;
      lookAtRef.current(lookedAt);
    }
  });

  return null;
}

// ── Cockpit overlay ───────────────────────────────────────────────────────────

function CockpitHUD({ speed, lockedPlanet, flying }: { speed: number; lockedPlanet: string | null; flying: boolean }) {
  const body = ALL_BODIES.find(b => b.name === lockedPlanet) ?? null;

  return (
    <div style={{ position:'absolute', inset:0, pointerEvents:'none', zIndex:20, overflow:'hidden' }}>

      {/* Cockpit window frame */}
      <svg style={{ position:'absolute', inset:0, width:'100%', height:'100%' }} viewBox="0 0 100 100" preserveAspectRatio="none">
        <defs>
          <mask id="cockpit-mask">
            <rect width="100" height="100" fill="white"/>
            <rect x="7" y="8" width="86" height="62" rx="3" ry="3" fill="black"/>
          </mask>
        </defs>
        <rect width="100" height="100" fill="rgba(4,8,22,0.97)" mask="url(#cockpit-mask)"/>
        <rect x="7" y="8" width="86" height="62" rx="3" ry="3" fill="none" stroke="rgba(80,140,255,0.25)" strokeWidth="0.4"/>
        <rect x="8" y="9" width="84" height="60" rx="2.5" ry="2.5" fill="none" stroke="rgba(100,180,255,0.1)" strokeWidth="0.3"/>
      </svg>

      {/* Vignette */}
      <div style={{ position:'absolute', inset:0, background:'radial-gradient(ellipse 80% 65% at 50% 38%, transparent 55%, rgba(0,5,20,0.5) 100%)' }}/>

      {/* Top bar */}
      <div style={{ position:'absolute', top:'9%', left:'10%', right:'10%', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
        <div style={{ color:'rgba(100,180,255,0.7)', fontSize:'10px', fontFamily:'monospace', letterSpacing:'0.1em' }}>SYS: ONLINE</div>
        <div style={{ color:'rgba(100,200,255,0.5)', fontSize:'9px', fontFamily:'monospace' }}>◈ STELLAR NAVIGATOR v2.4</div>
        <div style={{ color: flying ? 'rgba(255,200,50,0.9)' : 'rgba(100,255,150,0.7)', fontSize:'10px', fontFamily:'monospace', letterSpacing:'0.1em' }}>
          {flying ? '⚡ AUTOPILOT' : '● MANUAL'}
        </div>
      </div>

      {/* Crosshair */}
      <div style={{ position:'absolute', top:'38%', left:'50%', transform:'translate(-50%,-50%)' }}>
        <svg width="48" height="48" viewBox="0 0 48 48">
          <circle cx="24" cy="24" r="10" fill="none" stroke="rgba(100,200,255,0.4)" strokeWidth="0.8"/>
          <circle cx="24" cy="24" r="2" fill={lockedPlanet ? 'rgba(100,255,150,0.9)' : 'rgba(100,200,255,0.6)'}/>
          {[[24,4,24,10],[24,38,24,44],[4,24,10,24],[38,24,44,24]].map(([x1,y1,x2,y2],i) => (
            <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="rgba(100,200,255,0.5)" strokeWidth="1"/>
          ))}
          <path d="M10 10 L10 16 M10 10 L16 10" fill="none" stroke="rgba(100,200,255,0.6)" strokeWidth="1"/>
          <path d="M38 10 L38 16 M38 10 L32 10" fill="none" stroke="rgba(100,200,255,0.6)" strokeWidth="1"/>
          <path d="M10 38 L10 32 M10 38 L16 38" fill="none" stroke="rgba(100,200,255,0.6)" strokeWidth="1"/>
          <path d="M38 38 L38 32 M38 38 L32 38" fill="none" stroke="rgba(100,200,255,0.6)" strokeWidth="1"/>
        </svg>
      </div>

      {/* Left HUD — speed */}
      <div style={{ position:'absolute', top:'30%', left:'9%', color:'rgba(100,220,255,0.8)', fontFamily:'monospace', fontSize:'11px' }}>
        <div style={{ color:'rgba(100,180,255,0.5)', fontSize:'9px', marginBottom:4 }}>VELOCITY</div>
        <div style={{ fontSize:'20px', fontWeight:'bold', color:'rgba(120,230,255,0.9)', letterSpacing:'0.05em' }}>{speed.toLocaleString()}</div>
        <div style={{ color:'rgba(100,180,255,0.4)', fontSize:'8px' }}>m/s</div>
        <div style={{ marginTop:6, width:60, height:3, background:'rgba(100,180,255,0.1)', borderRadius:2 }}>
          <div style={{ width:`${Math.min(speed/22000*100,100)}%`, height:'100%', background:'linear-gradient(to right,#3af,#6ff)', borderRadius:2, transition:'width 0.2s' }}/>
        </div>
      </div>

      {/* Right HUD — target lock */}
      <div style={{ position:'absolute', top:'30%', right:'9%', color:'rgba(100,220,255,0.8)', fontFamily:'monospace', fontSize:'11px', textAlign:'right' }}>
        {lockedPlanet ? (
          <>
            <div style={{ color:'rgba(100,255,150,0.6)', fontSize:'9px', marginBottom:4 }}>TARGET LOCKED</div>
            <div style={{ fontSize:'13px', fontWeight:'bold', color:'rgba(180,255,200,0.95)' }}>{lockedPlanet}</div>
            <div style={{ marginTop:6, display:'flex', justifyContent:'flex-end' }}>
              <div style={{ width:8, height:8, borderRadius:'50%', background:'rgba(100,255,150,0.9)', boxShadow:'0 0 8px rgba(100,255,150,0.7)' }}/>
            </div>
          </>
        ) : (
          <>
            <div style={{ color:'rgba(100,180,255,0.4)', fontSize:'9px', marginBottom:4 }}>TARGET</div>
            <div style={{ fontSize:'13px', fontWeight:'bold', color:'rgba(100,150,200,0.5)' }}>—</div>
            <div style={{ marginTop:6, display:'flex', justifyContent:'flex-end' }}>
              <div style={{ width:8, height:8, borderRadius:'50%', background:'rgba(100,180,255,0.3)', boxShadow:'0 0 4px rgba(100,180,255,0.2)' }}/>
            </div>
          </>
        )}
      </div>

      {/* ── Dashboard bottom ── */}
      <div style={{ position:'absolute', bottom:0, left:0, right:0, height:'30%', background:'linear-gradient(to top, rgba(3,7,20,1) 60%, transparent)', borderTop:'1px solid rgba(60,100,200,0.2)' }}>
        <div style={{ position:'absolute', top:0, left:'5%', right:'5%', height:1, background:'linear-gradient(to right, transparent, rgba(80,140,255,0.4), transparent)' }}/>

        {/* Left — flight controls, centred vertically */}
        <div style={{ position:'absolute', left:'3%', top:'50%', transform:'translateY(-50%)', textAlign:'center' }}>
          <div style={{ color:'rgba(80,140,255,0.45)', fontSize:'9px', fontFamily:'monospace', letterSpacing:'0.08em', marginBottom:6 }}>FLIGHT CONTROLS</div>
          <div style={{ display:'flex', flexDirection:'column', gap:4 }}>
            {[
              { key:'W / S', label:'Forward / Back' },
              { key:'A / D', label:'Strafe' },
              { key:'SPACE / C', label:'Up / Down' },
              { key:'SHIFT', label:'Boost' },
              { key:'DRAG', label:'Look Around' },
            ].map(({ key, label }) => (
              <div key={key} style={{ display:'flex', alignItems:'center', gap:6 }}>
                <div style={{ background:'rgba(40,70,180,0.25)', border:'1px solid rgba(80,130,255,0.35)', borderRadius:4, padding:'2px 7px', color:'rgba(180,210,255,0.95)', fontSize:'10px', fontFamily:'monospace', fontWeight:'bold', minWidth:70, textAlign:'center' }}>{key}</div>
                <div style={{ color:'rgba(100,150,255,0.5)', fontSize:'9px', fontFamily:'monospace', whiteSpace:'nowrap' }}>{label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Centre — body info panel */}
        {body ? (
          <div style={{ position:'absolute', left:'22%', right:'5%', top:'8%', bottom:'8%', display:'flex', gap:14, alignItems:'center' }}>
            <img
              src={body.image}
              alt={body.name}
              style={{ width:100, height:100, objectFit:'cover', borderRadius:8, border:'1px solid rgba(100,160,255,0.3)', flexShrink:0 }}
            />
            <div style={{ flex:1, overflow:'hidden' }}>
              <div style={{ color:'rgba(100,160,255,0.5)', fontSize:'8px', fontFamily:'monospace', letterSpacing:'0.1em', marginBottom:2 }}>BODY LOG</div>
              <div style={{ fontWeight:'bold', fontSize:15, color:'white', marginBottom:4 }}>{body.name}</div>
              <div style={{ color:'rgba(180,200,240,0.75)', fontSize:'10px', lineHeight:1.45, marginBottom:8 }}>{body.info}</div>
              <div style={{ display:'flex', flexWrap:'wrap', gap:'4px 12px' }}>
                {body.facts.map(f => (
                  <span key={f} style={{ color:'rgba(120,200,255,0.8)', fontSize:'9px', fontFamily:'monospace', background:'rgba(40,80,180,0.18)', borderRadius:3, padding:'1px 5px' }}>{f}</span>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div style={{ position:'absolute', left:'22%', right:'5%', top:0, bottom:0, display:'flex', alignItems:'center', justifyContent:'center' }}>
            <div style={{ color:'rgba(60,90,180,0.3)', fontSize:'11px', fontFamily:'monospace', letterSpacing:'0.1em' }}>AIM AT A BODY TO VIEW DETAILS</div>
          </div>
        )}

        {/* Corner screws */}
        {[['4%','2%'],['96%','2%'],['4%','92%'],['96%','92%']].map(([l,t],i) => (
          <div key={i} style={{ position:'absolute', left:l, top:t, width:6, height:6, borderRadius:'50%', border:'1px solid rgba(60,100,200,0.3)', background:'rgba(20,30,60,0.8)' }}/>
        ))}
      </div>

    </div>
  );
}

export default function SpaceExplorerView() {
  const [selected, setSelected] = useState<string|null>(null);
  const [flying, setFlying] = useState(false);
  const [speed, setSpeed] = useState(0);
  const textures = useTextures();
  const keysRef = useRef({ w:false, a:false, s:false, d:false, space:false, shift:false, c:false });
  const flyTargetRef = useRef<THREE.Vector3|null>(null);
  const flyPlanetRef = useRef<string|null>(null);

  useEffect(() => {
    const onDown = (e: KeyboardEvent) => {
      if(e.key==='w'||e.key==='W') keysRef.current.w=true;
      if(e.key==='a'||e.key==='A') keysRef.current.a=true;
      if(e.key==='s'||e.key==='S') keysRef.current.s=true;
      if(e.key==='d'||e.key==='D') keysRef.current.d=true;
      if(e.key===' ') { e.preventDefault(); keysRef.current.space=true; }
      if(e.key==='Shift') keysRef.current.shift=true;
      if(e.key==='c'||e.key==='C') keysRef.current.c=true;
    };
    const onUp = (e: KeyboardEvent) => {
      if(e.key==='w'||e.key==='W') keysRef.current.w=false;
      if(e.key==='a'||e.key==='A') keysRef.current.a=false;
      if(e.key==='s'||e.key==='S') keysRef.current.s=false;
      if(e.key==='d'||e.key==='D') keysRef.current.d=false;
      if(e.key===' ') keysRef.current.space=false;
      if(e.key==='Shift') keysRef.current.shift=false;
      if(e.key==='c'||e.key==='C') keysRef.current.c=false;
    };
    window.addEventListener('keydown',onDown);
    window.addEventListener('keyup',onUp);
    return ()=>{ window.removeEventListener('keydown',onDown); window.removeEventListener('keyup',onUp); };
  }, []);


  const visitBody = (name: string) => {
    flyPlanetRef.current = name;
    setFlying(true);
    setSelected(name);
  };

  return (
    <div style={{ width:'100%', height:'100vh', position:'relative', background:'#020810' }}>
      <Canvas style={{ position:'absolute', inset:0 }}>
        <ambientLight intensity={0.2}/>
        <pointLight position={[0,0,0]} intensity={6} color="#ffe8a0" decay={0.4}/>
        <hemisphereLight args={['#101840','#000000',0.25]}/>
        <Stars radius={300} depth={80} count={8000} factor={5} fade/>
        <Sun/>
        {PLANETS.map(p=>(
          <Planet key={p.name} {...p}
            texture={textures[p.name as keyof typeof textures]}
            selected={selected===p.name}
            onSelect={setSelected}
          />
        ))}
        <FirstPersonController
          keysRef={keysRef}
          flyTarget={flyTargetRef}
          flyPlanetRef={flyPlanetRef}
          onArrived={()=>setFlying(false)}
          onSpeedChange={setSpeed}
          onLookAt={setSelected}
        />
      </Canvas>

      <CockpitHUD speed={speed} lockedPlanet={selected} flying={flying}/>

      {/* Destinations nav — centred vertically on right */}
      <div style={{ position:'absolute', top:'50%', right:16, transform:'translateY(-50%)', zIndex:30, display:'flex', flexDirection:'column', gap:4, pointerEvents:'auto' }}>
        <div style={{ color:'rgba(80,140,255,0.5)', fontSize:8, fontFamily:'monospace', letterSpacing:'0.1em', marginBottom:4, textAlign:'right' }}>DESTINATIONS</div>
        {ALL_BODIES.map(b=>(
          <button key={b.name} onClick={()=>visitBody(b.name)} disabled={flying}
            style={{ background: selected===b.name?'rgba(80,120,255,0.25)':'rgba(5,10,30,0.85)', border:`1px solid ${selected===b.name?'rgba(100,160,255,0.5)':'rgba(60,80,180,0.3)'}`, borderRadius:6, color:selected===b.name?'white':'rgba(160,190,255,0.7)', fontSize:10, fontFamily:'monospace', padding:'5px 10px', cursor:flying?'default':'pointer', textAlign:'right', backdropFilter:'blur(8px)', transition:'all 0.2s' }}
          >
            {b.name} →
          </button>
        ))}
      </div>
    </div>
  );
}
