function showTab(id){
    document.querySelectorAll('.tab-panel').forEach(function(p){ p.classList.remove('active'); });
    document.getElementById(id).classList.add('active');
    document.querySelectorAll('.tab-btn').forEach(function(b){
      b.classList.toggle('active', b.dataset.tab === id);
    });
    window.scrollTo({top:0, behavior:'instant'});
  }

  function speak(text){
    if(!('speechSynthesis' in window)){ return; }
    window.speechSynthesis.cancel();
    var u = new SpeechSynthesisUtterance(text);
    u.lang = 'en-US';
    u.rate = 0.95;
    window.speechSynthesis.speak(u);
  }
