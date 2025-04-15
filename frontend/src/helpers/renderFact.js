const worker = new Worker('http://localhost:8000/tiff-worker.js');
pdfjsLib.GlobalWorkerOptions.workerSrc =
  'https://cdn.jsdelivr.net/npm/pdfjs-lib@0.0.149/build/pdf.worker.min.js';

function panTo(px, py) {
  const el = document.getElementsByClassName('original-text')[0];

  el.scrollLeft = px - el.clientWidth / 2;
  el.scrollTop = py - el.clientHeight / 2;
}

function renderHighlight(ref, canvas, context) {
  const bboxes = ref['bounding_boxes'];
  const height = bboxes[0]['height'];
  const width = bboxes[0]['width'];

  const xs = canvas.width / width;
  const ys = canvas.height / height;

  context.fillStyle = 'rgba(48, 162, 255, 0.5)';

  bboxes
    .map(bbox => bbox['polygon'])
    .map(p => {
      return {
        top: p[1] * ys,
        left: p[0] * xs,
        height: (p[5] - p[1]) * ys,
        width: (p[4] - p[0]) * xs,
      };
    })
    .forEach(area => {
      context.fillRect(area.left, area.top, area.width, area.height);
    });
}

function renderFactTiff(upload, ref) {
  worker.onmessage = function (event) {
    var data = event.data;
    var canvas = document.getElementById('the-canvas');
    var context = canvas.getContext('2d');
    canvas.width = data.width;
    canvas.height = data.height;
    var imageData = context.createImageData(data.width, data.height);
    imageData.data.set(new Uint8Array(data.image));
    context.putImageData(imageData, 0, 0);

    renderHighlight(ref, canvas, context);

    canvas.style.display = 'inline';
    document.getElementById('value2').style.display = 'none';
  };
  worker.postMessage({ url: upload, memory: 16777216 });
}

function renderFactImage(upload, ref) {
  var canvas = document.getElementById('the-canvas');
  var context = canvas.getContext('2d');
  var img = new Image();
  img.onload = function () {
    canvas.width = this.naturalWidth;
    canvas.height = this.naturalHeight;
    context.drawImage(this, 0, 0, this.width, this.height);

    renderHighlight(ref, canvas, context);

    canvas.style.display = 'inline';
    document.getElementById('value2').style.display = 'none';
  };

  img.src = upload;
}

function renderFactText(upload, ref) {
  const el = document.getElementById('value2');

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

  document.getElementById('the-canvas').style.display = 'none';
  el.style.display = 'inline';
}

function renderFactPDF(upload, ref) {
  const bboxes = ref['bounding_boxes'];
  const current_page = bboxes[0]['page_number'];
  const height = bboxes[0]['height'];
  const width = bboxes[0]['width'];

  var loadingTask = pdfjsLib.getDocument({ data: upload });
  loadingTask.promise.then(
    function (pdf) {
      // Fetch the page for the first evidence on the fact
      pdf.getPage(current_page).then(function (page) {
        var scale = 1.25;
        var viewport = page.getViewport({ scale: scale });

        // Prepare canvas using PDF page dimensions
        var canvas = document.getElementById('the-canvas');
        var context = canvas.getContext('2d');
        canvas.height = viewport.height;
        canvas.width = viewport.width;

        // Render PDF page into canvas context
        var renderContext = {
          canvasContext: context,
          viewport: viewport,
        };
        var renderTask = page.render(renderContext);
        renderTask.promise.then(function () {
          ///////////////////////////////////////////////////////////////
          // Highlights
          let x = Number.POSITIVE_INFINITY;
          let y = Number.POSITIVE_INFINITY;

          const xs = canvas.width / width;
          const ys = canvas.height / height;

          context.fillStyle = 'rgba(48, 162, 255, 0.5)';

          // Filter polygons for the evidence on the current page and hilight
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
          ///////////////////////////////////////////////////////////////

          document.getElementById('the-canvas').style.display = 'inline';
          document.getElementById('value2').style.display = 'none';
        });
      });
    },
    function (reason) {
      // PDF loading error
      console.error(reason);
    }
  );
}

function handleFactRender(doc, refs) {
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

  const ref = refs.find(ref => ref.document_id === doc.id);
  const base64 = doc.data;
  const mime = doc.content_type;

  console.log({ ref, base64, mime });

  // console.log({ idx }, 'refsss', ref);
  setTimeout(() => {
    switch (mime) {
      case 'application/pdf':
        renderFactPDF(atob(base64), ref);
        break;
      case 'text/plain':
        renderFactText(atob(base64), ref);
        break;
      case 'image/tiff': // tiff image not universally supported by major browsers
        renderFactTiff(`data:${mime};base64,${base64}`, ref);
        break;
      default: // any other image type supported by major browsers
        renderFactImage(`data:${mime};base64,${base64}`, ref);
    }
  }, 0);
}

export default handleFactRender;
