// ### Main

const main = () => {
  fetch("emojis.json")
    .then(r => r.json())
    .then(emojis => {
      makeZipLink();
      makeEmojis(emojis);
    })
    .catch(e => {
      console.error("ERROR!", e);
    });
};

// ### Create Emojis

const makeEmojis = emojis => {
  let container = _elt("div");

  emojis.forEach(([code, name]) => {
    let row = _elt("p", { className: "row" });

    let nameElt = _elt("span", { className: "name", innerText: `${name}:` });
    row.appendChild(nameElt);

    let text = _asText(code);
    console.log(text); //REM

    // ["small", "medium", "large"]
    ["small"].forEach(size => {
      let span = _elt("span", {
        className: `emoji ${size}`,
        innerHTML: text,
        title: code
      });
      span.dataset.size = size;
      span.dataset.name = name;
      span.dataset.code = code;
      row.appendChild(span);
    });

    container.appendChild(row);
  });

  document.body.appendChild(container);
};

// ### Create Download link

const makeZipLink = () => {
  let clicked = false;

  let form = document.getElementById("form");

  const _disable = () => {
    clicked = true;
    form.querySelectorAll("input, button").forEach(elt => {
      elt.disabled = true;
    });
  };

  const _enable = () => {
    clicked = false;
    form.querySelectorAll("input, button").forEach(elt => {
      elt.disabled = false;
    });
  };

  form.addEventListener(
    "submit",
    e => {
      e.preventDefault();
      if (clicked) {
        return;
      }
      _disable();

      let size = document.getElementById("font-size").value;
      let result = document.getElementById("result");

      _makeZip(_emojisAsBlobIterator(size))
        .then(url => {
          let name = `emojis_${size}.zip`;
          let link = _elt("a", {
            className: "save-as",
            href: url,
            innerText: name,
            download: name
          });
          result.appendChild(link);
          _enable();
        })
        .catch(e => {
          console.error("!!ERROR!!", e);
          let elt = _elt("p", {
            innerText: `ERROR: ${e.message}`
          });
          result.appendChild(elt);
          _enable();
        });
    },
    false
  );
};

const _makeZip = async blobPromIterator => {
  var zip = new JSZip();
  let progress = document.getElementById("progress");

  let counter = 0;
  while (blobPromIterator.hasNext()) {
    counter++;
    let progressText = `(completed ${counter} of ${blobPromIterator.size()})`;
    progress.innerText = progressText;
    let { blob, name } = await blobPromIterator.next();
    zip.file(name, blob);
  }

  let content = await zip.generateAsync({ type: "blob" });
  let url = URL.createObjectURL(content);
  return url;
};

const _emojisAsBlobIterator = size => {
  let width = size;
  let height = size;

  let canvas = _elt("canvas", { width, height });
  let ctx = canvas.getContext("2d");

  let emojis = document.querySelectorAll(".emoji.small");
  Array.prototype.slice.call(emojis).map(emoji => {
    let { name, code, size } = emoji.dataset;
  });

  return _promIterator(emojis, emoji => {
    let name = `${emoji.dataset.name.split(" ").join("_")}_${size}.png`;

    ctx.font = `${height}px none`;
    ctx.clearRect(0, 0, width, height);
    // HACK - position emoji within space
    ctx.fillText(emoji.innerText, 0, height * 0.925);

    return _canvasToBlob(canvas, "image/png", 1)
      .then(blob => {
        let img = _elt("img", {
          src: URL.createObjectURL(blob),
          css: { outline: "2px solid #000" }
        });
        emoji.parentNode.insertBefore(img, emoji.nextSibling);
        return blob;
      })
      .then(blob => ({ blob, name }));
  });
};

// ### Helpers

const _asText = code => {
  let nums = code.split("_").map(_hexStringToNumber);
  console.log("nums", nums); //REM
  return String.fromCodePoint.apply(String, nums);
};

const _hexStringToNumber = str => parseInt(str, 16);

const _elt = (tagName, attrs, evts) => {
  let elt = document.createElement(tagName);
  if (attrs) {
    if (attrs.css) {
      Object.assign(elt.style, attrs.css);
      delete attrs.css;
    }
    Object.assign(elt, attrs);
  }

  if (evts) {
    Object.entries(evts).forEach(([name, fn]) => {
      elt.addEventListener(name, fn, false);
    });
  }
  return elt;
};

const _promIterator = (objs, promFn) => {
  let i = 0;
  let len = objs.length;
  return {
    next: () => promFn(objs[i++]),
    hasNext: () => i < len,
    size: () => len
  };
};

const _canvasToBlob = (canvas, mimeType, quality) =>
  new Promise((resolve, reject) => {
    canvas.toBlob(blob => resolve(blob), mimeType, quality);
  });

const _loadImage = src =>
  new Promise((resolve, reject) => {
    let img = new Image();
    img.onload = () => resolve(img);
    img.onerror = e => {
      e.name = "LoadImageError";
      reject(e);
    };
    img.src = src;
  });

// ### Run it

main();
