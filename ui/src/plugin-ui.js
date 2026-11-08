
/* ================= interface ================= */
const $=id=>document.getElementById(id);
/* Lien avec le plugin JUCE (WebView) : événements "kickstart" dans les deux sens */
const JUCE=!!(window.__JUCE__&&window.__JUCE__.backend);
const IN_PLUGIN=JUCE;
const handlers={};
function bindIn(n,f){handlers[n]=f}
if(JUCE)window.__JUCE__.backend.addEventListener('kickstart',a=>{try{const arr=Array.isArray(a)?a:[];handlers[arr[0]]&&handlers[arr[0]](...arr.slice(1))}catch(e){console.error(e)}});
const GENRE_ORDER=['house','techno','afro','dubtechno','dub','garage','breaks','dnb','dubstep'];
const GENRE_LABEL={house:'House',techno:'Techno',afro:'Afro house',dubtechno:'Dub techno',dub:'Dub',garage:'UK garage',breaks:'Breakbeat',dnb:'Drum & bass',dubstep:'Dubstep'};
/* Le drop n'est pas un type : il a son bouton (S.base quand il est actif) */
const MODES=[['classic','Classique'],['surprise','Surprenant']];
const MODE_NAME={classic:'Classique',surprise:'Surprenant',drop:'Drop'};
const NOTE_N=['C','C#','D','D#','E','F','F#','G','G#','A','A#','B'];
const noteName=p=>NOTE_N[p%12]+(Math.floor(p/12)-2);
/* Notes par défaut : 2 banques de 16 pads d'un Drum Rack. Banque 1 (C1 à D#2, rangée comme les kits d'Ableton) :
   C1 kick · C#1 rim · D1 snare · D#1 clap · E1/F1/G1 congas · F#1 hat fermé · G#1/A1/B1 toms · A#1 hat ouvert · C2 cowbell
   · C#2 tambourin · D2 shaker · D#2 ride. Banque 2 (E2 à G3) : crash, rimshot, snap, clave, woodblock, hat pédale. */
const DEFAULT_MAP={k:36,rim:37,sn:38,cp:39,pl:40,pm:41,ch:42,ph:43,tl:44,tm:45,oh:46,th:47,cb:48,tamb:49,shk:50,ride:51,
  cr:52,rs:53,snap:54,clv:55,wb:56,hp:57};
/* Racks prêts à l'emploi : une note par instrument. « silent » : instruments sans sample dans ce kit, rangés sur des notes
   sans pad pour ne pas jouer un mauvais son. Pour en ajouter un, copier une entrée et changer les notes (les 22 ids). */
const RACK_PRESETS=[
  {name:'Par défaut',desc:'Disposition des kits Ableton, banque 2 pour les derniers venus',map:DEFAULT_MAP,silent:[]},
  {name:'909 Core Kit',desc:'Core Kit 909 d\'Ableton : kick C1, rim C#1, snare D1, clap D#1, hats F#1 et A#1, toms G#1 à B1, crash C2, ride D2',
   map:{k:36,rim:37,sn:38,cp:39,ch:42,tl:44,tm:45,oh:46,th:47,cr:48,ride:50,
        snap:52,rs:53,cb:54,shk:55,tamb:56,hp:57,clv:58,wb:59,pl:60,pm:61,ph:62},
   silent:['snap','rs','cb','shk','tamb','hp','clv','wb','pl','pm','ph']}];
const sameMap=m=>IDS.every(id=>S.map[id]===m[id]);
const rackPresetName=()=>(RACK_PRESETS.find(p=>sameMap({...DEFAULT_MAP,...p.map}))||{name:'Perso'}).name;
const TRACK=Object.fromEntries(TRACKS.map(t=>[t.id,t]));
const PAD_LO=36;
const BANKS=[['C1 – D#2',0],['E2 – G3',1]];
const MAP_V=3; // un état sauvegardé avec un autre mapping est ignoré au chargement
const ICON={
  lock:'<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"><rect x="3.5" y="7" width="9" height="6.5" rx="1.5"/><path d="M5.5 7V5a2.5 2.5 0 0 1 5 0v2"/></svg>',
  mute:'<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M2.5 6h2.5l3.5-3v10l-3.5-3H2.5z"/><path d="M11 6l4 4M15 6l-4 4"/></svg>',
  chev:'<svg viewBox="0 0 10 10" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M2 3.5 5 6.5l3-3"/></svg>'};
const store={get(k,d){try{const v=localStorage.getItem('kickstart.'+k);return v==null?d:JSON.parse(v)}catch(_){return d}},
  set(k,v){try{localStorage.setItem('kickstart.'+k,JSON.stringify(v))}catch(_){}}};
