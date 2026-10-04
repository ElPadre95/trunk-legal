/* Trunk — le site : les comportements.
   Les textes restent dans la page (une page par langue) ; ce script ne fait que
   les animer. Tout s'arrête si l'utilisateur a demandé moins d'animations. */
(function(){
  'use strict';
  window.trunkSite=true;
  var doc=document.documentElement, body=document.body, NS='http://www.w3.org/2000/svg';
  doc.classList.add('js');
  var calme=matchMedia('(prefers-reduced-motion: reduce)').matches;
  var grand=matchMedia('(min-width: 900px)'), souris=matchMedia('(hover: hover) and (pointer: fine)');
  function borne(v){ return Math.max(0,Math.min(1,v)); }
  function navH(){ return document.getElementById('nav').getBoundingClientRect().height; }
  function icone(nom,classe){ var s=document.createElementNS(NS,'svg'); s.setAttribute('viewBox','0 0 24 24'); if(classe) s.setAttribute('class',classe);
    s.setAttribute('aria-hidden','true'); var u=document.createElementNS(NS,'use'); u.setAttribute('href','#i-'+nom); s.appendChild(u); return s; }

  /* ── 0. Le haut de page et le slogan, à choisir (?haut=1|2|3, ?slogan=1|2|3) ── */
  var q=new URLSearchParams(location.search);
  var haut=/^[123]$/.test(q.get('haut')||'')? q.get('haut') : '1';
  body.setAttribute('data-haut',haut);
  var slogan=document.getElementById('slogan');
  try{ var liste=JSON.parse(slogan.getAttribute('data-slogans')), ks=parseInt(q.get('slogan')||'1',10)-1; if(liste[ks]) slogan.textContent=liste[ks]; }catch(e){}
  var plaques=/^(plat|3d|legendes)$/.test(q.get('plaques')||'')? q.get('plaques') : 'legendes';
  body.setAttribute('data-plaques',plaques);
  var compo=document.getElementById('composition'), inter=document.getElementById('interlude'), scene=document.getElementById('scene');
  if(haut!=='3'){ inter.querySelector('.w').appendChild(compo); inter.hidden=false; }

  /* ── 1. Les apparitions au défilement ── */
  var aVoir=[].slice.call(document.querySelectorAll('.apparait'));
  if(calme||!('IntersectionObserver' in window)) aVoir.forEach(function(e){ e.classList.add('vu'); });
  else{ var io=new IntersectionObserver(function(es){ es.forEach(function(e){ if(e.isIntersecting){ e.target.classList.add('vu'); io.unobserve(e.target); } }); },
      {rootMargin:'0px 0px -8% 0px',threshold:.12}); aVoir.forEach(function(e){ io.observe(e); }); }

  /* ── 2. La lueur dorée qui suit la souris, derrière le verre ── */
  if(!calme&&souris.matches){
    var lueur=document.createElement('div'); lueur.className='lueur'; lueur.setAttribute('aria-hidden','true');
    var fond=document.querySelector('.lumiere'); fond.parentNode.insertBefore(lueur,fond.nextSibling);
    var lx=0, ly=0, lp=false;
    addEventListener('pointermove',function(e){ lx=e.clientX; ly=e.clientY;
      var c=e.target.closest&&e.target.closest('.verre,.tel,.chaine,.fn,.vis'); lueur.classList.toggle('on',!!c);
      if(!lp){ lp=true; requestAnimationFrame(function(){ lp=false; lueur.style.transform='translate3d('+lx+'px,'+ly+'px,0)'; }); } },{passive:true});
    document.addEventListener('pointerleave',function(){ lueur.classList.remove('on'); });
  }

  /* ── 3. La navigation : la barre du haut mène, la pastille du bas indique ── */
  var sections=[].slice.call(document.querySelectorAll('[data-pastille]'));
  var pastille=document.getElementById('pastille'), pIco=document.getElementById('p-ico'), pNom=document.getElementById('p-nom'),
      pPoints=document.getElementById('p-points'), pLent=document.getElementById('p-lentille');
  var points=sections.map(function(){ var i=document.createElement('i'); pPoints.appendChild(i); return i; });
  var courant=-1, verrou=false, finVerrou=0;
  function lentille(n,etirer){
    var a=points[courant>=0?courant:n], b=points[n], xb=b.offsetLeft-2, l=pLent.offsetHeight||9;
    if(etirer&&a!==b&&!calme){ // la goutte s'étire vers le nouveau point, puis s'y resserre
      var xa=a.offsetLeft-2, g=Math.min(xa,xb), d=Math.max(xa,xb)+l;
      pLent.style.left=g+'px'; pLent.style.width=(d-g)+'px';
      setTimeout(function(){ pLent.style.left=xb+'px'; pLent.style.width=l+'px'; },210);
    } else { pLent.style.left=xb+'px'; pLent.style.width=l+'px'; }
  }
  function afficher(n,anime){
    if(n===courant||n<0) return;
    var s=sections[n], doux=anime&&!calme&&courant>=0;
    var vieille=pIco.querySelector('svg:not(.part)'), neuve=icone(s.getAttribute('data-icone'));
    if(vieille&&doux){ vieille.classList.add('part'); setTimeout(function(){ vieille.remove(); },500);
      neuve.classList.add('part'); pIco.appendChild(neuve); requestAnimationFrame(function(){ requestAnimationFrame(function(){ neuve.classList.remove('part'); }); }); }
    else{ pIco.innerHTML=''; pIco.appendChild(neuve); }
    var vieux=pNom.querySelector('span:not(.part)'), neuf=document.createElement('span'); neuf.textContent=s.getAttribute('data-pastille');
    if(vieux&&doux){ neuf.className='arrive'; pNom.appendChild(neuf); pNom.style.width=neuf.offsetWidth+'px';
      requestAnimationFrame(function(){ requestAnimationFrame(function(){ vieux.classList.add('part'); neuf.classList.remove('arrive'); }); });
      setTimeout(function(){ vieux.remove(); },560); }
    else{ pNom.innerHTML=''; pNom.appendChild(neuf); pNom.style.width=neuf.offsetWidth+'px'; }
    lentille(n,doux);
    courant=n;
    if(doux){ pastille.classList.remove('liquide'); void pastille.offsetWidth; pastille.classList.add('liquide'); }
  }
  function sectionVue(){ var y=innerHeight*.42, n=0; sections.forEach(function(s,k){ if(s.getBoundingClientRect().top<=y) n=k; }); return n; }
  [].slice.call(document.querySelectorAll('.nav a[href^="#"]')).forEach(function(a){
    a.addEventListener('click',function(e){
      var cible=document.querySelector(a.getAttribute('href')); if(!cible) return;
      e.preventDefault();
      var n=sections.indexOf(cible); if(n>=0) afficher(n,true);   // la pastille change tout de suite, une seule fois
      verrou=true; clearTimeout(finVerrou); finVerrou=setTimeout(function(){ verrou=false; maj(); },1600);
      var y=cible.id==='accueil'?0:cible.getBoundingClientRect().top+scrollY-navH()-6;
      scrollTo({top:Math.max(0,y),behavior:calme?'auto':'smooth'});
    });
  });

  /* ── 4. Au défilement : la pastille, l'iPhone qui bascule, l'éventail, les plaques ── */
  var prof=document.getElementById('profondeur'), plans=[].slice.call(document.querySelectorAll('[data-vitesse]')), prevu=false;
  function maj(){ prevu=false;
    if(!verrou) afficher(sectionVue(),true);
    basculer();
    var anime=grand.matches&&!calme;
    var h=haut==='3'? borne(scrollY/innerHeight) : borne((innerHeight*.3-compo.getBoundingClientRect().top)/innerHeight);
    compo.style.setProperty('--h',anime?h.toFixed(3):0);
    var rp=prof.getBoundingClientRect(), o=borne((innerHeight-rp.top)/(innerHeight*.75));
    prof.style.setProperty('--ouvre',anime?(1-Math.pow(1-o,3)).toFixed(3):1);
    plans.forEach(function(p){ var v=parseFloat(p.getAttribute('data-vitesse'))||0;
      if(!anime||(compo.contains(p)&&plaques!=='plat')){ p.style.translate=''; return; }
      var r=p.parentElement.getBoundingClientRect(); p.style.translate='0 '+((r.top+r.height/2-innerHeight/2)*v).toFixed(1)+'px'; });
  }
  addEventListener('scroll',function(){
    if(verrou){ clearTimeout(finVerrou); finVerrou=setTimeout(function(){ verrou=false; maj(); },180); }
    if(!prevu){ prevu=true; requestAnimationFrame(maj); } },{passive:true});
  addEventListener('resize',function(){ var c=courant; courant=-1; afficher(c<0?sectionVue():c,false); maj(); });
  afficher(sectionVue(),false); maj();

  /* ── 4 bis. Les plaques en 3D : la scène entière suit la souris ── */
  if(plaques==='3d'&&souris.matches&&!calme){
    addEventListener('pointermove',function(e){ if(!grand.matches) return; var r=compo.getBoundingClientRect(); if(r.bottom<0||r.top>innerHeight) return;
      var nx=Math.max(-1,Math.min(1,(e.clientX-(r.left+r.width/2))/(r.width/2))), ny=Math.max(-1,Math.min(1,(e.clientY-(r.top+r.height/2))/(r.height/2)));
      scene.style.setProperty('--ry',(-11+nx*9).toFixed(2)+'deg'); scene.style.setProperty('--rx',(4-ny*6).toFixed(2)+'deg'); },{passive:true});
  }
  /* ── 4 ter. Les légendes : un filet d'or de chaque plaque à l'endroit de l'écran d'où elle vient ── */
  var filets=document.getElementById('filets'), telA=document.getElementById('tel-accueil');
  function dessinerFilets(){
    if(plaques!=='legendes'||!grand.matches){ filets.innerHTML=''; return; }
    var rc=compo.getBoundingClientRect(), ecran=telA.querySelector('img').getBoundingClientRect(), h='';
    [].slice.call(compo.querySelectorAll('[data-cible]')).forEach(function(p){
      var c=p.getAttribute('data-cible').split(','), tx=ecran.left+parseFloat(c[0])*ecran.width-rc.left, ty=ecran.top+parseFloat(c[1])*ecran.height-rc.top;
      var r=p.getBoundingClientRect(), gauche=r.right<=ecran.left+ecran.width/2;
      var cible=p.querySelector(p.getAttribute('data-ancre')||':scope>*'), rr=cible?cible.getBoundingClientRect():r;
      var ax=(gauche?r.right:r.left)-rc.left, ay=rr.top+rr.height/2-rc.top, bx=gauche?ecran.left-rc.left-16:ecran.right-rc.left+16;
      h+='<path pathLength="1" d="M'+ax.toFixed(1)+' '+ay.toFixed(1)+' L'+bx.toFixed(1)+' '+ay.toFixed(1)+' L'+tx.toFixed(1)+' '+ty.toFixed(1)+'"/>'+
         '<circle class="depart" cx="'+ax.toFixed(1)+'" cy="'+ay.toFixed(1)+'" r="3.5"/><circle class="halo" cx="'+tx.toFixed(1)+'" cy="'+ty.toFixed(1)+'" r="10"/><circle class="point" cx="'+tx.toFixed(1)+'" cy="'+ty.toFixed(1)+'" r="3.5"/>';
    });
    filets.innerHTML=h;
  }
  if(plaques==='legendes'){
    dessinerFilets(); addEventListener('resize',dessinerFilets); addEventListener('load',dessinerFilets);
    if(document.fonts&&document.fonts.ready) document.fonts.ready.then(dessinerFilets);
    if(calme||!('IntersectionObserver' in window)) filets.classList.add('vu');
    else{ var vf=new IntersectionObserver(function(es){ if(es[0].isIntersecting){ filets.classList.add('vu'); vf.disconnect(); } },{threshold:.35}); vf.observe(compo); }
  }

  /* ── 4 ter bis. Sur iPhone : les repères numérotés (légendes) et la bascule des plaques (3D) ── */
  var reperes=document.getElementById('reperes');
  if(plaques==='legendes'){
    var img=telA.querySelector('img');
    function poserReperes(){ reperes.style.left=img.offsetLeft+'px'; reperes.style.top=img.offsetTop+'px'; reperes.style.width=img.offsetWidth+'px'; reperes.style.height=img.offsetHeight+'px'; }
    reperes.innerHTML=[].slice.call(compo.querySelectorAll('[data-num]')).map(function(p){ var c=p.getAttribute('data-cible').split(',');
      return '<span class="repere" style="left:'+(parseFloat(c[0])*100)+'%;top:'+(parseFloat(c[1])*100)+'%">'+p.getAttribute('data-num')+'</span>'; }).join('');
    poserReperes(); addEventListener('resize',poserReperes); img.addEventListener('load',poserReperes);
  }
  // La bascule se décide sur la position de MISE EN PAGE (offsetTop), pas sur la boîte
  // transformée : Safari ne signale jamais comme visible un élément déjà basculé en 3D.
  var basc=plaques==='3d'? [].slice.call(scene.children) : [];
  function basculer(){
    if(!basc||!basc.length) return;
    var haut=scene.getBoundingClientRect().top, seuil=innerHeight*.9;
    basc=basc.filter(function(e){ if(calme||haut+e.offsetTop<seuil){ e.classList.add('bascule'); return false; } return true; });
  }
  basculer();

  /* ── 4 quater. La langue : le globe en haut à droite ── */
  var globe=document.getElementById('globe'), menuL=document.getElementById('langues');
  function langues(ouvrir){ menuL.hidden=!ouvrir; globe.setAttribute('aria-expanded',ouvrir?'true':'false'); }
  globe.addEventListener('click',function(e){ e.stopPropagation(); langues(menuL.hidden); });
  document.addEventListener('click',function(e){ if(!menuL.hidden&&!e.target.closest('.langue')) langues(false); });
  addEventListener('keydown',function(e){ if(e.key==='Escape'&&!menuL.hidden){ langues(false); globe.focus(); } });
  menuL.addEventListener('click',function(e){ var a=e.target.closest('a'); if(!a) return; e.preventDefault(); if(a.getAttribute('aria-disabled')!=='true') langues(false); });

  /* ── 5. Faites glisser : la comparaison du catalogue ── */
  var compare=document.getElementById('compare'), glisser=document.getElementById('glisser'), touche=false;
  function poser(v){ compare.style.setProperty('--p',v+'%'); }
  glisser.addEventListener('input',function(){ touche=true; poser(glisser.value); });
  poser(50);
  if(!calme&&'IntersectionObserver' in window){
    var demo=new IntersectionObserver(function(es){ es.forEach(function(e){ if(!e.isIntersecting||touche) return; demo.disconnect();
      setTimeout(function(){ var t0=performance.now(), d=2600;
        (function pas(t){ if(touche) return; var k=Math.min(1,(t-t0)/d), v=50+38*Math.sin(k*Math.PI*2)*(1-k*.4);
          poser(v.toFixed(1)); glisser.value=v; if(k<1) requestAnimationFrame(pas); else{ poser(50); glisser.value=50; } })(t0); },500); }); },{threshold:.6});
    demo.observe(compare);
  }

  /* ── 6. Les fonctionnalités : deux rangées qui défilent en sens inverse, un panneau ── */
  var VITESSE=26; // pixels par seconde
  var rangees=[].slice.call(document.querySelectorAll('.rangee')).map(function(el){
    var piste=el.querySelector('.piste');
    if(!calme) [].slice.call(piste.children).forEach(function(b){ var c=b.cloneNode(true); c.setAttribute('aria-hidden','true'); c.tabIndex=-1; piste.appendChild(c); });
    else el.style.overflowX='auto';
    return {el:el,piste:piste,sens:el.getAttribute('data-sens')==='droite'?1:-1,x:0,larg:0,survol:false,focus:false,doigt:false,reprise:0,tire:null,bloque:false,pret:false};
  });
  function placer(r){ r.piste.style.transform='translate3d('+r.x.toFixed(2)+'px,0,0)'; }
  function boucler(r){ if(r.larg<=0) return; while(r.x<=-r.larg) r.x+=r.larg; while(r.x>0) r.x-=r.larg; }
  function mesurer(){ if(calme) return; rangees.forEach(function(r){ r.larg=r.piste.scrollWidth/2; if(!r.pret){ r.x=r.sens>0?-r.larg*.5:-r.larg*.12; r.pret=true; } boucler(r); placer(r); }); }
  var visible=true;
  if('IntersectionObserver' in window) new IntersectionObserver(function(es){ visible=es[0].isIntersecting; },{rootMargin:'120px'}).observe(document.getElementById('rangees'));
  var tPrec=null;
  function tourner(t){
    var dt=tPrec===null?0:Math.min(.05,(t-tPrec)/1000); tPrec=t;
    if(visible) rangees.forEach(function(r){ if(r.survol||r.focus||r.doigt||r.tire) return; r.x+=r.sens*VITESSE*dt; boucler(r); placer(r); });
    requestAnimationFrame(tourner);
  }
  rangees.forEach(function(r){
    var el=r.el;
    el.addEventListener('pointerenter',function(e){ if(e.pointerType==='mouse') r.survol=true; });
    el.addEventListener('pointerleave',function(e){ if(e.pointerType==='mouse') r.survol=false; });
    el.addEventListener('focusin',function(){ r.focus=true; });
    el.addEventListener('focusout',function(){ r.focus=false; });
    // le doigt arrête la rangée dès qu'il la touche ; il peut aussi la faire glisser
    el.addEventListener('pointerdown',function(e){ r.doigt=true; clearTimeout(r.reprise); r.tire={x:e.clientX,y:e.clientY,x0:r.x,actif:false,id:e.pointerId}; });
    el.addEventListener('pointermove',function(e){ var d=r.tire; if(!d||d.id!==e.pointerId||calme) return;
      var dx=e.clientX-d.x, dy=e.clientY-d.y;
      if(!d.actif){ if(Math.abs(dx)>8&&Math.abs(dx)>Math.abs(dy)){ d.actif=true; try{ el.setPointerCapture(e.pointerId); }catch(x){} } else return; }
      r.x=d.x0+dx; boucler(r); placer(r); });
    function lacher(e){ var d=r.tire; r.tire=null;
      if(d&&d.actif){ r.bloque=true; setTimeout(function(){ r.bloque=false; },80); }
      if(e.pointerType==='mouse') r.doigt=false;
      else{ clearTimeout(r.reprise); r.reprise=setTimeout(function(){ r.doigt=false; },5000); } }
    el.addEventListener('pointerup',lacher); el.addEventListener('pointercancel',lacher);
    el.addEventListener('click',function(e){ var b=e.target.closest('.fn'); if(!b) return; if(r.bloque){ e.preventDefault(); return; } ouvrir(b.getAttribute('data-f')); });
  });
  var panneau=document.getElementById('panneau'), pTexte=document.getElementById('p-texte'), pVisuel=document.getElementById('p-visuel'), ouvert=null;
  function ouvrir(id){
    var t=document.getElementById('f-'+id); if(!t) return;
    if(ouvert===id){ fermer(); return; }
    var etaitFerme=ouvert===null; ouvert=id;
    [].slice.call(document.querySelectorAll('.fn')).forEach(function(b){ var ok=b.getAttribute('data-f')===id; b.classList.toggle('choisie',ok);
      if(!b.hasAttribute('aria-hidden')) b.setAttribute('aria-expanded',ok?'true':'false'); });
    var frag=t.content.cloneNode(true), vis=frag.querySelector('.vis'); if(vis) vis.parentNode.removeChild(vis);
    var st=t.getAttribute('data-statut'), badge=document.createElement('span'); badge.className='statut '+st;
    if(st==='plus') badge.appendChild(icone('cadenas','cadenas'));
    badge.appendChild(document.createTextNode(panneau.getAttribute('data-'+st)||''));
    pTexte.innerHTML=''; pTexte.appendChild(badge); pTexte.appendChild(frag);
    pVisuel.innerHTML=''; if(vis) pVisuel.appendChild(vis);
    [pTexte,pVisuel].forEach(function(el){ el.classList.remove('change'); void el.offsetWidth; el.classList.add('change'); });
    panneau.classList.add('ouvert'); panneau.setAttribute('aria-hidden','false');
    if(vis) vis.style.setProperty('--larg',vis.clientWidth+'px');
    setTimeout(montrer,etaitFerme?60:0);
  }
  // les pastilles et le panneau, ensemble à l'écran si possible
  function montrer(){
    var rr=document.getElementById('rangees').getBoundingClientRect(), hp=panneau.querySelector('.verre').offsetHeight+30;
    var bas=innerHeight-pastille.offsetHeight-34, hautVu=navH()+12, cible=null;
    if(rr.bottom+22+hp-rr.top<=bas-hautVu){ if(rr.top<hautVu||rr.bottom+22+hp>bas) cible=rr.top-hautVu; }
    else cible=rr.bottom+22-hautVu;
    if(cible!==null&&Math.abs(cible)>4) scrollBy({top:cible,behavior:calme?'auto':'smooth'});
  }
  function fermer(){ ouvert=null; panneau.classList.remove('ouvert'); panneau.setAttribute('aria-hidden','true');
    [].slice.call(document.querySelectorAll('.fn')).forEach(function(b){ b.classList.remove('choisie'); if(!b.hasAttribute('aria-hidden')) b.setAttribute('aria-expanded','false'); }); }
  document.getElementById('fermer').addEventListener('click',fermer);
  addEventListener('keydown',function(e){ if(e.key==='Escape'&&ouvert) fermer(); });
  mesurer(); addEventListener('resize',mesurer); addEventListener('load',mesurer);
  if(document.fonts&&document.fonts.ready) document.fonts.ready.then(mesurer);
  if(!calme) requestAnimationFrame(tourner);

  /* ── 7. Haut de page, façon 2 : le catalogue qui se remplit ── */
  if(haut==='2'){
    var plan=document.getElementById('mur-plan');
    var fichiers=[['unabomber','FR | Unabomber (2026) MULTI'],['obsession','FR | Obsession (2026) 4K'],['abominable','FR | Abominable (2019) 4K'],
      ['mobland','FR | MobLand S01E01 MULTI'],['reacher','FR | Reacher S03E01 VF'],['femme-menage','FR | La Femme de ménage (2025) 4K'],
      ['carnets',"FR | Les Carnets de l'apothicaire S02 VOSTFR"],['spider-man','FR | Spider-Man : Brand New Day (2026) 4K'],['ted-lasso','FR | Ted Lasso S03E01 MULTI'],
      ['belle-bete','FR | La Belle et la Bête (1991) VF'],['blitz','FR | Blitz (2024) VOSTFR'],['22-terre','FR | 22 contre la Terre (2021) 4K'],
      ['chicken-run','FR | Chicken Run : La Menace Nuggets (2023)'],['black-adam','FR | Black Adam (2022) 4K'],['tornado','FR | Tornado (2025) VF'],
      ['balto','FR | Balto (1995) VF'],['ballerina','FR | Ballerina (2016) MULTI'],['apollo','FR | Apollo 10½ (2022) VOSTFR'],['surfer','FR | The Surfer (2025) 4K'],
      ['arctic','FR | Arctic (2019) VF'],['smashing','FR | The Smashing Machine (2025) MULTI'],['armes','FR | Les Armes (2025) 4K'],
      ['ant-man','FR | Ant-Man et la Guêpe (2018) VF'],['one-piece','FR | One Piece S01E01 VOSTFR']];
    var nb=matchMedia('(max-width: 700px)').matches?30:44, tuiles=[];
    for(var i=0;i<nb;i++){ var f=fichiers[(i*7+3)%fichiers.length], d=document.createElement('div'); d.className='tuile';
      var c=document.createElement('code'); c.textContent=f[1]; var im=document.createElement('img'); im.alt=''; im.src='m/site/affiches/'+f[0]+'.webp';
      d.appendChild(c); d.appendChild(im); plan.appendChild(d); tuiles.push(d); }
    function developper(t){ t.classList.add('vue','eclair'); setTimeout(function(){ t.classList.remove('eclair'); },520); }
    if(calme) tuiles.forEach(function(t){ t.classList.add('vue'); });
    else{
      var ordre=tuiles.slice().sort(function(){ return Math.random()-.5; }), k=0;
      setTimeout(function(){ var m=setInterval(function(){ if(k>=ordre.length){ clearInterval(m); setInterval(respirer,1200); return; } developper(ordre[k++]); },160); },700);
    }
    function respirer(){ if(document.hidden) return; var t=tuiles[Math.floor(Math.random()*tuiles.length)]; if(!t.classList.contains('vue')) return;
      t.classList.remove('vue'); setTimeout(function(){ developper(t); },1800); }
  }
})();
