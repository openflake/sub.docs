/**
 * Load index page with SUMMARY and README or location hash path
 */
(function() {
  let docSummary, docContent, docToc
  initMarked()

  document.addEventListener('DOMContentLoaded', function() {
    docSummary = document.querySelector('#jekydocs-summary')
    docContent = document.querySelector('#jekydocs-content')
    docToc = document.querySelector('#jekydocs-toc')
    loadPage(getCurrentHash())

    fetch('SUMMARY', res => {
      docSummary.innerHTML = marked(res)
      Toc.clear()
      initSummary()
    })

    document.querySelector('#jekydocs-menu').onclick = function() {
      docSummary.classList.add('active')
    }
    docContent.onclick = function() {
      docSummary.classList.remove('active')
    }
  })

  window.onpopstate = function() {
    loadPage(getCurrentHash())
  }

  function getCurrentHash() {
    return location.hash || '#README.md'
  }

  /**
   * Init click event of summary links
   */
  let lastSummaryIndex = null
  function initSummary() {
    let summary = document.querySelectorAll('#jekydocs-summary a')
    summary.forEach(link => {
      link.onclick = function() {
        docSummary.classList.remove('active')
        if (lastSummaryIndex) {
          lastSummaryIndex.classList.remove('active')
        }
        lastSummaryIndex = link
        link.classList.add('active')
        loadPage(link.href)
      }
    })
  }

  function loadPage(url) {
    fetch(url.split('#')[1], res => {
      docContent.scrollTop = 0
      docContent.innerHTML = marked(res)
      docToc.innerHTML = ''
      docToc.appendChild(Toc.el())
    })
  }

  /**
   * Init markedjs with custom renderer
   */
  function initMarked() {
    let renderer = new marked.Renderer()
    renderer.heading = function(text, level, raw) {
      let anchor = this.options.headerPrefix + raw.toLowerCase().replace(/[^\w\u4e00-\u9fa5]+/g, '-')
      Toc.add({ anchor, level, text })
      return `<h${level} id="${anchor}">${text}</h${level}>`
    }

    marked.setOptions({
      renderer: renderer,
      highlight: function(code) {
        return hljs.highlightAuto(code).value
      },
    })
  }

  /**
   * Table of content
   */
  const Toc = {
    toc: [],
    relativeLevel: [],
    lastAnchor: null,

    add: function(entry) {
      this.toc.push(entry)
      this.relativeLevel.push(entry.level)
    },
    clear: function() {
      this.toc = []
      this.relativeLevel = []
    },
    el: function() {
      let rlv = Array.from(new Set(this.relativeLevel)).sort()
      let fragment = document.createDocumentFragment()

      this.toc.forEach(entry => {
        let a = document.createElement('a')
        a.className = 'toc-' + rlv.indexOf(entry.level)
        a.innerHTML = entry.text
        fragment.appendChild(a)

        a.onclick = () => {
          if (this.lastAnchor) {
            this.lastAnchor.classList.remove('active')
          }
          this.lastAnchor = a
          a.classList.add('active')
          docContent.scrollTo({
            top: document.getElementById(entry.anchor).offsetTop,
            behavior: 'smooth'
          })
        }
      })
      this.clear()
      return fragment
    }
  }

  /**
   * Ajax reqeust for markdown file
   */
  function fetch(url, callback) {
    let xhr = new XMLHttpRequest()
    xhr.open("GET", url, true)
    xhr.send()

    Progress.start()
    xhr.onreadystatechange = function() {
      if (this.readyState == 4) {
        Progress.done()
        if (this.status == 200) {
          callback(this.responseText)
        } else {
          console.error('Page not found')
        }
      }
    }
  }

})()
