/* 경력 번역기 — 직업상담 도구
   인출(1) → 매핑(2) → 번역(3) → 검토. 고용24 채용정보 Open API로 공고를 불러옵니다. */
(function(){
"use strict";

/* ---------------- 상담 내용 ---------------- */
var THEMES=[
 {k:"A",name:"돈과 물자",ncs:"수리 · 자원관리",qs:[
  "한 달 생활비나 가게 비용은 누가 어떻게 정리하셨나요?",
  "장을 보실 때 예산을 미리 정해 두셨나요? 어떻게 맞추셨어요?",
  "돈이 모자랄 때 무엇을 먼저 줄이셨나요?",
  "수입과 지출을 어디에 적어 두셨나요? 영수증은 어떻게 하셨어요?",
  "모임이나 가게에서 물건을 사 오거나 재고를 챙긴 적이 있나요?",
  "계산이 어긋났을 때 어떻게 찾아내셨나요?"]},
 {k:"B",name:"사람",ncs:"의사소통 · 대인관계",qs:[
  "의견이 갈릴 때 주로 누가 정리하셨나요?",
  "화가 난 사람을 상대해 보신 적이 있나요? 어떻게 하셨어요?",
  "여러 사람에게 같은 내용을 전해야 할 때 어떤 방법을 쓰셨나요?",
  "처음 만난 사람과 일을 맞춰 보신 경험이 있나요?",
  "누군가에게 방법을 가르쳐 보신 적이 있나요? 몇 분이었어요?",
  "부탁을 거절해야 했을 때는 어떻게 말하셨나요?"]},
 {k:"C",name:"기한과 과업",ncs:"문제해결 · 자기개발",qs:[
  "하루 중 가장 빠듯한 때는 언제였고, 어떻게 넘기셨나요?",
  "여러 일이 겹쳤을 때 무엇을 먼저 하셨나요? 왜 그 순서였어요?",
  "날짜를 놓치면 안 되는 일이 있었나요? 어떻게 챙기셨어요?",
  "갑자기 계획이 틀어진 적이 있나요? 그때 무엇을 바꾸셨어요?",
  "같은 문제가 되풀이될 때 방법을 바꿔 보신 적이 있나요?",
  "필요해서 새로 익힌 것이 있나요? 어떻게 익히셨어요?"]},
 {k:"D",name:"정보와 기기",ncs:"정보 · 기술",qs:[
  "필요한 정보는 주로 어디서 찾으셨나요?",
  "휴대전화나 컴퓨터로 주로 무엇을 하시나요?",
  "서류를 접수하거나 신청해 보신 경험이 있나요? 어떤 절차였어요?",
  "기계나 장비를 다뤄 보신 적이 있나요? 고장 났을 때는요?",
  "사진·문서·연락처 같은 것은 어떻게 정리해 두시나요?",
  "들은 정보가 맞는지 확인해 보신 적이 있나요? 어떻게요?"]},
 {k:"E",name:"소속과 책임",ncs:"조직이해 · 직업윤리",qs:[
  "꾸준히 나가신 모임이나 단체가 있나요? 얼마나 오래였어요?",
  "그 안에서 맡은 역할이 있었나요? 어떻게 맡게 되셨어요?",
  "약속한 시간이나 당번을 지키려고 무엇을 하셨나요?",
  "규칙이나 순서를 정해 보신 적이 있나요?",
  "남의 돈이나 물건, 사정을 맡아 보신 적이 있나요?",
  "그만두거나 넘겨줄 때 어떻게 정리하셨나요?"]}
];
var CARDS=[
 {t:"카드 1 · 입주자대표회의 총무",age:"50대 초반",gap:"11년",type:"육아형",job:"사무보조",cert:"컴퓨터활용능력 2급",hidden:"아파트 입주자대표회의 총무 3년. 관리비 내역 확인, 회의록 작성, 세대 민원 접수. 본인은 “동네 일”이라 생각해 경력으로 말하지 않는다."},
 {t:"카드 2 · 4년 간병",age:"40대 후반",gap:"6년",type:"간병형",job:"병원 행정 · 요양보호",cert:"요양보호사",hidden:"어머니 투병 4년간 병원 예약·보험 청구·관공서 서류를 혼자 처리. 교대 간병인 3명 일정 조율.",sens:"사별 이야기가 나올 수 있습니다. 파고들지 말고 다음 주제로 넘어가세요."},
 {t:"카드 3 · 반찬가게 7년",age:"50대 중반",gap:"3년",type:"폐업형",job:"매장 관리",cert:"식품위생교육 수료",hidden:"반찬가게 7년 운영. 일일 매출 정산, 원가 조정, 아르바이트 4명 채용·교육, 단골 주문 관리.",sens:"폐업 과정은 묻지 말고, 운영하던 방식만 확인하세요."},
 {t:"카드 4 · 통역 자원봉사",age:"30대 후반",gap:"5년",type:"이주형",job:"고객 상담",cert:"운전면허 1종",hidden:"다문화가족지원센터 통역 자원봉사 2년, 주 1회. 상담 동행, 서류 번역, 신규 봉사자 안내."},
 {t:"카드 5 · 급식 봉사 10년",age:"60대 초반",gap:"18년",type:"장기 공백",job:"급식 · 환경미화",cert:"없음",hidden:"교회 주방 봉사 10년. 명절 200인분 배식 준비 총괄, 재료 발주, 봉사자 12명 당번표 작성."},
 {t:"카드 6 · 중고 거래 3년",age:"40대 초반",gap:"2년",type:"부업형",job:"온라인 판매 운영",cert:"SNS 마케팅 교육 수료",hidden:"중고 거래 플랫폼에서 3년간 월 30~50건 판매. 사진 촬영, 가격 조사, 정산·배송·환불 응대."}
];
var CHECKS=[
 {g:"사실 확인",items:["산출물의 수치가 구직자 진술과 같다","기간이 진술과 같다","활동 내용이 진술과 같다","진술에 없는 내용이 들어가지 않았다"]},
 {g:"표현 점검",items:["직위를 오인할 표현이 없다","자격증 보유로 읽힐 표현이 없다","고용형태를 오인할 표현이 없다","과장어가 없다"]},
 {g:"개인정보",items:["성명·연락처·주소·생년월일이 없다","제3자를 특정할 정보가 없다","가족 호칭이 중립 표현으로 바뀌었다"]},
 {g:"전달 전",items:["구직자 동의를 받았다","구직자와 함께 소리 내어 읽었다","“보완 필요” 항목을 설명했다"]}
];
var HON=[["형님","형제"],["동서","형제"],["아주버님","가족"],["시누이","가족"],["올케","가족"],["처형","가족"],
 ["처남","가족"],["매형","가족"],["제수씨","가족"],["시아버님","가족"],["시어머님","가족"],["시아버지","가족"],
 ["시어머니","가족"],["큰아들","자녀"],["작은아들","자녀"],["막내","자녀"]];
var FLAGS={
 "과장어":["탁월","뛰어난","우수한","풍부","폭넓은","수많은","다수의","상당한","완벽","최고","열정적","적극적","다년간","오랜 기간","깊은 이해","전문적"],
 "모호한 수량":["여러","다양한","많은","약간","어느 정도","상당수","종종","자주"],
 "직위 오인":["팀장","과장","부장","차장","매니저","관리자","책임자","총괄","리더","대표","주임"],
 "자격 연상":["전문가","자격 보유","자격을 갖춘","면허 보유","공인"],
 "고용형태 오인":["정규직","재직","입사","채용되어","소속되어","근속"]
};
var SAFE=["입주자대표회의","대표회의","학부모대표","반대표","통장 대표","대표번호","대표전화","자기개발","정보처리","부녀회장","이장","통장"];
var SALTP=[["","관계없음"],["H","시급"],["D","일급"],["M","월급"],["Y","연봉"]];
var W24DOC="https://www.work24.go.kr/cm/e/a/0110/selectOpenApiSvcInfo.do?fullApiSvcId=000000000000000000000000000000";
var W24={list:"https://www.work24.go.kr/cm/openApi/call/wk/callOpenApiSvcInfo210L01.do",
         dtl:"https://www.work24.go.kr/cm/openApi/call/wk/callOpenApiSvcInfo210D01.do"};
var W24LABEL={wantedAuthNo:"구인인증번호",company:"회사명",title:"채용제목",wantedTitle:"채용제목",
 indTpNm:"업종",salTpNm:"임금형태",sal:"급여",minSal:"최소임금",maxSal:"최대임금",region:"근무지역",
 holidayTpNm:"근무형태",minEdubg:"최소학력",maxEdubg:"최대학력",career:"경력",regDt:"등록일",closeDt:"마감일",
 basicAddr:"기본주소",detailAddr:"상세주소",zipCd:"우편번호",jobsCd:"직종코드",jobsNm:"직종",
 empTpCd:"고용형태코드",empTpNm:"고용형태",busino:"사업자등록번호",infoSvc:"정보제공처",
 wantedInfoUrl:"채용정보 URL",wantedMobileInfoUrl:"모바일 URL",smodifyDtm:"최종수정일"};

/* ---------------- 상태 ---------------- */
var KEY="career-translator-v2";
var S={info:{age:"",gap:"",job:"",cert:""},asked:{},skip:{},facts:[],round:1,
  mapping:null,levelOverride:{},posting:"",outputs:null,checks:{},tab:"guide",
  cond:{sido:"",sigungu:"",job1:"",job2:"",salTp:"",minPay:"",maxPay:"",keyword:""},
  api:{key:"",list:[],picked:null,err:"",dtlErr:""}};
function load(){try{var r=localStorage.getItem(KEY);if(r){var o=JSON.parse(r);for(var k in o)if(o[k]!==undefined)S[k]=o[k];}}catch(e){}}
function save(){try{localStorage.setItem(KEY,JSON.stringify(S));}catch(e){}}
load();
if(!S.cond)S.cond={sido:"",sigungu:"",job1:"",job2:"",salTp:"",minPay:"",maxPay:"",keyword:""};
if(!S.api)S.api={key:"",list:[],picked:null,err:"",dtlErr:""};

var REGIONS=[],JOBS=[],CAP={work24:false,ask:false},READY=false;

/* ---------------- 유틸 ---------------- */
function esc(s){return String(s==null?"":s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#39;");}
function honor(s){var t=String(s||"");for(var i=0;i<HON.length;i++)t=t.split(HON[i][0]).join(HON[i][1]);return t;}
function hasHonor(s){for(var i=0;i<HON.length;i++)if(String(s||"").indexOf(HON[i][0])>-1)return HON[i][0];return null;}
function maskSafe(t){for(var i=0;i<SAFE.length;i++)t=t.split(SAFE[i]).join(""+i+"");return t;}
function unmaskSafe(t){for(var i=0;i<SAFE.length;i++)t=t.split(""+i+"").join(SAFE[i]);return t;}
var FLAGMAP={},FLAGRE=(function(){
  var w=[];for(var g in FLAGS)for(var i=0;i<FLAGS[g].length;i++){FLAGMAP[FLAGS[g][i]]=g;w.push(FLAGS[g][i]);}
  w.sort(function(a,b){return b.length-a.length;});
  return new RegExp(w.map(function(x){return x.replace(/[.*+?^${}()|[\]\\]/g,"\\$&");}).join("|"),"g");
})();
function flagHTML(s){
  return unmaskSafe(maskSafe(esc(s)).replace(FLAGRE,function(w){
    return '<mark class="flag" title="'+(FLAGMAP[w]||"점검")+'">'+w+'</mark>';}));
}
function countFlags(texts){
  var hits={},joined=maskSafe(texts.join(" "));
  for(var g in FLAGS)for(var i=0;i<FLAGS[g].length;i++)
    if(joined.indexOf(FLAGS[g][i])>-1){hits[g]=hits[g]||[];hits[g].push(FLAGS[g][i]);}
  return hits;
}
function uid(){return Math.random().toString(36).slice(2,9);}
function themeFacts(k){return S.facts.filter(function(f){return f.theme===k;});}
function slotsOf(k){var o={period:false,scale:false,role:false,diff:false};
  themeFacts(k).forEach(function(f){if(f.period)o.period=true;if(f.scale)o.scale=true;if(f.role)o.role=true;if(f.diff)o.diff=true;});
  return o;}
function askedCount(k){var n=0,a=S.asked[k]||{};for(var i in a)if(a[i])n++;return n;}
function backupText(){try{var c=JSON.parse(JSON.stringify(S));if(c.api)c.api.key="";return JSON.stringify(c);}catch(e){return "";}}
function copy(text,btn){
  var done=function(){if(btn){var o=btn.dataset.lbl||btn.textContent;btn.dataset.lbl=o;btn.textContent="복사했습니다";
    setTimeout(function(){btn.textContent=o;},1400);}};
  if(navigator.clipboard&&navigator.clipboard.writeText){
    navigator.clipboard.writeText(text).then(done,function(){fallback();});
  }else fallback();
  function fallback(){
    var ta=document.createElement("textarea");ta.value=text;ta.style.position="fixed";ta.style.opacity="0";
    document.body.appendChild(ta);ta.select();
    try{document.execCommand("copy");done();}catch(e){}
    document.body.removeChild(ta);
  }
}

/* ---------------- 코드표 · 조건 ---------------- */
function sidoList(){return REGIONS.filter(function(r){return r.level===1;});}
function sigunguList(sido){
  if(!sido||sido==="00000")return [];
  var p=sido.slice(0,2);
  return REGIONS.filter(function(r){return r.level===2&&r.p===p;});
}
function job1List(){return JOBS.filter(function(j){return j.level===1;});}
function job2List(j1){return j1?JOBS.filter(function(j){return j.level===2&&j.p===j1;}):[];}
function nameOf(list,code){for(var i=0;i<list.length;i++)if(list[i].code===code)return list[i].name;return "";}
function regionCode(){return S.cond.sigungu||S.cond.sido||"";}
function occupationCode(){return S.cond.job2||S.cond.job1||"";}
function salName(v){for(var i=0;i<SALTP.length;i++)if(SALTP[i][0]===v)return SALTP[i][1];return v;}
function condSummary(){
  var c=S.cond,b=[];
  var rc=regionCode();
  if(rc)b.push(nameOf(REGIONS,rc)||rc);
  var oc=occupationCode();
  if(oc)b.push(nameOf(JOBS,oc)||oc);
  if(c.salTp)b.push(salName(c.salTp)+" "+(c.minPay||"?")+"~"+(c.maxPay||"?")+"만원");
  if(c.keyword)b.push("“"+c.keyword+"”");
  return b.length?b.join(" · "):"조건 없음 — 최근 등록된 공고를 가져옵니다";
}
function payIncomplete(){return !!S.cond.salTp&&!(S.cond.minPay&&S.cond.maxPay);}
function payHintText(){
  var c=S.cond;
  return payIncomplete()
    ? "고용24는 임금형태를 고르면 최소·최대를 모두 받습니다. 두 칸을 채워야 급여 조건이 검색에 들어갑니다."
    : "만원 단위로 적습니다. "+salName(c.salTp)+" "+c.minPay+"~"+c.maxPay+"만원으로 찾습니다.";
}
function refreshCond(){
  var s=document.getElementById("condSum");
  if(s)s.textContent=condSummary();
  var p=document.getElementById("payHint");
  if(p){p.textContent=payHintText();p.style.color=payIncomplete()?"var(--warn)":"";}
}
function searchParams(){
  var c=S.cond,p={callTp:"L",returnType:"XML",startPage:"1",display:"30",sortOrderBy:"DESC"};
  var rc=regionCode();if(rc&&rc!=="00000")p.region=rc;
  var oc=occupationCode();if(oc)p.occupation=oc;
  if(c.salTp&&c.minPay&&c.maxPay){p.salTp=c.salTp;p.minPay=String(c.minPay).replace(/[^0-9]/g,"");p.maxPay=String(c.maxPay).replace(/[^0-9]/g,"");}
  if(c.keyword)p.keyword=c.keyword;
  return p;
}
function qs(o){return Object.keys(o).map(function(k){return k+"="+encodeURIComponent(o[k]);}).join("&");}
function manualListUrl(){
  var p=searchParams();
  return W24.list+"?authKey="+(S.api.key||"[인증키]")+"&"+qs(p);
}
function manualDtlUrl(no){
  return W24.dtl+"?authKey="+(S.api.key||"[인증키]")+"&callTp=D&returnType=XML&infoSvc=VALIDATION&wantedAuthNo="+encodeURIComponent(no||"");
}

/* ---------------- 서버 경로 ---------------- */
function apiUrl(p){return "api/"+p;}
async function detectCapabilities(){
  try{
    var r=await fetch(apiUrl("capabilities"),{cache:"no-store"});
    if(r.ok){var j=await r.json();return {work24:!!j.work24,ask:!!j.ask};}
  }catch(e){}
  return {work24:false,ask:false};
}
async function fetchWork24(params){
  var r=await fetch(apiUrl("work24")+"?"+qs(params));
  var t=await r.text();
  if(!r.ok)throw{message:"고용24 요청이 실패했습니다 ("+r.status+"). "+t.slice(0,200)};
  return t;
}
async function askAI(prompt){
  var r=await fetch(apiUrl("ask"),{method:"POST",headers:{"Content-Type":"application/json"},
    body:JSON.stringify({prompt:prompt})});
  var j=null;
  try{j=await r.json();}catch(e){throw{message:"응답을 읽지 못했습니다."};}
  if(!r.ok)throw{message:(j&&j.error)||"요청이 실패했습니다."};
  return looseJSON(j.text||"");
}
function looseJSON(t){
  var s=String(t).trim().replace(/^```(?:json)?/i,"").replace(/```$/,"").trim();
  try{return JSON.parse(s);}catch(e){}
  var a=s.indexOf("{"),b=s.lastIndexOf("}");
  if(a>-1&&b>a){try{return JSON.parse(s.slice(a,b+1));}catch(e2){}}
  throw{message:"형식이 맞지 않는 응답을 받았습니다."};
}

/* ---------------- XML ---------------- */
function xmlDoc(text){
  var t=String(text||"").trim().replace(/^﻿/,"");
  if(!t)throw{message:"붙여넣은 내용이 없습니다."};
  var d=new DOMParser().parseFromString(t,"text/xml");
  if(d.getElementsByTagName("parsererror").length)throw{message:"XML 형식이 아닙니다. 받은 응답을 통째로 붙여넣었는지 확인하세요."};
  return d;
}
function tx(node,tag){var e=node.getElementsByTagName(tag)[0];return e&&e.textContent?e.textContent.trim():"";}
function parseWantedList(text){
  var d=xmlDoc(text),ns=d.getElementsByTagName("wanted"),out=[];
  if(!ns.length){
    var msg=tx(d,"message")||tx(d,"errMsg")||tx(d,"returnAuthMsg");
    throw{message:msg?("고용24 응답: "+msg):"조건에 맞는 공고가 없습니다. 조건을 넓혀 보세요."};
  }
  for(var i=0;i<ns.length;i++){var n=ns[i],o={};for(var k in W24LABEL)o[k]=tx(n,k);out.push(o);}
  return out;
}
function leafLines(node){
  var out=[],seen={};
  (function walk(el){
    for(var i=0;i<el.children.length;i++){
      var c=el.children[i];
      if(c.children.length){walk(c);continue;}
      var v=(c.textContent||"").trim();if(!v)continue;
      var label=W24LABEL[c.tagName]||c.tagName,key=label+"\u0001"+v;
      if(seen[key])continue;seen[key]=1;out.push(label+": "+v);
    }
  })(node);
  return out;
}
function postingFromList(o){
  var L=["[고용24 채용공고]"];
  ["company","title","indTpNm","region","salTpNm","sal","minSal","maxSal","empTpCd","holidayTpNm",
   "minEdubg","maxEdubg","career","jobsCd","closeDt","basicAddr","detailAddr","wantedAuthNo","wantedInfoUrl"]
   .forEach(function(k){if(o[k])L.push(W24LABEL[k]+": "+o[k]);});
  return L.join("\n");
}

/* ---------------- 프롬프트 ---------------- */
function factsText(){
  var out=[];
  THEMES.forEach(function(t){
    var fs=themeFacts(t.k);if(!fs.length)return;
    out.push("["+t.k+" "+t.name+"]");
    fs.forEach(function(f){
      var bits=[];
      if(f.period)bits.push("기간: "+f.period);
      if(f.scale)bits.push("규모: "+f.scale);
      if(f.role)bits.push("역할: "+f.role);
      if(f.diff)bits.push("난점: "+f.diff);
      out.push("- "+honor(f.summary)+(bits.length?" ("+bits.join(" / ")+")":"")+(f.sens?" [민감]":""));
    });
  });
  var sk=THEMES.filter(function(t){return S.skip[t.k];}).map(function(t){return t.name;});
  if(sk.length)out.push("[건너뛴 주제] "+sk.join(", ")+" — 구직자가 부담 신호를 보여 중단함");
  return out.join("\n");
}
function infoText(){
  var i=S.info,b=[];
  if(i.age)b.push("연령대 "+i.age);
  if(i.gap)b.push("경력 공백 "+i.gap);
  if(i.job)b.push("희망 직무 "+i.job);
  if(i.cert)b.push("자격증 "+i.cert);
  return b.join(" / ")||"(미입력)";
}
function mapPrompt(){
  return "당신은 직업상담사를 돕는 보조자입니다. 아래는 상담사가 정리한 구직자 진술입니다. 이것을 NCS 직업기초능력 10개 영역에 배치하십시오.\n\n"+
  "규칙\n1. 진술에 없는 수치·기간·활동을 절대 보충하지 마십시오.\n"+
  "2. 근거가 없는 영역은 rows에서 빼고 excluded에 이유와 함께 적으십시오.\n"+
  "3. 수준 판정: 기간·규모·역할 중 3개가 확인되고 책임이 분명하면 '상', 2개면 '중', 1개면 '하', 0개면 '판정 불가'로 하십시오.\n"+
  "4. evidence는 진술 문장을 근거로 한 줄로 쓰고, 해석을 덧붙이지 마십시오.\n"+
  "5. 민감 표시가 붙은 내용은 역량 근거로만 쓰고 사유를 풀어 쓰지 마십시오.\n\n"+
  "기본정보: "+infoText()+"\n\n진술\n"+factsText()+"\n\n"+
  "다음 JSON만 출력하십시오.\n"+
  '{"rows":[{"area":"<10개 영역 중 하나>","level":"상|중|하|판정 불가","evidence":"...","basis":["기간","규모","역할"]}],'+
  '"needMore":["추가로 확인할 항목"],"excluded":[{"area":"...","reason":"..."}]}';
}
function transPrompt(){
  var rows=(S.mapping&&S.mapping.rows||[]).map(function(r){
    return "- "+r.area+" ["+(S.levelOverride[r.area]||r.level)+"] 근거: "+r.evidence;}).join("\n");
  return "당신은 직업상담사를 돕는 보조자입니다. 아래 2단계 매핑 결과와 채용공고를 보고, 공고의 언어로 번역하십시오.\n\n"+
  "규칙\n1. 모든 문장은 아래 근거에서만 만듭니다. 근거에 없는 사실은 쓰지 않습니다.\n"+
  "2. 수치가 없으면 '여러', '다양한', '많은' 같은 모호한 수량 표현도 쓰지 않습니다.\n"+
  "3. 직위를 오인하게 하는 표현(팀장·관리자·책임자 등), 자격증 보유로 읽힐 표현, 고용형태를 오인할 표현을 쓰지 않습니다.\n"+
  "4. '탁월한', '풍부한' 같은 과장어를 쓰지 않습니다.\n"+
  "5. 공고 요건 중 근거로 충족을 주장할 수 없는 항목은 gaps에 적습니다. 억지로 맞추지 마십시오.\n"+
  "6. 면접 답변은 구어체로, 실제로 말할 수 있는 길이(3~4문장)로 씁니다.\n\n"+
  "기본정보: "+infoText()+"\n\n매핑 근거\n"+rows+"\n\n채용공고\n"+S.posting+"\n\n"+
  "다음 JSON만 출력하십시오.\n"+
  '{"resume":["이력서 경력기술 문장"],"coverLetter":["자기소개서 문장"],'+
  '"interview":[{"q":"예상 질문","a":"구어체 답변"}],'+
  '"crosswalk":[{"req":"공고 요건","claim":"주장 문장","area":"근거 영역","evidence":"근거 진술"}],'+
  '"gaps":[{"req":"충족 못 하는 요건","reason":"근거가 없는 이유","suggestion":"상담사가 안내할 보완 방향"}]}';
}

/* ---------------- 렌더 ---------------- */
var TABS=[{id:"guide",n:"",label:"시작 안내"},{id:"s1",n:"1",label:"인출"},{id:"s2",n:"2",label:"매핑"},
 {id:"s3",n:"3",label:"번역"},{id:"review",n:"",label:"검토"},{id:"cards",n:"",label:"역할극 카드"},
 {id:"bank",n:"",label:"질문뱅크 30"}];
function render(toTop){
  var keepY=window.scrollY;
  document.getElementById("rail").innerHTML=TABS.map(function(t){
    return '<button role="tab" data-tab="'+t.id+'" aria-selected="'+(S.tab===t.id)+'">'+
      (t.n?'<span class="railnum">'+t.n+'</span>':'')+esc(t.label)+'</button>';}).join("");
  var V={guide:vGuide,s1:vS1,s2:vS2,s3:vS3,review:vReview,cards:vCards,bank:vBank};
  document.getElementById("main").innerHTML=(V[S.tab]||vGuide)();
  window.scrollTo(0,toTop?0:keepY);
  save();
}

/* --- 시작 안내 --- */
function vGuide(){
  var n=S.facts.length,mapped=S.mapping?(S.mapping.rows||[]).length:0;
  var done=0,total=0;CHECKS.forEach(function(g){g.items.forEach(function(it){total++;if(S.checks[it])done++;});});
  return '<div class="card"><span class="eyebrow">쓰는 순서</span><h2 style="margin-top:6px">상담 한 회차에 세 단계를 그대로 따라갑니다</h2>'+
  '<div class="stack" style="margin-top:12px">'+
  step(1,"인출","상담 중에 다섯 주제를 한 바퀴 돌며 들은 사실을 적습니다. 한 주제당 질문은 두 개까지, 거부감이 보이면 바로 다음 주제로 넘어갑니다.","기록된 사실 "+n+"건",n>0)+
  step(2,"매핑","적어 둔 사실을 NCS 직업기초능력 10개 영역에 배치하고 수준을 판정합니다. 근거가 없는 영역은 비워 둡니다.","배치된 영역 "+mapped+"개",mapped>0)+
  step(3,"번역","고용24에서 공고를 불러와 이력서·자기소개서·면접 답변·근거 대조표를 만듭니다.",S.outputs?"산출물 생성 완료":"대기",!!S.outputs)+
  step("검","검토","전달 전에 체크리스트를 확인합니다. 상담사가 사실과 표현을 책임집니다.","확인 "+done+"/"+total,done===total&&total>0)+
  '</div></div>'+
  '<div class="card"><h3>이 도구를 쓰는 방식</h3><div class="stack" style="gap:10px;margin-top:10px">'+
  (!READY?'<p class="hint"><span class="spin"></span> 확인 중입니다.</p>':
   '<div><div class="row tight" style="align-items:center"><strong style="font-size:.9rem">고용24 공고 불러오기</strong>'+
   '<span class="badge '+(CAP.work24?"b-mid":"b-low")+'">'+(CAP.work24?"바로 검색":"붙여넣기")+'</span></div>'+
   '<p class="hint" style="margin-top:4px">'+(CAP.work24
     ?'1단계에서 조건을 고르고 3단계에서 “공고 검색”을 누르면 됩니다.'
     :'1단계에서 조건을 고르면 3단계가 고용24 요청 주소를 만들어 줍니다. 그 주소를 열어 나온 내용을 통째로 복사해 붙여넣으면 공고 목록으로 풀어 줍니다. 인증키는 처음 한 번만 넣어 두면 이 브라우저가 기억합니다.')+'</p></div>'+
   '<div><div class="row tight" style="align-items:center"><strong style="font-size:.9rem">매핑·번역</strong>'+
   '<span class="badge '+(CAP.ask?"b-mid":"b-low")+'">'+(CAP.ask?"바로 실행":"붙여넣기")+'</span></div>'+
   '<p class="hint" style="margin-top:4px">'+(CAP.ask
     ?'2·3단계에서 실행 버튼을 누르면 됩니다.'
     :'2·3단계의 “프롬프트 복사”를 눌러 쓰시는 AI 대화창(Claude, ChatGPT 등)에 붙여넣고, 받은 결과를 다시 이 화면에 붙여넣으면 표와 산출물로 풀어 줍니다.')+'</p></div>')+
  '</div></div>'+
  '<div class="card flat"><h3>처음 익히는 경우</h3><p class="hint" style="margin-top:6px">역할극 카드로 둘씩 짝을 지어 연습합니다. 한 사람이 구직자 역을 맡아 카드를 고르고, 카드의 “드러나지 않은 경험”은 상담사가 구체적으로 물을 때만 꺼냅니다. 질문뱅크는 AI 없이 종이에 적어 써도 됩니다.</p>'+
  '<div class="row tight" style="margin-top:10px"><button class="btn sm" data-tab="cards">역할극 카드 보기</button><button class="btn sm" data-tab="bank">질문뱅크 30 보기</button></div></div>'+
  '<div class="card"><h3>상담 기록 백업</h3>'+
  '<p class="hint" style="margin-top:6px">기록은 이 브라우저에만 있습니다. 브라우저를 바꾸거나 저장 공간이 비워지면 사라지니, 상담을 마치면 기록을 복사해 따로 보관하세요. 인증키는 복사본에 들어가지 않습니다.</p>'+
  '<div class="row tight" style="margin-top:10px"><button class="btn sm" data-copy="'+esc(backupText())+'">기록 복사</button></div>'+
  '<details style="margin-top:10px"><summary class="hint" style="cursor:pointer">복사해 둔 기록 되살리기</summary>'+
  '<textarea id="restoreBox" rows="3" style="margin-top:8px" placeholder="복사해 둔 기록을 붙여넣으세요"></textarea>'+
  '<button class="btn sm primary" id="restoreBtn" style="margin-top:8px">이 기록으로 덮어쓰기</button>'+
  '<p class="hint" style="margin-top:6px">지금 화면의 기록은 지워지고 붙여넣은 기록으로 바뀝니다.</p></details></div>';
}
function step(n,t,d,stat,ok){
  return '<div style="display:flex;gap:12px"><div style="flex:0 0 26px;height:26px;border-radius:50%;border:1px solid var(--line);display:grid;place-items:center;font-size:.8rem;font-weight:600;color:var(--accent);background:var(--accent-soft)">'+esc(n)+'</div>'+
  '<div style="min-width:0"><div style="display:flex;gap:8px;flex-wrap:wrap;align-items:baseline"><strong>'+esc(t)+'</strong>'+
  '<span class="badge '+(ok?"b-mid":"b-low")+'">'+esc(stat)+'</span></div>'+
  '<p class="hint" style="margin-top:2px">'+esc(d)+'</p></div></div>';
}

/* --- 구직 조건 --- */
function condCard(){
  var c=S.cond,sgs=sigunguList(c.sido),j2=job2List(c.job1);
  return '<div class="card"><div class="theme-head"><div><span class="eyebrow">구직 조건</span>'+
  '<h3 style="margin-top:2px">어떤 자리를 찾고 계신지</h3></div>'+
  '<span class="chip static">3단계 공고 검색에 그대로 쓰입니다</span></div>'+
  '<p class="hint" style="margin-top:8px">상담에서 확인한 희망 조건만 고릅니다. 비워 두면 그 조건 없이 검색합니다.</p>'+
  '<hr class="sep">'+
  '<div class="flabel">근무지역</div>'+
  '<div class="row tight" style="margin-top:8px">'+
  sidoList().map(function(r){
    return '<button class="chip'+(c.sido===r.code?" on":"")+'" data-sido="'+r.code+'">'+esc(r.name)+'</button>';}).join("")+
  '</div>'+
  (sgs.length?'<div class="pickline" style="margin-top:10px"><span class="hint">시·군·구</span>'+
    '<select data-cond="sigungu" style="max-width:260px"><option value="">'+esc(nameOf(REGIONS,c.sido))+' 전체</option>'+
    sgs.map(function(r){return '<option value="'+r.code+'"'+(c.sigungu===r.code?" selected":"")+'>'+esc(r.name)+'</option>';}).join("")+
    '</select></div>':'')+
  '<hr class="sep">'+
  '<div class="flabel">직종</div>'+
  '<div class="pickline" style="margin-top:8px">'+
  '<select data-cond="job1" style="max-width:320px"><option value="">직종 무관</option>'+
  job1List().map(function(j){return '<option value="'+j.code+'"'+(c.job1===j.code?" selected":"")+'>'+esc(j.name)+'</option>';}).join("")+
  '</select>'+
  (j2.length?'<select data-cond="job2" style="max-width:360px"><option value="">세부 직종 전체</option>'+
    j2.map(function(j){return '<option value="'+j.code+'"'+(c.job2===j.code?" selected":"")+'>'+esc(j.name)+'</option>';}).join("")+
    '</select>':'')+
  '</div>'+
  '<hr class="sep">'+
  '<div class="flabel">급여 수준</div>'+
  '<div class="payrow" style="margin-top:8px">'+
  '<div class="seg">'+SALTP.map(function(o){
    return '<button data-saltp="'+esc(o[0])+'" aria-pressed="'+(c.salTp===o[0])+'">'+esc(o[1])+'</button>';}).join("")+'</div>'+
  (c.salTp?'<div class="paybox"><input type="text" inputmode="numeric" data-cond="minPay" value="'+esc(c.minPay)+'" placeholder="최소" aria-label="최소 급여"><span>만원</span></div>'+
    '<span class="hint">~</span>'+
    '<div class="paybox"><input type="text" inputmode="numeric" data-cond="maxPay" value="'+esc(c.maxPay)+'" placeholder="최대" aria-label="최대 급여"><span>만원</span></div>':'')+
  '</div>'+
  (c.salTp?'<p class="hint" id="payHint" style="margin-top:6px'+(payIncomplete()?';color:var(--warn)':'')+'">'+esc(payHintText())+'</p>':'')+
  '<hr class="sep">'+
  '<div class="flabel">검색어</div>'+
  '<div class="searchbar" style="margin-top:8px">'+
  '<input type="search" data-cond="keyword" value="'+esc(c.keyword)+'" placeholder="예: 사무보조, 조리, 요양보호">'+
  '</div>'+
  '<div class="summary"><span class="hint">지금 조건</span><span class="chip static" id="condSum">'+esc(condSummary())+'</span>'+
  (regionCode()||occupationCode()||c.salTp||c.keyword?'<button class="btn sm ghost" id="condClear">조건 지우기</button>':'')+
  '</div></div>';
}

/* --- 1단계 --- */
function vS1(){
  var h='<div class="card"><span class="eyebrow">1단계 · 인출</span><h2 style="margin-top:6px">상담 중에 들은 사실만 적습니다</h2>'+
  '<p class="hint" style="margin-top:6px">다섯 주제를 한 바퀴 돌고, 두 번째 순회에서 답이 나온 주제로 돌아가 빈 항목을 채웁니다. 한 주제당 질문은 두 개까지입니다.</p>'+
  '<div class="row tight" style="margin-top:12px">'+
  '<button class="btn sm '+(S.round===1?"primary":"")+'" data-round="1">1순회</button>'+
  '<button class="btn sm '+(S.round===2?"primary":"")+'" data-round="2">2순회 · 빈 항목 채우기</button></div>'+
  '<hr class="sep"><div class="grid4">'+
  fld("age","연령대","예: 50대 초반")+fld("gap","경력 공백 기간","예: 11년")+
  fld("job","희망 직무","예: 사무보조")+fld("cert","자격증","예: 컴활 2급")+
  '</div><p class="hint" style="margin-top:8px">성명·생년월일·연락처·주소·가족 신상은 적지 않습니다.</p></div>'+condCard();

  THEMES.forEach(function(t){
    var sl=slotsOf(t.k),fs=themeFacts(t.k),ac=askedCount(t.k),sk=!!S.skip[t.k];
    h+='<div class="card'+(sk?" skipped":"")+'" id="th-'+t.k+'">'+
    '<div class="theme-head"><div><span class="eyebrow">'+t.k+' · '+esc(t.ncs)+'</span><h3 style="margin-top:2px">'+esc(t.name)+'</h3></div>'+
    '<div class="row tight" style="align-items:center"><div class="slots">'+sl2(sl)+'</div>'+
    '<button class="btn sm ghost" data-skip="'+t.k+'">'+(sk?"다시 진행":"이 주제 건너뛰기")+'</button></div></div>';
    if(sk){h+='<p class="hint" style="margin-top:8px">부담 신호가 있어 건너뛴 주제입니다. 매핑할 때 이 주제는 근거 없음으로 처리됩니다.</p></div>';return;}
    h+='<p class="hint" style="margin-top:8px">물은 질문 '+ac+'개'+(ac>2?' <span class="chip warn">두 개를 넘었습니다</span>':'')+' · 질문을 누르면 물은 것으로 표시됩니다.</p>'+
    '<div class="qlist">'+t.qs.map(function(q,i){
      return '<button class="q" data-ask="'+t.k+':'+i+'" data-asked="'+((S.asked[t.k]||{})[i]?1:0)+'"><span class="qn">'+t.k+(i+1)+'</span><span>'+esc(q)+'</span></button>';
    }).join("")+'</div>'+
    '<p class="tail">공통 꼬리질문 — 얼마나 오래 하셨어요? / 몇 분이나 되셨어요? / 그중에 무엇을 맡으셨어요? / 제일 어려웠던 건 뭐였어요?</p>'+
    '<hr class="sep">'+
    (fs.length?'<div class="stack" style="gap:8px">'+fs.map(factCard).join("")+'</div><hr class="sep">':'')+
    '<form data-add="'+t.k+'"><div class="stack" style="gap:9px">'+
    '<label class="f">들은 사실 (상담사 정리 문장)<textarea name="summary" rows="2" required placeholder="예: 아파트 입주자대표회의 총무를 맡아 관리비 내역을 확인하고 회의록을 작성했다"></textarea></label>'+
    '<div class="grid4">'+
    '<label class="f">기간<input type="text" name="period" placeholder="3년"></label>'+
    '<label class="f">규모<input type="text" name="scale" placeholder="120세대"></label>'+
    '<label class="f">역할<input type="text" name="role" placeholder="총무"></label>'+
    '<label class="f">난점<input type="text" name="diff" placeholder="민원 중재"></label></div>'+
    '<div class="row" style="justify-content:space-between;align-items:center">'+
    '<label class="check" style="font-size:.82rem"><input type="checkbox" name="sens"><span>민감한 상실 관련 내용 — 출력에 “바로 읽지 마세요” 표시</span></label>'+
    '<button class="btn sm primary" type="submit">사실 추가</button></div></div></form></div>';
  });
  h+='<div class="card flat"><h3>정리</h3><p class="hint" style="margin-top:6px">확인할 항목을 다 채웠거나 상담을 마칠 때, 적어 둔 사실만 가지고 2단계로 넘어갑니다. 기록된 사실 '+S.facts.length+'건.</p>'+
  '<div class="row tight" style="margin-top:10px"><button class="btn sm primary" data-tab="s2">2단계 매핑으로</button>'+
  '<button class="btn sm" data-copy="'+esc(factsText()||"(기록 없음)")+'">정리된 사실 복사</button></div></div>';
  return h;
}
function sl2(sl){return [["period","기간"],["scale","규모"],["role","역할"],["diff","난점"]].map(function(p){
  return '<span class="slot'+(sl[p[0]]?" ok":"")+'">'+p[1]+'</span>';}).join("");}
function fld(k,label,ph){
  return '<label class="f">'+esc(label)+'<input type="text" data-info="'+k+'" value="'+esc(S.info[k])+'" placeholder="'+esc(ph)+'"></label>';}
function factCard(f){
  var bits=[];
  if(f.period)bits.push("기간 "+f.period);
  if(f.scale)bits.push("규모 "+f.scale);
  if(f.role)bits.push("역할 "+f.role);
  if(f.diff)bits.push("난점 "+f.diff);
  var hn=hasHonor(f.summary);
  return '<div class="fact'+(f.sens?" sens":"")+'">'+
  (f.sens?'<span class="badge b-sens">바로 읽지 마세요</span> ':'')+esc(honor(f.summary))+
  '<div class="meta">'+bits.map(function(b){return '<span>'+esc(b)+'</span>';}).join(" · ")+
  (hn?' <span class="chip warn">“'+esc(hn)+'” → 중립 표현으로 바꿔 출력합니다</span>':'')+
  ' <button class="btn sm ghost" data-del="'+f.id+'" style="margin-left:auto">삭제</button></div></div>';
}

/* --- 2단계 --- */
function vS2(){
  var h='<div class="card"><span class="eyebrow">2단계 · 매핑</span><h2 style="margin-top:6px">NCS 직업기초능력 10개 영역에 배치합니다</h2>'+
  '<p class="hint" style="margin-top:6px">진술에 없는 수치나 기간은 보충하지 않습니다. 근거가 없는 영역은 표에서 빠집니다. 판정은 상담사가 고칠 수 있습니다.</p>'+
  '<div class="row" style="margin-top:12px;align-items:center">'+
  (CAP.ask?'<button class="btn primary" id="runMap"'+(S.facts.length?"":" disabled")+'>매핑 실행</button>':'')+
  '<button class="btn" data-copy="prompt:map">프롬프트 복사</button>'+
  (S.mapping?'<button class="btn ghost sm" id="clearMap">결과 지우기</button>':'')+'</div>'+
  (S.facts.length?'':'<p class="hint" style="margin-top:8px">먼저 1단계에서 사실을 적어야 합니다.</p>')+
  '<div id="mapStatus"></div></div>';
  if(!CAP.ask)h+='<div class="card flat"><h3>결과 붙여넣기</h3><p class="hint" style="margin-top:6px">AI 대화창에서 받은 JSON을 그대로 붙여넣으세요.</p>'+
  '<textarea id="pasteMap" rows="4" style="margin-top:8px" placeholder=\'{"rows":[...],"needMore":[...],"excluded":[...]}\'></textarea>'+
  '<button class="btn sm primary" id="applyMap" style="margin-top:8px">결과 적용</button></div>';
  if(S.mapping){
    var rows=S.mapping.rows||[];
    h+='<div class="card"><h3>배치 결과 <span class="badge b-low">'+rows.length+'/10 영역</span></h3>'+
    '<div class="tablewrap"><table><thead><tr><th>영역</th><th>수준</th><th>진술 근거</th><th>확인된 항목</th></tr></thead><tbody>'+
    rows.map(function(r){
      var lv=S.levelOverride[r.area]||r.level;
      return '<tr><td class="area">'+esc(r.area)+'</td><td><select data-lv="'+esc(r.area)+'" style="min-width:92px">'+
      ["상","중","하","판정 불가"].map(function(o){return '<option'+(o===lv?" selected":"")+'>'+o+'</option>';}).join("")+
      '</select></td><td>'+esc(r.evidence||"")+'</td><td>'+
      ((r.basis||[]).map(function(b){return '<span class="slot ok">'+esc(b)+'</span>';}).join(" ")||'<span class="hint">—</span>')+'</td></tr>';
    }).join("")+'</tbody></table></div></div>';
    if((S.mapping.needMore||[]).length)
      h+='<div class="card"><h3>추가 확인 필요</h3><ul class="hint" style="margin:8px 0 0;padding-left:18px">'+
      S.mapping.needMore.map(function(x){return '<li style="margin-bottom:4px">'+esc(x)+'</li>';}).join("")+'</ul>'+
      '<p class="hint" style="margin-top:8px">다음 상담에서 1단계로 돌아가 물어볼 항목입니다.</p>'+
      '<button class="btn sm" data-tab="s1" style="margin-top:8px">1단계로 돌아가기</button></div>';
    if((S.mapping.excluded||[]).length)
      h+='<div class="card flat"><h3>판정 제외</h3><div class="stack" style="gap:6px;margin-top:8px">'+
      S.mapping.excluded.map(function(x){return '<div class="hint"><span class="badge b-na">'+esc(x.area)+'</span> '+esc(x.reason)+'</div>';}).join("")+'</div></div>';
    h+='<div class="row tight" style="margin-top:14px"><button class="btn primary" data-tab="s3">3단계 번역으로</button></div>';
  }
  return h;
}

/* --- 고용24 --- */
function w24Block(){
  var list=S.api.list||[],p=S.api.picked;
  var h='<div class="card"><div class="theme-head"><div><span class="eyebrow">고용24 채용정보</span>'+
  '<h3 style="margin-top:2px">공고를 불러와 아래에 채웁니다</h3></div>'+
  '<button class="btn sm ghost" data-tab="s1">조건 고치기</button></div>'+
  '<div class="summary"><span class="hint">검색 조건</span><span class="chip static">'+esc(condSummary())+'</span></div>';

  if(CAP.work24){
    h+='<div class="row tight" style="margin-top:12px"><button class="btn primary lg" id="w24search">공고 검색</button>'+
    (list.length?'<button class="btn ghost sm" id="w24clear">결과 지우기</button>':'')+'</div>'+
    '<div id="w24status"></div>';
  }else{
    h+='<hr class="sep">'+
    '<label class="f">인증키 (authKey)<input type="password" id="w24key" value="'+esc(S.api.key)+'" placeholder="고용24에서 발급받은 인증키" autocomplete="off"></label>'+
    '<p class="hint" style="margin-top:6px">인증키는 이 브라우저에만 저장됩니다. 주소에 인증키가 섞이니 화면을 공유할 때 조심하세요. '+
    '<a href="'+W24DOC+'" target="_blank" rel="noopener">API 신청 안내</a></p>'+
    '<p class="hint" style="margin-top:10px">① 목록 요청 (callTp=L)</p>'+
    '<div class="row tight" style="margin-top:8px;align-items:flex-start">'+
    '<code class="mono urlbox">'+esc(manualListUrl())+'</code>'+
    '<button class="btn sm" data-copy="'+esc(manualListUrl())+'">복사</button>'+
    (S.api.key?'<a class="btn sm" href="'+esc(manualListUrl())+'" target="_blank" rel="noopener" style="text-decoration:none">열기</a>':'')+'</div>'+
    '<label class="f" style="margin-top:12px">② 받은 응답(XML) 붙여넣기<textarea id="w24list" rows="4" placeholder="&lt;wantedRoot&gt; ... &lt;/wantedRoot&gt;"></textarea></label>'+
    '<div class="row tight" style="margin-top:8px"><button class="btn sm primary" id="w24parse">공고 목록 읽기</button>'+
    (list.length?'<button class="btn sm ghost" id="w24clear">결과 지우기</button>':'')+'</div>';
  }
  h+=(S.api.err?'<div class="errbox" style="margin-top:10px">'+esc(S.api.err)+'</div>':'')+'</div>';

  if(list.length){
    h+='<div class="card"><h3>불러온 공고 <span class="badge b-low">'+list.length+'건</span></h3>'+
    '<div class="tablewrap"><table><thead><tr><th>회사</th><th>채용제목</th><th>임금</th><th>근무지역</th><th>마감</th><th></th></tr></thead><tbody>'+
    list.map(function(o,i){
      return '<tr><td>'+esc(o.company)+'</td><td>'+esc(o.title)+'</td>'+
      '<td>'+esc((o.salTpNm?o.salTpNm+" ":"")+(o.sal||""))+'</td><td>'+esc(o.region)+'</td><td>'+esc(o.closeDt)+'</td>'+
      '<td><button class="btn sm'+(p&&p.i===i?" primary":"")+'" data-pick="'+i+'">'+(p&&p.i===i?"선택됨":"이 공고")+'</button></td></tr>';
    }).join("")+'</tbody></table></div></div>';
  }
  if(p){
    h+='<div class="card"><h3>선택한 공고</h3>'+
    '<p class="hint" style="margin-top:6px">목록에 담긴 항목은 아래 채용공고 칸에 이미 들어갔습니다. 담당업무와 자격요건까지 받으려면 상세를 한 번 더 부릅니다.</p>';
    if(CAP.work24){
      h+='<div class="row tight" style="margin-top:10px"><button class="btn primary" id="w24dtlfetch">상세 불러와 더하기</button>'+
      (p.o.wantedInfoUrl?'<a class="btn sm ghost" href="'+esc(p.o.wantedInfoUrl)+'" target="_blank" rel="noopener" style="text-decoration:none">고용24에서 원문 보기</a>':'')+'</div>'+
      '<div id="w24dtlstatus"></div>';
    }else{
      h+='<p class="hint" style="margin-top:10px">③ 상세 요청 (callTp=D · 구인인증번호 '+esc(p.o.wantedAuthNo||"없음")+')</p>'+
      '<div class="row tight" style="margin-top:8px;align-items:flex-start">'+
      '<code class="mono urlbox">'+esc(manualDtlUrl(p.o.wantedAuthNo))+'</code>'+
      '<button class="btn sm" data-copy="'+esc(manualDtlUrl(p.o.wantedAuthNo))+'">복사</button>'+
      (S.api.key?'<a class="btn sm" href="'+esc(manualDtlUrl(p.o.wantedAuthNo))+'" target="_blank" rel="noopener" style="text-decoration:none">열기</a>':'')+'</div>'+
      '<label class="f" style="margin-top:12px">④ 상세 응답(XML) 붙여넣기<textarea id="w24dtl" rows="4"></textarea></label>'+
      '<div class="row tight" style="margin-top:8px"><button class="btn sm primary" id="w24dtlparse">상세를 공고에 더하기</button>'+
      (p.o.wantedInfoUrl?'<a class="btn sm ghost" href="'+esc(p.o.wantedInfoUrl)+'" target="_blank" rel="noopener" style="text-decoration:none">고용24에서 원문 보기</a>':'')+'</div>';
    }
    h+=(S.api.dtlErr?'<div class="errbox" style="margin-top:10px">'+esc(S.api.dtlErr)+'</div>':'')+'</div>';
  }
  return h;
}

/* --- 3단계 --- */
function vS3(){
  var ready=!!(S.mapping&&(S.mapping.rows||[]).length),hasPost=S.posting.trim().length>30;
  var h='<div class="card"><span class="eyebrow">3단계 · 번역</span><h2 style="margin-top:6px">채용공고의 언어로 옮깁니다</h2>'+
  '<p class="hint" style="margin-top:6px">채용공고가 없으면 진행하지 않습니다. 공고 요건 중 근거로 충족을 주장할 수 없는 항목은 “보완 필요”로 따로 적힙니다.</p>'+
  (ready?'':'<p class="errbox" style="margin-top:10px">2단계 매핑 결과가 없습니다. <button class="btn sm" data-tab="s2" style="margin-left:6px">2단계로</button></p>')+
  '</div>'+w24Block()+
  '<div class="card"><label class="f">채용공고 전문<textarea id="posting" rows="7" placeholder="담당업무, 자격요건, 우대사항을 그대로 붙여넣으세요">'+esc(S.posting)+'</textarea></label>'+
  '<div class="row" style="margin-top:10px;align-items:center">'+
  (CAP.ask?'<button class="btn primary" id="runTrans"'+(ready&&hasPost?"":" disabled")+'>번역 실행</button>':'')+
  '<button class="btn" data-copy="prompt:trans">프롬프트 복사</button>'+
  (S.outputs?'<button class="btn ghost sm" id="clearOut">결과 지우기</button>':'')+'</div><div id="transStatus"></div></div>';
  if(!CAP.ask)h+='<div class="card flat"><h3>결과 붙여넣기</h3>'+
  '<textarea id="pasteOut" rows="4" style="margin-top:8px" placeholder=\'{"resume":[...],"coverLetter":[...],"interview":[...],"crosswalk":[...],"gaps":[...]}\'></textarea>'+
  '<button class="btn sm primary" id="applyOut" style="margin-top:8px">결과 적용</button></div>';

  var o=S.outputs;
  if(o){
    var all=[].concat(o.resume||[],o.coverLetter||[],(o.interview||[]).map(function(x){return x.a;}),(o.crosswalk||[]).map(function(x){return x.claim;}));
    var hits=countFlags(all),hk=Object.keys(hits);
    if(hk.length)h+='<div class="card" style="border-left:3px solid var(--warn)"><h3>표현 점검에서 걸린 말</h3>'+
    '<div class="row tight" style="margin-top:8px">'+hk.map(function(g){
      return '<span class="chip warn">'+esc(g)+": "+esc(hits[g].join(", "))+'</span>';}).join("")+'</div>'+
    '<p class="hint" style="margin-top:8px">아래 산출물에 표시된 말은 상담사가 지우거나 근거 있는 표현으로 바꿔야 합니다.</p></div>';

    h+=outBlock("이력서용 경력기술",(o.resume||[]).map(function(x){return '<li>'+flagHTML(honor(x))+'</li>';}).join(""),(o.resume||[]).join("\n"),true);
    h+=outBlock("자기소개서용 문장",(o.coverLetter||[]).map(function(x){return '<li>'+flagHTML(honor(x))+'</li>';}).join(""),(o.coverLetter||[]).join("\n\n"),true);
    h+=outBlock("면접 답변 (구어체)",(o.interview||[]).map(function(x){
      return '<div class="qa"><div class="qq">'+esc(x.q)+'</div><div class="aa">'+flagHTML(honor(x.a))+'</div></div>';}).join(""),
      (o.interview||[]).map(function(x){return "Q. "+x.q+"\nA. "+x.a;}).join("\n\n"),false);

    h+='<div class="out"><h3>근거 대조표<button class="btn sm ghost" data-copy="'+
      esc((o.crosswalk||[]).map(function(c){return c.req+" | "+c.claim+" | "+c.area+" | "+c.evidence;}).join("\n"))+'">복사</button></h3>'+
    '<div class="tablewrap" style="margin:0;border:0;border-radius:0"><table><thead><tr><th>공고 요건</th><th>주장 문장</th><th>근거 영역</th><th>근거 진술</th></tr></thead><tbody>'+
    (o.crosswalk||[]).map(function(c){
      return '<tr><td>'+esc(c.req)+'</td><td>'+flagHTML(honor(c.claim))+'</td><td class="area">'+esc(c.area)+'</td><td>'+esc(honor(c.evidence))+'</td></tr>';
    }).join("")+'</tbody></table></div></div>';

    if((o.gaps||[]).length)
      h+='<div class="card" style="border-left:3px solid var(--danger)"><h3>보완 필요</h3>'+
      '<p class="hint" style="margin-top:4px">근거로 충족을 주장할 수 없는 요건입니다. 억지로 맞추지 말고 구직자에게 그대로 설명합니다.</p>'+
      '<div class="stack" style="gap:10px;margin-top:10px">'+(o.gaps||[]).map(function(g){
        return '<div><strong style="font-size:.9rem">'+esc(g.req)+'</strong><p class="hint" style="margin-top:2px">'+esc(g.reason)+'</p>'+
        (g.suggestion?'<p style="margin-top:2px;font-size:.84rem">→ '+esc(g.suggestion)+'</p>':'')+'</div>';}).join("")+'</div></div>';

    h+='<div class="row tight" style="margin-top:14px"><button class="btn primary" data-tab="review">검토 체크리스트로</button>'+
    '<button class="btn" data-copy="'+esc(fullText())+'">산출물 전체 복사</button></div>';
  }
  return h;
}
function outBlock(title,inner,raw,isList){
  return '<div class="out"><h3>'+esc(title)+'<button class="btn sm ghost" data-copy="'+esc(raw)+'">복사</button></h3>'+
  '<div class="body">'+(isList?'<ul>'+inner+'</ul>':inner)+'</div></div>';
}
function fullText(){
  var o=S.outputs;if(!o)return"";
  var p=["[이력서용 경력기술]"];
  (o.resume||[]).forEach(function(x){p.push("- "+honor(x));});
  p.push("","[자기소개서용 문장]");(o.coverLetter||[]).forEach(function(x){p.push(honor(x));});
  p.push("","[면접 답변]");(o.interview||[]).forEach(function(x){p.push("Q. "+x.q,"A. "+honor(x.a));});
  p.push("","[근거 대조표]");(o.crosswalk||[]).forEach(function(c){p.push(c.req+" | "+honor(c.claim)+" | "+c.area+" | "+honor(c.evidence));});
  p.push("","[보완 필요]");(o.gaps||[]).forEach(function(g){p.push("- "+g.req+": "+g.reason);});
  return p.join("\n");
}

/* --- 검토 --- */
function vReview(){
  var done=0,total=0;CHECKS.forEach(function(g){g.items.forEach(function(it){total++;if(S.checks[it])done++;});});
  var o=S.outputs;
  var all=o?[].concat(o.resume||[],o.coverLetter||[],(o.interview||[]).map(function(x){return x.a;}),(o.crosswalk||[]).map(function(x){return x.claim;})):[];
  var hits=countFlags(all),hk=Object.keys(hits);
  var honorLeft=S.facts.map(function(f){return hasHonor(f.summary);}).filter(Boolean);
  var h='<div class="card"><span class="eyebrow">전달 전 검토</span><h2 style="margin-top:6px">상담사가 확인한 뒤에 전달합니다</h2>'+
  '<p class="hint" style="margin-top:6px">AI 산출물을 구직자에게 그대로 전달하지 마십시오. 사실과 표현의 책임은 상담사에게 있습니다.</p>'+
  '<div class="progress"><i style="width:'+(total?Math.round(done/total*100):0)+'%"></i></div>'+
  '<p class="hint" style="margin-top:6px;font-variant-numeric:tabular-nums">'+done+' / '+total+' 확인</p></div>'+
  '<div class="card"><h3>자동 점검</h3><div class="stack" style="gap:8px;margin-top:10px">'+
  (o?(hk.length?'<div class="errbox"><strong>표현 점검:</strong> '+hk.map(function(g){return esc(g)+"("+esc(hits[g].join(", "))+")";}).join(" · ")+' — 산출물에서 고쳐야 합니다.</div>'
     :'<div class="okbox">금지 표현 목록에 걸린 말이 없습니다. 그래도 문장은 직접 읽어 확인하세요.</div>')
   :'<p class="hint">3단계 산출물이 아직 없습니다.</p>')+
  (honorLeft.length?'<div class="errbox"><strong>가족 호칭:</strong> '+esc(honorLeft.join(", "))+' — 출력에서는 중립 표현으로 바뀌지만, 기록 문장도 정리해 두세요.</div>':'')+
  '</div></div>';
  CHECKS.forEach(function(g){
    h+='<div class="card"><h3>'+esc(g.g)+'</h3><div style="margin-top:6px">'+g.items.map(function(it){
      return '<label class="check"><input type="checkbox" data-check="'+esc(it)+'"'+(S.checks[it]?" checked":"")+'><span>'+esc(it)+'</span></label>';
    }).join("")+'</div></div>';
  });
  h+=(done===total&&total>0
    ?'<div class="okbox" style="margin-top:14px"><strong>전달 준비 완료.</strong> 구직자와 함께 소리 내어 읽으면서 “보완 필요” 항목을 설명하세요.</div>'
    :'<div class="card flat" style="margin-top:14px"><p class="hint">남은 항목을 확인하면 전달 준비가 끝납니다.</p></div>')+
  '<div class="row tight" style="margin-top:12px"><button class="btn" data-copy="'+esc(fullText()||"(산출물 없음)")+'">산출물 전체 복사</button>'+
  '<button class="btn ghost sm" id="resetChecks">체크 지우기</button></div>';
  return h;
}

/* --- 역할극 · 질문뱅크 --- */
function vCards(){
  return '<div class="card"><span class="eyebrow">시연 · 연습</span><h2 style="margin-top:6px">역할극 카드 6종</h2>'+
  '<p class="hint" style="margin-top:6px">구직자 역을 맡은 사람이 카드를 하나 골라 연기합니다. “드러나지 않은 경험”은 상담사가 구체적으로 물을 때만 꺼냅니다. 모두 연습용으로 만든 가상 인물입니다.</p></div>'+
  '<div class="grid2" style="margin-top:14px">'+CARDS.map(function(c,i){
    return '<div class="rcard"><div class="rtitle">'+esc(c.t)+'</div>'+
    '<div class="row tight"><span class="chip static">'+esc(c.age)+'</span><span class="chip static">공백 '+esc(c.gap)+'</span><span class="chip static on">'+esc(c.type)+'</span></div>'+
    '<div class="hint">희망 직무 '+esc(c.job)+' · 자격증 '+esc(c.cert)+'</div>'+
    (c.sens?'<div class="rhidden" style="background:var(--danger-soft);border-color:var(--danger)"><strong>바로 읽지 마세요</strong> — '+esc(c.sens)+'</div>':'')+
    '<div class="rhidden"><strong>드러나지 않은 경험</strong><br>'+esc(c.hidden)+'</div>'+
    '<div class="row tight"><button class="btn sm primary" data-card="'+i+'">기본정보 불러오기</button>'+
    '<button class="btn sm ghost" data-copy="'+esc(c.age+" / 공백 "+c.gap+" / "+c.type+" / 희망 "+c.job+" / 자격 "+c.cert)+'">기본정보 복사</button></div></div>';
  }).join("")+'</div>';
}
function vBank(){
  var all=THEMES.map(function(t){return "["+t.k+" "+t.name+" · "+t.ncs+"]\n"+t.qs.map(function(q,i){return t.k+(i+1)+". "+q;}).join("\n");}).join("\n\n")+"\n\n공통 꼬리질문: 기간 / 규모 / 역할 / 난점";
  var h='<div class="card"><span class="eyebrow">인출 질문뱅크</span><h2 style="margin-top:6px">생활 용어로 쓴 30문항</h2>'+
  '<p class="hint" style="margin-top:6px">NCS 하위요소에서 끌어왔지만 생활 용어로 적었습니다. AI 없이 종이에 적어 써도 됩니다. 공통 꼬리질문은 기간·규모·역할·난점입니다.</p>'+
  '<button class="btn sm" style="margin-top:10px" data-copy="'+esc(all)+'">30문항 전체 복사</button></div>';
  THEMES.forEach(function(t){
    h+='<div class="card"><div class="theme-head"><div><span class="eyebrow">'+t.k+' · '+esc(t.ncs)+'</span><h3 style="margin-top:2px">'+esc(t.name)+'</h3></div></div>'+
    '<div class="qlist">'+t.qs.map(function(q,i){
      return '<div class="q" style="cursor:default"><span class="qn">'+t.k+(i+1)+'</span><span>'+esc(q)+'</span></div>';}).join("")+'</div></div>';
  });
  return h;
}

/* ---------------- 이벤트 ---------------- */
document.addEventListener("click",function(e){
  var t=e.target.closest("[data-tab]");
  if(t){S.tab=t.dataset.tab;render(true);return;}
  var c=e.target.closest("[data-copy]");
  if(c){var v=c.dataset.copy;copy(v==="prompt:map"?mapPrompt():v==="prompt:trans"?transPrompt():v,c);return;}
});
document.addEventListener("input",function(e){
  var i=e.target.closest("[data-info]");
  if(i){S.info[i.dataset.info]=i.value;save();return;}
  var cd=e.target.closest("[data-cond]");
  if(cd&&cd.tagName!=="SELECT"){S.cond[cd.dataset.cond]=cd.value;save();refreshCond();return;}
  if(e.target.id==="w24key"){S.api.key=e.target.value;save();return;}
  if(e.target.id==="posting"){S.posting=e.target.value;save();
    var b=document.getElementById("runTrans");
    if(b)b.disabled=!(S.mapping&&(S.mapping.rows||[]).length&&S.posting.trim().length>30);
    return;}
});
document.addEventListener("change",function(e){
  var ch=e.target.closest("[data-check]");
  if(ch){S.checks[ch.dataset.check]=ch.checked;save();render();return;}
  var lv=e.target.closest("[data-lv]");
  if(lv){S.levelOverride[lv.dataset.lv]=lv.value;save();return;}
  var cs=e.target.closest("select[data-cond]");
  if(cs){
    S.cond[cs.dataset.cond]=cs.value;
    if(cs.dataset.cond==="job1")S.cond.job2="";
    render();return;}
  var ct=e.target.closest("input[data-cond]");
  if(ct){S.cond[ct.dataset.cond]=ct.value;save();refreshCond();return;}
  if(e.target.id==="w24key"){S.api.key=e.target.value;render();return;}
});
document.addEventListener("submit",function(e){
  var f=e.target.closest("[data-add]");
  if(!f)return;
  e.preventDefault();
  var d=new FormData(f),sum=(d.get("summary")||"").trim();
  if(!sum)return;
  S.facts.push({id:uid(),theme:f.dataset.add,summary:sum,period:(d.get("period")||"").trim(),
    scale:(d.get("scale")||"").trim(),role:(d.get("role")||"").trim(),diff:(d.get("diff")||"").trim(),
    sens:!!d.get("sens")});
  save();render();
});
document.addEventListener("click",async function(e){
  var r=e.target.closest("[data-round]");
  if(r){S.round=+r.dataset.round;render();return;}
  var sd=e.target.closest("[data-sido]");
  if(sd){var v=sd.dataset.sido;S.cond.sido=(S.cond.sido===v?"":v);S.cond.sigungu="";render();return;}
  var st=e.target.closest("[data-saltp]");
  if(st){S.cond.salTp=st.dataset.saltp;if(!S.cond.salTp){S.cond.minPay="";S.cond.maxPay="";}render();return;}
  if(e.target.id==="condClear"){
    S.cond={sido:"",sigungu:"",job1:"",job2:"",salTp:"",minPay:"",maxPay:"",keyword:""};render();return;}
  var sk=e.target.closest("[data-skip]");
  if(sk){S.skip[sk.dataset.skip]=!S.skip[sk.dataset.skip];render();return;}
  var ak=e.target.closest("[data-ask]");
  if(ak){var pp=ak.dataset.ask.split(":");S.asked[pp[0]]=S.asked[pp[0]]||{};
    S.asked[pp[0]][pp[1]]=!S.asked[pp[0]][pp[1]];render();return;}
  var dl=e.target.closest("[data-del]");
  if(dl){S.facts=S.facts.filter(function(f){return f.id!==dl.dataset.del;});render();return;}
  var cd=e.target.closest("[data-card]");
  if(cd){var cc=CARDS[+cd.dataset.card];S.info={age:cc.age,gap:cc.gap,job:cc.job,cert:cc.cert};S.tab="s1";render(true);return;}
  if(e.target.id==="themeBtn"){
    var cur=document.documentElement.getAttribute("data-theme");
    var next=cur==="dark"?"light":cur==="light"?"":"dark";
    if(next)document.documentElement.setAttribute("data-theme",next);
    else document.documentElement.removeAttribute("data-theme");
    try{localStorage.setItem("ct-theme",next);}catch(err){}
    return;}
  if(e.target.id==="resetChecks"){S.checks={};render();return;}
  if(e.target.id==="clearMap"){S.mapping=null;S.levelOverride={};render();return;}
  if(e.target.id==="clearOut"){S.outputs=null;render();return;}
  if(e.target.id==="restoreBtn"){
    var rb=document.getElementById("restoreBox");
    try{
      var o=JSON.parse(rb.value.trim()),k=S.api.key;
      if(!o||typeof o!=="object"||!("facts" in o))throw 0;
      for(var kk in o)S[kk]=o[kk];
      S.api=S.api||{key:"",list:[],picked:null,err:"",dtlErr:""};S.api.key=k;
      save();render();
    }catch(err){rb.style.borderColor="var(--danger)";e.target.textContent="읽지 못했습니다";}
    return;}
  if(e.target.id==="resetAll"){
    var btn=e.target;
    if(!btn.dataset.sure){btn.dataset.sure="1";btn.textContent="한 번 더 누르면 지워집니다";
      setTimeout(function(){delete btn.dataset.sure;btn.textContent="상담 기록 전체 지우기";},4000);return;}
    S={info:{age:"",gap:"",job:"",cert:""},asked:{},skip:{},facts:[],round:1,mapping:null,levelOverride:{},
      posting:"",outputs:null,checks:{},tab:"guide",
      cond:{sido:"",sigungu:"",job1:"",job2:"",salTp:"",minPay:"",maxPay:"",keyword:""},
      api:{key:"",list:[],picked:null,err:"",dtlErr:""}};
    save();render(true);btn.textContent="상담 기록 전체 지우기";delete btn.dataset.sure;return;}
  if(e.target.id==="applyMap"||e.target.id==="applyOut"){
    var ta=document.getElementById(e.target.id==="applyMap"?"pasteMap":"pasteOut");
    try{
      var obj=looseJSON(ta.value);
      if(e.target.id==="applyMap"){S.mapping=obj;S.levelOverride={};}else S.outputs=obj;
      render();
    }catch(err2){ta.style.borderColor="var(--danger)";e.target.textContent="JSON을 읽지 못했습니다";}
    return;}

  /* 고용24 */
  if(e.target.id==="w24search"){
    var sb=e.target,ss=document.getElementById("w24status");
    if(payIncomplete()){S.api.err="급여 조건의 최소·최대를 모두 채우거나, 임금형태를 관계없음으로 두세요.";render();return;}
    sb.disabled=true;sb.innerHTML='<span class="spin"></span> 찾는 중';
    ss.innerHTML='<p class="hint" style="margin-top:10px">고용24에서 공고를 가져오고 있습니다.</p>';
    try{
      var xml=await fetchWork24(searchParams());
      S.api.list=parseWantedList(xml);S.api.picked=null;S.api.err="";
    }catch(err3){S.api.list=[];S.api.err=(err3&&err3.message)||"불러오지 못했습니다.";}
    render();return;}
  if(e.target.id==="w24parse"){
    var tl=document.getElementById("w24list");
    try{S.api.list=parseWantedList(tl.value);S.api.picked=null;S.api.err="";}
    catch(err4){S.api.list=[];S.api.err=(err4&&err4.message)||"읽지 못했습니다.";}
    render();return;}
  if(e.target.id==="w24clear"){S.api.list=[];S.api.picked=null;S.api.err="";render();return;}
  var pk=e.target.closest("[data-pick]");
  if(pk){
    var po=S.api.list[+pk.dataset.pick];
    S.api.picked={i:+pk.dataset.pick,o:po};S.api.dtlErr="";
    S.posting=postingFromList(po);S.outputs=null;render();return;}
  if(e.target.id==="w24dtlfetch"){
    var db=e.target,ds=document.getElementById("w24dtlstatus");
    db.disabled=true;db.innerHTML='<span class="spin"></span> 불러오는 중';
    ds.innerHTML='<p class="hint" style="margin-top:10px">상세 내용을 가져오고 있습니다.</p>';
    try{
      var dxml=await fetchWork24({callTp:"D",returnType:"XML",infoSvc:"VALIDATION",wantedAuthNo:S.api.picked.o.wantedAuthNo});
      var dd=xmlDoc(dxml),lines=leafLines(dd.documentElement);
      if(!lines.length)throw{message:"상세에 읽을 내용이 없습니다."};
      S.posting=(S.posting?S.posting+"\n\n":"")+"[상세]\n"+lines.join("\n");S.api.dtlErr="";
    }catch(err5){S.api.dtlErr=(err5&&err5.message)||"불러오지 못했습니다.";}
    render();return;}
  if(e.target.id==="w24dtlparse"){
    var td=document.getElementById("w24dtl");
    try{
      var d2=xmlDoc(td.value),l2=leafLines(d2.documentElement);
      if(!l2.length)throw{message:"읽을 내용이 없습니다."};
      S.posting=(S.posting?S.posting+"\n\n":"")+"[상세]\n"+l2.join("\n");S.api.dtlErr="";
    }catch(err6){S.api.dtlErr=(err6&&err6.message)||"읽지 못했습니다.";}
    render();return;}

  /* AI */
  if(e.target.id==="runMap"){
    var mb=e.target,ms=document.getElementById("mapStatus");
    mb.disabled=true;mb.innerHTML='<span class="spin"></span> 매핑 중';
    ms.innerHTML='<p class="hint" style="margin-top:10px">진술을 10개 영역에 배치하고 있습니다.</p>';
    try{
      var res=await askAI(mapPrompt());
      if(!res||!res.rows)throw{message:"형식이 맞지 않는 응답을 받았습니다."};
      S.mapping=res;S.levelOverride={};render();
    }catch(err7){
      mb.disabled=false;mb.textContent="매핑 실행";
      ms.innerHTML='<div class="errbox" style="margin-top:10px">'+esc((err7&&err7.message)||"실행하지 못했습니다.")+' 프롬프트를 복사해 AI 대화창에서 실행할 수도 있습니다.</div>';
    }
    return;}
  if(e.target.id==="runTrans"){
    var tb=e.target,ts=document.getElementById("transStatus");
    tb.disabled=true;tb.innerHTML='<span class="spin"></span> 번역 중';
    ts.innerHTML='<p class="hint" style="margin-top:10px">공고 요건과 근거를 대조하고 있습니다.</p>';
    try{
      var r2=await askAI(transPrompt());
      if(!r2||!r2.resume)throw{message:"형식이 맞지 않는 응답을 받았습니다."};
      S.outputs=r2;render();
    }catch(err8){
      tb.disabled=false;tb.textContent="번역 실행";
      ts.innerHTML='<div class="errbox" style="margin-top:10px">'+esc((err8&&err8.message)||"실행하지 못했습니다.")+' 프롬프트를 복사해 AI 대화창에서 실행할 수도 있습니다.</div>';
    }
    return;}
});
window.addEventListener("scroll",function(){
  var h=document.querySelector("header.top");
  if(h)h.classList.toggle("compact",window.scrollY>90);
},{passive:true});

/* ---------------- 시작 ---------------- */
(function initTheme(){
  try{var t=localStorage.getItem("ct-theme");if(t)document.documentElement.setAttribute("data-theme",t);}catch(e){}
})();
render();
(async function init(){
  try{
    var res=await Promise.all([
      fetch("data/region.json").then(function(r){return r.ok?r.json():[];}).catch(function(){return [];}),
      fetch("data/jobs.json").then(function(r){return r.ok?r.json():[];}).catch(function(){return [];}),
      detectCapabilities()
    ]);
    REGIONS=res[0]||[];JOBS=res[1]||[];CAP=res[2];
  }catch(e){}
  READY=true;render();
})();
})();
