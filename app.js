const KEY="shadowbound_v1";
let state=JSON.parse(localStorage.getItem(KEY)||"null");
let pendingAction=null;
const $=id=>document.getElementById(id);
const classes={
 Warrior:{str:4,dex:1,int:0,wis:1,cha:0,hp:120},
 Rogue:{str:1,dex:4,int:1,wis:1,cha:0,hp:90},
 Mage:{str:0,dex:1,int:4,wis:2,cha:0,hp:75},
 Ranger:{str:2,dex:3,int:1,wis:2,cha:0,hp:100}
};
const intro="The moon hangs over the ruined village as you reach the Broken Crypt. The iron gate is half open. From somewhere below, you hear a slow scrape... then silence.";
function save(){localStorage.setItem(KEY,JSON.stringify(state));render()}
function newGame(){
 state=null; localStorage.removeItem(KEY); $("setup").classList.remove("hidden"); $("game").classList.add("hidden");
}
function start(){
 const name=$("name").value.trim()||"Nameless";
 const cls=$("class").value, c=classes[cls];
 state={name,cls,background:$("background").value,level:1,xp:0,hp:c.hp,maxHp:c.hp,gold:25,stats:{str:c.str,dex:c.dex,int:c.int,wis:c.wis,cha:c.cha},inventory:["Rusty Sword","Traveler's Cloak","3× Healing Herb"],log:[],story:intro};
 $("setup").classList.add("hidden"); $("game").classList.remove("hidden"); save();
}
function mod(v){return Math.floor((v-1)/2)}
function roll(){
 const n=Math.floor(Math.random()*20)+1;
 $("diceFace").textContent=n;
 if(pendingAction) resolve(pendingAction,n);
 pendingAction=null;
}
function check(action){
 pendingAction=action;
 $("diceResult").textContent="Roll the D20...";
 roll();
}
function addLog(t){state.log.unshift(t);state.log=state.log.slice(0,4)}
function resolve(action,n){
 let key=action==="attack"?"str":action==="explore"?"dex":"cha";
 const total=n+mod(state.stats[key]+1);
 let text="";
 if(action==="attack"){
   if(n===20){text="Critical hit! Your blade tears through the shadow creature.";state.xp+=35}
   else if(total>=12){text="Hit! The creature staggers backward into the darkness.";state.xp+=20}
   else{text="Miss! The creature slips away before you can strike."}
 }else if(action==="explore"){
   if(total>=12){text="You discover a silver key hidden beneath a loose stone."; if(!state.inventory.includes("Silver Crypt Key"))state.inventory.push("Silver Crypt Key");state.xp+=20}
   else{text="You search carefully but find only dust and old bones."}
 }else{
   if(total>=12){text="The hooded stranger lowers their weapon and whispers: 'The crypt is not empty.'";state.xp+=15}
   else{text="The stranger refuses to speak and disappears into the fog."}
 }
 if(action==="rest"){
   state.hp=Math.min(state.maxHp,state.hp+25);text="You make a small fire and recover 25 HP."
 }
 if(n) $("diceResult").textContent=`${n} + ${mod(state.stats[key]+1)} = ${total} — ${total>=12?"SUCCESS":"FAILURE"}`;
 else $("diceResult").textContent=text;
 state.story=text; addLog(text);
 if(state.xp>=100){state.level++;state.xp-=100;state.maxHp+=10;state.hp=state.maxHp;addLog(`Level up! You are now level ${state.level}.`)}
 save();
}
function action(a){
 if(a==="rest") return resolve("rest");
 if(a==="attack"||a==="explore"||a==="talk") check(a);
}
function render(){
 if(!state)return;
 $("heroName").textContent=state.name;
 $("heroMeta").textContent=`Level ${state.level} ${state.cls} • ${state.background} • ${state.gold} gold`;
 $("hpText").textContent=`${state.hp}/${state.maxHp}`;
 $("xpText").textContent=`${state.xp}/100`;
 $("hpBar").style.width=(state.hp/state.maxHp*100)+"%";
 $("xpBar").style.width=(state.xp)+"%";
 $("narrative").textContent=state.story;
 $("log").innerHTML=state.log.map(x=>`<div>• ${x}</div>`).join("");
 $("stats").innerHTML=Object.entries(state.stats).map(([k,v])=>`<div class="stat"><span>${k.toUpperCase()}</span><b>${v+1}</b></div>`).join("")+
 `<div class="stat"><span>LEVEL</span><b>${state.level}</b></div><div class="stat"><span>GOLD</span><b>${state.gold}</b></div>`;
 $("inventory").innerHTML=state.inventory.map(x=>`<div class="item">🎒 <b>${x}</b></div>`).join("");
}
$("startBtn").onclick=start;$("resetBtn").onclick=newGame;$("rollBtn").onclick=()=>roll();
document.querySelectorAll(".actions button").forEach(b=>b.onclick=()=>action(b.dataset.action));
document.querySelectorAll(".tab").forEach(b=>b.onclick=()=>{
 document.querySelectorAll(".tab").forEach(x=>x.classList.remove("active"));b.classList.add("active");
 document.querySelectorAll(".tabPanel").forEach(x=>x.classList.add("hidden"));
 $(b.dataset.tab+"Tab").classList.remove("hidden");
});
if(state){$("setup").classList.add("hidden");$("game").classList.remove("hidden");render()}
