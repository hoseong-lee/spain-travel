// ══════════ DATA ══════════
// 원본 seed 데이터는 trip-data.js 에 분리. 여기선 깊은 복사로 초기화만.
let DAYS=JSON.parse(JSON.stringify(window.DEFAULT_TRIP_DAYS||[]));

const TYPE_STYLES={flight:{bg:"rgba(59,130,246,.1)",border:"rgba(59,130,246,.25)",dot:"#3B82F6",label:"항공"},hotel:{bg:"rgba(139,92,246,.1)",border:"rgba(139,92,246,.25)",dot:"#8B5CF6",label:"숙소"},spot:{bg:"rgba(16,185,129,.1)",border:"rgba(16,185,129,.25)",dot:"#10B981",label:"관광"},food:{bg:"rgba(245,158,11,.1)",border:"rgba(245,158,11,.25)",dot:"#F59E0B",label:"맛집"},shopping:{bg:"rgba(236,72,153,.1)",border:"rgba(236,72,153,.25)",dot:"#EC4899",label:"쇼핑"},move:{bg:"rgba(99,102,241,.08)",border:"rgba(99,102,241,.2)",dot:"#818CF8",label:"교통"},etc:{bg:"rgba(107,114,128,.08)",border:"rgba(107,114,128,.2)",dot:"#6B7280",label:"기타"}};
const WEATHER_DATA=[{city:"바르셀로나",icon:"☀️",temp:"22-28°C",desc:"맑음"},{city:"포르투",icon:"⛅",temp:"17-24°C",desc:"구름 약간"},{city:"마요르카",icon:"☀️",temp:"23-29°C",desc:"맑음"},{city:"도우로밸리",icon:"🌤️",temp:"20-30°C",desc:"맑음/더움"}];
let EUR_RATE=1450;
const TRIP_START=new Date(2026,8,13);const TRIP_END=new Date(2026,8,26);

const STATUS_LABELS={unbooked:'⬜ 미예약',pending:'🟡 진행중',confirmed:'✅ 확정',cancelled:'❌ 취소'};
const STATUS_CSS={unbooked:'status-unbooked',pending:'status-pending',confirmed:'status-confirmed',cancelled:'status-cancelled'};
// 기존 confirmed 불리언 → status 필드 마이그레이션
function migrateStatus(days){days.forEach(day=>day.schedule.forEach(item=>{if(item.status)return;if(item.confirmed){item.status='confirmed';delete item.confirmed}else if(item.warn&&/예약|확인|필수|권장/.test(item.warn)){item.status='unbooked'}}));return days}

// ══════════ STATE ══════════
let currentDay=0,currentFilter='all',editMode=false,editingIdx=null,currentView='timeline';
let map=null,mapMarkers=[],mapRoutes=[],mapMode='day';
let routeProfile='car'; // 'car' | 'foot'
let mapSearchTimeout=null,mapSearchMarker=null,mapSearchResultsCache=[];
let gpsMarker=null,gpsCircle=null,gpsWatchId=null;
let pendingRemoteData=null;
let budgetSubView='plan'; // 'plan' or 'expense'
const travelTimeCache=new Map();
const DEFAULT_PACKING={
'필수서류':['여권','비자/ETIAS','항공권 프린트','호텔 바우처','여행자보험','국제운전면허증'],
'전자기기':['충전기','보조배터리','유럽 어댑터(C타입)','카메라'],
'의류':['수영복','우산/우비','편한 운동화'],
'세면용품':['선크림','세면도구'],
'의약품':['상비약','멀미약'],
'기타':['에코백','자물쇠']
};
const DEFAULT_SHOPPING={
'🛒 Mercadona 마트':['꿀국화차','올리브 바디크림','환타레몬'],
'🏪 그 외 슈퍼':['프링글스 하몽맛','하몽 + 멜론'],
'🫒 라치나타 (La Chinata)':['올리브오일 (트러플)','발사믹','핸드크림','립밤'],
'🛍️ 백화점':['부보 초콜릿','꾸악 올리브오일','프리오랏 와인','베르뭇 와인','뚜론 비센스','고메즈 손소독제'],
'🏛️ 고딕지구':['사바테즈','코쿠아 플랫슈즈','오이소 잠옷'],
'🌉 포르토 쇼핑':['푸타 비치타올','성물방','유리아쥬','쟈크폰 크림'],
'🐟 포르투 시장':['※ 참고: m.blog.naver.com/soso_seoul/224179281858']
};
let fbApp=null,fbAuth=null,fbDb=null,fbUser=null,fbConnected=false,isSyncingFromRemote=false,lastSyncTimestamp=0;
let dataListener=null,presenceListener=null;

const ALLOWED_EMAILS=['3hosungo@gmail.com','rachel506wnsgk@gmail.com'];
const FIREBASE_CONFIG={apiKey:"AIzaSyBPPr7VX6VHXAmx-jRdEjVcZzAbra9EbLs",authDomain:"hosing-5913f.firebaseapp.com",databaseURL:"https://hosing-5913f-default-rtdb.firebaseio.com",projectId:"hosing-5913f",storageBucket:"hosing-5913f.firebasestorage.app",messagingSenderId:"445332229155",appId:"1:445332229155:web:eddbe748e4df89769af596"};

// ══════════ UTILS ══════════
function esc(s){const d=document.createElement('div');d.textContent=s;return d.innerHTML}
function fmt(n){return n?n.toLocaleString('ko-KR')+'원':''}
function showToast(m){const t=document.getElementById('toast');t.textContent=m;t.classList.add('show');setTimeout(()=>t.classList.remove('show'),2200)}
function haversine(a,b,c,d){const R=6371,dL=(c-a)*Math.PI/180,dN=(d-b)*Math.PI/180,x=Math.sin(dL/2)**2+Math.cos(a*Math.PI/180)*Math.cos(c*Math.PI/180)*Math.sin(dN/2)**2;return R*2*Math.atan2(Math.sqrt(x),Math.sqrt(1-x))}
// 일정 제목에서 검색에 부적절한 일반 동작 단어 (호텔/공항 등 단독으로 의미 없는 것 포함)
const GENERIC_TITLE_TOKENS=new Set(['체크인','체크아웃','조식','중식','석식','점심','저녁','식사','아침','이동','출발','도착','산책','휴식','준비','귀국','귀환','복귀','쇼핑','야경','구경','투어','면세점','호텔','숙소','공항','마지막','첫날','가벼운','집결','경유','짐','오픈','입장','대기','휴게','마을','아울렛','타파스','or','and','to']);
// 일정 항목의 검색용 장소명 결정. 우선순위:
// 1) item.placeName (사용자가 명시적으로 지정한 장소명)
// 2) hotel 타입 → day.hotel 첫 줄
// 3) item.title 에서 일반 동작 단어를 제거한 결과
// 4) 위 모두 실패 시 null → 좌표 폴백
function extractPlaceName(item,day){
if(item.placeName)return item.placeName;
if(item.type==='hotel'&&day&&day.hotel&&day.hotel!=='—'){
return day.hotel.split('\n')[0].replace(/\([^)]*\)/g,'').trim()}
if(!item.title)return null;
// 이모지 제거
const cleaned=item.title.replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{1F000}-\u{1F2FF}\uFE0F\u200D]/gu,'').trim();
if(!cleaned)return null;
// 토큰 분할 후 일반 단어 제거
const tokens=cleaned.split(/[\s&\/,→·]+/).filter(Boolean);
const nonGeneric=tokens.filter(tok=>!GENERIC_TITLE_TOKENS.has(tok));
if(nonGeneric.length===0)return null;
const result=nonGeneric.join(' ').trim();
return result.length>=2?result:null}
function gmapsUrl(coords,title){if(!coords)return null;if(title){const q=encodeURIComponent(title);return`https://www.google.com/maps/search/${q}/@${coords[0]},${coords[1]},17z`}return`https://www.google.com/maps/search/?api=1&query=${coords[0]},${coords[1]}`}
// 현재 위치 → 목적지 길찾기 URL (장소명 우선, 없으면 좌표)
function gmapsDirUrl(coords,title){if(!coords&&!title)return null;const dest=title?encodeURIComponent(title):`${coords[0]},${coords[1]}`;return`https://www.google.com/maps/dir/?api=1&destination=${dest}`}

// ══════════ DEADLINE ══════════
// item.deadline (YYYY-MM-DD) → 오늘 기준 남은 일수. 과거면 음수.
function daysUntilDeadline(deadline){if(!deadline)return null;const d=new Date(deadline);if(isNaN(d))return null;d.setHours(0,0,0,0);const now=new Date();now.setHours(0,0,0,0);return Math.round((d-now)/864e5)}
// 배지 HTML: D-N / 당일 / 마감 경과. 7일 이내 경고색.
function deadlineBadgeHtml(deadline){const n=daysUntilDeadline(deadline);if(n===null)return'';let cls='deadline-badge',label;if(n<0){cls+=' deadline-over';label=`⏰ 마감 ${-n}일 경과`}else if(n===0){cls+=' deadline-today';label='⏰ 오늘 마감'}else if(n<=7){cls+=' deadline-soon';label=`⏰ D-${n}`}else{label=`⏰ D-${n}`}return`<span class="${cls}" title="예약 마감 ${esc(deadline)}">${label}</span>`}
// 마감 임박 항목 전체 수집 (7일 이내 또는 경과)
function collectUpcomingDeadlines(){const out=[];DAYS.forEach((day,di)=>day.schedule.forEach(item=>{const n=daysUntilDeadline(item.deadline);if(n===null)return;if(item.status==='confirmed'||item.status==='cancelled')return;if(n<=7)out.push({di,item,days:n})}));return out.sort((a,b)=>a.days-b.days)}

// ══════════ D-DAY ══════════
function updateDDay(){const now=new Date();now.setHours(0,0,0,0);const el=document.getElementById('ddayBadge');if(now<TRIP_START){const d=Math.ceil((TRIP_START-now)/864e5);el.textContent=`D-${d}`;el.style.background='rgba(245,166,35,.15)';el.style.color='#F5A623'}else if(now<=TRIP_END){const d=Math.floor((now-TRIP_START)/864e5)+1;el.textContent=`DAY ${d} 진행중`;el.style.background='rgba(16,185,129,.15)';el.style.color='#10B981'}else{el.textContent='여행 완료!';el.style.background='rgba(139,92,246,.15)';el.style.color='#c4b5fd'}}

// ══════════ WEATHER ══════════
function renderWeather(){document.getElementById('weatherBar').innerHTML=WEATHER_DATA.map(w=>`<div class="weather-card"><div class="weather-city">${w.city}</div><div class="weather-icon">${w.icon}</div><div class="weather-temp">${w.temp}</div><div class="weather-desc">${w.desc}</div></div>`).join('')}

// ══════════ CURRENCY ══════════
function toggleCurrency(){const w=document.getElementById('currencyWidget');w.classList.toggle('visible');document.getElementById('currencyToggle').style.display=w.classList.contains('visible')?'none':'flex'}
function calcCurrency(from){const e=document.getElementById('eurInput'),k=document.getElementById('krwInput');if(from==='eur'){const v=parseFloat(e.value)||0;k.value=v?Math.round(v*EUR_RATE).toLocaleString():''}else{const v=parseFloat(k.value.replace(/,/g,''))||0;e.value=v?(v/EUR_RATE).toFixed(2):''}}

// ══════════ FIREBASE ══════════
function initFirebase(){try{fbApp=firebase.initializeApp(FIREBASE_CONFIG);fbAuth=firebase.auth();fbDb=firebase.database();fbDb.ref('.info/connected').on('value',s=>{fbConnected=s.val()===true;if(fbConnected&&fbUser){updateSyncUI('online');setupPresence()}else if(!fbConnected)updateSyncUI('offline')});fbAuth.onAuthStateChanged(user=>{if(user&&ALLOWED_EMAILS.length>0&&!ALLOWED_EMAILS.includes(user.email)){fbAuth.signOut();fbUser=null;updateAuthUI();updateSyncUI('offline');showToast('접근 권한이 없는 계정');return}fbUser=user;updateAuthUI();if(user){updateSyncUI(fbConnected?'online':'offline');setupPresence();fetchRemoteThenSync().then(()=>listenForChanges())}else{updateSyncUI('offline');detachListeners()}});return true}catch(e){console.error(e);updateSyncUI('offline');return false}}
function signIn(){if(!fbAuth){showToast('연결 실패 — 새로고침');return}const p=new firebase.auth.GoogleAuthProvider();fbAuth.signInWithPopup(p).catch(e=>{if(e.code==='auth/popup-blocked'||e.code==='auth/popup-closed-by-user')fbAuth.signInWithRedirect(p);else showToast('로그인 실패')})}
function signOut(){if(fbAuth)fbAuth.signOut();fbUser=null;updateAuthUI();updateSyncUI('offline');showToast('로그아웃')}
function updateAuthUI(){const el=document.getElementById('authContent');if(fbUser){const p=fbUser.photoURL||'',n=fbUser.displayName||fbUser.email;el.innerHTML=`<div class="auth-user">${p?`<img class="auth-avatar" src="${p}">`:''}${esc(n)}</div><button class="auth-btn auth-btn-logout" onclick="signOut()">로그아웃</button>`}else el.innerHTML='<button class="auth-btn auth-btn-login" onclick="signIn()">🔑 로그인</button>'}
function updateSyncUI(s){document.getElementById('syncDot').className='sync-dot '+s;document.getElementById('syncText').textContent={online:'동기화',offline:'오프라인',syncing:'동기화 중...'}[s]||'오프라인'}
function getDataRef(){return fbDb?fbDb.ref('travel/itinerary'):null}
async function fetchRemoteThenSync(){const ref=getDataRef();if(!ref)return;updateSyncUI('syncing');try{const snap=await ref.once('value');const r=snap.val();if(r&&r.days&&r.updatedAt){DAYS=migrateStatus(r.days);saveToLocalOnly();lastSyncTimestamp=r.updatedAt;if(currentDay>=DAYS.length)currentDay=DAYS.length-1;render();updateSyncUI('online');showToast('클라우드 데이터 로드')}else syncToRemote()}catch(e){updateSyncUI('offline')}}
function syncToRemote(){if(!fbDb||!fbUser||isSyncingFromRemote)return;const ref=getDataRef();if(!ref)return;updateSyncUI('syncing');ref.set({days:DAYS,updatedBy:fbUser.uid,updatedByName:fbUser.displayName||fbUser.email,updatedAt:firebase.database.ServerValue.TIMESTAMP}).then(()=>{lastSyncTimestamp=Date.now();updateSyncUI('online')}).catch(()=>updateSyncUI('offline'))}
function listenForChanges(){detachListeners();const ref=getDataRef();if(!ref)return;dataListener=ref.on('value',snap=>{const data=snap.val();if(!data||!data.days)return;if(data.updatedBy===fbUser?.uid)return;if(editMode){pendingRemoteData=data;showToast(`📡 ${data.updatedByName||'상대방'}님 수정 — 편집 후 반영`);return}const oldDays=JSON.stringify(DAYS);isSyncingFromRemote=true;DAYS=migrateStatus(data.days);saveToLocalOnly();lastSyncTimestamp=data.updatedAt||Date.now();if(currentDay>=DAYS.length)currentDay=DAYS.length-1;render();highlightConflicts(oldDays,data.days);showToast(`📡 ${data.updatedByName||'상대방'}님이 수정`);isSyncingFromRemote=false})}
function detachListeners(){if(dataListener){const r=getDataRef();if(r)r.off('value',dataListener);dataListener=null}}
function setupPresence(){if(!fbDb||!fbUser)return;const my=fbDb.ref('travel/presence/'+fbUser.uid);my.set({name:fbUser.displayName||fbUser.email||'사용자',photo:fbUser.photoURL||'',online:true,lastSeen:firebase.database.ServerValue.TIMESTAMP});my.onDisconnect().update({online:false,lastSeen:firebase.database.ServerValue.TIMESTAMP});const all=fbDb.ref('travel/presence');if(presenceListener)all.off('value',presenceListener);presenceListener=all.on('value',snap=>{const u=snap.val()||{};const o=Object.entries(u).filter(([k,v])=>k!==fbUser.uid&&v.online).map(([,v])=>v);const bar=document.getElementById('presenceBar'),txt=document.getElementById('presenceText');if(o.length){bar.classList.add('visible');txt.innerHTML=o.map(x=>x.photo?`<img class="presence-avatar" src="${x.photo}">`:''). join('')+` <span>${o.map(x=>x.name).join(', ')}님도 접속</span>`}else bar.classList.remove('visible')})}

// ══════════ PERSISTENCE ══════════
function saveToLocalOnly(){try{localStorage.setItem('travel_planner_days',JSON.stringify(DAYS))}catch(e){if(e&&e.name==='QuotaExceededError')showToast('저장소 용량 초과 — 사진/메모를 줄여주세요');else console.warn('saveToLocal 실패:',e)}}
function saveToLocal(){saveToLocalOnly();syncToRemote()}
function loadFromLocal(){try{const d=localStorage.getItem('travel_planner_days');if(d){const parsed=JSON.parse(d);if(Array.isArray(parsed)&&parsed.length)DAYS=parsed}}catch(e){console.warn('loadFromLocal 실패 — seed 데이터 사용:',e);showToast('저장 데이터 손상 — 기본값 복구')}}

