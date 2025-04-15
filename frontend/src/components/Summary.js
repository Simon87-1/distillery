import React, { useState, useEffect, useRef } from 'react';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import './Summary.css';
import '@react-pdf-viewer/core/lib/styles/index.css';
import SummarySection from './SummarySection';
import SourceSection from './SourceSection';
import renderFactPDF from '../helpers/renderFact';


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

function base64toBlob(bytes) {
  let length = bytes.length;
  let out = new Uint8Array(length);

  while (length--) {
    out[length] = bytes.charCodeAt(length);
  }

  return new Blob([out], { type: 'application/pdf' });
}

const Summary = ({ message, docs }) => {
  const [pdfUrl, setPdfUrl] = useState(null);
  const [areas, setAreas] = useState([]);
  const [factRefIndex, setFactRefIndex] = useState({});
  const [facts, setFacts] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);

  const canvasRef = useRef(null);
  const value2Ref = useRef(null);

  useEffect(() => {
    if (message) {
      handleRender(message);
    }
  }, [message]);

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

  // function renderFactPDF(upload, ref) {
  //   const bboxes = ref['bounding_boxes'];
  //   const current_page = bboxes[0]['page_number'];
  //   const height = bboxes[0]['height'];
  //   const width = bboxes[0]['width'];

  //   var loadingTask = pdfjsLib.getDocument({ data: upload });
  //   loadingTask.promise.then(
  //     function (pdf) {
  //       // Fetch the page for the first evidence on the fact
  //       pdf.getPage(current_page).then(function (page) {
  //         var scale = 1.25;
  //         var viewport = page.getViewport({ scale: scale });

  //         // Prepare canvas using PDF page dimensions
  //         var canvas = document.getElementById('the-canvas');
  //         var context = canvas.getContext('2d');
  //         canvas.height = viewport.height;
  //         canvas.width = viewport.width;

  //         // Render PDF page into canvas context
  //         var renderContext = {
  //           canvasContext: context,
  //           viewport: viewport,
  //         };
  //         var renderTask = page.render(renderContext);
  //         renderTask.promise.then(function () {
  //           ///////////////////////////////////////////////////////////////
  //           // Highlights
  //           let x = Number.POSITIVE_INFINITY;
  //           let y = Number.POSITIVE_INFINITY;

  //           const xs = canvas.width / width;
  //           const ys = canvas.height / height;

  //           context.fillStyle = 'rgba(48, 162, 255, 0.5)';

  //           // Filter polygons for the evidence on the current page and hilight
  //           bboxes
  //             .filter(bbox => bbox['page_number'] == current_page)
  //             .map(bbox => bbox['polygon'])
  //             .map(p => {
  //               x = Math.min(p[0] * xs, x);
  //               y = Math.min(p[1] * ys, y);
  //               return {
  //                 pageIndex: page,
  //                 top: p[1] * ys,
  //                 left: p[0] * xs,
  //                 height: (p[5] - p[1]) * ys,
  //                 width: (p[4] - p[0]) * xs,
  //               };
  //             })
  //             .forEach(area => {
  //               context.fillRect(area.left, area.top, area.width, area.height);
  //             });

  //           panTo(x, y);
  //           ///////////////////////////////////////////////////////////////

  //           document.getElementById('the-canvas').style.display = 'inline';
  //           document.getElementById('value2').style.display = 'none';
  //         });
  //       });
  //     },
  //     function (reason) {
  //       // PDF loading error
  //       console.error(reason);
  //     }
  //   );
  // }

  const handleRender = message => {
    setFacts(message.sections);

    var refs = {};
    message.sections.forEach(item => {
      item.facts.forEach(fact => {
        refs[fact.fact_id] = fact.references;
      });
    });

    const facts = document.querySelectorAll('.fact');
    console.log({ refs });

    // facts.forEach(fact => {
    //   fact.addEventListener('click', () => {
    //     const fact_id = fact.getAttribute('id');

    //     // Cycle through refs on subsequent click
    //     let idx = factRefIndex[fact_id] ?? -1;

    //     console.log('idx', factRefIndex);
    //     idx = idx + 1;
    //     if (idx == refs[fact_id].length) {
    //       idx = 0;
    //     }

    //     console.log('idxafter', idx);
    //     setFactRefIndex(prev => ({
    //       ...prev,
    //       [fact_id]: idx,
    //     }));

    //     const ref = refs[fact_id][idx];
    //     const base64 = docs[ref['document_id']]['data'];
    //     const mime = docs[ref['document_id']]['content_type'];

    //     // console.log({ idx }, 'refsss', ref);

    //     document.getElementById('source').innerText =
    //       `${docs[ref['document_id']]['category']} (${docs[ref['document_id']]['date']})`;
    //     // console.log('source', document.getElementById('source'));

    //     switch (mime) {
    //       case 'application/pdf':
    //         renderFactPDF(atob(base64), ref);
    //         break;
    //       case 'text/plain':
    //         renderFactText(atob(base64), ref);
    //         break;
    //       case 'image/tiff': // tiff image not universally supported by major browsers
    //         renderFactTiff(`data:${mime};base64,${base64}`, ref);
    //         break;
    //       default: // any other image type supported by major browsers
    //         renderFactImage(`data:${mime};base64,${base64}`, ref);
    //     }
    //   });
    // });
  };

  const handleDeleteFact = (id, header) => {
    console.log('delete fact', id, header);

    const updatedFacts = facts.map(section => {
      if (section.header === header) {
        section.facts = section.facts.filter(fact => fact.fact_id !== id);
      }
      return section;
    });

    setFacts(updatedFacts);
  };

  const handleItemClick = item => {
    console.log('handleItemClick', item);

    if (selectedItem === item) {
      setSelectedItem(null);
    } else {
      setSelectedItem(item);
    }
  };

  return (
    <div className="h-full">
      <Grid container spacing={2} sx={{ mb: 2 }} className="h-full">
        <Grid item xs={4}>
          <Box sx={{ cursor: 'pointer' }} className="h-full">
            <SummarySection
              sections={facts}
              selectedItem={selectedItem}
              onDeleteFact={handleDeleteFact}
              onItemClick={handleItemClick}
            />
          </Box>
        </Grid>
        <Grid item xs={8}>
          <Box className="flex h-full flex-col">
            <SourceSection documents={docs} selectedItem={selectedItem} />
          </Box>
        </Grid>
      </Grid>
    </div>
  );
};

export default Summary;