S.map={...DEFAULT_MAP,...store.get('map3',{})};
S.swingClip=store.get('swingClip',true);
S.listen=true;
S.bank=0;
const sameSet=(a,b)=>a.length===b.length&&a.every(x=>b.includes(x));
const curKit=()=>IDS.filter(id=>S.kit.has(id));
const presetOf=()=>Object.entries(PRESETS).find(([,ids])=>sameSet(ids,curKit()));

/* ---------- échanges avec le plugin ---------- */
function toMax(...a){if(JUCE)try{window.__JUCE__.backend.emitEvent('kickstart',a)}catch(_){}}
/* Pattern sérialisé : "pas_swing_swingClip/pitch.v.v.v/pitch.v.v..." (vélocités 0-127), sans les pistes coupées */
function patternString(){
  const n=steps(),rows=[];
  for(const id of IDS){if(!S.pat[id]||S.mutes.has(id))continue;
    rows.push(S.map[id]+'.'+S.pat[id].map(x=>Math.round(x*127)).join('.'))}
  return `${n}_${S.swing}_${S.swingClip?1:0}/`+rows.join('/')}
let pushT;
function pushPattern(){clearTimeout(pushT);pushT=setTimeout(()=>toMax('pattern',patternString()),20)}
const modeKey=h=>h.base?(h.derived==='break'?'break':'drop'):h.mode; // couleur d'accent : type, drop ou breakdown
const derivedLabel=h=>`${DERIVED_NAME[h.derived||'drop'].toLowerCase()} ${h.dropName.toLowerCase()}`;
function clipName(){return `Kickstart · ${GENRE_LABEL[S.genre]} ${S.base?derivedLabel(S):MODE_NAME[S.mode].toLowerCase()}`}
/* Pas d'accès aux clips depuis un VST : on glisse le MIDI vers Live, ou on l'exporte en .mid */
function writeClip(){
  if(!IN_PLUGIN){showMsg('Hors du plugin : export indisponible.',true);return}
  toMax('export',patternString(),clipName());showMsg('Export…')}
function startMidiDrag(e){if(e.button!==0||!IN_PLUGIN)return;e.preventDefault();showMsg('Lâche le MIDI sur une piste ou un slot de Live');toMax('dragmidi',patternString(),clipName())}
if(IN_PLUGIN){
  bindIn('tempo',t=>{$('bpm').textContent=Math.round(t*10)/10;S.bpm=t;updDelay()});
  bindIn('transport',s=>{$('tp').classList.toggle('on',!!s);if(!s)setNow(-1)});
  bindIn('step',s=>setNow(s%steps()));
  bindIn('status',(...a)=>{const ok=a[0]==='ok';showMsg(a.slice(1).join(' '),!ok);if(ok)flashWrite()});
}
let msgT;
function showMsg(t,err){const m=$('toast');m.textContent=t;m.classList.toggle('err',!!err);m.classList.add('show');m.title=t;
  clearTimeout(msgT);msgT=setTimeout(()=>m.classList.remove('show'),err?6000:2400)}
function flashWrite(){const w=$('midi');w.classList.add('ok');setTimeout(()=>w.classList.remove('ok'),1400)}

/* ---------- son : Drum Rack dans Live, synthé de secours dans un navigateur ---------- */
function audition(id,v=.9,s=0){
  if(IN_PLUGIN){toMax('audition',S.map[id],Math.round(v*127));return}
  initAudio();V[id](ac.currentTime+.01,v,s)}
let playing=false,timer=null,nextT=0,cur=0,queue=[],nowStep=-1;
const stepDur=()=>60/S.bpm/4;
function tick(){while(nextT<ac.currentTime+.12){const n=steps();cur%=n;
  const t=nextT+(cur%2?((S.swing-50)/50)*stepDur():0);
  for(const id in S.pat){const v=S.pat[id][cur];if(v>0&&!S.mutes.has(id))V[id](t,v,cur)}
  queue.push({s:cur,t});nextT+=stepDur();cur=(cur+1)%n}}
function draw(){if(!playing)return;while(queue.length&&queue[0].t<=ac.currentTime)setNow(queue.shift().s);requestAnimationFrame(draw)}
function togglePlay(){if(IN_PLUGIN)return;initAudio();playing=!playing;$('play').setAttribute('aria-pressed',playing);
  $('tp').classList.toggle('on',playing);
  if(playing){cur=0;queue=[];nextT=ac.currentTime+.05;tick();timer=setInterval(tick,25);requestAnimationFrame(draw)}else{clearInterval(timer);setNow(-1)}}
