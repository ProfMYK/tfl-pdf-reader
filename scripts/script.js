const url = "pdf.pdf"

let pdfDoc = null,
  pageNum = 1,
  pageIsRendering = false
  pageNumIsPending = null

const scale = 1.4,
  canvas1 = document.querySelector("#pdf-render1"),
  canvas2 = document.querySelector("#pdf-render2"),
  ctx1 = canvas1.getContext('2d')
  ctx2 = canvas2.getContext('2d')

const renderPage = num => {
  pageIsRendering = true

  pdfDoc.getPage(num).then(page => {
    const viewport = page.getViewport({ scale })
    canvas1.height = viewport.height
    canvas1.width = viewport.width

    const renderCtx = {
      canvasContext: ctx1,
      viewport
    }

    page.render(renderCtx).promise.then(() => {
      pageIsRendering = false

      if(pageNumIsPending != null) {
        renderPage(pageNumIsPending)
        pageNumIsPending = null
      }
    })
    
    document.querySelector("#page-num").textContent = num
  })
  if(num + 1 <= pdfDoc.numPages){
    document.querySelector("#pdf-render2").className = ""
    pdfDoc.getPage(num + 1).then(page => {
      const viewport = page.getViewport({ scale })
      canvas2.height = viewport.height
      canvas2.width = viewport.width

      const renderCtx = {
        canvasContext: ctx2,
        viewport
      }

      page.render(renderCtx).promise.then(() => {
        pageIsRendering = false

        if(pageNumIsPending != null) {
          renderPage(pageNumIsPending)
          pageNumIsPending = null
        }
      })
    })
  }else {
    document.querySelector("#pdf-render2").className = "hidden"
  }
}

const queueRenderPage = num => {
  if(pageIsRendering)
    pageNumIsPending = num
  else
    renderPage(num)
}

const showPrevPage = () => {
  if(pageNum <= 2) return

  pageNum -= 2
  queueRenderPage(pageNum)
}

const showNextPage = () => {
  if(pageNum >= pdfDoc.numPages - 1) return

  pageNum += 2
  queueRenderPage(pageNum)
}

pdfjsLib.getDocument(url).promise.then(pdfDoc_ => {
  pdfDoc = pdfDoc_

  document.querySelector("#page-count").textContent = pdfDoc.numPages

  renderPage(pageNum)
})

document.querySelector("#prev").addEventListener('click', showPrevPage)
document.querySelector("#next").addEventListener('click', showNextPage)