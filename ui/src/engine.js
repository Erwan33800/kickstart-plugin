
/* Pistes affichables, dans l'ordre du séquenceur */
/* 22 instruments, groupés (g) et colorés (c). Les groupes se suivent : l'ordre de la liste est l'ordre du séquenceur */
const TRACKS=[
  {id:'k',name:'Kick',g:0,c:'#ff5d73'},{id:'sn',name:'Snare',g:0,c:'#44c2f7'},{id:'cp',name:'Clap',g:0,c:'#7b93ff'},
  {id:'snap',name:'Snap',g:0,c:'#8ad0ff'},{id:'rim',name:'Rim',g:0,c:'#b48cff'},{id:'rs',name:'Rimshot',g:0,c:'#8f7bff'},
  {id:'ch',name:'Hat fermé',g:1,c:'#e8d44d'},{id:'hp',name:'Hat pédale',g:1,c:'#d9c84a'},{id:'oh',name:'Hat ouvert',g:1,c:'#f2a93b'},
  {id:'ride',name:'Ride',g:1,c:'#3fd6b0'},{id:'cr',name:'Crash',g:1,c:'#ffe9a8'},{id:'cb',name:'Cowbell',g:1,c:'#ff8a4c'},
  {id:'shk',name:'Shaker',g:2,c:'#93d95a'},{id:'tamb',name:'Tambourin',g:2,c:'#c9e04f'},
  {id:'clv',name:'Clave',g:3,c:'#b9e07a'},{id:'wb',name:'Woodblock',g:3,c:'#8fc98a'},
  {id:'pl',name:'Conga grave',g:4,c:'#ff7ab8'},{id:'pm',name:'Conga médium',g:4,c:'#f08fd0'},{id:'ph',name:'Conga aiguë',g:4,c:'#e0a0f0'},
  {id:'th',name:'Tom aigu',g:4,c:'#e9c48a'},{id:'tm',name:'Tom médium',g:4,c:'#d9a06a'},{id:'tl',name:'Tom grave',g:4,c:'#c47f58'}];
const GROUPS=['Fondations','Métaux','Secoués','Bois','Peaux'];
const IDS=TRACKS.map(t=>t.id);
const NAME=Object.fromEntries(TRACKS.map(t=>[t.id,t.name]));
/* Si une piste du pattern n'est pas dans le kit, son rôle passe à la première piste dispo de la liste.
   Crash, snap, clave et woodblock n'ont pas de remplaçant : sans eux, ils ne jouent pas. */
const FALLBACK={k:['k'],sn:['sn','cp','rim'],cp:['cp','sn','rim'],snap:['snap'],rim:['rim'],rs:['rs','rim'],
  ch:['ch','hp','shk','tamb'],hp:['hp','ch'],oh:['oh','ride'],ride:['ride'],cr:['cr'],cb:['cb'],shk:['shk'],tamb:['tamb'],
  clv:['clv'],wb:['wb'],pl:['pl'],pm:['pm','ph','pl'],ph:['ph'],th:['th','tm','tl'],tm:['tm','th','tl'],tl:['tl','tm','th']};
const PRESETS={
  'Essentiel':['k','sn','cp','ch','oh','rim'],
  'Groove house':['k','cp','snap','ch','oh','shk','rim','pm','ph'],
  'Latin':['k','cp','ch','cb','shk','pl','pm','ph','tamb','clv','wb'],
  'Dub':['k','sn','rim','rs','ch','hp','oh','ride','pm','tl'],
  'Breaks':['k','sn','ch','oh','ride','rim','th','tm','tl'],
  'Tout':IDS};
/* Par style : tempo, swing, delay dub, kick (durée, attaque), et la colonne vertébrale utilisée par « Tenter un drop » */
const GENRE_DEF={
  house:    {bpm:124,swing:54,wet:0, dub:0,kick:[.42,165],dk:[0,4,8,12],back:[4,12],doh:[2,6,10,14],desc:"House : kick sur chaque temps, clap sur 2 et 4, hats ouverts sur les contretemps."},
  techno:   {bpm:130,swing:50,wet:0, dub:0,kick:[.5,150], dk:[0,4,8,12],back:[4,12],doh:[2,6,10,14],desc:"Techno : grille droite sans swing, hats mécaniques, percs répétitives."},
  afro:     {bpm:122,swing:56,wet:0, dub:0,kick:[.45,160],dk:[0,4,8,12],back:[4,12],doh:[2,6,10,14],desc:"Afro house : four-on-the-floor léger, rims en 3-3-2, congas et shakers au premier plan."},
  dubtechno:{bpm:122,swing:57,wet:1, dub:1,kick:[.6,165], dk:[0,4,8,12],back:[4,12],doh:[2,6,10,14],desc:"Dub techno : kick rond, rims et percs dans le delay, hats feutrés."},
  dub:      {bpm:76, swing:62,wet:1, dub:1,kick:[.6,165], dk:[0,4,8,12],back:[8],      doh:[14],         desc:"Dub : one drop (kick et rim sur le 3) en classique, rockers et steppers ensuite."},
  garage:   {bpm:132,swing:62,wet:0, dub:0,kick:[.35,170],dk:[0,10],    back:[4,12],doh:[2,6,10,14],desc:"UK garage : 2-step, kick sur le 1 et juste avant le 3, gros shuffle sur les hats."},
  breaks:   {bpm:130,swing:54,wet:0, dub:0,kick:[.38,170],dk:[0,10],    back:[4,12],doh:[6,14],     desc:"Breakbeat : kick cassé, snare forte sur 2 et 4, ghost notes entre les deux."},
  dnb:      {bpm:174,swing:52,wet:0, dub:0,kick:[.28,180],dk:[0,10],    back:[4,12],doh:[14],       desc:"Drum & bass : two-step (kick 1 et 3 et demi, snare 2 et 4), ghost snares, ride rapide."},
  dubstep:  {bpm:140,swing:52,wet:.6,dub:1,kick:[.5,160], dk:[0,10],    back:[8],      doh:[14],         desc:"Dubstep : halftime, une seule snare lourde sur le 3, kicks placés autour."}};