// ══════════ VIEW ══════════
function switchView(v){currentView=v;const views=['dashboard','timeline','map','route','budget','prep','phrase','sos'];document.querySelectorAll('.view-tab').forEach((t,i)=>t.classList.toggle('active',views[i]===v));document.getElementById('dashboardView').classList.toggle('visible',v==='dashboard');document.getElementById('timelineView').style.display=v==='timeline'?'':'none';document.getElementById('mapView').classList.toggle('visible',v==='map');document.getElementById('routeView').classList.toggle('visible',v==='route');document.getElementById('budgetView').classList.toggle('visible',v==='budget');document.getElementById('prepView').classList.toggle('visible',v==='prep');document.getElementById('phraseView').classList.toggle('visible',v==='phrase');document.getElementById('sosView').classList.toggle('visible',v==='sos');document.getElementById('tipsSection').style.display=v==='timeline'?'':'none';document.getElementById('editToolbar').style.display=v==='timeline'?'':'none';document.getElementById('daySelector').style.display=v==='dashboard'||v==='route'||v==='budget'||v==='prep'||v==='phrase'||v==='sos'?'none':'';if(v==='map')setTimeout(()=>{if(!map)initMap();else map.invalidateSize();updateMap()},100);if(v==='dashboard')renderDashboard();if(v==='route')renderRouteView();if(v==='budget')renderBudgetView();if(v==='prep')renderPrepView();if(v==='phrase')renderPhraseView();if(v==='sos')renderSOSView()}

// ══════════ EDIT MODE ══════════
function toggleEdit(){editMode=!editMode;document.body.classList.toggle('edit-mode',editMode);document.getElementById('editModeBar').classList.toggle('visible',editMode);['addBtn','addDayBtn','delDayBtn'].forEach(id=>document.getElementById(id).style.display=editMode?'':'none');document.getElementById('addItemRow').classList.toggle('visible',editMode);const btn=document.getElementById('toggleEditBtn');btn.textContent=editMode?'✅ 완료':'✏️ 편집';btn.classList.toggle('active',editMode);if(!editMode&&pendingRemoteData){DAYS=pendingRemoteData.days;saveToLocalOnly();pendingRemoteData=null;if(currentDay>=DAYS.length)currentDay=DAYS.length-1;showToast('보류된 변경 반영')}renderDayContent();if(!editMode)showToast('편집 완료')}

// ══════════ RENDER ══════════
function render(){renderDaySelector();renderDayContent()}
function renderDaySelector(){const el=document.getElementById('daySelector');el.innerHTML=DAYS.map((d,i)=>{const a=i===currentDay;return`<button class="day-btn ${a?'active':''}" onclick="selectDay(${i})" style="border:${a?`2px solid ${d.color}`:'1px solid rgba(255,255,255,.08)'};background:${a?d.color+'22':'rgba(255,255,255,.02)'};color:${a?d.color:'#64748b'}"><div class="day-num">DAY ${i+1}</div>${d.date}</button>`}).join('');setTimeout(()=>{const a=el.querySelector('.active');if(a)a.scrollIntoView({behavior:'smooth',block:'nearest',inline:'center'})},50)}
function renderDayContent(){const day=DAYS[currentDay];const filtered=currentFilter==='all'?day.schedule.map((s,i)=>({...s,_idx:i})):day.schedule.map((s,i)=>({...s,_idx:i})).filter(s=>s.type===currentFilter);
const dayCost=day.schedule.reduce((s,i)=>s+(i.cost||0),0);const checkedCount=day.schedule.filter(i=>i.checked).length;
// header
const weatherMatch=day.region.includes('바르셀로나')||day.region.includes('한국→')||day.region.includes('라로카')?WEATHER_DATA[0]:day.region.includes('포르투')||day.region.includes('도우로')||day.region.includes('마투지')||day.region.includes('아베이루')?WEATHER_DATA[1]:day.region.includes('마요르카')||day.region.includes('발데모사')||day.region.includes('소예르')||day.region.includes('팔마')?WEATHER_DATA[2]:null;
const tz=getDayTZ(currentDay);const tzLabel=tz==='WEST'?'포르투갈 UTC+1':'스페인 UTC+2';const tzDiff=tz==='WEST'?'+8h':'+7h';
document.getElementById('dayHeader').innerHTML=`<div class="day-header-top"><div class="day-badge" style="background:${day.color}18;border:2px solid ${day.color};color:${day.color}">D${currentDay+1}</div><div><div class="day-region">${esc(day.region)}</div><div class="day-date-sub">${day.date} · ${day.schedule.length}개 일정 · ${checkedCount}/${day.schedule.length} 완료</div>${weatherMatch?`<div class="day-weather">${weatherMatch.icon} ${weatherMatch.temp} ${weatherMatch.desc}</div>`:''}<div style="font-size:9px;color:#818CF8;margin-top:1px">🕐 ${tzLabel} (한국과 ${tzDiff})</div></div></div>${day.hotel!=='—'?`<div class="hotel-box" onclick="${editMode?'openHotelModal()':''}">🏨 ${esc(day.hotel)}${editMode?' <span style="color:#fbbf24;font-size:9px">✏️</span>':''}</div>`:''}${dayCost?`<div class="day-budget"><span>💰 이 날 예상 비용</span><strong>${fmt(dayCost)}</strong></div>`:''}`;
// filters
const filters=[{key:'all',label:'전체'},{key:'spot',label:'📍 관광'},{key:'food',label:'🍴 맛집'},{key:'shopping',label:'🛍️ 쇼핑'},{key:'flight',label:'✈️ 이동'},{key:'hotel',label:'🏨 숙소'}];
document.getElementById('filters').innerHTML=filters.map(f=>`<button class="filter-btn ${f.key===currentFilter?'active':''}" onclick="setFilter('${f.key}')" style="${f.key===currentFilter?`border-color:${day.color};background:${day.color}18;color:${day.color}`:''}">${f.label}</button>`).join('');
// Time conflict detection
const conflicts=detectConflicts(day.schedule);
if(conflicts.length){const conflictHtml=conflicts.map(c=>`<div class="conflict-warn"><span class="conflict-icon">⚠️</span> <strong>${c.time}</strong> 시간 충돌: ${esc(c.title1)} / ${esc(c.title2)}</div>`).join('');
const conflictBar=document.getElementById('conflictBar');if(conflictBar)conflictBar.innerHTML=conflictHtml;
else{const cb=document.createElement('div');cb.id='conflictBar';cb.className='conflict-bar';cb.innerHTML=conflictHtml;document.getElementById('filters').after(cb)}}
else{const cb=document.getElementById('conflictBar');if(cb)cb.remove()}
if(!filtered.length){document.getElementById('timeline').innerHTML='<div style="text-align:center;padding:40px;color:#475569;font-size:12px">일정이 없습니다</div>';return}
document.getElementById('timeline').innerHTML=filtered.map((item,i)=>{const t=TYPE_STYLES[item.type]||TYPE_STYLES.etc;const isLast=i===filtered.length-1;const checked=item.checked?'checked':'';const checkedClass=item.checked?'checked-item':'';
let meta='';if(item.status&&STATUS_LABELS[item.status])meta+=`<span class="status-badge ${STATUS_CSS[item.status]}">${STATUS_LABELS[item.status]}</span>`;if(item.deadline&&item.status!=='confirmed'&&item.status!=='cancelled')meta+=deadlineBadgeHtml(item.deadline);if(item.warn)meta+=`<div class="card-warn">⚠️ ${esc(item.warn)}</div>`;if(item.cost)meta+=`<span class="card-cost">${fmt(item.cost)}</span>`;if(item.url)meta+=`<a class="card-link" href="${esc(item.url)}" target="_blank" onclick="event.stopPropagation()">🔗 예약</a>`;if(item.bookingUrl)meta+=`<a class="card-link" href="${esc(item.bookingUrl)}" target="_blank" onclick="event.stopPropagation()" style="background:rgba(139,92,246,.1);color:#c4b5fd">📄 바우처</a>`;if(item.coords){const pn=extractPlaceName(item,day);meta+=`<a class="card-gmaps" href="${gmapsUrl(item.coords,pn)}" target="_blank" onclick="event.stopPropagation()">📍 지도</a>`;meta+=`<a class="card-gmaps" href="${gmapsDirUrl(item.coords,pn)}" target="_blank" onclick="event.stopPropagation()" style="background:rgba(59,130,246,.12);color:#60a5fa;border-color:rgba(59,130,246,.25)">🧭 길찾기</a>`}
const memoHtml=item.memo?`<div class="card-memo">${esc(item.memo)}</div>`:'';
const ratingHtml=item.rating?`<div class="card-rating">${'★'.repeat(item.rating)+'☆'.repeat(5-item.rating)}</div>`:'';
const reviewHtml=item.review?`<div class="card-review">${esc(item.review)}</div>`:'';
const photosHtml=item.photos&&item.photos.length?`<div class="card-photos">${item.photos.map(p=>`<img class="card-photo" src="${esc(p)}" onclick="event.stopPropagation();openPhotoModal('${esc(p)}')" loading="lazy" onerror="this.style.display='none'">`).join('')}</div>`:'';
const editClick=editMode?`onclick="openEditModal(${item._idx})"`:'';const editActions=editMode?`<div class="item-edit-actions" onclick="event.stopPropagation()"><button class="ie-btn ie-up" onclick="event.stopPropagation();moveItem(${item._idx},-1)" title="위로">▲</button><button class="ie-btn ie-down" onclick="event.stopPropagation();moveItem(${item._idx},1)" title="아래로">▼</button><button class="ie-btn ie-edit" onclick="event.stopPropagation();openEditModal(${item._idx})" title="편집">✏️</button><button class="ie-btn ie-del" onclick="event.stopPropagation();deleteItem(${item._idx})" title="삭제">✕</button></div>`:'';const dragHandle=editMode?`<div class="drag-handle" data-idx="${item._idx}">⠿</div>`:'';const ctxTrigger=editMode?`oncontextmenu="showContextMenu(event,${currentDay},${item._idx})"`:'';
// Travel time connector
let connector='';if(i>0&&filtered[i-1].coords&&item.coords){const c1=filtered[i-1].coords,c2=item.coords;const sd=haversine(c1[0],c1[1],c2[0],c2[1]);const prof=sd<1.5?'foot':'car';const ck=c1.join(',')+'>'+c2.join(',')+':'+prof;const cached=travelTimeCache.get(ck);if(cached){const icon=cached.profile==='foot'?'🚶':'🚗';const mins=Math.round(cached.dur/60);const distTxt=cached.dist<1000?(cached.dist).toFixed(0)+'m':(cached.dist/1000).toFixed(1)+'km';connector=`<div class="travel-time-connector"><span class="tt-icon">${icon}</span><span class="tt-text">${mins}분 · ${distTxt}</span></div>`}else{connector=`<div class="travel-time-connector" id="tt-${currentDay}-${i}"></div>`}}
// Timezone badge for flights
const dayTZ=getDayTZ(currentDay);let tzBadge='';
if(item.type==='flight'&&item.time!=='—'){const krTime=getLocalTimeStr(item.time,dayTZ,'KST');if(krTime)tzBadge=`<span class="tz-badge">🇰🇷 ${krTime}</span>`}
// Transport details
let transportHtml='';
if(item.type==='move'||item.type==='flight'){const titleKey=Object.keys(TRANSPORT_DETAILS).find(k=>item.title.includes(k)||item.desc.includes(k));if(titleKey){const td=TRANSPORT_DETAILS[titleKey];transportHtml=`<div class="transport-detail">${td.routes?'🚏 '+td.routes.join(' / '):''}${td.fare?' · 💶 '+td.fare:''}${td.interval?' · ⏱ '+td.interval:''}${td.taxi?'<br>🚕 택시: '+td.taxi:''}</div>`}}
return`${connector}<div class="timeline-item" data-idx="${item._idx}">${dragHandle}<div class="timeline-left"><div class="timeline-time">${item.time}${tzBadge}</div><div class="timeline-dot" style="background:${t.dot};box-shadow:0 0 6px ${t.dot}44"></div>${!isLast?`<div class="timeline-line" style="background:linear-gradient(to bottom,${t.dot}44,transparent)"></div>`:''}</div><div class="timeline-card ${checkedClass}" style="background:${t.bg};border-color:${t.border}" ${editClick} ${ctxTrigger}>${editActions}<div class="card-top"><button class="card-checkbox ${checked}" onclick="event.stopPropagation();toggleCheck(${item._idx})">${item.checked?'✓':''}</button><div class="card-body"><div class="card-title">${esc(item.title)}</div><div class="card-desc">${esc(item.desc)}</div>${transportHtml}<div class="card-meta">${meta}</div>${memoHtml}${ratingHtml}${reviewHtml}${photosHtml}</div></div></div></div>`}).join('');
// Fetch travel times async for current day
fetchTravelTimes(filtered)}

// ══════════ TRAVEL TIME (OSRM) ══════════
function fetchTravelTimes(filtered){const dayIdx=currentDay;for(let i=1;i<filtered.length;i++){if(!filtered[i-1].coords||!filtered[i].coords)continue;const c1=filtered[i-1].coords,c2=filtered[i].coords;const straightDist=haversine(c1[0],c1[1],c2[0],c2[1]);const profile=straightDist<1.5?'foot':'car';const ck=c1.join(',')+'>'+c2.join(',')+':'+profile;if(travelTimeCache.has(ck)){updateTTElement(dayIdx,i,travelTimeCache.get(ck));continue}const idx=i;const url=`https://router.project-osrm.org/route/v1/${profile==='foot'?'foot':'driving'}/${c1[1]},${c1[0]};${c2[1]},${c2[0]}?overview=false`;fetch(url).then(r=>r.json()).then(data=>{if(data.routes&&data.routes[0]){const result={dur:data.routes[0].duration,dist:data.routes[0].distance,profile};travelTimeCache.set(ck,result);updateTTElement(dayIdx,idx,result)}}).catch(()=>{if(profile==='foot'){const fallbackCk=c1.join(',')+'>'+c2.join(',')+':car';const fallUrl=`https://router.project-osrm.org/route/v1/driving/${c1[1]},${c1[0]};${c2[1]},${c2[0]}?overview=false`;fetch(fallUrl).then(r=>r.json()).then(data=>{if(data.routes&&data.routes[0]){const result={dur:data.routes[0].duration,dist:data.routes[0].distance,profile:'car'};travelTimeCache.set(fallbackCk,result);updateTTElement(dayIdx,idx,result)}}).catch(()=>{})}})}}
function updateTTElement(dayIdx,idx,result){const el=document.getElementById('tt-'+dayIdx+'-'+idx);if(!el)return;const icon=result.profile==='foot'?'🚶':'🚗';const mins=Math.round(result.dur/60);const distTxt=result.dist<1000?result.dist.toFixed(0)+'m':(result.dist/1000).toFixed(1)+'km';el.innerHTML=`<span class="tt-icon">${icon}</span><span class="tt-text">${mins}분 · ${distTxt}</span>`}

// ══════════ CHECK ══════════
function toggleCheck(idx){DAYS[currentDay].schedule[idx].checked=!DAYS[currentDay].schedule[idx].checked;saveToLocal();renderDayContent()}