if(!IN_PLUGIN){$('play').hidden=false;$('bpm').textContent=S.bpm;$('tp').title='Tempo (hors de Live)'}

/* ---------- bande de réglages : type, longueur, swing, densité ---------- */
const typesEl=$('types');
MODES.forEach(([m,name],i)=>{const b=document.createElement('button');b.dataset.v=m;b.setAttribute('role','radio');b.title=`${name} (${i+1})`;b.textContent=name;b.onclick=()=>setMode(m);typesEl.appendChild(b)});
function buildLen(){const m=$('lenMenu');m.innerHTML='';
  [1,2,3,4].forEach(n=>{const b=document.createElement('button');b.className='mi';b.setAttribute('role','option');b.setAttribute('aria-checked',n*4===S.beats);
    b.innerHTML=`${n} mesure${n>1?'s':''}<small>${n*4} temps</small>`;b.onclick=e=>{e.stopPropagation();closeLen();setBeats(n*4)};m.appendChild(b)})}
function closeLen(){$('lenMenu').hidden=true;$('lenBtn').setAttribute('aria-expanded','false')}
$('lenBtn').onclick=e=>{e.stopPropagation();const open=$('lenMenu').hidden;if(open){closePick();closeRack();buildLen();$('lenMenu').hidden=false}else closeLen();$('lenBtn').setAttribute('aria-expanded',open)};
/* Boîte de valeur : glisser, molette, flèches ; double-clic remet la valeur par défaut ; « commit » au relâchement */
function vbox(host,label,{min,max,get,set,fmt,reset,tip,commit}){
  const f=document.createElement('div');f.className='fld';
  f.innerHTML=`<span class="lab">${label}</span><div class="vb" tabindex="0" role="slider" aria-label="${label}" title="${tip}"><span class="pv"></span><i class="pbar"></i></div>`;
  const el=f.querySelector('.vb'),pv=f.querySelector('.pv'),bar=f.querySelector('.pbar');
  el.setAttribute('aria-valuemin',min);el.setAttribute('aria-valuemax',max);
  const show=()=>{const v=get();pv.textContent=fmt(v);bar.style.width=((v-min)/(max-min)*100)+'%';el.setAttribute('aria-valuenow',v)};
  const apply=v=>{v=Math.round(Math.min(max,Math.max(min,v)));if(v!==get()){set(v);show()}};
  let drag=null,committed=get(),t;
  const done=()=>{if(get()!==committed){committed=get();commit()}};
  const later=()=>{clearTimeout(t);t=setTimeout(done,380)};
  el.addEventListener('pointerdown',e=>{drag={x:e.clientX,y:e.clientY,b:get()};committed=get();el.setPointerCapture(e.pointerId);el.classList.add('drag');e.preventDefault()});
  el.addEventListener('pointermove',e=>{if(drag)apply(drag.b+((e.clientX-drag.x)-(e.clientY-drag.y))*(max-min)/(e.shiftKey?500:100))});
  const end=()=>{if(!drag)return;drag=null;el.classList.remove('drag');done()};
  el.addEventListener('pointerup',end);el.addEventListener('pointercancel',end);
  el.addEventListener('wheel',e=>{e.preventDefault();apply(get()+(e.deltaY<0?1:-1)*(e.shiftKey?5:1));later()},{passive:false});
  el.addEventListener('keydown',e=>{const k={ArrowUp:1,ArrowRight:1,ArrowDown:-1,ArrowLeft:-1}[e.key];if(!k)return;e.preventDefault();e.stopPropagation();apply(get()+k*(e.shiftKey?10:1));later()});
  el.addEventListener('dblclick',()=>{apply(reset());later()});
  f.show=show;show();host.replaceWith(f);return f}
const vSw=vbox($('fSwing'),'Swing',{min:50,max:75,get:()=>S.swing,set:v=>{S.swing=v},fmt:v=>v+'%',reset:()=>GENRE_DEF[S.genre].swing,
  tip:'Glisse ou molette. Double-clic : swing du style.',commit:()=>{pushPattern();touchRecent()}});
const vDe=vbox($('fDens'),'Densité',{min:0,max:100,get:()=>Math.round(S.dens*100),set:v=>{S.dens=v/100},fmt:v=>String(v),reset:()=>60,
  tip:'Glisse ou molette. Régénère au relâchement. Double-clic : 60.',commit:()=>generate()});
const vDy=vbox($('fDyn'),'Dynamique',{min:0,max:100,get:()=>Math.round(S.dyn*100),set:v=>{S.dyn=v/100},fmt:v=>String(v),reset:()=>50,
  tip:'Accents sur les temps et variations de vélocité. Régénère au relâchement. Double-clic : 50.',commit:()=>generate()});
