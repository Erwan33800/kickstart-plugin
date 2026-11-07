
/* ================= device : interface ================= */
const $=id=>document.getElementById(id);
/* Lien avec le plugin JUCE (WebView) : événements "kickstart" dans les deux sens */
const JUCE=!!(window.__JUCE__&&window.__JUCE__.backend);
const SERVER=false;
const IN_MAX=JUCE;
const handlers={};
function bindIn(n,f){handlers[n]=f}
if(JUCE)window.__JUCE__.backend.addEventListener('kickstart',a=>{try{const arr=Array.isArray(a)?a:[];handlers[arr[0]]&&handlers[arr[0]](...arr.slice(1))}catch(e){console.error(e)}});
const GENRE_ORDER=['house','techno','afro','dubtechno','dub','garage','breaks','dnb','dubstep'];
const GENRE_LABEL={house:'House',techno:'Techno',afro:'Afro house',dubtechno:'Dub techno',dub:'Dub',garage:'UK garage',breaks:'Breakbeat',dnb:'Drum & bass',dubstep:'Dubstep'};
const MODES=[['classic','Classique'],['surprise','Surprenant'],['drop','Drop']];
const MODE_NAME={classic:'Classique',surprise:'Surprenant',drop:'Drop'};
const NOTE_N=['C','C#','D','D#','E','F','F#','G','G#','A','A#','B'];
const noteName=p=>NOTE_N[p%12]+(Math.floor(p/12)-2);
/* Notes MIDI par défaut : convention General MIDI, celle des Drum Racks d'Ableton (C1 = 36) */
/* Notes par défaut : les 16 pads d'un Drum Rack (C1 à D#2), rangés comme les kits d'Ableton :
   C1 kick · C#1 rim · D1 snare · D#1 clap · F#1 hat fermé · A#1 hat ouvert · G#1/A1/B1 toms · D#2 ride.
   Les pads restants (E1, F1, G1, C2, C#2, D2) accueillent congas, cowbell, tambourin et shaker. */
const DEFAULT_MAP={k:36,rim:37,sn:38,cp:39,pl:40,pm:41,ch:42,ph:43,tom:44,oh:46,cb:48,tamb:49,shk:50,ride:51};
const PAD_LO=36,PAD_HI=51;
const TOM_OFF=[3,3,1,0]; // fills descendants : tom aigu (B1), médium (A1), grave (G#1)
const MAP_V=2;
const ICON={
  lock:'<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"><rect x="3.5" y="7" width="9" height="6.5" rx="1.5"/><path d="M5.5 7V5a2.5 2.5 0 0 1 5 0v2"/></svg>',
  mute:'<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M2.5 6h2.5l3.5-3v10l-3.5-3H2.5z"/><path d="M11 6l4 4M15 6l-4 4"/></svg>',
  rm:'<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"><path d="M4.5 4.5l7 7M11.5 4.5l-7 7"/></svg>'};
const store={get(k,d){try{const v=localStorage.getItem('kickstart.'+k);return v==null?d:JSON.parse(v)}catch(_){return d}},
  set(k,v){try{localStorage.setItem('kickstart.'+k,JSON.stringify(v))}catch(_){}}};
S.map={...DEFAULT_MAP,...store.get('map2',{})};
S.swingClip=store.get('swingClip',true);
S.listen=true;

/* ---------- échanges avec Max ---------- */
let linkDown=false;
function toMax(...a){if(JUCE)try{window.__JUCE__.backend.emitEvent('kickstart',a)}catch(_){}}
/* Pattern sérialisé : "pas_swing_swingClip/pitch.v.v.v/pitch.v.v..." (vélocités 0-127), sans les pistes coupées */
function patternString(){
  const n=steps(),rows=[];
  for(const id of IDS){if(!S.pat[id]||S.mutes.has(id))continue;
    if(id==='tom'){TOM_OFF.forEach((o,k)=>{const v=S.pat.tom.map((x,s)=>s%4===k?Math.round(x*127):0);if(v.some(Boolean))rows.push((S.map.tom+o)+'.'+v.join('.'))})}
    else rows.push(S.map[id]+'.'+S.pat[id].map(x=>Math.round(x*127)).join('.'))}
  return `${n}_${S.swing}_${S.swingClip?1:0}/`+rows.join('/')}
