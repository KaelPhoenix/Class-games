import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const html=fs.readFileSync(new URL('../grade8/index.html',import.meta.url),'utf8');
function game(){
 const elements=new Map();
 const get=id=>{
  if(!elements.has(id))elements.set(id,{id,style:{},dataset:{},classList:{add(){},remove(){},toggle(){},contains(){return false}},getContext(){return {}},append(){},addEventListener(){},setAttribute(){},focus(){},innerHTML:'',textContent:''});
  return elements.get(id);
 };
 const storage=new Map();
 const context=vm.createContext({window:{addEventListener(){},matchMedia(){return {matches:true,addEventListener(){}}}},document:{getElementById:get,querySelectorAll(){return []},addEventListener(){},body:{classList:{add(){},remove(){}}}},innerWidth:1280,innerHeight:800,requestAnimationFrame(){return 1},localStorage:{getItem:key=>storage.get(key)||null,setItem:(key,value)=>storage.set(key,value)},setTimeout(){},console});
 for(const script of html.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/gi))vm.runInContext(script[1],context);
 return {get,run:source=>vm.runInContext(source,context)};
}
test('grade8: latest four lessons are the default for review, counts and guide',()=>{
 const g=game();
 assert.equal(g.run('lessonScope'),'recent');
 assert.match(html,/<option value="recent" selected>/);
 assert.equal(g.run('lessonBank(vocab).length'),57);
 assert.equal(g.run('lessonBank(sentences).length'),50);
 assert.equal(g.run('[...new Set(lessonBank([...vocab,...sentences]).map(x=>x.lesson))].join(",")'),'6,7,8,9');
 g.run("changeLesson('recent')");
 assert.equal(g.get('selected-scope-count').textContent,'57 个词 · 50 组表达');
 assert.match(g.get('preview-grid').innerHTML,/./);
 g.run('setGuideLesson(guideLesson)');
 assert.equal(g.run('guideLesson'),9);
 assert(g.run('weeklyDeck.every(item=>item.lesson===9)'));
});
test('grade8: ordinary, word, sentence and order bosses stay in scope even with old reviews',()=>{
 const g=game();
 g.run("recordLearning(vocab[0],false); learningTurn=100; questionsSinceReview=2");
 for(const mode of ['mixed','words','sentences','order']){
  g.run(`isBossPhase=${mode!=='mixed'};bossType=${JSON.stringify(mode)};gameScope='mixed';currentQuestion=Object.create(null)`);
  for(let i=0;i<100;i++){
   for(const side of mode==='mixed'?['center']:['left','right']){
    assert(g.run(`{const q=nextQuestion('${side}');currentQuestion.${side}=q;RECENT_LESSONS.includes(q.lesson)}`));
   }
   if(mode!=='mixed')assert(g.run('currentQuestion.left!==currentQuestion.right'));
  }
 }
});
test('grade8: existing single, cumulative and all-lesson choices work and clear stale bags',()=>{
 const g=game();
 for(const scope of ['1','9','upto-4','all','recent']){
  g.run(`questionBags.stale=[vocab[0]];changeLesson(${JSON.stringify(scope)})`);
  assert.equal(g.run('Object.keys(questionBags).length'),0);
  assert(g.run("lessonBank(vocab).every(item=>lessonScope==='all'||lessonScope==='recent'?lessonScope==='all'||RECENT_LESSONS.includes(item.lesson):lessonScope.startsWith('upto-')?item.lesson<=Number(lessonScope.slice(5)):item.lesson===Number(lessonScope))"));
 }
 g.run("changeLesson('unknown')");assert.equal(g.run('lessonScope'),'recent');
});
