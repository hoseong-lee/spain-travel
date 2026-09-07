// ══════════ TRIP DATA ══════════
// 여행 일정 원본 데이터. localStorage/Firebase에 저장된 값이 없을 때만 사용되는 seed.
// 앱 로직과 분리되어 있어 일정만 수정할 때 app.js를 건드리지 않아도 된다.
// placeName: Google Maps 검색용 장소명. 비어있으면 hotel 타입은 day.hotel, 그 외엔 제목 휴리스틱 fallback.
//
// 2026-09 확정본. 「신혼여행일정 1.xlsx」 + 「신혼여행일정_정리본.xlsx」 취합.
//   ★ = 시간 고정 예약 (놓치면 안 됨)   ⚠ = 확인·예약 필요   💡 = 2024.01 여행 기록 기반 추천 보완
window.DEFAULT_TRIP_DAYS=[

// ─────────────────────────────── D1
{date:"9/13 (일)",region:"인천 → 바르셀로나 ✈️",color:"#E8725A",hotel:"머큐어 바르셀로나 콘도르 ⭐⭐⭐⭐\nMercure Barcelona Condor\n📋 트립비토즈 #3508557\n🕐 체크인 14시 (1/3박)\n💰 3박 764,355원 (앱할인)\n🍳 조식 €14/인 · 도시세 64,404원 (현장)\n📍 시내 지하철 20분 / 자전거 15분",schedule:[
{time:"08:30",title:"🛫 인천공항 제2터미널 도착",placeName:"Incheon International Airport Terminal 2",desc:"출발 3시간 전 도착\n아시아나 카운터",type:"move",coords:[37.4602,126.4407]},
{time:"11:50",title:"✈️ OZ0511 인천 → 바르셀로나",placeName:"Incheon International Airport",desc:"14시간 20분 · 무료수하물 23kg\n탑승 T2 / 하차 T1",type:"flight",status:"confirmed",memo:"예약번호 E9FTBZ · e-Ticket 주나 9885075985754 / 호성 9885075985753",coords:[37.4602,126.4407]},
{time:"19:10",title:"🛬 바르셀로나 엘프라트 T1 도착",placeName:"Barcelona El Prat Airport Terminal 1",desc:"수하물 수취 후 입국심사",type:"flight",coords:[41.2971,2.0785]},
{time:"20:00",title:"🚌 공항 → 숙소",desc:"T1에서 A2 공항버스 → V13 버스 환승\n(약 1시간)",type:"move",coords:[41.2971,2.0785]},
{time:"21:00",title:"🏨 머큐어 콘도르 체크인",placeName:"Mercure Barcelona Condor",desc:"4성급 · 조식 별도(1인 €14)",type:"hotel",status:"confirmed",memo:"예약번호 3508557 · 도시세 64,404원 현장 결제",bookingUrl:"https://www.tripbtoz.com/hotels/1217387",cost:764355,coords:[41.3920,2.1531]},
{time:"22:00",title:"🍽️ 늦은 저녁 — Antigua",placeName:"Antigua Barcelona",desc:"당일 TheFork 앱에서 예약 후 방문 시 할인",type:"food",cost:50000,coords:[41.3878,2.1697]},
{time:"22:00",title:"💡 대안 — Parada 101 BCN",placeName:"Parada 101 BCN",desc:"호텔 도보 1~2분 (Via Augusta) ⭐4.3\n오징어·정어리 로컬 해산물 타파스, 가격 착함\n도착이 늦어 무리라면 여기로",type:"food",memo:"늦은 도착 대비 플랜B",coords:[41.3930,2.1520]},
{time:"23:00",title:"🛒 다음날 아침거리 장보기",placeName:"Consum Barcelona Via Augusta",desc:"Consum 마트",type:"shopping",warn:"21:30 영업종료 — 21시 체크인이면 이미 닫혔을 가능성 큼",memo:"대안: 공항·역 편의점에서 미리 사오기 / 다음날 아침 Lincoln 32 (08:00 오픈)",coords:[41.3915,2.1525]}
]},

// ─────────────────────────────── D2
{date:"9/14 (월)",region:"바르셀로나 — 가우디 투어 🏛️",color:"#E8725A",hotel:"머큐어 바르셀로나 콘도르 (2/3박)\nMercure Barcelona Condor",schedule:[
{time:"07:00",title:"☀️ 기상 및 아침식사",placeName:"Mercure Barcelona Condor",desc:"전날 사둔 것으로\n여의치 않으면 Lincoln 32 (08:00 오픈, 도보 5~8분)",type:"etc",coords:[41.3920,2.1531]},
{time:"07:40",title:"💡 숙소 → 까사바트요 이동",desc:"V15번 버스 · 08:25 집합이라 여유 두고 출발",type:"move",url:"https://maps.app.goo.gl/SnRoKwxV9htKP6hu5",coords:[41.3920,2.1531]},
{time:"08:25",title:"★ 가우디투어(메멘토) 집합",placeName:"Casa Batlló",desc:"까사바트요 앞 집합 · 08:25~13:30\n마이리얼트립 119,800원 (2인)",type:"spot",status:"confirmed",warn:"08:25 집합 시간 엄수",memo:"예약번호 EXP-20260705-00014744",url:"https://experiences.myrealtrip.com/products/3410190",cost:119800,coords:[41.3916,2.1649]},
{time:"09:30",title:"🏠 투어 — 까사밀라 (라 페드레라)",placeName:"Casa Milà La Pedrera",desc:"투어 코스: 까사바트요 → 까사밀라 → 구엘공원\n사그라다파밀리아는 외부만 (내부는 15:30 별도 티켓)",type:"spot",coords:[41.3953,2.1618]},
{time:"11:30",title:"🏡 투어 — 구엘공원",placeName:"Park Güell",desc:"모자이크 테라스\n투어 포함 · 13:30 종료",type:"spot",coords:[41.4145,2.1527]},
{time:"14:00",title:"🍽️ 점심 — 파이브가이즈 or 엘글롭",placeName:"El Glop Barcelona",desc:"엘글롭은 전날 WhatsApp으로 예약 가능",type:"food",warn:"엘글롭 예약하려면 전날 WhatsApp",cost:40000,coords:[41.4020,2.1600]},
{time:"15:30",title:"★ 사그라다파밀리아 입장",placeName:"Sagrada Familia",desc:"내부 관람 + 기념품샵\n예약은 방문 1달 전 오픈",type:"spot",status:"confirmed",warn:"15:30 지정 입장 시간",memo:"예약번호 102753344",url:"https://tickets.sagradafamilia.org/en/1-individual/4375-sagrada-familia",cost:60000,coords:[41.4036,2.1744]},
{time:"16:30",title:"🛍️ FC바르셀로나 공식스토어",placeName:"Barça Official Store Sagrada Familia",desc:"Barça Official Store | Sagrada Familia 점",type:"shopping",coords:[41.4048,2.1750]},
{time:"17:30",title:"🛍️ 기념품 쇼핑",placeName:"Passeig de Gràcia",desc:"그라시아 거리 일대",type:"shopping",coords:[41.3920,2.1650]},
{time:"19:00",title:"🍽️ 저녁 — Cerveceria Catalana",placeName:"Cerveceria Catalana",desc:"꿀대구 / 맛조개 / 감바스\n까사바트요에서 도보 7분",type:"food",cost:60000,coords:[41.3932,2.1576]},
{time:"20:30",title:"🛍️ El Corte Inglés (카탈루냐 광장)",placeName:"El Corte Inglés Plaça de Catalunya",desc:"장보기·쇼핑\n자라홈 / 마시모두띠 / 자라 / 유니클로",type:"shopping",memo:"부보 초콜릿, 꾸악 올리브오일, 프리오랏·베르뭇 와인, 뚜론 비센스, 고메즈 손소독제",coords:[41.3878,2.1712]},
{time:"21:30",title:"💡 한 잔 더 — La Esquinita / Bodega Molina",placeName:"Bodega Molina 1950 Barcelona",desc:"숙소 도보 2~8분\nMolina는 1950년부터 영업, 매일 12시~자정",type:"food",coords:[41.3968,2.1478]},
{time:"22:30",title:"🏨 숙소 복귀",placeName:"Mercure Barcelona Condor",desc:"동네 구경하며",type:"hotel",coords:[41.3920,2.1531]}
]},

// ─────────────────────────────── D3
{date:"9/15 (화)",region:"바르셀로나 — 구시가지 & 몬주익 🏰",color:"#E8725A",hotel:"머큐어 바르셀로나 콘도르 (3/3박)\n🕐 익일 체크아웃 12시",schedule:[
{time:"08:00",title:"☀️ 기상 및 아침식사",placeName:"Mercure Barcelona Condor",type:"etc",desc:"오늘은 많이 걷는 날 — 운동화",coords:[41.3920,2.1531]},
{time:"10:00",title:"🏙️ 카탈루냐 광장",placeName:"Plaça de Catalunya Barcelona",desc:"구시가지 시작점",type:"spot",coords:[41.3870,2.1700]},
{time:"10:30",title:"🛒 보케리아 시장",placeName:"Mercat de la Boqueria",desc:"과일주스, 하몽 시식",type:"spot",coords:[41.3816,2.1719]},
{time:"11:30",title:"⛪ 바르셀로나 대성당",placeName:"Barcelona Cathedral",desc:"고딕 지구 중심",type:"spot",coords:[41.3833,2.1761]},
{time:"12:00",title:"🛍️ 고딕 지구",placeName:"Barcelona Gothic Quarter",desc:"사바테즈(신발) / 코쿠아 플랫슈즈 / 오이소 잠옷",type:"shopping",memo:"쇼핑리스트 참고",coords:[41.3825,2.1770]},
{time:"13:00",title:"🏖️ 보른 지구",placeName:"El Born Barcelona",desc:"유니크한 상점 많음",type:"spot",coords:[41.3853,2.1836]},
{time:"14:00",title:"🍰 호프만 베이커리",placeName:"Hofmann Bakery Barcelona",desc:"보른 지구 · 디저트 유명\nMamma Tiramisù도 근처",type:"food",cost:20000,coords:[41.3862,2.1830]},
{time:"15:30",title:"📸 시우타데야 공원 (포토스팟)",placeName:"Cascada Monumental Parc de la Ciutadella",desc:"Cascada Monumental(기념비 폭포)\n폭포 위 계단에서 전체 + 물 반영까지 담기게 촬영",type:"spot",memo:"현지 추천 동선: 공원 → 개선문 → 보른 지구",coords:[41.3906,2.1873]},
{time:"17:00",title:"🏛️ 개선문 (Arc de Triomf)",placeName:"Arc de Triomf Barcelona",desc:"공원에서 도보 — 묶어서 가기 좋음",type:"spot",coords:[41.3910,2.1806]},
{time:"18:00",title:"💡 그라시아 거리 (명품거리) 산책",placeName:"Passeig de Gràcia",desc:"지난 여행 코스 · 몬주익 이동 전 시간 채우기",type:"shopping",coords:[41.3920,2.1650]},
{time:"19:30",title:"🌃 구시가지 야경",placeName:"Barcelona Gothic Quarter",desc:"골목 야경 산책",type:"spot",coords:[41.3833,2.1761]},
{time:"21:00",title:"🌉 몬주익 전망",placeName:"Castell de Montjuïc",desc:"바르셀로나 야경 포인트",type:"spot",coords:[41.3635,2.1660]},
{time:"22:00",title:"🍽️ 저녁 — 비니투스 (Vinitus)",placeName:"Vinitus Barcelona",desc:"꿀대구",type:"food",cost:55000,coords:[41.3893,2.1638]},
{time:"23:00",title:"🧳 숙소 복귀 / 짐 싸기",placeName:"Mercure Barcelona Condor",desc:"다음날 12시 체크아웃",type:"hotel",coords:[41.3920,2.1531]}
]},

// ─────────────────────────────── D4
{date:"9/16 (수)",region:"바르셀로나 → 포르투 🌉",color:"#2E86AB",hotel:"레전드 하우스 바이 스위트 포르토\nLegends House by Sweet Porto\n📋 아고다 #1694479710\n🕐 체크인 15시 / 체크아웃 11시 (1/4박)\n💰 4박 924,036원 (쿠폰)\n🍳 조식 있음(별도) · 무료취소 가능\n📍 상벤투역 바로 앞 · 루이스강 도보 10분\n⚠️ 실내화 없음 — 다이소 욕실화 지참\n💵 도시세 41,088원 (현장 결제)",schedule:[
{time:"08:00",title:"☀️ 기상 및 아침식사",placeName:"Mercure Barcelona Condor",type:"etc",coords:[41.3920,2.1531]},
{time:"09:30",title:"💡 오전 자유 — 까사밀라 내부 or 그라시아",placeName:"Casa Milà La Pedrera",desc:"가우디투어 때 외부만 봤으므로 내부 관람 선택지\n체크아웃 12시까지 여유",type:"spot",coords:[41.3953,2.1618]},
{time:"12:00",title:"🏨 머큐어 콘도르 체크아웃 (12시)",placeName:"Mercure Barcelona Condor",desc:"짐 보관 장소 확인 (바운스 등)",type:"hotel",warn:"짐보관 위치 미리 확인",url:"https://blog.naver.com/story_hdd/224189941059",coords:[41.3920,2.1531]},
{time:"13:00",title:"🚌 숙소 → 바르셀로나 공항 T2",placeName:"Barcelona El Prat Airport Terminal 2",desc:"버스/지하철 환승 → A2 공항버스 (약 1시간)",type:"move",coords:[41.2971,2.0785]},
{time:"14:30",title:"🛄 바르셀로나 공항 도착",placeName:"Barcelona El Prat Airport",desc:"라이언에어 카운터 · 수하물 규정 확인",type:"move",coords:[41.2971,2.0785]},
{time:"17:35",title:"✈️ 라이언에어 바르셀로나 → 포르투",placeName:"Barcelona El Prat Airport",desc:"약 1시간 · 20kg 수하물 포함 기준",type:"flight",status:"unbooked",warn:"아직 미예약 — 인당 16~17만원 / 2인 약 332,132원",url:"https://www.google.com/travel/flights/search?tfs=CBwQAholEgoyMDI2LTA5LTE2KABqBwgBEgNCQ05yDAgDEggvbS8wcG1uN0ABSAFwAYIBCwj___________8BmAEC",cost:332132,coords:[41.2971,2.0785]},
{time:"18:35",title:"🛬 포르투 도착",placeName:"Porto Airport",desc:"입국심사 후 19:35경 예상",type:"flight",coords:[41.2370,-8.6700]},
{time:"19:30",title:"🚇 공항 → 시내 (메트로)",placeName:"São Bento Station Porto",desc:"안단테(Andante) 교통카드 발급 필요",type:"move",url:"https://blog.naver.com/pearlo___o/224207612484",coords:[41.1459,-8.6106]},
{time:"20:00",title:"🏨 레전드 하우스 체크인",placeName:"Legends House by Sweet Porto",desc:"상벤투역 바로 앞",type:"hotel",status:"confirmed",memo:"예약번호 1694479710 · 실내화 없음(욕실화 지참) · 도시세 41,088원 현장",cost:924036,coords:[41.1460,-8.6110]},
{time:"20:30",title:"🍚 저녁 — 해물밥 (A Grade)",placeName:"A Grade Porto",desc:"리베이라 광장 근처",type:"food",cost:45000,coords:[41.1408,-8.6135]},
{time:"21:00",title:"🌉 리베이라 야경",placeName:"Cais da Ribeira Porto",desc:"동 루이스 다리 야경",type:"spot",coords:[41.1407,-8.6126]},
{time:"21:30",title:"🐙 뽈뽀 (문어요리)",placeName:"Botequim da Ribeira Porto",desc:"💡 지난 여행 검증 — botequim (강가 앞 뽈뽀 맛집)",type:"food",cost:40000,coords:[41.1407,-8.6126]},
{time:"22:30",title:"📰 신문 사진 찍기",placeName:"Ponte Dom Luís I",desc:"동 루이스 다리 근처\nD5에 재도전 가능",type:"spot",url:"https://m.cafe.naver.com/ca-fe/web/cafes/momsolleh/articles/849405",memo:"한국에서 신문 1~2부 챙겨가기",coords:[41.1403,-8.6098]},
{time:"23:00",title:"🧲 마그넷 구입",placeName:"Cais da Ribeira Porto",desc:"강변 기념품샵",type:"shopping",coords:[41.1407,-8.6126]}
]},

// ─────────────────────────────── D5
{date:"9/17 (목)",region:"포르투 — 웨딩스냅 & 모루정원 일몰 📸",color:"#2E86AB",hotel:"레전드 하우스 바이 스위트 포르토 (2/4박)",schedule:[
{time:"08:00",title:"☀️ 기상 및 아침식사",placeName:"Legends House by Sweet Porto",type:"etc",coords:[41.1460,-8.6110]},
{time:"10:00",title:"👗 스냅 코스 최종 확인 / 의상 준비",desc:"코스에 따라 이후 동선이 결정됨\n드레스 구김 주의",type:"etc",coords:[41.1460,-8.6110]},
{time:"12:00",title:"★ 포르투 웨딩스냅 촬영",placeName:"Ribeira Porto",desc:"12:00 ~ 13:30",type:"spot",status:"confirmed",warn:"잔금 150유로 — 현금 준비 필수!",memo:"현금 €150 미리 분리해서 준비",cost:217500,coords:[41.1407,-8.6126]},
{time:"14:00",title:"🚶 스냅 코스 이어서 구시가지 산책",placeName:"Porto Historic Centre",desc:"촬영 코스 그대로 이어서",type:"spot",coords:[41.1428,-8.6113]},
{time:"15:00",title:"🥚 늦은 점심 / 카페",placeName:"Manteigaria Porto",desc:"💡 Manteigaria or 카스트로(Castro) 나타\n에그타르트 + 커피",type:"food",cost:15000,coords:[41.1458,-8.6126]},
{time:"16:00",title:"💡 렐루서점 + 카르무 성당",placeName:"Livraria Lello",desc:"두 곳 도보 3분\n지난 여행 코스",type:"spot",warn:"현장 대기 길어 입장권 사전 구매 권장",cost:24000,coords:[41.1467,-8.6153]},
{time:"17:00",title:"💡 Pedra dos Gatinhos 사진스팟",placeName:"Pedra dos Gatinhos Porto",desc:"강변 사진 스팟 (지난 여행)\n신문사진 스팟으로 이동하며",type:"spot",coords:[41.1395,-8.6155]},
{time:"18:00",title:"📰 동 루이스 다리 신문 사진",placeName:"Ponte Dom Luís I",desc:"참고: 네이버카페 맘솔레 849405번 글",type:"spot",url:"https://m.cafe.naver.com/ca-fe/web/cafes/momsolleh/articles/849405",coords:[41.1403,-8.6098]},
{time:"18:30",title:"🌇 모루 정원 일몰 (18:30~20:00)",placeName:"Jardim do Morro",desc:"Gallo Grigio Pizza 테이크아웃\n생사이다(사과주) 함께",type:"spot",cost:25000,coords:[41.1375,-8.6105]},
{time:"20:30",title:"🍽️ 저녁 — 타파스 / 현지식",placeName:"Porto Ribeira restaurants",desc:"강변 쪽 현지식",type:"food",cost:45000,coords:[41.1407,-8.6126]},
{time:"22:00",title:"🏨 숙소 복귀",placeName:"Legends House by Sweet Porto",type:"hotel",coords:[41.1460,-8.6110]}
]},

// ─────────────────────────────── D6
{date:"9/18 (금)",region:"포르투 — 도심 아줄레주 & 두루강 크루즈 🍷",color:"#2E86AB",hotel:"레전드 하우스 바이 스위트 포르토 (3/4박)",schedule:[
{time:"08:00",title:"☕ 브런치 — Floresta cafe by Hungry biker",placeName:"Floresta Cafe by Hungry Biker Porto",desc:"오늘은 도심(아줄레주·전망·구시가지)\n운동화 필수",type:"food",cost:25000,coords:[41.1465,-8.6095]},
{time:"10:00",title:"⛪ 알마스 성당 (아줄레주 외벽)",placeName:"Capela das Almas Porto",desc:"포르투갈 대표 아줄레주 양식",type:"spot",coords:[41.1487,-8.6069]},
{time:"10:30",title:"🛒 볼량시장",placeName:"Mercado do Bolhão",desc:"현지 식재료·기념품",type:"spot",url:"https://m.blog.naver.com/soso_seoul/224179281858",coords:[41.1490,-8.6082]},
{time:"11:00",title:"🥚 Manteigaria 에그타르트",placeName:"Manteigaria Porto",type:"food",cost:6000,coords:[41.1458,-8.6126]},
{time:"12:00",title:"🛍️ 산타카타리나 거리",placeName:"Rua de Santa Catarina Porto",desc:"마시모두띠 / 자라",type:"shopping",coords:[41.1490,-8.6060]},
{time:"12:30",title:"🛍️ Via Catarina 쇼핑몰",placeName:"Via Catarina Shopping Porto",desc:"대형 쇼핑몰",type:"shopping",coords:[41.1487,-8.6062]},
{time:"13:00",title:"🍽️ 점심 — Antunes or Meia-Nau Porto",placeName:"Antunes Porto",desc:"둘 다 현지 맛집",type:"food",cost:45000,coords:[41.1518,-8.6120]},
{time:"14:00",title:"🚉 상벤투 기차역 (아줄레주 벽화)",placeName:"São Bento Station Porto",desc:"숙소 바로 앞",type:"spot",coords:[41.1459,-8.6106]},
{time:"15:00",title:"🍴 타임아웃마켓",placeName:"Time Out Market Porto",desc:"간단히 간식·음료",type:"food",cost:20000,coords:[41.1456,-8.6100]},
{time:"16:00",title:"⛪ 포르투 대성당 (Sé)",placeName:"Porto Cathedral",desc:"강가 근처 계단 많음 → 운동화 추천",type:"spot",coords:[41.1428,-8.6113]},
{time:"17:00",title:"🛍️ 히베이라 강변 내려오며 기념품샵",placeName:"Cais da Ribeira Porto",desc:"빈티지 Coração Alecrim / 엽서 Collect us",type:"shopping",coords:[41.1407,-8.6126]},
{time:"18:00",title:"💡 세하 두 필라르 수도원 / 테일러셀러스",placeName:"Mosteiro da Serra do Pilar",desc:"크루즈 승선장 건너편 가이아 쪽 전망\n포트와인 셀러·와우뮤지엄도 근처",type:"spot",coords:[41.1382,-8.6068]},
{time:"19:00",title:"🚢 두루 강 크루즈 (6개 다리, 약 50분)",placeName:"Cais da Ribeira Porto",desc:"6개교 코스",type:"spot",status:"pending",warn:"예약 필요 여부 확인",cost:36000,coords:[41.1407,-8.6126]},
{time:"20:00",title:"🍽️ 저녁 — ZA IN PORTO",placeName:"ZA IN PORTO",type:"food",cost:50000,coords:[41.1462,-8.6120]},
{time:"21:30",title:"🥚 에그타르트 — Nata Sweet Nata / Fábrica da Nata",placeName:"Nata Sweet Nata Porto",desc:"커피도 좋음",type:"food",cost:10000,coords:[41.1465,-8.6115]}
]},

// ─────────────────────────────── D7
{date:"9/19 (토)",region:"포르투 근교 — A안/B안 택1 🏖️",color:"#2E86AB",hotel:"레전드 하우스 (4/4박)\n🕐 익일 체크아웃 11시\n→ 다음 숙소: 엘리오스 마요르카 (심야 도착)",schedule:[
{time:"08:00",title:"☀️ 기상 및 아침식사",placeName:"Legends House by Sweet Porto",type:"etc",coords:[41.1460,-8.6110]},
{time:"09:00",title:"⚠️ 근교 일정 A안 / B안 중 택1",desc:"날씨 보고 결정\nA안=하루 꽉 참 / B안=반나절 여유",type:"etc",warn:"오늘 아침에 결정하기",coords:[41.1459,-8.6106]},
{time:"09:30",title:"[A안] 🚂 아베이루 + 코스타 노바",placeName:"Aveiro Portugal",desc:"상벤투역에서 기차 1시간, 편도 €4\n사진 잘 나오는 조합 · 하루 꽉 참",type:"spot",url:"https://m.blog.naver.com/yek0879/223742925003",cost:12000,coords:[40.6443,-8.6455]},
{time:"11:30",title:"[A안] 🏠 코스타 노바 줄무늬 집",placeName:"Costa Nova Aveiro",desc:"줄무늬 어부집 · 포토스팟",type:"spot",coords:[40.6247,-8.7500]},
{time:"13:00",title:"[A안] 🦐 Bronze Seafood & Lounge Bar",placeName:"Bronze Seafood Lounge Bar Costa Nova",type:"food",cost:55000,coords:[40.6250,-8.7495]},
{time:"09:30",title:"[B안] 🚋 포즈 + 마토지뉴스",placeName:"Foz do Douro Porto",desc:"1번 트램 히베이라 → 강변 따라 바다까지 약 25분\n반나절 · 여유",type:"spot",url:"https://0924abab.tistory.com/94",coords:[41.1500,-8.6800]},
{time:"12:00",title:"[B안] 🏖️ 포즈 해변 산책",placeName:"Praia da Foz Porto",type:"spot",coords:[41.1520,-8.6830]},
{time:"14:00",title:"[B안] 🔥 마토지뉴스 해산물 구이",placeName:"Meia-Nau Matosinhos",desc:"Meia-Nau Matosinhos",type:"food",cost:55000,coords:[41.1840,-8.6890]},
{time:"19:00",title:"🍽️ 시내 복귀 후 저녁",placeName:"Taberna dos Mercadores Porto",desc:"💡 Taberna Dos Mercadores (히베이라 광장 도보 1분)\n지난 여행 검증",type:"food",cost:50000,coords:[41.1418,-8.6114]},
{time:"20:30",title:"💡 히베이라 야경 + 포트와인 한 잔",placeName:"Cais da Ribeira Porto",desc:"포르투 마지막 밤 · 강변 테라스",type:"spot",cost:20000,coords:[41.1407,-8.6126]},
{time:"22:00",title:"🧳 짐 싸기",placeName:"Legends House by Sweet Porto",desc:"다음날 오전 체크아웃",type:"hotel",coords:[41.1460,-8.6110]}
]},

// ─────────────────────────────── D8
{date:"9/20 (일)",region:"포르투 → 마요르카(팔마) 심야이동 🌙",color:"#F5A623",hotel:"엘리오스 마요르카 호텔 앤 아파트먼트\nHelios Mallorca Hotel & Apartments\n📋 아고다 #1694459164\n🕐 익스프레스 체크인/아웃 (1/2박)\n💰 2박 511,844원\n🍳 조식 유료 추가함\n⚠️ 무료취소 불가 (50% 수수료) · 트윈베드일 수 있음\n📍 팔마 공항 바로 근처 · 주차 €10/일\n💵 세금/봉사료 15,064원 (현장)",schedule:[
{time:"08:00",title:"☀️ 기상 및 아침식사",placeName:"Legends House by Sweet Porto",type:"etc",coords:[41.1460,-8.6110]},
{time:"10:00",title:"🛍️ 볼량시장 / 시내 마지막 쇼핑",placeName:"Mercado do Bolhão",desc:"일요일이라 상점 상당수 휴무",type:"shopping",warn:"일요일 — 문 여는 곳 미리 확인",coords:[41.1490,-8.6082]},
{time:"11:00",title:"🏨 체크아웃 → 캐리어 호텔에 맡기기",placeName:"Legends House by Sweet Porto",desc:"짐 맡기고 가볍게 시내로",type:"hotel",warn:"숙소시트 11시 / 원본 일정시트 12시 → 체크아웃 시간 확인 필요",coords:[41.1460,-8.6110]},
{time:"12:00",title:"💡 일요일 대비 플랜 — 점심 Meia-Nau Porto",placeName:"Meia-Nau Porto",desc:"상점이 닫혀도 여는 곳:\n렐루서점 · 타임아웃마켓 · 강변 · 성당",type:"food",cost:45000,coords:[41.1450,-8.6120]},
{time:"14:00",title:"💡 포트와인 셀러 투어 or 못 본 스팟",placeName:"Taylor's Port Vila Nova de Gaia",desc:"짐 없이 가볍게",type:"spot",warn:"일요일 운영시간 확인",cost:30000,coords:[41.1355,-8.6135]},
{time:"18:00",title:"🚇 호텔에서 캐리어 찾아 공항으로",placeName:"Porto Airport",desc:"메트로 이용",type:"move",coords:[41.2370,-8.6700]},
{time:"19:00",title:"💡 저녁은 공항에서 간단히",placeName:"Porto Airport",desc:"21:10 출발 · 심야 이동이라 미리 먹고 타기",type:"food",cost:25000,coords:[41.2370,-8.6700]},
{time:"21:10",title:"✈️ 라이언에어 포르투 → 팔마",placeName:"Porto Airport",desc:"1시간 49분\n직항은 21시대 한 편뿐",type:"flight",status:"unbooked",warn:"아직 미예약 — 직항 편수 적음, 서둘러야 함 (인당 16~18만원)",url:"https://www.google.com/travel/flights/search?tfs=CBwQAholEgoyMDI2LTA5LTIwKABqDAgDEggvbS8wcG1uN3IHCAESA1BNSUABQAFIAXABggELCP___________wGYAQI",cost:340000,coords:[41.2370,-8.6700]},
{time:"23:59",title:"🛬 팔마 데 마요르카 도착",placeName:"Palma de Mallorca Airport",desc:"자정 도착",type:"flight",coords:[39.5517,2.7388]},
{time:"—",title:"🚕 팔마 공항 → 숙소 (익일 00:30)",placeName:"Helios Mallorca Hotel & Apartments",desc:"택시 약 10분 (2만원 예상)\nA2 공항버스 €5",type:"move",warn:"공항버스는 카드 태그가 안 돼 현금 결제했다는 후기 — 현금 준비",cost:20000,coords:[39.5550,2.7350]},
{time:"—",title:"🏨 엘리오스 마요르카 체크인 (익일 01:00)",placeName:"Helios Mallorca Hotel & Apartments",desc:"익스프레스 체크인/아웃",type:"hotel",status:"confirmed",memo:"예약번호 1694459164 · 조식 유료 추가함 · 세금 15,064원 현장",cost:511844,coords:[39.5550,2.7350]}
]},

// ─────────────────────────────── D9
{date:"9/21 (월)",region:"마요르카 — 렌터카 & 칼로데스모로 🏖️",color:"#F5A623",hotel:"엘리오스 마요르카 (2/2박)\n🕐 익일 체크아웃",schedule:[
{time:"07:30",title:"🍳 기상 / 호텔 조식",placeName:"Helios Mallorca Hotel & Apartments",desc:"조식 맛있다는 현지 후기",type:"food",warn:"조식 시작 시간 확인 필요",coords:[39.5550,2.7350]},
{time:"09:00",title:"★ 렌터카 픽업 — Wiber Rent",placeName:"Palma de Mallorca Airport",desc:"B3 아우디 A1\n대여 9/21 09:00 ~ 반납 9/24 15:00\n숙소→공항 A1 버스 또는 도보 25분",type:"move",status:"confirmed",warn:"필수 실물서류 3종: 한국 운전면허증 + 국제(영문)면허증 + 여권 — 캡처·복사본 절대 불가",memo:"예약번호 165001403",url:"https://blog.naver.com/inmo_o/224338081096",coords:[39.5517,2.7388]},
{time:"10:00",title:"🌊 칼로 데스 모로 (Caló des Moro)",placeName:"Caló des Moro Mallorca",desc:"늦게 가면 사람 많음\n주차장 → 해변 도보 15~20분",type:"spot",warn:"화장실·매점 없음 — 돗자리·모자·양산·물·간식 챙기기",coords:[39.3340,3.1190]},
{time:"13:00",title:"💡 점심 — 산타니(Santanyí) 마을",placeName:"Santanyí Mallorca",desc:"칼로데스모로에서 차로 약 15분\n지난 여행 방문 · 마을 구경 + 식사 한번에",type:"food",cost:50000,coords:[39.3552,3.1276]},
{time:"15:00",title:"💡 숙소 복귀 — 호텔 수영장 / 해변",placeName:"Helios Mallorca Hotel & Apartments",desc:"수영장 잘 구비되어 있음\n도보 2분 해변은 '마요르카 해변' 느낌은 아니라는 후기",type:"etc",memo:"팔마 시내 갈 때는 차 두고 버스 이용",coords:[39.5550,2.7350]},
{time:"16:00",title:"🚌 팔마 시내 구경",placeName:"Palma de Mallorca",desc:"차는 숙소에 두고 호텔 뒤에서 버스로 30분",type:"spot",warn:"팔마 주차난 심함 — 렌터카 두고 버스로",coords:[39.5696,2.6502]},
{time:"17:00",title:"💡 간식 — born8 or 리바레노 젤라또",placeName:"born8 Palma",desc:"born8 야외테이블 햄버거 / 리바레노 젤라또\n지난 여행 검증",type:"food",cost:20000,coords:[39.5700,2.6480]},
{time:"18:00",title:"🏖️ 칼라 마요르 해변 + 편집샵",placeName:"Cala Major Palma",desc:"주변 편집샵 구경",type:"spot",coords:[39.5546,2.6046]},
{time:"19:00",title:"🛍️ 자라 / 로에베 쇼핑",placeName:"Zara Palma de Mallorca",type:"shopping",coords:[39.5710,2.6510]},
{time:"20:00",title:"⛪ 팔마 대성당 + 플리마켓",placeName:"Cathedral of Palma de Mallorca",desc:"야경도 좋음",type:"spot",coords:[39.5674,2.6486]},
{time:"21:00",title:"🍽️ 저녁 — 타파스",placeName:"Alchemy Restaurante Palma",desc:"💡 Alchemy Restaurante (지난 여행 방문지)",type:"food",cost:55000,coords:[39.5705,2.6490]},
{time:"22:30",title:"💡 호텔 바에서 한 잔",placeName:"Helios Mallorca Hotel & Apartments",desc:"현지 후기 — 음료 가격 합리적이고 맛있음",type:"etc",cost:20000,coords:[39.5550,2.7350]}
]},

// ─────────────────────────────── D10
{date:"9/22 (화)",region:"마요르카 — 발데모사·데이아·소예르 🏔️",color:"#F5A623",hotel:"그란 호텔 소예르 ⭐⭐⭐⭐⭐\nGran Hotel Sóller\n📋 트립비토즈 #3510267\n🕐 체크인 15시 / 체크아웃 12시 (1/2박)\n💰 2박 622,354원 (앱할인)\n🍳 조식 + 스파 포함 · 무료취소 가능\n📍 주차 €18/일\n💵 현장결제 30,131원",schedule:[
{time:"08:00",title:"🍳 기상 및 조식",placeName:"Helios Mallorca Hotel & Apartments",type:"food",coords:[39.5550,2.7350]},
{time:"09:00",title:"🏨 엘리오스 마요르카 체크아웃",placeName:"Helios Mallorca Hotel & Apartments",type:"hotel",coords:[39.5550,2.7350]},
{time:"09:30",title:"🚗 북부 소도시 드라이브 시작",desc:"발데모사 → 데이아 → 소예르\n트라문타나 산길",type:"move",warn:"산길 커브 많음 — 멀미약 챙기기",url:"https://blog.naver.com/djgy5405/224211584710",coords:[39.5550,2.7350]},
{time:"10:00",title:"⛪ 발데모사 구경",placeName:"Valldemossa Mallorca",desc:"쇼팽이 머문 수도원 마을",type:"spot",coords:[39.7108,2.6224]},
{time:"10:45",title:"💡 Forn i Pastisseria Can Molinas",placeName:"Forn i Pastisseria Can Molinas Valldemossa",desc:"마을 대표 빵집 (지난 여행 검증)\n엔사이마다",type:"food",cost:15000,coords:[39.7100,2.6216]},
{time:"11:30",title:"🏘️ 데이아 구경",placeName:"Deià Mallorca",desc:"예술가의 마을\n💡 Terra Origens 등 편집샵 · 공방 많고 기념품 사기 좋음",type:"spot",coords:[39.7482,2.6494]},
{time:"13:00",title:"🍽️ 점심 — 데이아 / 소예르 인근",placeName:"Sa Font Fresca Deià",desc:"💡 Sa Font Fresca (데이아) or La Posada\n지난 여행 방문",type:"food",cost:50000,coords:[39.7490,2.6480]},
{time:"15:00",title:"🏨 그란 호텔 소예르 체크인 (15시)",placeName:"Gran Hotel Sóller",desc:"5성급 · 조식 + 스파 포함",type:"hotel",status:"confirmed",memo:"예약번호 3510267 · 주차 €18/일 · 현장결제 30,131원",cost:622354,coords:[39.7660,2.7155]},
{time:"16:00",title:"💡 호텔 스파 이용 시간 예약",placeName:"Gran Hotel Sóller",desc:"요금 포함 · 인기 시간대 미리 잡아두기",type:"etc",coords:[39.7660,2.7155]},
{time:"17:00",title:"🍊 소예르 시내 산책",placeName:"Plaça Constitució Sóller",desc:"오렌지 광장 · 소예르 성당",type:"spot",coords:[39.7655,2.7148]},
{time:"20:00",title:"🥘 저녁 — 호텔 or 소예르 시내",placeName:"Brises del Mar Port de Sóller",desc:"💡 Brises del Mar — 소예르 빠에야 맛집 (지난 여행 검증)",type:"food",cost:55000,coords:[39.7952,2.6908]}
]},

// ─────────────────────────────── D11
{date:"9/23 (수)",region:"마요르카 — 소예르 트램 & 스파 🚃",color:"#F5A623",hotel:"그란 호텔 소예르 (2/2박)\n🕐 익일 체크아웃 12시",schedule:[
{time:"09:00",title:"🍳 호텔 조식 (포함)",placeName:"Gran Hotel Sóller",desc:"트라문타나 뷰",type:"food",coords:[39.7660,2.7155]},
{time:"10:00",title:"⛪ 소예르 성당",placeName:"Església de Sant Bartomeu Sóller",desc:"오렌지 광장 앞",type:"spot",coords:[39.7656,2.7147]},
{time:"11:00",title:"🚃 소예르 나무 트램",placeName:"Tranvía de Sóller",desc:"성당 앞 ↔ 항구 · 오렌지밭 뷰",type:"spot",status:"pending",warn:"예약 필요 여부 확인",cost:20000,coords:[39.7655,2.7148]},
{time:"11:30",title:"⛵ 소예르 항구 도착",placeName:"Port de Sóller",desc:"항구 산책",type:"spot",coords:[39.7952,2.6908]},
{time:"12:00",title:"💡 Ocea 카페 (항구)",placeName:"Ocea Port de Sóller",desc:"지난 여행 방문 · 항구 걸으면서",type:"food",cost:15000,coords:[39.7960,2.6920]},
{time:"13:00",title:"💡 점심 — Nautilus Sóller",placeName:"Restaurante Nautilus Port de Sóller",desc:"절벽 위 레스토랑 — 지난 여행 하이라이트",type:"food",status:"pending",warn:"예약 권장",cost:60000,coords:[39.7938,2.6935]},
{time:"15:00",title:"🧖 호텔 스파 (요금 포함)",placeName:"Gran Hotel Sóller",desc:"조식+스파 포함 요금",type:"etc",coords:[39.7660,2.7155]},
{time:"17:00",title:"💡 항구 산책 / 일몰",placeName:"Port de Sóller",desc:"트램으로 다시 나가도 좋음",type:"spot",coords:[39.7952,2.6908]},
{time:"19:00",title:"🍽️ 저녁",placeName:"Plaça Constitució Sóller",desc:"소예르 시내 or 호텔",type:"food",cost:50000,coords:[39.7655,2.7148]},
{time:"22:00",title:"🧳 짐 정리",placeName:"Gran Hotel Sóller",type:"hotel",coords:[39.7660,2.7155]}
]},

// ─────────────────────────────── D12
{date:"9/24 (목)",region:"마요르카 → 바르셀로나 🍷",color:"#E8725A",hotel:"H10 메트로폴리탄 호텔\nH10 Metropolitan Hotel\n📋 아고다 #1694841847\n🕐 체크인 15시 / 체크아웃 12시 (1/1박)\n💰 1박 394,984원 (앱할인)\n🍳 조식 미포함\n⚠️ 무료취소 9/21 23:59(현지시간)까지\n💵 도시세 18,660원 (현장)\n📦 체크아웃 후 짐보관 가능",schedule:[
{time:"09:00",title:"🍳 호텔 조식",placeName:"Gran Hotel Sóller",type:"food",coords:[39.7660,2.7155]},
{time:"10:00",title:"💡 마지막 소예르 산책 / 기념품",placeName:"Plaça Constitució Sóller",desc:"공방·편집샵 많음 · 체크아웃 전 여유시간",type:"shopping",coords:[39.7655,2.7148]},
{time:"12:00",title:"🏨 그란 호텔 소예르 체크아웃 (12시)",placeName:"Gran Hotel Sóller",type:"hotel",coords:[39.7660,2.7155]},
{time:"13:00",title:"⛽ 렌터카 주유 후 팔마 공항 반납",placeName:"Palma de Mallorca Airport",desc:"15:00까지 반납",type:"move",warn:"주유/반납 절차 사전 확인 — 참고 블로그",url:"https://blog.naver.com/inmo_o/224338081096",coords:[39.5517,2.7388]},
{time:"14:00",title:"🛄 팔마 공항 도착",placeName:"Palma de Mallorca Airport",type:"move",coords:[39.5517,2.7388]},
{time:"16:30",title:"✈️ 부엘링 팔마 → 바르셀로나",placeName:"Palma de Mallorca Airport",desc:"약 1시간 · 수하물 25kg(유료)\n2인 196,945원",type:"flight",status:"confirmed",memo:"예약번호 IHHNHP · 계정 rachel506wnsgk@gmail.com",bookingUrl:"https://tickets.vueling.com/ChangeItinerary.aspx",cost:196945,coords:[39.5517,2.7388]},
{time:"17:30",title:"🛬 바르셀로나 도착",placeName:"Barcelona El Prat Airport",type:"flight",coords:[41.2971,2.0785]},
{time:"18:30",title:"🏨 H10 메트로폴리탄 체크인",placeName:"H10 Metropolitan Hotel Barcelona",desc:"조식 미포함",type:"hotel",status:"confirmed",memo:"예약번호 1694841847 · 도시세 18,660원 현장 · 짐보관 가능",cost:394984,coords:[41.3887,2.1640]},
{time:"19:00",title:"🍽️ 저녁 — 시우다드 콘달",placeName:"Ciudad Condal Barcelona",desc:"타파스",type:"food",cost:55000,coords:[41.3908,2.1650]},
{time:"20:00",title:"🍨 아이스크림 — DelaCrem",placeName:"DelaCrem Barcelona",type:"food",cost:12000,coords:[41.3947,2.1595]},
{time:"20:30",title:"🌃 야경 보며 쇼핑 / 타파스",placeName:"Passeig de Gràcia",desc:"💡 그라시아 거리(명품거리) 마지막 쇼핑",type:"shopping",coords:[41.3920,2.1650]},
{time:"21:30",title:"🧳 숙소 복귀 / 짐 미리 싸기",placeName:"H10 Metropolitan Hotel Barcelona",desc:"다음날 아침 캐리어 맡기고 나감",type:"hotel",coords:[41.3887,2.1640]}
]},

// ─────────────────────────────── D13
{date:"9/25 (금)",region:"바르셀로나 → 인천 ✈️🇰🇷",color:"#888",hotel:"기내 1박\nH10 메트로폴리탄 체크아웃 12시\n→ 짐 호텔 보관 가능",schedule:[
{time:"08:00",title:"☀️ 기상 및 아침식사",placeName:"H10 Metropolitan Hotel Barcelona",type:"etc",coords:[41.3887,2.1640]},
{time:"09:00",title:"📦 캐리어 호텔에 맡기기",placeName:"H10 Metropolitan Hotel Barcelona",desc:"체크아웃 12시 · 짐보관 가능",type:"hotel",coords:[41.3887,2.1640]},
{time:"09:30",title:"🚌 라로카빌리지 셔틀버스 탑승",placeName:"Passeig de Gràcia",desc:"Shopping Express 셔틀",type:"move",status:"unbooked",warn:"셔틀 시간 예약·확인 필요 · 쇼핑백용 큰 타포린백 챙기기",url:"https://www.thebicestervillageshoppingcollection.com/e-commerce/bvsc/ko/lvv/shopping-express",cost:30000,coords:[41.3920,2.1650]},
{time:"10:30",title:"🛍️ 라로카빌리지 아울렛 쇼핑",placeName:"La Roca Village",desc:"할인 팁 블로그 참고",type:"shopping",url:"https://m.blog.naver.com/cham4lang1/224083765168",cost:500000,coords:[41.6103,2.3422]},
{time:"13:00",title:"🍽️ 점심 — 아울렛 내에서",placeName:"La Roca Village",type:"food",cost:30000,coords:[41.6103,2.3422]},
{time:"14:30",title:"🏡 구엘공원 / 시내 마지막 쇼핑",placeName:"Park Güell",desc:"모자이크 테라스",type:"spot",warn:"유료구역은 시간지정 예약 필요 여부 확인",cost:15000,coords:[41.4145,2.1527]},
{time:"15:30",title:"💡 약국 + 마트 마지막 장보기",placeName:"Mercadona Barcelona",desc:"지난 여행: 약국 비타민·콜라겐크림\nMercadona 꿀국화차·올리브바디크림·환타레몬",type:"shopping",cost:50000,coords:[41.3860,2.1690]},
{time:"16:30",title:"🚌 호텔에서 캐리어 찾아 공항으로",placeName:"Barcelona El Prat Airport Terminal 1",desc:"지하철 or A2 공항버스",type:"move",coords:[41.2971,2.0785]},
{time:"17:00",title:"🧾 바르셀로나 공항 T1 도착",placeName:"Barcelona El Prat Airport Terminal 1",desc:"택스리펀(Tax Refund) 처리",type:"move",warn:"택스리펀 시간 확보 · 유리제품 위탁 전 포장 확인",coords:[41.2971,2.0785]},
{time:"18:30",title:"💡 저녁은 공항에서",placeName:"Barcelona El Prat Airport Terminal 1",desc:"택스리펀 마치고 여유 있게 · 면세점",type:"food",cost:30000,coords:[41.2971,2.0785]},
{time:"20:50",title:"✈️ OZ0512 바르셀로나 → 인천",placeName:"Barcelona El Prat Airport",desc:"12시간 30분 · 무료수하물 23kg\n탑승 T1 / 인천 9/26 16:20 도착",type:"flight",status:"confirmed",memo:"예약번호 E9FTBZ · e-Ticket 주나 9885075985754 / 호성 9885075985753",coords:[41.2971,2.0785]}
]},

// ─────────────────────────────── D14
{date:"9/26 (토)",region:"인천 도착 🇰🇷",color:"#888",hotel:"—",schedule:[
{time:"16:20",title:"🛬 인천공항 제2터미널 도착",placeName:"Incheon International Airport Terminal 2",desc:"12박 14일 여행 무사 귀환!",type:"flight",coords:[37.4602,126.4407]},
{time:"17:00",title:"📄 FTA 서류 / 면세 정리",desc:"출발 전 준비한 'FTA 서류 수령' 관련 마무리",type:"etc",coords:[37.4602,126.4407]}
]}
];

