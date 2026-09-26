import * as THREE from 'three';

const canvas = document.getElementById('scene');
const scene = new THREE.Scene();
scene.fog = new THREE.FogExp2(0x05070b, 0.055);

const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 100);
camera.position.set(0, 0.1, 7.8);

const renderer = new THREE.WebGLRenderer({canvas, antialias:true, alpha:true, powerPreference:'high-performance'});
renderer.setPixelRatio(Math.min(window.devicePixelRatio,2));
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.setClearColor(0x000000,0);

const root = new THREE.Group();
scene.add(root);

const cyan = 0x5cf0c4, blue = 0x6aa6ff, white = 0xeaf3f8;
const coreMat = new THREE.MeshPhysicalMaterial({
  color:0x12251f, emissive:0x124d3d, emissiveIntensity:1.8,
  metalness:.35, roughness:.2, transmission:.1, thickness:1.4
});
const core = new THREE.Mesh(new THREE.IcosahedronGeometry(1.15,4),coreMat);
root.add(core);

const inner = new THREE.Mesh(new THREE.IcosahedronGeometry(.82,2),
  new THREE.MeshBasicMaterial({color:0xbafff1,wireframe:true,transparent:true,opacity:.23}));
root.add(inner);

const shell = new THREE.Mesh(new THREE.IcosahedronGeometry(1.56,2),
  new THREE.MeshBasicMaterial({color:blue,wireframe:true,transparent:true,opacity:.17}));
root.add(shell);

const rings=[];
for(let i=0;i<6;i++){
  const ring=new THREE.Mesh(
    new THREE.TorusGeometry(1.72+i*.29,.006+i*.001,8,180),
    new THREE.MeshBasicMaterial({color:i%2?blue:cyan,transparent:true,opacity:.4-i*.045})
  );
  ring.rotation.set(.65+i*.34,i*.57,i*.22);
  root.add(ring); rings.push(ring);
}

// Nodes
const nodePositions=[], nodes=[];
const nodeMat=new THREE.MeshStandardMaterial({color:0xbafff1,emissive:cyan,emissiveIntensity:2.7,metalness:.1,roughness:.2});
for(let i=0;i<64;i++){
  const theta=Math.random()*Math.PI*2;
  const phi=Math.acos(THREE.MathUtils.randFloatSpread(2));
  const radius=THREE.MathUtils.randFloat(2.0,3.25);
  const p=new THREE.Vector3(
    radius*Math.sin(phi)*Math.cos(theta),
    radius*Math.sin(phi)*Math.sin(theta),
    radius*Math.cos(phi)
  );
  nodePositions.push(p.clone());
  const node=new THREE.Mesh(new THREE.SphereGeometry(THREE.MathUtils.randFloat(.012,.035),8,8),nodeMat);
  node.position.copy(p);
  node.userData.base=p.clone();
  node.userData.phase=Math.random()*Math.PI*2;
  root.add(node); nodes.push(node);
}

// Sparse connection network
const linePoints=[];
for(let i=0;i<nodePositions.length;i++){
  for(let j=i+1;j<nodePositions.length;j++){
    const d=nodePositions[i].distanceTo(nodePositions[j]);
    if(d<1.02 && Math.random()<.15) linePoints.push(nodePositions[i],nodePositions[j]);
  }
}
const lineGeo=new THREE.BufferGeometry().setFromPoints(linePoints);
root.add(new THREE.LineSegments(lineGeo,new THREE.LineBasicMaterial({color:blue,transparent:true,opacity:.12})));

// Star field
const starsGeo=new THREE.BufferGeometry(), starData=[];
for(let i=0;i<420;i++) starData.push(
  THREE.MathUtils.randFloatSpread(22),
  THREE.MathUtils.randFloatSpread(14),
  THREE.MathUtils.randFloat(-10,4)
);
starsGeo.setAttribute('position',new THREE.Float32BufferAttribute(starData,3));
const stars=new THREE.Points(starsGeo,new THREE.PointsMaterial({color:white,size:.012,transparent:true,opacity:.3}));
scene.add(stars);