let pushT;
function pushPattern(){clearTimeout(pushT);pushT=setTimeout(()=>toMax('pattern',patternString()),20)}
function clipName(){return `Kickstart · ${GENRE_LABEL[S.genre]} ${S.base?'drop '+S.dropName.toLowerCase():MODE_NAME[S.mode].toLowerCase()}`}
/* Pas d'accès aux clips depuis un VST : on glisse le MIDI vers Live, ou on l'exporte en .mid */
function writeClip(){
  if(!IN_MAX){showMsg('Hors du plugin : export indisponible.',true);return}
  toMax('export',patternString(),clipName());showMsg('Export…')}
function startDrag(e){if(e.button!==0||!IN_MAX)return;e.preventDefault();showMsg('Lâche le MIDI sur une piste ou un slot de Live');toMax('dragmidi',patternString(),clipName())}
if(IN_MAX){
  bindIn('tempo',t=>{$('tempo').textContent=Math.round(t*10)/10+' bpm';S.bpm=t;updDelay()});
  bindIn('transport',s=>{$('tp').classList.toggle('on',!!s);if(!s)setNow(-1)});
  bindIn('step',s=>setNow(s%steps()));
  bindIn('status',(...a)=>{const ok=a[0]==='ok';showMsg(a.slice(1).join(' '),!ok);if(ok)flashWrite()});
}
let msgT;
function showMsg(t,err){const m=$('msg');m.textContent=t;m.classList.toggle('err',!!err);m.classList.add('show');m.title=t;
  clearTimeout(msgT);msgT=setTimeout(()=>m.classList.remove('show'),err?6000:3200)}
function flashWrite(){const w=$('write');w.classList.add('ok');setTimeout(()=>w.classList.remove('ok'),1400)}

/* ---------- son : Drum Rack dans Live, synthé de secours dans un navigateur ---------- */
function audition(id,v=.9,s=0){
  if(IN_MAX){const p=id==='tom'?S.map.tom+TOM_OFF[s%4]:S.map[id];toMax('audition',p,Math.round(v*127));return}
  initAudio();V[id](ac.currentTime+.01,v,s)}
let playing=false,timer=null,nextT=0,cur=0,queue=[],nowStep=-1;
const stepDur=()=>60/S.bpm/4;
function tick(){while(nextT<ac.currentTime+.12){const n=steps();cur%=n;
  const t=nextT+(cur%2?((S.swing-50)/50)*stepDur():0);
  for(const id in S.pat){const v=S.pat[id][cur];if(v>0&&!S.mutes.has(id))V[id](t,v,cur)}
  queue.push({s:cur,t});nextT+=stepDur();cur=(cur+1)%n}}
function draw(){if(!playing)return;while(queue.length&&queue[0].t<=ac.currentTime)setNow(queue.shift().s);requestAnimationFrame(draw)}
function togglePlay(){if(IN_MAX)return;initAudio();playing=!playing;$('play').setAttribute('aria-pressed',playing);$('play').textContent=playing?'■':'▶';
  $('tp').classList.toggle('on',playing);
  if(playing){cur=0;queue=[];nextT=ac.currentTime+.05;tick();timer=setInterval(tick,25);requestAnimationFrame(draw)}else{clearInterval(timer);setNow(-1)}}
if(!IN_MAX){$('play').hidden=false;$('tempo').textContent=S.bpm+' bpm';$('tp').title='Tempo (hors de Live)'}

