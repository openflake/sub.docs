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
    docMenu = document.querySelector('#jekydocs-menu')
    docLogo = document.querySelector('.logo')

    fetch('SUMMARY', res => {
      docSummary.innerHTML = marked(res)
      Toc.clear()
      initSummary()
    })

    fetch(location.hash.substr(1) || 'README.md', res => {
      docContent.innerHTML = marked(res)
      docToc.innerHTML = Toc.html()
    })

    docLogo.onclick = function() {
      loadPage(this.href)
    }

    docMenu.onclick = function() {
      docSummary.classList.add('active')
    }

    docContent.onclick = function() {
      docSummary.classList.remove('active')
    }
  })

  /**
   * Init click event of summary links
   */
  let lastClickedLink = null

  function initSummary() {
    let summary = document.querySelectorAll('#jekydocs-summary a')
    summary.forEach(link => {
      link.onclick = function() {
        docSummary.classList.remove('active')
        if (lastClickedLink) {
          lastClickedLink.classList.remove('active')
        }
        lastClickedLink = link
        link.classList.add('active')
        loadPage(link.href)
      }
    })
  }

  function loadPage(url) {
    Progress.start()
    fetch(url.split('#')[1], res => {
      docContent.scrollTop = 0
      docContent.innerHTML = marked(res)
      docToc.innerHTML = Toc.html()
    })
  }

  /**
   * Init markedjs with custom renderer
   */
  function initMarked() {
    let renderer = new marked.Renderer()
    renderer.heading = function(text, level, raw) {
      let anchor = this.options.headerPrefix + raw.toLowerCase().replace(/[^\w\\u4e00-\\u9fa5]]+/g, '-')
      Toc.add({
        anchor,
        level,
        text
      })
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
    add: function(entry) {
      this.toc.push(entry)
      this.relativeLevel.push(entry.level)
    },
    clear: function() {
      this.toc = []
      this.relativeLevel = []
    },
    html: function() {
      let rlv = Array.from(new Set(this.relativeLevel)).sort()
      let html = ''
      this.toc.forEach((entry, index) => {
        html += '<a class="toc-' + rlv.indexOf(entry.level) + '" href="#' + entry.anchor + '">' + entry.text + '<a>'
      })
      this.clear()
      return html
    }
  }

  /**
   * Ajax reqeust for markdown file
   */
  function fetch(url, callback) {
    let xhr = new XMLHttpRequest()
    xhr.open("GET", url, true)
    xhr.send()

    xhr.onreadystatechange = function() {
      if (this.readyState == 4) {
        Progress.done()
        if (this.status == 200) {
          callback(this.responseText)
        } else {
          alert('文档不存在或读取错误')
        }
      }
    }
  }

})()