const showSwing=()=>vSw.show(),showDens=()=>vDe.show(),showDyn=()=>vDy.show();

function setGenre(g){if(g===S.genre)return;S.genre=g;const d=GENRE_DEF[g];S.swing=d.swing;if(!IN_PLUGIN){S.bpm=d.bpm;$('bpm').textContent=S.bpm}updDelay();showSwing();generate()}
function stepGenre(d){const i=GENRE_ORDER.indexOf(S.genre);setGenre(GENRE_ORDER[(i+d+GENRE_ORDER.length)%GENRE_ORDER.length])}
function setMode(m){if(m===S.mode&&!S.base)return;S.mode=m;generate()}
function setBeats(b){if(b===S.beats)return;S.beats=b;generate()}
function syncUI(){
  $('styles').querySelectorAll('.sty').forEach(b=>b.setAttribute('aria-checked',b.dataset.v===S.genre));
  typesEl.querySelectorAll('button').forEach(b=>b.setAttribute('aria-checked',b.dataset.v===S.mode));
  $('lenTxt').textContent=`${S.beats/4} mesure${S.beats>4?'s':''}`;
  $('seed').textContent='#'+String(S.seed).padStart(5,'0');
  $('desc').textContent=`${GENRE_LABEL[S.genre]} · ${S.base?DERIVED_NAME[S.derived||'drop']:MODE_NAME[S.mode]} · ${S.beats} temps`;
  const pn=presetOf();$('kitName').textContent=pn?pn[0]:'Perso';
  const d=$('derive');d.hidden=!S.base;
  if(S.base){$('dtag').textContent=`${DERIVED_NAME[S.derived||'drop']} ${S.dropName.toLowerCase()} · v${S.dropN}`;$('dtag').title=DER()[S.dropFlavor].txt+` (sur ton pattern ${MODE_LABEL[S.baseMode]})`}
  $('back').disabled=!S.hist.length;
  showSwing();showDens();showDyn();
  document.body.dataset.mode=modeKey(S);
}

/* ---------- onglet Style & kit ---------- */
GENRE_ORDER.forEach(g=>{const b=document.createElement('button');b.className='tile sty';b.dataset.v=g;b.setAttribute('role','radio');
  b.title=GENRE_DEF[g].desc;b.innerHTML=`<small>${GENRE_DEF[g].bpm} bpm</small><b>${GENRE_LABEL[g]}</b>`;b.onclick=()=>setGenre(g);$('styles').appendChild(b)});
function setTab(t){closeLen();closePick();closeRack();document.querySelectorAll('.tab').forEach(b=>b.setAttribute('aria-selected',b.dataset.tab===t));
  $('vSeq').hidden=t!=='seq';$('vStyle').hidden=t!=='style';if(t==='style')renderKit()}
document.querySelectorAll('.tab').forEach(b=>b.onclick=()=>setTab(b.dataset.tab));
$('kitLink').onclick=()=>setTab('style');$('beatbar').onclick=()=>setTab('style');
function renderKit(){
  const pr=$('presets');pr.innerHTML='';const c=curKit();
  Object.entries(PRESETS).forEach(([name,ids])=>{const b=document.createElement('button');b.className='pre';b.textContent=name;
    b.setAttribute('aria-pressed',sameSet(ids,c));b.onclick=()=>{S.kit=new Set(ids);S.locks.forEach(id=>{if(!S.kit.has(id))S.locks.delete(id)});rebuildKit();renderKit()};pr.appendChild(b)});
  const kg=$('kgrid');kg.innerHTML='';
  GROUPS.forEach((gn,gi)=>{kg.insertAdjacentHTML('beforeend',`<span class="lab">${gn}</span>`);const ch=document.createElement('div');ch.className='chips';
    TRACKS.filter(t=>t.g===gi).forEach(t=>{const b=document.createElement('button');b.className='chip';b.style.setProperty('--c',t.c);b.textContent=t.name;b.setAttribute('aria-pressed',S.kit.has(t.id));
      b.onclick=()=>{const on=!S.kit.has(t.id);on?S.kit.add(t.id):(S.kit.delete(t.id),S.locks.delete(t.id));rebuildKit();renderKit();if(on)audition(t.id,.8)};ch.appendChild(b)});
    kg.appendChild(ch)})}

