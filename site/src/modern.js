document.documentElement.classList.add('js');

const menu = document.querySelector('.menu');
const navLinks = document.querySelector('.nav-links');
if (menu && navLinks) {
  menu.addEventListener('click', () => {
    const open = navLinks.classList.toggle('open');
    menu.setAttribute('aria-expanded', String(open));
  });
  navLinks.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
    navLinks.classList.remove('open');
    menu.setAttribute('aria-expanded','false');
  }));
}

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('in');
      observer.unobserve(entry.target);
    }
  });
}, {threshold:.08, rootMargin:'0px 0px -30px 0px'});

document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

const nav = document.querySelector('.site-nav');
window.addEventListener('scroll', () => {
  if (nav) nav.classList.toggle('scrolled', window.scrollY > 8);
}, {passive:true});