// ══════════ 바우처 · 예약 정보 (오프라인 확인용) ══════════
window.VOUCHER_DATA={
flights:[
 {no:1,leg:"인천 → 바르셀로나",date:"9/13 (일)",airline:"아시아나항공",flight:"OZ0511",sched:"11:50 ~ 19:10",dur:"14시간 20분",ref:"E9FTBZ",bag:"무료 23kg",term:"탑승 T2 / 하차 T1",status:"confirmed",
  eticket:[["주나","9885075985754"],["호성","9885075985753"]],note:"위탁수하물은 체크인 전 사전 추가가 저렴",url:"https://flyasiana.com/C/KR/KO/contents/excess-baggage"},
 {no:2,leg:"바르셀로나 → 포르투",date:"9/16 (수)",airline:"라이언에어",flight:"—",sched:"17:35 ~ 18:35",dur:"약 1시간",ref:"미예약",bag:"20kg (유료)",term:"—",status:"unbooked",
  price:"인당 16~17만원 / 2인 약 332,132원 (192.86유로)",note:"20kg 수하물 포함 기준",url:"https://www.google.com/travel/flights/search?tfs=CBwQAholEgoyMDI2LTA5LTE2KABqBwgBEgNCQ05yDAgDEggvbS8wcG1uN0ABSAFwAYIBCwj___________8BmAEC"},
 {no:3,leg:"포르투 → 팔마(마요르카)",date:"9/20 (일)",airline:"라이언에어",flight:"—",sched:"21:10 ~ 23:59",dur:"1시간 49분",ref:"미예약",bag:"20kg (유료)",term:"—",status:"unbooked",
  price:"인당 16~18만원",note:"직항은 21시대 한 편뿐 — 서둘러 예약",url:"https://www.google.com/travel/flights/search?tfs=CBwQAholEgoyMDI2LTA5LTIwKABqDAgDEggvbS8wcG1uN3IHCAESA1BNSUABQAFIAXABggELCP___________wGYAQI"},
 {no:4,leg:"팔마 → 바르셀로나",date:"9/24 (목)",airline:"부엘링",flight:"—",sched:"16:30 ~ 17:30",dur:"약 1시간",ref:"IHHNHP",bag:"25kg (유료)",term:"—",status:"confirmed",
  price:"2인 196,945원 (114.36유로)",account:["rachel506wnsgk@gmail.com","wnsk50611!P"],note:"예약조회 tickets.vueling.com",url:"https://tickets.vueling.com/ChangeItinerary.aspx"},
 {no:5,leg:"바르셀로나 → 인천",date:"9/25 (금)",airline:"아시아나항공",flight:"OZ0512",sched:"20:50 ~ 9/26 16:20",dur:"12시간 30분",ref:"E9FTBZ",bag:"무료 23kg",term:"탑승 T1 / 하차 T2",status:"confirmed",
  eticket:[["주나","9885075985754"],["호성","9885075985753"]]}
],
hotels:[
 {no:1,city:"바르셀로나",nights:"9/13-16 · 3박",name:"머큐어 바르셀로나 콘도르",name2:"Mercure Barcelona Condor · 4성급",site:"트립비토즈",ref:"3508557",inout:"체크인 14시 / 체크아웃 12시",
  perNight:"241,775원",total:"3박 764,355원",breakfast:"유료 (1인 €14)",loc:"시내까지 지하철 20분 · 자전거 15분",cash:"도시세 64,404원",
  notes:["테라스 없음","앱할인 적용"],url:"https://www.tripbtoz.com/hotels/1217387",coords:[41.3920,2.1531]},
 {no:2,city:"포르투",nights:"9/16-20 · 4박",name:"레전드 하우스 바이 스위트 포르토",name2:"Legends House by Sweet Porto",site:"아고다",ref:"1694479710",inout:"체크인 15시 / 체크아웃 11시",
  perNight:"241,181원",total:"4박 924,036원",breakfast:"조식 있음 (별도)",loc:"상벤투역 바로 앞 · 루이스강 도보 10분",cash:"도시세 41,088원",
  notes:["실내화 없음 — 다이소 욕실화 지참","무료취소 가능","쿠폰할인","체크아웃 시간 11시/12시 확인 필요"],coords:[41.1460,-8.6110]},
 {no:3,city:"마요르카(팔마)",nights:"9/20-22 · 2박",name:"엘리오스 마요르카 호텔 앤 아파트먼트",name2:"Helios Mallorca Hotel & Apartments",site:"아고다",ref:"1694459164",inout:"익스프레스 체크인 / 아웃",
  perNight:"250,000원",total:"511,844원",breakfast:"포함 (유료 추가함)",loc:"팔마 공항 바로 근처 · 주차 €10/일",cash:"세금·봉사료 15,064원",
  notes:["무료취소 불가 (50% 수수료)","트윈베드일 수 있음","테라스 있음","현지후기: 수영장·호텔바 좋음, 팔마 시내 버스 30분"],coords:[39.5550,2.7350]},
 {no:4,city:"마요르카(소예르)",nights:"9/22-24 · 2박",name:"그란 호텔 소예르",name2:"Gran Hotel Sóller · 5성급",site:"트립비토즈",ref:"3510267",inout:"체크인 15시 / 체크아웃 12시",
  perNight:"295,386원",total:"622,354원",breakfast:"조식 + 스파 포함",loc:"소예르 · 주차 €18/일",cash:"현장결제 30,131원",
  notes:["무료취소 가능","앱할인","스파 이용 시간 미리 예약"],coords:[39.7660,2.7155]},
 {no:5,city:"바르셀로나",nights:"9/24-25 · 1박",name:"H10 메트로폴리탄 호텔",name2:"H10 Metropolitan Hotel",site:"아고다",ref:"1694841847",inout:"체크인 15시 / 체크아웃 12시",
  perNight:"394,984원",total:"394,984원",breakfast:"미포함",loc:"바르셀로나 시내",cash:"도시세 18,660원",
  notes:["무료취소 9/21 23:59(현지시간)까지","테라스 있음","체크아웃 후 짐보관 가능","공항 셔틀 별도 문의"],coords:[41.3887,2.1640]}
],
bookings:[
 {kind:"투어",name:"가우디투어 — 메멘토 (마이리얼트립)",when:"9/14(월) 08:25~13:30",ref:"EXP-20260705-00014744",price:"119,800원 (2인)",status:"confirmed",
  note:"까사바트요 앞 집합 / 코스: 까사바트요 · 사그라다파밀리아(외부) · 까사밀라 · 구엘공원",url:"https://experiences.myrealtrip.com/products/3410190"},
 {kind:"입장권",name:"사그라다파밀리아",when:"9/14(월) 15:30",ref:"102753344",price:"—",status:"confirmed",
  note:"예약은 방문 1달 전 오픈",url:"https://tickets.sagradafamilia.org/en/1-individual/4375-sagrada-familia"},
 {kind:"스냅",name:"포르투 웨딩스냅",when:"9/17(목) 12:00~13:30",ref:"—",price:"잔금 €150 (현금)",status:"confirmed",
  note:"현금 준비 필수! 코스에 따라 당일 동선 결정"},
 {kind:"렌터카",name:"Wiber Rent — B3 아우디 A1",when:"대여 9/21(월) 09:00 ~ 반납 9/24(목) 15:00",ref:"165001403",price:"—",status:"confirmed",
  note:"필수 실물서류 3종: 한국 면허증 + 국제/영문 면허증 + 여권 (디지털 사본 불인정)",url:"https://blog.naver.com/inmo_o/224338081096"},
 {kind:"크루즈",name:"두루 강 크루즈 (6개 다리, 약 50분)",when:"9/18(금) 저녁",ref:"—",price:"—",status:"pending",note:"예약 필요 여부 확인"},
 {kind:"교통",name:"소예르 나무 트램",when:"9/23(수)",ref:"—",price:"—",status:"pending",note:"예약 필요 여부 확인"},
 {kind:"쇼핑",name:"라로카빌리지 셔틀버스",when:"9/25(금) 오전",ref:"—",price:"—",status:"unbooked",
  note:"시간 확정 필요",url:"https://www.thebicestervillageshoppingcollection.com/e-commerce/bvsc/ko/lvv/shopping-express"},
 {kind:"식당",name:"엘글롭 (El Glop)",when:"9/14(월) 점심",ref:"—",price:"—",status:"unbooked",note:"전날 WhatsApp으로 예약 가능"},
 {kind:"식당",name:"Antigua",when:"9/13(일) 밤",ref:"—",price:"—",status:"pending",note:"당일 TheFork 앱 예약 시 할인"},
 {kind:"식당",name:"Nautilus Sóller",when:"9/23(수) 점심",ref:"—",price:"—",status:"pending",note:"절벽 위 레스토랑 · 예약 권장"},
 {kind:"입장권",name:"렐루서점 (Livraria Lello)",when:"9/17(목) 16:00",ref:"—",price:"—",status:"pending",note:"현장 대기 길어 사전 구매 권장"},
 {kind:"투어",name:"마요르카 요트투어",when:"미정",ref:"—",price:"—",status:"pending",
  note:"할지 / 언제 / 어느 지역인지 확인 필요",url:"https://m.blog.naver.com/mingggggggggz/223987464158"},
 {kind:"식당",name:"Bambarol",when:"미정",ref:"—",price:"—",status:"pending",note:"목~토 저녁만 오픈 — 이번 일정 중 9/17·18·19 저녁 가능"}
],
cash:[
 {item:"포르투 웨딩스냅 잔금",amount:"€150",when:"9/17",why:"현금만 가능 — 절대 잊지 말 것"},
 {item:"팔마 공항 A2 버스",amount:"€5 × 2",when:"9/21 심야",why:"카드 태그 안 되는 경우 있음 (현지 후기)"},
 {item:"머큐어 콘도르 도시세",amount:"64,404원",when:"9/13",why:"숙소 현장 결제"},
 {item:"레전드 하우스 도시세",amount:"41,088원",when:"9/16",why:"숙소 현장 결제"},
 {item:"엘리오스 세금·봉사료",amount:"15,064원",when:"9/21",why:"숙소 현장 결제"},
 {item:"그란 호텔 소예르",amount:"30,131원",when:"9/22",why:"숙소 현장 결제 (주차 €18/일 별도)"},
 {item:"H10 메트로폴리탄 도시세",amount:"18,660원",when:"9/24",why:"숙소 현장 결제"},
 {item:"시장·팁·소액 결제",amount:"€100~150",when:"상시",why:"볼량시장 등 카드 안 되는 곳"}
],
docs:[
 {icon:"🛂",title:"여권 (실물)",note:"유효기간 6개월 이상 · 사본/사진 별도 백업",critical:true},
 {icon:"🚗",title:"한국 운전면허증 (실물)",note:"Wiber 렌터카 — 캡처·복사본 불가",critical:true},
 {icon:"🌍",title:"국제(영문) 운전면허증 (실물)",note:"경찰서·운전면허시험장 발급",critical:true},
 {icon:"✈️",title:"항공권 e-Ticket 출력본",note:"주나 9885075985754 / 호성 9885075985753"},
 {icon:"🏨",title:"숙소 5곳 바우처 출력본",note:"예약번호는 이 화면에서도 확인 가능"},
 {icon:"🎫",title:"투어·입장권 바우처 출력본",note:"가우디투어 · 사그라다파밀리아 · 렌터카 · 스냅"},
 {icon:"🛡️",title:"여행자보험 증서",note:"유럽 의료비 비쌈 — 휴대폰 + 출력본"}
]
};
