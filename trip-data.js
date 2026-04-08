// ══════════ TRIP DATA ══════════
// 여행 일정 원본 데이터. localStorage/Firebase에 저장된 값이 없을 때만 사용되는 seed.
// 앱 로직과 분리되어 있어 일정만 수정할 때 app.js를 건드리지 않아도 된다.
// placeName: Google Maps 검색용 장소명. 비어있으면 hotel 타입은 day.hotel, 그 외엔 제목 휴리스틱 fallback.
window.DEFAULT_TRIP_DAYS=[
{date:"9/13 (일)",region:"한국 → 바르셀로나 ✈️",color:"#E8725A",hotel:"머큐어 바르셀로나 콘도르 (4성급)\n예약번호: 3508557 | 체크인 14시",schedule:[
{time:"11:50",title:"✈️ 인천공항 출발",placeName:"Incheon International Airport",desc:"OZ0511 | 터미널2 | 14시간 비행\n수하물: 23kg",type:"flight",status:"confirmed",coords:[37.4602,126.4407]},
{time:"19:10",title:"🛬 바르셀로나 도착",placeName:"Barcelona El Prat Airport",desc:"엘프라트 공항 T1",type:"flight",coords:[41.2971,2.0785]},
{time:"20:00",title:"🚌 공항→호텔",desc:"A2공항버스→V13 환승 (약 1시간)",type:"move"},
{time:"21:00",title:"🏨 호텔 체크인",placeName:"Mercure Barcelona Condor",desc:"머큐어 바르셀로나 콘도르",type:"hotel",coords:[41.3920,2.1531]},
{time:"21:30",title:"🍽️ 가벼운 첫날 저녁",desc:"호텔 근처 간단히 식사",type:"food"}
]},
{date:"9/14 (월)",region:"바르셀로나 — 가우디 투어 🏛️",color:"#E8725A",hotel:"머큐어 바르셀로나 콘도르",schedule:[
{time:"08:00",title:"☀️ 조식 & 출발",placeName:"Mercure Barcelona Condor",desc:"동키 자전거 or 지하철",type:"etc",coords:[41.3920,2.1531]},
{time:"09:00",title:"⛪ 사그라다 파밀리아",placeName:"Sagrada Familia",desc:"가우디의 미완성 걸작\n오전 방문 추천",type:"spot",warn:"사전 예약 필수",coords:[41.4036,2.1744],url:"https://sagradafamilia.org/tickets"},
{time:"11:00",title:"🏠 카사 바트요 / 라 페드레라",placeName:"Casa Batlló",desc:"그라시아 거리 가우디 건축물\n옥상 포토존 필수",type:"spot",warn:"사전 예약 권장",coords:[41.3916,2.1649]},
{time:"13:00",title:"🍽️ Cerveceria Catalana",placeName:"Cerveceria Catalana",desc:"No.1 타파스집\n꿀대구, 감바스 추천\n13시 전 도착",type:"food",coords:[41.3932,2.1576],cost:50000},
{time:"15:00",title:"🛍️ 파세이그 데 그라시아",placeName:"Passeig de Gràcia",desc:"명품 쇼핑 & 라치나타",type:"shopping",coords:[41.3920,2.1650]},
{time:"16:30",title:"🏖️ 보른 지구",placeName:"El Born Barcelona",desc:"중세 분위기 탐방\n카페에서 휴식",type:"spot",coords:[41.3853,2.1836]},
{time:"18:00",title:"🌊 바르셀로네타 해변",placeName:"Barceloneta Beach",desc:"지중해 석양 감상",type:"spot",coords:[41.3784,2.1925]},
{time:"19:00",title:"🍽️ El Xampanyet",placeName:"El Xampanyet",desc:"보른 지구 타파스 & 카바",type:"food",coords:[41.3845,2.1820],cost:40000},
{time:"21:00",title:"🌃 야경 산책",desc:"해변 야경 & 귀환",type:"spot",coords:[41.3784,2.1925]}
]},
{date:"9/15 (화)",region:"바르셀로나 — 고딕지구 & 몬주익 🏰",color:"#E8725A",hotel:"머큐어 바르셀로나 콘도르",schedule:[
{time:"08:00",title:"☀️ 조식 & 출발",placeName:"Mercure Barcelona Condor",desc:"시내 관광 시작",type:"etc",coords:[41.3920,2.1531]},
{time:"08:30",title:"🛒 보케리아 시장",placeName:"Mercat de la Boqueria",desc:"200개+ 점포\n과일주스, 하몽 시식",type:"spot",coords:[41.3816,2.1719]},
{time:"09:30",title:"🏛️ 고딕지구 산책",placeName:"Barcelona Cathedral",desc:"대성당, 레이알 광장",type:"spot",coords:[41.3833,2.1761]},
{time:"11:00",title:"🎨 피카소 미술관",placeName:"Museu Picasso Barcelona",desc:"피카소 초기작 소장",type:"spot",warn:"예약 권장",coords:[41.3853,2.1811]},
{time:"12:00",title:"🍽️ El Paraguayo",placeName:"El Paraguayo Barcelona",desc:"고딕지구 추천 식당",type:"food",coords:[41.3825,2.1770],cost:35000},
{time:"13:00",title:"🚡 몬주익 이동",placeName:"Montjuïc Cable Car",desc:"지하철+케이블카",type:"move",coords:[41.3639,2.1592]},
{time:"14:00",title:"🏰 몬주익 성",placeName:"Castell de Montjuïc",desc:"바르셀로나 전경 최고 뷰",type:"spot",coords:[41.3635,2.1660]},
{time:"15:30",title:"🏛️ 카탈루냐 국립미술관",placeName:"Museu Nacional d'Art de Catalunya",desc:"스페인 광장 파노라마",type:"spot",coords:[41.3685,2.1533]},
{time:"17:00",title:"🍽️ La Pepita",placeName:"La Pepita Barcelona",desc:"몬타디토 맛집",type:"food",coords:[41.3978,2.1584],cost:30000},
{time:"18:30",title:"✨ 마법의 분수 쇼",placeName:"Magic Fountain of Montjuïc",desc:"9월 목/금/토 운영",type:"spot",coords:[41.3712,2.1518]},
{time:"20:00",title:"🧳 숙소 복귀",placeName:"Mercure Barcelona Condor",desc:"체크아웃 준비",type:"hotel",coords:[41.3920,2.1531]}
]},
{date:"9/16 (수)",region:"바르셀로나 → 포르투 🌉",color:"#2E86AB",hotel:"레전드 하우스 바이 스위트 포르토\n예약번호: 1694479710",schedule:[
{time:"08:00",title:"🏨 체크아웃",placeName:"Mercure Barcelona Condor",desc:"머큐어 콘도르 체크아웃",type:"hotel",coords:[41.3920,2.1531]},
{time:"09:00",title:"☕ 브런치",desc:"바르셀로나 마지막 아침",type:"food"},
{time:"10:00",title:"🚌 공항 이동",placeName:"Barcelona El Prat Airport",desc:"지하철 약 40분",type:"move",coords:[41.2971,2.0785]},
{time:"17:35",title:"✈️ 바르셀로나→포르투",placeName:"Barcelona El Prat Airport",desc:"라이언에어 | 약 1시간",type:"flight",warn:"예약 확인",coords:[41.2971,2.0785]},
{time:"18:35",title:"🛬 포르투 도착",placeName:"Porto Airport",desc:"메트로 탑승 (알단테 카드)",type:"flight",coords:[41.2370,-8.6700]},
{time:"19:30",title:"🏨 숙소 체크인",placeName:"Legendary Porto Hotel",desc:"레전드 하우스\n상벤투역 앞",type:"hotel",coords:[41.1460,-8.6110]},
{time:"20:30",title:"🌉 동 루이스 다리",placeName:"Ponte Dom Luís I",desc:"야경 감상 & 강변 카페",type:"spot",coords:[41.1403,-8.6098]},
{time:"21:00",title:"🐙 Botequim da Ribeira",placeName:"Botequim da Ribeira",desc:"문어 맛집, 첫날 저녁",type:"food",coords:[41.1407,-8.6126],cost:40000}
]},
{date:"9/17 (목)",region:"포르투 — 가이아 & 크루즈 🍷",color:"#2E86AB",hotel:"레전드 하우스 바이 스위트 포르토",schedule:[
{time:"08:30",title:"☀️ 조식",placeName:"São Bento Station Porto",desc:"상벤투역 아줄레주 감상",type:"etc",coords:[41.1459,-8.6106]},
{time:"09:00",title:"🗼 클레리구스 탑",placeName:"Torre dos Clérigos",desc:"360도 파노라마",type:"spot",coords:[41.1458,-8.6145]},
{time:"10:00",title:"📚 렐루 서점",placeName:"Livraria Lello",desc:"해리포터 영감 서점\n입장료 8유로",type:"spot",warn:"10시 오픈",coords:[41.1467,-8.6153],cost:12000},
{time:"11:00",title:"🚢 도우루강 크루즈",placeName:"Cais da Ribeira Porto",desc:"6개교 크루즈 약 1시간",type:"spot",warn:"사전 예약",coords:[41.1407,-8.6126],cost:25000},
{time:"12:30",title:"🍽️ Do Norte Café",placeName:"Do Norte Café Porto",desc:"숙소 도보 1분",type:"food",coords:[41.1460,-8.6110],cost:25000},
{time:"14:00",title:"🍷 가이아 와이너리",placeName:"Taylor's Port Vila Nova de Gaia",desc:"Taylor's or Graham's\n포트 와인 시음",type:"spot",warn:"예약 권장",coords:[41.1378,-8.6098],cost:20000},
{time:"16:00",title:"🌇 가이아 전망대",placeName:"Jardim do Morro",desc:"리베이라 파노라마",type:"spot",coords:[41.1375,-8.6105]},
{time:"17:00",title:"💙 카르무 성당",placeName:"Igreja do Carmo Porto",desc:"아줄레주 타일 포토스팟",type:"spot",coords:[41.1479,-8.6163]},
{time:"18:00",title:"🥚 만테이가리아",placeName:"Manteigaria Porto",desc:"에그타르트 맛집",type:"food",coords:[41.1458,-8.6126],cost:5000},
{time:"19:30",title:"🍽️ Taberna Dos Mercadores",placeName:"Taberna dos Mercadores",desc:"문어밥, 농어구이",type:"food",coords:[41.1418,-8.6114],cost:45000},
{time:"21:00",title:"🌃 리베이라 야경",placeName:"Cais da Ribeira Porto",desc:"도우루 강변 야경",type:"spot",coords:[41.1407,-8.6126]}
]},
{date:"9/18 (금)",region:"포르투 — 도우로 밸리 🍇",color:"#2E86AB",hotel:"레전드 하우스 바이 스위트 포르토",schedule:[
{time:"08:00",title:"☀️ 투어 집결",placeName:"Legendary Porto Hotel",desc:"도우로 밸리 풀데이 투어",type:"etc",coords:[41.1460,-8.6110]},
{time:"09:00",title:"🚌 투어 출발",desc:"약 8시간, 포르투에서 1시간",type:"move",coords:[41.1460,-8.6110],cost:80000},
{time:"10:30",title:"🍇 도우루 강변",placeName:"Douro Valley",desc:"포도밭 절경",type:"spot",coords:[41.1631,-7.7917]},
{time:"11:30",title:"🏰 킨타 와이너리",placeName:"Quinta do Seixo",desc:"포트 와인 시음",type:"spot",coords:[41.1600,-7.7800]},
{time:"13:00",title:"🍽️ 투어 점심",desc:"투어 포함 식사",type:"food",coords:[41.1550,-7.7750]},
{time:"14:30",title:"🚤 도우로 보트",placeName:"Pinhão Douro",desc:"포도밭 강 유람",type:"spot",coords:[41.1600,-7.7850]},
{time:"17:30",title:"🚌 포르투 귀환",desc:"약 1.5시간",type:"move",coords:[41.1460,-8.6110]},
{time:"19:30",title:"🍽️ 저녁",desc:"숙소 근처 음식점",type:"food",coords:[41.1460,-8.6110],cost:35000}
]},
{date:"9/19 (토)",region:"포르투 — 마투지뉴스 & 아베이루 🏖️",color:"#2E86AB",hotel:"레전드 하우스\n체크아웃 11시",schedule:[
{time:"08:30",title:"☀️ 출발",desc:"수영복 챙기기!",type:"etc",coords:[41.1460,-8.6110]},
{time:"09:00",title:"🏖️ 마투지뉴스 해변",placeName:"Praia de Matosinhos",desc:"포르투 근교 해변 (30분)",type:"spot",coords:[41.1829,-8.6886]},
{time:"11:00",title:"🦞 O Gaveto",placeName:"O Gaveto Matosinhos",desc:"해산물 맛집",type:"food",coords:[41.1825,-8.6880],cost:55000},
{time:"13:00",title:"🛶 아베이루 이동",placeName:"Aveiro",desc:"기차 약 40분",type:"move",coords:[40.6443,-8.6455]},
{time:"14:00",title:"🚣 몰리세이루 보트",placeName:"Aveiro Canal",desc:"전통 곤돌라 투어",type:"spot",coords:[40.6405,-8.6538],cost:15000},
{time:"15:00",title:"🍮 오부스 몰레스",placeName:"Confeitaria Peixinho Aveiro",desc:"아베이루 전통 디저트",type:"food",coords:[40.6443,-8.6455],cost:5000},
{time:"17:00",title:"🚂 포르투 귀환",placeName:"São Bento Station Porto",desc:"상벤투역",type:"move",coords:[41.1459,-8.6106]},
{time:"18:00",title:"🛍️ 마지막 쇼핑",placeName:"Rua de Santa Catarina Porto",desc:"산타 카테리나 거리",type:"shopping",coords:[41.1490,-8.6095]},
{time:"21:00",title:"✈️ 포르투→마요르카",placeName:"Porto Airport",desc:"라이언에어",type:"flight",warn:"예약 확인",coords:[41.2370,-8.6700]}
]},
{date:"9/20 (일)",region:"마요르카 — 팔마 도착 🌴",color:"#F5A623",hotel:"엘리오스 마요르카\n예약번호: 1694459164",schedule:[
{time:"—",title:"🛬 팔마 도착 (밤 12시)",placeName:"Palma de Mallorca Airport",desc:"택시 약 10분",type:"flight",coords:[39.5517,2.7388]},
{time:"—",title:"🏨 체크인",placeName:"Helios Mallorca Hotel",desc:"공항 근처, 조식 포함",type:"hotel",coords:[39.5550,2.7350]},
{time:"—",title:"😴 휴식",desc:"바로 취침",type:"etc"}
]},
{date:"9/21 (월)",region:"마요르카 — 팔마 & 칼로데스모로 🏖️",color:"#F5A623",hotel:"엘리오스 마요르카",schedule:[
{time:"08:00",title:"🍳 호텔 조식",placeName:"Helios Mallorca Hotel",desc:"수영복 준비",type:"food",coords:[39.5550,2.7350]},
{time:"09:00",title:"🌊 칼로데스모로",placeName:"Caló des Moro",desc:"마요르카 최고 해변",type:"spot",coords:[39.3340,3.1190]},
{time:"11:00",title:"🏊 수영 & 휴식",placeName:"Caló des Moro",desc:"절벽 뷰 포토타임",type:"spot",coords:[39.3340,3.1190]},
{time:"13:00",title:"🍽️ Es Caragol",placeName:"Platja des Caragol",desc:"해변 해산물",type:"food",coords:[39.3350,3.1200],cost:45000},
{time:"15:00",title:"🚌 팔마 이동",placeName:"Palma de Mallorca",desc:"버스 약 30분",type:"move",coords:[39.5696,2.6502]},
{time:"16:00",title:"🏛️ 팔마 대성당",placeName:"Cathedral of Palma de Mallorca",desc:"고딕 양식, 가우디 참여",type:"spot",coords:[39.5674,2.6486]},
{time:"17:00",title:"🏰 알무다이나 왕궁",placeName:"Royal Palace of La Almudaina",desc:"아랍+고딕 궁전",type:"spot",coords:[39.5683,2.6478]},
{time:"18:30",title:"🌇 팔마 항구 석양",placeName:"Port of Palma",desc:"요트 배경 포토",type:"spot",coords:[39.5630,2.6350]},
{time:"19:30",title:"🍽️ Celler Sa Premsa",placeName:"Celler Sa Premsa",desc:"마요르카 전통 음식",type:"food",coords:[39.5720,2.6520],cost:40000}
]},
{date:"9/22 (화)",region:"마요르카 — 발데모사 & 소예르 🏔️",color:"#F5A623",hotel:"그란 호텔 소예르 ⭐\n예약번호: 3510267 | 조식+스파",schedule:[
{time:"08:00",title:"🍳 조식 & 체크아웃",placeName:"Helios Mallorca Hotel",desc:"렌트카 준비",type:"food",coords:[39.5550,2.7350]},
{time:"09:00",title:"🚗 발데모사",placeName:"Valldemossa",desc:"렌트카 25분, 트라문타나 드라이브",type:"move",coords:[39.7108,2.6224]},
{time:"10:00",title:"⛪ 발데모사 수도원",placeName:"Real Cartuja de Valldemossa",desc:"쇼팽 기념관",type:"spot",coords:[39.7108,2.6224],cost:15000},
{time:"11:00",title:"🥐 마을 산책",placeName:"Valldemossa",desc:"엔사이마다 빵",type:"spot",coords:[39.7115,2.6230]},
{time:"12:00",title:"🚗 데이아 이동",placeName:"Deià Mallorca",desc:"절벽 해안 드라이브 20분",type:"move",coords:[39.7482,2.6494]},
{time:"12:30",title:"🍽️ Café Sa Fonda",placeName:"Café Sa Fonda Deià",desc:"테라스 산 전망",type:"food",coords:[39.7482,2.6494],cost:35000},
{time:"14:00",title:"🏘️ 데이아 산책",placeName:"Deià Mallorca",desc:"예술가의 마을",type:"spot",coords:[39.7482,2.6494]},
{time:"15:00",title:"🚗 소예르 체크인",placeName:"Gran Hotel Sóller",desc:"그란 호텔 소예르",type:"hotel",coords:[39.7660,2.7155]},
{time:"16:00",title:"🧖 호텔 스파",placeName:"Gran Hotel Sóller",desc:"트라문타나 뷰 수영장",type:"etc",coords:[39.7660,2.7155]},
{time:"17:30",title:"🍊 소예르 구시가지",placeName:"Plaça Constitució Sóller",desc:"오렌지 광장 카페",type:"spot",coords:[39.7655,2.7148]},
{time:"19:00",title:"🍽️ Brises del Mar",placeName:"Brises del Mar Port de Sóller",desc:"소예르 항구 빠에야",type:"food",coords:[39.7952,2.6908],cost:50000}
]},
{date:"9/23 (수)",region:"마요르카 — 소예르 & 트램 🚃",color:"#F5A623",hotel:"그란 호텔 소예르\n체크아웃 12시",schedule:[
{time:"08:30",title:"☀️ 조식",placeName:"Gran Hotel Sóller",desc:"테라스 산맥 뷰",type:"food",coords:[39.7660,2.7155]},
{time:"09:30",title:"🚃 소예르 트램",placeName:"Tranvía de Sóller",desc:"오렌지 밭 뷰 20분",type:"spot",warn:"사전 예약",coords:[39.7655,2.7148],cost:10000},
{time:"10:30",title:"🏖️ 포르트 데 소예르",placeName:"Port de Sóller",desc:"수영 & 스노클링",type:"spot",coords:[39.7952,2.6908]},
{time:"13:00",title:"🍽️ Nautilus Soller",placeName:"Restaurante Nautilus Port de Sóller",desc:"절벽 위 빠에야 인생뷰",type:"food",warn:"예약 필수",coords:[39.7952,2.6908],cost:60000},
{time:"14:30",title:"🍊 오렌지 광장",placeName:"Plaça Constitució Sóller",desc:"셔벗 아이스크림",type:"spot",coords:[39.7655,2.7148]},
{time:"16:00",title:"🚗 팔마 공항",placeName:"Palma de Mallorca Airport",desc:"렌트카 반납 40분",type:"move",coords:[39.5517,2.7388]},
{time:"—",title:"✈️ 팔마→바르셀로나",placeName:"Palma de Mallorca Airport",desc:"부엘링 IHHNHP\n25kg 수하물",type:"flight",status:"confirmed",coords:[39.5517,2.7388]},
{time:"19:00",title:"🏨 H10 메트로폴리탄",placeName:"H10 Metropolitan Hotel Barcelona",desc:"예약번호: 1694841847",type:"hotel",coords:[41.3887,2.1640]}
]},
{date:"9/24 (목)",region:"바르셀로나 — 라로카빌리지 🛍️",color:"#E8725A",hotel:"H10 메트로폴리탄\n예약번호: 1694841847",schedule:[
{time:"08:00",title:"☀️ 쇼핑 준비",placeName:"H10 Metropolitan Hotel Barcelona",desc:"셔틀버스 예약 확인",type:"etc",coords:[41.3887,2.1640]},
{time:"09:00",title:"🚌 라로카빌리지",placeName:"La Roca Village",desc:"셔틀버스",type:"move",warn:"사전 예약 필수",coords:[41.6103,2.3422]},
{time:"10:00",title:"🛍️ 라로카빌리지",placeName:"La Roca Village",desc:"150개+ 부티크 60% 할인",type:"shopping",coords:[41.6103,2.3422],cost:500000},
{time:"13:00",title:"🍽️ 아울렛 점심",placeName:"La Roca Village",desc:"아울렛 내 레스토랑",type:"food",coords:[41.6103,2.3422],cost:25000},
{time:"15:00",title:"🚌 복귀",placeName:"Passeig de Gràcia",desc:"그라시아 거리",type:"move",coords:[41.3920,2.1650]},
{time:"16:00",title:"🏡 구엘공원",placeName:"Park Güell",desc:"모자이크 테라스",type:"spot",warn:"사전 예약 필수",coords:[41.4145,2.1527],cost:15000},
{time:"17:30",title:"🛍️ 고딕지구 쇼핑",placeName:"Barcelona Gothic Quarter",desc:"라치나타, 기념품",type:"shopping",coords:[41.3833,2.1761]},
{time:"19:00",title:"🌇 마지막 타파스",placeName:"Barcelona Gothic Quarter",desc:"고딕지구 타파스바",type:"food",coords:[41.3833,2.1761],cost:40000},
{time:"21:00",title:"🧳 귀국 준비",placeName:"H10 Metropolitan Hotel Barcelona",desc:"택스리펀 서류 확인",type:"hotel",coords:[41.3887,2.1640]}
]},
{date:"9/25 (금)",region:"바르셀로나 → 한국 ✈️🇰🇷",color:"#888",hotel:"귀국일 | H10 체크아웃 12시",schedule:[
{time:"08:00",title:"☀️ 마지막 아침",placeName:"H10 Metropolitan Hotel Barcelona",desc:"체크아웃 준비",type:"food",coords:[41.3887,2.1640]},
{time:"10:00",title:"🛍️ 마지막 쇼핑",placeName:"Mercadona Barcelona",desc:"mercadona 마트",type:"shopping",coords:[41.3833,2.1761]},
{time:"12:00",title:"🏨 체크아웃",placeName:"H10 Metropolitan Hotel Barcelona",desc:"짐 호텔에 보관",type:"hotel",coords:[41.3887,2.1640]},
{time:"13:00",title:"🍽️ 마지막 점심",placeName:"El Xampanyet",desc:"La Pepita or El Xampanyet",type:"food",coords:[41.3845,2.1820],cost:40000},
{time:"16:00",title:"🚌 공항 이동",placeName:"Barcelona El Prat Airport",desc:"에어로버스 40분",type:"move",coords:[41.2971,2.0785]},
{time:"18:30",title:"🛍️ 면세점",placeName:"Barcelona El Prat Airport Terminal 1",desc:"택스리펀 수속 필수!",type:"shopping",coords:[41.2971,2.0785]},
{time:"20:50",title:"✈️ 바르셀로나 출발",placeName:"Barcelona El Prat Airport",desc:"OZ0512 | 12시간\n인천 9/26 16:20 도착",type:"flight",status:"confirmed",coords:[41.2971,2.0785]}
]},
{date:"9/26 (토)",region:"한국 도착 🇰🇷",color:"#888",hotel:"—",schedule:[
{time:"16:20",title:"🛬 인천공항 도착",placeName:"Incheon International Airport",desc:"14일간의 여행 무사 귀환!",type:"flight",coords:[37.4602,126.4407]}
]}
];
