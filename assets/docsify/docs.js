/**
 * Load index page with SUMMARY and README or location hash path
 */
(function() {
  initMarked()

  fetch('SUMMARY', res => {
    document.querySelector('#jekydocs-summary').innerHTML = marked(res)
    Toc.clear()
    initSummary()
  })

  fetch(location.hash.substr(1) || 'README.md', res => {
    document.querySelector('#jekydocs-content').innerHTML = marked(res)
    document.querySelector('#jekydocs-toc').innerHTML = Toc.html()
  })

  /**
   * Init click event of summary links
   */
  let lastClickedLink = {}

  function initSummary() {
    let summary = document.querySelectorAll('#jekydocs-summary a')
    summary.forEach(link => {
      link.onclick = function() {
        lastClickedLink.className = ''
        lastClickedLink = link
        link.className = 'active'

        fetch(link.href.split('#')[1], res => {
          document.querySelector('#jekydocs-content').innerHTML = marked(res)
          document.querySelector('#jekydocs-toc').innerHTML = Toc.html()
        })
      }
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
      let html = '<div>文档目录</div>'
      this.toc.forEach((entry, index) => {
        if (index > 0) {
          html += '<a class="toc-' + rlv.indexOf(entry.level) + '" href="#' + entry.anchor + '">' + entry.text + '<a>'
        }
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
      if (this.readyState == 4 && this.status == 200) {
        callback(this.responseText)
      }
    }
  }

})()