/* ---------- swing et densité ---------- */
function param(el,{min,max,get,set,fmt,sens,commit,reset}){
  const pv=el.querySelector('.pv'),bar=el.querySelector('.pbar');
  el.setAttribute('aria-valuemin',min);el.setAttribute('aria-valuemax',max);
  const show=()=>{const v=get();pv.textContent=fmt(v);bar.style.width=((v-min)/(max-min)*100)+'%';el.setAttribute('aria-valuenow',v)};
  const apply=v=>{v=Math.round(Math.min(max,Math.max(min,v)));if(v!==get()){set(v);show()}};
  let drag=null,committed=get(),t;
  const done=()=>{if(get()!==committed){committed=get();commit()}};
  const later=()=>{clearTimeout(t);t=setTimeout(done,380)};
  el.addEventListener('pointerdown',e=>{drag={x:e.clientX,y:e.clientY,base:get()};committed=get();el.setPointerCapture(e.pointerId);el.classList.add('drag');e.preventDefault()});
  el.addEventListener('pointermove',e=>{if(!drag)return;apply(drag.base+((e.clientX-drag.x)-(e.clientY-drag.y))/(e.shiftKey?sens*4:sens))});
  const end=()=>{if(!drag)return;drag=null;el.classList.remove('drag');done()};
  el.addEventListener('pointerup',end);el.addEventListener('pointercancel',end);
  el.addEventListener('wheel',e=>{e.preventDefault();apply(get()+(e.deltaY<0?1:-1)*(e.shiftKey?5:1));later()},{passive:false});
  el.addEventListener('keydown',e=>{const k={ArrowUp:1,ArrowRight:1,ArrowDown:-1,ArrowLeft:-1}[e.key];if(!k)return;e.preventDefault();e.stopPropagation();apply(get()+k*(e.shiftKey?10:1));later()});
  el.addEventListener('dblclick',()=>{apply(reset());later()});
  show();return show}
const showSwing=param($('pSwing'),{min:50,max:75,sens:5,get:()=>S.swing,set:v=>{S.swing=v},fmt:v=>v+'%',reset:()=>GENRE_DEF[S.genre].swing,commit:()=>{pushPattern();touchRecent()}});
const showDens=param($('pDens'),{min:0,max:100,sens:2,get:()=>Math.round(S.dens*100),set:v=>{S.dens=v/100},fmt:v=>String(v),reset:()=>60,commit:()=>generate()});

/* ---------- style, type, longueur ---------- */
const modesEl=$('modes'),barsEl=$('bars'),sgrid=$('sgrid');
MODES.forEach(([m,name],i)=>{const b=document.createElement('button');b.className='key';b.dataset.v=m;b.setAttribute('role','radio');
  b.title=`${name} (${i+1})`;b.innerHTML=`<span class="l"></span>${name}`;b.onclick=()=>setMode(m);modesEl.appendChild(b)});
[1,2,3,4].forEach(n=>{const b=document.createElement('button');b.className='bar';b.textContent=n;b.setAttribute('role','radio');
  b.setAttribute('aria-label',`${n} mesure${n>1?'s':''}`);b.onclick=()=>setBeats(n*4);b.onpointerenter=()=>previewBars(n);barsEl.appendChild(b)});
barsEl.onpointerleave=()=>previewBars(0);
function previewBars(n){[...barsEl.children].forEach((b,i)=>b.classList.toggle('pre',i<n));$('lentxt').textContent=`${(n||S.beats/4)*4} temps`}
GENRE_ORDER.forEach(g=>{const b=document.createElement('button');b.className='sopt';b.dataset.v=g;b.setAttribute('role','radio');
  b.innerHTML=`${GENRE_LABEL[g]}<small>${GENRE_DEF[g].bpm}</small>`;b.onclick=()=>{setGenre(g);closeOv()};sgrid.appendChild(b)});
$('sName').onclick=()=>openOv('ovStyle');
$('sPrev').onclick=()=>stepGenre(-1);$('sNext').onclick=()=>stepGenre(1);
function stepGenre(d){const i=GENRE_ORDER.indexOf(S.genre);setGenre(GENRE_ORDER[(i+d+GENRE_ORDER.length)%GENRE_ORDER.length])}
function setGenre(g){if(g===S.genre)return;S.genre=g;const d=GENRE_DEF[g];S.swing=d.swing;if(!IN_MAX){S.bpm=d.bpm;$('tempo').textContent=S.bpm+' bpm'}updDelay();showSwing();generate()}
function setMode(m){S.mode=m;generate()}
function setBeats(b){if(b===S.beats)return;S.beats=b;generate()}
function syncUI(){
  $('sName').textContent=GENRE_LABEL[S.genre];$('sName').title=GENRE_DEF[S.genre].desc;
  sgrid.querySelectorAll('.sopt').forEach(b=>b.setAttribute('aria-checked',b.dataset.v===S.genre));
  modesEl.querySelectorAll('.key').forEach(b=>b.setAttribute('aria-checked',b.dataset.v===S.mode));
  [...barsEl.children].forEach((b,i)=>{b.classList.toggle('on',i<S.beats/4);b.setAttribute('aria-checked',(i+1)*4===S.beats)});
  $('lentxt').textContent=`${S.beats} temps`;
  document.body.dataset.mode=S.base?'drop':S.mode;
}