// ══════════ MAP ══════════
function initMap(){map=L.map('map',{zoomControl:true,attributionControl:false}).setView([41.3851,2.1734],13);L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',{maxZoom:19}).addTo(map);map.on('click',function(e){if(!editMode)return;const lat=e.latlng.lat.toFixed(6),lng=e.latlng.lng.toFixed(6);L.popup().setLatLng(e.latlng).setContent(`<div style="text-align:center"><div style="font-size:10px;color:#94a3b8;margin-bottom:4px">${lat}, ${lng}</div><button onclick="openAddModalWithCoords(${lat},${lng})" style="padding:5px 14px;border-radius:8px;border:none;background:rgba(16,185,129,.2);color:#34d399;font-size:11px;font-weight:700;cursor:pointer;font-family:inherit">+ 일정 추가</button></div>`).openOn(map)})}
function setMapMode(m){mapMode=m;document.getElementById('mapDayToggle').classList.toggle('active',m==='day');document.getElementById('mapAllToggle').classList.toggle('active',m==='all');document.getElementById('daySelector').style.display=m==='all'?'none':'';updateMap()}
function updateMap(){if(!map)return;mapMarkers.forEach(m=>map.removeLayer(m));mapMarkers=[];mapRoutes.forEach(r=>map.removeLayer(r));mapRoutes=[];
if(mapMode==='day'){const day=DAYS[currentDay];const coords=[];let num=1;day.schedule.forEach(item=>{if(!item.coords)return;const[lat,lng]=item.coords;coords.push([lat,lng]);const t=TYPE_STYLES[item.type]||TYPE_STYLES.etc;const icon=L.divIcon({className:'',html:`<div class="custom-marker" style="background:${t.dot}">${num}</div>`,iconSize:[26,26],iconAnchor:[13,13]});const mk=L.marker([lat,lng],{icon}).bindPopup(`<strong>${esc(item.title)}</strong><div class="popup-type">${t.label}</div><div class="popup-time">${item.time!=='—'?item.time:''}</div><div style="margin-top:3px;color:#94a3b8;font-size:10px;white-space:pre-line">${esc(item.desc)}</div>${item.coords?`<div style="margin-top:6px;display:flex;gap:8px;flex-wrap:wrap"><a href="${gmapsUrl(item.coords,extractPlaceName(item,day))}" target="_blank" style="color:#60a5fa;font-size:10px;font-weight:700">⭐ 리뷰 보기</a><a href="${gmapsDirUrl(item.coords,extractPlaceName(item,day))}" target="_blank" style="color:#34d399;font-size:10px;font-weight:700">🧭 길찾기</a></div>`:''}`,{maxWidth:230}).addTo(map);mapMarkers.push(mk);num++});if(coords.length>=2){// Show dashed line immediately, then overlay real route
const dashed=L.polyline(coords,{color:day.color,weight:2,opacity:.3,dashArray:'8,8'}).addTo(map);mapRoutes.push(dashed);
fetchRealRoute(coords,day.color,geom=>{if(geom.length){const real=L.polyline(geom,{color:day.color,weight:4,opacity:.8}).addTo(map);mapRoutes.push(real)}})}if(coords.length)map.fitBounds(L.latLngBounds(coords),{padding:[40,40],maxZoom:15});document.getElementById('mapDayInfo').innerHTML=`<strong>DAY ${currentDay+1} — ${day.date}</strong><br><span style="color:#94a3b8">${esc(day.region)}</span><br><span style="color:${day.color}">📍 ${coords.length}곳</span>`
}else{// all days
const allCoords=[];const DAY_COLORS=['#E8725A','#E8725A','#E8725A','#2E86AB','#2E86AB','#2E86AB','#2E86AB','#F5A623','#F5A623','#F5A623','#F5A623','#E8725A','#888','#888'];
DAYS.forEach((day,di)=>{const coords=[];day.schedule.forEach(item=>{if(!item.coords)return;const[lat,lng]=item.coords;coords.push([lat,lng]);allCoords.push([lat,lng])});if(coords.length>=2){const route=L.polyline(coords,{color:day.color,weight:2.5,opacity:.5,dashArray:'6,6'}).addTo(map);mapRoutes.push(route)}if(coords.length){const first=coords[0];const icon=L.divIcon({className:'',html:`<div class="custom-marker" style="background:${day.color};font-size:9px">D${di+1}</div>`,iconSize:[26,26],iconAnchor:[13,13]});const mk=L.marker(first,{icon}).bindPopup(`<strong>DAY ${di+1}</strong><br>${esc(day.region)}<br><span style="color:#64748b">${day.date}</span>`).addTo(map);mapMarkers.push(mk)}});if(allCoords.length)map.fitBounds(L.latLngBounds(allCoords),{padding:[30,30],maxZoom:8});document.getElementById('mapDayInfo').innerHTML=`<strong>전체 여정</strong><br><span style="color:#94a3b8">14일 · 3개국</span>`}}

// ══════════ ROUTE + OPTIMIZE ══════════
function optimizeRoute(items){const wc=items.filter(i=>i.coords);if(wc.length<3)return null;
// 숙소(hotel) 항목을 출발/도착 고정 핀으로 사용
const hotels=wc.map((it,i)=>({it,i})).filter(o=>o.it.type==='hotel');
const mid=wc.map((it,i)=>({it,i})).filter(o=>o.it.type!=='hotel');
if(mid.length<2){// 최적화할 중간 지점이 부족하면 원본 유지
return null}
const startAnchor=hotels.length?hotels[0]:null;
const endAnchor=hotels.length>1?hotels[hotels.length-1]:null;
// nearest-neighbor: 숙소 출발 → 관광지 순회 → 숙소 복귀
const startCoord=startAnchor?startAnchor.it.coords:wc[0].coords;
const remaining=new Set(mid.map(o=>o.i));const visited=[];
let cur=startCoord;
while(remaining.size){let best=-1,bestD=Infinity;for(const r of remaining){const d=haversine(cur[0],cur[1],wc[r].coords[0],wc[r].coords[1]);if(d<bestD){bestD=d;best=r}}visited.push(best);cur=wc[best].coords;remaining.delete(best)}
const result=[];if(startAnchor)result.push(startAnchor.it);visited.forEach(i=>result.push(wc[i]));if(endAnchor)result.push(endAnchor.it);
// 시작/끝 숙소 외 나머지 숙소도 포함
hotels.filter(h=>h!==startAnchor&&h!==endAnchor).forEach(h=>result.push(h.it));
return result}
function calcTotalDist(items){let d=0;const wc=items.filter(i=>i.coords);for(let i=1;i<wc.length;i++)d+=haversine(wc[i-1].coords[0],wc[i-1].coords[1],wc[i].coords[0],wc[i].coords[1]);return d}
function applyOptimizedRoute(di){const day=DAYS[di];const opt=optimizeRoute(day.schedule);if(!opt)return;const withoutCoords=day.schedule.filter(i=>!i.coords);DAYS[di].schedule=[...opt,...withoutCoords];saveToLocal();if(currentView==='route')renderRouteView();else renderDayContent();showToast(`DAY ${di+1} 동선 최적화 완료!`)}

function renderRouteView(){const el=document.getElementById('routeView');let totalTripDist=0;
el.innerHTML='<div class="route-section-title">🧭 전체 동선</div>'+DAYS.map((day,di)=>{const wc=day.schedule.filter(s=>s.coords);const currentDist=calcTotalDist(day.schedule);totalTripDist+=currentDist;const opt=optimizeRoute(day.schedule);const optDist=opt?calcTotalDist(opt):currentDist;const saving=currentDist-optDist;const dayCost=day.schedule.reduce((s,i)=>s+(i.cost||0),0);
if(!wc.length)return`<div class="route-day-card" onclick="selectDay(${di});switchView('timeline')"><div class="route-day-header"><div class="route-day-badge" style="background:${day.color}22;border:2px solid ${day.color};color:${day.color}">D${di+1}</div><div><div class="route-day-title">${esc(day.region)}</div><div class="route-day-date">${day.date}</div></div></div><div style="font-size:10px;color:#475569">위치 정보 없음</div></div>`;
const stops=wc.map((item,i)=>{const t=TYPE_STYLES[item.type]||TYPE_STYLES.etc;let dist='';if(i>0){const d=haversine(wc[i-1].coords[0],wc[i-1].coords[1],item.coords[0],item.coords[1]);dist=`<span class="route-connector"><span class="route-connector-line"></span>↓ ${d<1?(d*1000).toFixed(0)+'m':d.toFixed(1)+'km'}</span>`}return`${dist}<div class="route-stop"><div class="route-stop-num" style="background:${t.dot}33;color:${t.dot}">${i+1}</div><div class="route-stop-name">${esc(item.title)}</div><div class="route-stop-time">${item.time}</div></div>`}).join('');
const hotelItems=wc.filter(s=>s.type==='hotel');const anchorInfo=hotelItems.length?`<div style="font-size:9px;color:#8B5CF6;margin-bottom:4px">🏨 숙소 고정: ${esc(hotelItems[0].title)}${hotelItems.length>1?' → '+esc(hotelItems[hotelItems.length-1].title):''}</div>`:'';
const optBar=saving>0.1?`<div class="optimize-bar">${anchorInfo}<div class="optimize-info">🔄 최적화 시 <strong style="color:#60a5fa">${saving.toFixed(1)}km</strong> 절약 가능 (${currentDist.toFixed(1)}→${optDist.toFixed(1)}km)</div><button class="optimize-btn" onclick="event.stopPropagation();applyOptimizedRoute(${di})">적용</button></div>`:'';
return`<div class="route-day-card" onclick="selectDay(${di});switchView('map')"><div class="route-day-header"><div class="route-day-badge" style="background:${day.color}22;border:2px solid ${day.color};color:${day.color}">D${di+1}</div><div><div class="route-day-title">${esc(day.region)}</div><div class="route-day-date">${day.date}</div></div></div><div class="route-stops">${stops}</div><div class="route-summary"><div class="route-stat">📍 <strong>${wc.length}</strong>곳</div><div class="route-stat">📏 <strong>${currentDist<1?(currentDist*1000).toFixed(0)+'m':currentDist.toFixed(1)+'km'}</strong></div>${dayCost?`<div class="route-stat">💰 <strong>${fmt(dayCost)}</strong></div>`:''}</div>${getTransportBadges(day)}${optBar}</div>`}).join('')+`<div style="text-align:center;padding:16px;font-size:12px;color:#64748b">총 이동거리 약 <strong style="color:#f1f5f9">${totalTripDist.toFixed(0)}km</strong></div>`}

// ══════════ BUDGET ══════════
function switchBudgetSubView(v){budgetSubView=v;renderBudgetView()}
function addExpense(dayIdx){const day=DAYS[dayIdx];if(!day.expenses)day.expenses=[];const desc=document.getElementById('exp-desc-'+dayIdx).value.trim();const amount=parseFloat(document.getElementById('exp-amount-'+dayIdx).value);const cat=document.getElementById('exp-cat-'+dayIdx).value;const cur=document.getElementById('exp-cur-'+dayIdx).value;if(!desc||!amount||amount<=0){showToast('내용과 금액을 입력하세요');return}day.expenses.push({desc,amount,category:cat,currency:cur});saveToLocal();renderBudgetView();showToast('지출 추가')}
function deleteExpense(dayIdx,expIdx){DAYS[dayIdx].expenses.splice(expIdx,1);saveToLocal();renderBudgetView();showToast('지출 삭제')}
function expenseToKRW(exp){return exp.currency==='EUR'?Math.round(exp.amount*EUR_RATE):exp.amount}
function renderBudgetView(){const el=document.getElementById('budgetView');let total=0;const byCat={};
DAYS.forEach(day=>day.schedule.forEach(item=>{if(!item.cost)return;total+=item.cost;const cat=TYPE_STYLES[item.type]?.label||'기타';byCat[cat]=(byCat[cat]||0)+item.cost}));
const catTypeMap={'관광':'spot','맛집':'food','쇼핑':'shopping','항공':'flight','숙소':'hotel','교통':'move','기타':'etc'};const maxCat=Math.max(...Object.values(byCat),1);
const tabsHtml=`<div class="budget-subview-tabs"><button class="budget-subview-tab ${budgetSubView==='plan'?'active':''}" onclick="switchBudgetSubView('plan')">📊 계획</button><button class="budget-subview-tab ${budgetSubView==='expense'?'active':''}" onclick="switchBudgetSubView('expense')">💸 지출</button></div>`;
if(budgetSubView==='plan'){
const chartHtml=`<div class="budget-chart"><div class="budget-chart-title">카테고리별 비용 비율</div>${Object.entries(byCat).sort((a,b)=>b[1]-a[1]).map(([k,v])=>{const pct=Math.round(v/total*100);const tp=catTypeMap[k]||'etc';return`<div class="budget-bar-row"><div class="budget-bar-label">${k}</div><div class="budget-bar-track"><div class="budget-bar-fill budget-bar-${tp}" style="width:${Math.round(v/maxCat*100)}%">${pct}%</div></div></div>`}).join('')}</div>`;
// 일별 추이 차트
const dayCosts=DAYS.map((day,di)=>({di,date:day.date,color:day.color,plan:day.schedule.reduce((s,i)=>s+(i.cost||0),0),actual:(day.expenses||[]).reduce((s,e)=>s+expenseToKRW(e),0)}));
const maxDayCost=Math.max(...dayCosts.map(d=>Math.max(d.plan,d.actual)),1);
const trendHtml=`<div class="budget-trend"><div class="budget-trend-title">📊 일별 비용 추이 (계획 vs 실제)</div><div class="budget-trend-chart">${dayCosts.map(d=>{const planH=Math.max(Math.round(d.plan/maxDayCost*100),d.plan?4:0);const actH=Math.max(Math.round(d.actual/maxDayCost*100),d.actual?4:0);const over=d.actual>d.plan&&d.plan>0;return`<div style="flex:1;display:flex;gap:1px;align-items:flex-end;position:relative"><div class="budget-trend-bar" style="height:${planH}px;background:rgba(245,166,35,.4)" title="계획: ${fmt(d.plan)}"><div class="budget-trend-label">D${d.di+1}</div></div><div class="budget-trend-bar" style="height:${actH}px;background:${over?'rgba(239,68,68,.6)':'rgba(16,185,129,.5)'}" title="실제: ${fmt(d.actual)}"></div></div>`}).join('')}</div><div style="display:flex;gap:12px;margin-top:4px;font-size:9px;justify-content:center"><span style="color:#F5A623">■ 계획</span><span style="color:#10B981">■ 실제</span><span style="color:#EF4444">■ 초과</span></div></div>`;
// 예산 초과 경고
const overDays=dayCosts.filter(d=>d.actual>d.plan&&d.plan>0);
const overWarnHtml=overDays.length?`<div class="budget-over-warn">⚠️ ${overDays.length}일 예산 초과: ${overDays.map(d=>`D${d.di+1}(+${fmt(d.actual-d.plan)})`).join(', ')}</div>`:'';
const totalActualAll=dayCosts.reduce((s,d)=>s+d.actual,0);
const totalOverHtml=totalActualAll>total?`<div class="budget-over-warn">🚨 총 지출이 계획 대비 ${fmt(totalActualAll-total)} 초과! (${Math.round(totalActualAll/total*100)}%)</div>`:'';
el.innerHTML=`<div class="budget-title">💰 예산 관리</div>${tabsHtml}<div class="budget-total"><div class="budget-total-amount">${total.toLocaleString('ko-KR')}원</div><div class="budget-total-label">총 예상 비용 · 약 €${Math.round(total/EUR_RATE).toLocaleString()}</div></div>${totalOverHtml}${overWarnHtml}${trendHtml}${chartHtml}<div class="budget-cats">${Object.entries(byCat).sort((a,b)=>b[1]-a[1]).map(([k,v])=>`<div class="budget-cat"><div class="budget-cat-label">${k}</div><div class="budget-cat-amount">${v.toLocaleString('ko-KR')}원</div></div>`).join('')}</div>${renderTaxRefundWidget()}<div style="font-size:12px;font-weight:700;color:#f1f5f9;margin:16px 0 8px">일별 상세</div>${DAYS.map((day,di)=>{const dc=day.schedule.reduce((s,i)=>s+(i.cost||0),0);if(!dc)return'';return`<div class="budget-day" onclick="selectDay(${di});switchView('timeline')"><div class="budget-day-name" style="color:${day.color}">D${di+1} ${day.date}</div><div class="budget-day-amount">${fmt(dc)}</div></div>`}).join('')}`
}else{
// Expense sub-view
let totalActual=0;const actualByCat={};
DAYS.forEach(day=>(day.expenses||[]).forEach(exp=>{const krw=expenseToKRW(exp);totalActual+=krw;actualByCat[exp.category]=(actualByCat[exp.category]||0)+krw}));
// Compare plan vs actual by category
const allCats=new Set([...Object.keys(byCat),...Object.keys(actualByCat)]);const maxCompare=Math.max(...Object.values(byCat),...Object.values(actualByCat),1);
const compareHtml=`<div class="budget-chart"><div class="budget-chart-title">계획 vs 실제 (카테고리별)</div><div style="display:flex;gap:12px;margin-bottom:8px;font-size:9px"><span style="color:#F5A623">■ 계획</span><span style="color:#10B981">■ 실제</span></div>${[...allCats].map(cat=>{const plan=byCat[cat]||0;const actual=actualByCat[cat]||0;return`<div class="budget-compare"><div class="budget-compare-label">${cat}</div><div class="budget-compare-bar"><div class="budget-compare-fill-plan" style="width:${Math.round(plan/maxCompare*100)}%"></div><div class="budget-compare-fill-actual" style="width:${Math.round(actual/maxCompare*100)}%"></div></div><div class="budget-compare-values">${fmt(plan)} / ${fmt(actual)}</div></div>`}).join('')}</div>`;
const dayExpenses=DAYS.map((day,di)=>{const exps=day.expenses||[];const dayPlan=day.schedule.reduce((s,i)=>s+(i.cost||0),0);const dayActual=exps.reduce((s,e)=>s+expenseToKRW(e),0);
const catOptions=Object.keys(catTypeMap).map(k=>`<option value="${k}">${k}</option>`).join('');
const expList=exps.map((exp,ei)=>`<div class="expense-row"><span class="expense-desc">${esc(exp.desc)}</span><span class="expense-cat">${exp.category}</span><span class="expense-amount">${exp.currency==='EUR'?'€'+exp.amount.toLocaleString():fmt(exp.amount)}${exp.currency==='EUR'?' ('+fmt(expenseToKRW(exp))+')':''}</span><button class="expense-del" onclick="deleteExpense(${di},${ei})">✕</button></div>`).join('');
return`<div style="margin-bottom:12px"><div class="budget-day" style="margin-bottom:4px"><div class="budget-day-name" style="color:${day.color}">D${di+1} ${day.date}</div><div class="budget-day-amount">계획 ${fmt(dayPlan)} / 실제 ${fmt(dayActual)}</div></div>${expList}<div class="expense-add-row"><input class="expense-add-input" id="exp-desc-${di}" placeholder="내용"><input class="expense-add-input" id="exp-amount-${di}" placeholder="금액" type="number" style="max-width:80px"><select class="expense-add-select" id="exp-cat-${di}">${catOptions}</select><select class="expense-add-select" id="exp-cur-${di}"><option value="KRW">₩ KRW</option><option value="EUR">€ EUR</option></select><button class="expense-add-btn" onclick="addExpense(${di})">+</button></div></div>`}).join('');
el.innerHTML=`<div class="budget-title">💸 지출 기록</div>${tabsHtml}<div class="budget-total"><div class="budget-total-amount" style="color:#10B981">${totalActual.toLocaleString('ko-KR')}원</div><div class="budget-total-label">총 실제 지출 · 약 €${Math.round(totalActual/EUR_RATE).toLocaleString()} | 계획 대비 ${total?Math.round(totalActual/total*100):0}%</div></div>${compareHtml}${dayExpenses}`}}

// ══════════ EDIT MODALS ══════════
function openEditModal(idx){if(!editMode)return;editingIdx=idx;const item=DAYS[currentDay].schedule[idx];document.getElementById('modalTitleText').textContent='✏️ 수정';document.getElementById('placeSearchInput').value='';document.getElementById('placeResults').classList.remove('visible');document.getElementById('f-time').value=item.time||'';document.getElementById('f-type').value=item.type||'etc';document.getElementById('f-title').value=item.title||'';document.getElementById('f-placename').value=item.placeName||'';document.getElementById('f-desc').value=item.desc||'';document.getElementById('f-url').value=item.url||'';document.getElementById('f-cost').value=item.cost||'';document.getElementById('f-memo').value=item.memo||'';document.getElementById('f-warn').value=item.warn||'';document.getElementById('f-lat').value=item.coords?item.coords[0]:'';document.getElementById('f-lng').value=item.coords?item.coords[1]:'';document.getElementById('f-status').value=item.status||'';document.getElementById('f-deadline').value=item.deadline||'';document.getElementById('f-booking').value=item.bookingUrl||'';currentRating=item.rating||0;renderRatingStars();document.getElementById('f-review').value=item.review||'';document.getElementById('f-photos').value=(item.photos||[]).join('\n');document.getElementById('modalActions').innerHTML=`<button class="modal-btn modal-btn-delete" onclick="deleteItem(${idx});closeModal()">삭제</button><button class="modal-btn modal-btn-cancel" onclick="closeModal()">취소</button><button class="modal-btn modal-btn-save" onclick="saveItem()">저장</button>`;document.getElementById('modalOverlay').classList.add('visible')}
function openAddModal(){editingIdx=null;document.getElementById('modalTitleText').textContent='➕ 추가';['f-time','f-title','f-placename','f-desc','f-url','f-cost','f-memo','f-warn','f-lat','f-lng','f-booking','f-deadline'].forEach(id=>document.getElementById(id).value='');document.getElementById('placeSearchInput').value='';document.getElementById('placeResults').classList.remove('visible');document.getElementById('f-type').value='spot';document.getElementById('f-status').value='';currentRating=0;renderRatingStars();document.getElementById('f-review').value='';document.getElementById('f-photos').value='';document.getElementById('modalActions').innerHTML='<button class="modal-btn modal-btn-cancel" onclick="closeModal()">취소</button><button class="modal-btn modal-btn-save" onclick="saveItem()">추가</button>';document.getElementById('modalOverlay').classList.add('visible')}
function saveItem(){const item={time:document.getElementById('f-time').value.trim()||'—',type:document.getElementById('f-type').value,title:document.getElementById('f-title').value.trim(),desc:document.getElementById('f-desc').value.trim()};if(!item.title){showToast('제목 필수');return}const placeName=document.getElementById('f-placename').value.trim();if(placeName)item.placeName=placeName;const w=document.getElementById('f-warn').value.trim();if(w)item.warn=w;const url=document.getElementById('f-url').value.trim();if(url)item.url=url;const cost=parseInt(document.getElementById('f-cost').value);if(cost>0)item.cost=cost;const memo=document.getElementById('f-memo').value.trim();if(memo)item.memo=memo;const bookingUrl=document.getElementById('f-booking').value.trim();if(bookingUrl)item.bookingUrl=bookingUrl;const st=document.getElementById('f-status').value;if(st)item.status=st;const dl=document.getElementById('f-deadline').value;if(dl)item.deadline=dl;if(currentRating>0)item.rating=currentRating;const review=document.getElementById('f-review').value.trim();if(review)item.review=review;const photosRaw=document.getElementById('f-photos').value.trim();if(photosRaw)item.photos=photosRaw.split('\n').map(s=>s.trim()).filter(s=>s);
const lat=parseFloat(document.getElementById('f-lat').value),lng=parseFloat(document.getElementById('f-lng').value);if(!isNaN(lat)&&!isNaN(lng))item.coords=[lat,lng];
if(editingIdx!==null){DAYS[currentDay].schedule[editingIdx]=item;showToast('수정 완료')}else{DAYS[currentDay].schedule.push(item);showToast('추가 완료')}DAYS[currentDay].schedule.sort((a,b)=>{if(a.time==='—'&&b.time==='—')return 0;if(a.time==='—')return 1;if(b.time==='—')return -1;return a.time.localeCompare(b.time)});saveToLocal();closeModal();renderDayContent()}
function deleteItem(idx){DAYS[currentDay].schedule.splice(idx,1);saveToLocal();renderDayContent();showToast('삭제')}
function closeModal(){document.getElementById('modalOverlay').classList.remove('visible')}
function openHotelModal(){if(!editMode)return;document.getElementById('h-hotel').value=DAYS[currentDay].hotel||'';document.getElementById('h-region').value=DAYS[currentDay].region||'';document.getElementById('hotelModalOverlay').classList.add('visible')}
function saveHotel(){DAYS[currentDay].hotel=document.getElementById('h-hotel').value.trim()||'—';DAYS[currentDay].region=document.getElementById('h-region').value.trim()||DAYS[currentDay].region;saveToLocal();closeHotelModal();render();showToast('숙소 수정 완료')}
function closeHotelModal(){document.getElementById('hotelModalOverlay').classList.remove('visible')}
function openDayModal(){['d-date','d-region','d-hotel'].forEach(id=>document.getElementById(id).value='');document.getElementById('dayModalOverlay').classList.add('visible')}
function saveDay(){const date=document.getElementById('d-date').value.trim(),region=document.getElementById('d-region').value.trim();if(!date||!region){showToast('날짜와 지역 필수');return}DAYS.push({date,region,color:document.getElementById('d-color').value,hotel:document.getElementById('d-hotel').value.trim()||'—',schedule:[]});saveToLocal();closeDayModal();currentDay=DAYS.length-1;render();showToast('날짜 추가')}
function closeDayModal(){document.getElementById('dayModalOverlay').classList.remove('visible')}
function deleteCurrentDay(){if(DAYS.length<=1){showToast('최소 1일 필요');return}if(!confirm(`DAY ${currentDay+1} (${DAYS[currentDay].date})를 삭제할까요?`))return;DAYS.splice(currentDay,1);if(currentDay>=DAYS.length)currentDay=DAYS.length-1;saveToLocal();render();showToast('날짜 삭제')}

// ══════════ PHRASE CHEATSHEET ══════════
let phraseLang='es';
const PHRASES={es:{name:'스페인어 🇪🇸',sections:{'👋 인사/기본':[
{ko:'안녕하세요',local:'Hola',pron:'올라'},{ko:'감사합니다',local:'Gracias',pron:'그라시아스'},{ko:'부탁합니다/제발',local:'Por favor',pron:'뽀르 파보르'},{ko:'네/아니요',local:'Sí / No',pron:'시 / 노'},{ko:'실례합니다',local:'Perdón / Disculpe',pron:'뻬르돈 / 디스꿀뻬'},{ko:'좋은 하루!',local:'¡Buen día!',pron:'부엔 디아'},{ko:'안녕히 가세요',local:'Adiós',pron:'아디오스'},{ko:'영어 가능하세요?',local:'¿Habla inglés?',pron:'아블라 잉글레스?'}],
'🍽️ 식당':[
{ko:'메뉴 주세요',local:'La carta, por favor',pron:'라 까르따, 뽀르 파보르'},{ko:'이거 주세요',local:'Esto, por favor',pron:'에스또, 뽀르 파보르'},{ko:'계산서 주세요',local:'La cuenta, por favor',pron:'라 꾸엔따, 뽀르 파보르'},{ko:'맛있어요!',local:'¡Está delicioso!',pron:'에스따 델리시오소!'},{ko:'물 주세요',local:'Agua, por favor',pron:'아구아, 뽀르 파보르'},{ko:'맥주/와인 한잔',local:'Una cerveza / Un vino',pron:'우나 세르베사 / 운 비노'},{ko:'예약했습니다',local:'Tengo una reserva',pron:'뗑고 우나 레세르바'},{ko:'2명이요',local:'Para dos, por favor',pron:'빠라 도스, 뽀르 파보르'}],
'🚌 교통/이동':[
{ko:'~어디에 있나요?',local:'¿Dónde está...?',pron:'돈데 에스따...?'},{ko:'얼마나 걸려요?',local:'¿Cuánto tiempo?',pron:'꾸안또 띠엠뽀?'},{ko:'택시 불러주세요',local:'¿Puede llamar un taxi?',pron:'뿌에데 야마르 운 딱시?'},{ko:'여기서 세워주세요',local:'Pare aquí, por favor',pron:'빠레 아끼, 뽀르 파보르'},{ko:'~까지 얼마예요?',local:'¿Cuánto cuesta hasta...?',pron:'꾸안또 꾸에스따 아스따...?'},{ko:'왼쪽/오른쪽',local:'Izquierda / Derecha',pron:'이스끼에르다 / 데레차'}],
'🛍️ 쇼핑':[
{ko:'얼마예요?',local:'¿Cuánto cuesta?',pron:'꾸안또 꾸에스따?'},{ko:'할인 되나요?',local:'¿Tiene descuento?',pron:'띠에네 데스꾸엔또?'},{ko:'카드 되나요?',local:'¿Aceptan tarjeta?',pron:'아셉딴 따르헤따?'},{ko:'택스리펀 되나요?',local:'¿Tax free?',pron:'탁스 프리?'},{ko:'이거 볼 수 있을까요?',local:'¿Puedo ver esto?',pron:'뿌에도 베르 에스또?'}],
'🚨 긴급':[
{ko:'도와주세요!',local:'¡Ayuda!',pron:'아유다!'},{ko:'경찰을 불러주세요',local:'Llame a la policía',pron:'야메 아 라 뽈리시아'},{ko:'병원이 어디에요?',local:'¿Dónde está el hospital?',pron:'돈데 에스따 엘 오스삐딸?'},{ko:'아파요',local:'Me duele',pron:'메 두엘레'},{ko:'여권을 잃어버렸어요',local:'He perdido mi pasaporte',pron:'에 뻬르디도 미 빠사뽀르떼'},{ko:'대사관 전화번호',local:'Embajada de Corea: +34 91 353 2000',pron:''}]}},
pt:{name:'포르투갈어 🇵🇹',sections:{'👋 인사/기본':[
{ko:'안녕하세요',local:'Olá',pron:'올라'},{ko:'감사합니다',local:'Obrigado(a)',pron:'오브리가두(다)'},{ko:'부탁합니다',local:'Por favor',pron:'뽀르 파보르'},{ko:'네/아니요',local:'Sim / Não',pron:'심 / 나웅'},{ko:'실례합니다',local:'Desculpe',pron:'데스쿨프'},{ko:'안녕히 가세요',local:'Adeus',pron:'아데우스'},{ko:'영어 가능하세요?',local:'Fala inglês?',pron:'팔라 잉글레스?'}],
'🍽️ 식당':[
{ko:'메뉴 주세요',local:'A ementa, por favor',pron:'아 에멘따, 뽀르 파보르'},{ko:'계산서 주세요',local:'A conta, por favor',pron:'아 꼰따, 뽀르 파보르'},{ko:'맛있어요!',local:'Está delicioso!',pron:'이스따 델리시오주!'},{ko:'물 주세요',local:'Água, por favor',pron:'아구아, 뽀르 파보르'},{ko:'맥주/와인 한잔',local:'Uma cerveja / Um vinho',pron:'우마 세르베자 / 움 비뉴'},{ko:'2명이요',local:'Para dois, por favor',pron:'빠라 도이스, 뽀르 파보르'}],
'🚌 교통/이동':[
{ko:'~어디에 있나요?',local:'Onde é...?',pron:'온드 에...?'},{ko:'얼마나 걸려요?',local:'Quanto tempo?',pron:'꽌뚜 뗌뿌?'},{ko:'여기서 세워주세요',local:'Pare aqui, por favor',pron:'빠르 아끼, 뽀르 파보르'},{ko:'왼쪽/오른쪽',local:'Esquerda / Direita',pron:'이스께르다 / 디레이따'}],
'🛍️ 쇼핑':[
{ko:'얼마예요?',local:'Quanto custa?',pron:'꽌뚜 꾸스따?'},{ko:'카드 되나요?',local:'Aceita cartão?',pron:'아세이따 까르따웅?'}],
'🚨 긴급':[
{ko:'도와주세요!',local:'Ajuda!',pron:'아주다!'},{ko:'경찰을 불러주세요',local:'Chame a polícia',pron:'샤미 아 뽈리시아'},{ko:'병원이 어디에요?',local:'Onde é o hospital?',pron:'온드 에 우 오스피따우?'},{ko:'대사관 전화번호',local:'Embaixada da Coreia: +351 21 793 7200',pron:''}]}}};
function renderPhraseView(){const el=document.getElementById('phraseView');const lang=PHRASES[phraseLang];
const tabs=`<div class="phrase-lang-tabs">${Object.entries(PHRASES).map(([k,v])=>`<button class="phrase-lang-tab ${k===phraseLang?'active':''}" onclick="phraseLang='${k}';renderPhraseView()">${v.name}</button>`).join('')}</div>`;
const sections=Object.entries(lang.sections).map(([title,phrases])=>`<div class="phrase-section"><div class="phrase-section-title">${title}</div>${phrases.map(p=>`<div class="phrase-card" onclick="if(speechSynthesis){const u=new SpeechSynthesisUtterance('${p.local.replace(/'/g,"\\'")}');u.lang='${phraseLang}';speechSynthesis.speak(u)}"><div class="phrase-ko">${esc(p.ko)}</div><div class="phrase-local">${esc(p.local)}</div>${p.pron?`<div class="phrase-pron">🔊 ${esc(p.pron)}</div>`:''}</div>`).join('')}</div>`).join('');
el.innerHTML=`<div class="prep-title">🗣️ 현지어 치트시트</div>${tabs}<div style="font-size:10px;color:#64748b;margin-bottom:12px">💡 카드를 탭하면 발음을 들을 수 있어요 (TTS)</div>${sections}`}

