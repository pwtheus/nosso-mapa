/* Sem dependências externas: o scroll continua nativo e as animações são progressivas. */
(() => {
  'use strict';
  const content = window.SITE_CONTENT;
  const $ = s => document.querySelector(s);
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const dateLabel = iso => iso ? iso.split('-').reverse().join('/') : '';
  const soundtrack = $('#soundtrack');
  soundtrack.src = content.music.src;
  soundtrack.volume = content.music.volume;
  function musicState() {
    $('#music-label').textContent = soundtrack.paused ? 'tocar música' : 'pausar música';
    $('#music-toggle').setAttribute('aria-label', `${soundtrack.paused ? 'tocar' : 'pausar'} ${content.music.title}`);
    $('#music-toggle').setAttribute('aria-pressed', String(!soundtrack.paused));
  }
  function playMusic() {
    $('#music-status').textContent = '';
    soundtrack.play().catch(() => { $('#music-status').textContent = 'toque em ♫ para tentar novamente.'; musicState(); });
  }
  $('#begin-story').addEventListener('click', () => { if (soundtrack.paused) playMusic(); });
  $('#music-toggle').addEventListener('click', () => { if (soundtrack.paused) playMusic(); else soundtrack.pause(); });
  soundtrack.addEventListener('play', musicState);
  soundtrack.addEventListener('pause', musicState);
  const make = (tag, cls, text) => { const n = document.createElement(tag); if (cls) n.className = cls; if (text !== undefined) n.textContent = text; return n; };
  $('#anniversary-label').textContent = dateLabel(content.anniversary);
  content.opening.forEach(line => $('#opening-copy').append(make('p', '', line)));

  function gallery(moment) {
    const area = make('div', 'photo-area' + (moment.fotos.length > 1 ? ' multi' : ''));
    const cards = moment.fotos.map((photo, i) => {
      const figure = make('figure', 'photo-card');
      const button = make('button', 'photo-toggle'); button.type = 'button';
      button.setAttribute('aria-label', moment.fotos.length > 1 && moment.fotos.length <= 4 ? 'espalhar ou recolher as fotos de ' + moment.titulo : 'inclinar a foto de ' + moment.titulo);
      const img = make('img'); img.src = photo.src; img.alt = photo.alt || moment.legenda;
      img.width = photo.width || 1200; img.height = photo.height || 900; img.loading = 'lazy'; img.decoding = 'async';
      button.append(img); figure.append(button, make('figcaption', '', `lembrança ${String(moment.id).padStart(2,'0')}${moment.fotos.length > 1 ? ' · ' + (i+1) : ''}`));
      button.addEventListener('click', () => {
        if (cards.length > 1 && cards.length <= 4) {
          area.classList.toggle('spread');
          cards.forEach(card => card.querySelector('button').setAttribute('aria-expanded', String(area.classList.contains('spread'))));
        } else figure.classList.toggle('tilted');
      });
      if (moment.fotos.length > 1 && moment.fotos.length <= 4) button.setAttribute('aria-expanded','false');
      area.append(figure); return figure;
    });
    if (cards.length > 4) {
      let index = 0, startX = 0, startY = 0;
      const controls = make('div', 'gallery-controls');
      const prev = make('button', '', '←'), next = make('button', '', '→'), status = make('span');
      prev.type = next.type = 'button'; prev.setAttribute('aria-label','foto anterior'); next.setAttribute('aria-label','próxima foto'); status.setAttribute('aria-live','polite');
      function show(delta) { index = (index + delta + cards.length) % cards.length; cards.forEach((card,i) => { card.style.display = i === index ? 'block' : 'none'; }); status.textContent = `${index+1} / ${cards.length}`; }
      prev.addEventListener('click',()=>show(-1)); next.addEventListener('click',()=>show(1));
      area.addEventListener('touchstart',e=>{startX=e.changedTouches[0].clientX;startY=e.changedTouches[0].clientY;},{passive:true});
      area.addEventListener('touchend',e=>{const dx=e.changedTouches[0].clientX-startX,dy=e.changedTouches[0].clientY-startY;if(Math.abs(dx)>55&&Math.abs(dx)>Math.abs(dy)*1.5)show(dx<0?1:-1);},{passive:true});
      controls.append(prev,status,next);area.append(controls);show(0);
    }
    area.append(make('span','photo-decoration','✧')); area.lastChild.setAttribute('aria-hidden','true');
    return area;
  }

  content.moments.filter(m=>m.id!==8).forEach(moment => {
    const section=make('section','moment'+(moment.id===6?' special':'')+(!moment.fotos.length?' text-only':''));
    section.id='moment-'+moment.id; section.dataset.act=moment.ato; section.setAttribute('aria-labelledby','title-'+moment.id);
    const pin=make('span','pin','♥'); pin.setAttribute('aria-hidden','true'); section.append(pin);
    if(moment.id===1||moment.id===5)section.append(make('p','act-note',moment.id===1?'ato I · antes de ser nós':'ato II · quando virou amor'));
    if(moment.fotos.length)section.append(gallery(moment));
    const copy=make('div','moment-copy'); copy.append(make('p','chapter-label',`${String(moment.id).padStart(2,'0')} / ${moment.ato===1?'os primeiros passos':'o nosso caminho'}`));
    const title=make('h2','',moment.titulo);title.id='title-'+moment.id;copy.append(title);
    if(moment.data){const time=make('time','',dateLabel(moment.data));time.dateTime=moment.data;copy.append(time);}
    if(moment.datas)moment.datas.forEach(item=>{const line=make('p');line.style.margin='6px 0';const time=make('time','',`${item.rotulo} · ${dateLabel(item.data)}`);time.dateTime=item.data;line.append(time);copy.append(line);});
    copy.append(make('p','handwritten',moment.legenda));section.append(copy);$('#moments').append(section);
  });
  const final=content.moments.find(m=>m.id===8);
  $('#final-caption').textContent=final.legenda;
  $('#final-date').textContent=dateLabel(final.data);$('#final-date').dateTime=final.data;$('#final-date').hidden=!final.data;
  content.moments.forEach(m=>{const a=make('a');a.href='#moment-'+m.id;a.setAttribute('aria-label',`${m.id}. ${m.titulo}`);$('.chapter-nav').append(a);});

  // Calendar arithmetic is performed on wall-clock parts in the configured time zone.
  const zoneFormatter=new Intl.DateTimeFormat('en-CA',{timeZone:content.timezone,year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',second:'2-digit',hourCycle:'h23'});
  function wallClock(now){const p=Object.fromEntries(zoneFormatter.formatToParts(now).map(p=>[p.type,p.value]));return Date.UTC(+p.year,+p.month-1,+p.day,+p.hour,+p.minute,+p.second);}
  function addMonths(start,months){const y=start.getUTCFullYear(),m=start.getUTCMonth()+months;const last=new Date(Date.UTC(y,m+1,0)).getUTCDate();return Date.UTC(y,m,Math.min(start.getUTCDate(),last));}
  function elapsed(since,now=new Date()){
    const [y,m,d]=since.split('-').map(Number),start=new Date(Date.UTC(y,m-1,d));const current=wallClock(now);
    if(current<+start)return {years:0,months:0,days:0,hours:0,minutes:0,seconds:0};
    const end=new Date(current);let totalMonths=(end.getUTCFullYear()-y)*12+end.getUTCMonth()-(m-1);
    if(addMonths(start,totalMonths)>current)totalMonths--;
    let remaining=Math.floor((current-addMonths(start,totalMonths))/1000);
    const days=Math.floor(remaining/86400);remaining%=86400;const hours=Math.floor(remaining/3600);remaining%=3600;
    return {years:Math.floor(totalMonths/12),months:totalMonths%12,days,hours,minutes:Math.floor(remaining/60),seconds:remaining%60};
  }
  // Exposed for the small deterministic calendar checks in tests.cjs.
  window.mapCalendar={elapsed};
  const counterNodes=content.counters.map(c=>{const box=make('div','counter');box.append(make('p','counter-label',c.label));const calendar=make('p','calendar-part'),clock=make('p','clock-part');box.append(calendar,clock);$('#counters').append(box);return {c,calendar,clock};});
  function tick(){counterNodes.forEach(({c,calendar,clock})=>{const t=elapsed(c.since);const parts=[];if(t.years)parts.push(`${t.years} ${t.years===1?'ano':'anos'}`);if(t.months)parts.push(`${t.months} ${t.months===1?'mês':'meses'}`);parts.push(`${t.days} ${t.days===1?'dia':'dias'}`);const label=parts.join(' · ');if(calendar.textContent!==label)calendar.textContent=label;clock.textContent=`${String(t.hours).padStart(2,'0')} h : ${String(t.minutes).padStart(2,'0')} min : ${String(t.seconds).padStart(2,'0')} s`;});}
  tick();setInterval(()=>{if(!document.hidden)tick();},1000);

  let pathLength=0,frame=0,opened=false;
  const route=$('#route'),mask=$('#route-mask'),story=$('#story'),traveler=$('#traveler');
  function drawRoute(){
    if(!opened)return;
    const base=story.getBoundingClientRect();
    const points=[...document.querySelectorAll('.moment .pin,.final-pin')].map(n=>{const r=n.getBoundingClientRect();return {x:r.left+r.width/2-base.left,y:r.top+r.height/2-base.top};});
    route.setAttribute('viewBox',`0 0 ${base.width} ${story.offsetHeight}`);
    let full=`M ${points[0].x} 0`,first=full,second='';let last={x:points[0].x,y:0};
    points.forEach((p,i)=>{
      const bend=base.width>760?(i%2===0?-115:115):0;
      const segment=` C ${last.x+bend} ${last.y+(p.y-last.y)*.48}, ${p.x-bend} ${p.y-(p.y-last.y)*.48}, ${p.x} ${p.y}`;
      full+=segment;if(i<4)first+=segment;else second+=segment;
      if(i===3)second=`M ${p.x} ${p.y}`;last=p;
    });
    mask.setAttribute('d',full);$('#route-ghost').setAttribute('d',full);$('#route-first').setAttribute('d',first);$('#route-second').setAttribute('d',second);
    pathLength=mask.getTotalLength();mask.style.strokeDasharray=pathLength;updateRoute();
  }
  function updateRoute(){
    frame=0;if(!opened||!pathLength)return;
    const r=story.getBoundingClientRect(),target=Math.max(0,Math.min(story.offsetHeight,-r.top+innerHeight*.54));
    let low=0,high=pathLength;for(let i=0;i<17;i++){const mid=(low+high)/2;if(mask.getPointAtLength(mid).y<target)low=mid;else high=mid;}
    const distance=(low+high)/2,p=mask.getPointAtLength(distance);mask.style.strokeDashoffset=pathLength-distance;
    traveler.style.transform=`translate(${p.x-12}px,${p.y-12}px)`;traveler.hidden=r.top>innerHeight*.7;
    const sections=[...document.querySelectorAll('.moment,.finale')];let active=0;sections.forEach((s,i)=>{if(s.getBoundingClientRect().top<innerHeight*.6)active=i;});
    document.querySelectorAll('.chapter-nav a').forEach((a,i)=>{if(i===active)a.setAttribute('aria-current','step');else a.removeAttribute('aria-current');});
    document.querySelectorAll('.pin').forEach((p,i)=>p.classList.toggle('active',i===active));
  }
  addEventListener('scroll',()=>{if(!frame)frame=requestAnimationFrame(updateRoute);},{passive:true});
  addEventListener('resize',drawRoute);new ResizeObserver(drawRoute).observe(story);
  document.fonts.ready.then(drawRoute);

  function revealText(node){
    if(reduced.matches||node.dataset.revealed)return;node.dataset.revealed='true';
    const value=node.textContent;node.textContent='';node.append(make('span','sr-only',value));const visual=make('span');visual.setAttribute('aria-hidden','true');
    value.split(' ').forEach((word,i)=>{const span=make('span','word',word);span.style.setProperty('--delay',Math.min(i*.035,1.7)+'s');visual.append(span,document.createTextNode(' '));});node.append(visual);node.classList.add('word-reveal');
  }
  const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{
    if(!entry.isIntersecting)return;const section=entry.target;section.querySelectorAll('.handwritten').forEach(revealText);
    if(section.classList.contains('special'))section.classList.add('celebrate');
    const photo=section.querySelector('.photo-area');if(photo&&!reduced.matches)photo.animate([{opacity:.3,clipPath:'inset(0 0 12% 0)',translate:'0 15px'},{opacity:1,clipPath:'inset(0)',translate:'0 0'}],{duration:900,easing:'cubic-bezier(.2,.7,.2,1)'});
    observer.unobserve(section);
  }),{threshold:.22});
  async function hash(value){const data=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(value));return [...new Uint8Array(data)].map(b=>b.toString(16).padStart(2,'0')).join('');}
  $('#password-form').addEventListener('submit',async event=>{
    event.preventDefault();let value=$('#date-input').value.replace(/\D/g,'');
    if(value.length===6)value=value.slice(0,4)+'20'+value.slice(4);
    try {
      if(await hash(value)!==content.passwordHash){$('#password-error').textContent='quase... pensa na nossa primeira conversa';$('.lock').classList.remove('shake');void $('.lock').getBoundingClientRect();$('.lock').classList.add('shake');$('#date-input').setAttribute('aria-invalid','true');return;}
      $('#date-input').removeAttribute('aria-invalid');$('#password-error').textContent='';$('#gate').classList.add('unlocked');
      const delay=reduced.matches?0:550;setTimeout(()=>{
        $('#gate').style.opacity=0;setTimeout(()=>{
          $('#gate').hidden=true;$('#experience').hidden=false;document.body.classList.remove('locked');opened=true;scrollTo(0,0);
          $('#intro-title').focus({preventScroll:true});$('#opening-copy').classList.add('opening-animate');drawRoute();
          document.querySelectorAll('.moment,.finale').forEach(s=>observer.observe(s));
        },reduced.matches?0:650);
      },delay);
    } catch {$('#password-error').textContent='abra pelo link do site ou por localhost para continuar.';}
  });
})();
