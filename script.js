/**
 * CAFE SIMULATOR: FINAL FIXED VERSION
 * - Fixed: 'INFO undefined' bug (Corrected log arguments)
 * - Feature: Cafe Menu & Relaxing Logs (Atmosphere UP)
 * - Feature: 12 Jobs, Relationships, Burnout/Slump System
 */

// ==========================================
// 0. 유틸리티
// ==========================================
function hasBatchim(word) {
    if (!word) return false;
    const c = word.charCodeAt(word.length - 1);
    if (c < 0xAC00 || c > 0xD7A3) return false;
    return ((c - 0xAC00) % 28) !== 0;
}

function josa(word, pair) {
    const [a, b] = pair.split('/');
    return word + (hasBatchim(word) ? a : b);
}

function rand(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function pick(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}

// ==========================================
// 1. 데이터베이스
// ==========================================

const cafeMenus = [
    "아이스 아메리카노", "따뜻한 카페라떼", "바닐라 빈 라떼", "카라멜 마키아또", 
    "자몽 에이드", "얼그레이 티", "초코 스콘", "바스크 치즈 케이크", "크로플", 
    "페퍼민트 티", "딸기 라떼", "콜드브루", "말차 라떼", "레몬 마들렌", "허니브레드"
];

const cafeConsumerLogs = [
    (n, m) => `${n}님이 주문한 ${m}를 한 모금 마십니다.`,
    (n, m) => `${n}님이 ${m}의 얼음을 빨대로 휘휘 젓습니다.`,
    (n, m) => `${n}님이 ${m}의 향을 맡으며 잠시 눈을 감습니다.`,
    (n, m) => `${n}님이 ${m}를 마시며 창밖을 멍하니 바라봅니다.`,
    (n, m) => `${n}님이 당이 떨어졌는지 ${m}를 급하게 먹습니다.`,
    (n, m) => `${n}님이 ${m} 사진을 예쁘게 찍습니다.`,
    (n, m) => `${n}님이 ${m}를 한 입 먹고 행복한 표정을 짓습니다.`
];

// [날씨]
const weatherDB = {
    "Sunny": "햇살이 따사롭게 내리쬡니다.",
    "Cloudy": "구름이 잔뜩 낀 흐린 날씨입니다.",
    "Rain": "비가 추적추적 내립니다.",
    "Snow": "창밖으로 하얀 눈이 펑펑 쏟아집니다.",
    "Typhoon": "거센 비바람이 몰아칩니다."
};

const jobConfig = {
    "대학생": { statName: "평점(GPA)", init: 3.0 },
    "대학원생": { statName: "연구진척도", init: 30 },
    "취준생": { statName: "취업준비도", init: 40 },
    "공시생": { statName: "암기율", init: 35 },
    "교환학생": { statName: "토플점수", init: 60 },
    "로스쿨준비생": { statName: "LEET점수", init: 80 },
    "의대장수생": { statName: "모의고사", init: 50 },
    "직장인": { statName: "업무성과", init: 50 },
    "계약직": { statName: "재계약확률", init: 30 },
    "아르바이트": { statName: "근무만족도", init: 50 },
    "자영업자": { statName: "매출안정도", init: 45 },
    "심야작업자": { statName: "행복도", init: 40 },
    "프리랜서": { statName: "평판", init: 50 },
    "작가": { statName: "원고진척", init: 20 },
    "인플루언서": { statName: "팔로워", init: 1200 },
    "웹툰지망생": { statName: "데뷔가능성", init: 10 },
    "커미션러": { statName: "의뢰평점", init: 4.0 },
    "성우지망생": { statName: "합격률", init: 5 },
    "백수": { statName: "생활리듬", init: 40 },
    "갭이어": { statName: "삶의방향성", init: 20 },
    "재취업준비": { statName: "자신감", init: 30 },
    "웹툰작가": { statName: "마감세이브", init: 0 },
    "성우": { statName: "인지도", init: 10 },
    "유튜버": { statName: "구독자", init: 10000 }
};

const jobActions = {
    "대학생": ["전공 서적을 펴고 턱을 굅니다.", "강의 녹음을 다시 듣습니다.", "시험 범위를 체크합니다."],
    "대학원생": ["논문 초안을 붉은 펜으로 수정합니다.", "통계 결과를 멍하니 봅니다.", "교수님 메일을 확인합니다."],
    "취준생": ["채용 공고를 새로고침합니다.", "합격 자소서를 분석합니다.", "면접 영상을 시청합니다."],
    "공시생": ["기출 문제를 반복해서 풉니다.", "암기 노트를 중얼거립니다.", "스톱워치를 켭니다."],
    "교환학생": ["비자 서류를 확인합니다.", "토플 단어를 외웁니다.", "기숙사 사진을 찾아봅니다."],
    "로스쿨준비생": ["판례집을 정독합니다.", "논리 구조를 메모합니다.", "법학 적성 문제를 풉니다."],
    "의대장수생": ["떨리는 손으로 답안을 체크합니다.", "고카페인 음료를 마십니다.", "오답 노트를 만듭니다."],
    "직장인": ["업무 메일을 작성합니다.", "엑셀 함수를 수정합니다.", "퇴직금 계산기를 봅니다."],
    "계약직": ["정규직 공고를 몰래 봅니다.", "계약 만료일을 확인합니다.", "이직 사이트를 봅니다."],
    "아르바이트": ["월급을 계산해봅니다.", "근무 스케줄을 확인합니다.", "진상 손님 썰을 풉니다."],
    "자영업자": ["매출 장부를 확인합니다.", "세금 신고 기간을 봅니다.", "거래처 문자를 보냅니다."],
    "심야작업자": ["새벽 감성 노래를 듣습니다.", "달달한 간식을 먹습니다.", "조용한 분위기를 즐깁니다."],
    "프리랜서": ["마감이 임박해 타자가 빨라집니다.", "클라이언트 수정 요청을 봅니다.", "입금을 확인합니다."],
    "작가": ["문장을 썼다 지웠다 합니다.", "멍하니 구상합니다.", "노트북을 뚫어져라 봅니다."],
    "인플루언서": ["보정 어플로 사진을 수정합니다.", "댓글 관리를 합니다.", "협찬 제품을 찍습니다."],
    "웹툰지망생": ["콘티를 수정합니다.", "컷 분할을 고민합니다.", "공모전 일정을 봅니다."],
    "커미션러": ["피드백을 반영해 수정합니다.", "색감 보정을 합니다.", "레퍼런스를 찾습니다."],
    "성우지망생": ["대본을 작게 리딩합니다.", "발성 연습을 합니다.", "녹음본을 모니터링합니다."],
    "백수": ["저녁 메뉴를 고민합니다.", "웹툰을 정주행합니다.", "로또 번호를 맞춥니다."],
    "갭이어": ["여행지 사진을 봅니다.", "하고 싶은 일 목록을 적습니다.", "사색에 잠깁니다."],
    "재취업준비": ["경력 기술서를 다듬습니다.", "옛 명함을 만지작거립니다.", "심호흡을 합니다."],
    "유튜버": ["편집 타임라인을 봅니다.", "촬영 기획안을 씁니다.", "썸네일을 만듭니다."],
    "성우": ["담당 PD 전화를 받습니다.", "목 관리를 위해 물을 마십니다."],
    "웹툰작가": ["마감 압박에 커피를 마십니다.", "담당자 메일에 답장합니다."]
};

const mbtiActions = {
    "I": ["이어폰을 끼고 구석에 앉습니다.", "조용히 책을 읽습니다.", "작은 목소리로 혼잣말합니다."],
    "E": ["직원에게 밝게 인사합니다.", "주변을 두리번거립니다.", "다리를 떨며 리듬을 탑니다."]
};

const interactionDB = {
    friend: [ (a,b)=>`${josa(a.name,"과/와")} ${b.name}님이 엽기 사진을 찍으며 놉니다.`, (a,b)=>`두 사람이 맛집을 검색합니다.` ],
    lover: [ (a,b)=>`${a.name}님이 ${b.name}님의 손을 잡습니다.`, (a,b)=>`서로 꿀 떨어지는 눈빛을 보냅니다.` ],
    family: [ (a,b)=>`${a.name}님이 ${b.name}님에게 잔소리를 합니다.`, (a,b)=>`가족 행사를 의논합니다.` ],
    coworker: [ (a,b)=>`${a.name}님이 ${b.name}님에게 상사 뒷담화를 합니다.`, (a,b)=>`업무 자료를 공유합니다.` ],
    crush: [ (a,b)=>`${josa(a.name,"이/가")} ${b.name}님을 몰래 힐끔거립니다.` ],
    awkward: [ (a,b)=>`${a.name}님이 ${b.name}님을 보고 황급히 자리를 피합니다.`, (a,b)=>`두 사람 사이에 어색한 정적만 흐릅니다.` ],
    cold: [ (a,b)=>`${a.name}님과 ${b.name}님이 서로 말 한마디 없이 폰만 봅니다.`, (a,b)=>`냉랭한 분위기가 감돕니다.` ]
};

const stateLogs = {
    burnout: ["초점 없는 눈으로 허공을 봅니다.", "깊은 한숨을 쉬며 엎드립니다.", "아무것도 하지 않고 멍하니 있습니다."],
    slump: ["머리를 감싸 쥐고 괴로워합니다.", "진도가 나가지 않아 답답해합니다."],
    anxiety: ["미래에 대한 불안감에 펜을 놓습니다.", "통장 잔고를 보고 우울해합니다."]
};

const dayLogs = {
    MON: ["(월요병) 몸이 천근만근인 듯합니다.", "주말이 멀게만 느껴집니다."],
    FRI: ["주말 생각에 미소가 번집니다.", "퇴근 후 계획에 들떠 있습니다."]
};

const atmosphereLogs = ["재즈 음악이 흐릅니다.", "커피 머신 소리가 들립니다.", "창밖으로 사람들이 지나갑니다.", "햇살이 따스하게 들어옵니다."];
const triangleLogs = [ (a, b, c) => `${a.name}님이 ${b.name}님과 다정한 ${c.name}님을 보고 씁쓸해합니다.` ];
const introLogs = [ (a, b, c) => `${b.name}님이 ${a.name}님에게 연인인 ${c.name}님을 소개합니다.` ];

// === 2. 전역 상태 ===
let characters = [];
let relationships = [];
let dayIdx = 0; 
let weekCount = 1;
const days = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"];
const seasons = ["SPRING", "SUMMER", "AUTUMN", "WINTER"];
let seasonIdx = 0;
let todayWeather = "Sunny"; 

let simState = {
    visitors: [],
    clickStack: [],
    rejected: {}
};

// === 3. 초기화 ===
document.addEventListener('DOMContentLoaded', () => {
    initUI();
    document.getElementById('play-btn').addEventListener('click', runDailySimulation);
    document.getElementById('add-char-btn').addEventListener('click', () => document.getElementById('char-modal').showModal());
    document.getElementById('cancel-btn').addEventListener('click', () => document.getElementById('char-modal').close());
    document.getElementById('char-form').addEventListener('submit', createChar);
    document.getElementById('export-btn').addEventListener('click', exportData);
    document.getElementById('import-file').addEventListener('change', importData);

    document.querySelectorAll('input[name="tool"]').forEach(r => {
        r.addEventListener('change', () => {
            simState.clickStack = [];
            renderNodes();
        });
    });
});

function initUI() {
    updateHeaderDisplay();
    addRawLog(null, "SYSTEM", "손님을 추가해주세요.");
}

// === 4. 캐릭터 생성 ===
function createChar(e) {
    e.preventDefault();
    const name = document.getElementById('input-name').value;
    const job = document.getElementById('input-job').value;
    const mbti = 
        document.getElementById('input-mbti-ei').value +
        document.getElementById('input-mbti-sn').value +
        document.getElementById('input-mbti-tf').value +
        document.getElementById('input-mbti-jp').value;

    const config = jobConfig[job] || { statName: "상태", init: 50 };
    const newChar = {
        id: "C" + Date.now(),
        name, job, mbti,
        stats: {
            name: config.statName,
            value: config.init,
            hiddenScore: 0,
            fatigue: 0
        },
        visitProb: 0.6,
        status: "normal",
        slumpCounter: 0 
    };
    
    characters.push(newChar);
    document.getElementById('char-modal').close();
    document.getElementById('char-form').reset();
    renderNodes(); renderList();
    addRawLog(null, "SYSTEM", `${josa(name, "이/가")} (${job}) 등록되었습니다.`);
}

// === 5. 하루 시뮬레이션 ===
function runDailySimulation() {
    if(characters.length === 0) return alert("캐릭터를 추가해주세요.");

    addDayDivider();
    setDailyWeather(); 
    applySeasonalEffects(); 
    applyDayEffects();
    
    determineDailyVisitors();
    renderList();

    const logCount = rand(5, 30);
    let timeStamps = [];
    for(let i=0; i<logCount; i++) timeStamps.push(rand(600, 1320));
    timeStamps.sort((a, b) => a - b);

    if(simState.visitors.length === 0) {
        addRawLog("12:00", "", "오늘은 손님이 한 명도 오지 않았습니다.");
    } else {
        timeStamps.forEach(minutes => {
            const h = Math.floor(minutes / 60);
            const m = minutes % 60;
            const timeStr = `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}`;
            createLogAtTime(timeStr);
        });
    }

    // 마감 정산
    simState.visitors.forEach(id => {
        const c = getChar(id);
        if(c) {
            checkBurnout(c);
            checkSlump(c);
            checkJobTransition(c);
            checkDissatisfaction(c);
        }
    });

    addRawLog("22:00", "SYSTEM", "영업이 종료되었습니다.");
    
    dayIdx++;
    if(dayIdx >= 7) { 
        dayIdx = 0; weekCount++;
        if(weekCount > 4) {
            weekCount = 1; seasonIdx = (seasonIdx + 1) % 4; 
            addRawLog(null, "SYSTEM", `계절이 바뀝니다. (${seasons[seasonIdx]})`);
            updateSeasonalStats();
        } else {
            addRawLog(null, "SYSTEM", `새로운 한 주가 시작되었습니다. (${weekCount}주차)`);
        }
    }
    updateHeaderDisplay();
    
    // 상태 회복
    for(let id in simState.rejected) {
        simState.rejected[id]--;
        if(simState.rejected[id] <= 0) {
            delete simState.rejected[id];
            const c = getChar(id);
            if(c && c.status === 'burnout') {
                c.status = 'normal';
                c.visitProb = 0.6; c.stats.fatigue = 0;
                addRawLog(null, "NEWS", `${c.name}님이 휴식을 마치고 복귀했습니다.`);
            }
        }
    }
    renderList();
}

// === 날씨 및 효과 ===
function setDailyWeather() {
    const season = seasons[seasonIdx];
    let types = ["Sunny", "Sunny", "Cloudy", "Rain"];
    if(season === "SUMMER") types.push("Rain", "Rain", "Typhoon");
    if(season === "WINTER") types = ["Sunny", "Cloudy", "Snow", "Snow"];
    
    todayWeather = pick(types);
    if(todayWeather === "Typhoon") todayWeather = "Rain"; 

    const wText = weatherDB[todayWeather] || "맑은 날씨입니다.";
    addRawLog("09:00", "WEATHER", wText);
}

function applySeasonalEffects() {
    let weatherMod = 0;
    if(todayWeather === "Rain" || todayWeather === "Snow") weatherMod = -0.2;
    if(todayWeather === "Typhoon") weatherMod = -0.5;

    const currentSeason = seasons[seasonIdx];
    characters.forEach(c => {
        let baseProb = 0.6;
        if(["대학생","대학원생","공시생","의대장수생","로스쿨준비생"].includes(c.job) && (currentSeason==="SPRING"||currentSeason==="AUTUMN")) {
            baseProb = 0.9;
        } else if(["프리랜서","작가","웹툰지망생","커미션러"].includes(c.job) && (currentSeason==="SUMMER"||currentSeason==="WINTER")) {
            baseProb = 0.85;
        }
        c.visitProb = Math.max(0.1, Math.min(1.0, baseProb + weatherMod));
    });
}

function applyDayEffects() {
    const today = days[dayIdx];
    characters.forEach(c => {
        if(today === "MON") c.stats.fatigue += 5; 
        if(today === "FRI") c.visitProb += 0.1;
    });
}

function determineDailyVisitors() {
    simState.visitors = [];
    let candidates = [];
    characters.forEach(c => {
        if(simState.rejected[c.id]) return;
        if(Math.random() < c.visitProb) candidates.push(c.id);
    });

    let finalVisitors = [];
    candidates.forEach(cid => {
        let avoid = false;
        for(let vid of finalVisitors) {
            const rel = relationships.find(r => (r.from===cid && r.to===vid) || (r.from===vid && r.to===cid));
            if(rel) {
                if(rel.type === 'awkward' || rel.mood === 'cold') {
                    if(Math.random() < 0.8) { avoid = true; break; }
                }
            }
        }
        if(!avoid) finalVisitors.push(cid);
    });

    let extras = [];
    finalVisitors.forEach(vid => {
        relationships.forEach(r => {
            if((r.from===vid || r.to===vid) && !['awkward'].includes(r.type) && r.mood !== 'cold') {
                let pid = (r.from===vid) ? r.to : r.from;
                if(!finalVisitors.includes(pid) && !extras.includes(pid) && !simState.rejected[pid]) {
                    if(['lover','friend','family'].includes(r.type) && Math.random() < 0.4) extras.push(pid);
                }
            }
        });
    });
    
    simState.visitors = [...new Set([...finalVisitors, ...extras])];
}

// === 로그 생성 ===
function createLogAtTime(timeStr) {
    // 1. [NEW] 배경 로그 (5%)
    if(Math.random() < 0.05) {
        addRawLog(timeStr, "", pick(atmosphereLogs));
        return;
    }

    if(simState.visitors.length === 0) return;

    // 2. [NEW] 카페 메뉴 소비 로그 (20% - 카페 감성)
    if(Math.random() < 0.2) {
        const id = pick(simState.visitors);
        const c = getChar(id);
        const menu = pick(cafeMenus);
        addRawLog(timeStr, "", pick(cafeConsumerLogs)(c.name, menu));
        return;
    }

    // 3. 요일/불안
    if(Math.random() < 0.1) {
        const id = pick(simState.visitors);
        const c = getChar(id);
        const today = days[dayIdx];
        
        if((today === "MON" || today === "FRI") && Math.random() < 0.5) {
            const log = pick(dayLogs[today]);
            if(log) { addRawLog(timeStr, "", `${josa(c.name,"이/가")} ${log}`); return; }
        }
        if(["취준생","백수","프리랜서","공시생"].includes(c.job) && Math.random() < 0.3) {
            addRawLog(timeStr, "", `${c.name}님이 ${pick(stateLogs.anxiety)}`);
            return;
        }
    }

    const r = Math.random();

    // 4. 상호작용 (30%)
    if(simState.visitors.length >= 2 && r < 0.35) {
        const id1 = pick(simState.visitors);
        const id2 = pick(simState.visitors);
        if(id1 !== id2) {
            const c1 = getChar(id1);
            const c2 = getChar(id2);
            
            if(checkTriangle(c1, c2, timeStr)) return;
            if(checkContagion(c1, c2, timeStr)) return;
            if(checkCrushEvent(c1, c2, timeStr)) return;
            if(checkLoverEvent(c1, c2, timeStr)) return;

            const rel = relationships.find(x => (x.from===id1 && x.to===id2) || (x.from===id2 && x.to===id1));
            if(rel) {
                let msg = "";
                if(rel.type === 'lover' && rel.mood === 'cold') msg = pick(interactionDB.cold)(c1, c2);
                else if(rel.type === 'crush') {
                    if(rel.from === c1.id) msg = pick(interactionDB.crush)(c1, c2);
                    else msg = pick(interactionDB.crush)(c2, c1);
                }
                else if(rel.type === 'awkward') msg = pick(interactionDB.awkward)(c1, c2);
                else if(interactionDB[rel.type]) msg = pick(interactionDB[rel.type])(c1, c2);

                if(msg) { addRawLog(timeStr, "", msg); return; }
            }
        }
    }

    // 5. 개인 행동 (직업 or MBTI)
    const id = pick(simState.visitors);
    const c = getChar(id);
    
    if(c.status === 'burnout') { addRawLog(timeStr, "", `${c.name}님이 ${pick(stateLogs.burnout)}`); return; }
    if(c.status === 'slump') { addRawLog(timeStr, "", `${c.name}님이 ${pick(stateLogs.slump)}`); return; }

    let action = "";
    let type = "";
    if(Math.random() < 0.5) {
        const logs = jobActions[c.job] || ["열심히 할 일을 합니다."];
        action = pick(logs);
        type = "JOB";
    } else {
        const mType = c.mbti.includes('I') ? 'I' : 'E';
        action = pick(mbtiActions[mType]);
        type = "MBTI";
    }

    applyActionStat(c, type);
    addRawLog(timeStr, "", `${josa(c.name, "이/가")} ${action}`);
}

// === 상태/전직 관리 ===
function checkBurnout(c) {
    if(c.status !== 'burnout') {
        let limit = 100;
        if(["의대장수생", "공시생", "로스쿨준비생"].includes(c.job)) limit = 80;
        if(c.stats.fatigue > limit) {
            c.status = "burnout";
            c.visitProb = 0.1;
            simState.rejected[c.id] = rand(3, 7);
            addRawLog(null, "⚠️WARN", `${c.name}님이 심한 번아웃으로 당분간 휴식을 갖습니다.`);
        }
    }
}

function checkSlump(c) {
    if(c.status === 'burnout') return;
    if(c.status === 'normal' && Math.random() < 0.05) {
        c.status = 'slump';
        c.slumpCounter = rand(3, 10);
        addRawLog(null, "⚠️INFO", `${c.name}님이 슬럼프에 빠진 것 같습니다.`);
    } else if(c.status === 'slump') {
        c.slumpCounter--;
        if(c.slumpCounter <= 0) {
            c.status = 'normal';
            addRawLog(null, "NEWS", `${c.name}님이 슬럼프를 극복해냈습니다!`);
        }
    }
}

function checkJobTransition(c) {
    if (c.job === "웹툰지망생" && c.stats.value >= 90) changeJob(c, "웹툰작가", "마감세이브", 2, "정식 연재를 시작했습니다!");
    else if (c.job === "성우지망생" && c.stats.value >= 80) changeJob(c, "성우", "인지도", 10, "성우 오디션에 합격했습니다!");
    else if (c.job === "인플루언서" && c.stats.value >= 10000) changeJob(c, "유튜버", "구독자", 10000, "유튜브 채널을 개설했습니다!");
    else if (c.job === "갭이어" && c.stats.value >= 80) {
        const next = Math.random() < 0.5 ? "취준생" : "프리랜서";
        changeJob(c, next, jobConfig[next].statName, jobConfig[next].init, `갭이어를 끝내고 ${next}의 길을 걷습니다.`);
    }
}

function checkDissatisfaction(c) {
    if(["계약직", "아르바이트", "직장인"].includes(c.job) && c.stats.value <= 10) {
        changeJob(c, "재취업준비", "자신감", 30, "현 직장에 회의감을 느끼고 퇴사했습니다.");
        addRawLog(null, "⚠️INFO", `${c.name}님이 퇴사 후 재취업을 준비합니다.`);
    }
}

function changeJob(c, newJob, statName, initVal, msg) {
    c.job = newJob;
    c.stats.name = statName;
    c.stats.value = initVal;
    c.stats.hiddenScore = 0;
    addRawLog(null, "NEWS", `축하합니다! ${c.name}님이 ${msg}`);
}

function applyActionStat(c, actionType) {
    if (actionType !== "JOB") return;
    
    let fatigue = rand(5, 10);
    if(["의대장수생", "로스쿨준비생"].includes(c.job)) fatigue += 5; 
    c.stats.fatigue += fatigue;

    if(c.status === 'slump') return; 

    if (c.job === "대학생") c.stats.hiddenScore += rand(2, 5);
    else if (["인플루언서", "유튜버"].includes(c.job)) {
        if (Math.random() < 0.05) { 
            const boom = rand(500, 3000);
            c.stats.value += boom;
            addRawLog(null, "Viral", `🔥 ${c.name}님의 게시물이 떡상했습니다! (+${boom})`);
        } else c.stats.value += rand(1, 15);
    }
    else if (c.job === "커미션러") c.stats.value = Math.min(5.0, c.stats.value + 0.1);
    else c.stats.value += rand(1, 3);
}

function updateSeasonalStats() {
    characters.forEach(c => {
        if (c.job === "대학생") {
            let score = c.stats.hiddenScore;
            let newGPA = (score<20)?rand(10,20)/10 : (score<50?rand(20,30)/10 : (score<80?rand(30,40)/10 : rand(38,45)/10));
            c.stats.value = newGPA;
            addRawLog(null, "NEWS", `${c.name}님의 학점 확정: ${c.stats.value}`);
            c.stats.hiddenScore = 0; 
        }
    });
}

// === 관계 이벤트 ===
function checkLoverEvent(c1, c2, timeStr) {
    const rel = relationships.find(x => (x.from===c1.id && x.to===c2.id) || (x.from===c2.id && x.to===c1.id));
    if(!rel || rel.type !== 'lover') return false;

    if(rel.mood === 'cold') { 
        if(Math.random() < 0.2) {
            rel.mood = 'sweet';
            addRawLog(timeStr, "EVENT", `🤝 ${c1.name}님이 ${c2.name}님에게 사과하며 화해했습니다.`);
            return true;
        }
    } else { 
        if(Math.random() < 0.05) {
            rel.mood = 'cold';
            addRawLog(timeStr, "EVENT", `💢 ${c1.name}님과 ${c2.name}님이 다투고 분위기가 싸해집니다.`);
            return true;
        }
    }
    return false;
}

function checkCrushEvent(c1, c2, timeStr) {
    const r1 = relationships.find(r => r.from===c1.id && r.to===c2.id && r.type==='crush');
    if(r1 && Math.random() < 0.1) { // 10% 확률 고백
        addRawLog(timeStr, "EVENT", `💓 ${c1.name}님이 용기내어 ${c2.name}님에게 고백합니다!`);
        if(Math.random() < 0.5) { 
            relationships = relationships.filter(r => !((r.from===c1.id && r.to===c2.id) || (r.from===c2.id && r.to===c1.id)));
            relationships.push({from: c1.id, to: c2.id, type: 'lover', mood: 'sweet'});
            addRawLog(timeStr, "EVENT", `🎉 ${c2.name}님이 고백을 받아주었습니다! 연인이 되었습니다.`);
            renderGraphEdges();
            return true;
        } else { 
            relationships = relationships.filter(r => !((r.from===c1.id && r.to===c2.id) || (r.from===c2.id && r.to===c1.id)));
            relationships.push({from: c1.id, to: c2.id, type: 'awkward'}); 
            simState.rejected[c1.id] = 7; 
            addRawLog(timeStr, "EVENT", `💔 ${c2.name}님이 거절했습니다... 당분간 마주치기 힘들 것 같습니다.`);
            renderGraphEdges();
            return true;
        }
    }
    return false;
}

function checkTriangle(c1, c2, timeStr) {
    const love1 = relationships.find(r => r.from === c1.id && r.to === c2.id && r.type === 'crush');
    if(!love1) return false;
    const partnerRel = relationships.find(r => (r.from === c2.id || r.to === c2.id) && ['lover', 'crush'].includes(r.type) && (r.from !== c1.id && r.to !== c1.id));
    if(partnerRel) {
        const c3Id = partnerRel.from === c2.id ? partnerRel.to : partnerRel.from;
        if(simState.visitors.includes(c3Id)) {
            addRawLog(timeStr, "", triangleLogs[0](c1, c2, getChar(c3Id)));
            return true;
        }
    }
    return false;
}

function checkContagion(c1, c2, timeStr) {
    const existing = relationships.find(r => (r.from===c1.id && r.to===c2.id) || (r.from===c2.id && r.to===c1.id));
    if(existing) return false;
    for(let id of simState.visitors) {
        if(id===c1.id || id===c2.id) continue;
        const rel1 = relationships.find(r => (r.from===c1.id && r.to===id) || (r.from===id && r.to===c1.id));
        const rel2 = relationships.find(r => (r.from===c2.id && r.to===id) || (r.from===id && r.to===c2.id));
        if(rel1 && rel1.type==='friend' && rel2 && ['friend','lover'].includes(rel2.type)) {
            addRawLog(timeStr, "EVENT", introLogs[0](c1, getChar(id), c2));
            if(Math.random()<0.5) {
                relationships.push({from: c1.id, to: c2.id, type: 'friend'});
                addRawLog(timeStr, "SYSTEM", `${c1.name}님과 ${c2.name}님이 지인이 되었습니다.`);
                renderGraphEdges();
            }
            return true;
        }
    }
    return false;
}

// === 렌더링 ===
function getChar(id) { return characters.find(c => c.id === id); }
function getCrushTarget(id) {
    const r = relationships.find(r => r.from===id && r.type==='crush');
    if(!r) return null;
    return getChar(r.to);
}

function addRawLog(time, sender, msg) {
    const list = document.getElementById('log-list');
    const div = document.createElement('div');
    div.className = 'log-item';
    
    // 시간(time)이 null이면 시간 표시 안 함 (시스템 메시지 등)
    let timeHtml = time ? `<span class="log-time">${time}</span>` : "";

    if(sender === "SYSTEM") div.innerHTML = `${timeHtml} <span style="color:#d32f2f; font-weight:bold;">[SYSTEM]</span> ${msg}`;
    else if (sender === "NEWS") div.innerHTML = `${timeHtml} <span style="color:#1976D2; font-weight:bold;">[NEWS]</span> ${msg}`;
    else if (sender === "Viral") div.innerHTML = `${timeHtml} <span style="color:#E91E63; font-weight:bold;">[🔥HOT]</span> ${msg}`;
    else if (sender === "⚠️WARN" || sender === "⚠️INFO") div.innerHTML = `${timeHtml} <span style="color:#ff9800; font-weight:bold;">[⚠️]</span> ${msg}`;
    else if (sender === "WEATHER") div.innerHTML = `${timeHtml} <span style="color:#795548; font-weight:bold;">[☁️]</span> ${msg}`;
    else if (sender === "EVENT") div.innerHTML = `${timeHtml} <span style="color:#E91E63; font-weight:bold;">[💘]</span> ${msg}`;
    else div.innerHTML = `${timeHtml} ${msg}`;
    
    list.appendChild(div);
    document.querySelector('.log-wrapper').scrollTop = document.querySelector('.log-wrapper').scrollHeight;
}

function addDayDivider() {
    const list = document.getElementById('log-list');
    const div = document.createElement('div');
    div.className = 'day-divider';
    div.innerText = `────── ${seasons[seasonIdx]} / ${days[dayIdx]} ──────`;
    list.appendChild(div);
}

function updateHeaderDisplay() {
    document.getElementById('season-display').innerText = seasons[seasonIdx];
    document.getElementById('day-display').innerText = days[dayIdx];
}

function renderList() {
    const list = document.getElementById('visitor-list');
    list.innerHTML = '';
    const active = characters.filter(c => simState.visitors.includes(c.id)).sort((a,b) => a.name.localeCompare(b.name));
    const inactive = characters.filter(c => !simState.visitors.includes(c.id)).sort((a,b) => a.name.localeCompare(b.name));
    active.forEach(c => list.appendChild(createCard(c, true)));
    inactive.forEach(c => list.appendChild(createCard(c, false)));
}

function createCard(c, isActive) {
    const div = document.createElement('div');
    div.className = `guest-card ${isActive ? 'active' : 'inactive'}`;
    let status = isActive ? "방문중" : "미방문";
    if(c.status === 'burnout') { status = "번아웃"; div.style.backgroundColor = "#fff3e0"; }
    else if(c.status === 'slump') { status = "슬럼프"; div.style.backgroundColor = "#eceff1"; }

    const r = relationships.find(r => r.from === c.id && r.type === 'crush');
    let crushLine = "";
    if(r) {
        const t = getChar(r.to);
        if(t) crushLine = `<div style="font-size:11px; color:#ffb300;">💛 ${t.name} 짝사랑</div>`;
    }
    
    let valStr = c.stats.value;
    if(c.job==="커미션러" || c.job==="대학생") valStr = Number(valStr).toFixed(1);
    else valStr = Math.floor(valStr);

    div.innerHTML = `
        <div>
            <span class="g-name">${c.name}</span>
            <div class="g-detail">${c.job} · ${c.mbti} · <span style="color:#4caf50;">${c.stats.name}: ${valStr}</span></div>
            ${crushLine}
        </div>
        <span class="status-tag">${status}</span>
    `;
    return div;
}

function renderNodes() {
    const layer = document.getElementById('nodes-layer');
    layer.innerHTML = '';
    const r = 100;
    const cx = layer.parentElement.clientWidth / 2;
    const cy = layer.parentElement.clientHeight / 2;
    characters.forEach((c, i) => {
        const ang = (i / characters.length) * Math.PI * 2 - Math.PI/2;
        const x = cx + r * Math.cos(ang);
        const y = cy + r * Math.sin(ang);
        const node = document.createElement('div');
        node.className = 'node';
        node.id = `node-${c.id}`;
        node.style.left = `${x}px`;
        node.style.top = `${y}px`;
        node.innerText = c.name;
        node.onclick = () => handleNodeClick(c.id);
        layer.appendChild(node);
    });
    renderGraphEdges();
}

function renderGraphEdges() {
    const svg = document.getElementById('graph-svg');
    const defs = svg.querySelector('defs').outerHTML;
    svg.innerHTML = defs;
    for(let i=0; i<characters.length; i++) {
        for(let j=i+1; j<characters.length; j++) {
            const id1 = characters[i].id;
            const id2 = characters[j].id;
            const r1 = relationships.find(r => r.from===id1 && r.to===id2);
            const r2 = relationships.find(r => r.from===id2 && r.to===id1);
            if(!r1 && !r2) continue;
            const n1 = document.getElementById(`node-${id1}`);
            const n2 = document.getElementById(`node-${id2}`);
            if(!n1 || !n2) continue;
            
            const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
            line.setAttribute("x1", parseFloat(n1.style.left));
            line.setAttribute("y1", parseFloat(n1.style.top));
            line.setAttribute("x2", parseFloat(n2.style.left));
            line.setAttribute("y2", parseFloat(n2.style.top));
            line.setAttribute("stroke-width", "2");
            
            let col = "#ddd";
            let dash = "";
            let mEnd = "";
            let mStart = "";

            if(r1 && r1.type === 'crush' && r2 && r2.type === 'crush') {
                 col = "#FFD600"; dash = "4"; mEnd = "url(#arrow-end)"; mStart = "url(#arrow-start)";
            } else if(r1 && r1.type === 'crush') {
                 col = "#FFD600"; dash = "4"; mEnd = "url(#arrow-end)";
            } else if(r2 && r2.type === 'crush') {
                 col = "#FFD600"; dash = "4"; mStart = "url(#arrow-start)";
            } else {
                const type = r1 ? r1.type : r2.type;
                if(type === 'friend') col = "#42a5f5";
                else if(type === 'lover') col = "#ef5350";
                else if(type === 'family') col = "#66bb6a";
                else if(type === 'coworker') col = "#ffa726";
                else if(type === 'awkward') { col = "#BDBDBD"; dash = "2,2"; }
            }
            line.setAttribute("stroke", col);
            if(dash) line.setAttribute("stroke-dasharray", dash);
            if(mEnd) line.setAttribute("marker-end", mEnd);
            if(mStart) line.setAttribute("marker-start", mStart);
            svg.appendChild(line);
        }
    }
}

function handleNodeClick(id) {
    const tool = document.querySelector('input[name="tool"]:checked').value;
    if(tool === 'select') {
        const c = getChar(id);
        addRawLog(null, "SYSTEM", `${c.name} (${c.job}) 정보를 확인했습니다.`);
        return;
    }
    simState.clickStack.push(id);
    document.getElementById(`node-${id}`).classList.add('selected');
    if(simState.clickStack.length === 2) {
        const [from, to] = simState.clickStack;
        if(from !== to) {
            if(tool === 'crush') {
                relationships = relationships.filter(r => !(r.from===from && r.to===to));
                relationships.push({from, to, type: 'crush'});
            } else {
                relationships = relationships.filter(r => !((r.from===from && r.to===to) || (r.from===to && r.to===from)));
                // 연인 초기값 mood: sweet
                const newRel = {from, to, type: tool};
                if(tool === 'lover') newRel.mood = 'sweet';
                relationships.push(newRel);
            }
            renderGraphEdges();
            addRawLog(null, "SYSTEM", `${getChar(from).name} ↔ ${getChar(to).name} (${tool}) 설정됨`);
        }
        setTimeout(() => {
            document.querySelectorAll('.node').forEach(n => n.classList.remove('selected'));
            simState.clickStack = [];
        }, 200);
    }
}

function exportData() {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([JSON.stringify({characters, relationships}, null, 2)], {type:'application/json'}));
    a.download = 'cafe.json'; a.click();
}
function importData(e) {
    const r = new FileReader();
    r.onload = (evt) => {
        const d = JSON.parse(evt.target.result);
        characters = d.characters; relationships = d.relationships || [];
        renderNodes(); renderList();
    };
    if(e.target.files[0]) r.readAsText(e.target.files[0]);
    e.target.value = '';

}