/* ---------- Rack : 2 banques de 16 pads, instruments du kit seulement ---------- */
BANKS.forEach(([t,b])=>{const x=document.createElement('button');x.textContent=t;x.dataset.b=b;x.setAttribute('role','radio');x.onclick=()=>{closePick();S.bank=b;renderRack()};$('banks').appendChild(x)});
function pel(id){const b=document.createElement('span');b.className='pel';b.dataset.id=id;b.style.setProperty('--c',TRACK[id].c);b.title='Glisser vers un autre pad';
  b.textContent=NAME[id];b.addEventListener('pointerdown',e=>startDrag(e,b));return b}
function renderRack(){
  const pg=$('pgrid');pg.innerHTML='';
  $('banks').querySelectorAll('button').forEach(x=>x.setAttribute('aria-checked',+x.dataset.b===S.bank));
  $('rackTxt').textContent=rackPresetName();
  for(let i=0;i<16;i++){const n=PAD_LO+S.bank*16+i,els=TRACKS.filter(t=>S.map[t.id]===n&&S.kit.has(t.id)).map(t=>t.id);
    const p=document.createElement('div');p.dataset.n=n;p.className='mp'+(els.length?'':' free');
    p.innerHTML=`<small>${noteName(n)}</small><div class="slot"></div>`;
    els.forEach(id=>p.querySelector('.slot').appendChild(pel(id)));
    const g=document.createElement('button');g.className='chg';g.title="Changer l'instrument de ce pad";g.setAttribute('aria-label',`Changer l'instrument du pad ${noteName(n)}`);
    g.innerHTML=ICON.chev;g.onclick=e=>{e.stopPropagation();openPick(p,n,i)};p.appendChild(g);
    p.onclick=e=>{if(e.target.closest('.chg,.pel')||!els.length)return;flashPad(n);audition(els[0],.8)};
    pg.appendChild(p)}}
function flashPad(n){const p=document.querySelector(`.mp[data-n="${n}"]`);if(!p)return;p.classList.remove('hit');void p.offsetWidth;p.classList.add('hit')}
function hl(n,on){const p=document.querySelector(`.mp[data-n="${n}"]`);if(p)p.classList.toggle('hl',on)}
/* Poser un instrument sur un pad : l'occupant prend la place laissée libre. S'il n'était pas dans le kit, il y entre. */
function moveEl(id,n){
  const old=S.map[id],added=!S.kit.has(id);if(n===old&&!added)return;
  if(n!==old)TRACKS.forEach(t=>{if(t.id!==id&&S.map[t.id]===n)S.map[t.id]=old});
  S.map[id]=n;store.set('map3',S.map);
  showMsg(`${NAME[id]} → ${noteName(n)}${added?' · ajouté au kit':''}`);
  if(added){S.kit.add(id);rebuildKit()}else render()}
function closePick(){document.querySelectorAll('.pick').forEach(m=>m.remove())}
function openPick(p,n,i){
  const had=p.querySelector('.pick');closePick();closeLen();closeRack();if(had)return;
  const m=document.createElement('div');m.className='menu pick'+(i%8>=5?' r':'');m.onclick=e=>e.stopPropagation();
  TRACKS.forEach(t=>{const b=document.createElement('button');b.className='mi';const inKit=S.kit.has(t.id);
    b.setAttribute('aria-checked',S.map[t.id]===n&&inKit);if(!inKit)b.style.opacity='.6';
    b.innerHTML=`<span style="color:${t.c}">${t.name}</span><small>${inKit?noteName(S.map[t.id]):'hors kit'}</small>`;
    b.onclick=()=>{closePick();moveEl(t.id,n)};m.appendChild(b)});
  p.appendChild(m)}
document.addEventListener('click',()=>{closePick();closeLen();closeRack()});
/* Glisser un instrument d'un pad à l'autre (événements pointeur : pas de drag HTML5, qui gênerait le glisser du MIDI) */
function startDrag(e,src){
  if(e.button!==0)return;e.preventDefault();e.stopPropagation();const id=src.dataset.id;let moved=false,ghost=null,over=null;const x0=e.clientX,y0=e.clientY;
  const move=ev=>{if(!moved&&Math.hypot(ev.clientX-x0,ev.clientY-y0)<4)return;
    if(!moved){moved=true;closePick();ghost=src.cloneNode(true);ghost.classList.add('ghost');document.body.appendChild(ghost);src.classList.add('src')}
    ghost.style.left=ev.clientX+'px';ghost.style.top=ev.clientY+'px';
    const t=document.elementFromPoint(ev.clientX,ev.clientY),p=t&&t.closest&&t.closest('.mp');
    if(over!==p){over&&over.classList.remove('over');over=p;over&&over.classList.add('over')}};
  const up=()=>{document.removeEventListener('pointermove',move);document.removeEventListener('pointerup',up);document.removeEventListener('pointercancel',up);
    ghost&&ghost.remove();src.classList.remove('src');
    if(!moved){flashPad(S.map[id]);audition(id,.8);return}
    over&&over.classList.remove('over');
    if(over)moveEl(id,+over.dataset.n);else renderRack()};
  document.addEventListener('pointermove',move);document.addEventListener('pointerup',up);document.addEventListener('pointercancel',up)}