// ══════════ REVIEW/RATING ══════════
let currentRating=0;
function setRating(e){const star=e.target.closest('[data-r]');if(!star)return;currentRating=parseInt(star.dataset.r);renderRatingStars()}
function renderRatingStars(){const el=document.getElementById('f-rating-stars');if(!el)return;el.querySelectorAll('[data-r]').forEach(s=>{s.textContent=parseInt(s.dataset.r)<=currentRating?'★':'☆';s.style.color=parseInt(s.dataset.r)<=currentRating?'#F5A623':'#475569'})}
function openPhotoModal(url){const m=document.getElementById('photoModal');m.querySelector('img').src=url;m.classList.add('visible')}

// ══════════ IMPORT/EXPORT ══════════
function exportData(){const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([JSON.stringify(DAYS,null,2)],{type:'application/json'}));a.download='여행일정_'+new Date().toISOString().slice(0,10)+'.json';a.click();URL.revokeObjectURL(a.href);showToast('저장 완료')}
function importData(e){const f=e.target.files[0];if(!f)return;const r=new FileReader();r.onload=x=>{try{const d=JSON.parse(x.target.result);if(Array.isArray(d)&&d.length){DAYS=d;currentDay=0;saveToLocal();render();showToast('불러오기 완료')}}catch(e){showToast('파싱 오류')}};r.readAsText(f);e.target.value=''}

// ══════════ NAV ══════════
function selectDay(i){currentDay=i;currentFilter='all';render();if(currentView==='map')updateMap();window.scrollTo({top:0,behavior:'smooth'})}
function setFilter(f){currentFilter=f;renderDayContent()}

// ══════════ SEARCH ══════════
function openSearch(){document.getElementById('searchOverlay').classList.add('visible');const inp=document.getElementById('searchInput');inp.value='';inp.focus();document.getElementById('searchResults').innerHTML='<div class="search-empty">검색어를 입력하세요</div>'}
function closeSearch(){document.getElementById('searchOverlay').classList.remove('visible')}
function performSearch(q){const el=document.getElementById('searchResults');if(!q||q.length<1){el.innerHTML='<div class="search-empty">검색어를 입력하세요</div>';return}const lq=q.toLowerCase();const results=[];DAYS.forEach((day,di)=>{day.schedule.forEach((item,ii)=>{const hay=[item.title,item.desc,item.memo||'',item.warn||''].join(' ').toLowerCase();if(hay.includes(lq))results.push({di,ii,day,item})})});if(!results.length){el.innerHTML='<div class="search-empty">결과 없음</div>';return}el.innerHTML=results.slice(0,30).map(r=>`<div class="search-result" onclick="closeSearch();selectDay(${r.di});switchView('timeline')"><div class="search-result-day">DAY ${r.di+1} · ${esc(r.day.date)}</div><div class="search-result-title">${esc(r.item.title)}</div><div class="search-result-desc">${esc(r.item.desc)}</div></div>`).join('')}

// ══════════ CONTEXT MENU (복사/이동) ══════════
let ctxDay=null,ctxIdx=null,longPressTimer=null;
function showContextMenu(e,dayIdx,itemIdx){e.preventDefault();e.stopPropagation();ctxDay=dayIdx;ctxIdx=itemIdx;const menu=document.getElementById('ctxMenu');const item=DAYS[dayIdx].schedule[itemIdx];const dayList=DAYS.map((d,i)=>i===dayIdx?'':`<div class="ctx-menu-day" onclick="copyItemTo(${i})">DAY ${i+1} ${esc(d.date)}</div>`).join('');const moveList=DAYS.map((d,i)=>i===dayIdx?'':`<div class="ctx-menu-day" onclick="moveItemTo(${i})">DAY ${i+1} ${esc(d.date)}</div>`).join('');
menu.innerHTML=`<div class="ctx-menu-item" onclick="duplicateItem()">📋 복제 (같은 날)</div><div class="ctx-menu-sep"></div><div class="ctx-menu-item" style="color:#64748b;font-size:10px;cursor:default">📄 다른 날로 복사</div><div class="ctx-menu-days">${dayList}</div><div class="ctx-menu-sep"></div><div class="ctx-menu-item" style="color:#64748b;font-size:10px;cursor:default">➡️ 다른 날로 이동</div><div class="ctx-menu-days">${moveList}</div>`;
const x=Math.min(e.clientX||e.pageX,window.innerWidth-200),y=Math.min(e.clientY||e.pageY,window.innerHeight-300);menu.style.left=x+'px';menu.style.top=y+'px';menu.classList.add('visible')}
function hideContextMenu(){document.getElementById('ctxMenu').classList.remove('visible')}
function duplicateItem(){if(ctxDay===null)return;const item=JSON.parse(JSON.stringify(DAYS[ctxDay].schedule[ctxIdx]));DAYS[ctxDay].schedule.splice(ctxIdx+1,0,item);saveToLocal();renderDayContent();hideContextMenu();showToast('복제 완료')}
function copyItemTo(targetDay){if(ctxDay===null)return;const item=JSON.parse(JSON.stringify(DAYS[ctxDay].schedule[ctxIdx]));DAYS[targetDay].schedule.push(item);saveToLocal();hideContextMenu();showToast(`DAY ${targetDay+1}로 복사 완료`)}
function moveItemTo(targetDay){if(ctxDay===null)return;const item=DAYS[ctxDay].schedule.splice(ctxIdx,1)[0];DAYS[targetDay].schedule.push(item);saveToLocal();renderDayContent();hideContextMenu();showToast(`DAY ${targetDay+1}로 이동 완료`)}

