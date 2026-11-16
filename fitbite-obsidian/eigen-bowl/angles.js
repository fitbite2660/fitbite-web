(() => {
  const photo = document.getElementById('tray-photo');
  const switcher = document.getElementById('angle');
  const pins = Array.from(document.querySelectorAll('.pin[data-pick]'));
  const original = new Map(pins.filter(pin => !pin.hidden).map(pin => [
    pin.dataset.pick, [pin.style.getPropertyValue('--x'), pin.style.getPropertyValue('--y')]
  ]));
  const reverse = new Map(Object.entries({
    'Tomaat': ['12%', '29.6%'], 'Rode ui': ['36%', '18.3%'], 'Maïs': ['72%', '29.6%'], 'Komkommer': ['55%', '46.5%'], 'Mango': ['30%', '74.6%'], 'Edamame': ['86%', '21.1%']
  }));
  let otherAngle = false;

  function showAngle(other) {
    if (other === otherAngle) return;
    otherAngle = other;
    const positions = other ? reverse : original;
    photo.src = other ? 'media/saladette-schuin.jpg' : 'media/saladette-boven.jpg';
    photo.alt = other ? 'Schuine blik langs de bakken, met mango en komkommer vooraan.' :
      'Fitbites saladette van bovenaf, met elke groente in een eigen bak.';
    for (const pin of pins) {
      const point = positions.get(pin.dataset.pick);
      pin.hidden = !point;
      if (point) {
        pin.style.setProperty('--x', point[0]);
        pin.style.setProperty('--y', point[1]);
      }
    }
    switcher.setAttribute('aria-label', other ? 'Bekijk de hoek met avocado' : 'Bekijk de hoek met mango');
    if (photo.animate && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
      photo.animate([{opacity:.5}, {opacity:1}], {duration:260, easing:'ease-out'});
    }
  }

  switcher.setAttribute('aria-label', 'Bekijk de hoek met mango');
  switcher.addEventListener('click', () => showAngle(!otherAngle));
  document.getElementById('choices').addEventListener('click', event => {
    const option = event.target.closest('button[data-group="vegetables"]');
    if (!option || option.getAttribute('aria-pressed') !== 'true') return;
    if (option.dataset.value === 'Mango') showAngle(true);
    if (option.dataset.value === 'Avocado') showAngle(false);
  });
})();