/* menu des presets de Rack */
function closeRack(){$('rackMenu').hidden=true;$('rackBtn').setAttribute('aria-expanded','false')}
function applyRack(p){
  S.map={...DEFAULT_MAP,...p.map};store.set('map3',S.map);S.bank=0;
  const miss=(p.silent||[]).filter(id=>S.kit.has(id)).map(id=>NAME[id]);
  showMsg(miss.length?`${p.name} appliqué · pas de sample pour : ${miss.join(', ')}`:`${p.name} appliqué`);render()}
$('rackBtn').onclick=e=>{e.stopPropagation();const open=$('rackMenu').hidden;closePick();closeLen();
  if(open){const m=$('rackMenu');m.innerHTML='';const cur=rackPresetName();
    RACK_PRESETS.forEach(p=>{const b=document.createElement('button');b.className='mi';b.setAttribute('role','option');b.setAttribute('aria-checked',p.name===cur);b.title=p.desc;
      b.innerHTML=`${p.name}<small>${p.silent.length?p.silent.length+' sans sample':'tous les sons'}</small>`;b.onclick=ev=>{ev.stopPropagation();closeRack();applyRack(p)};m.appendChild(b)});
    m.hidden=false}else closeRack();
  $('rackBtn').setAttribute('aria-expanded',open)};
$('swClip').onclick=()=>{S.swingClip=!S.swingClip;store.set('swingClip',S.swingClip);$('swClip').setAttribute('aria-checked',S.swingClip);pushPattern()};

/* ---------- séquenceur ---------- */
let cols=[],fresh=false;
const grid=$('grid');
const BAR_LETTERS={1:'A',2:'AB',3:'AAB',4:'ABAB'};
function render(){
  const n=steps(),list=TRACKS.filter(t=>S.kit.has(t.id)),col=`172px repeat(${n},minmax(0,1fr))`,letters=BAR_LETTERS[S.beats/4];
  const ru=$('ruler');ru.style.gridTemplateColumns=col;ru.innerHTML='<span></span>';
  for(let s=0;s<n;s++){const sp=document.createElement('span');
    if(s%16===0){sp.className='bn';sp.textContent=letters[s/16];if(s)sp.style.marginLeft='10px'}
    else if(s%4===0){sp.textContent=(s%16)/4+1;sp.style.marginLeft='3px'}
    ru.appendChild(sp)}
  grid.innerHTML='';cols=Array.from({length:n},()=>[]);
  if(!list.length)grid.innerHTML='<p class="empty">Le kit est vide. Ouvre « Style & kit » pour ajouter des instruments.</p>';
  let prevG=-1;
  list.forEach(tr=>{
    if(prevG!==-1&&tr.g!==prevG){const sp=document.createElement('div');sp.className='gsep';grid.appendChild(sp)}
    prevG=tr.g;
    const rw=document.createElement('div');rw.className='rw';rw.style.gridTemplateColumns=col;
    const th=document.createElement('div');th.className='th';th.style.setProperty('--c',tr.c);
    th.onmouseenter=()=>hl(S.map[tr.id],true);th.onmouseleave=()=>hl(S.map[tr.id],false);
    th.innerHTML=`<button class="tn" title="Écouter">${tr.name}</button><span class="nt">${noteName(S.map[tr.id])}</span>`+
      `<button class="tb lock" title="Verrouiller : la piste ne bouge plus quand tu génères" aria-label="Verrouiller ${tr.name}">${ICON.lock}</button>`+
      `<button class="tb mute" title="Couper" aria-label="Couper ${tr.name}">${ICON.mute}</button>`;
    const [nm,lk,mt]=th.querySelectorAll('button'),rowCells=[];
    nm.onclick=()=>audition(tr.id);
    const sync=()=>{lk.setAttribute('aria-pressed',S.locks.has(tr.id));mt.setAttribute('aria-pressed',S.mutes.has(tr.id));rw.classList.toggle('muted',S.mutes.has(tr.id))};
    lk.onclick=()=>{S.locks.has(tr.id)?S.locks.delete(tr.id):S.locks.add(tr.id);sync();touchRecent()};
    mt.onclick=()=>{S.mutes.has(tr.id)?S.mutes.delete(tr.id):S.mutes.add(tr.id);sync();pushPattern()};
    rw.appendChild(th);
    for(let s=0;s<n;s++){const c=document.createElement('div');c.className='c';c.dataset.t=tr.id;c.dataset.s=s;c.style.setProperty('--col',s);
      if(s%4===0)c.classList.add('q');
      if(s%16===0&&s)c.classList.add('gB');else if(s%4===0&&s)c.classList.add('gb');
      paint(c,S.pat[tr.id][s]);cols[s].push(c);rowCells.push(c);rw.appendChild(c)}
    sync();grid.appendChild(rw)});
  if(fresh){grid.classList.remove('fresh');void grid.offsetWidth;grid.classList.add('fresh');fresh=false;clearTimeout(render.t);render.t=setTimeout(()=>grid.classList.remove('fresh'),800)}
  syncUI();renderRack();touchRecent();renderDots();pushPattern();
}
function paint(c,v){c.style.setProperty('--v',v?(.22+.78*v).toFixed(2):0)} // la luminosité suit la vélocité
function setNow(s){cols[nowStep]?.forEach(c=>c.classList.remove('now'));nowStep=s;
  if(s>=0){cols[s]?.forEach(c=>c.classList.add('now'));
    for(const id of IDS)if(S.kit.has(id)&&!S.mutes.has(id)&&S.pat[id]&&S.pat[id][s]>0)flashPad(S.map[id])}}