scene.add(new THREE.AmbientLight(0xffffff,.65));
const key=new THREE.PointLight(cyan,30,14); key.position.set(2.8,2.6,4.5); scene.add(key);
const fill=new THREE.PointLight(blue,23,13); fill.position.set(-3.2,-1.8,2.5); scene.add(fill);

let pointerX=0,pointerY=0,scrollProgress=0,targetProgress=0;
window.addEventListener('pointermove',e=>{
  pointerX=(e.clientX/window.innerWidth-.5)*2;
  pointerY=(e.clientY/window.innerHeight-.5)*2;
});
window.addEventListener('scroll',()=>{
  const max=document.documentElement.scrollHeight-window.innerHeight;
  targetProgress=max>0?window.scrollY/max:0;
},{passive:true});

function resize(){
  const r=canvas.getBoundingClientRect(), w=Math.max(1,r.width), h=Math.max(1,r.height);
  renderer.setSize(w,h,false); camera.aspect=w/h; camera.updateProjectionMatrix();
}
window.addEventListener('resize',resize); resize();

const clock=new THREE.Clock();
function animate(){
  requestAnimationFrame(animate);
  const t=clock.getElapsedTime();
  scrollProgress += (targetProgress-scrollProgress)*.035;

  core.rotation.x+=.0019; core.rotation.y+=.0032;
  inner.rotation.x-=.0022; inner.rotation.z+=.0028; shell.rotation.y-=.0015;
  rings.forEach((r,i)=>{r.rotation.x+=.00045+i*.00016;r.rotation.z-=.00032+i*.00012});

  nodes.forEach((node,i)=>{
    const b=node.userData.base, ph=node.userData.phase;
    node.position.set(
      b.x + Math.sin(t*.32+ph)*.025,
      b.y + Math.sin(t*.35+ph)*.04,
      b.z + Math.cos(t*.28+ph)*.025
    );
    const pulse=1+Math.sin(t*.8+ph)*.045;
    node.scale.setScalar(pulse);
  });

  const curve=Math.sin(scrollProgress*Math.PI*1.8);
  camera.position.x += ((pointerX*.28)+curve*.55-camera.position.x)*.025;
  camera.position.y += ((.12-pointerY*.18)+Math.sin(scrollProgress*Math.PI)*.35-camera.position.y)*.025;
  camera.position.z += ((7.8-scrollProgress*1.2)-camera.position.z)*.02;
  camera.lookAt(0,0,0);

  root.rotation.y += ((scrollProgress*Math.PI*1.7)-root.rotation.y)*.018;
  root.rotation.x += ((pointerY*.08)-root.rotation.x)*.02;
  root.position.y += ((-scrollProgress*.55)-root.position.y)*.018;
  root.scale.setScalar(1+scrollProgress*.08);
  stars.rotation.y=t*.006;

  key.intensity=29+Math.sin(t*1.2)*4;
  fill.intensity=22+Math.cos(t*.8)*3;
  renderer.render(scene,camera);
}
animate();

// Page progress
const progress=document.getElementById('progress');
function updateProgress(){
  const max=document.documentElement.scrollHeight-window.innerHeight;
  progress.style.width=`${max>0?(window.scrollY/max)*100:0}%`;
}
window.addEventListener('scroll',updateProgress,{passive:true}); updateProgress();

// Reveal
const revealItems=document.querySelectorAll('.reveal');
const observer=new IntersectionObserver(entries=>{
  entries.forEach(entry=>{if(entry.isIntersecting) entry.target.classList.add('visible')});
},{threshold:.12});
revealItems.forEach(el=>observer.observe(el));

// Cursor glow
const glow=document.getElementById('cursorGlow');
window.addEventListener('pointermove',e=>{
  if(glow){glow.style.left=e.clientX+'px';glow.style.top=e.clientY+'px';}
},{passive:true});

// Current year
document.getElementById('year').textContent=new Date().getFullYear();