// ══════════ PLACE SEARCH (Nominatim) ══════════
let placeSearchTimeout=null;
function onPlaceSearch(q){clearTimeout(placeSearchTimeout);const el=document.getElementById('placeResults');if(!q||q.length<2){el.classList.remove('visible');return}placeSearchTimeout=setTimeout(()=>{fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(q)}&format=json&limit=5&accept-language=ko`).then(r=>r.json()).then(data=>{if(!data.length){el.innerHTML='<div class="place-result-item" style="color:#64748b">결과 없음</div>';el.classList.add('visible');return}el.innerHTML=data.map((p,i)=>`<div class="place-result-item" onclick="selectPlace(${i})"><div>${esc(p.display_name.split(',')[0])}</div><div class="place-result-sub">${esc(p.display_name)}</div></div>`).join('');el.classList.add('visible');el._data=data}).catch(()=>{el.innerHTML='<div class="place-result-item" style="color:#64748b">검색 오류</div>';el.classList.add('visible')})},400)}
function selectPlace(idx){const el=document.getElementById('placeResults');const p=el._data&&el._data[idx];if(!p)return;const name=p.display_name.split(',')[0];if(!document.getElementById('f-title').value)document.getElementById('f-title').value=name;document.getElementById('f-placename').value=name;document.getElementById('f-lat').value=parseFloat(p.lat).toFixed(6);document.getElementById('f-lng').value=parseFloat(p.lon).toFixed(6);const shortDesc=p.display_name.split(',').slice(1,3).join(',').trim();if(!document.getElementById('f-desc').value)document.getElementById('f-desc').value=shortDesc;el.classList.remove('visible');document.getElementById('placeSearchInput').value=''}

// ══════════ EXCHANGE RATE ══════════
function fetchExchangeRate(){fetch('https://api.exchangerate-api.com/v4/latest/EUR').then(r=>r.json()).then(data=>{if(data&&data.rates&&data.rates.KRW){EUR_RATE=Math.round(data.rates.KRW);document.getElementById('currencyRate').textContent=`1 EUR = ${EUR_RATE.toLocaleString()} KRW (실시간)`;showToast(`환율 업데이트: 1€ = ${EUR_RATE.toLocaleString()}원`)}}).catch(()=>{})}

// ══════════ ITEM REORDER ══════════
function moveItem(idx,dir){const sched=DAYS[currentDay].schedule;const newIdx=idx+dir;if(newIdx<0||newIdx>=sched.length)return;[sched[idx],sched[newIdx]]=[sched[newIdx],sched[idx]];saveToLocal();renderDayContent()}

// ══════════ DRAG & DROP ══════════
(function(){let dragSrcIdx=null,ghost=null,lastOverIdx=null;
function getTimelineItems(){return document.querySelectorAll('.timeline-item[data-idx]')}
function onPointerDown(e){if(!editMode)return;const handle=e.target.closest('.drag-handle');if(!handle)return;e.preventDefault();e.stopPropagation();const item=handle.closest('.timeline-item');dragSrcIdx=parseInt(item.dataset.idx);item.classList.add('dragging');
ghost=item.querySelector('.timeline-card').cloneNode(true);ghost.className='drag-ghost';ghost.style.width=item.querySelector('.timeline-card').offsetWidth+'px';document.body.appendChild(ghost);moveGhost(e);
document.addEventListener('pointermove',onPointerMove);document.addEventListener('pointerup',onPointerUp);document.addEventListener('pointercancel',onPointerUp)}
function moveGhost(e){if(!ghost)return;ghost.style.left=(e.clientX-20)+'px';ghost.style.top=(e.clientY-20)+'px'}
function onPointerMove(e){e.preventDefault();moveGhost(e);const items=getTimelineItems();let overIdx=null,insertBefore=true;items.forEach(el=>{el.classList.remove('drag-over-above','drag-over-below');const r=el.getBoundingClientRect();if(e.clientY>=r.top&&e.clientY<=r.bottom){overIdx=parseInt(el.dataset.idx);insertBefore=e.clientY<r.top+r.height/2;el.classList.add(insertBefore?'drag-over-above':'drag-over-below')}});lastOverIdx=overIdx!==null?{idx:overIdx,before:insertBefore}:null}
function onPointerUp(e){document.removeEventListener('pointermove',onPointerMove);document.removeEventListener('pointerup',onPointerUp);document.removeEventListener('pointercancel',onPointerUp);if(ghost){ghost.remove();ghost=null}getTimelineItems().forEach(el=>el.classList.remove('dragging','drag-over-above','drag-over-below'));
if(dragSrcIdx!==null&&lastOverIdx!==null&&lastOverIdx.idx!==dragSrcIdx){const sched=DAYS[currentDay].schedule;const item=sched.splice(dragSrcIdx,1)[0];let targetIdx=lastOverIdx.idx;if(dragSrcIdx<targetIdx)targetIdx--;if(!lastOverIdx.before)targetIdx++;sched.splice(targetIdx,0,item);saveToLocal();showToast('순서 변경 완료')}dragSrcIdx=null;lastOverIdx=null;renderDayContent()}
document.getElementById('timeline').addEventListener('pointerdown',onPointerDown)})();

// ══════════ LIGHT/DARK MODE ══════════
function toggleTheme(){const isDark=document.body.classList.toggle('dark-mode');localStorage.setItem('travel_theme',isDark?'dark':'light');document.getElementById('themeToggleBtn').textContent=isDark?'☀️':'🌙'}
function restoreTheme(){try{const legacy=localStorage.getItem('travel_light_mode');if(legacy!==null)localStorage.removeItem('travel_light_mode')}catch(e){}const t=localStorage.getItem('travel_theme');if(t==='dark'){document.body.classList.add('dark-mode');document.getElementById('themeToggleBtn').textContent='☀️'}else{document.getElementById('themeToggleBtn').textContent='🌙'}}

// ══════════ PRINT / PDF ══════════
function printSchedule(){window.print()}
function exportPDF(){
const win=window.open('','_blank');if(!win){showToast('팝업 차단됨 — 허용해주세요');return}
// 집계
let grandTotal=0;const byCat={};let totalStops=0,coordStops=0;
DAYS.forEach(day=>day.schedule.forEach(item=>{if(item.cost){grandTotal+=item.cost;const cat=TYPE_STYLES[item.type]?.label||'기타';byCat[cat]=(byCat[cat]||0)+item.cost}totalStops++;if(item.coords)coordStops++}));
const confirmedCnt=DAYS.reduce((s,d)=>s+d.schedule.filter(i=>i.status==='confirmed').length,0);
const unbookedCnt=DAYS.reduce((s,d)=>s+d.schedule.filter(i=>i.status==='unbooked'||(i.warn&&/예약|확인|필수|권장/.test(i.warn)&&!i.status)).length,0);
const today=new Date().toLocaleDateString('ko-KR');
let html=`<!DOCTYPE html><html lang="ko"><head><meta charset="UTF-8"><title>여행 일정표 — 스페인·포르투갈</title>
<style>@import url('https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@400;500;600;700;800&display=swap');
@page{size:A4;margin:14mm 12mm}
*{margin:0;padding:0;box-sizing:border-box;-webkit-print-color-adjust:exact;print-color-adjust:exact}
body{font-family:'Noto Sans KR',sans-serif;color:#1e293b;font-size:11px;line-height:1.55}
.pdf-page{page-break-after:always}
.pdf-page:last-child{page-break-after:auto}
/* 표지/요약 */
.pdf-cover{text-align:center;padding:40px 20px 24px;border-bottom:3px solid #E8725A;margin-bottom:22px}
.pdf-cover-title{font-size:28px;font-weight:800;color:#E8725A;letter-spacing:-.5px;margin-bottom:6px}
.pdf-cover-sub{font-size:14px;color:#475569;font-weight:600}
.pdf-cover-meta{font-size:11px;color:#94a3b8;margin-top:10px}
.summary-grid{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:20px}
.summary-card{border:1px solid #e2e8f0;border-radius:10px;padding:14px;background:#fafbfc}
.summary-label{font-size:9px;color:#94a3b8;font-weight:600;text-transform:uppercase;letter-spacing:.4px}
.summary-value{font-size:20px;font-weight:800;color:#1e293b;margin-top:3px;letter-spacing:-.3px}
.summary-hint{font-size:9px;color:#64748b;margin-top:2px}
.summary-title{font-size:13px;font-weight:800;color:#1e293b;margin:16px 0 8px;padding-bottom:4px;border-bottom:1px solid #e2e8f0}
.cat-row{display:flex;justify-content:space-between;padding:6px 0;border-bottom:1px dashed #f1f5f9;font-size:11px}
.cat-row:last-child{border-bottom:none}
.cat-row strong{color:#E8725A;font-weight:700}
/* 하루 페이지 */
.day-page{page-break-before:always;padding-top:4px}
.day-page:first-of-type{page-break-before:auto}
.day-banner{padding:12px 16px;border-radius:10px;color:#fff;margin-bottom:12px;box-shadow:0 2px 6px rgba(0,0,0,.06)}
.day-banner-num{font-size:11px;opacity:.85;font-weight:700;letter-spacing:.5px}
.day-banner-region{font-size:18px;font-weight:800;margin-top:2px}
.day-banner-date{font-size:10px;opacity:.9;margin-top:2px}
.day-meta-row{display:flex;gap:10px;margin-bottom:10px;font-size:10px}
.day-meta-chip{padding:4px 10px;border-radius:6px;background:#f1f5f9;color:#475569;font-weight:600}
.day-hotel{font-size:10px;color:#7c3aed;background:#f5f3ff;padding:6px 12px;border-radius:8px;margin-bottom:10px;white-space:pre-line;border-left:3px solid #8B5CF6}
.item-row{display:flex;gap:10px;padding:8px 0;border-bottom:1px solid #f1f5f9;page-break-inside:avoid}
.item-row:last-child{border-bottom:none}
.item-time{width:48px;font-weight:700;color:#334155;flex-shrink:0;font-size:10px;font-variant-numeric:tabular-nums}
.item-dot{width:9px;height:9px;border-radius:50%;flex-shrink:0;margin-top:4px}
.item-content{flex:1;min-width:0}
.item-title{font-weight:700;font-size:11px;color:#0f172a}
.item-desc{color:#64748b;font-size:9.5px;white-space:pre-line;margin-top:1px}
.item-memo{color:#8b5cf6;font-size:9px;margin-top:3px;padding:3px 7px;background:#f5f3ff;border-radius:4px;display:inline-block}
.item-link{color:#3b82f6;font-size:9px;text-decoration:none;word-break:break-all}
.item-link-row{margin-top:3px;display:flex;flex-wrap:wrap;gap:8px}
.item-badges{display:flex;gap:4px;flex-wrap:wrap;margin-top:4px}
.item-badge{font-size:8px;padding:2px 6px;border-radius:3px;font-weight:700}
.badge-warn{background:#fef2f2;color:#dc2626;border:1px solid #fecaca}
.badge-confirmed{background:#f0fdf4;color:#16a34a;border:1px solid #bbf7d0}
.badge-pending{background:#fffbeb;color:#d97706;border:1px solid #fde68a}
.badge-unbooked{background:#f1f5f9;color:#475569;border:1px solid #cbd5e1}
.badge-cost{background:#fffbeb;color:#d97706}
.badge-deadline{background:#fee2e2;color:#b91c1c;border:1px solid #fca5a5}
.day-total{text-align:right;padding:8px 12px;background:#fffbeb;border-radius:6px;margin-top:10px;font-size:11px;color:#92400e;font-weight:700}
.pdf-footer{text-align:center;color:#94a3b8;font-size:9px;margin-top:24px;padding-top:10px;border-top:1px solid #e2e8f0}
</style></head><body>`;
// ─── 1쪽: 표지 + 전체 요약 ───
html+=`<div class="pdf-page"><div class="pdf-cover"><div class="pdf-cover-title">🇪🇸 스페인 · 포르투갈 여행 🇵🇹</div><div class="pdf-cover-sub">2026.09.13 — 09.26 · 14일</div><div class="pdf-cover-meta">생성일: ${today}</div></div>`;
html+=`<div class="summary-grid">`;
html+=`<div class="summary-card"><div class="summary-label">총 예상 비용</div><div class="summary-value">${fmt(grandTotal)}</div><div class="summary-hint">약 €${Math.round(grandTotal/EUR_RATE).toLocaleString()} (1€ ≈ ${EUR_RATE.toLocaleString()}원)</div></div>`;
html+=`<div class="summary-card"><div class="summary-label">총 일정</div><div class="summary-value">${totalStops}건</div><div class="summary-hint">📍 위치 등록 ${coordStops}건 · ${DAYS.length}일</div></div>`;
html+=`<div class="summary-card"><div class="summary-label">예약 확정</div><div class="summary-value" style="color:#16a34a">${confirmedCnt}건</div><div class="summary-hint">전체 일정 대비 ${totalStops?Math.round(confirmedCnt/totalStops*100):0}%</div></div>`;
html+=`<div class="summary-card"><div class="summary-label">미예약/확인필요</div><div class="summary-value" style="color:${unbookedCnt?'#dc2626':'#16a34a'}">${unbookedCnt}건</div><div class="summary-hint">${unbookedCnt?'출국 전 예약 완료 필요':'모두 예약 완료 ✓'}</div></div>`;
html+=`</div>`;
// 카테고리 비용 요약
html+=`<div class="summary-title">💰 카테고리별 예상 비용</div>`;
Object.entries(byCat).sort((a,b)=>b[1]-a[1]).forEach(([k,v])=>{const pct=grandTotal?Math.round(v/grandTotal*100):0;html+=`<div class="cat-row"><span>${k}</span><span><strong>${fmt(v)}</strong> <span style="color:#94a3b8">(${pct}%)</span></span></div>`});
// 일자별 개요
html+=`<div class="summary-title">📅 일자별 개요</div>`;
DAYS.forEach((day,di)=>{const dc=day.schedule.reduce((s,i)=>s+(i.cost||0),0);html+=`<div class="cat-row"><span><strong style="color:${day.color}">D${di+1}</strong> · ${esc(day.date)} — ${esc(day.region)}</span><span>${day.schedule.length}건${dc?' · '+fmt(dc):''}</span></div>`});
html+=`</div>`;
// ─── 각 날짜 페이지 ───
DAYS.forEach((day,di)=>{const dc=day.schedule.reduce((s,i)=>s+(i.cost||0),0);
html+=`<div class="day-page"><div class="day-banner" style="background:linear-gradient(135deg,${day.color},${day.color}cc)"><div class="day-banner-num">DAY ${di+1} / ${DAYS.length}</div><div class="day-banner-region">${esc(day.region)}</div><div class="day-banner-date">${esc(day.date)}</div></div>`;
html+=`<div class="day-meta-row"><span class="day-meta-chip">📍 ${day.schedule.length}개 일정</span>${dc?`<span class="day-meta-chip">💰 예상 ${fmt(dc)}</span>`:''}</div>`;
if(day.hotel&&day.hotel!=='—')html+=`<div class="day-hotel">🏨 ${esc(day.hotel)}</div>`;
day.schedule.forEach(item=>{const t=TYPE_STYLES[item.type]||TYPE_STYLES.etc;let badges='';
if(item.status==='confirmed')badges+='<span class="item-badge badge-confirmed">✅ 확정</span>';
else if(item.status==='pending')badges+='<span class="item-badge badge-pending">🟡 진행중</span>';
else if(item.status==='unbooked')badges+='<span class="item-badge badge-unbooked">⬜ 미예약</span>';
if(item.deadline){const n=daysUntilDeadline(item.deadline);if(n!==null)badges+=`<span class="item-badge badge-deadline">⏰ ${n<0?`마감 ${-n}일 경과`:n===0?'오늘 마감':'D-'+n} (${esc(item.deadline)})</span>`}
if(item.warn)badges+=`<span class="item-badge badge-warn">⚠️ ${esc(item.warn)}</span>`;
if(item.cost)badges+=`<span class="item-badge badge-cost">${fmt(item.cost)}</span>`;
let links='';
if(item.bookingUrl)links+=`<a class="item-link" href="${esc(item.bookingUrl)}">📄 바우처</a>`;
if(item.url)links+=`<a class="item-link" href="${esc(item.url)}">🔗 예약링크</a>`;
if(item.coords){const pn=extractPlaceName(item,day);links+=`<a class="item-link" href="${gmapsUrl(item.coords,pn)}">📍 지도</a>`}
html+=`<div class="item-row"><div class="item-time">${esc(item.time||'—')}</div><div class="item-dot" style="background:${t.dot}"></div><div class="item-content"><div class="item-title">${esc(item.title)}</div>${item.desc?`<div class="item-desc">${esc(item.desc)}</div>`:''}${item.memo?`<div class="item-memo">📝 ${esc(item.memo)}</div>`:''}${badges?'<div class="item-badges">'+badges+'</div>':''}${links?'<div class="item-link-row">'+links+'</div>':''}</div></div>`});
if(dc)html+=`<div class="day-total">DAY ${di+1} 예상 합계 · ${fmt(dc)}</div>`;
html+=`</div>`});
html+=`<div class="pdf-footer">Travel Planner · ${today} · 총 ${DAYS.length}일 / ${totalStops}건 / ${fmt(grandTotal)}</div>`;
html+=`</body></html>`;
win.document.write(html);win.document.close();setTimeout(()=>win.print(),600)}

// ══════════ VOUCHER BULK OPEN ══════════
function openAllVouchers(){const urls=[];DAYS.forEach(day=>day.schedule.forEach(item=>{if(item.bookingUrl)urls.push(item.bookingUrl)}));if(!urls.length){showToast('바우처가 없습니다');return}if(urls.length>6&&!confirm(`${urls.length}개 탭을 엽니다. 계속할까요?`))return;urls.forEach((u,i)=>setTimeout(()=>window.open(u,'_blank','noopener'),i*80));showToast(`바우처 ${urls.length}개 열기`)}

// ══════════ PREP VIEW (준비 탭) ══════════
function renderPrepView(){const el=document.getElementById('prepView');const unbooked=[],pending=[],confirmed=[],cancelled=[],transportByDay=[];
DAYS.forEach((day,di)=>{const transports=[];day.schedule.forEach(item=>{
if(item.status==='unbooked')unbooked.push({di,item});
else if(item.status==='pending')pending.push({di,item});
else if(item.status==='confirmed')confirmed.push({di,item});
else if(item.status==='cancelled')cancelled.push({di,item});
else if(item.warn&&/예약|확인|필수|권장/.test(item.warn))unbooked.push({di,item});
if(item.type==='move'||item.type==='flight')transports.push(item)});if(transports.length)transportByDay.push({di,day,transports})});
const mkCard=(arr,cls)=>arr.map(u=>`<div class="prep-card ${cls}" onclick="selectDay(${u.di});switchView('timeline')"><div class="prep-card-title">${esc(u.item.title)}${u.item.status?` <span class="status-badge ${STATUS_CSS[u.item.status]}" style="font-size:8px">${STATUS_LABELS[u.item.status]}</span>`:''}${u.item.deadline&&u.item.status!=='confirmed'&&u.item.status!=='cancelled'?' '+deadlineBadgeHtml(u.item.deadline):''}</div><div class="prep-card-meta">DAY ${u.di+1} · ${esc(DAYS[u.di].date)}${u.item.warn?' · '+esc(u.item.warn):''}</div></div>`).join('');
// H2 · 바우처 보관함: bookingUrl 또는 url 보유 항목
const vouchers=[];DAYS.forEach((day,di)=>day.schedule.forEach(item=>{if(item.bookingUrl||item.url)vouchers.push({di,day,item})}));
const voucherOpenAll=vouchers.length?`<button class="voucher-open-all" onclick="openAllVouchers()">📂 바우처 전체 열기 (${vouchers.filter(v=>v.item.bookingUrl).length})</button>`:'';
const voucherHtml=vouchers.length?vouchers.map(v=>{const it=v.item;const b=it.bookingUrl?`<a class="voucher-link voucher-link-booking" href="${esc(it.bookingUrl)}" target="_blank" rel="noopener" onclick="event.stopPropagation()">📄 바우처</a>`:'';const u=it.url?`<a class="voucher-link voucher-link-url" href="${esc(it.url)}" target="_blank" rel="noopener" onclick="event.stopPropagation()">🔗 예약</a>`:'';const st=it.status&&STATUS_LABELS[it.status]?`<span class="status-badge ${STATUS_CSS[it.status]}" style="font-size:8px">${STATUS_LABELS[it.status]}</span>`:'';const t=TYPE_STYLES[it.type]||TYPE_STYLES.etc;return`<div class="voucher-card" onclick="selectDay(${v.di});switchView('timeline')"><div class="voucher-card-dot" style="background:${t.dot}"></div><div class="voucher-card-body"><div class="voucher-card-title">${esc(it.title)} ${st}</div><div class="voucher-card-meta">DAY ${v.di+1} · ${esc(v.day.date)}${it.time&&it.time!=='—'?' · '+esc(it.time):''}</div></div><div class="voucher-card-actions">${b}${u}</div></div>`}).join(''):'<div class="prep-card" style="color:#64748b">등록된 바우처 없음 — 일정 편집에서 바우처 링크를 추가하세요</div>';
const packingHtml=renderPackingList();
const shoppingHtml=renderShoppingList();
el.innerHTML=`<div class="prep-title">📋 여행 준비 체크리스트</div>
<div class="prep-section"><div class="prep-section-title">📎 내 바우처 (${vouchers.length}건) ${voucherOpenAll}</div>${voucherHtml}</div>
<div class="prep-section"><div class="prep-section-title">⬜ 미예약 (${unbooked.length}건)</div>${unbooked.length?mkCard(unbooked,'prep-warn'):'<div class="prep-card prep-ok">미예약 항목 없음 ✓</div>'}</div>
<div class="prep-section"><div class="prep-section-title">🟡 진행중 (${pending.length}건)</div>${pending.length?mkCard(pending,''):'<div class="prep-card" style="color:#64748b">진행중 항목 없음</div>'}</div>
<div class="prep-section"><div class="prep-section-title">✅ 확정 (${confirmed.length}건)</div>${confirmed.length?mkCard(confirmed,'prep-ok'):'<div class="prep-card" style="color:#64748b">확정 항목 없음</div>'}</div>
${cancelled.length?`<div class="prep-section"><div class="prep-section-title">❌ 취소 (${cancelled.length}건)</div>${mkCard(cancelled,'')}</div>`:''}
<div class="prep-section"><div class="prep-section-title">🚌 일별 교통 요약</div>${transportByDay.map(td=>`<div class="prep-card" onclick="selectDay(${td.di});switchView('timeline')"><div class="prep-card-title">DAY ${td.di+1} · ${esc(td.day.date)}</div><div class="prep-card-meta">${td.transports.map(t=>esc(t.title)).join(' → ')}</div></div>`).join('')||'<div class="prep-card" style="color:#64748b">교통 일정 없음</div>'}</div>
<div style="border-top:1px solid rgba(255,255,255,.06);margin-top:16px;padding-top:16px"><div class="prep-title">🛍️ 쇼핑 리스트</div>${shoppingHtml}</div>
<div style="border-top:1px solid rgba(255,255,255,.06);margin-top:16px;padding-top:16px"><div class="prep-title">🧳 패킹 리스트</div>${packingHtml}</div>`}

// ══════════ CONFLICT HIGHLIGHT ══════════
function highlightConflicts(oldJson,newDays){try{const old=JSON.parse(oldJson);newDays.forEach((day,i)=>{if(JSON.stringify(day)!==JSON.stringify(old[i])){const btns=document.querySelectorAll('.day-btn');if(btns[i])btns[i].classList.add('conflict-flash');setTimeout(()=>{if(btns[i])btns[i].classList.remove('conflict-flash')},2000)}})}catch(e){}}

// ══════════ MAP CLICK ADD ══════════
function openAddModalWithCoords(lat,lng){if(map)map.closePopup();openAddModal();document.getElementById('f-lat').value=lat;document.getElementById('f-lng').value=lng}

// ══════════ TRANSPORT BADGES ══════════
function getTransportBadges(day){const counts={};day.schedule.forEach(item=>{if(item.type!=='move'&&item.type!=='flight')return;const desc=(item.title+' '+item.desc).toLowerCase();let tp='other';if(/지하철|메트로|metro/.test(desc))tp='metro';else if(/버스|셔틀|bus|에어로/.test(desc))tp='bus';else if(/택시|taxi|우버/.test(desc))tp='taxi';else if(/도보|걸어|walk/.test(desc))tp='walk';else if(/렌트|자동차|드라이브|car/.test(desc))tp='car';else if(/기차|열차|train|kTX/.test(desc))tp='train';else if(/비행|✈️|flight|항공/.test(desc))tp='flight';counts[tp]=(counts[tp]||0)+1});const labels={metro:'🚇 지하철',bus:'🚌 버스',taxi:'🚕 택시',walk:'🚶 도보',car:'🚗 자동차',train:'🚂 기차',flight:'✈️ 항공',other:'🔄 기타'};const entries=Object.entries(counts);if(!entries.length)return'';return`<div style="margin-top:6px">${entries.map(([k,v])=>`<span class="transport-badge transport-badge-${k}">${labels[k]||k} ×${v}</span>`).join('')}</div>`}

// ══════════ PACKING LIST ══════════
function loadPackingList(){try{const d=localStorage.getItem('travel_packing_list');if(d)return JSON.parse(d)}catch(e){}// Build default
const list={};Object.entries(DEFAULT_PACKING).forEach(([cat,items])=>{list[cat]=items.map(name=>({name,checked:false,custom:false}))});return list}
function savePackingList(list){try{localStorage.setItem('travel_packing_list',JSON.stringify(list))}catch(e){}}
function togglePackingItem(cat,idx){const list=loadPackingList();if(list[cat]&&list[cat][idx]){list[cat][idx].checked=!list[cat][idx].checked;savePackingList(list);renderPrepView()}}
function addPackingItem(){const input=document.getElementById('packing-new-item');const catSel=document.getElementById('packing-new-cat');const name=input.value.trim();const cat=catSel.value;if(!name){showToast('아이템명을 입력하세요');return}const list=loadPackingList();if(!list[cat])list[cat]=[];list[cat].push({name,checked:false,custom:true});savePackingList(list);showToast('아이템 추가');renderPrepView()}
function deletePackingItem(cat,idx){const list=loadPackingList();if(list[cat]&&list[cat][idx]&&list[cat][idx].custom){list[cat].splice(idx,1);if(!list[cat].length)delete list[cat];savePackingList(list);showToast('아이템 삭제');renderPrepView()}}
function renderPackingList(){const list=loadPackingList();const cats=Object.keys(DEFAULT_PACKING);Object.keys(list).forEach(k=>{if(!cats.includes(k))cats.push(k)});
const totalItems=Object.values(list).reduce((s,arr)=>s+arr.length,0);const checkedItems=Object.values(list).reduce((s,arr)=>s+arr.filter(i=>i.checked).length,0);
const catOptions=cats.map(c=>`<option value="${c}">${c}</option>`).join('');
let html=`<div style="font-size:11px;color:#64748b;margin-bottom:10px">${checkedItems}/${totalItems} 준비 완료</div>`;
cats.forEach(cat=>{const items=list[cat]||[];if(!items.length)return;html+=`<div class="packing-section"><div class="packing-section-title">${cat}</div>`;items.forEach((item,i)=>{html+=`<div class="packing-item ${item.checked?'packed':''}" onclick="togglePackingItem('${esc(cat)}',${i})"><span class="packing-check ${item.checked?'checked':''}">${item.checked?'✓':''}</span><span class="packing-item-text">${esc(item.name)}</span>${item.custom?`<button class="packing-del" onclick="event.stopPropagation();deletePackingItem('${esc(cat)}',${i})">✕</button>`:''}</div>`});html+=`</div>`});
html+=`<div class="packing-add-row"><input class="packing-add-input" id="packing-new-item" placeholder="새 아이템"><select class="packing-add-cat" id="packing-new-cat">${catOptions}</select><button class="packing-add-btn" onclick="addPackingItem()">+ 추가</button></div>`;
return html}

// ══════════ SHOPPING LIST ══════════
function loadShoppingList(){try{const d=localStorage.getItem('travel_shopping_list');if(d)return JSON.parse(d)}catch(e){}
const list={};Object.entries(DEFAULT_SHOPPING).forEach(([cat,items])=>{list[cat]=items.map(name=>({name,checked:false,custom:false}))});return list}
function saveShoppingList(list){try{localStorage.setItem('travel_shopping_list',JSON.stringify(list))}catch(e){}}
function toggleShoppingItem(cat,idx){const list=loadShoppingList();if(list[cat]&&list[cat][idx]){list[cat][idx].checked=!list[cat][idx].checked;saveShoppingList(list);renderPrepView()}}
function addShoppingItem(){const input=document.getElementById('shopping-new-item');const catSel=document.getElementById('shopping-new-cat');const name=input.value.trim();const cat=catSel.value;if(!name){showToast('아이템명을 입력하세요');return}const list=loadShoppingList();if(!list[cat])list[cat]=[];list[cat].push({name,checked:false,custom:true});saveShoppingList(list);showToast('쇼핑 아이템 추가');renderPrepView()}
function deleteShoppingItem(cat,idx){const list=loadShoppingList();if(list[cat]&&list[cat][idx]&&list[cat][idx].custom){list[cat].splice(idx,1);if(!list[cat].length)delete list[cat];saveShoppingList(list);showToast('아이템 삭제');renderPrepView()}}
function addShoppingCategory(){const name=prompt('새 카테고리 이름 (예: 🛍️ 그라시아 거리)');if(!name)return;const trimmed=name.trim();if(!trimmed)return;const list=loadShoppingList();if(list[trimmed]){showToast('이미 존재하는 카테고리');return}list[trimmed]=[];saveShoppingList(list);renderPrepView()}
function resetShoppingList(){if(!confirm('쇼핑리스트를 초기 상태로 되돌릴까요? (체크/추가 내역 모두 사라집니다)'))return;localStorage.removeItem('travel_shopping_list');renderPrepView();showToast('쇼핑리스트 초기화')}
function renderShoppingList(){const list=loadShoppingList();const cats=Object.keys(DEFAULT_SHOPPING);Object.keys(list).forEach(k=>{if(!cats.includes(k))cats.push(k)});
const totalItems=Object.values(list).reduce((s,arr)=>s+arr.length,0);const checkedItems=Object.values(list).reduce((s,arr)=>s+arr.filter(i=>i.checked).length,0);
const catOptions=cats.map(c=>`<option value="${esc(c)}">${esc(c)}</option>`).join('');
let html=`<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:10px"><div style="font-size:11px;color:#64748b">${checkedItems}/${totalItems} 구매 완료</div><div style="display:flex;gap:6px"><button class="packing-add-btn" style="padding:4px 8px;font-size:10px" onclick="addShoppingCategory()">+ 카테고리</button><button class="packing-add-btn" style="padding:4px 8px;font-size:10px;background:rgba(239,68,68,.12);border-color:rgba(239,68,68,.3);color:#dc2626" onclick="resetShoppingList()">↺ 초기화</button></div></div>`;
cats.forEach(cat=>{const items=list[cat]||[];html+=`<div class="packing-section"><div class="packing-section-title">${esc(cat)}</div>`;
if(!items.length){html+=`<div style="font-size:10px;color:#94a3b8;padding:4px 0">— 아이템 없음 —</div>`}
items.forEach((item,i)=>{const isLink=/^https?:\/\/|^www\.|\.com|\.kr/i.test(item.name)||item.name.startsWith('※');html+=`<div class="packing-item ${item.checked?'packed':''}" onclick="toggleShoppingItem('${esc(cat).replace(/'/g,"\\'")}',${i})"><span class="packing-check ${item.checked?'checked':''}">${item.checked?'✓':''}</span><span class="packing-item-text" style="${isLink?'font-size:10px;color:#64748b':''}">${esc(item.name)}</span>${item.custom?`<button class="packing-del" onclick="event.stopPropagation();deleteShoppingItem('${esc(cat).replace(/'/g,"\\'")}',${i})">✕</button>`:''}</div>`});
html+=`</div>`});
html+=`<div class="packing-add-row"><input class="packing-add-input" id="shopping-new-item" placeholder="새 쇼핑 아이템"><select class="packing-add-cat" id="shopping-new-cat">${catOptions}</select><button class="packing-add-btn" onclick="addShoppingItem()">+ 추가</button></div>`;
return html}

// ══════════ DASHBOARD ══════════
function renderDashboard(){const el=document.getElementById('dashboardView');
const now=new Date();now.setHours(0,0,0,0);
let ddayText='',ddayColor='#F5A623';
if(now<TRIP_START){const d=Math.ceil((TRIP_START-now)/864e5);ddayText=`D-${d}`;ddayColor='#F5A623'}
else if(now<=TRIP_END){const d=Math.floor((now-TRIP_START)/864e5)+1;ddayText=`DAY ${d}`;ddayColor='#10B981'}
else{ddayText='여행 완료!';ddayColor='#c4b5fd'}
let unbooked=0,pendingCnt=0,confirmedCnt=0,cancelledCnt=0,totalItems=0,statusableTotal=0;
DAYS.forEach(day=>day.schedule.forEach(item=>{totalItems++;const hasImplicit=item.warn&&/예약|확인|필수|권장/.test(item.warn)&&!item.status;if(item.status==='unbooked'||hasImplicit)unbooked++;if(item.status==='pending')pendingCnt++;if(item.status==='confirmed')confirmedCnt++;if(item.status==='cancelled')cancelledCnt++;if(item.status||hasImplicit)statusableTotal++}));
const confirmPct=statusableTotal?Math.round(confirmedCnt/statusableTotal*100):0;
const deadlines=collectUpcomingDeadlines();
const packing=loadPackingList();const packTotal=Object.values(packing).reduce((s,a)=>s+a.length,0);const packDone=Object.values(packing).reduce((s,a)=>s+a.filter(i=>i.checked).length,0);const packPct=packTotal?Math.round(packDone/packTotal*100):0;
let totalBudget=0,totalSpent=0;
DAYS.forEach(day=>{day.schedule.forEach(i=>{if(i.cost)totalBudget+=i.cost});(day.expenses||[]).forEach(e=>{totalSpent+=expenseToKRW(e)})});
const checked=DAYS.reduce((s,d)=>s+d.schedule.filter(i=>i.checked).length,0);const checkPct=totalItems?Math.round(checked/totalItems*100):0;
let todayHtml='';const tripDayIdx=Math.floor((now-TRIP_START)/864e5);
if(tripDayIdx>=0&&tripDayIdx<DAYS.length){const today=DAYS[tripDayIdx];
todayHtml=`<div class="dash-today"><div class="dash-today-title">📍 오늘의 일정 — DAY ${tripDayIdx+1} ${esc(today.region)}</div>${today.schedule.map(item=>{const t=TYPE_STYLES[item.type]||TYPE_STYLES.etc;return`<div class="dash-today-item"><div class="dash-today-time">${item.time}</div><div class="dash-today-dot" style="background:${t.dot}"></div><div class="dash-today-content"><strong>${esc(item.title)}</strong></div></div>`}).join('')}</div>`}
else if(now<TRIP_START){const first=DAYS[0];todayHtml=`<div class="dash-today"><div class="dash-today-title">✈️ 첫날 일정 미리보기 — ${esc(first.region)}</div>${first.schedule.slice(0,5).map(item=>{const t=TYPE_STYLES[item.type]||TYPE_STYLES.etc;return`<div class="dash-today-item"><div class="dash-today-time">${item.time}</div><div class="dash-today-dot" style="background:${t.dot}"></div><div class="dash-today-content"><strong>${esc(item.title)}</strong></div></div>`}).join('')}${first.schedule.length>5?`<div style="font-size:10px;color:#64748b;text-align:center;padding:4px">외 ${first.schedule.length-5}건...</div>`:''}</div>`}
// 예약 상태 요약 (4-way breakdown)
const statusSummaryHtml=`<div class="dash-status-summary" onclick="switchView('prep')"><div class="dash-status-summary-title">🗂️ 예약 상태 요약 <span style="color:var(--text-dim);font-size:10px;font-weight:500">· ${confirmedCnt}/${statusableTotal} 확정 (${confirmPct}%)</span></div><div class="dash-status-bar"><div class="dash-status-fill dash-status-fill-confirmed" style="width:${statusableTotal?confirmedCnt/statusableTotal*100:0}%"></div><div class="dash-status-fill dash-status-fill-pending" style="width:${statusableTotal?pendingCnt/statusableTotal*100:0}%"></div><div class="dash-status-fill dash-status-fill-unbooked" style="width:${statusableTotal?unbooked/statusableTotal*100:0}%"></div></div><div class="dash-status-chips"><span class="dash-status-chip status-confirmed">✅ 확정 ${confirmedCnt}</span><span class="dash-status-chip status-pending">🟡 진행중 ${pendingCnt}</span><span class="dash-status-chip status-unbooked">⬜ 미예약 ${unbooked}</span>${cancelledCnt?`<span class="dash-status-chip status-cancelled">❌ 취소 ${cancelledCnt}</span>`:''}</div></div>`;
// 마감 임박 위젯 (H3)
let deadlineHtml='';
if(deadlines.length){const overdue=deadlines.filter(d=>d.days<0).length;deadlineHtml=`<div class="dash-deadline-list"><div style="font-size:11px;font-weight:700;color:#f87171;margin-bottom:6px">⏰ 예약 마감 임박 (${deadlines.length}건${overdue?`, ${overdue}건 경과`:''})</div>${deadlines.slice(0,8).map(d=>{const lbl=d.days<0?`마감 ${-d.days}일 경과`:d.days===0?'오늘 마감':`D-${d.days}`;return`<div class="dash-warn" onclick="selectDay(${d.di});switchView('timeline')"><strong>${lbl}</strong> · D${d.di+1} · ${esc(d.item.title)}</div>`}).join('')}</div>`}
let warnHtml='';
if(unbooked>0){const warns=[];DAYS.forEach((day,di)=>day.schedule.forEach(item=>{if(item.status==='unbooked'||(item.warn&&/예약|확인|필수|권장/.test(item.warn)&&!item.status))warns.push({di,item})}));
warnHtml=`<div class="dash-warn-list"><div style="font-size:11px;font-weight:700;color:#f87171;margin-bottom:6px">⚠️ 예약 필요 항목</div>${warns.slice(0,8).map(w=>`<div class="dash-warn" onclick="selectDay(${w.di});switchView('timeline')">D${w.di+1} · ${esc(w.item.title)}${w.item.warn?' — '+esc(w.item.warn):''}</div>`).join('')}</div>`}
el.innerHTML=`<div class="prep-title" style="text-align:center;margin-bottom:6px">🇪🇸 스페인 · 포르투갈 신혼여행</div>
<div style="text-align:center;margin-bottom:16px"><span style="font-size:36px;font-weight:800;color:${ddayColor}">${ddayText}</span><div style="font-size:10px;color:#64748b;margin-top:4px">2026.09.13 — 09.26 · 14일</div></div>
<div class="dash-grid">
<div class="dash-card" onclick="switchView('prep')"><div class="dash-card-icon">⚠️</div><div class="dash-card-value" style="color:${unbooked>0?'#f87171':'#34d399'}">${unbooked}</div><div class="dash-card-label">미예약 항목</div></div>
<div class="dash-card" onclick="switchView('prep')"><div class="dash-card-icon">🧳</div><div class="dash-card-value">${packPct}%</div><div class="dash-card-label">패킹 진행률</div><div class="dash-progress"><div class="dash-progress-fill" style="width:${packPct}%;background:${packPct>=100?'#10B981':packPct>=50?'#F5A623':'#EF4444'}"></div></div></div>
<div class="dash-card" onclick="switchView('budget')"><div class="dash-card-icon">💰</div><div class="dash-card-value" style="font-size:16px">${(totalBudget/10000).toFixed(0)}만</div><div class="dash-card-label">총 예산${totalSpent?` · 지출 ${(totalSpent/10000).toFixed(0)}만`:''}</div></div>
<div class="dash-card" onclick="switchView('timeline')"><div class="dash-card-icon">✅</div><div class="dash-card-value">${checkPct}%</div><div class="dash-card-label">일정 완료 (${checked}/${totalItems})</div><div class="dash-progress"><div class="dash-progress-fill" style="width:${checkPct}%;background:#10B981"></div></div></div>
</div>${statusSummaryHtml}${deadlineHtml}${todayHtml}${warnHtml}`}

// ══════════ SOS / EMERGENCY ══════════
const SOS_CONTACTS=[
{icon:'🏛️',title:'주스페인 한국대사관',sub:'마드리드 | 월-금 09:00-18:00',tel:'+34913532000',bg:'rgba(59,130,246,.1)',border:'rgba(59,130,246,.25)',btnBg:'rgba(59,130,246,.2)',btnColor:'#60a5fa'},
{icon:'🏛️',title:'주포르투갈 한국대사관',sub:'리스본 | 월-금 09:00-18:00',tel:'+351217937200',bg:'rgba(59,130,246,.1)',border:'rgba(59,130,246,.25)',btnBg:'rgba(59,130,246,.2)',btnColor:'#60a5fa'},
{icon:'🚔',title:'스페인 경찰 (Policía)',sub:'범죄/도난 신고',tel:'112',bg:'rgba(239,68,68,.08)',border:'rgba(239,68,68,.2)',btnBg:'rgba(239,68,68,.2)',btnColor:'#f87171'},
{icon:'🚑',title:'유럽 공통 긴급번호',sub:'경찰/소방/구급 통합',tel:'112',bg:'rgba(239,68,68,.08)',border:'rgba(239,68,68,.2)',btnBg:'rgba(239,68,68,.2)',btnColor:'#f87171'},
{icon:'🏥',title:'관광객 전용 핫라인 (스페인)',sub:'Tourist Helpline (영어 가능)',tel:'902102112',bg:'rgba(16,185,129,.08)',border:'rgba(16,185,129,.2)',btnBg:'rgba(16,185,129,.2)',btnColor:'#34d399'},
{icon:'💳',title:'카드 분실 신고',sub:'비자: 800-811-1121 / 마스터: 900-971-231',tel:'800811121',bg:'rgba(245,166,35,.08)',border:'rgba(245,166,35,.2)',btnBg:'rgba(245,166,35,.2)',btnColor:'#F5A623'},
{icon:'🛡️',title:'여행자보험 콜센터',sub:'보험사 연락처를 저장하세요',tel:'',bg:'rgba(139,92,246,.08)',border:'rgba(139,92,246,.2)',btnBg:'rgba(139,92,246,.2)',btnColor:'#c4b5fd'}];
function renderSOSView(){const el=document.getElementById('sosView');
const docPhotos=JSON.parse(localStorage.getItem('sos_doc_photos')||'{}');
const contacts=SOS_CONTACTS.map(c=>`<div class="sos-card" style="background:${c.bg};border:1px solid ${c.border}"><div class="sos-card-icon">${c.icon}</div><div class="sos-card-body"><div class="sos-card-title">${c.title}</div><div class="sos-card-sub">${c.sub}</div></div>${c.tel?`<a class="sos-call" href="tel:${c.tel}" style="background:${c.btnBg};color:${c.btnColor}" onclick="event.stopPropagation()">📞 전화</a>`:''}</div>`).join('');
const docs=[{key:'passport',title:'여권 사본',icon:'🛂'},{key:'insurance',title:'여행자보험 증서',icon:'🛡️'},{key:'flight',title:'항공권 확인서',icon:'✈️'},{key:'hotel',title:'호텔 바우처',icon:'🏨'}];
const docsHtml=docs.map(d=>{const photo=docPhotos[d.key];return`<div class="sos-doc-card"><div class="sos-doc-title">${d.icon} ${d.title}</div>${photo?`<img class="sos-doc-img" src="${esc(photo)}" onclick="openPhotoModal('${esc(photo)}')" onerror="this.style.display='none'"><div class="sos-doc-sub" style="margin-top:4px"><button onclick="removeDocPhoto('${d.key}')" style="background:rgba(239,68,68,.12);border:1px solid rgba(239,68,68,.2);color:#f87171;padding:3px 8px;border-radius:6px;font-size:9px;cursor:pointer;font-family:inherit">삭제</button></div>`:`<div class="sos-doc-sub">사진 URL을 입력하세요</div><div style="display:flex;gap:4px;margin-top:6px"><input class="field-input" id="doc-url-${d.key}" placeholder="https://..." style="font-size:10px;padding:6px 8px"><button onclick="saveDocPhoto('${d.key}')" style="padding:6px 10px;border-radius:8px;border:none;background:rgba(16,185,129,.15);color:#34d399;font-size:10px;font-weight:700;cursor:pointer;font-family:inherit;flex-shrink:0">저장</button></div>`}</div>`}).join('');
el.innerHTML=`<div class="prep-title">🆘 긴급 연락처 & SOS</div><div style="padding:10px 14px;border-radius:10px;background:rgba(239,68,68,.06);border:1px solid rgba(239,68,68,.15);margin-bottom:14px;font-size:11px;color:#f87171;text-align:center;font-weight:600">유럽 통합 긴급번호: <a href="tel:112" style="color:#f87171;font-size:16px;font-weight:800">112</a></div>${contacts}<div class="sos-section" style="margin-top:16px;border-top:1px solid rgba(255,255,255,.06);padding-top:16px"><div class="sos-section-title">📄 중요 서류 사본</div><div style="font-size:10px;color:#64748b;margin-bottom:10px">사진 URL을 저장하면 오프라인에서도 확인할 수 있습니다</div>${docsHtml}</div>`}
function saveDocPhoto(key){const input=document.getElementById('doc-url-'+key);const url=input?.value?.trim();if(!url){showToast('URL을 입력하세요');return}const docs=JSON.parse(localStorage.getItem('sos_doc_photos')||'{}');docs[key]=url;localStorage.setItem('sos_doc_photos',JSON.stringify(docs));renderSOSView();showToast('저장 완료')}
function removeDocPhoto(key){const docs=JSON.parse(localStorage.getItem('sos_doc_photos')||'{}');delete docs[key];localStorage.setItem('sos_doc_photos',JSON.stringify(docs));renderSOSView();showToast('삭제 완료')}

// ══════════ TIMEZONE ══════════
const TZ_OFFSETS={KST:9,CET:2,WEST:1};
function getLocalTimeStr(time,fromTZ,toTZ){if(!time||time==='—')return'';const parts=time.match(/(\d{1,2}):(\d{2})/);if(!parts)return'';let h=parseInt(parts[1]),m=parseInt(parts[2]);h=h-TZ_OFFSETS[fromTZ]+TZ_OFFSETS[toTZ];if(h<0)h+=24;if(h>=24)h-=24;return String(h).padStart(2,'0')+':'+String(m).padStart(2,'0')}
function getDayTZ(dayIdx){const r=DAYS[dayIdx]?.region||'';if(r.includes('포르투')||r.includes('도우로')||r.includes('마투지')||r.includes('아베이루'))return'WEST';return'CET'}

// ══════════ WEATHER API ══════════
const OWM_KEY='0879f0fa07ee97e12475987024444693';
const CITY_COORDS={barcelona:{lat:41.39,lon:2.17},porto:{lat:41.15,lon:-8.61},mallorca:{lat:39.57,lon:2.65}};
let weatherCache2={};
function fetchLiveWeather(){if(!OWM_KEY){renderWeather();return}
Object.entries(CITY_COORDS).forEach(([city,{lat,lon}])=>{fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${OWM_KEY}&units=metric&lang=kr`).then(r=>r.json()).then(data=>{if(data.list){weatherCache2[city]=data.list;renderLiveWeather()}}).catch(()=>{})})}
function renderLiveWeather(){if(!Object.keys(weatherCache2).length){renderWeather();return}
const icons={'01':'☀️','02':'🌤️','03':'⛅','04':'☁️','09':'🌧️','10':'🌦️','11':'⛈️','13':'🌨️','50':'🌫️'};
const cityNames={barcelona:'바르셀로나',porto:'포르투',mallorca:'마요르카'};
document.getElementById('weatherBar').innerHTML=Object.entries(weatherCache2).map(([city,list])=>{const today=list[0];const iconCode=today.weather[0].icon.slice(0,2);const temp=`${Math.round(today.main.temp_min)}~${Math.round(today.main.temp_max)}°C`;
return`<div class="weather-card"><div class="weather-city">${cityNames[city]||city}</div><div class="weather-icon">${icons[iconCode]||'🌡️'}</div><div class="weather-temp">${temp}</div><div class="weather-desc">${today.weather[0].description}</div></div>`}).join('')}

// ══════════ TRANSPORT DETAILS ══════════
const TRANSPORT_DETAILS={
'공항→호텔':{routes:['A2 공항버스 → V13 환승'],fare:'€6.75',interval:'5~10분',taxi:'€35~45 (약 30분)'},
'공항 이동':{routes:['L9 지하철 → 엘프라트 공항'],fare:'€5.15 (알단테)',interval:'7분',taxi:'€40~50'},
'몬주익 이동':{routes:['L1/L3 지하철 → 텔레페릭'],fare:'€2.40+€13.50',interval:'5분',taxi:'€10~15'},
'라로카빌리지':{routes:['Shopping Express 셔틀'],fare:'€20 왕복',interval:'사전예약',taxi:'€100~120'},
'팔마 이동':{routes:['TIB 401/412 버스'],fare:'€8~10',interval:'30분',taxi:'€80~100'},
'소예르 트램':{routes:['소예르 트램 (Port de Soller)'],fare:'€7',interval:'30분'},
'아베이루 이동':{routes:['CP 기차 (상벤투→아베이루)'],fare:'€3.55',interval:'1시간'},
'투어 출발':{routes:['GetYourGuide 픽업'],fare:'투어 포함',interval:'09:00 출발'}};

// ══════════ GOOGLE CALENDAR (.ics) EXPORT ══════════
function exportICS(){
const pad2=n=>String(n).padStart(2,'0');
const year=TRIP_START.getFullYear();
function toICSDate(dayIdx,time){
const baseDate=new Date(TRIP_START);baseDate.setDate(baseDate.getDate()+dayIdx);
const y=baseDate.getFullYear(),mo=baseDate.getMonth()+1,d=baseDate.getDate();
if(!time||time==='—')return`${y}${pad2(mo)}${pad2(d)}`;
const[h,m]=time.split(':').map(Number);
return`${y}${pad2(mo)}${pad2(d)}T${pad2(h)}${pad2(m)}00`}
let ics=['BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//TravelPlanner//ES-PT//KO','CALSCALE:GREGORIAN','METHOD:PUBLISH','X-WR-CALNAME:스페인·포르투갈 여행'];
DAYS.forEach((day,di)=>{day.schedule.forEach((item,ii)=>{
const dtStart=toICSDate(di,item.time);
const isAllDay=!item.time||item.time==='—';
let dtEnd;
if(isAllDay){const nd=new Date(TRIP_START);nd.setDate(nd.getDate()+di+1);dtEnd=`${nd.getFullYear()}${pad2(nd.getMonth()+1)}${pad2(nd.getDate())}`}
else{const[h,m]=item.time.split(':').map(Number);const eh=h+1;dtEnd=toICSDate(di,`${pad2(eh%24)}:${pad2(m)}`)}
const uid=`travel-${di}-${ii}-${year}@planner`;
const loc=item.coords?`${item.coords[0]},${item.coords[1]}`:'';
const desc=(item.desc||'').replace(/\n/g,'\\n')+(item.warn?'\\n⚠️ '+item.warn:'')+(item.cost?'\\n💰 '+fmt(item.cost):'');
ics.push('BEGIN:VEVENT',`UID:${uid}`,
isAllDay?`DTSTART;VALUE=DATE:${dtStart}`:`DTSTART:${dtStart}`,
isAllDay?`DTEND;VALUE=DATE:${dtEnd}`:`DTEND:${dtEnd}`,
`SUMMARY:${item.title.replace(/,/g,'\\,')}`,
`DESCRIPTION:${desc.replace(/,/g,'\\,')}`,
loc?`LOCATION:${loc}`:'',
item.url?`URL:${item.url}`:'',
'END:VEVENT')})});
ics.push('END:VCALENDAR');
const blob=new Blob([ics.filter(Boolean).join('\r\n')],{type:'text/calendar;charset=utf-8'});
const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='spain-portugal-trip.ics';a.click();URL.revokeObjectURL(a.href);showToast('캘린더 파일 다운로드 완료')}

// ══════════ TIME CONFLICT DETECTION ══════════
function detectConflicts(schedule){
const conflicts=[];
const timed=schedule.map((item,i)=>({item,i})).filter(o=>o.item.time&&o.item.time!=='—');
for(let a=0;a<timed.length;a++){for(let b=a+1;b<timed.length;b++){
if(timed[a].item.time===timed[b].item.time){
conflicts.push({idx1:timed[a].i,idx2:timed[b].i,time:timed[a].item.time,
title1:timed[a].item.title,title2:timed[b].item.title})}}}
return conflicts}

// ══════════ SWIPE DAY NAVIGATION ══════════
(function(){let sx=0,sy=0,swiping=false;const minDist=60,maxY=40;
const getSwipeTarget=e=>{
const t=e.target;if(t.closest('#map')||t.closest('.modal')||t.closest('.search-overlay')||t.closest('.currency-widget')||t.closest('.map-search-wrap')||t.closest('.map-action-stack')||t.closest('.map-controls'))return false;
return currentView==='timeline'||currentView==='map';};
document.addEventListener('touchstart',function(e){if(!getSwipeTarget(e))return;sx=e.touches[0].clientX;sy=e.touches[0].clientY;swiping=true},{passive:true});
document.addEventListener('touchmove',function(e){if(!swiping)return;const dx=e.touches[0].clientX-sx,dy=Math.abs(e.touches[0].clientY-sy);if(dy>maxY)swiping=false},{passive:true});
document.addEventListener('touchend',function(e){if(!swiping)return;swiping=false;const dx=e.changedTouches[0].clientX-sx;
if(Math.abs(dx)<minDist)return;
if(dx<0&&currentDay<DAYS.length-1){currentDay++;currentFilter='all';render();if(currentView==='map')updateMap();showSwipeIndicator('next')}
else if(dx>0&&currentDay>0){currentDay--;currentFilter='all';render();if(currentView==='map')updateMap();showSwipeIndicator('prev')}},{passive:true})})();
function showSwipeIndicator(dir){const el=document.getElementById('swipeIndicator');if(!el)return;el.className='swipe-indicator visible '+(dir==='next'?'swipe-right':'swipe-left');el.textContent=dir==='next'?`DAY ${currentDay+1} →`:`← DAY ${currentDay+1}`;setTimeout(()=>el.classList.remove('visible'),800)}

// ══════════ MAP REAL ROAD ROUTES (OSRM) ══════════
function fetchRealRoute(coords,color,callback,profile){
if(coords.length<2){callback([]);return}
const p=profile||routeProfile||'car';
const osrmProfile=p==='foot'?'foot':'driving';
const waypoints=coords.map(c=>c[1]+','+c[0]).join(';');
const url=`https://router.project-osrm.org/route/v1/${osrmProfile}/${waypoints}?overview=full&geometries=geojson`;
fetch(url).then(r=>r.json()).then(data=>{
if(data.routes&&data.routes[0]){
const geom=data.routes[0].geometry.coordinates.map(c=>[c[1],c[0]]);
callback(geom)}else if(p==='foot'){// foot 실패 시 driving 폴백
fetchRealRoute(coords,color,callback,'car')}else callback([])}).catch(()=>{
if(p==='foot')fetchRealRoute(coords,color,callback,'car');else callback([])})}

// ══════════ MAP SEARCH (Nominatim with viewbox) ══════════
// 스페인+포르투갈 영역 가중치 (viewbox=좌,상,우,하)
const TRIP_VIEWBOX='-9.5,43.8,4.5,36.0';
function gmapsPlaceUrl(name,lat,lng){const q=encodeURIComponent(name);return`https://www.google.com/maps/search/${q}/@${lat},${lng},17z`}
function onMapPlaceSearch(q){clearTimeout(mapSearchTimeout);const el=document.getElementById('mapSearchResults');const clr=document.getElementById('mapSearchClear');clr.classList.toggle('visible',!!q);if(!q||q.length<2){el.classList.remove('visible');return}
el.innerHTML='<div class="map-search-loading">검색 중...</div>';el.classList.add('visible');
mapSearchTimeout=setTimeout(()=>{
const url=`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(q)}&format=json&limit=8&accept-language=ko&addressdetails=1&viewbox=${TRIP_VIEWBOX}&bounded=0`;
fetch(url).then(r=>r.json()).then(data=>{
if(!data||!data.length){el.innerHTML='<div class="map-search-empty">결과 없음 — 다른 키워드를 시도해보세요</div>';return}
mapSearchResultsCache=data;
el.innerHTML=data.map((p,i)=>{const name=p.display_name.split(',')[0];const addr=p.display_name.split(',').slice(1,4).join(',').trim();const typeLabel=({tourism:'관광',amenity:'편의',building:'건물',shop:'쇼핑',leisure:'여가',historic:'유적',natural:'자연'})[p.class]||p.type||'';return`<div class="map-search-item" onclick="selectMapSearchResult(${i})"><div class="map-search-item-name">${esc(name)}</div><div class="map-search-item-addr">${esc(addr)}</div>${typeLabel?`<span class="map-search-item-type">${esc(typeLabel)}</span>`:''}</div>`}).join('')
}).catch(()=>{el.innerHTML='<div class="map-search-empty">검색 오류 — 인터넷 연결 확인</div>'})},350)}
function selectMapSearchResult(idx){const p=mapSearchResultsCache[idx];if(!p||!map)return;
const lat=parseFloat(p.lat),lng=parseFloat(p.lon);
const name=p.display_name.split(',')[0];
const addr=p.display_name.split(',').slice(1,4).join(',').trim();
clearMapSearchMarker();
const icon=L.divIcon({className:'',html:'<div class="search-marker"></div>',iconSize:[30,30],iconAnchor:[15,30]});
mapSearchMarker=L.marker([lat,lng],{icon,zIndexOffset:1000}).addTo(map);
const popupHtml=`<div style="min-width:200px"><strong>${esc(name)}</strong><div style="font-size:10px;color:#94a3b8;margin-top:3px;line-height:1.4">${esc(addr)}</div><div style="display:flex;gap:6px;margin-top:10px;flex-wrap:wrap"><a href="${gmapsPlaceUrl(name,lat,lng)}" target="_blank" rel="noopener" style="flex:1;min-width:90px;padding:7px 10px;border-radius:6px;background:rgba(66,133,244,.15);color:#4285F4;font-size:11px;font-weight:700;text-align:center;text-decoration:none;border:1px solid rgba(66,133,244,.3)">⭐ Google 리뷰</a><button onclick="addPlaceFromMapSearchByIdx(${idx})" style="flex:1;min-width:90px;padding:7px 10px;border-radius:6px;background:rgba(16,185,129,.15);color:#34d399;font-size:11px;font-weight:700;cursor:pointer;border:1px solid rgba(16,185,129,.3);font-family:inherit">+ 일정 추가</button></div></div>`;
mapSearchMarker.bindPopup(popupHtml,{maxWidth:280}).openPopup();
map.flyTo([lat,lng],16,{duration:.8});
document.getElementById('mapSearchResults').classList.remove('visible')}
function clearMapSearch(){const el=document.getElementById('mapSearchResults');const inp=document.getElementById('mapSearchInput');inp.value='';el.classList.remove('visible');document.getElementById('mapSearchClear').classList.remove('visible');clearMapSearchMarker()}
function clearMapSearchMarker(){if(mapSearchMarker&&map){map.removeLayer(mapSearchMarker);mapSearchMarker=null}}
function addPlaceFromMapSearchByIdx(idx){const p=mapSearchResultsCache[idx];if(!p)return;const lat=parseFloat(p.lat),lng=parseFloat(p.lon);const name=p.display_name.split(',')[0];const addr=p.display_name.split(',').slice(1,3).join(',').trim();if(map)map.closePopup();openAddModal();document.getElementById('f-title').value=name;document.getElementById('f-placename').value=name;document.getElementById('f-lat').value=lat.toFixed(6);document.getElementById('f-lng').value=lng.toFixed(6);const descEl=document.getElementById('f-desc');if(descEl&&!descEl.value)descEl.value=addr}

// ══════════ ROUTE PROFILE TOGGLE ══════════
function toggleRouteProfile(){routeProfile=routeProfile==='car'?'foot':'car';const btn=document.getElementById('mapProfileToggle');btn.textContent=routeProfile==='car'?'🚗 자동차':'🚶 도보';showToast(`경로: ${routeProfile==='car'?'자동차':'도보'} 모드`);if(currentView==='map')updateMap()}

// ══════════ GPS LOCATE ══════════
function locateGPS(){if(!map||!navigator.geolocation){showToast('위치 정보를 사용할 수 없습니다');return}
const btn=document.getElementById('mapGpsBtn');btn.disabled=true;btn.textContent='⏳';
navigator.geolocation.getCurrentPosition(pos=>{
const lat=pos.coords.latitude,lng=pos.coords.longitude,acc=pos.coords.accuracy;
if(gpsMarker){map.removeLayer(gpsMarker);gpsMarker=null}
if(gpsCircle){map.removeLayer(gpsCircle);gpsCircle=null}
const icon=L.divIcon({className:'',html:'<div class="gps-pulse"></div>',iconSize:[20,20],iconAnchor:[10,10]});
gpsMarker=L.marker([lat,lng],{icon,zIndexOffset:900}).addTo(map);
gpsCircle=L.circle([lat,lng],{radius:acc,color:'#3B82F6',fillColor:'#3B82F6',fillOpacity:.08,weight:1}).addTo(map);
gpsMarker.bindPopup(`<strong>📍 내 위치</strong><div style="font-size:10px;color:#94a3b8;margin-top:3px">${lat.toFixed(5)}, ${lng.toFixed(5)}<br>정확도 ±${Math.round(acc)}m</div>`);
map.flyTo([lat,lng],15,{duration:.8});
btn.disabled=false;btn.textContent='📍';btn.classList.add('active');
showToast(`현재 위치 찾음 (±${Math.round(acc)}m)`)
},err=>{btn.disabled=false;btn.textContent='📍';
const msg={1:'위치 권한이 거부됨',2:'위치를 찾을 수 없음',3:'시간 초과'}[err.code]||'위치 오류';
showToast(msg)},{enableHighAccuracy:true,timeout:10000,maximumAge:30000})}

// ══════════ OFFLINE TILE PREFETCH ══════════
const PREFETCH_AREAS=[
{name:'바르셀로나',lat:41.39,lng:2.17,radius:.12},
{name:'포르투',lat:41.15,lng:-8.61,radius:.10},
{name:'마요르카',lat:39.57,lng:2.65,radius:.20},
{name:'도우로',lat:41.10,lng:-7.78,radius:.15}
];
const PREFETCH_ZOOMS=[11,12,13,14];
function lonToTileX(lon,z){return Math.floor((lon+180)/360*Math.pow(2,z))}
function latToTileY(lat,z){return Math.floor((1-Math.log(Math.tan(lat*Math.PI/180)+1/Math.cos(lat*Math.PI/180))/Math.PI)/2*Math.pow(2,z))}
async function prefetchOfflineTiles(){
const btn=document.getElementById('mapPrefetchBtn');if(btn.disabled)return;
const tiles=[];
PREFETCH_AREAS.forEach(area=>{
PREFETCH_ZOOMS.forEach(z=>{
const x1=lonToTileX(area.lng-area.radius,z),x2=lonToTileX(area.lng+area.radius,z);
const y1=latToTileY(area.lat+area.radius,z),y2=latToTileY(area.lat-area.radius,z);
for(let x=Math.min(x1,x2);x<=Math.max(x1,x2);x++)for(let y=Math.min(y1,y2);y<=Math.max(y1,y2);y++){
// 다크/라이트 두 테마 모두 캐싱
tiles.push(`https://a.basemaps.cartocdn.com/dark_all/${z}/${x}/${y}.png`);
tiles.push(`https://a.basemaps.cartocdn.com/light_all/${z}/${x}/${y}.png`)
}})});
btn.disabled=true;btn.textContent='⏳';
let done=0,failed=0;const total=tiles.length;
showToast(`오프라인 지도 다운로드 시작 (${total}개 타일)`);
const BATCH=8;
for(let i=0;i<tiles.length;i+=BATCH){
const batch=tiles.slice(i,i+BATCH);
await Promise.all(batch.map(u=>fetch(u,{mode:'cors'}).then(r=>{if(r.ok)done++;else failed++}).catch(()=>failed++)));
btn.textContent=Math.round((i+BATCH)/total*100)+'%'}
btn.disabled=false;btn.textContent='📥';btn.classList.add('active');
showToast(`오프라인 지도 완료 — 성공 ${done} / 실패 ${failed}`)}

// ══════════ TAX REFUND CALCULATOR ══════════
const TAX_REFUND_RATES={spain:{name:'스페인',vat:21,minPurchase:90.16,refundPct:15.7},portugal:{name:'포르투갈',vat:23,minPurchase:61.50,refundPct:16}};
function calcTaxRefund(){
const amount=parseFloat(document.getElementById('taxrefund-amount')?.value)||0;
const country=document.getElementById('taxrefund-country')?.value||'spain';
const rate=TAX_REFUND_RATES[country];
const el=document.getElementById('taxrefund-result');if(!el)return;
if(amount<rate.minPurchase){el.innerHTML=`<span style="color:#f87171">최소 구매 금액: €${rate.minPurchase} (약 ${fmt(Math.round(rate.minPurchase*EUR_RATE))})</span>`;return}
const refundEur=Math.round(amount*rate.refundPct/100*100)/100;
const refundKrw=Math.round(refundEur*EUR_RATE);
el.innerHTML=`<div class="taxrefund-row"><span>VAT ${rate.vat}%</span><span>€${(amount*rate.vat/100).toFixed(2)}</span></div>
<div class="taxrefund-row" style="color:#34d399;font-weight:700"><span>예상 환급액 (${rate.refundPct}%)</span><span>€${refundEur} (${fmt(refundKrw)})</span></div>
<div class="taxrefund-row" style="color:#64748b;font-size:9px"><span>실수령 (수수료 제외)</span><span>약 €${(refundEur*0.85).toFixed(2)}</span></div>`}
function renderTaxRefundWidget(){
return`<div class="taxrefund-widget">
<div class="taxrefund-title">🧾 택스리펀 계산기</div>
<div class="taxrefund-form">
<select class="field-select" id="taxrefund-country" onchange="calcTaxRefund()" style="font-size:11px;padding:6px 8px;margin-bottom:6px">
<option value="spain">🇪🇸 스페인 (VAT 21%)</option><option value="portugal">🇵🇹 포르투갈 (VAT 23%)</option></select>
<div style="display:flex;gap:6px;align-items:center"><span style="font-size:14px;color:#F5A623">€</span>
<input class="field-input" id="taxrefund-amount" type="number" placeholder="구매 금액 (EUR)" oninput="calcTaxRefund()" style="font-size:12px;padding:8px 10px">
</div></div>
<div id="taxrefund-result" style="margin-top:8px"></div>
<div style="margin-top:8px;font-size:9px;color:#475569;line-height:1.5">
💡 스페인: 1회 €90.16 이상 구매 시 환급 가능<br>
💡 포르투갈: 1회 €61.50 이상 구매 시 환급 가능<br>
💡 바르셀로나 공항 T1 Tax Free 카운터에서 수속
</div></div>`}

// ══════════ INIT ══════════
loadFromLocal();migrateStatus(DAYS);render();updateDDay();fetchLiveWeather();initFirebase();fetchExchangeRate();restoreTheme();
document.addEventListener('click',hideContextMenu);
document.addEventListener('click',e=>{const wrap=document.querySelector('.map-search-wrap');if(wrap&&!wrap.contains(e.target)){const r=document.getElementById('mapSearchResults');if(r)r.classList.remove('visible')}});
document.addEventListener('keydown',e=>{if(e.key==='Escape'){closeSearch();hideContextMenu();const r=document.getElementById('mapSearchResults');if(r)r.classList.remove('visible')}});
// 모바일 롱프레스 핸들러
document.addEventListener('touchstart',function(e){const card=e.target.closest('.timeline-card[oncontextmenu]');if(!card)return;longPressTimer=setTimeout(()=>{const attr=card.getAttribute('oncontextmenu');if(attr){const touch=e.touches[0];const fakeE={preventDefault:()=>{},stopPropagation:()=>{},clientX:touch.clientX,clientY:touch.clientY,pageX:touch.pageX,pageY:touch.pageY};const m=attr.match(/showContextMenu\(event,(\d+),(\d+)\)/);if(m)showContextMenu(fakeE,parseInt(m[1]),parseInt(m[2]))}},600)},{passive:true});
document.addEventListener('touchend',()=>{clearTimeout(longPressTimer)});
document.addEventListener('touchmove',()=>{clearTimeout(longPressTimer)});
if('serviceWorker' in navigator){navigator.serviceWorker.register('sw.js').then(reg=>{reg.addEventListener('updatefound',()=>{const nw=reg.installing;nw.addEventListener('statechange',()=>{if(nw.state==='installed'&&navigator.serviceWorker.controller){showToast('앱 업데이트 가능 — 새로고침하세요');nw.postMessage('SKIP_WAITING')}})})}).catch(()=>{})}
window.addEventListener('online',()=>{showToast('온라인 복귀 — 동기화 중...');syncToRemote()});
window.addEventListener('offline',()=>{showToast('오프라인 모드 — 로컬에 저장됩니다');updateSyncUI('offline')});