/* ---------- panneaux ---------- */
let openId=null;
function openOv(id){closeOv();openId=id;$(id).hidden=false;if(id==='ovKit')renderKitOv();if(id==='ovSet')renderSetOv()}
function closeOv(){if(openId)$(openId).hidden=true;openId=null}
document.querySelectorAll('[data-close]').forEach(b=>b.onclick=closeOv);
$('kitBtn').onclick=()=>openId==='ovKit'?closeOv():openOv('ovKit');
$('setBtn').onclick=()=>openId==='ovSet'?closeOv():openOv('ovSet');

const GROUP_NAMES=['Fondations','Métaux','Secoués','Peaux'];
function renderKitOv(){
  const pr=$('presets');pr.innerHTML='';const cur=IDS.filter(id=>S.kit.has(id)).join(',');
  Object.entries(PRESETS).forEach(([name,ids])=>{const b=document.createElement('button');b.className='pre';b.textContent=name;
    b.setAttribute('aria-pressed',ids.join(',')===cur);b.onclick=()=>{S.kit=new Set(ids);rebuildKit();renderKitOv()};pr.appendChild(b)});
  const kg=$('kgrid');kg.innerHTML='';
  GROUP_NAMES.forEach((gn,gi)=>{kg.insertAdjacentHTML('beforeend',`<span class="lab">${gn}</span>`);const ch=document.createElement('div');ch.className='chips';
    TRACKS.filter(t=>t.g===gi).forEach(t=>{const b=document.createElement('button');b.className='chip';b.textContent=t.name;b.setAttribute('aria-pressed',S.kit.has(t.id));
      b.onclick=()=>{const on=!S.kit.has(t.id);on?S.kit.add(t.id):(S.kit.delete(t.id),S.locks.delete(t.id));rebuildKit();renderKitOv();if(on)audition(t.id,.8)};ch.appendChild(b)});
    kg.appendChild(ch)})}
/* Réglage des notes : grille 4x4 comme le Drum Rack (C1 en bas à gauche) + liste des éléments */
let selEl=null;
function setNote(id,p){S.map[id]=Math.min(127,Math.max(0,p));store.set('map2',S.map);pushPattern();render();renderSetOv();audition(id,.8)}
function renderSetOv(){
  $('swClip').setAttribute('aria-checked',S.swingClip);
  const pads=$('pads');pads.innerHTML='';
  for(let row=3;row>=0;row--)for(let col=0;col<4;col++){
    const n=PAD_LO+row*4+col,els=TRACKS.filter(t=>S.map[t.id]===n||(t.id==='tom'&&TOM_OFF.some(o=>S.map.tom+o===n)));
    const b=document.createElement('button');b.className='pad';b.dataset.n=n;
    if(els.length)b.classList.add('used');if(selEl&&els.some(t=>t.id===selEl))b.classList.add('sel');
    b.innerHTML=`<small>${noteName(n)}</small><span>${els.map(t=>t.short||t.name).join(' · ')||'—'}</span>`;
    b.title=selEl?`Mettre ${NAME[selEl]} sur ${noteName(n)}`:`${noteName(n)}${els.length?' : '+els.map(t=>t.name).join(', '):' (libre)'}`;
    b.onclick=()=>{if(selEl)setNote(selEl,n);else if(els[0]){selEl=els[0].id;renderSetOv();audition(els[0].id,.8)}};
    pads.appendChild(b)}
  const mg=$('mgrid');mg.innerHTML='';
  TRACKS.forEach(t=>{const out=S.map[t.id]<PAD_LO||S.map[t.id]>PAD_HI;
    const r=document.createElement('div');r.className='mrow'+(selEl===t.id?' sel':'')+(out?' out':'');
    r.innerHTML=`<button class="mname" title="Choisir, puis clique un pad">${t.name}</button><button class="step" aria-label="Note plus grave">−</button><output>${noteName(S.map[t.id])}</output><button class="step" aria-label="Note plus aiguë">+</button>`;
    const [nm,m,p]=r.querySelectorAll('button'),o=r.querySelector('output');
    nm.onclick=()=>{selEl=selEl===t.id?null:t.id;renderSetOv();if(selEl)audition(t.id,.8)};
    m.onclick=()=>setNote(t.id,S.map[t.id]-1);p.onclick=()=>setNote(t.id,S.map[t.id]+1);
    o.title=out?`Note MIDI ${S.map[t.id]} : hors des 16 pads, muette sur un Drum Rack standard`:`Note MIDI ${S.map[t.id]}`;mg.appendChild(r)});
  $('padHint').textContent=selEl?`${NAME[selEl]} : clique le pad où il doit jouer.`:'Clique un élément, puis le pad de ton Drum Rack où il doit jouer.'}