const HINTS={
  classic:"Classique : le groove attendu du style, propre et stable. La base sûre pour poser une idée.",
  surprise:"Surprenant : kicks déplacés, motifs euclidiens, placements en 3-3-2. Ça reste dansant mais ça accroche l'oreille.",
  drop:"Drop : tout le monde joue, hats ouverts pleins, et la dernière mesure monte en roulement pour relancer la boucle."};

const S={genre:'house',mode:'classic',beats:8,bpm:124,swing:54,dens:.6,seed:0,pat:{},sig:{},
  kit:new Set(PRESETS['Groove house']),locks:new Set(),mutes:new Set(),hist:[],
  base:null,baseMode:'',dropName:'',dropN:0,lastFlavor:-1};
const copyPat=p=>Object.fromEntries(Object.entries(p).map(([k,v])=>[k,v.slice()]));
function snapshot(){return{pat:copyPat(S.pat),sig:{...S.sig},seed:S.seed,beats:S.beats,genre:S.genre,mode:S.mode,kit:new Set(S.kit),
  base:S.base&&copyPat(S.base),baseMode:S.baseMode,dropName:S.dropName,dropN:S.dropN,dropFlavor:S.dropFlavor,dropSeed:S.dropSeed}}
function pushHist(){if(Object.keys(S.pat).length){S.hist.push(snapshot());if(S.hist.length>30)S.hist.shift()}}
const steps=()=>S.beats*4;
const active=()=>IDS.filter(id=>S.kit.has(id));

