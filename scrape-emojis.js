// # Scrape Emojis
//
// Script used to generate content of `emojis.json`
//
// Run this in the JS console on https://unicode.org/emoji/charts/full-emoji-list.html
//

var _array = elts => Array.prototype.slice.call(elts);

var table = document.getElementsByTagName("table")[0];
var trs = _array(table.getElementsByTagName("tr"));

var emojis = trs
  .map(tr => {
    let tds = tr.getElementsByTagName("td");
    // only select emojis that are on Apple
    if (tds.length === 15 && !tds[3].classList.contains("miss")) {
      return _array(tds);
    }
    return undefined;
  })
  .filter(tds => tds)
  .map(tds => {
    let code = tds[1].getElementsByTagName("a")[0].getAttribute("name");
    let name = tds[14].innerText.trim();
    return [code, name];
  });

console.log(JSON.stringify(emojis));