$('swClip').onclick=()=>{S.swingClip=!S.swingClip;store.set('swingClip',S.swingClip);$('swClip').setAttribute('aria-checked',S.swingClip);pushPattern()};
$('mapReset').onclick=()=>{S.map={...DEFAULT_MAP};selEl=null;store.set('map2',S.map);renderSetOv();render();pushPattern()};

/* ---------- séquenceur ---------- */
let cols=[],fresh=false;
const grid=$('grid');
function render(){
  const n=steps(),list=TRACKS.filter(t=>S.kit.has(t.id));
  const groups=new Set(list.map(t=>t.g)).size,avail=grid.parentElement.clientHeight||124;
  const rh=Math.max(9,Math.min(18,Math.floor((avail-(groups-1)*3-(list.length-1)*2)/Math.max(1,list.length))));
  document.documentElement.style.setProperty('--rh',rh+'px');
  grid.style.gridTemplateColumns=`var(--lw) repeat(${n},minmax(0,1fr))`;
  grid.innerHTML='';cols=Array.from({length:n},()=>[]);
  if(!list.length)grid.innerHTML='<p class="empty">Le kit est vide. Ouvre « Kit » pour ajouter des éléments.</p>';
  let prevG=-1;
  list.forEach(tr=>{
    const newGroup=prevG!==-1&&tr.g!==prevG;prevG=tr.g;
    const th=document.createElement('div');th.className='th'+(newGroup?' sep':'');
    const pitch=S.map[tr.id];
    th.innerHTML=`<button class="tn" title="Écouter">${tr.name}</button><span class="nt">${noteName(pitch)}</span>`+
      `<span class="tt"><button class="tb lock" title="Verrouiller : la piste ne bouge plus quand tu génères">${ICON.lock}</button><button class="tb mute" title="Couper">${ICON.mute}</button><button class="tb rm" title="Retirer du kit">${ICON.rm}</button></span>`;
    const [nm,lk,mt,rm]=th.querySelectorAll('button');
    nm.onclick=()=>audition(tr.id);
    const rowCells=[];
    const sync=()=>{lk.setAttribute('aria-pressed',S.locks.has(tr.id));mt.setAttribute('aria-pressed',S.mutes.has(tr.id));
      th.classList.toggle('locked',S.locks.has(tr.id));th.classList.toggle('muted',S.mutes.has(tr.id));
      th.querySelector('.tt').classList.toggle('keep',S.locks.has(tr.id)||S.mutes.has(tr.id));rowCells.forEach(c=>c.classList.toggle('m',S.mutes.has(tr.id)))};
    lk.onclick=()=>{S.locks.has(tr.id)?S.locks.delete(tr.id):S.locks.add(tr.id);sync();touchRecent()};
    mt.onclick=()=>{S.mutes.has(tr.id)?S.mutes.delete(tr.id):S.mutes.add(tr.id);sync();pushPattern()};
    rm.onclick=()=>{S.kit.delete(tr.id);S.locks.delete(tr.id);rebuildKit()};
    grid.appendChild(th);
    for(let s=0;s<n;s++){const c=document.createElement('div');c.className='c'+(newGroup?' sep':'');
      c.dataset.t=tr.id;c.dataset.s=s;c.style.setProperty('--col',s);
      if(s%16===0&&s)c.classList.add('gB');else if(s%4===0&&s)c.classList.add('gb');
      if(s%4===0)c.classList.add('q');
      paint(c,S.pat[tr.id][s]);cols[s].push(c);rowCells.push(c);grid.appendChild(c)}
    sync()});
  if(fresh){grid.classList.remove('fresh');void grid.offsetWidth;grid.classList.add('fresh');fresh=false;clearTimeout(render.t);render.t=setTimeout(()=>grid.classList.remove('fresh'),800)}
  $('seed').textContent='#'+String(S.seed).padStart(5,'0');
  $('back').disabled=!S.hist.length;
  const cur=IDS.filter(id=>S.kit.has(id)).join(',');
  $('kitName').textContent=(Object.entries(PRESETS).find(([,ids])=>ids.join(',')===cur)||['Perso'])[0];
  const d=$('derive');d.hidden=!S.base;if(S.base){$('dtag').textContent=`Drop ${S.dropName.toLowerCase()} · v${S.dropN}`;$('dtag').title=DROPS[S.dropFlavor].txt+` (sur ton pattern ${MODE_LABEL[S.baseMode]})`}
  syncUI();touchRecent();renderDots();pushPattern();
}
function paint(c,v){c.style.setProperty('--v',v?Math.max(.2,v).toFixed(2):0)}
function setNow(s){cols[nowStep]?.forEach(c=>c.classList.remove('now'));nowStep=s;if(s>=0)cols[s]?.forEach(c=>c.classList.add('now'))}

