let worker;

if (typeof window !== 'undefined') {
  worker = new Worker('/tiff-worker.js');
  pdfjsLib.GlobalWorkerOptions.workerSrc =
    'https://cdn.jsdelivr.net/npm/pdfjs-lib@0.0.149/build/pdf.worker.min.js';
}


function panTo(px, py) {
  const el = document.getElementsByClassName('original-text')[0];
  setTimeout(() => {
    el.scrollLeft = px - el.clientWidth / 2;
    el.scrollTop = py - el.clientHeight / 2;
  }, 0);

}

function renderHighlight(ref, canvas, context, scaleFactor) {
  const bboxes = ref['bounding_boxes'];
  const originalHeight = bboxes[0]['height'];
  const originalWidth = bboxes[0]['width'];

  const scaledWidth = canvas.width / scaleFactor;
  const scaledHeight = canvas.height / scaleFactor;

  context.fillStyle = 'rgba(48, 162, 255, 0.5)';

  bboxes.forEach((bbox) => {
    const polygon = bbox["polygon"];
    const area = {
      left: polygon[0] * (scaledWidth / originalWidth),
      top: polygon[1] * (scaledHeight / originalHeight),
      width: (polygon[4] - polygon[0]) * (scaledWidth / originalWidth),
      height: (polygon[5] - polygon[1]) * (scaledHeight / originalHeight)
    };

    context.fillRect(area.left, area.top, area.width, area.height);

  });
}

function renderFactTiff(upload, ref, imageScale) {
  worker.onmessage = function (event) {
    const data = event.data;
    const canvas = document.getElementById('the-canvas');
    const context = canvas.getContext('2d');

    // Scale the TIFF image dimensions
    const scaledWidth = data.width * imageScale;
    const scaledHeight = data.height * imageScale;

    canvas.width = scaledWidth;
    canvas.height = scaledHeight;

    // Create and scale the image data
    const imageData = context.createImageData(data.width, data.height);
    imageData.data.set(new Uint8Array(data.image));

    // Draw the scaled image onto the canvas
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = data.width;
    tempCanvas.height = data.height;

    const tempContext = tempCanvas.getContext('2d');
    tempContext.putImageData(imageData, 0, 0);

    context.setTransform(imageScale, 0, 0, imageScale, 0, 0);
    context.drawImage(tempCanvas, 0, 0);

    // Render highlights if `ref` exists
    if (ref) {
      renderHighlight(ref, canvas, context, imageScale);
    }

    canvas.style.display = 'inline';
    document.getElementById('value2').style.display = 'none';
  };

  worker.postMessage({ url: upload, memory: 16777216 });
}

function renderFactImage(upload, ref, imageScale) {
  var canvas = document.getElementById('the-canvas');
  var context = canvas.getContext('2d');
  var img = new Image();
  img.onload = function () {
    canvas.width = this.naturalWidth * imageScale;
    canvas.height = this.naturalHeight * imageScale;
    context.drawImage(this, 0, 0, this.width, this.height);

    if (ref) renderHighlight(ref, canvas, context, imageScale);

    canvas.style.display = 'inline';
    document.getElementById('value2').style.display = 'none';
  };

  img.src = upload;
}

function renderFactText(upload, ref, textScale) {
  const el = document.getElementById('value2');
  el.style.fontSize = `${textScale}rem`;

  if (ref) {
    const start = ref['offsets'][0];
    const end = ref['offsets'][1];
    const before = upload.substring(0, start);
    const highlighted = upload.substring(start, end);
    const after = upload.substring(end);
    el.innerHTML =
      before +
      '<mark style="background: rgba(48, 162, 255, 0.5)">' +
      highlighted +
      '</mark>' +
      after;
  } else {
    el.innerHTML = upload;
  }

  document.getElementById('the-canvas').style.display = 'none';
  el.style.display = 'inline';
}

function renderFactPDF(upload, ref, pdfScale) {
  const current_page = ref ? ref['bounding_boxes'][0]['page_number'] : 1;

  var loadingTask = pdfjsLib.getDocument({ data: upload });
  loadingTask.promise.then(
    function (pdf) {
      pdf.getPage(current_page).then(function (page) {
        // Use the provided scale directly without recalculating
        const viewport = page.getViewport({ scale: pdfScale });

        // Prepare canvas using scaled dimensions
        const canvas = document.getElementById('the-canvas');
        canvas.style.transformOrigin = 'top center';
        const context = canvas.getContext('2d');
        canvas.height = viewport.height;
        canvas.width = viewport.width;

        // Render the PDF page into the canvas
        const renderContext = {
          canvasContext: context,
          viewport: viewport,
        };

        const renderTask = page.render(renderContext);

        if (ref) {
          const bboxes = ref['bounding_boxes'];
          const height = bboxes[0]['height'];
          const width = bboxes[0]['width'];
          renderTask.promise.then(function () {
            // Highlights (if needed)
            let x = Number.POSITIVE_INFINITY;
            let y = Number.POSITIVE_INFINITY;

            const xs = canvas.width / width;
            const ys = canvas.height / height;


            context.fillStyle = 'rgba(48, 162, 255, 0.5)';

            bboxes
              .filter(bbox => bbox['page_number'] == current_page)
              .map(bbox => bbox['polygon'])
              .map(p => {
                x = Math.min(p[0] * xs, x);
                y = Math.min(p[1] * ys, y);
                return {
                  pageIndex: page,
                  top: p[1] * ys,
                  left: p[0] * xs,
                  height: (p[5] - p[1]) * ys,
                  width: (p[4] - p[0]) * xs,
                };
              })
              .forEach(area => {
                context.fillRect(area.left, area.top, area.width, area.height);
              });

            panTo(x, y);

            canvas.style.display = 'inline';
            document.getElementById('value2').style.display = 'none';
          });
        }
      });
    },
    function (reason) {
      console.error(reason);
    }
  );
}

function handleFactRender(doc, ref, scale = 1) {
  // Cycle through refs on subsequent click
  // let idx = factRefIndex[fact_id] ?? -1;

  // console.log('idx', factRefIndex);
  // idx = idx + 1;
  // if (idx == refs[fact_id].length) {
  //   idx = 0;
  // }

  // console.log('idxafter', idx);
  // setFactRefIndex(prev => ({
  //   ...prev,
  //   [fact_id]: idx,
  // }));

  const base64 = doc.data;
  const mime = doc.content_type;

  // console.log({ idx }, 'refsss', ref);
  setTimeout(() => {
    switch (mime) {
      case 'application/pdf':
        renderFactPDF(atob(base64), ref, scale);
        break;
      case 'text/plain':
        renderFactText(atob(base64), ref, scale);
        break;
      case 'image/tiff': // tiff image not universally supported by major browsers
        renderFactTiff(`data:${mime};base64,${base64}`, ref, scale);
        break;
      default: // any other image type supported by major browsers
        renderFactImage(`data:${mime};base64,${base64}`, ref, scale);
    }
  }, 0);
}

export default handleFactRender;
