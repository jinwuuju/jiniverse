// JINIVERSE 시뮬레이션: 실제 HTML의 채점 엔진을 그대로 불러와 검증한다
const fs=require('fs');const NL=String.fromCharCode(10);
const FILE=process.argv[2];const html=fs.readFileSync(FILE,'utf8');
const a0=html.indexOf('<script>')+8,b0=html.indexOf('/*ENGINE_END*/');
const E=new Function(html.slice(a0,b0)+';return {Q,AX,AXK,LISTS,FAC,ORDER,PAIRS,TY,FT,CFG,scA,score,quality,clar,rt,QX,LX,item,xPlan,xNext,xClean};')();
const {Q,AX,AXK,LISTS,FAC,ORDER,PAIRS,TY,FT,CFG,scA,score,quality}=E;
const OUT=[];const P=(...x)=>OUT.push(x.join(' '));
const pct=x=>(100*x).toFixed(1)+'%';
function mul(seed){return function(){seed|=0;seed=seed+0x6D2B79F5|0;let t=Math.imul(seed^seed>>>15,1|seed);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}
let R=mul(20261020);
const N=()=>{let u=0;while(u===0)u=R();return Math.sqrt(-2*Math.log(u))*Math.cos(2*Math.PI*R())};
const ri=n=>Math.floor(R()*n);
const fw0=CFG.fw;

P('== 1. 정적 검사 ==');
const errs=[];
if(Q.length!==70)errs.push('Q len '+Q.length);
Q.forEach((q,i)=>{const x=q[0].slice(0,2);if(q.length!==5)errs.push('field '+i);if(!AX[x])errs.push('axis '+i);else if(q[1]!==AX[x].a&&q[1]!==AX[x].b)errs.push('key '+i);if(!FT[q[0]])errs.push('facet '+i)});
const so=[...ORDER].sort((u,v)=>u-v);if(so.length!==70||so.some((v,i)=>v!==i))errs.push('ORDER');
const codes=[];['E','I'].forEach(a=>['S','N'].forEach(b=>['T','F'].forEach(c=>['J','P'].forEach(d=>codes.push(a+b+c+d)))));
codes.forEach(c=>{const t=TY[c];if(!t||t.length!==10||t[4].length!==4||t[5].length!==3)errs.push('TY '+c)});
if(Object.keys(TY).length!==16)errs.push('TY count');
if(Object.keys(FAC).length!==16||Object.keys(FT).length!==16)errs.push('facet count');
PAIRS.forEach(([x,y])=>{if(Q[x][0]!==Q[y][0])errs.push('pair facet '+x+','+y)});
P('구조 오류:',errs.length?errs.join(', '):'없음');
AXK.forEach(a=>{const k=LISTS[a].filter(i=>Q[i][1]===AX[a].a).length;P(' ',a,LISTS[a].length+'문항 | A선택지가',AX[a].a+'쪽',k,'/',AX[a].b+'쪽',LISTS[a].length-k,'| 측면별',[1,2,3,4].map(f=>FAC[a+f].length).join('-'))});
let idealFail=0;codes.forEach(c=>{const an={};Q.forEach((q,i)=>{const x=q[0].slice(0,2),want=c[AXK.indexOf(x)];an[i]=q[1]===want?0:6});const r=score(an);if(r.code!==c||AXK.some(a=>r.R[a].d!==100))idealFail++});
P('16유형 이상응답자 판정 실패:',idealFail+'/16');
let mono=0,mt=0;for(let t=0;t<5000;t++){const an={};Q.forEach((_,i)=>an[i]=ri(7));const i=ri(70),x=Q[i][0].slice(0,2),before=score(an).R[x].raw;const nv=an[i]+(Q[i][1]===AX[x].a?-1:1);if(nv<0||nv>6)continue;an[i]=nv;mt++;if(score(an).R[x].raw<before-1e-12)mono++}
P('단조성 위반:',mono+'/'+mt);
let disp=0;for(let t=0;t<20000;t++){const an={};Q.forEach((_,i)=>an[i]=ri(7));const r=score(an);AXK.forEach(a=>{const z=r.R[a];if(z.raw!==0&&(z.L===AX[a].a)!==(z.pa>50))disp++;if(z.raw===0&&z.pa!==50)disp++})}
P('표시 퍼센트와 글자 불일치(무작위 2만건):',disp);
const pat=f=>{const an={};Q.forEach((_,i)=>an[i]=f(i));return an};
const S1=[1,0,-1,2,-1,0,1,-2,1,0],S2=[0,-1,1,-1,0,1,-2,0,1,-1],scfg={EI:[S1,1],SN:[S1,-1],TF:[S1,-1],JP:[S2,0]},san={};
AXK.forEach(a=>LISTS[a].forEach((qi,k)=>{const s=Math.max(-3,Math.min(3,scfg[a][0][k%10]+scfg[a][1])),raw=Q[qi][1]===AX[a].a?s:-s;san[qi]=3-raw}));
{let g=0,nx;while((nx=E.xNext(san)).length&&g++<3)nx.forEach((qi,k)=>{const q=E.item(qi),a=q[0].slice(0,2),s=Math.max(-3,Math.min(3,scfg[a][0][(k+3)%10]+scfg[a][1])),raw=q[1]===AX[a].a?s:-s;san[qi]=3-raw});P('  샘플 추가 문항 수:',Object.keys(san).length-70)}
[['샘플 결과',san],['전부 반반',pat(()=>3)],['전부 A 매우',pat(()=>0)],['전부 A 약간',pat(()=>2)],['전부 B 매우',pat(()=>6)],['A/B 번갈아',pat(i=>ORDER.indexOf(i)%2?6:0)]].forEach(([nm,an])=>{const r=score(an),q=quality(an,600);P(' ',nm,'→',r.code,AXK.map(a=>a+r.R[a].pa).join(' '),'| 경고',q.warn.join(',')||'없음','| inc',q.inc.toFixed(2),'flag',q.flag,'연속',q.best)});

const NAMES='김서연 이도윤 박지호 최하은 정민준 강서준 조예린 윤지우 장하준 임수아 한지민 오세훈 서유진 신동현 권나연 황준서 안채원 송민재 류다은 홍성민 전소희 고태윤 문가은 양승우 손예지 배현우 백지안 허준혁 남궁별 유하린 노은찬 심소율 하재원 곽수빈 성도경 차윤서 주민혁 우다인 구본영 민서희 진태오 엄채윤 원지환 천예서 방시우 석하윤 설준영 마은솔 길도현 표나래'.split(' ');
const JOBS='응급실 간호사,백엔드 개발자,초등교사,영업 매니저,심리학 대학원생,그래픽 디자이너,회계사,바리스타,스타트업 대표,구청 공무원,소방관,웹툰 작가,데이터 분석가,물리치료사,브랜드 마케터,변호사,호텔 요리사,프리랜서 번역가,은행원,사회복지사,화학 연구원,여행 유튜버,자동차 정비사,항공 승무원,약사,사회부 기자,건축가,인사담당자,경찰관,피아니스트,택배 기사,IT 기획자,청소년 상담사,육군 부사관,수의사,꽃집 사장,보험설계사,게임 기획자,치과위생사,경영학과 대학생,사진작가,전기기사,헬스 트레이너,미술관 큐레이터,콜센터 상담원,응급의학과 의사,소설가,물류센터 관리자,요가 강사,은퇴한 교장'.split(',');
if(NAMES.length!==50||JOBS.length!==50)throw new Error('persona count '+NAMES.length+'/'+JOBS.length);
const AGES=[29,31,34,41,27,33,38,26,36,45,39,30,28,35,32,42,37,40,46,33,35,29,44,27,38,47,43,36,48,31,52,34,39,40,37,49,45,33,30,22,41,50,32,29,35,44,48,53,38,67];R=mul(7);
const LAM=Q.map(()=>0.7+0.4*R()),DEL=Q.map(()=>0.25*N());
const PER=NAMES.map((nm,k)=>{const th={},fa={};AXK.forEach(x=>{th[x]=N();[1,2,3,4].forEach(f=>fa[x+f]=0.8*th[x]+0.6*N())});
 const st=k<35?'보통':k<42?'중간응답':k<47?'극단응답':'A쪽편향';
 return {nm,job:JOBS[k],age:AGES[k],th,fa,st,ext:st==='극단응답'?1.6:st==='중간응답'?0.6:0.85+0.3*R(),mid:st==='중간응답'?0.4:0.08*R(),bA:st==='A쪽편향'?0.6:0.15*N(),sig:0.8+0.4*R(),spd:0.6+0.8*R(),code:AXK.map(x=>th[x]>=0?AX[x].a:AX[x].b).join('')}});
function respond(p,sm){const st={};AXK.forEach(x=>st[x]=0.3*N());const an={};let sec=0;
 Q.forEach((q,i)=>{const x=q[0].slice(0,2),dir=q[1]===AX[x].a?1:-1;
  const lat=dir*LAM[i]*(p.fa[q[0]]+st[x])+DEL[i]+p.bA+p.sig*sm*N();
  let s=Math.max(-3,Math.min(3,Math.round(lat*1.3*p.ext)));
  if(s!==0&&R()<p.mid)s-=Math.sign(s);
  an[i]=3-s;sec+=Math.min(60,8*p.spd*Math.exp(0.4*N()))});
 return {an,sec}}
const tc={};codes.forEach(c=>tc[c]=0);PER.forEach(p=>tc[p.code]++);
P('');P('== 2. 가상 인물 50명 ==');
P('실제 유형 분포:',codes.filter(c=>tc[c]).map(c=>c+':'+tc[c]).join(' '));
P('축 잠재점수 |θ|<0.25(진짜 경계에 있는 사람) 비율:',pct(PER.reduce((s,p)=>s+AXK.filter(x=>Math.abs(p.th[x])<0.25).length,0)/200));
P('응답 스타일: 보통 35, 중간응답 7, 극단응답 5, A쪽편향 3');
fs.writeFileSync('personas.json',JSON.stringify(PER.map(p=>({이름:p.nm,나이:p.age,직업:p.job,응답스타일:p.st,실제유형:p.code,축점수:Object.fromEntries(AXK.map(x=>[x,+p.th[x].toFixed(2)]))})),null,1));

function runs(seed,sm){R=mul(seed);const out=[];PER.forEach((p,pi)=>{for(let k=0;k<20;k++){const r=respond(p,sm);out.push({pi,an:r.an,sec:r.sec})}});return out}
const SC={기본:runs(99,1),고잡음:runs(101,1.5)};
function evalV(fw,rs){CFG.fw=fw;const res=rs.map(r=>{const s=score(r.an);return {pi:r.pi,code:s.code,R:s.R}});
 let tA=0,lc=0;const ax={EI:0,SN:0,TF:0,JP:0},axS={EI:0,SN:0,TF:0,JP:0};
 res.forEach(r=>{const c=PER[r.pi].code;if(r.code===c)tA++;AXK.forEach((a,j)=>{if(r.code[j]===c[j]){ax[a]++;lc++}})});
 let same=0,np=0;for(let i=0;i<res.length;i+=2){np++;if(res[i].code===res[i+1].code)same++;AXK.forEach((a,j)=>{if(res[i].code[j]===res[i+1].code[j])axS[a]++})}
 return {res,tA:tA/res.length,lc:lc/res.length,ax,axS,same:same/np,np}}
P('');P('== 3. 1,000회 시뮬레이션: 채점 방식 비교 ==');
P('(50명 × 20회 = 1,000회. 재검사 일치는 같은 사람의 연속 2회 500쌍)');
const EV={};
Object.keys(SC).forEach(sk=>[0,1].forEach(fw=>{const e=evalV(fw,SC[sk]);EV[sk+fw]=e;
 P(' ['+sk+'] '+(fw?'측면 균등 가중':'문항 합산(기존)'),'| 4글자 정확도',pct(e.tA),'| 평균 맞힌 글자',e.lc.toFixed(2),'| 재검사 4글자 일치',pct(e.same),'| 축별 정확도',AXK.map(a=>a+' '+pct(e.ax[a]/1000)).join(' '),'| 축별 재검사',AXK.map(a=>a+' '+pct(e.axS[a]/500)).join(' '))}));
const BANDS=[[50,51],[52,53],[54,55],[56,57],[58,59],[60,61],[62,63],[64,65],[66,67],[68,69],[70,72],[73,76],[77,80],[81,100]];
function calib(e){const rows=BANDS.map(()=>({n:0,ok:0,flip:0}));
 e.res.forEach((r,idx)=>{const c=PER[r.pi].code,mate=e.res[idx%2?idx-1:idx+1];AXK.forEach((a,j)=>{const d=r.R[a].d,b=BANDS.findIndex(([lo,hi])=>d>=lo&&d<=hi),row=rows[b];row.n++;if(r.code[j]===c[j])row.ok++;if(mate.code[j]!==r.code[j])row.flip++})});
 return rows}
P('');P('== 4. 선명도 구간 보정 (축 점수 높은 쪽 % 기준) ==');
['기본','고잡음'].forEach(sk=>{const e=EV[sk+fw0];P(' ['+sk+'] 현재 채점');calib(e).forEach((r,b)=>P('   '+BANDS[b][0]+'~'+BANDS[b][1]+'%','n='+r.n,'| 글자 정확',r.n?pct(r.ok/r.n):'-','| 재검사 때 글자 뒤집힘',r.n?pct(r.flip/r.n):'-'))});

P('');P('== 4-2. 재검사 일치 추정치 검증 (HTML의 기준표 그대로) ==');
['기본','고잡음'].forEach(sk=>{const e=EV[sk+fw0];let pr=0,ac=0;e.res.forEach((r,i)=>{const m=e.res[i%2?i-1:i+1];pr+=AXK.reduce((q,a)=>q*E.rt(r.R[a].d)/100,1);if(m.code===r.code)ac++});P(' ['+sk+'] 4글자 재검사 일치 예측 평균',pct(pr/e.res.length),'| 실제',pct(ac/e.res.length))});
P('');P('== 5. 응답 품질 기준 보정 ==');
R=mul(4242);
const CARE=[];
const add=(kind,n,f,tf)=>{for(let k=0;k<n;k++){const an={};Q.forEach((_,i)=>an[i]=f(i,k));CARE.push({kind,an,sec:tf()})}};
const fastT=()=>70*(1.5+2*R()),slowT=()=>70*8*(0.6+0.8*R());
add('무작위(빠름)',200,()=>ri(7),fastT);
add('무작위(천천히)',200,()=>ri(7),slowT);
add('한 칸 일렬',120,(i,k)=>[0,1,2,4,5,6][k%6],fastT);
add('전부 반반',40,()=>3,fastT);
add('양극단 번갈아',40,i=>ORDER.indexOf(i)%2?6:0,fastT);
add('중앙 근처 무작위',100,()=>2+ri(3),slowT);
const KINDS=[...new Set(CARE.map(c=>c.kind))];
const st=x=>{const q=quality(x.an,x.sec);return {flag:q.flag,inc:q.inc,neu:q.neu,best:q.best,sec:x.sec,kind:x.kind}};
const HB=SC.기본.map(st),HN=SC.고잡음.map(st),CS=CARE.map(st);
const qs=(arr,k,p)=>{const v=arr.map(o=>o[k]).sort((u,w)=>u-w);return v[Math.min(v.length-1,Math.floor(p*v.length))]};
[['정상(기본)',HB],['정상(고잡음)',HN]].concat(KINDS.map(k=>[k,CS.filter(c=>c.kind===k)])).forEach(([nm,arr])=>P(' ',nm,'| inc 중앙/95%',qs(arr,'inc',.5).toFixed(2)+'/'+qs(arr,'inc',.95).toFixed(2),'| 상충쌍 95%',qs(arr,'flag',.95),'| 반반 95%',qs(arr,'neu',.95),'| 최장연속 95%',qs(arr,'best',.95),'| 시간 5%',Math.round(qs(arr,'sec',.05))+'초'));
const bad=(o,r)=>o.flag>r.fm||o.inc>r.im||o.neu>r.nm||o.best>r.rm||o.sec<r.ms;
function judge(r){const fa=HB.filter(o=>bad(o,r)).length/HB.length,fan=HN.filter(o=>bad(o,r)).length/HN.length;const det={};KINDS.forEach(k=>{const a=CS.filter(c=>c.kind===k);det[k]=a.filter(o=>bad(o,r)).length/a.length});const md=KINDS.reduce((s,k)=>s+det[k],0)/KINDS.length;return {r,fa,fan,det,md}}
const show=j=>P('   fm'+j.r.fm,'im'+j.r.im,'nm'+j.r.nm,'rm'+j.r.rm,'ms'+j.r.ms,'| 정상 오경보',pct(j.fa),'/',pct(j.fan),'| 평균 탐지',pct(j.md),'|',KINDS.map(k=>k+' '+pct(j.det[k])).join(' '));
P(' 현재 기준:');show(judge({fm:CFG.flagMax,im:CFG.incMax,nm:CFG.neuMax,rm:CFG.runMax,ms:CFG.minSec}));
const G=[];[1,2,3,7].forEach(fm=>[2.0,2.1,2.2,2.3,2.4,9].forEach(im=>[45,56,63,70].forEach(nm=>[8,10,12,15,99].forEach(rm=>[0,180,240].forEach(ms=>G.push(judge({fm,im,nm,rm,ms})))))));
const okG=G.filter(j=>j.fa<=0.02&&j.fan<=0.08).sort((u,w)=>w.md-u.md||u.fa-w.fa);
P(' 정상 오경보 2%(고잡음 8%) 이하 중 탐지율 상위:');okG.slice(0,6).forEach(show);
const okT=G.filter(j=>j.r.ms===0&&j.fa<=0.02&&j.fan<=0.08).sort((u,w)=>w.md-u.md||u.fa-w.fa);
P(' 시간 기준 없이(시간 측정이 불가한 경우) 상위:');okT.slice(0,3).forEach(show);

P('');P('중립 응답 정보: 정상(기본) 반반 35개 초과 비율 '+pct(HB.filter(o=>o.neu>35).length/HB.length));P('== 6. 인물별 결과 (현재 채점, 기본 시나리오 20회) ==');
CFG.fw=fw0;const eB=EV['기본'+fw0];
PER.forEach((p,pi)=>{const rs=eB.res.filter(r=>r.pi===pi),cnt={};rs.forEach(r=>cnt[r.code]=(cnt[r.code]||0)+1);const top=Object.entries(cnt).sort((u,w)=>w[1]-u[1]);
 P(' '+p.nm,p.age+'세',p.job,'['+p.st+']','실제',p.code,'θ('+AXK.map(x=>p.th[x].toFixed(2)).join(',')+')','→ 일치',(cnt[p.code]||0)+'/20','| 주요 결과',top.slice(0,3).map(([c,n])=>c+'×'+n).join(' '))});
P('');P('== 7. 경계 축 추가 문항(적응형) ==');
const QX=E.QX,LX=E.LX,QA=Q.concat(QX);
const xe=[];if(QX.length!==32)xe.push('QX len');
AXK.forEach(a=>{const l=LX[a];if(l.length!==8)xe.push(a+' LX');[0,4].forEach(s=>{const st=l.slice(s,s+4),ka=st.filter(i=>QA[i][1]===AX[a].a).length,fs=new Set(st.map(i=>QA[i][0]));if(ka!==2)xe.push(a+' stage keyed '+ka);if(fs.size!==4)xe.push(a+' stage facets')})});
const seenTxt=new Set(Q.map(q=>q[2]));QX.forEach((q,j)=>{const x=q[0].slice(0,2);if(seenTxt.has(q[2]))xe.push('dup '+j);seenTxt.add(q[2]);if(!AX[x]||(q[1]!==AX[x].a&&q[1]!==AX[x].b))xe.push('key x'+j)});
P('추가 문항 구조 오류:',xe.length?xe.join(', '):'없음','| 축별 8문항 = 1단계 4 + 2단계 4, 단계마다 4측면 1개씩, A방향 2:2');
R=mul(77);const LAMX=QX.map(()=>0.7+0.4*R()),DELX=QX.map(()=>0.25*N());
function respondFull(p,sm,lm){const st={};AXK.forEach(x=>st[x]=0.3*N());const an={};
 QA.forEach((q,i)=>{const x=q[0].slice(0,2),dir=q[1]===AX[x].a?1:-1,lam=i<70?LAM[i]:LAMX[i-70]*lm,del=i<70?DEL[i]:DELX[i-70];
  const lat=dir*lam*(p.fa[q[0]]+st[x])+del+p.bA+p.sig*sm*N();let s=Math.max(-3,Math.min(3,Math.round(lat*1.3*p.ext)));if(s!==0&&R()<p.mid)s-=Math.sign(s);an[i]=3-s});an.st=st;return an}
function fullRuns(seed,sm,lm){R=mul(seed);const o=[];PER.forEach((p,pi)=>{for(let k=0;k<20;k++)o.push({pi,full:respondFull(p,sm,lm)})});return o}
function administer(full,s){const an={};for(let i=0;i<70;i++)an[i]=full[i];if(!s)return an;const o={t:CFG.xtrig,n:CFG.xn1,q:CFG.xseq};CFG.xtrig=s.t;CFG.xn1=s.n;CFG.xseq=s.q;let g=0,nx;while((nx=E.xNext(an)).length&&g++<4)nx.forEach(i=>an[i]=full[i]);CFG.xtrig=o.t;CFG.xn1=o.n;CFG.xseq=o.q;return an}
const XS={'기본':fullRuns(501,1,1),'고잡음':fullRuns(502,1.5,1),'새 문항 30% 약함':fullRuns(503,1,0.7)};
function evalS(rs,s){const res=rs.map(r=>{const an=administer(r.full,s),sc=score(an),b={};for(let i=0;i<70;i++)b[i]=an[i];return {pi:r.pi,code:sc.code,R:sc.R,nx:Object.keys(an).length-70,base:score(b),st:r.full.st}});
 let tA=0,lc=0,same=0,nx=0,any=0,bn=0,b0=0,b1=0;
 res.forEach((r,i)=>{const c=PER[r.pi].code,m=res[i%2?i-1:i+1];if(r.code===c)tA++;if(m.code===r.code)same++;nx+=r.nx;if(r.nx)any++;AXK.forEach((a,j)=>{if(r.code[j]===c[j])lc++;if(r.base.R[a].d<=57){bn++;if(r.base.code[j]===c[j])b0++;if(r.code[j]===c[j])b1++}})});
 let fix=0,brk=0,orc=0,orc2=0;res.forEach(r=>{const c=PER[r.pi].code,p=PER[r.pi];AXK.forEach((a,j)=>{if(r.base.R[a].d>57)return;if(r.base.code[j]!==r.code[j]){if(r.code[j]===c[j])fix++;else brk++}const fm=[1,2,3,4].reduce((s,f)=>s+p.fa[a+f],0);if((fm>=0)===(p.th[a]>=0))orc++;if((fm/4+r.st[a]>=0)===(p.th[a]>=0))orc2++})});
 const n=res.length;return {res,tA:tA/n,lc:lc/n,same:same/n,nx:nx/n,any:any/n,b0:b0/bn,b1:b1/bn,fix,brk,orc:orc/bn,orc2:orc2/bn}}
const STR=[['추가 없음(기존)',null],['4문항 고정 @57',{t:57,n:4,q:0}],['8문항 고정 @57',{t:57,n:8,q:0}],['4+4 단계형 @57',{t:57,n:4,q:1}],['8문항 고정 @60',{t:60,n:8,q:0}],['4+4 단계형 @60',{t:60,n:4,q:1}],['8문항 고정 @62',{t:62,n:8,q:0}],['4+4 단계형 @62',{t:62,n:4,q:1}]];
Object.keys(XS).forEach(sk=>{P(' ['+sk+']');STR.forEach(([nm,s])=>{const e=evalS(XS[sk],s);P('   '+nm,'| 4글자 정확도',pct(e.tA),'| 맞힌 글자',e.lc.toFixed(3),'| 재검사 4글자',pct(e.same),'| 70문항 기준 경계축 정확도',pct(e.b0)+'→'+pct(e.b1),'| 1인당 추가',e.nx.toFixed(1)+'문항','| 추가 받은 사람',pct(e.any),s?'| 글자가 바뀐 축: 정답으로 '+e.fix+' / 오답으로 '+e.brk:'| 문항이 무한히 많아도 넘을 수 없는 상한(경계축): 컨디션 변동 없음 '+pct(e.orc)+' / 그날 컨디션 포함 '+pct(e.orc2))})});
const CH={t:CFG.xtrig,n:CFG.xn1,q:CFG.xseq};
P(' HTML 현재 설정: 문턱',CH.t+'%, 1단계',CH.n+'문항, 단계형',CH.q?'예':'아니오');
const XB=[[50,51],[52,53],[54,55],[56,57],[58,59],[60,61],[62,63],[64,66],[67,72],[73,100]];
['기본','고잡음'].forEach(sk=>{const e=evalS(XS[sk],CH),rows=XB.map(()=>({n:0,ok:0,fl:0}));
 e.res.forEach((r,i)=>{const m=e.res[i%2?i-1:i+1],c=PER[r.pi].code;AXK.forEach((a,j)=>{if(!r.R[a].x)return;const d=r.R[a].d,b=XB.findIndex(([lo,hi])=>d>=lo&&d<=hi),w=rows[b];w.n++;if(r.code[j]===c[j])w.ok++;if(m.code[j]!==r.code[j])w.fl++})});
 P('  ['+sk+'] 추가 문항을 받은 축의 최종 % 구간별');rows.forEach((w,b)=>P('    '+XB[b][0]+'~'+XB[b][1]+'%','n='+w.n,'| 글자 정확',w.n?pct(w.ok/w.n):'-','| 재검사 같은 글자',w.n?pct(1-w.fl/w.n):'-'));
 let pr=0;e.res.forEach(r=>{pr+=AXK.reduce((q,a)=>q*E.rt(r.R[a].d,r.R[a].x>0)/100,1)});P('  ['+sk+'] 4글자 재검사 일치 예측(HTML 표)',pct(pr/e.res.length),'| 실제',pct(e.same))});
let xbad=0;R=mul(9);for(let t=0;t<3000;t++){const full={};QA.forEach((_,i)=>full[i]=ri(7));const an=administer(full,CH);an[ri(70)]=ri(7);E.xClean(an);const pl=E.xPlan(an).list;if(Object.keys(an).some(k=>+k>=70&&!pl.includes(+k)))xbad++;const before=JSON.stringify(an);E.xClean(an);if(JSON.stringify(an)!==before)xbad++}
P(' 추가 문항 정리(xClean) 일관성 위반:',xbad+'/3000');
const txt=OUT.join(NL);fs.writeFileSync('sim_report.txt',txt);console.log(txt);