/* peindre en glissant sur une ligne, Maj+clic pour une note fantôme */
let painting=null;
function setCell(c,v){const id=c.dataset.t,s=+c.dataset.s;if(S.pat[id][s]===v)return;S.pat[id][s]=v;paint(c,v);if(v)audition(id,v,s)}
grid.addEventListener('pointerdown',e=>{const c=e.target.closest('.c');if(!c||e.button!==0)return;
  const id=c.dataset.t,s=+c.dataset.s,old=S.pat[id][s];const v=e.shiftKey?(old&&old<.5?0:.32):(old?0:.85);
  setCell(c,v);painting={v,row:id};e.preventDefault()});
document.addEventListener('pointermove',e=>{if(!painting)return;const el=document.elementFromPoint(e.clientX,e.clientY),c=el&&el.closest&&el.closest('.c');
  if(c&&c.dataset.t===painting.row)setCell(c,painting.v)});
document.addEventListener('pointerup',()=>{if(painting){painting=null;touchRecent();pushPattern()}});

/* ---------- boutons et clavier ---------- */
const _generate=generate;
generate=()=>{fresh=true;_generate()};
$('gen').onclick=()=>generate();
$('drop').onclick=()=>{fresh=true;tryDrop()};
$('write').addEventListener('pointerdown',startDrag);$('write').addEventListener('dblclick',writeClip);
$('orig').onclick=backToOriginal;
$('back').onclick=back;
$('play').onclick=togglePlay;
$('listen').onclick=()=>{S.listen=!S.listen;$('listen').setAttribute('aria-pressed',S.listen);toMax('live',S.listen?1:0);
  showMsg(S.listen?'Écoute dans le Drum Rack activée':'Écoute coupée : seul le clip joue')};
function back(){const h=S.hist.pop();if(!h)return;S.curId=null;Object.assign(S,h);showSwing();render()}
document.addEventListener('keydown',e=>{
  if(e.metaKey||e.ctrlKey||e.altKey)return;const k=e.key;
  if(k==='Escape'){closeOv();return}
  if(k==='g'||k==='G')generate();
  else if(k==='d'||k==='D'){fresh=true;tryDrop()}
  else if(k==='w'||k==='W'||k==='e'||k==='E')writeClip();
  else if(k==='z'||k==='Z')back();
  else if(k==='1'||k==='2'||k==='3')setMode(MODES[+k-1][0]);
  else if(k==='ArrowRight'||k==='ArrowLeft'){e.preventDefault();stepGenre(k==='ArrowRight'?1:-1)}
  else if(e.code==='Space'&&!IN_MAX){e.preventDefault();togglePlay()}
});

