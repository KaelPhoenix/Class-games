import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import vm from 'node:vm';
import {createAppServer} from '../scripts/serve.mjs';
import provenance from '../docs/legacy-source-provenance.json' with {type:'json'};
function element(){
 const classes=new Set(),children=[];
 return {dataset:new Proxy({}, {set:(obj,key,value)=>(obj[key]=String(value),true)}),style:{},children,
 classList:{add:(...values)=>values.forEach(v=>classes.add(v)),remove:(...values)=>values.forEach(v=>classes.delete(v)),contains:v=>classes.has(v),toggle:v=>classes.has(v)?classes.delete(v):classes.add(v)},
 set innerHTML(value){children.length=0;this.html=value},get innerHTML(){return this.html||''},
 appendChild(child){children.push(child)},addEventListener(){},innerText:'',textContent:''};
}
async function game(id, random=()=>0.9){
 const html=await readFile(new URL('../legacy/'+id+'/index.html',import.meta.url),'utf8'),elements=new Map(),timeouts=[],intervals=[];
 const get=id=>{if(!elements.has(id))elements.set(id,element());return elements.get(id)};
 const holes=[...html.matchAll(/id="(mole\d+)"/g)].map(m=>get(m[1]));
 const context=vm.createContext({document:{getElementById:get,querySelectorAll:selector=>selector==='.mole'?holes:selector==='.btn-opt'?get('optionsContainer').children:[],createElement:element},
 setInterval:callback=>(intervals.push(callback),intervals.length),clearInterval(){},setTimeout:callback=>(timeouts.push(callback),timeouts.length),
 Math:Object.assign(Object.create(Math),{random})});
 for(const script of html.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/gi))vm.runInContext(script[1],context);
 return {html,context,get,holes,timeouts,intervals,read:expression=>vm.runInContext(expression,context)};
}
for(const source of provenance.apps){
 test(source.app+': complete source size, scripts and absence of roster/network dependencies',async()=>{
  const bytes=await readFile(new URL('../'+source.path,import.meta.url)),html=bytes.toString('utf8');
  assert.equal(bytes.length,source.source_size_bytes);
  assert.match(html,/<\/html>\s*$/i);
  assert.doesNotMatch(html,/<script[^>]+src=|https?:\/\/|\b(?:studentNames|ROSTER|studentList)\s*=/i);
  const scripts=[...html.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/gi)];assert(scripts.length>0);
  for(const script of scripts)new vm.Script(script[1]);
 });
 test(source.app+': standalone HTTP serves the original teaching application',async t=>{
  const server=await createAppServer(fileURLToPath(new URL('../legacy/'+source.app+'/',import.meta.url)));
  await new Promise((resolve,reject)=>{server.once('error',reject);server.listen(0,'127.0.0.1',resolve)});
  t.after(()=>new Promise(resolve=>server.close(resolve)));
  const response=await fetch('http://127.0.0.1:'+server.address().port+'/');
  assert.equal(response.status,200);
  assert.equal(await response.text(),await readFile(new URL('../'+source.path,import.meta.url),'utf8'));
 });
}
test('word mole: correct/wrong hits, duplicate-click guard, timer and end state use the real source',async()=>{
 const g=await game('word-mole');g.context.startGame();g.context.startGame();
 assert.equal(g.intervals.length,1);assert.equal(g.read('isPlaying'),true);assert.equal(g.read('time'),30);
 const index=g.holes.findIndex(h=>h.classList.contains('up'));assert(index>=0);
 g.context.whack(index);assert.equal(g.read('score'),10);
 g.context.whack(index);assert.equal(g.read('score'),10);
 g.holes[index].dataset.isCorrect='false';g.holes[index].classList.add('up');
 g.context.whack(index);assert.equal(g.read('score'),5);
 for(let second=0;second<30;second++)g.intervals[0]();
 assert.equal(g.read('time'),0);assert.equal(g.read('isPlaying'),false);
 assert(g.holes.every(h=>!h.classList.contains('up')));
 g.context.whack(index);assert.equal(g.read('score'),5);
});
test('word match: mismatches reset, six real pairs complete once and matched cards cannot score again',async()=>{
 const g=await game('word-match');g.context.initGame();
 const left=g.get('colLeft').children,right=g.get('colRight').children;
 assert.equal(left.length,6);assert.equal(right.length,6);
 g.context.selectCard(left[0]);g.context.selectCard(right.find(c=>c.dataset.id!==left[0].dataset.id));
 assert.equal(g.read('matchedCount'),0);assert.equal(g.timeouts.length,1);g.timeouts.shift()();
 assert(!left[0].classList.contains('selected'));
 for(const card of left){g.context.selectCard(card);g.context.selectCard(right.find(c=>c.dataset.id===card.dataset.id))}
 assert.equal(g.read('matchedCount'),6);assert.match(g.get('statusText').innerText,/全部完成/);
 g.context.selectCard(left[0]);assert.equal(g.read('matchedCount'),6);
});

test('word flip: twelve cards, self-click guard, mismatches unlock and pairs match',async()=>{
 const g=await game('word-flip'),cards=g.get('gameBoard').children;
 assert.equal(cards.length,12);
 const first=cards[0],wrong=cards.find(c=>c.dataset.id!==first.dataset.id);
 g.context.flipCard.call(first);g.context.flipCard.call(first);
 assert.equal(g.read('lockBoard'),false);
 g.context.flipCard.call(wrong);assert.equal(g.read('lockBoard'),true);
 g.timeouts.shift()();assert.equal(g.read('lockBoard'),false);assert(!first.classList.contains('flipped'));
 const pair=cards.find(c=>c!==first&&c.dataset.id===first.dataset.id);
 g.context.flipCard.call(first);g.context.flipCard.call(pair);g.timeouts.shift()();
 assert(first.classList.contains('matched'));assert(pair.classList.contains('matched'));assert.equal(g.read('lockBoard'),false);
});
test('speed challenge: original answer handlers enforce one score, wrong answers and timeout',async()=>{
 let randomValue=0;
 const g=await game('speed-challenge',()=>randomValue=(randomValue+0.19)%1);
 g.context.startGame();
 let correct=g.read('data').find(row=>row.zh===g.get('qZh').innerText),buttons=g.get('optionsContainer').children;
 assert.equal(buttons.length,3);
 const right=buttons.find(b=>b.innerHTML.includes(correct.ar));right.onclick();right.onclick();
 assert.equal(g.read('score'),20);assert.equal(g.read('isAnswered'),true);assert.equal(g.get('noteBox').style.display,'block');
 g.context.nextQuestion();correct=g.read('data').find(row=>row.zh===g.get('qZh').innerText);buttons=g.get('optionsContainer').children;
 buttons.find(b=>!b.innerHTML.includes(correct.ar)).onclick();assert.equal(g.read('score'),20);
 g.context.nextQuestion();for(let tick=0;tick<100;tick++)g.intervals.at(-1)();
 assert.equal(g.read('timeLeft'),0);assert.equal(g.read('isAnswered'),true);assert.equal(g.read('score'),20);
});