/* ---------- génération ---------- */
function mulberry(a){return()=>{a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}
const E=()=>Object.fromEntries(IDS.map(id=>[id,Array(16).fill(0)]));
const set=(b,id,arr,v)=>arr.forEach(s=>b[id][s]=v);
const euclid=(k,n,rot=0)=>Array.from({length:n},(_,i)=>(((i+rot)*k)%n)<k);
const clone=b=>Object.fromEntries(IDS.map(id=>[id,b[id].slice()]));
const each=(e,fn)=>{for(let s=0;s<16;s++)if(e[s%e.length])fn(s)};

/* Recettes de base : kick, snare, clap, hats, rim et conga médium (la perc d'origine) */
const R={
 house:{
  classic(c){const b=E();set(b,'k',[0,4,8,12],1);set(b,'cp',[4,12],.95);if(c.maybe(.3))set(b,'sn',[12],.55);
    if(c.r()<.6){set(b,'oh',[2,6,10,14],.75);for(let s=0;s<16;s++)if(s%4!==2&&c.maybe(.5))b.ch[s]=s%4===0?.5:.32}
    else{for(let s=0;s<16;s++){if(s%4===2)b.ch[s]=.8;else if(c.maybe(.45))b.ch[s]=s%2?.3:.42}if(c.maybe(.5))b.oh[c.pick([6,14])]=.6}
    const n=c.maybe(.6)?2:1;for(let i=0;i<n;i++)b.rim[c.pick([3,7,10,11,13])]=.6;
    if(c.maybe(.6))each(euclid(3,8,c.int(8)),s=>b.pm[s]=.45);return b},
  surprise(c){const b=E();set(b,'k',[0,4,8,12],1);const v=c.int(3);
    if(v===0){b.k[8]=0;b.k[7]=.9;b.k[10]=.6}else if(v===1)b.k[10]=.75;else{b.k[14]=.65;if(c.maybe(.5))b.k[15]=.5}
    set(b,'cp',[4,12],.9);b.cp[c.pick([7,9,11,15])]=.5;
    each(euclid(7,16,c.int(16)),s=>b.ch[s]=s%4===2?.75:.48);
    set(b,'oh',c.pick([[2,10],[6,14],[14],[3,11]]),.62);
    each(euclid(5,16,c.int(16)),s=>b.rim[s]=.55);
    if(c.maybe(.8))each(euclid(3,8,c.int(8)),s=>b.pm[s]=s<8?.55:.4);
    for(let s=0;s<16;s++)if(!b.cp[s]&&s%2&&c.maybe(.08))b.sn[s]=.3;return b},
  drop(c){const b=E();set(b,'k',[0,4,8,12],1);set(b,'cp',[4,12],1);set(b,'sn',[4,12],.7);set(b,'oh',[2,6,10,14],.9);
    for(let s=0;s<16;s++)if(s%4!==2&&c.maybe(.85))b.ch[s]=s%2?.4:.55;
    set(b,'rim',c.pick([[3,11],[7,15],[3,7,11,15]]),.65);
    if(c.maybe(.7))each(euclid(5,16,c.int(16)),s=>b.pm[s]=.55);return b}},
 dubtechno:{
  classic(c){const b=E();set(b,'k',[0,4,8,12],.9);
    if(c.r()<.6)set(b,'sn',[4,12],.5);else set(b,'rim',[4,12],.55);
    for(let s=0;s<16;s++){if(s%4===2)b.ch[s]=.65;else if(c.maybe(.6))b.ch[s]=.22}
    if(c.maybe(.35))set(b,'oh',[2,6,10,14],.4);
    c.pick([[3,10],[3,6,10],[3,10,13],[6,14]]).forEach(s=>{b.rim[s]=Math.max(b.rim[s],.6)});
    if(c.maybe(.4))b.pm[14]=.4;return b},
  surprise(c){const b=E();set(b,'k',[0,4,8,12],.9);if(c.maybe(.6))b.k[c.pick([6,11,14])]=.5;
    for(let s=0;s<16;s++)if(s%3===0)b.ch[s]=.62;else if(c.maybe(.55))b.ch[s]=.24;
    set(b,'oh',c.pick([[2,10],[6],[10,14]]),.5);
    each(euclid(3,8,c.int(8)),s=>b.rim[s]=.55);
    if(c.maybe(.7))each(euclid(5,16,c.int(16)),s=>b.pm[s]=.4);
    if(c.maybe(.5))b.sn[12]=.45;return b},
  drop(c){const b=E();set(b,'k',[0,4,8,12],1);set(b,'cp',[4,12],.85);
    for(let s=0;s<16;s++)b.ch[s]=s%4===2?.75:(c.maybe(.8)?.42:0);
    set(b,'oh',[2,6,10,14],.7);set(b,'rim',c.pick([[3,7,10,14],[3,10]]),.6);
    each(euclid(7,16,c.int(16)),s=>b.pm[s]=.45);return b}},
 dub:{
  classic(c){const b=E();b.k[8]=1;b.rim[8]=.9;
    for(let s=0;s<16;s+=2)b.ch[s]=s%4===2?.6:.38;
    for(let s=1;s<16;s+=2)if(c.maybe(.15))b.ch[s]=.22;
    if(c.maybe(.5))b.oh[14]=.5;
    for(let s=1;s<16;s+=2)if(s!==8&&c.maybe(.1))b.sn[s]=.25;
    if(c.maybe(.5))b.pm[c.pick([6,10])]=.45;return b},
  surprise(c){const b=E();set(b,'k',[0,8],1);if(c.maybe(.6))b.k[c.pick([6,10,11,14])]=.7;
    b.sn[8]=.85;set(b,'rim',c.pick([[4,12],[3,6,11],[6,14]]),.55);
    for(let s=0;s<16;s++){if(s%4===2)b.ch[s]=.65;else if(c.maybe(.5))b.ch[s]=.28}
    const o=c.pick([[6],[14],[]]);set(b,'oh',o,.55);o.forEach(s=>b.ch[s]=0);
    if(c.maybe(.6))each(euclid(3,8,c.int(8)),s=>b.pm[s]=.5);return b},
  drop(c){const b=E();set(b,'k',[0,4,8,12],1);b.sn[8]=.95;set(b,'rim',[4,12],.5);
    for(let s=0;s<16;s++)b.ch[s]=s%4===2?.7:.4;b.oh[14]=.6;b.ch[14]=0;
    each(euclid(5,16,c.int(16)),s=>b.pm[s]=.5);return b}}
};

/* ---- styles ajoutés ---- */
const FOUR=[0,4,8,12],OFF=[2,6,10,14];
Object.assign(R,{
 techno:{
  classic(c){const b=E();set(b,'k',FOUR,1);
    if(c.r()<.5)set(b,'ch',OFF,.65);else for(let s=0;s<16;s++)b.ch[s]=s%4===2?.7:(c.maybe(.6)?.3:0);
    if(c.maybe(.5)){set(b,'oh',OFF,.55);OFF.forEach(s=>b.ch[s]=0)}
    if(c.maybe(.6))set(b,'cp',[4,12],.7);else set(b,'rim',[4,12],.55);
    if(c.maybe(.6))c.pick([[3,11],[6,14],[3,10]]).forEach(s=>b.rim[s]=.5);
    if(c.maybe(.35))each(euclid(3,8,c.int(8)),s=>b.pm[s]=.4);return b},
  surprise(c){const b=E();set(b,'k',FOUR,1);b.k[c.pick([14,15,3])]=.55;
    each(euclid(3,8,c.int(8)),s=>b.ch[s]=.6);set(b,'oh',c.pick([[2,10],[6,14],[10]]),.55);
    each(euclid(5,16,c.int(16)),s=>b.rim[s]=.5);each(euclid(7,16,c.int(16)),s=>b.pm[s]=.35);
    if(c.maybe(.6))b.cp[12]=.7;return b},
  drop(c){const b=E();set(b,'k',FOUR,1);set(b,'cp',[4,12],.9);set(b,'sn',[4,12],.6);
    for(let s=0;s<16;s++)b.ch[s]=s%2?.32:.5;set(b,'oh',OFF,.85);OFF.forEach(s=>b.ch[s]=0);
    each(euclid(5,16,c.int(16)),s=>b.rim[s]=.5);return b}},
 afro:{
  classic(c){const b=E();set(b,'k',FOUR,.95);set(b,'rim',c.pick([[3,6,10],[3,10,13],[2,7,10,15]]),.55);
    if(c.maybe(.5))set(b,'cp',[4,12],.6);set(b,'ch',OFF,.55);if(c.maybe(.3))b.oh[14]=.5;
    each(euclid(5,16,c.int(16)),s=>b.pm[s]=.5);return b},
  surprise(c){const b=E();set(b,'k',FOUR,.95);if(c.maybe(.5))b.k[c.pick([7,14])]=.5;
    each(euclid(7,16,c.int(16)),s=>b.rim[s]=.5);each(euclid(5,8,c.int(8)),s=>b.ch[s]=s%4===2?.6:.35);
    b.cp[12]=.65;each(euclid(3,8,c.int(8)),s=>b.pm[s]=.5);return b},
  drop(c){const b=E();set(b,'k',FOUR,1);set(b,'cp',[4,12],.85);
    for(let s=0;s<16;s++)b.ch[s]=s%4===2?0:(c.maybe(.7)?.4:0);set(b,'oh',OFF,.7);
    each(euclid(7,16,c.int(16)),s=>b.rim[s]=.5);each(euclid(7,16,c.int(16)),s=>b.pm[s]=.55);return b}},
 garage:{
  classic(c){const b=E();set(b,'k',[0,10],1);if(c.maybe(.4))b.k[c.pick([3,7,13])]=.6;
    set(b,'cp',[4,12],.9);if(c.maybe(.4))set(b,'sn',[4,12],.55);
    for(let s=0;s<16;s++)b.ch[s]=s%4===2?.7:(c.maybe(.55)?.3:0);
    if(c.maybe(.4)){set(b,'oh',[6,14],.5);[6,14].forEach(s=>b.ch[s]=0)}
    set(b,'rim',c.pick([[7,15],[3,11],[11]]),.5);if(c.maybe(.35))b.pm[c.pick([5,13])]=.4;return b},
  surprise(c){const b=E();set(b,'k',c.pick([[0,3,10],[0,7,11],[0,10,13]]),1);
    set(b,'cp',[4,12],.9);set(b,'sn',c.pick([[7],[15],[7,15],[13]]),.35);
    each(euclid(11,16,c.int(16)),s=>b.ch[s]=s%4===2?.7:.32);set(b,'oh',c.pick([[2],[10],[6,14]]),.5);
    each(euclid(5,16,c.int(16)),s=>b.rim[s]=.5);each(euclid(3,8,c.int(8)),s=>b.pm[s]=.4);return b},
  drop(c){const b=E();set(b,'k',c.r()<.5?FOUR:[0,7,10],1);set(b,'cp',[4,12],1);set(b,'sn',[4,12],.7);
    for(let s=0;s<16;s++)b.ch[s]=s%2?.35:.5;set(b,'oh',OFF,.8);OFF.forEach(s=>b.ch[s]=0);
    set(b,'rim',[7,15],.5);each(euclid(5,16,c.int(16)),s=>b.pm[s]=.45);return b}},
 breaks:{
  classic(c){const b=E();set(b,'k',[0,10],1);if(c.maybe(.5))b.k[c.pick([2,7,11])]=.7;set(b,'sn',[4,12],1);
    for(let s=0;s<16;s+=2)b.ch[s]=s%4===0?.5:.42;for(let s=1;s<16;s+=2)if(c.maybe(.25))b.ch[s]=.25;
    if(c.maybe(.5)){b.oh[14]=.5;b.ch[14]=0}[7,9].forEach(s=>{if(c.maybe(.35))b.sn[s]=.28});
    if(c.maybe(.4))b.rim[c.pick([3,11])]=.5;return b},
  surprise(c){const b=E();set(b,'k',c.pick([[0,3,10],[0,6,10,11],[0,2,7,10]]),1);set(b,'sn',[4,12],1);
    b.sn[c.pick([9,15,7])]=.32;each(euclid(9,16,c.int(16)),s=>b.ch[s]=s%2?.3:.5);
    const o=c.pick([[6],[14],[2,10]]);set(b,'oh',o,.5);o.forEach(s=>b.ch[s]=0);
    each(euclid(3,8,c.int(8)),s=>b.rim[s]=.45);if(c.maybe(.6))each(euclid(5,16,c.int(16)),s=>b.pm[s]=.4);return b},
  drop(c){const b=E();set(b,'k',[0,10],1);if(c.maybe(.6))b.k[7]=.75;set(b,'sn',[4,12],1);set(b,'cp',[4,12],.8);
    for(let s=0;s<16;s++)b.ch[s]=s%2?.32:.5;set(b,'oh',[6,14],.65);[6,14].forEach(s=>b.ch[s]=0);
    set(b,'rim',[3,11],.5);return b}},
 dnb:{
  classic(c){const b=E();set(b,'k',[0,10],1);if(c.maybe(.4))b.k[c.pick([2,11,13])]=.7;set(b,'sn',[4,12],1);
    if(c.maybe(.4))set(b,'cp',[4,12],.6);
    for(let s=0;s<16;s+=2)b.ch[s]=s%4===2?.6:.45;for(let s=1;s<16;s+=2)if(c.maybe(.3))b.ch[s]=.25;
    if(c.maybe(.5)){const o=c.pick([6,14]);b.oh[o]=.5;b.ch[o]=0}
    [7,9,15].forEach(s=>{if(c.maybe(.4))b.sn[s]=.28});
    if(c.maybe(.5))set(b,'rim',c.pick([[3,11],[6],[14]]),.5);
    if(c.maybe(.3))each(euclid(3,8,c.int(8)),s=>b.pm[s]=.4);return b},
  surprise(c){const b=E();
    if(c.r()<.5){set(b,'k',[0,2,10,11],1);set(b,'sn',[4,12],1);set(b,'sn',[7,9,15],.4)}
    else{set(b,'k',[0,10,13],1);set(b,'sn',[4,12],1);set(b,'sn',[3,9],.3)}
    if(c.maybe(.5))for(let s=0;s<16;s+=2)b.ride[s]=.45;else each(euclid(9,16,c.int(16)),s=>b.ch[s]=s%2?.28:.5);
    each(euclid(3,8,c.int(8)),s=>b.rim[s]=.45);if(c.maybe(.6))each(euclid(5,16,c.int(16)),s=>b.pm[s]=.4);return b},
  drop(c){const b=E();set(b,'k',[0,10],1);if(c.maybe(.5))b.k[7]=.7;set(b,'sn',[4,12],1);set(b,'cp',[4,12],.8);
    for(let s=0;s<16;s++)if(c.maybe(.9))b.ch[s]=s%2?.3:.55;b.oh[14]=.6;b.ch[14]=0;
    set(b,'rim',[3,11],.5);if(c.maybe(.6))each(euclid(7,16,c.int(16)),s=>b.pm[s]=.45);return b}},
 dubstep:{
  classic(c){const b=E();b.k[0]=1;if(c.maybe(.6))b.k[c.pick([10,11,3])]=.8;b.sn[8]=1;if(c.maybe(.5))b.cp[8]=.7;
    for(let s=0;s<16;s+=2)b.ch[s]=s%4===0?.5:.4;if(c.maybe(.5)){b.oh[14]=.5;b.ch[14]=0}
    set(b,'rim',c.pick([[4],[12],[6,14]]),.45);if(c.maybe(.4))each(euclid(3,8,c.int(8)),s=>b.pm[s]=.4);return b},
  surprise(c){const b=E();set(b,'k',c.pick([[0,6,11],[0,3,10],[0,10,11]]),1);b.sn[8]=1;
    set(b,'sn',c.pick([[14],[5,13],[15]]),.3);each(euclid(6,16,c.int(16)),s=>b.ch[s]=.45);
    for(let s=12;s<16;s++)if(c.maybe(.5))b.ch[s]=.3+.08*(s-12);
    each(euclid(3,8,c.int(8)),s=>b.rim[s]=.45);each(euclid(5,16,c.int(16)),s=>b.pm[s]=.4);return b},
  drop(c){const b=E();set(b,'k',[0,10],1);if(c.maybe(.5))b.k[3]=.7;b.sn[8]=1;b.cp[8]=.9;
    for(let s=0;s<16;s++)b.ch[s]=s<8?(s%2?0:.45):(s%2?.3:.5);b.oh[14]=.6;b.ch[14]=0;
    set(b,'rim',[4,12],.5);each(euclid(5,16,c.int(16)),s=>b.pm[s]=.45);return b}}
});

/* Éléments additionnels : ride, cowbell, shaker, tambourin, congas grave/aiguë, toms, puis snap, rimshot, hat pédale, clave, woodblock */
const CONGA_LH=["......h.......h.","...h...l...h..l.","..h.h.....h.l...",".h....l..h....l.","..h...h...h.l.h."];
function extras(b,c){
  const G=S.genre,M=S.mode,dub=GENRE_DEF[G].dub;
  // ride
  if(M==='classic'){if(!dub)set(b,'ride',c.pick([[2,6,10,14],[0,4,8,12]]),.45);
    else for(let s=0;s<16;s+=2)b.ride[s]=s%4===2?.5:.32}
  else if(M==='surprise'){const e=euclid(5,8,c.int(8));for(let i=0;i<8;i++)if(e[i])b.ride[i*2]=.45;if(c.maybe(.5))b.ride[c.pick([3,11,15])]=.35}
  else for(let s=0;s<16;s+=2)b.ride[s]=s%4===2?.6:.45;
  // cowbell
  if(M==='classic')set(b,'cb',c.pick(dub?[[3,10],[6,14],[10]]:[[2,10],[6,14],[3,10],[7,14]]),.5);
  else if(M==='surprise'){each(euclid(3,8,c.int(8)),s=>b.cb[s]=s<8?.55:.42);if(c.maybe(.4))b.cb[c.pick([5,13])]=.35}
  else{if(c.r()<.5)set(b,'cb',[2,6,10,14],.55);else each(euclid(5,16,c.int(16)),s=>b.cb[s]=.5)}
  // shaker
  if(M==='classic'){for(let s=0;s<16;s++)if(c.maybe(.9))b.shk[s]=s%2?.38:.22}
  else if(M==='surprise')each(euclid(11,16,c.int(16)),s=>b.shk[s]=s%4===2?.45:.28);
  else for(let s=0;s<16;s++)b.shk[s]=s%2?.5:.3;
  // tambourin
  if(M==='classic'){if(c.r()<.5)set(b,'tamb',GENRE_DEF[G].back,.5);else set(b,'tamb',[2,6,10,14],.42)}
  else if(M==='surprise')each(euclid(3,8,c.int(8)),s=>b.tamb[s]=.45);
  else{set(b,'tamb',[2,6,10,14],.55);set(b,'tamb',[3,11],.32)}
  // congas grave et aiguë (la médium vient de la recette)
  if(M==='classic'){[...c.pick(CONGA_LH)].forEach((ch,s)=>{if(ch!=='.'&&c.maybe(.9))b[ch==='l'?'pl':'ph'][s]=ch==='l'?.6:.55})}
  else if(M==='surprise'){each(euclid(5,16,c.int(16)),s=>{b[c.r()<.4?'pl':'ph'][s]=.55});if(c.maybe(.5))b.ph[c.pick([7,15])]=.35}
  else each(euclid(7,16,c.int(16)),s=>{b[s%4===0?'pl':'ph'][s]=s%4===0?.65:.55});
  // toms : peu dans le groove, surtout dans les fills
  if(M==='surprise'&&c.maybe(.35))b[c.pick(['th','tm','tl'])][c.pick([7,14])]=.5;
  if(dub&&M==='classic'&&c.maybe(.25))b.tl[15]=.45;
  // les derniers venus sont tirés après les autres : les motifs précédents ne changent pas. Le crash est posé dans build().
  const afro=G==='afro',loose=G==='dub'||G==='dubstep'||G==='breaks',back=GENRE_DEF[G].back;
  // snap : double le clap en house, afro et garage
  if(G==='house'||afro||G==='garage'){
    if(M==='classic'){if(c.maybe(.45))set(b,'snap',back,.55)}
    else if(M==='surprise'){if(c.maybe(.5))b.snap[c.pick([7,15])]=.5}
    else set(b,'snap',back,.7)}
  else if(c.maybe(.1))b.snap[c.pick(back)]=.4;
  // rimshot : surtout dans les styles à delay
  if(dub){
    if(M==='classic'){if(c.maybe(.5))set(b,'rs',c.pick([[14],[6,14],[11]]),.5)}
    else if(M==='surprise')each(euclid(3,8,c.int(8)),s=>b.rs[s]=.5);
    else set(b,'rs',[4,12],.55)}
  else if(c.maybe(.15))b.rs[c.pick([7,15])]=.4;
  // hat pédale : petits coups entre les hats en dub, dubstep et breakbeat
  if(loose){
    if(M==='classic'){for(let s=1;s<16;s+=2)if(c.maybe(.4))b.hp[s]=.3}
    else if(M==='surprise')each(euclid(5,16,c.int(16)),s=>b.hp[s]=.32);
    else for(let s=1;s<16;s+=2)b.hp[s]=.35}
  else if(c.maybe(.15))b.hp[c.pick([7,15])]=.3;
  // clave (3-2 ou rumba) et woodblock : l'afro house
  if(afro)set(b,'clv',M==='surprise'?[0,3,7,10,12]:[0,3,6,10,12],M==='drop'?.7:.6);
  else if(M==='surprise'&&c.maybe(.2))each(euclid(5,16,c.int(16)),s=>b.clv[s]=.4);
  if(afro){if(c.maybe(.6))set(b,'wb',c.pick([[2,5,9,14],[5,9,13],[2,10]]),.45)}
  else if(c.maybe(.1))b.wb[c.pick([5,13])]=.4;
  return b}

function mutate(b,c){const n=1+c.int(2);
  for(let i=0;i<n;i++){const op=c.int(5);
    if(op===0){const s=1+2*c.int(8);if(!b.oh[s])b.ch[s]=b.ch[s]?0:.3}
    else if(op===1){const hits=b.rim.map((v,s)=>v?s:-1).filter(s=>s>0);
      if(hits.length){const s=c.pick(hits),t=(s+c.pick([1,2,-1,-2])+16)%16;if(t&&!b.rim[t]){b.rim[t]=b.rim[s];b.rim[s]=0}}else b.rim[c.pick([3,7,11])]=.55}
    else if(op===2)b.pm[1+2*c.int(8)]=.42;
    else if(op===3){const s=1+2*c.int(8);b.ph[s]=b.ph[s]?0:.4;b.cb[c.pick([7,15])]=b.cb[c.pick([7,15])]||.35}
    else if(c.maybe(.6))b.k[15]=.55}
  return b}

/* Roulement de toms qui descend : aigu, médium, grave, répartis sur les pas donnés */
function tomRoll(b,ss,v){const T=['th','tm','tl'];ss.forEach((s,i)=>{const id=T[Math.min(2,Math.floor(i*3/ss.length))];b[id][s]=Math.max(b[id][s],v)})}
function fill(b,c){
  if(S.mode==='classic'){c.pick([[13,15],[14,15],[12,14,15]]).forEach((s,i)=>b.sn[s]=.45+i*.12);if(c.maybe(.5))b.oh[14]=0;
    if(c.maybe(.5))set(b,'ph',[13,14,15],.5);if(c.maybe(.4))tomRoll(b,[14,15],.6)}
  else if(S.mode==='surprise'){const e=euclid(5,8,c.int(8));
    for(let s=8;s<16;s++)if(e[s-8])b[c.pick(['pm','sn','ph'])][s]=.5+.05*(s-8);
    tomRoll(b,c.pick([[13,14,15],[12,14,15],[14,15]]),.65);
    if(c.maybe(.5)){b.k[12]=0;b.k[14]=.7}}
  else{for(let s=0;s<8;s+=2)b.sn[s]=Math.max(b.sn[s],.28+s*.03);
    for(let s=8;s<16;s++)b.sn[s]=.45+(s-8)*.075;
    tomRoll(b,[13,14,15],.8);
    if(c.maybe(.6))b.k[12]=0;b.oh[14]=0;b.ride[14]=0}
  return b}

/* Construit le pattern brut (toujours toutes les pistes, même tirage) puis le projette sur le kit choisi */
function build(newSeed){
  if(newSeed){pushHist();S.seed=Math.floor(Math.random()*99999)}
  S.base=null;S.dropN=0;
  const r=mulberry(S.seed),f=S.dens*1.6;
  const c={r,maybe:p=>r()<Math.min(1,p*f),int:n=>Math.floor(r()*n),pick:a=>a[Math.floor(r()*a.length)]};
  const A=extras(R[S.genre][S.mode](c),c),B=mutate(clone(A),c),nb=S.beats/4;
  const order={1:[A],2:[A,B],3:[A,A,B],4:[A,B,A,B]}[nb].map(clone);
  if(nb>1)fill(order[nb-1],c);
  if(c.maybe(.5)||S.mode==='drop')order[0].cr[0]=.85; // crash sur le premier temps de la boucle
  const raw=Object.fromEntries(IDS.map(id=>[id,order.flatMap(bar=>bar[id])]));
  // projection sur le kit
  const pat={},sig={},n=steps();
  active().forEach(id=>{pat[id]=Array(n).fill(0);sig[id]=[]});
  IDS.forEach(src=>{const dest=FALLBACK[src].find(t=>S.kit.has(t));if(!dest)return;
    sig[dest].push(src);raw[src].forEach((v,i)=>{if(v>pat[dest][i])pat[dest][i]=v})});
  Object.keys(sig).forEach(id=>sig[id]=sig[id].join('+'));
  // garder les pistes verrouillées, et (si on change seulement le kit) les pistes inchangées avec tes retouches
  active().forEach(id=>{const old=S.pat[id];if(!old)return;
    if(S.locks.has(id))pat[id]=Array.from({length:n},(_,i)=>old[i%old.length]);
    else if(!newSeed&&S.sig[id]===sig[id]&&old.length===n)pat[id]=old});
  S.pat=pat;S.sig=sig;render();
}
let generate=()=>{S.curId=null;build(true);record()};

/* ---------- transformer le pattern actuel en drop ---------- */
const DROPS=[
  {name:'Plein régime',txt:'tout le kit joue, backbeat doublé, roulement de snare en fin de boucle'},
  {name:'Rebond',txt:'kicks de relance, contretemps de percs, descente de toms en fin de boucle'},
  {name:'Montée',txt:'la dernière mesure monte en roulement et le kick respire avant de retomber sur le 1'}];
const MODE_LABEL={classic:'classique',surprise:'surprenant',drop:'drop'};
function tryDrop(){S.curId=null;
  let f;do{f=Math.floor(Math.random()*DROPS.length)}while(f===S.lastFlavor&&DROPS.length>1);
  S.lastFlavor=f;applyDrop(f,Math.floor(Math.random()*99999),(S.base?S.dropN:0)+1,true);record()}
function applyDrop(flavor,seed,n,push){
  if(push)pushHist();
  if(!S.base){S.base=copyPat(S.pat);S.baseMode=S.mode}
  const p=copyPat(S.base),r=mulberry(seed),maybe=x=>r()<x,pick=a=>a[Math.floor(r()*a.length)];
  const N=steps(),nb=Math.max(1,N/16),last=(nb-1)*16;
  const has=id=>!!p[id];
  const put=(id,s,v)=>{if(has(id))p[id][s]=Math.max(p[id][s],Math.min(1,v))};
  const cut=(id,s)=>{if(has(id))p[id][s]=0};
  const first=ids=>ids.find(has);
  // tout le monde un peu plus fort
  for(const id in p)p[id]=p[id].map(v=>v?Math.min(1,v*1.12+.03):0);
  // la colonne vertébrale du drop, posée par-dessus ta structure
  const back=first(['cp','sn','rim']),GD=GENRE_DEF[S.genre];
  for(let s=0;s<N;s++){const b=s%16,q=s%4;
    if(GD.dk.includes(b))put('k',s,1);
    if(GD.back.includes(b)){put(back,s,.95);if(has('cp')&&has('sn'))put('sn',s,.75)}
    if(GD.doh.includes(b)){if(has('oh')){put('oh',s,.85);cut('ch',s)}else{put('ride',s,.7);put('ch',s,.8)}}
    else if(has('ch')&&!p.ch[s]&&maybe(.65))put('ch',s,s%2?.36:.5);
    if(has('shk')&&p.shk.some(v=>v))put('shk',s,s%2?.5:.3)}
  // tes percs gardent leur motif, et le reprennent en écho une demi-mesure plus loin
  ['rim','cb','pl','pm','ph','tamb','ride'].filter(has).forEach(id=>{
    const src=p[id].slice();
    for(let s=0;s<N;s++)if(src[s]&&maybe(.45)){const t=s-s%16+((s%16)+8)%16;if(!p[id][t])p[id][t]=src[s]*.8}});
  // couleur propre à chaque drop
  const roll=(from,to,step)=>{const id=first(['sn','cp','rim']);const span=to-from;
    for(let s=from;s<to;s+=step)put(id,s,.35+.65*((s-from)/span))};
  if(flavor===0){
    for(let s=0;s<N;s++)if(s%4===2)put('tamb',s,.55);
    for(let s=0;s<N;s+=2)put('ride',s,s%4===2?.6:.42);
    nb>1?(roll(last+8,last+12,2),roll(last+12,last+16,1)):roll(12,16,1);
  }else if(flavor===1){
    const perc=first(['ph','pm','cb','pl','rim']);
    for(let bar=0;bar<nb;bar++){const o=bar*16;
      put('k',o+15,.6);if(maybe(.5))put('k',o+pick([7,10]),.7);
      for(let q=3;q<16;q+=4){if(maybe(.5))put(perc,o+q,.45);if(maybe(.4))put('ch',o+q,.55)}}
    const TM=['th','tm','tl'].filter(has);
    if(TM.length)[13,14,15].forEach((s,i)=>put(TM[Math.min(TM.length-1,Math.floor(i*TM.length/3))],last+s,.7+i*.1));
    else{const tomId=first(['pl','pm','sn']);[13,14,15].forEach((s,i)=>put(tomId,last+s,.7+i*.1))}
  }else{
    if(nb>1){roll(last,last+8,2);roll(last+8,last+16,1);
      for(let s=last+8;s<last+16;s++)cut('k',s);cut('oh',last+14);cut('ride',last+14)}
    else roll(12,16,1);
    put(first(['ride','oh','cb']),0,1);
  }
  put('cr',0,.95); // un drop démarre sur un crash
  // les pistes verrouillées ne bougent pas
  S.locks.forEach(id=>{if(S.base[id])p[id]=S.base[id].slice()});
  S.pat=p;S.dropFlavor=flavor;S.dropSeed=seed;S.dropN=n;S.dropName=DROPS[flavor].name;
  render();
}
function backToOriginal(){if(!S.base)return;S.curId=null;pushHist();S.pat=S.base;S.base=null;S.dropN=0;render()}
function rebuildKit(){
  const was=S.base?{f:S.dropFlavor,seed:S.dropSeed,n:S.dropN}:null;
  if(was)S.pat=S.base;
  build(false);
  if(was)applyDrop(was.f,was.seed,was.n,false)}
/* ---------- audio ---------- */
let ac,master,noiseBuf,send,dly,ohGain=null;
function initAudio(){
  if(ac){if(ac.state==='suspended')ac.resume();return}
  ac=new (window.AudioContext||window.webkitAudioContext)();
  const comp=ac.createDynamicsCompressor();comp.threshold.value=-12;comp.ratio.value=4;
  master=ac.createGain();master.gain.value=.7;master.connect(comp).connect(ac.destination);
  noiseBuf=ac.createBuffer(1,ac.sampleRate,ac.sampleRate);const d=noiseBuf.getChannelData(0);for(let i=0;i<d.length;i++)d[i]=Math.random()*2-1;
  send=ac.createGain();dly=ac.createDelay(2);const fb=ac.createGain(),lp=ac.createBiquadFilter();
  fb.gain.value=.45;lp.type='lowpass';lp.frequency.value=2400;
  send.connect(dly);dly.connect(lp).connect(fb).connect(dly);lp.connect(master);updDelay();
}
function updDelay(){if(dly)dly.delayTime.value=Math.min(1.9,60/S.bpm/4*3)}
function env(g,t,p,dec,att=.002){g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(Math.max(.0002,p),t+att);g.gain.exponentialRampToValueAtTime(.0001,t+dec)}
function nz(t,dur){const s=ac.createBufferSource();s.buffer=noiseBuf;s.start(t);s.stop(t+dur+.05);return s}
function filt(type,f,q=.7){const b=ac.createBiquadFilter();b.type=type;b.frequency.value=f;b.Q.value=q;return b}
function out(node,wet){node.connect(master);if(wet&&GENRE_DEF[S.genre].wet){const g=ac.createGain();g.gain.value=wet*GENRE_DEF[S.genre].wet;node.connect(g).connect(send)}}
function osc(t,dur,type,f0,f1,dest){const o=ac.createOscillator();o.type=type;o.frequency.setValueAtTime(f0,t);if(f1)o.frequency.exponentialRampToValueAtTime(f1,t+dur*.6);o.connect(dest);o.start(t);o.stop(t+dur+.05);return o}
function conga(t,v,f,dec,slap){const g=ac.createGain();env(g,t,v*.75,dec);osc(t,dec,'sine',f*1.25,f,g);
  if(slap){const g2=ac.createGain();env(g2,t,v*.25,.03);nz(t,.04).connect(filt('bandpass',3500,1)).connect(g2);out(g2)}out(g,.3)}
const V={
  k(t,v){const g=ac.createGain(),[L,f0]=GENRE_DEF[S.genre].kick;env(g,t,v*1.1,L);
    const o=ac.createOscillator();o.frequency.setValueAtTime(f0,t);o.frequency.exponentialRampToValueAtTime(46,t+.1);o.connect(g);out(g);o.start(t);o.stop(t+L+.05)},
  sn(t,v){const g=ac.createGain();env(g,t,v*.6,.18);nz(t,.2).connect(filt('bandpass',1900,.8)).connect(g);
    const g2=ac.createGain();env(g2,t,v*.45,.1);osc(t,.12,'triangle',200,160,g2);out(g,.3);out(g2)},
  cp(t,v){const g=ac.createGain();g.gain.setValueAtTime(.0001,t);
    for(let i=0;i<3;i++){const tt=t+i*.011;g.gain.setValueAtTime(v*.9,tt);g.gain.exponentialRampToValueAtTime(v*.12,tt+.009)}
    g.gain.setValueAtTime(v*.8,t+.033);g.gain.exponentialRampToValueAtTime(.0001,t+.24);
    nz(t,.26).connect(filt('bandpass',1150,1.2)).connect(g);out(g,.25)},
  rim(t,v){const g=ac.createGain(),bp=filt('bandpass',1700,3);env(g,t,v*.7,.05);
    osc(t,.06,'triangle',1750,0,bp);osc(t,.06,'square',480,0,bp);bp.connect(g);out(g,.45)},
  ch(t,v){if(ohGain){ohGain.gain.cancelScheduledValues(t);ohGain.gain.setTargetAtTime(.0001,t,.008);ohGain=null}
    const g=ac.createGain();env(g,t,v*.42,.045);nz(t,.06).connect(filt('highpass',7500)).connect(g);out(g)},
  oh(t,v){const g=ac.createGain();env(g,t,v*.38,.32);nz(t,.35).connect(filt('highpass',7000)).connect(g);out(g);ohGain=g},
  ride(t,v){const g=ac.createGain(),hp=filt('highpass',5200);env(g,t,v*.16,.55);
    [1,1.34,1.71,2.29].forEach(r=>osc(t,.6,'square',420*r,0,hp));
    const g2=ac.createGain();env(g2,t,v*.12,.4);nz(t,.45).connect(filt('bandpass',9000,.9)).connect(g2);hp.connect(g);out(g);out(g2)},
  cb(t,v){const g=ac.createGain(),bp=filt('bandpass',800,2.2);env(g,t,v*.55,.22);
    osc(t,.25,'square',545,0,bp);osc(t,.25,'square',815,0,bp);bp.connect(g);out(g,.35)},
  shk(t,v){const g=ac.createGain();env(g,t,v*.32,.07,.012);nz(t,.09).connect(filt('bandpass',6200,.9)).connect(g);out(g)},
  tamb(t,v){const g=ac.createGain();env(g,t,v*.3,.16,.004);nz(t,.18).connect(filt('highpass',8200)).connect(g);
    const g2=ac.createGain(),bp=filt('bandpass',7000,6);env(g2,t,v*.12,.12);osc(t,.14,'square',6800,0,bp);bp.connect(g2);out(g);out(g2)},
  pl(t,v){conga(t,v,175,.32,false)},
  pm(t,v){conga(t,v,255,.24,false)},
  ph(t,v){conga(t,v,345,.17,true)},
  tom(t,v,f){const g=ac.createGain();env(g,t,v*.85,.4);osc(t,.4,'sine',f*1.5,f,g);out(g,.35)},
  th(t,v){V.tom(t,v,235)},tm(t,v){V.tom(t,v,185)},tl(t,v){V.tom(t,v,140)},
  hp(t,v){if(ohGain){ohGain.gain.cancelScheduledValues(t);ohGain.gain.setTargetAtTime(.0001,t,.01);ohGain=null}
    const g=ac.createGain();env(g,t,v*.3,.035);nz(t,.05).connect(filt('highpass',7200)).connect(g);out(g)},
  cr(t,v){const g=ac.createGain(),hp=filt('highpass',4800);env(g,t,v*.2,1.3);
    [1,1.34,1.71,2.29,2.7].forEach(r=>osc(t,1.3,'square',390*r,0,hp));hp.connect(g);
    const g2=ac.createGain();env(g2,t,v*.3,1.1);nz(t,1.2).connect(filt('highpass',6000)).connect(g2);out(g);out(g2)},
  rs(t,v){const g=ac.createGain(),bp=filt('bandpass',1400,1.4);env(g,t,v*.8,.09);nz(t,.1).connect(bp);osc(t,.08,'triangle',900,500,bp);bp.connect(g);out(g,.4)},
  snap(t,v){const g=ac.createGain(),bp=filt('bandpass',2600,3.5);env(g,t,v*.7,.07,.001);nz(t,.08).connect(bp);bp.connect(g);out(g,.3)},
  clv(t,v){const g=ac.createGain();env(g,t,v*.6,.14);osc(t,.16,'sine',2500,2450,g);out(g,.3)},
  wb(t,v){const g=ac.createGain(),bp=filt('bandpass',1000,4);env(g,t,v*.7,.11);osc(t,.12,'triangle',900,780,bp);bp.connect(g);out(g,.3)}
};