/* ---------- 5 derniers beats ---------- */
const RECENT_KEY='device.recent';
let recent=store.get(RECENT_KEY,[]).slice(0,5).map(e=>({...e,snap:{...e.snap,kit:new Set(e.snap.kit)}})),recentN=Math.max(0,...recent.map(e=>e.id));
S.curId=null;
function entryOf(){return{snap:snapshot(),swing:S.swing,locks:[...S.locks],mutes:[...S.mutes]}}
function saveRecent(){store.set(RECENT_KEY,recent.map(e=>({...e,snap:{...e.snap,kit:[...e.snap.kit]}})))}
function record(){const e=entryOf();e.id=++recentN;S.curId=e.id;recent.unshift(e);recent=recent.slice(0,5);saveRecent();renderDots();pushState()}
function touchRecent(){pushState();const i=recent.findIndex(e=>e.id===S.curId);if(i<0)return;const e=entryOf();e.id=S.curId;recent[i]=e;saveRecent()}
function restore(id){const e=recent.find(x=>x.id===id);if(!e||id===S.curId)return;pushHist();const h=e.snap;
  Object.assign(S,{pat:copyPat(h.pat),sig:{...h.sig},seed:h.seed,beats:h.beats,genre:h.genre,mode:h.mode,kit:new Set(h.kit),
    base:h.base&&copyPat(h.base),baseMode:h.baseMode,dropName:h.dropName,dropN:h.dropN,dropFlavor:h.dropFlavor,dropSeed:h.dropSeed,
    swing:e.swing,locks:new Set(e.locks),mutes:new Set(e.mutes||[])});
  showSwing();S.curId=id;render()}
function renderDots(){const el=$('hdots');el.innerHTML='';
  recent.slice().reverse().forEach(e=>{const h=e.snap,b=document.createElement('button');b.className='hdot';b.dataset.m=h.base?'drop':h.mode;
    b.title=`${GENRE_LABEL[h.genre]} · ${h.base?'drop '+h.dropName.toLowerCase():MODE_NAME[h.mode].toLowerCase()} · ${h.beats} temps`;
    b.setAttribute('aria-label',b.title);b.setAttribute('aria-pressed',e.id===S.curId);b.onclick=()=>restore(e.id);el.appendChild(b)})}

/* ---------- état sauvegardé avec le set Live (par instance du plugin) ---------- */
const ser=e=>({...e,snap:{...e.snap,kit:[...e.snap.kit]}});
const des=e=>({...e,snap:{...e.snap,kit:new Set(e.snap.kit)}});
function exportState(){const e=entryOf();e.id=S.curId;return JSON.stringify({v:1,cur:ser(e),recent:recent.map(ser),map:S.map,mapV:MAP_V,swingClip:S.swingClip,dens:S.dens,listen:S.listen})}
let stT;function pushState(){if(!JUCE)return;clearTimeout(stT);stT=setTimeout(()=>toMax('state',exportState()),250)}
bindIn('restore',json=>{let o;try{o=JSON.parse(json)}catch(_){return}if(!o||!o.cur)return;
  recent=(o.recent||[]).slice(0,5).map(des);recentN=Math.max(0,...recent.map(e=>e.id||0));
  if(o.map&&o.mapV===MAP_V)S.map={...DEFAULT_MAP,...o.map};S.swingClip=o.swingClip!==false;
  if(o.dens!=null){S.dens=o.dens;showDens()}
  if(o.listen===false){S.listen=false;$('listen').setAttribute('aria-pressed','false');toMax('live',0)}
  const e=des(o.cur),h=e.snap;
  Object.assign(S,{pat:copyPat(h.pat),sig:{...h.sig},seed:h.seed,beats:h.beats,genre:h.genre,mode:h.mode,kit:new Set(h.kit),
    base:h.base&&copyPat(h.base),baseMode:h.baseMode,dropName:h.dropName,dropN:h.dropN,dropFlavor:h.dropFlavor,dropSeed:h.dropSeed,
    swing:e.swing,locks:new Set(e.locks||[]),mutes:new Set(e.mutes||[])});
  S.curId=e.id;showSwing();render()});
bindIn('dragdone',()=>flashWrite());

/* ---------- démarrage ---------- */
if(recent.length){S.curId=-1;restore(recent[0].id)}
else{S.seed=Math.floor(Math.random()*99999);fresh=true;build(false);record()}
toMax('ready');toMax('live',1);
