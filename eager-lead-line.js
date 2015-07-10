(function(){
  if (!document.body.addEventListener || !document.body.setAttribute || !document.body.querySelector || !document.body.classList || !document.body.classList.add) {
    return
  }

  var options, colorStyle, htmlStyle, el, lastElHeight, show, hide, setHTMLStyle;

  options = INSTALL_OPTIONS;

  document.documentElement.setAttribute('eager-lead-line-goal', options.goal);
  document.documentElement.setAttribute('eager-lead-line-size', options.size);

  colorStyle = document.createElement('style');
  colorStyle.innerHTML = '' +
    '.eager-lead-line {' +
      'background: ' + options.color + ' !important' +
    '}' +
    '.eager-lead-line button.eager-lead-line-button {' +
      'color: ' + options.color + ' !important' +
    '}' +
  '';
  document.body.appendChild(colorStyle);

  el = document.createElement('eager-lead-line');
  el.className = 'eager-lead-line';
  el.innerHTML = '' +
    '<div class="eager-lead-line-close-button"></div>' +
    '<div class="eager-lead-line-content">' +
      '<div class="eager-lead-line-text">' + options[options.goal + 'Text'] + '</div>' +
      (options.goal === 'announcement' ? '' :
      '<form class="eager-lead-line-form">' +
         (options.goal !== 'signup' ? '' :
        '<input name="email" class="eager-lead-line-input" type="email" placeholder="Email address" spellcheck="false" required>') +
        '<button type="submit" class="eager-lead-line-button">' + (options[options.goal + 'ButtonText'] || '&nbsp;') + '</button>' +
      '</form>') +
    '</div>' +
    '<div class="eager-lead-line-branding">' +
      '<a class="eager-lead-line-branding-link" href="https://eager.io?utm_source=eager_leads_powered_by_link" target="_blank">Powered by Eager</a>' +
    '</div>' +
  '';
  document.body.appendChild(el);

  show = function() {
    var input;

    document.documentElement.setAttribute('eager-lead-line-show', 'true');

    input = el.querySelector('input.eager-lead-line-input');
    if (input) {
      input.focus();
    }
  };
  show();

  hide = function() {
    document.documentElement.setAttribute('eager-lead-line-show', 'false');
    document.body.removeChild(htmlStyle);
    show = function() {};
    hide = function() {};
  };
  el.querySelector('.eager-lead-line-close-button').addEventListener('click', hide);

  htmlStyle = document.createElement('style');
  lastElHeight = 0;
  setHTMLStyle = function() {
    var elHeight = el.clientHeight;
    if (lastElHeight !== elHeight) {
      htmlStyle.innerHTML = '' +
        'html {' +
          '-webkit-transform: translate3d(0, ' + elHeight + 'px, 0) !important;' +
          'transform: translate3d(0, ' + elHeight + 'px, 0) !important' +
        '}' +
      '';
    }
    lastElHeight = elHeight;
  };
  setHTMLStyle();
  document.body.appendChild(htmlStyle);
  window.addEventListener('resize', setHTMLStyle);

  // iOS :hover CSS hack
  el.addEventListener('touchstart', function(){}, false);
})();
