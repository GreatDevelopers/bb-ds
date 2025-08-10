export default defineNuxtPlugin((nuxtApp) => {
  if (process.client) {
    window.MathJax = {
      tex: { inlineMath: [['$', '$'], ['\\(', '\\)']] },
      svg: { fontCache: 'global' }
    };

    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-svg.js';
    script.async = true;
    document.head.appendChild(script);

    nuxtApp.hook('page:finish', () => {
      if (window.MathJax && window.MathJax.typeset) {
        window.MathJax.typeset();
      }
    });
  }
});