/* peindre en glissant sur une ligne, Maj+clic pour une note fantôme */
let painting=null;
function setCell(c,v){const id=c.dataset.t,s=+c.dataset.s;if(S.pat[id][s]===v)return;S.pat[id][s]=v;paint(c,v);if(v)audition(id,v,s)}
grid.addEventListener('pointerdown',e=>{const c=e.target.closest('.c');if(!c||e.button!==0)return;
  const id=c.dataset.t,s=+c.dataset.s,old=S.pat[id][s];const v=e.shiftKey?(old&&old<.5?0:.32):(old?0:.85);
  setCell(c,v);painting={v,row:id};e.preventDefault()});
document.addEventListener('pointermove',e=>{if(!painting)return;const el=document.elementFromPoint(e.clientX,e.clientY),c=el&&el.closest&&el.closest('.c');
  if(c&&c.dataset.t===painting.row)setCell(c,painting.v)});
document.addEventListener('pointerup',()=>{if(painting){painting=null;touchRecent();pushPattern()}});
/* molette sur une note allumée : ajuste sa vélocité (sur une case vide, la liste défile normalement) */
let wheelT;
grid.addEventListener('wheel',e=>{const c=e.target.closest('.c');if(!c)return;
  const id=c.dataset.t,s=+c.dataset.s,v=S.pat[id][s];if(!v)return;e.preventDefault();
  const nv=Math.min(1,Math.max(.12,v+(e.deltaY<0?1:-1)*(e.shiftKey?.02:.07)));S.pat[id][s]=nv;paint(c,nv);
  clearTimeout(wheelT);wheelT=setTimeout(()=>{audition(id,nv,s);touchRecent();pushPattern()},250)},{passive:false});

/* ---------- boutons et clavier ---------- */
const _generate=generate;
generate=()=>{fresh=true;_generate()};
$('gen').onclick=()=>{setTab('seq');generate()};
$('drop').onclick=()=>{setTab('seq');fresh=true;tryDrop()};
$('brk').onclick=()=>{setTab('seq');fresh=true;tryBreak()};
$('midi').addEventListener('pointerdown',startMidiDrag);$('midi').addEventListener('dblclick',writeClip);
$('orig').onclick=backToOriginal;
$('back').onclick=back;
$('play').onclick=togglePlay;
$('listen').onclick=()=>{S.listen=!S.listen;$('listen').setAttribute('aria-pressed',S.listen);toMax('live',S.listen?1:0);
  showMsg(S.listen?'Écoute dans le Drum Rack activée':'Écoute coupée : seul le clip joue')};
function back(){const h=S.hist.pop();if(!h)return;S.curId=null;Object.assign(S,h);showSwing();render()}
document.addEventListener('keydown',e=>{
  if(e.metaKey||e.ctrlKey||e.altKey)return;const k=e.key;
  if(k==='Escape'){closePick();closeLen();closeRack();return}
  if(e.target.closest&&e.target.closest('.vb'))return;
  if(k==='g'||k==='G'){setTab('seq');generate()}
  else if(k==='d'||k==='D'){setTab('seq');fresh=true;tryDrop()}
  else if(k==='b'||k==='B'){setTab('seq');fresh=true;tryBreak()}
  else if(k==='w'||k==='W'||k==='e'||k==='E')writeClip();
  else if(k==='z'||k==='Z')back();
  else if(k==='1'||k==='2')setMode(MODES[+k-1][0]);
  else if(k==='ArrowRight'||k==='ArrowLeft'){e.preventDefault();stepGenre(k==='ArrowRight'?1:-1)}
  else if(e.code==='Space'&&!IN_PLUGIN){e.preventDefault();togglePlay()}
});

/* ---------- 5 derniers beats ---------- */
const RECENT_KEY='device.recent2';
const des=e=>({...e,snap:{...e.snap,kit:new Set(e.snap.kit)}});
const ser=e=>({...e,snap:{...e.snap,kit:[...e.snap.kit]}});
let recent=store.get(RECENT_KEY,[]).slice(0,5).map(des),recentN=Math.max(0,...recent.map(e=>e.id));
S.curId=null;
function entryOf(){return{snap:snapshot(),swing:S.swing,locks:[...S.locks],mutes:[...S.mutes]}}
function saveRecent(){store.set(RECENT_KEY,recent.map(ser))}
function record(){const e=entryOf();e.id=++recentN;S.curId=e.id;recent.unshift(e);recent=recent.slice(0,5);saveRecent();renderDots();pushState()}
function touchRecent(){pushState();const i=recent.findIndex(e=>e.id===S.curId);if(i<0)return;const e=entryOf();e.id=S.curId;recent[i]=e;saveRecent()}
function applyEntry(e){const h=e.snap;
  Object.assign(S,{pat:copyPat(h.pat),sig:{...h.sig},seed:h.seed,beats:h.beats,genre:h.genre,mode:h.mode,kit:new Set(h.kit),
    base:h.base&&copyPat(h.base),baseMode:h.baseMode,dropName:h.dropName,dropN:h.dropN,dropFlavor:h.dropFlavor,dropSeed:h.dropSeed,
    derived:h.base?(h.derived||'drop'):'',swing:e.swing,locks:new Set(e.locks||[]),mutes:new Set(e.mutes||[])})}
function restore(id){const e=recent.find(x=>x.id===id);if(!e||id===S.curId)return;pushHist();applyEntry(e);showSwing();S.curId=id;render()}
function renderDots(){const el=$('hdots');el.innerHTML='';
  recent.slice().reverse().forEach(e=>{const h=e.snap,b=document.createElement('button');b.className='hdot';b.dataset.m=modeKey(h);
    b.title=`${GENRE_LABEL[h.genre]} · ${h.base?derivedLabel(h):MODE_NAME[h.mode].toLowerCase()} · ${h.beats} temps`;
    b.setAttribute('aria-label',b.title);b.setAttribute('aria-pressed',e.id===S.curId);b.onclick=()=>restore(e.id);el.appendChild(b)})}

/* ---------- état sauvegardé avec le set Live (par instance du plugin) ---------- */
function exportState(){const e=entryOf();e.id=S.curId;return JSON.stringify({v:2,cur:ser(e),recent:recent.map(ser),map:S.map,mapV:MAP_V,swingClip:S.swingClip,dens:S.dens,dyn:S.dyn,listen:S.listen})}
let stT;function pushState(){if(!JUCE)return;clearTimeout(stT);stT=setTimeout(()=>toMax('state',exportState()),250)}
bindIn('restore',json=>{let o;try{o=JSON.parse(json)}catch(_){return}if(!o||o.v!==2||!o.cur)return; // un état d'avant la refonte est ignoré
  recent=(o.recent||[]).slice(0,5).map(des);recentN=Math.max(0,...recent.map(e=>e.id||0));
  if(o.map&&o.mapV===MAP_V){S.map={...DEFAULT_MAP,...o.map};store.set('map3',S.map)}
  S.swingClip=o.swingClip!==false;$('swClip').setAttribute('aria-checked',S.swingClip);
  if(o.dens!=null){S.dens=o.dens;showDens()}
  if(o.dyn!=null){S.dyn=o.dyn;showDyn()}
  if(o.listen===false){S.listen=false;$('listen').setAttribute('aria-pressed','false');toMax('live',0)}
  const e=des(o.cur);applyEntry(e);S.curId=e.id;showSwing();render()});
bindIn('dragdone',()=>flashWrite());

/* ---------- démarrage ---------- */
$('swClip').setAttribute('aria-checked',S.swingClip);
if(recent.length){S.curId=-1;restore(recent[0].id)}
else{S.seed=Math.floor(Math.random()*99999);fresh=true;build(false);record()}
toMax('ready');toMax('live',1);
